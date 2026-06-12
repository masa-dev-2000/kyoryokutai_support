"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  X,
  ArrowRight,
  Plus,
  Check,
  UserCog,
  Trash2,
} from "lucide-react";

/* ============================================================
   v5 管理者アプリ ─ 検索エンジン型・3 機能
   1. 隊員台帳: 隊員の追加・編集・退任管理
   2. 職員: 役場側ユーザー(承認権限を持つ職員)
   3. 担当割当: 職員 × 隊員 のマトリクス
   ============================================================ */

type Tab = "members" | "staff" | "assignments";

type Member = {
  id: string;
  name: string;
  role: string;
  startedAt: string;
  term: string;
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
  | null;

type Ctx = {
  members: Member[];
  staff: Staff[];
  assignments: Record<string, string[]>;
  upsertMember: (m: Member) => void;
  removeMember: (id: string) => void;
  upsertStaff: (s: Staff) => void;
  removeStaff: (id: string) => void;
  setAssignment: (staffId: string, memberIds: string[]) => void;
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
  const [sheet, setSheet] = React.useState<Sheet>(null);

  const ctx: Ctx = {
    members,
    staff,
    assignments,
    upsertMember: (m) =>
      setMembers((ms) => {
        const idx = ms.findIndex((x) => x.id === m.id);
        if (idx < 0) return [...ms, m];
        const copy = [...ms];
        copy[idx] = m;
        return copy;
      }),
    removeMember: (id) => {
      setMembers((ms) => ms.filter((m) => m.id !== id));
      setAssignments((a) => {
        const copy: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(a)) copy[k] = v.filter((x) => x !== id);
        return copy;
      });
    },
    upsertStaff: (s) =>
      setStaff((ss) => {
        const idx = ss.findIndex((x) => x.id === s.id);
        if (idx < 0) {
          setAssignments((a) => ({ ...a, [s.id]: [] }));
          return [...ss, s];
        }
        const copy = [...ss];
        copy[idx] = s;
        return copy;
      }),
    removeStaff: (id) => {
      setStaff((ss) => ss.filter((s) => s.id !== id));
      setAssignments((a) => {
        const copy = { ...a };
        delete copy[id];
        return copy;
      });
    },
    setAssignment: (staffId, memberIds) =>
      setAssignments((a) => ({ ...a, [staffId]: memberIds })),
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
      <Link
        href="/v5"
        className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-3 w-3" />
        切替
      </Link>
      <div className="text-center text-[11px] text-slate-500">
        管理者 / 新温泉町
      </div>
      <span className="whitespace-nowrap text-[11px] text-slate-400">v5 admin</span>
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
    </div>
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
  const { upsertMember, removeMember } = useApp();
  const isNew = !member;
  const [name, setName] = React.useState(member?.name ?? "");
  const [role, setRole] = React.useState(member?.role ?? "");
  const [startedAt, setStartedAt] = React.useState(member?.startedAt ?? "");
  const [term, setTerm] = React.useState(member?.term ?? "1 年目");

  const canSave = name.trim() && role.trim();

  function save() {
    upsertMember({
      id: member?.id ?? `m${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      startedAt: startedAt.trim() || "未設定",
      term,
    });
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
