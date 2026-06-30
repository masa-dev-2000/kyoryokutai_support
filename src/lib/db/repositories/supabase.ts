// Supabase(Postgres)リポジトリ実装。
// サービスロールキーを使い RLS をバイパスする(サーバーサイド専用)。
// DB_PROVIDER=supabase で repositories/index.ts から選択される。

import { createClient } from "@supabase/supabase-js";
import {
  mapLog,
  mapDailyLog,
  mapReport,
  mapExpense,
  mapCase,
  mapApproval,
  mapNotice,
  mapMember,
  mapStaff,
} from "@/lib/api/mappers";
import type {
  Repos,
  RouteDTO,
  HostOrgDTO,
  LogForAI,
  ApprovalRaw,
  GuidelineRow,
  RouteStepDTO,
  DailyLogDTO,
  SuperMuniDetail,
  SuperUserRow,
  ContractDTO,
  ContractPatch,
  SuperAnalytics,
} from "./types";

const MUNI = "10000000-0000-4000-8000-000000000001";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Supabase の occurred_at(timestamptz)→ log_date / log_time に変換してマッパーに渡す
function toLogRow(r: Record<string, unknown>): Record<string, unknown> {
  const oa = r.occurred_at as string | null;
  return {
    ...r,
    log_date: oa ? oa.slice(0, 10) : r.log_date,
    log_time: oa ? oa.slice(11, 16) : r.log_time ?? "",
  };
}

// 当月 / N ヶ月前の 'YYYY-MM' を返す(ローカル時刻基準)
function ymOffset(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// settings(jsonb)→ contract 部分を ContractDTO に合成
function buildContract(row: { id: string; name: string; annual_budget: number; settings?: Record<string, unknown> | null }): ContractDTO {
  const settings = (row.settings ?? {}) as { contract?: Record<string, unknown> };
  const c = settings.contract ?? {};
  return {
    municipalityId: row.id,
    name: row.name,
    plan: (c.plan as ContractDTO["plan"]) ?? "year1",
    contractStatus: (c.contractStatus as ContractDTO["contractStatus"]) ?? "trial",
    annualBudget: row.annual_budget,
    contractStart: (c.start as string) ?? undefined,
    contractEnd: (c.end as string) ?? undefined,
  };
}

// occurred_at を生成(date + time → ISO 文字列)
function toOccurredAt(date?: string, time?: string): string {
  const d = date ?? new Date().toISOString().slice(0, 10);
  const t = time ?? new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  return `${d}T${t}:00+09:00`;
}

export const supabaseRepos: Repos = {
  users: {
    async count() {
      const { count } = await supabase().from("users").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    async nameOf(id) {
      const { data } = await supabase().from("users").select("name").eq("id", id).single();
      return data?.name;
    },
    async getProfile(id) {
      const { data } = await supabase()
        .from("users")
        .select("name, municipality_id, bio, started_at")
        .eq("id", id)
        .single();
      if (!data) return null;
      return { name: data.name, municipality: data.municipality_id ?? "", bio: data.bio ?? undefined, assigned_at: data.started_at ?? undefined };
    },
  },

  super: {
    async overview() {
      const db = supabase();
      const [{ data: munis }, { data: users }, { data: logs }] = await Promise.all([
        db.from("municipalities").select("id, name, prefecture").order("prefecture").order("name"),
        db.from("users").select("municipality_id, role"),
        db.from("activity_logs").select("municipality_id"),
      ]);

      const userRows = (users ?? []) as { municipality_id: string | null; role: string }[];
      const logRows = (logs ?? []) as { municipality_id: string | null }[];

      const countBy = (muniId: string, role: string) =>
        userRows.filter((u) => u.municipality_id === muniId && u.role === role).length;
      const logCount = (muniId: string) =>
        logRows.filter((l) => l.municipality_id === muniId).length;

      const municipalities = ((munis ?? []) as { id: string; name: string; prefecture: string }[]).map((m) => ({
        id: m.id, name: m.name, prefecture: m.prefecture,
        members: countBy(m.id, "member"), managers: countBy(m.id, "manager"),
        admins: countBy(m.id, "admin"), activityLogs: logCount(m.id),
      }));

      const totalRole = (role: string) => userRows.filter((u) => u.role === role).length;
      return {
        municipalities,
        totals: {
          municipalities: municipalities.length,
          members: totalRole("member"), managers: totalRole("manager"),
          admins: totalRole("admin"), supers: totalRole("super"),
        },
      };
    },

    async municipalityDetail(municipalityId): Promise<SuperMuniDetail | null> {
      const db = supabase();
      const { data: m } = await db
        .from("municipalities")
        .select("id, name, prefecture, annual_budget")
        .eq("id", municipalityId)
        .maybeSingle();
      if (!m) return null;

      const [{ data: memberRows }, { data: staffRows }, { data: logRows }, { data: pendingRows }] = await Promise.all([
        db.from("users").select("id, name, role_label, term, started_at, status").eq("municipality_id", municipalityId).eq("role", "member").order("started_at"),
        db.from("users").select("id, name, title, department, role, email").eq("municipality_id", municipalityId).in("role", ["manager", "admin"]).order("created_at"),
        db.from("activity_logs").select("occurred_at").eq("municipality_id", municipalityId).order("occurred_at", { ascending: false }),
        db.from("approvals").select("*").eq("municipality_id", municipalityId).eq("status", "pending").order("created_at"),
      ]);

      const members = (memberRows ?? []).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        role: (r.role_label as string) ?? "",
        term: (r.term as string) ?? "",
        startedAt: (r.started_at as string) ?? "未設定",
        status: (r.status as string) ?? "active",
      }));
      const staff = (staffRows ?? []).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        title: (r.title as string) ?? "職員",
        dept: (r.department as string) ?? "",
        role: r.role as "manager" | "admin",
        email: (r.email as string) ?? "",
      }));

      const logs = (logRows ?? []) as { occurred_at: string }[];
      const thisYm = ymOffset(0);
      const logsThisMonth = logs.filter((l) => (l.occurred_at ?? "").slice(0, 7) === thisYm).length;
      const lastActivityDate = logs.length ? logs[0].occurred_at.slice(0, 10) : null;

      const pending = pendingRows ?? [];
      const recent = pending.slice(0, 5).map((r) => mapApproval({
        ...r,
        citations: JSON.stringify(r.citations ?? []),
        detail: JSON.stringify(r.detail ?? {}),
        steps: JSON.stringify(r.steps ?? []),
      }));

      return {
        municipality: { id: m.id, name: m.name, prefecture: m.prefecture, annualBudget: m.annual_budget },
        members,
        staff,
        activity: { totalLogs: logs.length, logsThisMonth, lastActivityDate },
        pendingApprovals: { total: pending.length, recent },
      };
    },

    async listUsers(opts): Promise<SuperUserRow[]> {
      const db = supabase();
      let query = db.from("users").select("id, name, email, role, status, organization_type, municipality_id, created_at").order("created_at");
      if (opts?.municipalityId) query = query.eq("municipality_id", opts.municipalityId);
      if (opts?.role) query = query.eq("role", opts.role);
      if (opts?.status) query = query.eq("status", opts.status);
      const [{ data: users }, { data: munis }, { data: logs }] = await Promise.all([
        query,
        db.from("municipalities").select("id, name"),
        db.from("activity_logs").select("user_id"),
      ]);
      const muniName = new Map<string, string>();
      for (const m of (munis ?? []) as { id: string; name: string }[]) muniName.set(m.id, m.name);
      const logCount = new Map<string, number>();
      for (const l of (logs ?? []) as { user_id: string }[]) logCount.set(l.user_id, (logCount.get(l.user_id) ?? 0) + 1);

      return ((users ?? []) as Record<string, unknown>[]).map((u) => {
        const mid = (u.municipality_id as string | null) ?? null;
        return {
          id: u.id as string,
          name: u.name as string,
          email: (u.email as string) ?? "",
          role: u.role as string,
          status: (u.status as string) ?? "active",
          organizationType: (u.organization_type as string) ?? "",
          municipalityId: mid,
          municipalityName: mid ? muniName.get(mid) ?? "" : "",
          activityLogs: logCount.get(u.id as string) ?? 0,
          createdAt: (u.created_at as string) ?? "",
        };
      });
    },

    async updateUser(id, patch): Promise<SuperUserRow | undefined> {
      const upd: Record<string, unknown> = {};
      if (patch.role !== undefined) upd.role = patch.role;
      if (patch.status !== undefined) upd.status = patch.status;
      if (patch.municipalityId !== undefined) upd.municipality_id = patch.municipalityId;
      if (Object.keys(upd).length) {
        await supabase().from("users").update(upd).eq("id", id);
      }
      return (await supabaseRepos.super.listUsers()).find((u) => u.id === id);
    },

    async getContract(municipalityId): Promise<ContractDTO | null> {
      const { data } = await supabase()
        .from("municipalities")
        .select("id, name, annual_budget, settings")
        .eq("id", municipalityId)
        .maybeSingle();
      if (!data) return null;
      return buildContract(data);
    },

    async updateContract(municipalityId, patch): Promise<ContractDTO | null> {
      const db = supabase();
      const { data: cur } = await db
        .from("municipalities")
        .select("id, name, annual_budget, settings")
        .eq("id", municipalityId)
        .maybeSingle();
      if (!cur) return null;
      const settings = ((cur.settings ?? {}) as { contract?: Record<string, unknown> });
      const contract = { ...(settings.contract ?? {}) };
      if (patch.plan !== undefined) contract.plan = patch.plan;
      if (patch.contractStatus !== undefined) contract.contractStatus = patch.contractStatus;
      if (patch.contractStart !== undefined) contract.start = patch.contractStart;
      if (patch.contractEnd !== undefined) contract.end = patch.contractEnd;
      const nextSettings = { ...settings, contract };
      const upd: Record<string, unknown> = { settings: nextSettings };
      if (patch.annualBudget !== undefined) upd.annual_budget = patch.annualBudget;
      const { data } = await db
        .from("municipalities")
        .update(upd)
        .eq("id", municipalityId)
        .select("id, name, annual_budget, settings")
        .single();
      return buildContract(data!);
    },

    async analytics(): Promise<SuperAnalytics> {
      const db = supabase();
      const [{ data: munis }, { data: users }, { data: logs }] = await Promise.all([
        db.from("municipalities").select("id, name, prefecture").order("prefecture").order("name"),
        db.from("users").select("municipality_id, role, status"),
        db.from("activity_logs").select("municipality_id, occurred_at"),
      ]);

      const muniRows = (munis ?? []) as { id: string; name: string; prefecture: string }[];
      const userRows = (users ?? []) as { municipality_id: string | null; role: string; status: string }[];
      const logRows = (logs ?? []) as { municipality_id: string | null; occurred_at: string }[];
      const ymOf = (l: { occurred_at: string }) => (l.occurred_at ?? "").slice(0, 7);

      const totalMembers = userRows.filter((u) => u.role === "member" && u.status === "active").length;
      const totalLogs = logRows.length;
      const thisYm = ymOffset(0);
      const prevYm = ymOffset(-1);
      const logsThisMonth = logRows.filter((l) => ymOf(l) === thisYm).length;
      const logsPrevMonth = logRows.filter((l) => ymOf(l) === prevYm).length;

      const trend = Array.from({ length: 6 }, (_, i) => {
        const ym = ymOffset(-(5 - i));
        return { ym, logs: logRows.filter((l) => ymOf(l) === ym).length };
      });

      const byMunicipality = muniRows.map((m) => {
        const members = userRows.filter((u) => u.municipality_id === m.id && u.role === "member" && u.status === "active").length;
        const muniLogs = logRows.filter((l) => l.municipality_id === m.id);
        const mThisMonth = muniLogs.filter((l) => ymOf(l) === thisYm).length;
        return {
          id: m.id,
          name: m.name,
          prefecture: m.prefecture,
          members,
          activityLogs: muniLogs.length,
          logsThisMonth: mThisMonth,
          logsPerMemberPerWeek: Math.round((mThisMonth / Math.max(members, 1) / 4.345) * 10) / 10,
        };
      });

      return {
        generatedAt: new Date().toISOString(),
        totals: {
          members: totalMembers,
          activityLogs: totalLogs,
          municipalities: muniRows.length,
          logsThisMonth,
          logsPrevMonth,
          logsPerMemberPerWeek: Math.round((logsThisMonth / Math.max(totalMembers, 1) / 4.345) * 10) / 10,
        },
        trend,
        byMunicipality,
      };
    },
  },

  members: {
    async list() {
      const { data } = await supabase()
        .from("users")
        .select("*")
        .eq("role", "member")
        .eq("status", "active")
        .order("started_at");
      return (data ?? []).map(mapMember);
    },
    async upsert(m) {
      if (m.id) {
        const { data } = await supabase()
          .from("users")
          .update({ name: m.name, role_label: m.role, started_at: m.startedAt ?? null, term: m.term ?? "1 年目" })
          .eq("id", m.id)
          .select()
          .single();
        return mapMember(data!);
      }
      const { data } = await supabase()
        .from("users")
        .insert({
          municipality_id: MUNI,
          organization_type: "member",
          role: "member",
          name: m.name,
          role_label: m.role,
          term: m.term ?? "1 年目",
          started_at: m.startedAt ?? null,
          status: "active",
        })
        .select()
        .single();
      return mapMember(data!);
    },
    async retire(id) {
      await supabase().from("users").update({ status: "retired" }).eq("id", id);
      await supabase().from("assignments").delete().eq("member_id", id);
    },
  },

  staff: {
    async list() {
      const { data } = await supabase()
        .from("users")
        .select("*")
        .eq("role", "manager")
        .eq("organization_type", "municipality")
        .order("created_at");
      return (data ?? []).map(mapStaff);
    },
    async upsert(s) {
      if (s.id) {
        const { data } = await supabase()
          .from("users")
          .update({ name: s.name, title: s.title ?? "職員", department: s.dept, email: s.email ?? null })
          .eq("id", s.id)
          .select()
          .single();
        return mapStaff(data!);
      }
      const { data } = await supabase()
        .from("users")
        .insert({
          municipality_id: MUNI,
          organization_type: "municipality",
          role: "manager",
          name: s.name,
          title: s.title ?? "職員",
          department: s.dept,
          email: s.email ?? null,
          status: "active",
        })
        .select()
        .single();
      return mapStaff(data!);
    },
    async remove(id) {
      await supabase().from("assignments").delete().eq("staff_id", id);
      await supabase().from("users").delete().eq("id", id).eq("role", "manager");
    },
  },

  assignments: {
    async map() {
      const { data: staff } = await supabase()
        .from("users")
        .select("id")
        .eq("role", "manager")
        .eq("organization_type", "municipality");
      const { data: rows } = await supabase().from("assignments").select("staff_id, member_id");
      const map: Record<string, string[]> = {};
      for (const s of staff ?? []) map[s.id] = [];
      for (const r of rows ?? []) (map[r.staff_id] ??= []).push(r.member_id);
      return map;
    },
    async replace(staffId, memberIds) {
      await supabase().from("assignments").delete().eq("staff_id", staffId);
      if (memberIds?.length) {
        await supabase().from("assignments").insert(
          memberIds.map((mid) => ({ municipality_id: MUNI, staff_id: staffId, member_id: mid }))
        );
      }
    },
  },

  hostOrgs: {
    async list() {
      const { data } = await supabase()
        .from("host_organizations")
        .select("*")
        .eq("municipality_id", MUNI)
        .order("name");
      return (data ?? []).map((r): HostOrgDTO => ({
        id: r.id,
        name: r.name,
        kind: r.kind ?? undefined,
        contactUserId: r.contact_user_id ?? undefined,
      }));
    },
    async upsert(h) {
      if (h.id) {
        const { data } = await supabase()
          .from("host_organizations")
          .update({ name: h.name, kind: h.kind ?? null, contact_user_id: h.contactUserId ?? null })
          .eq("id", h.id)
          .select()
          .single();
        return { id: data!.id, name: data!.name, kind: data!.kind ?? undefined, contactUserId: data!.contact_user_id ?? undefined };
      }
      const { data } = await supabase()
        .from("host_organizations")
        .insert({ municipality_id: MUNI, name: h.name, kind: h.kind ?? null, contact_user_id: h.contactUserId ?? null })
        .select()
        .single();
      return { id: data!.id, name: data!.name, kind: data!.kind ?? undefined, contactUserId: data!.contact_user_id ?? undefined };
    },
    async remove(id) {
      await supabase().from("host_organizations").delete().eq("id", id);
    },
  },

  routes: {
    async list() {
      const { data: routes } = await supabase()
        .from("approval_routes")
        .select("*, approval_route_steps(*)")
        .eq("municipality_id", MUNI)
        .order("kind")
        .order("is_default", { ascending: false });
      return (routes ?? []).map((r): RouteDTO => ({
        id: r.id,
        name: r.name,
        kind: r.kind,
        isDefault: !!r.is_default,
        steps: (r.approval_route_steps ?? [])
          .sort((a: { step_no: number }, b: { step_no: number }) => a.step_no - b.step_no)
          .map((s: Record<string, unknown>): RouteStepDTO => ({
            id: s.id as string,
            stepNo: s.step_no as number,
            approverType: s.approver_type as RouteStepDTO["approverType"],
            approverLabel: s.approver_label as string,
            department: (s.department as string) ?? undefined,
            hostOrganizationId: (s.host_organization_id as string) ?? undefined,
          })),
      }));
    },
    async create(r) {
      const { data: route } = await supabase()
        .from("approval_routes")
        .insert({ municipality_id: MUNI, name: r.name, kind: r.kind, is_default: r.isDefault ?? false })
        .select()
        .single();
      if (!route) return undefined;
      if (r.steps?.length) {
        await supabase().from("approval_route_steps").insert(
          r.steps.map((s) => ({
            route_id: route.id,
            step_no: s.stepNo,
            approver_type: s.approverType,
            approver_label: s.approverLabel,
            department: s.department ?? null,
            host_organization_id: s.hostOrganizationId ?? null,
          }))
        );
      }
      const list = await supabaseRepos.routes.list();
      return list.find((x) => x.id === route.id);
    },
    async remove(id) {
      await supabase().from("approval_route_steps").delete().eq("route_id", id);
      await supabase().from("approval_routes").delete().eq("id", id);
    },
  },

  topics: {
    async list(userId, kind = "topic") {
      const col = kind === "type" ? "activity_type" : "topic";
      const { data } = await supabase()
        .from("activity_logs")
        .select(col)
        .eq("user_id", userId)
        .not(col, "is", null)
        .neq(col, "");
      const names = [...new Set((data ?? []).map((r: Record<string, string>) => r[col] as string))].sort();
      return names;
    },
    async add(_userId, _name, _kind = "topic") {
      return [];
    },
    async remove(_userId, _name, _kind = "topic") {
      return [];
    },
  },

  activityLogs: {
    async listByUser(userId) {
      const { data } = await supabase()
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false });
      return (data ?? []).map((r) => mapLog(toLogRow(r)));
    },
    async create(b) {
      const occurredAt = toOccurredAt(b.date, b.time);
      const date = b.date ?? new Date().toISOString().slice(0, 10);
      // daily_log を upsert して daily_log_id を結線
      let dailyLogId = b.dailyLogId ?? null;
      if (!dailyLogId) {
        const dl = await supabaseRepos.dailyLogs.upsert(b.userId, date);
        dailyLogId = dl.id;
      }
      const { data } = await supabase()
        .from("activity_logs")
        .insert({
          user_id: b.userId,
          municipality_id: MUNI,
          daily_log_id: dailyLogId,
          activity_type: b.type,
          topic: b.topic,
          hours: b.hours,
          start_time: b.startTime ?? null,
          end_time: b.endTime ?? null,
          body: b.body,
          occurred_at: occurredAt,
        })
        .select()
        .single();
      return mapLog(toLogRow(data!));
    },
    async update(id, b) {
      const patch: Record<string, unknown> = {};
      if (b.type !== undefined) patch.activity_type = b.type;
      if (b.topic !== undefined) patch.topic = b.topic;
      if (b.hours !== undefined) patch.hours = b.hours;
      if (b.startTime !== undefined) patch.start_time = b.startTime;
      if (b.endTime !== undefined) patch.end_time = b.endTime;
      if (b.body !== undefined) patch.body = b.body;
      if (b.date !== undefined || b.time !== undefined) {
        const { data: existing } = await supabase()
          .from("activity_logs")
          .select("occurred_at")
          .eq("id", id)
          .single();
        const prevOa = (existing?.occurred_at as string) ?? new Date().toISOString();
        const prevDate = prevOa.slice(0, 10);
        const prevTime = prevOa.slice(11, 16);
        patch.occurred_at = toOccurredAt(b.date ?? prevDate, b.time ?? prevTime);
      }
      const { data } = await supabase()
        .from("activity_logs")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      return data ? mapLog(toLogRow(data)) : undefined;
    },
    async delete(id) {
      await supabase().from("activity_logs").delete().eq("id", id);
    },
    async listForAI(userId, ym): Promise<LogForAI[]> {
      const { data } = await supabase()
        .from("activity_logs")
        .select("activity_type, topic, hours, body, occurred_at")
        .eq("user_id", userId)
        .gte("occurred_at", `${ym}-01`)
        .lt("occurred_at", `${ym}-31T23:59:59`)
        .order("occurred_at");
      return (data ?? []).map((r) => ({
        activity_type: r.activity_type,
        topic: r.topic,
        hours: r.hours,
        body: r.body,
        log_date: (r.occurred_at as string).slice(0, 10),
        expense_amount: null,
      }));
    },
  },

  dailyLogs: {
    async listByUser(userId) {
      const { data } = await supabase()
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("log_date", { ascending: false });
      return (data ?? []).map((r) => mapDailyLog(r));
    },
    async upsert(userId, date, fields) {
      const { data: existing } = await supabase()
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", date)
        .maybeSingle();
      if (existing) {
        const patch: Record<string, unknown> = {};
        if (fields?.note !== undefined) patch.note = fields.note;
        if (fields?.distanceKm !== undefined) patch.distance_km = fields.distanceKm;
        if (fields?.expenseAmount !== undefined) patch.expense_amount = fields.expenseAmount;
        if (fields?.feelingScore !== undefined) patch.feeling_score = fields.feelingScore;
        if (Object.keys(patch).length > 0) {
          const { data } = await supabase().from("daily_logs").update(patch).eq("id", existing.id).select().single();
          return mapDailyLog(data!);
        }
        return mapDailyLog(existing);
      }
      const { data } = await supabase()
        .from("daily_logs")
        .insert({
          user_id: userId,
          municipality_id: MUNI,
          log_date: date,
          note: fields?.note ?? null,
          distance_km: fields?.distanceKm ?? null,
          expense_amount: fields?.expenseAmount ?? null,
          feeling_score: fields?.feelingScore ?? null,
        })
        .select()
        .single();
      return mapDailyLog(data!);
    },
    async getByDate(userId, date): Promise<DailyLogDTO | undefined> {
      const { data } = await supabase()
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", date)
        .maybeSingle();
      return data ? mapDailyLog(data) : undefined;
    },
  },

  expenses: {
    async listByUser(userId) {
      const { data } = await supabase()
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => mapExpense({ ...r, citations: JSON.stringify(r.citations ?? []) }));
    },
    async create(b) {
      const { data } = await supabase()
        .from("expenses")
        .insert({
          user_id: b.userId,
          municipality_id: MUNI,
          expense_kind: "single",
          category: b.category ?? "活動費",
          daily_log_id: b.dailyLogId ?? null,
          title: b.title,
          amount_requested: b.amount,
          purpose: b.purpose,
          status: b.status ?? "申請中",
          ai_note: "AI 判定材料は申請後に表示されます。",
          citations: [],
          has_receipt: !!b.receiptKey,
          receipt_key: b.receiptKey ?? null,
        })
        .select()
        .single();
      return mapExpense({ ...data!, citations: JSON.stringify(data!.citations ?? []) });
    },
    async createFromLog(b) {
      const { data } = await supabase()
        .from("expenses")
        .insert({
          user_id: b.userId,
          municipality_id: MUNI,
          expense_kind: "single",
          source_activity_log_id: b.activityLogId,
          source_receipt_index: b.receiptIndex,
          title: b.title,
          amount_requested: b.amount,
          purpose: b.purpose,
          status: b.status ?? "申請中",
          ai_note: "日報経由の経費(ADR-014)。AI 判定材料は申請後に表示されます。",
          citations: [],
          has_receipt: b.hasReceipt || !!b.receiptKey,
          receipt_key: b.receiptKey ?? null,
        })
        .select()
        .single();
      return mapExpense({ ...data!, citations: JSON.stringify(data!.citations ?? []) });
    },
    async update(id, b) {
      const patch: Record<string, unknown> = {};
      if (b.status !== undefined) patch.status = b.status;
      if (b.amountSettled !== undefined) patch.amount_settled = b.amountSettled;
      if (b.hasReceipt !== undefined) patch.has_receipt = b.hasReceipt;
      if (b.receiptKey !== undefined) patch.receipt_key = b.receiptKey;
      if (b.settleNote !== undefined) patch.settle_note = b.settleNote;
      const { data } = await supabase()
        .from("expenses")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      return data ? mapExpense({ ...data, citations: JSON.stringify(data.citations ?? []) }) : undefined;
    },
  },

  monthlyReports: {
    async listByUser(userId) {
      const { data } = await supabase()
        .from("monthly_reports")
        .select("*")
        .eq("user_id", userId)
        .order("year_month", { ascending: false });
      return (data ?? []).map(mapReport);
    },
    async submit(b) {
      const { data: existing } = await supabase()
        .from("monthly_reports")
        .select("id")
        .eq("user_id", b.userId)
        .eq("year_month", b.ym)
        .maybeSingle();
      if (existing) {
        const patch: Record<string, unknown> = { status: "submitted", status_label: "提出済", summary: b.markdown };
        if (b.plan !== undefined) patch.plan_next = b.plan;
        const { data } = await supabase().from("monthly_reports").update(patch).eq("id", existing.id).select().single();
        return mapReport(data!);
      }
      const { data } = await supabase()
        .from("monthly_reports")
        .insert({ user_id: b.userId, municipality_id: MUNI, year_month: b.ym, status: "submitted", status_label: "提出済", summary: b.markdown, plan_next: b.plan ?? null })
        .select()
        .single();
      return mapReport(data!);
    },
    async markApproved(id) {
      await supabase()
        .from("monthly_reports")
        .update({ status: "approved", status_label: "役場承認" })
        .eq("id", id);
    },
    async revertToSubmitted(userId, ym) {
      await supabase()
        .from("monthly_reports")
        .update({ status: "submitted", status_label: "提出済(再確認待ち)" })
        .eq("user_id", userId)
        .eq("year_month", ym)
        .eq("status", "approved");
    },
  },

  approvals: {
    async listPending(muni) {
      const { data } = await supabase()
        .from("approvals")
        .select("*")
        .eq("municipality_id", muni)
        .eq("status", "pending")
        .order("created_at");
      return (data ?? []).map((r) => mapApproval({
        ...r,
        citations: JSON.stringify(r.citations ?? []),
        detail: JSON.stringify(r.detail ?? {}),
        steps: JSON.stringify(r.steps ?? []),
      }));
    },
    async getRaw(id): Promise<ApprovalRaw | undefined> {
      const { data } = await supabase()
        .from("approvals")
        .select("id, kind, steps, current_step, status, target_table, target_id")
        .eq("id", id)
        .single();
      if (!data) return undefined;
      return {
        id: data.id,
        kind: data.kind,
        steps: JSON.stringify(data.steps),
        current_step: data.current_step,
        status: data.status,
        target_table: data.target_table ?? null,
        target_id: data.target_id ?? null,
      };
    },
    async updateState(id, steps, currentStep, status) {
      await supabase()
        .from("approvals")
        .update({ steps, current_step: currentStep, status })
        .eq("id", id);
    },
    async getById(id) {
      const { data } = await supabase().from("approvals").select("*").eq("id", id).single();
      return data
        ? mapApproval({
            ...data,
            citations: JSON.stringify(data.citations ?? []),
            detail: JSON.stringify(data.detail ?? {}),
            steps: JSON.stringify(data.steps ?? []),
          })
        : undefined;
    },
    async enqueue(a) {
      await supabase().from("approvals").insert({
        municipality_id: a.muni,
        kind: a.kind,
        applicant_id: a.applicantId,
        member_name: a.memberName,
        title: a.title,
        ai: a.ai,
        citations: [],
        detail: a.detail,
        route_name: a.routeName,
        steps: a.steps,
        current_step: 0,
        total_steps: a.steps.length,
        status: "pending",
        target_table: a.targetTable,
        target_id: a.targetId,
      });
    },
  },

  announcements: {
    async list(muni, kinds) {
      let query = supabase()
        .from("announcements")
        .select("*")
        .eq("municipality_id", muni)
        .order("is_pinned", { ascending: false })
        .order("sent_at", { ascending: false });
      if (kinds?.length) query = query.in("kind", kinds);
      const { data } = await query;
      return (data ?? []).map((r) => mapNotice({ ...r, read_count: 0 }));
    },
    async create(b) {
      const title = (b.title || b.body.slice(0, 24) || "(無題)").trim();
      const { data } = await supabase()
        .from("announcements")
        .insert({
          municipality_id: MUNI,
          sender_id: b.senderId ?? null,
          sender_name: b.senderName ?? "職員",
          kind: b.kind ?? "info",
          is_pinned: b.isPinned ?? false,
          title,
          body: b.body,
          target_user_ids: [],
          target_count: b.targets ?? 0,
        })
        .select()
        .single();
      return mapNotice({ ...data!, read_count: 0 });
    },
    async markRead(announcementId, userId) {
      await supabase()
        .from("announcement_reads")
        .upsert({ announcement_id: announcementId, user_id: userId }, { onConflict: "announcement_id,user_id", ignoreDuplicates: true });
    },
  },

  cases: {
    async listWithTrend() {
      const { data } = await supabase()
        .from("cases_public")
        .select("*")
        .order("created_at", { ascending: false });
      const cases = (data ?? []).map((r) =>
        mapCase({ ...r, area: r.municipality_name ?? "", author: r.author_label ?? "", process: JSON.stringify(r.process ?? []) })
      );
      const trend = (data ?? [])
        .filter((r) => r.trend_count != null)
        .sort((a, b) => (b.trend_count ?? 0) - (a.trend_count ?? 0))
        .map((r) => ({ id: r.id, title: r.title, count: r.trend_count as number }));
      return { cases, trend };
    },
  },

  guidelines: {
    async listByMuni(muni): Promise<GuidelineRow[]> {
      const { data } = await supabase()
        .from("guidelines")
        .select("source, section, body")
        .eq("municipality_id", muni);
      return (data ?? []) as GuidelineRow[];
    },
  },

  consultations: {
    async log(c) {
      await supabase().from("consultations").insert({
        user_id: c.userId,
        municipality_id: MUNI,
        context_kind: c.contextKind,
        input_text: c.input,
        output_text: c.output,
      });
    },
  },
};
