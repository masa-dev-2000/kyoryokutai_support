// Supabase(Postgres)リポジトリ実装。
// サービスロールキーを使い RLS をバイパスする(サーバーサイド専用)。
// DB_PROVIDER=supabase で repositories/index.ts から選択される。

import { createClient } from "@supabase/supabase-js";
import {
  mapLog,
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
      const { data } = await supabase()
        .from("activity_topics")
        .select("name")
        .eq("user_id", userId)
        .eq("kind", kind)
        .order("sort_order");
      return (data ?? []).map((r) => r.name);
    },
    async add(userId, name, kind = "topic") {
      const { count } = await supabase()
        .from("activity_topics")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("kind", kind);
      await supabase().from("activity_topics").upsert(
        { user_id: userId, municipality_id: MUNI, name, sort_order: count ?? 0, kind },
        { onConflict: "user_id,kind,name", ignoreDuplicates: true }
      );
      const { data } = await supabase()
        .from("activity_topics")
        .select("name")
        .eq("user_id", userId)
        .eq("kind", kind)
        .order("sort_order");
      return (data ?? []).map((r) => r.name);
    },
    async remove(userId, name, kind = "topic") {
      await supabase().from("activity_topics").delete().eq("user_id", userId).eq("kind", kind).eq("name", name);
      const { data } = await supabase()
        .from("activity_topics")
        .select("name")
        .eq("user_id", userId)
        .eq("kind", kind)
        .order("sort_order");
      return (data ?? []).map((r) => r.name);
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
      // daily_log を upsert して daily_log_id を結線
      const date = b.date ?? new Date().toISOString().slice(0, 10);
      const dl = await supabaseRepos.dailyLogs.upsert(b.userId, date);
      const { data } = await supabase()
        .from("activity_logs")
        .insert({
          user_id: b.userId,
          municipality_id: MUNI,
          daily_log_id: dl.id,
          activity_type: b.type,
          topic: b.topic,
          hours: b.hours,
          distance_km: b.distanceKm ?? null,
          body: b.body,
          occurred_at: occurredAt,
          expense_amount: b.expense ?? null,
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
      if (b.distanceKm !== undefined) patch.distance_km = b.distanceKm;
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
        .select("activity_type, topic, hours, body, occurred_at, expense_amount")
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
        expense_amount: r.expense_amount ?? null,
      }));
    },
  },

  dailyLogs: {
    async upsert(userId, date, note) {
      const { data: existing } = await supabase()
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", date)
        .maybeSingle();
      if (existing) {
        if (note !== undefined) {
          const { data } = await supabase()
            .from("daily_logs")
            .update({ note })
            .eq("id", existing.id)
            .select()
            .single();
          return { id: data!.id, date: data!.log_date, note: data!.note ?? "" };
        }
        return { id: existing.id, date: existing.log_date, note: existing.note ?? "" };
      }
      const { data } = await supabase()
        .from("daily_logs")
        .insert({ user_id: userId, municipality_id: MUNI, log_date: date, note: note ?? null })
        .select()
        .single();
      return { id: data!.id, date: data!.log_date, note: data!.note ?? "" };
    },
    async getByDate(userId, date): Promise<DailyLogDTO | undefined> {
      const { data } = await supabase()
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", date)
        .maybeSingle();
      return data ? { id: data.id, date: data.log_date, note: data.note ?? "" } : undefined;
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
          has_receipt: false,
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
          has_receipt: b.hasReceipt,
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
