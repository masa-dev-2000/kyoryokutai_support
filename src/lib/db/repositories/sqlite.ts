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
  ContractPatch,
  SuperAnalytics,
  BudgetLineDTO,
} from "./types";
import { BUDGET_CATEGORIES, DEFAULT_ALLOCATION, currentFiscalYear } from "@/lib/budget";

// SQLite 実装(ローカル / Vercel デモ)。SQL はここに集約し、Route からは追放する。
const MUNI = "muni_shinonsen";

// 書込時の municipality_id は固定定数ではなく本人の所属自治体から解決する。
// (本番では users が想定と別テナントに属することがあり、固定値だと daily_logs 等で FK 違反になる)
function muniOf(userId: string): string {
  return get<{ municipality_id: string }>("SELECT municipality_id FROM users WHERE id=?", [userId])?.municipality_id ?? MUNI;
}

// 当月 / N ヶ月前の 'YYYY-MM' を返す(ローカル時刻基準)
function ymOffset(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

// 年度 "YYYY"(4 月始まり)→ [開始日, 翌年度開始日)。経費の created_at(YYYY-MM-DD…)を辞書順比較で絞る。
function fyRange(fy: string): [string, string] {
  const y = Number(fy);
  return [`${y}-04-01`, `${y + 1}-04-01`];
}

// 新規隊員に当年度の費目別予算枠(既定配分)を投入(既存があればスキップ)。
function seedDefaultBudget(userId: string) {
  const fy = currentFiscalYear();
  for (const category of BUDGET_CATEGORIES) {
    const exists = get("SELECT id FROM budget_allocations WHERE user_id=? AND fiscal_year=? AND category=?", [userId, fy, category]);
    if (exists) continue;
    run("INSERT INTO budget_allocations (id,municipality_id,user_id,fiscal_year,category,amount_limit) VALUES (?,?,?,?,?,?)", [
      genId("bud"), MUNI, userId, fy, category, DEFAULT_ALLOCATION[category] ?? 0,
    ]);
  }
}

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
    async municipalityOf(id) {
      return muniOf(id);
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

    async createMunicipality(m) {
      const id = genId("muni");
      run("INSERT INTO municipalities (id,name,prefecture,annual_budget) VALUES (?,?,?,?)", [id, m.name, m.prefecture, m.annualBudget ?? 2000000]);
      return { id, name: m.name, prefecture: m.prefecture };
    },

    async updateMunicipality(id, patch) {
      run(
        `UPDATE municipalities SET
           name=COALESCE(?,name),
           prefecture=COALESCE(?,prefecture),
           annual_budget=COALESCE(?,annual_budget)
         WHERE id=?`,
        [patch.name ?? null, patch.prefecture ?? null, patch.annualBudget ?? null, id]
      );
      const m = get<{ id: string; name: string; prefecture: string }>(
        "SELECT id, name, prefecture FROM municipalities WHERE id=?",
        [id]
      );
      return m ?? null;
    },

    async deleteMunicipality(id): Promise<void> {
      run("DELETE FROM municipalities WHERE id=?", [id]);
    },

    async createAdminInvite(a) {
      const muni = get<{ name: string }>("SELECT name FROM municipalities WHERE id=?", [a.municipalityId]);
      // admin を pre-provision(/api/auth/me が email で auth_id を紐づけられるよう先に行を作る)
      run(
        `INSERT INTO users (id,municipality_id,organization_type,role,name,email,status)
         VALUES (?,?,?,?,?,?,?)`,
        [genId("adm"), a.municipalityId, "municipality", "admin", a.name, a.email, "active"]
      );
      const token = Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      run(
        `INSERT INTO invite_tokens (token,email,role,municipality_name,created_by,expires_at) VALUES (?,?,?,?,?,?)`,
        [token, a.email, "admin", muni?.name ?? "", a.createdBy, expiresAt]
      );
      return { token, expiresAt };
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
        role: r.role as "manager" | "admin",
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

    async deleteUser(id): Promise<void> {
      run("DELETE FROM users WHERE id=?", [id]);
    },

    async getContract(municipalityId): Promise<ContractDTO | null> {
      const m = get<{
        id: string; name: string; annual_budget: number;
        contract_plan: string | null; contract_status: string | null;
        contract_start: string | null; contract_end: string | null;
      }>(
        "SELECT id, name, annual_budget, contract_plan, contract_status, contract_start, contract_end FROM municipalities WHERE id=?",
        [municipalityId]
      );
      if (!m) return null;
      return buildContract(m);
    },

    async updateContract(municipalityId, patch): Promise<ContractDTO | null> {
      const exists = get<{ id: string }>("SELECT id FROM municipalities WHERE id=?", [municipalityId]);
      if (!exists) return null;
      run(
        `UPDATE municipalities SET
           contract_plan=COALESCE(?,contract_plan),
           contract_status=COALESCE(?,contract_status),
           contract_start=COALESCE(?,contract_start),
           contract_end=COALESCE(?,contract_end),
           annual_budget=COALESCE(?,annual_budget)
         WHERE id=?`,
        [
          patch.plan ?? null,
          patch.contractStatus ?? null,
          patch.contractStart ?? null,
          patch.contractEnd ?? null,
          patch.annualBudget ?? null,
          municipalityId,
        ]
      );
      const updated = get<{
        id: string; name: string; annual_budget: number;
        contract_plan: string | null; contract_status: string | null;
        contract_start: string | null; contract_end: string | null;
      }>(
        "SELECT id, name, annual_budget, contract_plan, contract_status, contract_start, contract_end FROM municipalities WHERE id=?",
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
        run("UPDATE users SET name=?, role_label=?, started_at=?, term=?, host_organization_id=?, approval_route_id=? WHERE id=?", [
          m.name, m.role, m.startedAt ?? "未設定", m.term ?? "1 年目", m.hostOrganizationId ?? null, m.approvalRouteId ?? null, m.id,
        ]);
        return mapMember(all("SELECT * FROM users WHERE id=?", [m.id])[0]);
      }
      const id = m.id ?? genId("m");
      run(
        `INSERT INTO users (id,municipality_id,host_organization_id,organization_type,role,name,email,role_label,term,started_at,status,approval_route_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, MUNI, m.hostOrganizationId ?? null, "member", "member", m.name, `${id}@member.example.jp`, m.role, m.term ?? "1 年目", m.startedAt ?? "未設定", "active", m.approvalRouteId ?? null]
      );
      // 新規隊員に当年度の費目別予算枠(既定配分)を自動生成
      seedDefaultBudget(id);
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
    async getForUser(userId) {
      const u = get<{ approval_route_id?: string }>("SELECT approval_route_id FROM users WHERE id=?", [userId]);
      if (!u?.approval_route_id) return null;
      return loadRoutes().find((r) => r.id === u.approval_route_id) ?? null;
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
    async upsert(r) {
      if (r.id && get("SELECT id FROM approval_routes WHERE id=?", [r.id])) {
        run("UPDATE approval_routes SET name=?, kind=?, is_default=? WHERE id=?", [
          r.name, r.kind, r.isDefault ? 1 : 0, r.id,
        ]);
        run("DELETE FROM approval_route_steps WHERE route_id=?", [r.id]); // 全置換
        for (const s of r.steps ?? []) {
          run(
            `INSERT INTO approval_route_steps (id,route_id,step_no,approver_type,approver_label,department,host_organization_id)
             VALUES (?,?,?,?,?,?,?)`,
            [genId("st"), r.id, s.stepNo, s.approverType, s.approverLabel, s.department ?? null, s.hostOrganizationId ?? null]
          );
        }
        return loadRoutes().find((x) => x.id === r.id);
      }
      return sqliteRepos.routes.create(r);
    },
    async remove(id) {
      run("DELETE FROM approval_route_steps WHERE route_id=?", [id]);
      run("DELETE FROM approval_routes WHERE id=?", [id]);
    },
  },

  budgets: {
    async summaryByUser(userId, fiscalYear) {
      const allocs = all<{ category: string; amount_limit: number }>(
        "SELECT category, amount_limit FROM budget_allocations WHERE user_id=? AND fiscal_year=?",
        [userId, fiscalYear]
      );
      const limitMap: Record<string, number> = {};
      for (const a of allocs) limitMap[a.category] = a.amount_limit;
      // 使用額 = committed(差戻し以外)を費目別に集計、当年度のみ
      const [start, end] = fyRange(fiscalYear);
      const usedRows = all<{ category: string; used: number }>(
        `SELECT category, COALESCE(SUM(amount_requested),0) used FROM expenses
         WHERE user_id=? AND status != '差戻し' AND created_at >= ? AND created_at < ? GROUP BY category`,
        [userId, start, end]
      );
      const usedMap: Record<string, number> = {};
      for (const r of usedRows) usedMap[r.category] = r.used;
      return BUDGET_CATEGORIES.map((category): BudgetLineDTO => {
        const amountLimit = limitMap[category] ?? 0;
        const used = usedMap[category] ?? 0;
        return { category, amountLimit, used, remaining: amountLimit - used };
      });
    },
    async upsert(userId, fiscalYear, allocations) {
      for (const a of allocations) {
        const existing = get<{ id: string }>(
          "SELECT id FROM budget_allocations WHERE user_id=? AND fiscal_year=? AND category=?",
          [userId, fiscalYear, a.category]
        );
        if (existing) {
          run("UPDATE budget_allocations SET amount_limit=?, updated_at=datetime('now') WHERE id=?", [a.amountLimit, existing.id]);
        } else {
          run("INSERT INTO budget_allocations (id,municipality_id,user_id,fiscal_year,category,amount_limit) VALUES (?,?,?,?,?,?)", [
            genId("bud"), MUNI, userId, fiscalYear, a.category, a.amountLimit,
          ]);
        }
      }
      return sqliteRepos.budgets.summaryByUser(userId, fiscalYear);
    },
  },

  invites: {
    async create({ email, role, municipalityName, createdBy }) {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      run(
        "INSERT INTO invite_tokens (token,email,role,municipality_name,created_by,expires_at) VALUES (?,?,?,?,?,?)",
        [token, email, role, municipalityName, createdBy, expiresAt]
      );
      return { token, expiresAt };
    },
    async findByToken(token) {
      const r = get<{
        token: string;
        email: string | null;
        role: string;
        municipality_name: string;
        expires_at: string;
        used_at: string | null;
      }>("SELECT * FROM invite_tokens WHERE token=?", [token]);
      if (!r) return null;
      return {
        token: r.token,
        email: r.email,
        role: r.role,
        municipalityName: r.municipality_name,
        expiresAt: r.expires_at,
        usedAt: r.used_at,
      };
    },
    async markUsed(token) {
      run("UPDATE invite_tokens SET used_at=datetime('now') WHERE token=? AND used_at IS NULL", [token]);
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
      const muni = muniOf(b.userId);
      let dailyLogId = b.dailyLogId ?? null;
      if (!dailyLogId) {
        const dlId = genId("dl");
        run(
          `INSERT INTO daily_logs (id,user_id,municipality_id,log_date) VALUES (?,?,?,?)
           ON CONFLICT(user_id,log_date) DO NOTHING`,
          [dlId, b.userId, muni, date]
        );
        const dl = get<{ id: string }>("SELECT id FROM daily_logs WHERE user_id=? AND log_date=?", [b.userId, date]);
        dailyLogId = dl?.id ?? null;
      }
      run(
        `INSERT INTO activity_logs (id,user_id,municipality_id,daily_log_id,activity_type,topic,hours,start_time,end_time,body,log_date,log_time)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, b.userId, muni, dailyLogId, b.type, b.topic, b.hours, b.startTime ?? null, b.endTime ?? null, b.body, date, time]
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
      return all(
        `SELECT e.*, dl.log_date AS daily_log_date
         FROM expenses e
         LEFT JOIN daily_logs dl ON dl.id=e.daily_log_id
         WHERE e.user_id=?
         ORDER BY e.created_at DESC`,
        [userId]
      ).map(mapExpense);
    },
    async create(b) {
      const id = genId("exp");
      run(
        `INSERT INTO expenses (id,user_id,municipality_id,expense_kind,category,daily_log_id,title,amount_requested,purpose,status,ai_note,citations,has_receipt,receipt_key,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, b.userId, muniOf(b.userId), "single", b.category ?? "活動費", b.dailyLogId ?? null, b.title, b.amount, b.purpose, b.status ?? "申請中", "AI 判定材料は申請後に表示されます。", JSON.stringify([]), b.receiptKey ? 1 : 0, b.receiptKey ?? null, new Date().toISOString().slice(0, 10)]
      );
      return mapExpense(all(
        `SELECT e.*, dl.log_date AS daily_log_date
         FROM expenses e
         LEFT JOIN daily_logs dl ON dl.id=e.daily_log_id
         WHERE e.id=?`,
        [id]
      )[0]);
    },
    async createFromLog(b) {
      const id = genId("exp");
      run(
        `INSERT INTO expenses
           (id,user_id,municipality_id,expense_kind,source_activity_log_id,source_receipt_index,
            title,amount_requested,purpose,status,ai_note,citations,has_receipt,receipt_key,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id, b.userId, muniOf(b.userId), "single",
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
        [id, b.userId, muniOf(b.userId), b.ym, "submitted", "提出済", b.markdown, b.plan ?? null]
      );
      return mapReport(all("SELECT * FROM monthly_reports WHERE id=?", [id])[0]);
    },
    async markApproved(id) {
      run("UPDATE monthly_reports SET status='approved', status_label='役場承認' WHERE id=?", [id]);
    },
    async markRejected(id) {
      // status は 'draft' に戻す(隊員が修正・再提出できる編集可能状態)。差戻しの意味は status_label が担う。
      // 'rejected' のような未知 status を入れると、隊員画面が status!=draft&&!=submitted を一律「承認済」と
      // 表示してしまい、差戻しが承認済に見える(逆の意味)。隊員側 UI は draft/submitted/approved の3値のみ対応。
      run("UPDATE monthly_reports SET status='draft', status_label='差戻し（要修正）' WHERE id=?", [id]);
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
        [id, userId, muniOf(userId), date, fields?.note ?? null, fields?.distanceKm ?? null, fields?.expenseAmount ?? null, fields?.feelingScore ?? null]
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

  visions: {
    async get(userId) {
      const row = get("SELECT * FROM visions WHERE user_id=?", [userId]);
      return row ? mapVision(row) : null;
    },
    async upsert(userId, body) {
      const existing = get<{ id: string }>("SELECT id FROM visions WHERE user_id=?", [userId]);
      if (existing) {
        run("UPDATE visions SET body=?, updated_at=datetime('now') WHERE id=?", [body, existing.id]);
        return mapVision(get("SELECT * FROM visions WHERE id=?", [existing.id])!);
      }
      const id = genId("vis");
      run("INSERT INTO visions (id,user_id,body) VALUES (?,?,?)", [id, userId, body]);
      return mapVision(get("SELECT * FROM visions WHERE id=?", [id])!);
    },
  },

  monthlyCycles: {
    async getByMonth(userId, ym) {
      const row = get("SELECT * FROM monthly_cycles WHERE user_id=? AND year_month=?", [userId, ym]);
      return row ? mapMonthlyCycle(row) : null;
    },
    async listByUser(userId) {
      return all("SELECT * FROM monthly_cycles WHERE user_id=? ORDER BY year_month DESC", [userId]).map(mapMonthlyCycle);
    },
    async upsert(userId, ym, fields) {
      const existing = get<{ id: string }>("SELECT id FROM monthly_cycles WHERE user_id=? AND year_month=?", [userId, ym]);
      if (existing) {
        const sets: string[] = [];
        const vals: unknown[] = [];
        if (fields.monthlyGoal !== undefined) { sets.push("monthly_goal=?"); vals.push(fields.monthlyGoal); }
        if (fields.actionPlan !== undefined) { sets.push("action_plan=?"); vals.push(JSON.stringify(fields.actionPlan)); }
        if (fields.intake !== undefined) { sets.push("intake=?"); vals.push(fields.intake ? JSON.stringify(fields.intake) : null); }
        if (fields.reflection !== undefined) { sets.push("reflection=?"); vals.push(fields.reflection); }
        if (fields.status !== undefined) { sets.push("status=?"); vals.push(fields.status); }
        if (sets.length > 0) {
          sets.push("updated_at=datetime('now')");
          run(`UPDATE monthly_cycles SET ${sets.join(",")} WHERE id=?`, [...vals, existing.id]);
        }
        return mapMonthlyCycle(get("SELECT * FROM monthly_cycles WHERE id=?", [existing.id])!);
      }
      const id = genId("mc");
      run(
        `INSERT INTO monthly_cycles (id,user_id,municipality_id,year_month,monthly_goal,action_plan,intake,reflection,status)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          id, userId, muniOf(userId), ym,
          fields.monthlyGoal ?? null,
          JSON.stringify(fields.actionPlan ?? []),
          fields.intake ? JSON.stringify(fields.intake) : null,
          fields.reflection ?? null,
          fields.status ?? "planning",
        ]
      );
      return mapMonthlyCycle(get("SELECT * FROM monthly_cycles WHERE id=?", [id])!);
    },
  },
};
