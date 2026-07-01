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
  mapVision,
  mapMonthlyCycle,
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
  SuperAnalytics,
  BudgetLineDTO,
} from "./types";
import { BUDGET_CATEGORIES, DEFAULT_ALLOCATION, currentFiscalYear } from "@/lib/budget";

const MUNI = "10000000-0000-4000-8000-000000000001";

// 当月 / N ヶ月前の 'YYYY-MM' を返す(ローカル時刻基準)
function ymOffset(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// 'YYYY-MM' → JST 月初・翌月初の ISO 文字列([gte, lt) 範囲)。
// sqlite 版の log_date(JST 日付文字列)LIKE 'YYYY-MM%' と一致させるための境界。
function jstMonthRange(ym: string): { gte: string; lt: string } {
  const [y, m] = ym.split("-").map(Number);
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    gte: `${y}-${pad(m)}-01T00:00:00+09:00`,
    lt: `${ny}-${pad(nm)}-01T00:00:00+09:00`,
  };
}

// activity_logs を month 範囲(+任意の municipality)で count(行は返さない)。
async function countLogsInMonth(
  db: ReturnType<typeof supabase>,
  ym: string,
  municipalityId?: string,
): Promise<number> {
  const { gte, lt } = jstMonthRange(ym);
  let q = db
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .gte("occurred_at", gte)
    .lt("occurred_at", lt);
  if (municipalityId) q = q.eq("municipality_id", municipalityId);
  const { count } = await q;
  return count ?? 0;
}

// activity_logs の総数を count(任意の municipality 絞り込み付き)。
async function countLogsTotal(
  db: ReturnType<typeof supabase>,
  municipalityId?: string,
): Promise<number> {
  let q = db.from("activity_logs").select("*", { count: "exact", head: true });
  if (municipalityId) q = q.eq("municipality_id", municipalityId);
  const { count } = await q;
  return count ?? 0;
}

// users の件数を count(role / status / municipality 絞り込み付き)。
async function countUsers(
  db: ReturnType<typeof supabase>,
  filters: { role?: string; status?: string; municipalityId?: string },
): Promise<number> {
  let q = db.from("users").select("*", { count: "exact", head: true });
  if (filters.role) q = q.eq("role", filters.role);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.municipalityId) q = q.eq("municipality_id", filters.municipalityId);
  const { count } = await q;
  return count ?? 0;
}

// municipalities の contract_* 専用カラム → ContractDTO に合成
function buildContract(row: {
  id: string;
  name: string;
  annual_budget: number;
  contract_plan: string | null;
  contract_status: string | null;
  contract_start: string | null;
  contract_end: string | null;
}): ContractDTO {
  return {
    municipalityId: row.id,
    name: row.name,
    plan: (row.contract_plan as ContractDTO["plan"]) ?? "year1",
    contractStatus: (row.contract_status as ContractDTO["contractStatus"]) ?? "trial",
    annualBudget: row.annual_budget,
    contractStart: row.contract_start ?? undefined,
    contractEnd: row.contract_end ?? undefined,
  };
}

// 年度 "YYYY"(4 月始まり)→ [開始日, 翌年度開始日)
function fyRange(fy: string): [string, string] {
  const y = Number(fy);
  return [`${y}-04-01`, `${y + 1}-04-01`];
}

// 新規隊員に当年度の費目別予算枠(既定配分)を投入(重複は無視)。
async function seedDefaultBudgetSb(userId: string) {
  const fy = currentFiscalYear();
  await supabase()
    .from("budget_allocations")
    .upsert(
      BUDGET_CATEGORIES.map((category) => ({
        municipality_id: MUNI,
        user_id: userId,
        fiscal_year: fy,
        category,
        amount_limit: DEFAULT_ALLOCATION[category] ?? 0,
      })),
      { onConflict: "user_id,fiscal_year,category", ignoreDuplicates: true }
    );
}

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// 書込時の municipality_id は固定定数ではなく本人の所属自治体から解決する。
// (本番の users は MUNI 定数と別テナント=テスト町 に属しており、固定値だと daily_logs 等で FK 違反になる)
async function muniOf(userId: string): Promise<string> {
  const { data } = await supabase().from("users").select("municipality_id").eq("id", userId).maybeSingle();
  return (data?.municipality_id as string) ?? MUNI;
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
    async municipalityOf(id) {
      return muniOf(id);
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

    async createMunicipality(m) {
      const { data } = await supabase()
        .from("municipalities")
        .insert({ name: m.name, prefecture: m.prefecture, annual_budget: m.annualBudget ?? 2000000 })
        .select("id,name,prefecture")
        .single();
      return { id: data!.id, name: data!.name, prefecture: data!.prefecture };
    },

    async updateMunicipality(id, patch) {
      const fields: Record<string, unknown> = {};
      if (patch.name !== undefined) fields.name = patch.name;
      if (patch.prefecture !== undefined) fields.prefecture = patch.prefecture;
      if (patch.annualBudget !== undefined) fields.annual_budget = patch.annualBudget;
      const { data, error } = await supabase()
        .from("municipalities")
        .update(fields)
        .eq("id", id)
        .select("id,name,prefecture")
        .maybeSingle();
      // エラーは握りつぶさず投げる(誤った 404 を防ぎ、sqlite の挙動に揃える)
      if (error) throw error;
      return data ? { id: data.id, name: data.name, prefecture: data.prefecture } : null;
    },

    async deleteMunicipality(id): Promise<void> {
      // FK/RLS で失敗した場合に「成功扱い」にしない
      const { error } = await supabase().from("municipalities").delete().eq("id", id);
      if (error) throw error;
    },

    async createAdminInvite(a) {
      const { data: muni } = await supabase().from("municipalities").select("name").eq("id", a.municipalityId).maybeSingle();
      // admin を pre-provision(/api/auth/me が email で auth_id を紐づけられるよう先に行を作る)
      await supabase().from("users").insert({
        municipality_id: a.municipalityId,
        organization_type: "municipality",
        role: "admin",
        name: a.name,
        email: a.email,
        status: "active",
      });
      const token = Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase().from("invite_tokens").insert({
        token,
        email: a.email,
        role: "admin",
        municipality_name: muni?.name ?? "",
        created_by: a.createdBy,
        expires_at: expiresAt,
      });
      return { token, expiresAt };
    },

    async municipalityDetail(municipalityId): Promise<SuperMuniDetail | null> {
      const db = supabase();
      const { data: m } = await db
        .from("municipalities")
        .select("id, name, prefecture, annual_budget")
        .eq("id", municipalityId)
        .maybeSingle();
      if (!m) return null;

      const [
        { data: memberRows },
        { data: staffRows },
        { data: lastLogRows },
        { data: pendingRows },
        { count: pendingCount },
        totalLogs,
        logsThisMonth,
      ] = await Promise.all([
        db.from("users").select("id, name, role_label, term, started_at, status").eq("municipality_id", municipalityId).eq("role", "member").order("started_at").limit(1000),
        db.from("users").select("id, name, title, department, role, email").eq("municipality_id", municipalityId).in("role", ["manager", "admin"]).order("created_at").limit(1000),
        db.from("activity_logs").select("occurred_at").eq("municipality_id", municipalityId).order("occurred_at", { ascending: false }).limit(1),
        db.from("approvals").select("*").eq("municipality_id", municipalityId).eq("status", "pending").order("created_at").limit(5),
        db.from("approvals").select("*", { count: "exact", head: true }).eq("municipality_id", municipalityId).eq("status", "pending"),
        countLogsTotal(db, municipalityId),
        countLogsInMonth(db, ymOffset(0), municipalityId),
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

      const lastLogs = (lastLogRows ?? []) as { occurred_at: string }[];
      const lastActivityDate = lastLogs.length ? lastLogs[0].occurred_at.slice(0, 10) : null;

      const recent = (pendingRows ?? []).map((r) => mapApproval({
        ...r,
        citations: JSON.stringify(r.citations ?? []),
        detail: JSON.stringify(r.detail ?? {}),
        steps: JSON.stringify(r.steps ?? []),
      }));

      return {
        municipality: { id: m.id, name: m.name, prefecture: m.prefecture, annualBudget: m.annual_budget },
        members,
        staff,
        activity: { totalLogs, logsThisMonth, lastActivityDate },
        pendingApprovals: { total: pendingCount ?? 0, recent },
      };
    },

    async listUsers(opts): Promise<SuperUserRow[]> {
      const db = supabase();
      let query = db.from("users").select("id, name, email, role, status, organization_type, municipality_id, created_at").order("created_at").limit(1000);
      if (opts?.municipalityId) query = query.eq("municipality_id", opts.municipalityId);
      if (opts?.role) query = query.eq("role", opts.role);
      if (opts?.status) query = query.eq("status", opts.status);
      const [{ data: users }, { data: munis }] = await Promise.all([
        query,
        db.from("municipalities").select("id, name").limit(1000),
      ]);
      const muniName = new Map<string, string>();
      for (const m of (munis ?? []) as { id: string; name: string }[]) muniName.set(m.id, m.name);

      const userRows = (users ?? []) as Record<string, unknown>[];
      // 各ユーザーの活動記録数は head count で正確に取得(全件取得は 1000 行上限で頭打ちになるため)。
      const logCounts = await Promise.all(
        userRows.map(async (u) => {
          const { count } = await db
            .from("activity_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", u.id as string);
          return count ?? 0;
        }),
      );

      return userRows.map((u, i) => {
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
          activityLogs: logCounts[i],
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

    async deleteUser(id): Promise<void> {
      await supabase().from("users").delete().eq("id", id);
    },

    async getContract(municipalityId): Promise<ContractDTO | null> {
      const { data } = await supabase()
        .from("municipalities")
        .select("id, name, annual_budget, contract_plan, contract_status, contract_start, contract_end")
        .eq("id", municipalityId)
        .maybeSingle();
      if (!data) return null;
      return buildContract(data);
    },

    async updateContract(municipalityId, patch): Promise<ContractDTO | null> {
      const db = supabase();
      const { data: cur } = await db
        .from("municipalities")
        .select("id")
        .eq("id", municipalityId)
        .maybeSingle();
      if (!cur) return null;
      const upd: Record<string, unknown> = {};
      if (patch.plan !== undefined) upd.contract_plan = patch.plan;
      if (patch.contractStatus !== undefined) upd.contract_status = patch.contractStatus;
      if (patch.contractStart !== undefined) upd.contract_start = patch.contractStart;
      if (patch.contractEnd !== undefined) upd.contract_end = patch.contractEnd;
      if (patch.annualBudget !== undefined) upd.annual_budget = patch.annualBudget;
      const { data } = await db
        .from("municipalities")
        .update(upd)
        .eq("id", municipalityId)
        .select("id, name, annual_budget, contract_plan, contract_status, contract_start, contract_end")
        .single();
      return buildContract(data!);
    },

    async analytics(): Promise<SuperAnalytics> {
      const db = supabase();
      const thisYm = ymOffset(0);
      const prevYm = ymOffset(-1);

      // 一覧表示に必要な municipalities 行のみ取得。集計は全て count クエリで正確に出す。
      const [
        { data: munis },
        totalMembers,
        totalLogs,
        logsThisMonth,
        logsPrevMonth,
        trendCounts,
      ] = await Promise.all([
        db.from("municipalities").select("id, name, prefecture").order("prefecture").order("name").limit(1000),
        countUsers(db, { role: "member", status: "active" }),
        countLogsTotal(db),
        countLogsInMonth(db, thisYm),
        countLogsInMonth(db, prevYm),
        Promise.all(
          Array.from({ length: 6 }, (_, i) => ymOffset(-(5 - i))).map((ym) => countLogsInMonth(db, ym)),
        ),
      ]);

      const muniRows = (munis ?? []) as { id: string; name: string; prefecture: string }[];

      const trend = Array.from({ length: 6 }, (_, i) => ({
        ym: ymOffset(-(5 - i)),
        logs: trendCounts[i],
      }));

      const byMunicipality = await Promise.all(
        muniRows.map(async (m) => {
          const [members, activityLogs, mThisMonth] = await Promise.all([
            countUsers(db, { role: "member", status: "active", municipalityId: m.id }),
            countLogsTotal(db, m.id),
            countLogsInMonth(db, thisYm, m.id),
          ]);
          return {
            id: m.id,
            name: m.name,
            prefecture: m.prefecture,
            members,
            activityLogs,
            logsThisMonth: mThisMonth,
            logsPerMemberPerWeek: Math.round((mThisMonth / Math.max(members, 1) / 4.345) * 10) / 10,
          };
        }),
      );

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
          .update({
            name: m.name, role_label: m.role, started_at: m.startedAt ?? null, term: m.term ?? "1 年目",
            host_organization_id: m.hostOrganizationId ?? null, approval_route_id: m.approvalRouteId ?? null,
          })
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
          host_organization_id: m.hostOrganizationId ?? null,
          approval_route_id: m.approvalRouteId ?? null,
          role: "member",
          name: m.name,
          role_label: m.role,
          term: m.term ?? "1 年目",
          started_at: m.startedAt ?? null,
          status: "active",
        })
        .select()
        .single();
      // 新規隊員に当年度の費目別予算枠(既定配分)を自動生成
      if (data?.id) await seedDefaultBudgetSb(data.id);
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
    async getForUser(userId) {
      const { data: u } = await supabase()
        .from("users")
        .select("approval_route_id")
        .eq("id", userId)
        .single();
      if (!u?.approval_route_id) return null;
      const list = await supabaseRepos.routes.list();
      return list.find((r) => r.id === u.approval_route_id) ?? null;
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
    async upsert(r) {
      if (!r.id) return supabaseRepos.routes.create(r);
      await supabase()
        .from("approval_routes")
        .update({ name: r.name, kind: r.kind, is_default: r.isDefault ?? false })
        .eq("id", r.id);
      await supabase().from("approval_route_steps").delete().eq("route_id", r.id); // 全置換
      if (r.steps?.length) {
        await supabase().from("approval_route_steps").insert(
          r.steps.map((s) => ({
            route_id: r.id,
            step_no: s.stepNo,
            approver_type: s.approverType,
            approver_label: s.approverLabel,
            department: s.department ?? null,
            host_organization_id: s.hostOrganizationId ?? null,
          }))
        );
      }
      const list = await supabaseRepos.routes.list();
      return list.find((x) => x.id === r.id);
    },
    async remove(id) {
      await supabase().from("approval_route_steps").delete().eq("route_id", id);
      await supabase().from("approval_routes").delete().eq("id", id);
    },
  },

  budgets: {
    async summaryByUser(userId, fiscalYear) {
      const { data: allocs } = await supabase()
        .from("budget_allocations")
        .select("category, amount_limit")
        .eq("user_id", userId)
        .eq("fiscal_year", fiscalYear);
      const limitMap: Record<string, number> = {};
      for (const a of allocs ?? []) limitMap[a.category as string] = a.amount_limit as number;
      const [start, end] = fyRange(fiscalYear);
      const { data: exps } = await supabase()
        .from("expenses")
        .select("category, amount_requested, status, created_at")
        .eq("user_id", userId)
        .neq("status", "差戻し")
        .gte("created_at", start)
        .lt("created_at", end);
      const usedMap: Record<string, number> = {};
      for (const e of exps ?? []) {
        const cat = (e.category as string) ?? "活動費";
        usedMap[cat] = (usedMap[cat] ?? 0) + ((e.amount_requested as number) ?? 0);
      }
      return BUDGET_CATEGORIES.map((category): BudgetLineDTO => {
        const amountLimit = limitMap[category] ?? 0;
        const used = usedMap[category] ?? 0;
        return { category, amountLimit, used, remaining: amountLimit - used };
      });
    },
    async upsert(userId, fiscalYear, allocations) {
      await supabase()
        .from("budget_allocations")
        .upsert(
          allocations.map((a) => ({
            municipality_id: MUNI,
            user_id: userId,
            fiscal_year: fiscalYear,
            category: a.category,
            amount_limit: a.amountLimit,
          })),
          { onConflict: "user_id,fiscal_year,category" }
        );
      return supabaseRepos.budgets.summaryByUser(userId, fiscalYear);
    },
  },

  invites: {
    async create({ email, role, municipalityName, createdBy }) {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase().from("invite_tokens").insert({
        token,
        email,
        role,
        municipality_name: municipalityName,
        created_by: createdBy,
        expires_at: expiresAt,
      });
      return { token, expiresAt };
    },
    async findByToken(token) {
      const { data } = await supabase()
        .from("invite_tokens")
        .select("token, email, role, municipality_name, expires_at, used_at")
        .eq("token", token)
        .maybeSingle();
      if (!data) return null;
      return {
        token: data.token as string,
        email: (data.email as string | null) ?? null,
        role: data.role as string,
        municipalityName: data.municipality_name as string,
        expiresAt: data.expires_at as string,
        usedAt: (data.used_at as string | null) ?? null,
      };
    },
    async markUsed(token) {
      await supabase()
        .from("invite_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token)
        .is("used_at", null);
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
          municipality_id: await muniOf(b.userId),
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
          municipality_id: await muniOf(userId),
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
          municipality_id: await muniOf(b.userId),
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
          municipality_id: await muniOf(b.userId),
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
        .insert({ user_id: b.userId, municipality_id: await muniOf(b.userId), year_month: b.ym, status: "submitted", status_label: "提出済", summary: b.markdown, plan_next: b.plan ?? null })
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
    async markRejected(id) {
      // status は 'draft' に戻す(隊員が修正・再提出できる編集可能状態)。差戻しの意味は status_label が担う。
      // 'rejected' のような未知 status だと隊員画面が一律「承認済」と表示してしまうため(逆の意味)。
      await supabase()
        .from("monthly_reports")
        .update({ status: "draft", status_label: "差戻し（要修正）" })
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
        .select("id, municipality_id, kind, steps, current_step, status, target_table, target_id")
        .eq("id", id)
        .single();
      if (!data) return undefined;
      return {
        id: data.id,
        municipality_id: data.municipality_id,
        kind: data.kind,
        steps: JSON.stringify(data.steps),
        current_step: data.current_step,
        status: data.status,
        target_table: data.target_table ?? null,
        target_id: data.target_id ?? null,
      };
    },
    async updateState(id, steps, currentStep, status, decision) {
      await supabase()
        .from("approvals")
        .update({
          steps,
          current_step: currentStep,
          status,
          ...(decision
            ? { approver_id: decision.decidedBy, approved_at: new Date().toISOString(), comment: decision.comment ?? null }
            : {}),
        })
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
        municipality_id: await muniOf(c.userId),
        context_kind: c.contextKind,
        input_text: c.input,
        output_text: c.output,
      });
    },
  },

  visions: {
    async get(userId) {
      const { data } = await supabase().from("visions").select("*").eq("user_id", userId).maybeSingle();
      return data ? mapVision(data) : null;
    },
    async upsert(userId, body) {
      const { data } = await supabase()
        .from("visions")
        .upsert({ user_id: userId, body, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      return mapVision(data!);
    },
  },

  monthlyCycles: {
    async getByMonth(userId, ym) {
      const { data } = await supabase()
        .from("monthly_cycles")
        .select("*")
        .eq("user_id", userId)
        .eq("year_month", ym)
        .maybeSingle();
      return data ? mapMonthlyCycle(toCycleRow(data)) : null;
    },
    async listByUser(userId) {
      const { data } = await supabase()
        .from("monthly_cycles")
        .select("*")
        .eq("user_id", userId)
        .order("year_month", { ascending: false });
      return (data ?? []).map((r) => mapMonthlyCycle(toCycleRow(r)));
    },
    async upsert(userId, ym, fields) {
      const { data: existing } = await supabase()
        .from("monthly_cycles")
        .select("id")
        .eq("user_id", userId)
        .eq("year_month", ym)
        .maybeSingle();
      const patch: Record<string, unknown> = {};
      if (fields.monthlyGoal !== undefined) patch.monthly_goal = fields.monthlyGoal;
      if (fields.actionPlan !== undefined) patch.action_plan = fields.actionPlan;
      if (fields.intake !== undefined) patch.intake = fields.intake ?? null;
      if (fields.reflection !== undefined) patch.reflection = fields.reflection;
      if (fields.status !== undefined) patch.status = fields.status;
      if (existing) {
        patch.updated_at = new Date().toISOString();
        const { data } = await supabase().from("monthly_cycles").update(patch).eq("id", existing.id).select().single();
        return mapMonthlyCycle(toCycleRow(data!));
      }
      const { data } = await supabase()
        .from("monthly_cycles")
        .insert({ user_id: userId, municipality_id: await muniOf(userId), year_month: ym, ...patch })
        .select()
        .single();
      return mapMonthlyCycle(toCycleRow(data!));
    },
  },
};

// jsonb(action_plan / intake)を mapper(j() で string をパース)に渡せるよう文字列化
function toCycleRow(r: Record<string, unknown>): Record<string, unknown> {
  return {
    ...r,
    action_plan: JSON.stringify(r.action_plan ?? []),
    intake: r.intake ? JSON.stringify(r.intake) : null,
  };
}
