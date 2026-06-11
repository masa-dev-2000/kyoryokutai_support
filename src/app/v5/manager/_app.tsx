"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Receipt,
  FileText,
  Settings as SettingsIcon,
  Send,
  Check,
} from "lucide-react";

/* ============================================================
   v5 役場アプリ ─ 検索エンジン型・3 機能(承認 / 月報 / お知らせ)
   方針:
   - 隊員側と同じ質感(白基調 + slate アクセント)
   - 1 viewport で完結
   - 管轄設定はフッタ「設定」に隠す(初回・異動時のみ)
   - お知らせは一斉送信デフォルト
   ============================================================ */

type Tab = "approve" | "report" | "notice";

export function ManagerApp() {
  const [tab, setTab] = React.useState<Tab>("approve");
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <main className="flex h-screen flex-col bg-white text-slate-900">
      <Header />
      <Tabs active={tab} onChange={setTab} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-3xl">
          {tab === "approve" && <ApproveTab />}
          {tab === "report" && <ReportTab />}
          {tab === "notice" && <NoticeTab />}
        </div>
      </div>

      <Footer onSettings={() => setSettingsOpen(true)} />
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </main>
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
        谷本 室長 / 新温泉町 / 企画課
      </div>
      <span className="whitespace-nowrap text-[11px] text-slate-400">担当 5 名</span>
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
      <TabBtn
        label="承認"
        badge={3}
        active={active === "approve"}
        onClick={() => onChange("approve")}
      />
      <TabBtn
        label="月報"
        active={active === "report"}
        onClick={() => onChange("report")}
      />
      <TabBtn
        label="お知らせ"
        active={active === "notice"}
        onClick={() => onChange("notice")}
      />
    </nav>
  );
}

function TabBtn({
  label,
  badge,
  active,
  onClick,
}: {
  label: string;
  badge?: number;
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
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
      {active && (
        <span className="absolute bottom-[-7px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-slate-900" />
      )}
    </button>
  );
}

function Footer({ onSettings }: { onSettings: () => void }) {
  return (
    <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400">
      <span>地域おこし協力隊サポートシステム ・ v5 lab</span>
      <button
        onClick={onSettings}
        className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-900"
      >
        <SettingsIcon className="h-3 w-3" />
        設定
      </button>
    </footer>
  );
}

/* -------------------- 1. 承認タブ -------------------- */

type Approval = {
  id: string;
  kind: "経費" | "月次報告" | "活動相談";
  member: string;
  title: string;
  ai: string;
  citations: number;
  verdict: "approve" | "review";
};

const approvals: Approval[] = [
  {
    id: "a1",
    kind: "活動相談",
    member: "田中 あかり",
    title: "古民家コワーキング試作の活動費利用",
    ai: "JOIN Q&A 引用あり / 海士町に類似事例 / スモールスタート案",
    citations: 2,
    verdict: "approve",
  },
  {
    id: "a2",
    kind: "月次報告",
    member: "佐藤 美咲",
    title: "2026 年 5 月 月次報告(AI 生成)",
    ai: "活動 23 件から自動生成 / 住民広報文も併記",
    citations: 0,
    verdict: "approve",
  },
  {
    id: "a3",
    kind: "経費",
    member: "山本 健一",
    title: "島根県視察 ¥38,400",
    ai: "ガードレール検知:県外出張は事前承認が必要",
    citations: 1,
    verdict: "review",
  },
];

function ApproveTab() {
  const [q, setQ] = React.useState("");
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">承認</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        AI が判定材料を整えました。承認するだけ。
      </p>

      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="種別 / 隊員 / 期間で絞る"
      />

      <ul className="mt-5 space-y-px text-left">
        {approvals.map((a) => (
          <ApprovalRow key={a.id} approval={a} />
        ))}
      </ul>
    </div>
  );
}

function ApprovalRow({ approval }: { approval: Approval }) {
  const isApprove = approval.verdict === "approve";
  return (
    <li className="border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {approval.kind}
            </span>
            <span className="text-[10px] text-slate-500">{approval.member}</span>
          </div>
          <div className="mt-1 text-[13px] font-semibold text-slate-900">
            {approval.title}
          </div>
          <div className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-600">
            <Bot className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <span className="leading-snug">
              {approval.ai}
              {approval.citations > 0 && (
                <span className="ml-1 text-slate-400">
                  ・引用 {approval.citations} 件
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-1">
          <button className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-500">
            詳細
          </button>
          <button
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-white ${
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isApprove ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                承認
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                確認
              </>
            )}
          </button>
        </div>
      </div>
    </li>
  );
}

/* -------------------- 2. 月報タブ(担当隊員グリッド) -------------------- */

type MemberStatus = "submitted" | "approved" | "draft" | "none";

const memberRoster: {
  name: string;
  initials: string;
  role: string;
  status: MemberStatus;
}[] = [
  { name: "田中 あかり", initials: "あか", role: "移住促進", status: "submitted" },
  { name: "山本 健一", initials: "健", role: "農業支援", status: "draft" },
  { name: "佐藤 美咲", initials: "美", role: "観光", status: "approved" },
  { name: "鈴木 悠人", initials: "悠", role: "教育", status: "none" },
  { name: "高橋 大輔", initials: "大", role: "DX", status: "submitted" },
];

const statusMeta: Record<
  MemberStatus,
  { label: string; className: string }
> = {
  submitted: { label: "提出済", className: "border-amber-200 bg-amber-50 text-amber-800" },
  approved: { label: "承認済", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  draft: { label: "下書き", className: "border-sky-200 bg-sky-50 text-sky-800" },
  none: { label: "未着手", className: "border-slate-200 bg-slate-50 text-slate-500" },
};

function ReportTab() {
  const [q, setQ] = React.useState("");
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">月報</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        2026 年 6 月分 ・ 担当隊員 {memberRoster.length} 名の状況
      </p>

      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="月を指定 ・ 例:2026 年 6 月 / 隊員名"
      />

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {memberRoster.map((m) => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </div>
  );
}

function MemberCard({
  member,
}: {
  member: (typeof memberRoster)[number];
}) {
  const s = statusMeta[member.status];
  return (
    <button className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-center transition hover:border-slate-400 hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
        {member.initials}
      </div>
      <div className="text-[12px] font-bold text-slate-900">{member.name}</div>
      <div className="text-[10px] text-slate-500">{member.role}</div>
      <span
        className={`mt-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${s.className}`}
      >
        {s.label}
      </span>
    </button>
  );
}

/* -------------------- 3. お知らせタブ -------------------- */

const noticeHistory = [
  { id: "n1", title: "6 月例会の議題について", date: "6/5", read: "5 / 5" },
  { id: "n2", title: "夏季活動費の申請期限", date: "5/28", read: "4 / 5" },
  { id: "n3", title: "5 月度 月報提出のお願い", date: "5/24", read: "5 / 5" },
];

function NoticeTab() {
  const [body, setBody] = React.useState("");
  const [sent, setSent] = React.useState(false);

  function send() {
    if (!body.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setBody("");
    }, 1600);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
          <Check className="h-8 w-8" />
        </div>
        <div className="mt-4 text-[14px] font-bold text-slate-900">送信しました</div>
        <div className="mt-1 text-[11px] text-slate-500">
          担当隊員 5 名に通知が届きます
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">お知らせ</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        担当隊員 5 名に一斉配信(個別解除可)
      </p>

      <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-slate-300 bg-white p-3 transition focus-within:border-slate-900 focus-within:shadow-md">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="お知らせの内容を書く ・ 例:6 月例会は 13:30 から…"
          className="w-full resize-none bg-transparent text-[13px] placeholder-slate-400 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[10px] text-slate-500">
            送信先:<strong className="text-slate-700">担当 5 名 全員</strong>
            <button className="ml-1 underline underline-offset-2 hover:no-underline">
              変更
            </button>
          </div>
          <button
            onClick={send}
            disabled={!body.trim()}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send className="h-3 w-3" />
            送る
          </button>
        </div>
      </div>

      <div className="mt-6 text-left">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          直近の送信
        </div>
        <ul className="space-y-px">
          {noticeHistory.map((n) => (
            <li
              key={n.id}
              className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-slate-800">
                  {n.title}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  {n.date} ・ 既読 {n.read}
                </div>
              </div>
              <ArrowRight className="h-3 w-3 text-slate-300" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------- Reusable: SearchBox -------------------- */

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

/* -------------------- 設定パネル(管轄ほか) -------------------- */

const allMembers = [
  "田中 あかり",
  "山本 健一",
  "佐藤 美咲",
  "鈴木 悠人",
  "高橋 大輔",
  "中村 さくら",
  "藤井 翔太",
];

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = React.useState<string[]>(
    allMembers.slice(0, 5)
  );
  function toggle(name: string) {
    setSelected((s) =>
      s.includes(name) ? s.filter((n) => n !== name) : [...s, name]
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-2.5">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1 text-[12px] text-slate-700 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
          閉じる
        </button>
        <div className="text-[12px] font-semibold">設定</div>
        <button
          onClick={onClose}
          className="text-[11px] font-bold text-slate-700 hover:text-slate-900"
        >
          保存
        </button>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
          管轄する隊員
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">
          担当する協力隊員を選んでください。チェック済み {selected.length} 名。
        </p>

        <ul className="mt-3 space-y-px">
          {allMembers.map((m) => {
            const on = selected.includes(m);
            return (
              <li key={m}>
                <button
                  onClick={() => toggle(m)}
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
                  <span className="text-[13px] text-slate-800">{m}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 text-[10px] text-slate-400">
          ※ 通知先メールアドレス・ガードレールルール集の編集は本機能に追加予定。
        </div>
      </div>
    </div>
  );
}
