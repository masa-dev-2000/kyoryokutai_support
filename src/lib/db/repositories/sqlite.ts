import { all, get, run, genId } from "@/lib/db";
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

// SQLite 実装(ローカル / Vercel デモ)。SQL はここに集約し、Route からは追放する。
const MUNI = "muni_shinonsen";

function loadRoutes(): RouteDTO[] {
  const routes = all<Record<string, unknown>>(
    "SELECT * FROM approval_routes WHERE municipality_id=? ORDER BY kind, is_default DESC",
    [MUNI]
  );
  return routes.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    kind: r.kind as string,
    isDefault: !!(r.is_default as number),
    steps: all<Record<string, unknown>>(
      "SELECT * FROM approval_route_steps WHERE route_id=? ORDER BY step_no",
      [r.id]
    ).map((s) => ({
      id: s.id as string,
      stepNo: s.step_no as number,
      approverType: s.approver_type as RouteStepDTO["approverType"],
      approverLabel: s.approver_label as string,
      department: (s.department as string) ?? undefined,
      hostOrganizationId: (s.host_organization_id as string) ?? undefined,
    })),
  }));
}


// 当月 / N ヶ月前の 'YYYY-MM' を返す(ローカル時刻基準)
function ymOffset(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// municipalities.settings(JSON 文字列)→ contract 部分を ContractDTO に合成
function buildContract(row: { id: string; name: string; annual_budget: number; settings?: string | null }): ContractDTO {
  let settings: { contract?: Record<string, unknown> } = {};
  try {
    settings = row.settings ? JSON.parse(row.settings) : {};
  } catch {
    settings = {};
  }
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

function mapHost(r: Record<string, unknown>): HostOrgDTO {
  return {
    id: r.id as string,
    name: r.name as string,
    kind: (r.kind as string) ?? undefined,
    contactUserId: (r.contact_user_id as string) ?? undefined,
  };
}

export const sqliteRepos: Repos = {
  users: {
    async count() {
      return get<{ c: number }>("SELECT COUNT(*) c FROM users")?.c ?? 0;
    },
    async nameOf(id) {
      return get<{ name: string }>("SELECT name FROM users WHERE id=?", [id])?.name;
    },
    async getProfile(id) {
      const r = get<{ name: string; municipality_id: string; bio?: string; started_at?: string }>(
        "SELECT name, municipality_id, bio, started_at FROM users WHERE id=?", [id]
      );
      if (!r) return null;
      return { name: r.name, municipality: r.municipality_id ?? "", bio: r.bio, assigned_at: r.started_at };
    },
  },

  super: {
    async overview() {
      const munis = all<{ id: string; name: string; prefecture: string }>(
        "SELECT id, name, prefecture FROM municipalities ORDER BY prefecture, name"
      );
      const municipalities = munis.map((m) => {
        const cnt = (role: string) =>
          get<{ c: number }>("SELECT COUNT(*) c FROM users WHERE municipality_id=? AND role=?", [m.id, role])?.c ?? 0;
        const activityLogs =
          get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs WHERE municipality_id=?", [m.id])?.c ?? 0;
        return {
          id: m.id, name: m.name, prefecture: m.prefecture,
          members: cnt("member"), managers: cnt("manager"), admins: cnt("admin"), activityLogs,
        };
      });
      const total = (role: string) =>
        get<{ c: number }>("SELECT COUNT(*) c FROM users WHERE role=?", [role])?.c ?? 0;
      return {
        municipalities,
        totals: {
          municipalities: munis.length,
          members: total("member"), managers: total("manager"), admins: total("admin"), supers: total("super"),
        },
      };
    },

    async municipalityDetail(municipalityId): Promise<SuperMuniDetail | null> {
      const m = get<{ id: string; name: string; prefecture: string; annual_budget: number }>(
        "SELECT id, name, prefecture, annual_budget FROM municipalities WHERE id=?",
        [municipalityId]
      );
      if (!m) return null;

      const members = all<Record<string, unknown>>(
        "SELECT id, name, role_label, term, started_at, status FROM users WHERE municipality_id=? AND role='member' ORDER BY started_at",
        [municipalityId]
      ).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        role: (r.role_label as string) ?? "",
        term: (r.term as string) ?? "",
        startedAt: (r.started_at as string) ?? "未設定",
        status: (r.status as string) ?? "active",
      }));

      const staff = all<Record<string, unknown>>(
        "SELECT id, name, title, department, role, email FROM users WHERE municipality_id=? AND role IN ('manager','admin') ORDER BY created_at",
        [municipalityId]
      ).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        title: (r.title as string) ?? "職員",
        dept: (r.department as string) ?? "",
        role: (r.role as "manager" | "admin"),
        email: (r.email as string) ?? "",
      }));

      const totalLogs = get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs WHERE municipality_id=?", [municipalityId])?.c ?? 0;
      const logsThisMonth =
        get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs WHERE municipality_id=? AND log_date LIKE ?", [municipalityId, `${ymOffset(0)}%`])?.c ?? 0;
      const lastActivityDate =
        get<{ d: string }>("SELECT MAX(log_date) d FROM activity_logs WHERE municipality_id=?", [municipalityId])?.d ?? null;

      const pendingRows = all<Record<string, unknown>>(
        "SELECT * FROM approvals WHERE municipality_id=? AND status='pending' ORDER BY created_at",
        [municipalityId]
      );
      const recent = pendingRows.slice(0, 5).map(mapApproval);

      return {
        municipality: { id: m.id, name: m.name, prefecture: m.prefecture, annualBudget: m.annual_budget },
        members,
        staff,
        activity: { totalLogs, logsThisMonth, lastActivityDate },
        pendingApprovals: { total: pendingRows.length, recent },
      };
    },

    async listUsers(opts): Promise<SuperUserRow[]> {
      const conds: string[] = [];
      const args: unknown[] = [];
      if (opts?.municipalityId) { conds.push("u.municipality_id=?"); args.push(opts.municipalityId); }
      if (opts?.role) { conds.push("u.role=?"); args.push(opts.role); }
      if (opts?.status) { conds.push("u.status=?"); args.push(opts.status); }
      const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
      const rows = all<Record<string, unknown>>(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.organization_type, u.municipality_id,
                m.name AS muni_name, u.created_at,
                (SELECT COUNT(*) FROM activity_logs a WHERE a.user_id=u.id) AS log_count
         FROM users u LEFT JOIN municipalities m ON m.id=u.municipality_id
         ${where} ORDER BY u.created_at`,
        args
      );
      return rows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        email: (r.email as string) ?? "",
        role: r.role as string,
        status: (r.status as string) ?? "active",
        organizationType: (r.organization_type as string) ?? "",
        municipalityId: (r.municipality_id as string | null) ?? null,
        municipalityName: (r.muni_name as string | null) ?? "",
        activityLogs: (r.log_count as number) ?? 0,
        createdAt: (r.created_at as string) ?? "",
      }));
    },

    async updateUser(id, patch): Promise<SuperUserRow | undefined> {
      run(
        `UPDATE users SET
           role=COALESCE(?,role),
           status=COALESCE(?,status),
           municipality_id=COALESCE(?,municipality_id)
         WHERE id=?`,
        [patch.role ?? null, patch.status ?? null, patch.municipalityId ?? null, id]
      );
      return (await sqliteRepos.super.listUsers()).find((u) => u.id === id);
    },

    async getContract(municipalityId): Promise<ContractDTO | null> {
      const m = get<{ id: string; name: string; annual_budget: number; settings: string | null }>(
        "SELECT id, name, annual_budget, settings FROM municipalities WHERE id=?",
        [municipalityId]
      );
      if (!m) return null;
      return buildContract(m);
    },

    async updateContract(municipalityId, patch): Promise<ContractDTO | null> {
      const m = get<{ id: string; name: string; annual_budget: number; settings: string | null }>(
        "SELECT id, name, annual_budget, settings FROM municipalities WHERE id=?",
        [municipalityId]
      );
      if (!m) return null;
      let settings: { contract?: Record<string, unknown> } = {};
      try { settings = m.settings ? JSON.parse(m.settings) : {}; } catch { settings = {}; }
      const contract = { ...(settings.contract ?? {}) };
      if (patch.plan !== undefined) contract.plan = patch.plan;
      if (patch.contractStatus !== undefined) contract.contractStatus = patch.contractStatus;
      if (patch.contractStart !== undefined) contract.start = patch.contractStart;
      if (patch.contractEnd !== undefined) contract.end = patch.contractEnd;
      settings.contract = contract;
      run("UPDATE municipalities SET settings=?, annual_budget=COALESCE(?,annual_budget) WHERE id=?", [
        JSON.stringify(settings),
        patch.annualBudget ?? null,
        municipalityId,
      ]);
      const updated = get<{ id: string; name: string; annual_budget: number; settings: string | null }>(
        "SELECT id, name, annual_budget, settings FROM municipalities WHERE id=?",
        [municipalityId]
      )!;
      return buildContract(updated);
    },

    async analytics(): Promise<SuperAnalytics> {
      const munis = all<{ id: string; name: string; prefecture: string }>(
        "SELECT id, name, prefecture FROM municipalities ORDER BY prefecture, name"
      );
      const totalMembers = get<{ c: number }>("SELECT COUNT(*) c FROM users WHERE role='member' AND status='active'")?.c ?? 0;
      const totalLogs = get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs")?.c ?? 0;
      const thisYm = ymOffset(0);
      const prevYm = ymOffset(-1);
      const logsThisMonth = get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs WHERE log_date LIKE ?", [`${thisYm}%`])?.c ?? 0;
      const logsPrevMonth = get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs WHERE log_date LIKE ?", [`${prevYm}%`])?.c ?? 0;

      const trend = Array.from({ length: 6 }, (_, i) => {
        const ym = ymOffset(-(5 - i));
        const logs = get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs WHERE log_date LIKE ?", [`${ym}%`])?.c ?? 0;
        return { ym, logs };
      });

      const byMunicipality = munis.map((m) => {
        const activityLogs = get<{ c: number }>("SELECT COUNT(*) c FROM activity_logs WHERE municipality_id=?", [m.id])?.c ?? 0;
        const members = get<{ c: number }>(
          "SELECT COUNT(*) c FROM users WHERE municipality_id=? AND role='member' AND status='active'",
          [m.id]
        )?.c ?? 0;
        const mThisMonth = get<{ c: number }>(
          "SELECT COUNT(*) c FROM activity_logs WHERE municipality_id=? AND log_date LIKE ?",
          [m.id, `${thisYm}%`]
        )?.c ?? 0;
        return {
          id: m.id,
          name: m.name,
          prefecture: m.prefecture,
          members,
          activityLogs,
          logsThisMonth: mThisMonth,
          logsPerMemberPerWeek: Math.round((mThisMonth / Math.max(members, 1) / 4.345) * 10) / 10,
        };
      });

      return {
        generatedAt: new Date().toISOString(),
        totals: {
          members: totalMembers,
          activityLogs: totalLogs,
          municipalities: munis.length,
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
      return all("SELECT * FROM users WHERE role='member' AND status='active' ORDER BY started_at").map(mapMember);
    },
    async upsert(m) {
      const existing = m.id ? get("SELECT id FROM users WHERE id=?", [m.id]) : undefined;
      if (existing) {
        run("UPDATE users SET name=?, role_label=?, started_at=?, term=? WHERE id=?", [
          m.name, m.role, m.startedAt ?? "未設定", m.term ?? "1 年目", m.id,
        ]);
        return mapMember(all("SELECT * FROM users WHERE id=?", [m.id])[0]);
      }
      const id = m.id ?? genId("m");
      run(
        `INSERT INTO users (id,municipality_id,organization_type,role,name,email,role_label,term,started_at,status)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, MUNI, "member", "member", m.name, `${id}@member.example.jp`, m.role, m.term ?? "1 年目", m.startedAt ?? "未設定", "active"]
      );
      return mapMember(all("SELECT * FROM users WHERE id=?", [id])[0]);
    },
    async retire(id) {
      run("UPDATE users SET status='retired' WHERE id=?", [id]);
      run("DELETE FROM assignments WHERE member_id=?", [id]);
    },
  },

  staff: {
    async list() {
      return all(
        "SELECT * FROM users WHERE role='manager' AND organization_type='municipality' ORDER BY created_at"
      ).map(mapStaff);
    },
    async upsert(s) {
      const existing = s.id ? get("SELECT id FROM users WHERE id=?", [s.id]) : undefined;
      if (existing) {
        run("UPDATE users SET name=?, title=?, department=?, email=? WHERE id=?", [
          s.name, s.title ?? "職員", s.dept, s.email ?? "", s.id,
        ]);
        return mapStaff(all("SELECT * FROM users WHERE id=?", [s.id])[0]);
      }
      const id = s.id ?? genId("s");
      run(
        `INSERT INTO users (id,municipality_id,organization_type,role,name,email,title,department,status)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [id, MUNI, "municipality", "manager", s.name, s.email ?? "", s.title ?? "職員", s.dept, "active"]
      );
      return mapStaff(all("SELECT * FROM users WHERE id=?", [id])[0]);
    },
    async remove(id) {
      run("DELETE FROM assignments WHERE staff_id=?", [id]);
      run("DELETE FROM users WHERE id=? AND role='manager'", [id]);
    },
  },

  assignments: {
    async map() {
      const staff = all<{ id: string }>(
        "SELECT id FROM users WHERE role='manager' AND organization_type='municipality'"
      );
      const rows = all<{ staff_id: string; member_id: string }>("SELECT staff_id,member_id FROM assignments");
      const map: Record<string, string[]> = {};
      for (const s of staff) map[s.id] = [];
      for (const r of rows) (map[r.staff_id] ??= []).push(r.member_id);
      return map;
    },
    async replace(staffId, memberIds) {
      run("DELETE FROM assignments WHERE staff_id=?", [staffId]);
      for (const mid of memberIds ?? []) {
        run("INSERT INTO assignments (id,municipality_id,staff_id,member_id) VALUES (?,?,?,?)", [genId("as"), MUNI, staffId, mid]);
      }
    },
  },

  hostOrgs: {
    async list() {
      return all<Record<string, unknown>>(
        "SELECT * FROM host_organizations WHERE municipality_id=? ORDER BY name",
        [MUNI]
      ).map(mapHost);
    },
    async upsert(h) {
      if (h.id && get("SELECT id FROM host_organizations WHERE id=?", [h.id])) {
        run("UPDATE host_organizations SET name=?, kind=?, contact_user_id=? WHERE id=?", [
          h.name, h.kind ?? null, h.contactUserId ?? null, h.id,
        ]);
        return mapHost(all("SELECT * FROM host_organizations WHERE id=?", [h.id])[0]);
      }
      const id = h.id ?? genId("ho");
      run("INSERT INTO host_organizations (id,municipality_id,name,kind,contact_user_id) VALUES (?,?,?,?,?)", [
        id, MUNI, h.name, h.kind ?? null, h.contactUserId ?? null,
      ]);
      return mapHost(all("SELECT * FROM host_organizations WHERE id=?", [id])[0]);
    },
    async remove(id) {
      run("UPDATE approval_route_steps SET host_organization_id=NULL WHERE host_organization_id=?", [id]);
      run("DELETE FROM host_organizations WHERE id=?", [id]);
    },
  },

  routes: {
    async list() {
      return loadRoutes();
    },
    async create(r) {
      const id = genId("rt");
      run("INSERT INTO approval_routes (id,municipality_id,name,kind,is_default) VALUES (?,?,?,?,?)", [
        id, MUNI, r.name, r.kind, r.isDefault ? 1 : 0,
      ]);
      for (const s of r.steps ?? []) {
        run(
          `INSERT INTO approval_route_steps (id,route_id,step_no,approver_type,approver_label,department,host_organization_id)
           VALUES (?,?,?,?,?,?,?)`,
          [genId("st"), id, s.stepNo, s.approverType, s.approverLabel, s.department ?? null, s.hostOrganizationId ?? null]
        );
      }
      return loadRoutes().find((x) => x.id === id);
    },
    async remove(id) {
      run("DELETE FROM approval_route_steps WHERE route_id=?", [id]);
      run("DELETE FROM approval_routes WHERE id=?", [id]);
    },
  },

  topics: {
    async list(userId, kind = "topic") {
      const col = kind === "type" ? "activity_type" : "topic";
      return all<{ name: string }>(
        `SELECT DISTINCT ${col} AS name FROM activity_logs WHERE user_id=? AND ${col} IS NOT NULL AND ${col} != '' ORDER BY ${col}`,
        [userId]
      ).map((r) => r.name);
    },
    async add(_userId, _name, _kind = "topic") {
      // 候補は activity_logs から自動生成するため、個別追加は不要
      return [];
    },
    async remove(_userId, _name, _kind = "topic") {
      // 候補は activity_logs から自動生成するため、個別削除は不要
      return [];
    },
  },

  activityLogs: {
    async listByUser(userId) {
      return all("SELECT * FROM activity_logs WHERE user_id=? ORDER BY log_date DESC, log_time DESC", [userId]).map(mapLog);
    },
    async create(b) {
      const id = genId("log");
      const date = b.date ?? new Date().toISOString().slice(0, 10);
      const time = b.time ?? new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
      // ADR-021: 活動作成時に当日の daily_log を自動 upsert し daily_log_id を結線する
      let dailyLogId = b.dailyLogId ?? null;
      if (!dailyLogId) {
        const dlId = genId("dl");
        run(
          `INSERT INTO daily_logs (id,user_id,municipality_id,log_date) VALUES (?,?,?,?)
           ON CONFLICT(user_id,log_date) DO NOTHING`,
          [dlId, b.userId, MUNI, date]
        );
        const dl = get<{ id: string }>("SELECT id FROM daily_logs WHERE user_id=? AND log_date=?", [b.userId, date]);
        dailyLogId = dl?.id ?? null;
      }
      run(
        `INSERT INTO activity_logs (id,user_id,municipality_id,daily_log_id,activity_type,topic,hours,start_time,end_time,body,log_date,log_time)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, b.userId, MUNI, dailyLogId, b.type, b.topic, b.hours, b.startTime ?? null, b.endTime ?? null, b.body, date, time]
      );
      return mapLog(all("SELECT * FROM activity_logs WHERE id=?", [id])[0]);
    },
    async update(id, b) {
      const existing = all("SELECT * FROM activity_logs WHERE id=?", [id])[0];
      if (!existing) return undefined;
      run(
        `UPDATE activity_logs SET
           activity_type=COALESCE(?,activity_type),
           topic=COALESCE(?,topic),
           hours=COALESCE(?,hours),
           start_time=COALESCE(?,start_time),
           end_time=COALESCE(?,end_time),
           body=COALESCE(?,body),
           log_date=COALESCE(?,log_date),
           log_time=COALESCE(?,log_time)
         WHERE id=?`,
        [b.type ?? null, b.topic ?? null, b.hours ?? null, b.startTime ?? null, b.endTime ?? null, b.body ?? null, b.date ?? null, b.time ?? null, id]
      );
      return mapLog(all("SELECT * FROM activity_logs WHERE id=?", [id])[0]);
    },
    async delete(id) {
      run("DELETE FROM activity_logs WHERE id=?", [id]);
    },
    async listForAI(userId, ym) {
      return all<LogForAI>(
        "SELECT activity_type,topic,hours,body,log_date FROM activity_logs WHERE user_id=? AND log_date LIKE ? ORDER BY log_date",
        [userId, `${ym}%`]
      );
    },
  },

  expenses: {
    async listByUser(userId) {
      return all("SELECT * FROM expenses WHERE user_id=? ORDER BY created_at DESC", [userId]).map(mapExpense);
    },
    async create(b) {
      const id = genId("exp");
      run(
        `INSERT INTO expenses (id,user_id,municipality_id,expense_kind,category,daily_log_id,title,amount_requested,purpose,status,ai_note,citations,has_receipt,receipt_key,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, b.userId, MUNI, "single", b.category ?? "活動費", b.dailyLogId ?? null, b.title, b.amount, b.purpose, b.status ?? "申請中", "AI 判定材料は申請後に表示されます。", JSON.stringify([]), b.receiptKey ? 1 : 0, b.receiptKey ?? null, new Date().toISOString().slice(0, 10)]
      );
      return mapExpense(all("SELECT * FROM expenses WHERE id=?", [id])[0]);
    },
    async createFromLog(b) {
      const id = genId("exp");
      run(
        `INSERT INTO expenses
           (id,user_id,municipality_id,expense_kind,source_activity_log_id,source_receipt_index,
            title,amount_requested,purpose,status,ai_note,citations,has_receipt,receipt_key,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id, b.userId, MUNI, "single",
          b.activityLogId, b.receiptIndex,
          b.title, b.amount, b.purpose, b.status ?? "申請中",
          "日報経由の経費(ADR-014)。AI 判定材料は申請後に表示されます。",
          JSON.stringify([]), b.hasReceipt ? 1 : 0, b.receiptKey ?? null,
          new Date().toISOString().slice(0, 10),
        ]
      );
      return mapExpense(all("SELECT * FROM expenses WHERE id=?", [id])[0]);
    },
    async update(id, b) {
      const existing = all("SELECT * FROM expenses WHERE id=?", [id])[0];
      if (!existing) return undefined;
      run(
        `UPDATE expenses SET status=COALESCE(?,status), amount_settled=COALESCE(?,amount_settled),
           has_receipt=COALESCE(?,has_receipt), receipt_key=COALESCE(?,receipt_key), settle_note=COALESCE(?,settle_note), updated_at=datetime('now') WHERE id=?`,
        [b.status ?? null, b.amountSettled ?? null, b.hasReceipt === undefined ? null : b.hasReceipt ? 1 : 0, b.receiptKey ?? null, b.settleNote ?? null, id]
      );
      return mapExpense(all("SELECT * FROM expenses WHERE id=?", [id])[0]);
    },
  },

  monthlyReports: {
    async listByUser(userId) {
      return all("SELECT * FROM monthly_reports WHERE user_id=? ORDER BY year_month DESC", [userId]).map(mapReport);
    },
    async submit(b) {
      const existing = all<{ id: string }>("SELECT id FROM monthly_reports WHERE user_id=? AND year_month=?", [b.userId, b.ym])[0];
      if (existing) {
        run(
          "UPDATE monthly_reports SET status='submitted', status_label='提出済', summary=?, plan_next=COALESCE(?,plan_next), updated_at=datetime('now') WHERE id=?",
          [b.markdown, b.plan ?? null, existing.id]
        );
        return mapReport(all("SELECT * FROM monthly_reports WHERE id=?", [existing.id])[0]);
      }
      const id = genId("mr");
      run(
        `INSERT INTO monthly_reports (id,user_id,municipality_id,year_month,status,status_label,summary,plan_next)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, b.userId, MUNI, b.ym, "submitted", "提出済", b.markdown, b.plan ?? null]
      );
      return mapReport(all("SELECT * FROM monthly_reports WHERE id=?", [id])[0]);
    },
    async markApproved(id) {
      run("UPDATE monthly_reports SET status='approved', status_label='役場承認' WHERE id=?", [id]);
    },
    async revertToSubmitted(userId, ym) {
      run(
        "UPDATE monthly_reports SET status='submitted', status_label='提出済(再確認待ち)' WHERE user_id=? AND year_month=? AND status='approved'",
        [userId, ym]
      );
    },
  },

  approvals: {
    async listPending(muni) {
      return all("SELECT * FROM approvals WHERE municipality_id=? AND status='pending' ORDER BY created_at", [muni]).map(mapApproval);
    },
    async getRaw(id) {
      return get<ApprovalRaw>("SELECT id,kind,steps,current_step,status,target_table,target_id FROM approvals WHERE id=?", [id]);
    },
    async updateState(id, steps, currentStep, status) {
      run("UPDATE approvals SET steps=?, current_step=?, status=? WHERE id=?", [JSON.stringify(steps), currentStep, status, id]);
    },
    async getById(id) {
      const row = all("SELECT * FROM approvals WHERE id=?", [id])[0];
      return row ? mapApproval(row) : undefined;
    },
    async enqueue(a) {
      run(
        `INSERT INTO approvals (id,municipality_id,kind,applicant_id,member_name,title,ai,citations,detail,route_name,steps,current_step,status,target_table,target_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [genId("ap"), a.muni, a.kind, a.applicantId, a.memberName, a.title, a.ai, JSON.stringify([]), JSON.stringify(a.detail), a.routeName, JSON.stringify(a.steps), 0, "pending", a.targetTable, a.targetId]
      );
    },
  },

  announcements: {
    async list(muni, kinds) {
      let sql =
        `SELECT a.*, (SELECT COUNT(*) FROM announcement_reads r WHERE r.announcement_id=a.id) AS read_count
         FROM announcements a WHERE a.municipality_id=?`;
      const args: unknown[] = [muni];
      if (kinds && kinds.length) {
        sql += ` AND a.kind IN (${kinds.map(() => "?").join(",")})`;
        args.push(...kinds);
      }
      sql += " ORDER BY a.is_pinned DESC, a.sent_at DESC";
      return all(sql, args).map(mapNotice);
    },
    async create(b) {
      const id = genId("an");
      const title = (b.title || b.body.slice(0, 24) || "(無題)").trim();
      run(
        `INSERT INTO announcements (id,municipality_id,sender_id,sender_name,kind,is_pinned,title,body,target_count,sent_at)
         VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))`,
        [id, MUNI, b.senderId ?? "s1", b.senderName ?? "谷本 拓海", b.kind ?? "info", b.isPinned ? 1 : 0, title, b.body, b.targets ?? 0]
      );
      return mapNotice(all("SELECT a.*, 0 AS read_count FROM announcements a WHERE a.id=?", [id])[0]);
    },
    async markRead(announcementId, userId) {
      run(
        `INSERT OR IGNORE INTO announcement_reads (announcement_id, user_id) VALUES (?, ?)`,
        [announcementId, userId]
      );
    },
  },

  cases: {
    async listWithTrend() {
      const cases = all("SELECT * FROM cases_public ORDER BY created_at DESC").map(mapCase);
      const trend = all<Record<string, unknown>>(
        "SELECT id,title,trend_count FROM cases_public WHERE trend_count IS NOT NULL ORDER BY trend_count DESC"
      ).map((r) => ({ id: r.id as string, title: r.title as string, count: r.trend_count as number }));
      return { cases, trend };
    },
  },

  guidelines: {
    async listByMuni(muni) {
      return all<GuidelineRow>("SELECT source,section,body FROM guidelines WHERE municipality_id=?", [muni]);
    },
  },

  dailyLogs: {
    async listByUser(userId) {
      return all("SELECT * FROM daily_logs WHERE user_id=? ORDER BY log_date DESC", [userId]).map(mapDailyLog);
    },
    async upsert(userId, date, fields) {
      const existing = get<{ id: string }>("SELECT id FROM daily_logs WHERE user_id=? AND log_date=?", [userId, date]);
      if (existing) {
        const sets: string[] = [];
        const vals: unknown[] = [];
        if (fields?.note !== undefined) { sets.push("note=?"); vals.push(fields.note); }
        if (fields?.distanceKm !== undefined) { sets.push("distance_km=?"); vals.push(fields.distanceKm); }
        if (fields?.expenseAmount !== undefined) { sets.push("expense_amount=?"); vals.push(fields.expenseAmount); }
        if (fields?.feelingScore !== undefined) { sets.push("feeling_score=?"); vals.push(fields.feelingScore); }
        if (sets.length > 0) {
          sets.push("updated_at=datetime('now')");
          run(`UPDATE daily_logs SET ${sets.join(",")} WHERE id=?`, [...vals, existing.id]);
        }
        return mapDailyLog(all("SELECT * FROM daily_logs WHERE id=?", [existing.id])[0]);
      }
      const id = genId("dl");
      run(
        `INSERT INTO daily_logs (id,user_id,municipality_id,log_date,note,distance_km,expense_amount,feeling_score) VALUES (?,?,?,?,?,?,?,?)`,
        [id, userId, MUNI, date, fields?.note ?? null, fields?.distanceKm ?? null, fields?.expenseAmount ?? null, fields?.feelingScore ?? null]
      );
      return mapDailyLog(all("SELECT * FROM daily_logs WHERE id=?", [id])[0]);
    },
    async getByDate(userId, date) {
      const row = all("SELECT * FROM daily_logs WHERE user_id=? AND log_date=?", [userId, date])[0];
      return row ? mapDailyLog(row) : undefined;
    },
  },

  consultations: {
    async log(c) {
      run("INSERT INTO consultations (id,user_id,context_kind,input_text,output_text) VALUES (?,?,?,?,?)", [genId("cs"), c.userId, c.contextKind, c.input, c.output]);
    },
  },
};
