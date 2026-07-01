"use client";

import * as React from "react";
import Link from "next/link";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import {
  Search,
  ChevronLeft,
  X,
  ArrowRight,
  Plus,
  Check,
  UserCog,
  Building2,
  Workflow,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { BUDGET_CATEGORIES, ANNUAL_BUDGET_TOTAL, defaultAllocationList } from "@/lib/budget";

type BudgetLine = { category: string; amountLimit: number; used: number; remaining: number };

/* ============================================================
   v5 管理者アプリ ─ 検索エンジン型・3 機能
   1. 隊員台帳: 隊員の追加・編集・退任管理
   2. 職員: 役場側ユーザー(承認権限を持つ職員)
   3. 担当割当: 職員 × 隊員 のマトリクス
   ============================================================ */

type Tab = "members" | "staff" | "assignments" | "hosts" | "routes" | "invite";

type HostOrg = { id: string; name: string; kind?: string; contactUserId?: string };

type RouteStep = {
  id?: string;
  stepNo: number;
  approverType: "dept" | "host_org" | "admin";
  approverLabel: string;
  department?: string;
  hostOrganizationId?: string;
};
type ApprovalRoute = { id: string; name: string; kind: string; isDefault: boolean; steps: RouteStep[] };

type Member = {
  id: string;
  name: string;
  role: string;
  startedAt: string;
  term: string;
  hostOrganizationId?: string;
  approvalRouteId?: string;
};

type Staff = {
  id: string;
  name: string;
  title: string;
  dept: string;
  email: string;
};

const initialMembers: Member[] = [
  { id: "m1", name: "田中 あかり", role: "移住促進", startedAt: "2026-04-01", term: "1 年目" },
  { id: "m2", name: "山本 健一", role: "農業支援", startedAt: "2025-04-01", term: "2 年目" },
  { id: "m3", name: "佐藤 美咲", role: "観光", startedAt: "2024-04-01", term: "3 年目" },
  { id: "m4", name: "鈴木 悠人", role: "教育", startedAt: "2026-04-01", term: "1 年目" },
  { id: "m5", name: "高橋 大輔", role: "DX", startedAt: "2025-10-01", term: "1 年目" },
  { id: "m6", name: "中村 さくら", role: "起業支援", startedAt: "2026-04-01", term: "1 年目" },
  { id: "m7", name: "藤井 翔太", role: "林業", startedAt: "2025-04-01", term: "2 年目" },
];

const initialStaff: Staff[] = [
  { id: "s1", name: "谷本 拓海", title: "室長", dept: "企画課", email: "tanimoto@town.example.jp" },
  { id: "s2", name: "森本 千秋", title: "係長", dept: "企画課", email: "morimoto@town.example.jp" },
  { id: "s3", name: "井上 雅人", title: "主事", dept: "産業振興課", email: "inoue@town.example.jp" },
];

const initialAssignments: Record<string, string[]> = {
  s1: ["m1", "m2", "m3", "m4", "m5"],
  s2: ["m6", "m7"],
  s3: [],
};

type Sheet =
  | { kind: "member-edit"; member: Member | null }
  | { kind: "staff-edit"; staff: Staff | null }
  | { kind: "assign-edit"; staffId: string }
  | { kind: "host-edit"; host: HostOrg | null }
  | { kind: "route-edit"; route: ApprovalRoute | null }
  | null;

type RouteDraft = { id?: string; name: string; kind: string; isDefault: boolean; steps: RouteStep[] };

type Ctx = {
  members: Member[];
  staff: Staff[];
  assignments: Record<string, string[]>;
  hosts: HostOrg[];
  routes: ApprovalRoute[];
  upsertMember: (m: Member) => Promise<Member>;
  removeMember: (id: string) => void | Promise<void>;
  upsertStaff: (s: Staff) => void | Promise<void>;
  removeStaff: (id: string) => void | Promise<void>;
  setAssignment: (staffId: string, memberIds: string[]) => void | Promise<void>;
  upsertHost: (h: HostOrg) => void | Promise<void>;
  removeHost: (id: string) => void | Promise<void>;
  upsertRoute: (r: RouteDraft) => void | Promise<void>;
  removeRoute: (id: string) => void | Promise<void>;
  sheet: Sheet;
  openSheet: (s: Sheet) => void;
};

const AppCtx = React.createContext<Ctx | null>(null);
const useApp = () => {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("AppCtx missing");
  return c;
};

export function AdminApp() {
  const [tab, setTab] = React.useState<Tab>("members");
  const [members, setMembers] = React.useState<Member[]>(initialMembers);
  const [staff, setStaff] = React.useState<Staff[]>(initialStaff);
  const [assignments, setAssignments] = React.useState<Record<string, string[]>>(initialAssignments);
  const [hosts, setHosts] = React.useState<HostOrg[]>([]);
  const [routes, setRoutes] = React.useState<ApprovalRoute[]>([]);
  const [sheet, setSheet] = React.useState<Sheet>(null);

  // バックエンドから取得(SQLite + API Routes)
  const refetch = React.useCallback(async () => {
    try {
      const [ms, ss, as, ho, rt] = await Promise.all([
        apiGet<Member[]>("/api/members"),
        apiGet<Staff[]>("/api/staff"),
        apiGet<Record<string, string[]>>("/api/assignments"),
        apiGet<HostOrg[]>("/api/host-organizations"),
        apiGet<ApprovalRoute[]>("/api/approval-routes"),
      ]);
      setMembers(ms);
      setStaff(ss);
      setAssignments(as);
      setHosts(ho);
      setRoutes(rt);
    } catch {
      /* オフライン時はシードのまま */
    }
  }, []);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const ctx: Ctx = {
    members,
    staff,
    assignments,
    upsertMember: async (m) => {
      const saved = await apiPost<Member>("/api/members", m);
      setMembers((ms) => {
        const idx = ms.findIndex((x) => x.id === saved.id);
        if (idx < 0) return [...ms, saved];
        const copy = [...ms];
        copy[idx] = saved;
        return copy;
      });
      return saved;
    },
    removeMember: async (id) => {
      await apiDelete(`/api/members/${id}`);
      setMembers((ms) => ms.filter((m) => m.id !== id));
      setAssignments((a) => {
        const copy: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(a)) copy[k] = v.filter((x) => x !== id);
        return copy;
      });
    },
    upsertStaff: async (s) => {
      const saved = await apiPost<Staff>("/api/staff", s);
      setStaff((ss) => {
        const idx = ss.findIndex((x) => x.id === saved.id);
        if (idx < 0) {
          setAssignments((a) => ({ ...a, [saved.id]: [] }));
          return [...ss, saved];
        }
        const copy = [...ss];
        copy[idx] = saved;
        return copy;
      });
    },
    removeStaff: async (id) => {
      await apiDelete(`/api/staff/${id}`);
      setStaff((ss) => ss.filter((s) => s.id !== id));
      setAssignments((a) => {
        const copy = { ...a };
        delete copy[id];
        return copy;
      });
    },
    setAssignment: async (staffId, memberIds) => {
      await apiPut("/api/assignments", { staffId, memberIds });
      setAssignments((a) => ({ ...a, [staffId]: memberIds }));
    },
    hosts,
    routes,
    upsertHost: async (h) => {
      const saved = await apiPost<HostOrg>("/api/host-organizations", h);
      setHosts((hs) => {
        const idx = hs.findIndex((x) => x.id === saved.id);
        if (idx < 0) return [...hs, saved];
        const copy = [...hs];
        copy[idx] = saved;
        return copy;
      });
    },
    removeHost: async (id) => {
      await apiDelete(`/api/host-organizations/${id}`);
      setHosts((hs) => hs.filter((h) => h.id !== id));
    },
    upsertRoute: async (r) => {
      const isExisting = !!r.id && routes.some((x) => x.id === r.id);
      const saved = isExisting
        ? await apiPut<ApprovalRoute>("/api/approval-routes", r)
        : await apiPost<ApprovalRoute>("/api/approval-routes", r);
      setRoutes((rs) => {
        const idx = rs.findIndex((x) => x.id === saved.id);
        if (idx < 0) return [...rs, saved];
        const copy = [...rs];
        copy[idx] = saved;
        return copy;
      });
    },
    removeRoute: async (id) => {
      await apiDelete(`/api/approval-routes/${id}`);
      setRoutes((rs) => rs.filter((r) => r.id !== id));
    },
    sheet,
    openSheet: setSheet,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <main className="flex h-screen flex-col bg-white text-slate-900">
        <Header />
        <Tabs active={tab} onChange={setTab} />

        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8">
          <div className="mx-auto w-full max-w-3xl flex-1 py-4">
            {tab === "members" && <MembersTab />}
            {tab === "staff" && <StaffTab />}
            {tab === "assignments" && <AssignmentsTab />}
            {tab === "hosts" && <HostsTab />}
            {tab === "routes" && <RoutesTab />}
            {tab === "invite" && <InviteTab />}
          </div>
        </div>

        <Footer />
        <SheetRoot />
      </main>
    </AppCtx.Provider>
  );
}

/* -------------------- Header / Tabs / Footer -------------------- */

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
      <span />
      <div className="text-center text-[11px] text-slate-500">
        管理者 / 新温泉町
      </div>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-[11px] text-slate-400">v5 admin</span>
        <LogoutButton />
      </div>
    </header>
  );
}

function Tabs({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="flex items-center justify-center gap-1 border-b border-slate-100 px-5 py-1.5">
      <TabBtn label="隊員台帳" active={active === "members"} onClick={() => onChange("members")} />
      <TabBtn label="職員" active={active === "staff"} onClick={() => onChange("staff")} />
      <TabBtn label="担当割当" active={active === "assignments"} onClick={() => onChange("assignments")} />
      <TabBtn label="受入団体" active={active === "hosts"} onClick={() => onChange("hosts")} />
      <TabBtn label="承認ルート" active={active === "routes"} onClick={() => onChange("routes")} />
      <TabBtn label="招待" active={active === "invite"} onClick={() => onChange("invite")} />
    </nav>
  );
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-1.5 text-[12px] font-semibold transition ${
        active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-[-7px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-slate-900" />
      )}
    </button>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 py-2 text-center text-[10px] text-slate-400">
      地域おこし協力隊サポートシステム ・ v5 lab
    </footer>
  );
}

/* -------------------- 1. 隊員台帳 -------------------- */

function MembersTab() {
  const { members, openSheet } = useApp();
  const [q, setQ] = React.useState("");
  const filtered = members.filter((m) =>
    q.trim() ? m.name.includes(q) || m.role.includes(q) : true
  );

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">隊員台帳</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          協力隊員 {members.length} 名 ・ 着任時期・任期を管理
        </p>
        <SearchBox value={q} onChange={setQ} placeholder="隊員名 / 役割で絞る" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="隊員が登録されていません。右下から追加してください。" />
      ) : (
        <ul className="mt-5 space-y-px text-left">
          {filtered.map((m) => (
            <li
              key={m.id}
              className="border-b border-slate-100 last:border-b-0"
            >
              <button
                onClick={() => openSheet({ kind: "member-edit", member: m })}
                className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                  {m.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1 px-1">
                  <div className="text-[13px] font-semibold text-slate-900">
                    {m.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {m.role} ・ {m.term} ・ 着任 {m.startedAt}
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => openSheet({ kind: "member-edit", member: null })}
        className="fixed bottom-10 right-6 z-30 inline-flex h-12 items-center gap-1.5 rounded-full bg-slate-900 px-5 text-[12px] font-bold text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        隊員を追加
      </button>
    </div>
  );
}

/* -------------------- 2. 職員 -------------------- */

function StaffTab() {
  const { staff, openSheet, assignments } = useApp();
  const [q, setQ] = React.useState("");
  const filtered = staff.filter((s) =>
    q.trim() ? s.name.includes(q) || s.dept.includes(q) : true
  );

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">職員</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          役場側ユーザー {staff.length} 名 ・ 承認権限あり
        </p>
        <SearchBox value={q} onChange={setQ} placeholder="氏名 / 課で絞る" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="職員が登録されていません。" />
      ) : (
        <ul className="mt-5 space-y-px text-left">
          {filtered.map((s) => {
            const count = assignments[s.id]?.length ?? 0;
            return (
              <li
                key={s.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <button
                  onClick={() => openSheet({ kind: "staff-edit", staff: s })}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                    <UserCog className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 px-1">
                    <div className="text-[13px] font-semibold text-slate-900">
                      {s.name} <span className="text-[10px] font-normal text-slate-500">/ {s.title}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {s.dept} ・ 担当 {count} 名
                    </div>
                  </div>
                  <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={() => openSheet({ kind: "staff-edit", staff: null })}
        className="fixed bottom-10 right-6 z-30 inline-flex h-12 items-center gap-1.5 rounded-full bg-slate-900 px-5 text-[12px] font-bold text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        職員を追加
      </button>
    </div>
  );
}

/* -------------------- 3. 担当割当 -------------------- */

function AssignmentsTab() {
  const { members, staff, assignments, openSheet } = useApp();

  // 隊員 → 担当職員の逆引き
  const memberToStaff: Record<string, string[]> = {};
  for (const m of members) memberToStaff[m.id] = [];
  for (const [staffId, memberIds] of Object.entries(assignments)) {
    for (const mid of memberIds) {
      memberToStaff[mid]?.push(staffId);
    }
  }
  const unassigned = members.filter((m) => memberToStaff[m.id].length === 0);

  return (
    <div>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">担当割当</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          職員 × 隊員 のマッピング ・ 未割当 {unassigned.length} 名
        </p>
      </div>

      {unassigned.length > 0 && (
        <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <strong>未割当の隊員:</strong>{" "}
          {unassigned.map((m) => m.name).join(" / ")}
          <br />
          いずれかの職員に割り当ててください。
        </div>
      )}

      <div className="mt-5 space-y-2 text-left">
        {staff.map((s) => {
          const assigned = assignments[s.id] ?? [];
          const assignedMembers = assigned
            .map((id) => members.find((m) => m.id === id))
            .filter((x): x is Member => !!x);
          return (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-slate-900">
                    {s.name}{" "}
                    <span className="text-[10px] font-normal text-slate-500">
                      / {s.title} / {s.dept}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {assignedMembers.length === 0 ? (
                      <span className="text-[11px] text-slate-400">担当なし</span>
                    ) : (
                      assignedMembers.map((m) => (
                        <span
                          key={m.id}
                          className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                        >
                          {m.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openSheet({ kind: "assign-edit", staffId: s.id })}
                  className="shrink-0 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-500"
                >
                  編集
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- 4. 受入団体(ADR-012 / F-A-05)-------------------- */

function HostsTab() {
  const { hosts, openSheet } = useApp();
  const [q, setQ] = React.useState("");
  const filtered = hosts.filter((h) => (q.trim() ? h.name.includes(q) || (h.kind ?? "").includes(q) : true));

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">受入団体</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          {hosts.length} 団体 ・ 経費承認の中間ステップに登場します
        </p>
        <SearchBox value={q} onChange={setQ} placeholder="団体名 / 種別で絞る" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="受入団体が登録されていません。右下から追加してください。" />
      ) : (
        <ul className="mt-5 space-y-px text-left">
          {filtered.map((h) => (
            <li key={h.id} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => openSheet({ kind: "host-edit", host: h })}
                className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 px-1">
                  <div className="text-[13px] font-semibold text-slate-900">{h.name}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{h.kind ?? "種別 未設定"}</div>
                </div>
                <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => openSheet({ kind: "host-edit", host: null })}
        className="fixed bottom-10 right-6 z-30 inline-flex h-12 items-center gap-1.5 rounded-full bg-slate-900 px-5 text-[12px] font-bold text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        受入団体を追加
      </button>
    </div>
  );
}

/* -------------------- 5. 承認ルート(ADR-012 / F-A-04)-------------------- */

function RoutesTab() {
  const { routes, openSheet } = useApp();
  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">承認ルート</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          {routes.length} ルート ・ 隊員ごとに割り当てて多段階承認を実現します
        </p>
      </div>

      <div className="mt-5 space-y-2 text-left">
        {routes.map((r) => (
          <button
            key={r.id}
            onClick={() => openSheet({ kind: "route-edit", route: r })}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-900 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Workflow className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[13px] font-bold text-slate-900">{r.name}</span>
                  {r.isDefault && (
                    <span className="rounded-full border border-slate-900 bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold text-white">既定</span>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-slate-500">対象: {r.kind} ・ {r.steps.length} ステップ</div>
              </div>
              <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {r.steps.map((s, i) => (
                <React.Fragment key={s.id ?? i}>
                  {i > 0 && <span className="text-[10px] text-slate-300">→</span>}
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {s.approverLabel}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => openSheet({ kind: "route-edit", route: null })}
        className="fixed bottom-10 right-6 z-30 inline-flex h-12 items-center gap-1.5 rounded-full bg-slate-900 px-5 text-[12px] font-bold text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        ルートを追加
      </button>
    </div>
  );
}

/* -------------------- Reusable -------------------- */

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition focus-within:border-slate-900 focus-within:shadow-md">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center text-[12px] text-slate-500">
      {message}
    </div>
  );
}

/* -------------------- Sheets -------------------- */

function SheetRoot() {
  const { sheet, openSheet } = useApp();
  if (!sheet) return null;
  const close = () => openSheet(null);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {sheet.kind === "member-edit" && (
        <MemberEditSheet member={sheet.member} onClose={close} />
      )}
      {sheet.kind === "staff-edit" && (
        <StaffEditSheet staff={sheet.staff} onClose={close} />
      )}
      {sheet.kind === "assign-edit" && (
        <AssignEditSheet staffId={sheet.staffId} onClose={close} />
      )}
      {sheet.kind === "host-edit" && (
        <HostEditSheet host={sheet.host} onClose={close} />
      )}
      {sheet.kind === "route-edit" && (
        <RouteEditSheet route={sheet.route} onClose={close} />
      )}
    </div>
  );
}

function HostEditSheet({ host, onClose }: { host: HostOrg | null; onClose: () => void }) {
  const { upsertHost, removeHost, staff } = useApp();
  const isNew = !host;
  const [name, setName] = React.useState(host?.name ?? "");
  const [kind, setKind] = React.useState(host?.kind ?? "");
  const [contactUserId, setContactUserId] = React.useState(host?.contactUserId ?? "");

  const canSave = !!name.trim();
  async function save() {
    await upsertHost({
      id: host?.id ?? `ho_${Date.now()}`,
      name: name.trim(),
      kind: kind.trim() || undefined,
      contactUserId: contactUserId || undefined,
    });
    onClose();
  }

  return (
    <>
      <SheetHeader
        title={isNew ? "受入団体を追加" : "受入団体を編集"}
        onClose={onClose}
        right={
          <button onClick={save} disabled={!canSave} className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300">
            保存
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <Label>団体名</Label>
        <Input value={name} onChange={setName} placeholder="例:新温泉町農業公社" />

        <Label>種別(任意)</Label>
        <Input value={kind} onChange={setKind} placeholder="例:農業法人 / 観光協会 / NPO" />

        <Label>連絡先ユーザー(任意)</Label>
        <select
          value={contactUserId}
          onChange={(e) => setContactUserId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        >
          <option value="">未設定</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} / {s.dept}
            </option>
          ))}
        </select>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          受入団体が経費の財布を握っている場合、「複雑」ルート(担当課 → 受入団体 → 企画課)の中間ステップに登場します。
        </div>

        {!isNew && host && (
          <div className="mt-8 border-t border-slate-100 pt-4">
            <button
              onClick={async () => {
                if (confirm(`${host.name} を削除しますか?`)) {
                  await removeHost(host.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              この団体を削除
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const APPROVER_TYPES: { value: RouteStep["approverType"]; label: string }[] = [
  { value: "dept", label: "役場担当課" },
  { value: "host_org", label: "受入団体" },
  { value: "admin", label: "企画課" },
];
const ROUTE_KINDS = ["経費", "月次報告", "活動相談"];

function RouteEditSheet({ route, onClose }: { route: ApprovalRoute | null; onClose: () => void }) {
  const { upsertRoute, removeRoute, hosts } = useApp();
  const isNew = !route;
  const [name, setName] = React.useState(route?.name ?? "");
  const [kind, setKind] = React.useState(route?.kind ?? "経費");
  const [isDefault, setIsDefault] = React.useState(route?.isDefault ?? false);
  const [steps, setSteps] = React.useState<RouteStep[]>(
    route?.steps.map((s) => ({ ...s })) ?? [{ stepNo: 1, approverType: "dept", approverLabel: "担当課" }]
  );

  function updateStep(i: number, patch: Partial<RouteStep>) {
    setSteps((ss) => ss.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function moveStep(i: number, dir: -1 | 1) {
    setSteps((ss) => {
      const j = i + dir;
      if (j < 0 || j >= ss.length) return ss;
      const copy = [...ss];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }
  function addStep() {
    setSteps((ss) => [...ss, { stepNo: ss.length + 1, approverType: "admin", approverLabel: "企画課" }]);
  }
  function removeStep(i: number) {
    setSteps((ss) => ss.filter((_, idx) => idx !== i));
  }

  // host_org ステップは受入団体の選択(hostOrganizationId)を必須にする。
  // 未選択のまま保存すると、承認フローに実体のない受入団体ステップが残ってしまうため。
  const canSave =
    !!name.trim() &&
    steps.length > 0 &&
    steps.every((s) => (s.approverType === "host_org" ? !!s.hostOrganizationId : !!s.approverLabel.trim()));

  async function save() {
    const normalized = steps.map((s, i) => ({
      stepNo: i + 1,
      approverType: s.approverType,
      approverLabel: s.approverLabel.trim(),
      department: s.approverType === "dept" ? s.approverLabel.trim() : undefined,
      hostOrganizationId: s.approverType === "host_org" ? s.hostOrganizationId : undefined,
    }));
    await upsertRoute({ id: route?.id, name: name.trim(), kind, isDefault, steps: normalized });
    onClose();
  }

  return (
    <>
      <SheetHeader
        title={isNew ? "承認ルートを追加" : "承認ルートを編集"}
        onClose={onClose}
        right={
          <button onClick={save} disabled={!canSave} className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300">
            保存
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <Label>ルート名</Label>
        <Input value={name} onChange={setName} placeholder="例:複雑(担当課 → 受入団体 → 企画課)" />

        <Label>対象</Label>
        <div className="mt-1 flex gap-1.5">
          {ROUTE_KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
                kind === k ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600 hover:border-slate-500"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <label className="mt-4 flex items-center gap-2 text-[12px] text-slate-700">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4" />
          この対象の既定ルートにする
        </label>

        <Label>承認ステップ(上から順に承認)</Label>
        <div className="mt-2 space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button onClick={() => removeStep(i)} disabled={steps.length <= 1} className="rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-30">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {APPROVER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      if (t.value === "admin") updateStep(i, { approverType: t.value, approverLabel: s.approverLabel || "企画課", hostOrganizationId: undefined });
                      else if (t.value === "dept") updateStep(i, { approverType: t.value, hostOrganizationId: undefined });
                      else updateStep(i, { approverType: t.value });
                    }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      s.approverType === t.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600 hover:border-slate-500"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {s.approverType === "host_org" ? (
                <select
                  value={s.hostOrganizationId ?? ""}
                  onChange={(e) => {
                    const h = hosts.find((x) => x.id === e.target.value);
                    updateStep(i, { hostOrganizationId: e.target.value || undefined, approverLabel: h?.name ?? s.approverLabel });
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[13px] focus:border-slate-900 focus:outline-none"
                >
                  <option value="">受入団体を選択</option>
                  {hosts.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={s.approverLabel}
                  onChange={(e) => updateStep(i, { approverLabel: e.target.value })}
                  placeholder={s.approverType === "dept" ? "課名(例:商工観光課)" : "表示名(例:企画課)"}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[13px] focus:border-slate-900 focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>

        <button onClick={addStep} className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-500">
          <Plus className="h-3.5 w-3.5" />
          ステップを追加
        </button>

        {!isNew && route && (
          <div className="mt-8 border-t border-slate-100 pt-4">
            <button
              onClick={async () => {
                if (confirm(`ルート「${route.name}」を削除しますか?`)) {
                  await removeRoute(route.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              このルートを削除
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SheetHeader({
  title,
  onClose,
  right,
}: {
  title: string;
  onClose: () => void;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-5 py-2.5">
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1 text-[12px] text-slate-700 hover:text-slate-900"
      >
        <X className="h-4 w-4" />
        閉じる
      </button>
      <div className="text-[12px] font-semibold">{title}</div>
      <div className="min-w-12 text-right">{right}</div>
    </header>
  );
}

function MemberEditSheet({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const { upsertMember, removeMember, hosts, routes } = useApp();
  const isNew = !member;
  const [name, setName] = React.useState(member?.name ?? "");
  const [role, setRole] = React.useState(member?.role ?? "");
  const [startedAt, setStartedAt] = React.useState(member?.startedAt ?? "");
  const [term, setTerm] = React.useState(member?.term ?? "1 年目");
  const [hostOrganizationId, setHostOrganizationId] = React.useState(member?.hostOrganizationId ?? "");
  const [approvalRouteId, setApprovalRouteId] = React.useState(member?.approvalRouteId ?? "");
  const expenseRoutes = routes.filter((r) => r.kind === "経費");

  // 費目別予算枠。既存隊員は現状を取得し、新規隊員は既定配分を初期表示して作成と同時に保存する。
  const [budget, setBudget] = React.useState<BudgetLine[] | null>(
    member ? null : defaultAllocationList().map((a) => ({ ...a, used: 0, remaining: a.amountLimit }))
  );
  React.useEffect(() => {
    if (!member) return;
    apiGet<BudgetLine[]>(`/api/budgets?userId=${member.id}`)
      .then(setBudget)
      .catch(() => setBudget(null));
  }, [member]);
  const budgetTotal = (budget ?? []).reduce((s, b) => s + (b.amountLimit || 0), 0);
  function setLimit(category: string, v: number) {
    setBudget((b) => (b ?? []).map((x) => (x.category === category ? { ...x, amountLimit: v } : x)));
  }

  const canSave = !!(name.trim() && role.trim());

  async function save() {
    const saved = await upsertMember({
      id: member?.id ?? `m${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      startedAt: startedAt.trim() || "未設定",
      term,
      hostOrganizationId: hostOrganizationId || undefined,
      approvalRouteId: approvalRouteId || undefined,
    });
    // 新規・既存いずれも、編集した費目別予算枠を保存する(新規は作成後の id に対して反映)。
    const targetId = member?.id ?? saved?.id;
    if (targetId && budget) {
      await apiPut("/api/budgets", {
        userId: targetId,
        allocations: budget.map((b) => ({ category: b.category, amountLimit: b.amountLimit })),
      });
    }
    onClose();
  }

  return (
    <>
      <SheetHeader
        title={isNew ? "隊員を追加" : "隊員を編集"}
        onClose={onClose}
        right={
          <button
            onClick={save}
            disabled={!canSave}
            className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          >
            保存
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <Label>氏名</Label>
        <Input value={name} onChange={setName} placeholder="例:田中 あかり" />

        <Label>役割 / ミッション</Label>
        <Input value={role} onChange={setRole} placeholder="例:移住促進 / 空き家担当" />

        <Label>着任日</Label>
        <Input value={startedAt} onChange={setStartedAt} placeholder="例:2026-04-01" />

        <Label>任期</Label>
        <div className="mt-1 flex gap-1.5">
          {["1 年目", "2 年目", "3 年目", "卒業生"].map((t) => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
                term === t
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:border-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Label>所属受入団体(委託型)</Label>
        <select
          value={hostOrganizationId}
          onChange={(e) => setHostOrganizationId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        >
          <option value="">役場直轄(所属団体なし)</option>
          {hosts.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        <Label>承認ルート(経費)</Label>
        <select
          value={approvalRouteId}
          onChange={(e) => setApprovalRouteId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        >
          <option value="">既定ルート(未割当)</option>
          {expenseRoutes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}（{r.steps.map((s) => s.approverLabel).join(" → ")}）
            </option>
          ))}
        </select>

        {budget && (
          <>
            <Label>費目別予算枠(年額 / 合計 ¥{budgetTotal.toLocaleString()})</Label>
            <p className="mt-1 text-[11px] text-slate-500">
              活動費の費目別上限。費目間の流用はできないため、隊員の計画に合わせて配分します(目安 合計 ¥{ANNUAL_BUDGET_TOTAL.toLocaleString()})。
            </p>
            <div className="mt-2 space-y-1.5">
              {budget.map((b) => (
                <div key={b.category} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[12px] text-slate-700">{b.category}</span>
                  <div className="flex flex-1 items-center gap-1">
                    <span className="text-[12px] text-slate-400">¥</span>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={b.amountLimit}
                      onChange={(e) => setLimit(b.category, Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-[13px] tabular-nums focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-[10px] text-slate-400">
                    使用 ¥{b.used.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {!isNew && member && (
          <div className="mt-8 border-t border-slate-100 pt-4">
            <button
              onClick={() => {
                if (confirm(`${member.name} を退任にしますか?(関連データは保持されます)`)) {
                  removeMember(member.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              この隊員を退任にする
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function StaffEditSheet({
  staff,
  onClose,
}: {
  staff: Staff | null;
  onClose: () => void;
}) {
  const { upsertStaff, removeStaff } = useApp();
  const isNew = !staff;
  const [name, setName] = React.useState(staff?.name ?? "");
  const [title, setTitle] = React.useState(staff?.title ?? "");
  const [dept, setDept] = React.useState(staff?.dept ?? "");
  const [email, setEmail] = React.useState(staff?.email ?? "");

  const canSave = name.trim() && dept.trim();

  function save() {
    upsertStaff({
      id: staff?.id ?? `s${Date.now()}`,
      name: name.trim(),
      title: title.trim() || "職員",
      dept: dept.trim(),
      email: email.trim(),
    });
    onClose();
  }

  return (
    <>
      <SheetHeader
        title={isNew ? "職員を追加" : "職員を編集"}
        onClose={onClose}
        right={
          <button
            onClick={save}
            disabled={!canSave}
            className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          >
            保存
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <Label>氏名</Label>
        <Input value={name} onChange={setName} placeholder="例:谷本 拓海" />

        <Label>役職</Label>
        <Input value={title} onChange={setTitle} placeholder="例:室長 / 係長 / 主事" />

        <Label>所属課</Label>
        <Input value={dept} onChange={setDept} placeholder="例:企画課" />

        <Label>メールアドレス</Label>
        <Input
          value={email}
          onChange={setEmail}
          placeholder="example@town.example.jp"
        />

        {!isNew && staff && (
          <div className="mt-8 border-t border-slate-100 pt-4">
            <button
              onClick={() => {
                if (confirm(`${staff.name} を削除しますか?`)) {
                  removeStaff(staff.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              この職員を削除
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function AssignEditSheet({
  staffId,
  onClose,
}: {
  staffId: string;
  onClose: () => void;
}) {
  const { members, staff, assignments, setAssignment } = useApp();
  const target = staff.find((s) => s.id === staffId);
  const [local, setLocal] = React.useState<string[]>(assignments[staffId] ?? []);

  function toggle(id: string) {
    setLocal((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  return (
    <>
      <SheetHeader
        title={`${target?.name ?? ""} の担当隊員`}
        onClose={onClose}
        right={
          <button
            onClick={() => {
              setAssignment(staffId, local);
              onClose();
            }}
            className="text-[11px] font-bold text-slate-900 hover:underline"
          >
            保存
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <p className="text-[11px] text-slate-500">
          チェックを入れた隊員がこの職員の管轄になります。{local.length} / {members.length} 名
        </p>
        <ul className="mt-3 space-y-px">
          {members.map((m) => {
            const on = local.includes(m.id);
            return (
              <li key={m.id}>
                <button
                  onClick={() => toggle(m.id)}
                  className="flex w-full items-center gap-3 border-b border-slate-100 py-2.5 text-left hover:bg-slate-50"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      on
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                  <div className="flex-1">
                    <div className="text-[13px] text-slate-800">{m.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {m.role} ・ {m.term}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 first:mt-0">
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
    />
  );
}

/* -------------------- 招待タブ (#63) -------------------- */

type InviteResult = { token: string; url: string; expiresAt: string };

function InviteTab() {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<string>("member");
  const [municipalityName, setMunicipalityName] = React.useState("新温泉町");
  const [result, setResult] = React.useState<InviteResult | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = !!email.trim() && !!name.trim();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiPost<InviteResult>("/api/admin/invites", {
        email: email.trim(),
        name: name.trim(),
        role,
        municipalityName: municipalityName.trim(),
      });
      setResult(res);
    } catch {
      setError("招待リンクの生成に失敗しました");
    } finally {
      setSending(false);
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const ROLES = [
    { value: "member", label: "協力隊員" },
    { value: "manager", label: "役場職員" },
    { value: "admin", label: "管理者" },
  ];

  return (
    <div className="max-w-lg">
      <h2 className="mb-1 text-[17px] font-bold text-slate-900">招待リンクを発行</h2>
      <p className="mb-5 text-[13px] text-slate-500">
        発行したリンクを招待したい相手に共有してください。リンクは 7 日間有効で、1 回のみ使用できます。
        登録後すぐにログインできるよう、招待時にアカウントを準備します。
      </p>

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-slate-700 mb-1">氏名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例:谷本 拓海"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[14px] focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-slate-700 mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="招待先のメールアドレス(登録時に固定されます)"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[14px] focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-slate-700 mb-1">ロール</label>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${role === r.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-slate-700 mb-1">自治体名</label>
          <input
            type="text"
            value={municipalityName}
            onChange={(e) => setMunicipalityName(e.target.value)}
            placeholder="新温泉町"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[14px] focus:border-slate-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !canSubmit}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" />
          {sending ? "生成中…" : "招待リンクを生成"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-2 text-[13px] font-semibold text-emerald-800">招待リンクが生成されました</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[12px] text-slate-700">
              {result.url}
            </code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-[13px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : "コピー"}
            </button>
          </div>
          <p className="mt-2 text-[12px] text-emerald-600">
            有効期限: {new Date(result.expiresAt).toLocaleString("ja-JP")}
          </p>
        </div>
      )}
    </div>
  );
}
