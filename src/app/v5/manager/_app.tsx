"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  X,
  ArrowRight,
  CheckCircle2,
  Bot,
  Settings as SettingsIcon,
  Send,
  Check,
  Quote,
} from "lucide-react";

/* ============================================================
   v5 役場アプリ ─ 検索エンジン型・3 機能(承認 / 月報 / お知らせ)
   v3 / 2026-06-11 ─ 整合性修正版

   修正内容(コードレビュー結果反映):
   #1 月報の月跨ぎ整合: 全タブで「2026 年 5 月分」に統一
   #2 デッドエンドボタン: 全ボタンに動作付与(承認/確認/詳細/カード/履歴)
   #3 検索ボックス: 承認・月報両方で実フィルタ動作
   #4 設定 ↔ 他画面連動: 管轄人数の共有 state 化
   #5 送信履歴反映: 送信後に履歴先頭に追加
   #6 verdict UX: 色分け削除、「AI 判定材料」表記のみで判定感を消す
   #7 月指定検索: ラベルと検索動作を一致
   ============================================================ */

const ALL_MEMBERS = [
  { name: "田中 あかり", initials: "あか", role: "移住促進" },
  { name: "山本 健一", initials: "健", role: "農業支援" },
  { name: "佐藤 美咲", initials: "美", role: "観光" },
  { name: "鈴木 悠人", initials: "悠", role: "教育" },
  { name: "高橋 大輔", initials: "大", role: "DX" },
  { name: "中村 さくら", initials: "さ", role: "起業支援" },
  { name: "藤井 翔太", initials: "翔", role: "林業" },
];

type Tab = "approve" | "report" | "notice";
type MemberStatus = "submitted" | "approved" | "draft" | "none";

type Approval = {
  id: string;
  kind: "経費" | "月次報告" | "活動相談";
  member: string;
  title: string;
  ai: string;
  citations: { source: string; quote: string }[];
};

type NoticeItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  targets: number;
  read: number;
};

const REPORT_MONTH = "2026 年 5 月";

const memberStatusMap: Record<string, MemberStatus> = {
  "田中 あかり": "submitted",
  "山本 健一": "draft",
  "佐藤 美咲": "approved",
  "鈴木 悠人": "none",
  "高橋 大輔": "submitted",
  "中村 さくら": "draft",
  "藤井 翔太": "approved",
};

const initialApprovals: Approval[] = [
  {
    id: "a1",
    kind: "活動相談",
    member: "田中 あかり",
    title: "古民家コワーキング試作の活動費利用",
    ai: "JOIN Q&A の「活動拠点としての賃借料は対象」に該当。海士町に類似事例あり。スモールスタート案を併記。",
    citations: [
      {
        source: "JOIN お役立ちツール Q&A",
        quote: "活動拠点として賃借する家屋の賃料は活動費の対象に含まれます。",
      },
      {
        source: "海士町 古民家コワーキング(2024)",
        quote: "週 1 地域開放日を条件に承認。月 4 万円まで。",
      },
    ],
  },
  {
    id: "a2",
    kind: "月次報告",
    member: "田中 あかり",
    title: `${REPORT_MONTH} 月次報告(AI 生成)`,
    ai: "活動 23 件から自動生成。住民広報文も併記。プロジェクト「空き家バンク立ち上げ」進捗 60%。",
    citations: [],
  },
  {
    id: "a3",
    kind: "月次報告",
    member: "高橋 大輔",
    title: `${REPORT_MONTH} 月次報告(AI 生成)`,
    ai: "活動 18 件から自動生成。DX 推進プロジェクト 2 件の進捗を集約。",
    citations: [],
  },
  {
    id: "a4",
    kind: "経費",
    member: "山本 健一",
    title: "島根県視察 ¥38,400",
    ai: "ガードレール:県外出張は事前承認が必要(本件は事後申請)。出張目的は隣県農業視察、目的妥当性は高。",
    citations: [
      {
        source: "新温泉町 活動費ガイドライン v2.1",
        quote: "県外出張は事前承認(町長決裁)必須。事後申請は理由書添付。",
      },
    ],
  },
];

const initialNotices: NoticeItem[] = [
  {
    id: "n1",
    title: "6 月例会の議題について",
    body: "6 月例会は 13:30 から、議題は空き家事業の進捗報告です。各自 5 分の持ち時間で。",
    date: "6/5",
    targets: 5,
    read: 5,
  },
  {
    id: "n2",
    title: "夏季活動費の申請期限",
    body: "夏季(7-9 月)の活動費申請は 6/20 まで。プロジェクト単位での起案を推奨。",
    date: "5/28",
    targets: 5,
    read: 4,
  },
  {
    id: "n3",
    title: "5 月度 月報提出のお願い",
    body: "5 月度の月報を 6/10 までに提出してください。AI 下書きでも構いません。",
    date: "5/24",
    targets: 5,
    read: 5,
  },
];

/* -------------------- 共有 Context -------------------- */

type Sheet =
  | { kind: "approval-detail"; approval: Approval }
  | { kind: "reject-comment"; approval: Approval }
  | { kind: "member-detail"; member: string }
  | { kind: "notice-targets" }
  | { kind: "notice-detail"; notice: NoticeItem }
  | { kind: "settings" }
  | null;

type Ctx = {
  managed: string[];
  setManaged: (m: string[]) => void;
  approvals: Approval[];
  approveOne: (id: string) => void;
  rejectOne: (id: string, comment: string) => void;
  notices: NoticeItem[];
  addNotice: (body: string, targets: number) => void;
  noticeTargets: string[];
  setNoticeTargets: (t: string[]) => void;
  sheet: Sheet;
  openSheet: (s: Sheet) => void;
};

const AppCtx = React.createContext<Ctx | null>(null);
const useApp = () => {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("AppCtx missing");
  return c;
};

export function ManagerApp() {
  const [tab, setTab] = React.useState<Tab>("approve");
  const [managed, setManaged] = React.useState<string[]>(
    ALL_MEMBERS.slice(0, 5).map((m) => m.name)
  );
  const [approvals, setApprovals] = React.useState<Approval[]>(initialApprovals);
  const [notices, setNotices] = React.useState<NoticeItem[]>(initialNotices);
  const [noticeTargets, setNoticeTargets] = React.useState<string[]>(
    ALL_MEMBERS.slice(0, 5).map((m) => m.name)
  );
  const [sheet, setSheet] = React.useState<Sheet>(null);

  React.useEffect(() => {
    setNoticeTargets((cur) => cur.filter((n) => managed.includes(n)));
  }, [managed]);

  const ctx: Ctx = {
    managed,
    setManaged,
    approvals,
    approveOne: (id) => setApprovals((a) => a.filter((x) => x.id !== id)),
    rejectOne: (id, _comment) => setApprovals((a) => a.filter((x) => x.id !== id)),
    notices,
    addNotice: (body, targets) =>
      setNotices((n) => [
        {
          id: String(Date.now()),
          title: body.slice(0, 24) || "(無題)",
          body,
          date: "今",
          targets,
          read: 0,
        },
        ...n,
      ]),
    noticeTargets,
    setNoticeTargets,
    sheet,
    openSheet: setSheet,
  };

  return (
    <AppCtx.Provider value={ctx}>
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

        <Footer />
        <SheetRoot />
      </main>
    </AppCtx.Provider>
  );
}

/* -------------------- Header / Tabs / Footer -------------------- */

function Header() {
  const { managed } = useApp();
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
      <span className="whitespace-nowrap text-[11px] text-slate-400">
        担当 {managed.length} 名
      </span>
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
  const { approvals } = useApp();
  return (
    <nav className="flex items-center justify-center gap-1 border-b border-slate-100 px-5 py-1.5">
      <TabBtn
        label="承認"
        badge={approvals.length}
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
        <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
      {active && (
        <span className="absolute bottom-[-7px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-slate-900" />
      )}
    </button>
  );
}

function Footer() {
  const { openSheet } = useApp();
  return (
    <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400">
      <span>地域おこし協力隊サポートシステム ・ v5 lab</span>
      <button
        onClick={() => openSheet({ kind: "settings" })}
        className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-900"
      >
        <SettingsIcon className="h-3 w-3" />
        設定
      </button>
    </footer>
  );
}

/* -------------------- 1. 承認タブ -------------------- */

function ApproveTab() {
  const { approvals, approveOne, openSheet } = useApp();
  const [q, setQ] = React.useState("");

  const filtered = approvals.filter((a) => {
    if (!q.trim()) return true;
    const k = q.toLowerCase();
    return (
      a.kind.toLowerCase().includes(k) ||
      a.member.toLowerCase().includes(k) ||
      a.title.toLowerCase().includes(k)
    );
  });

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">承認</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        AI が判定材料を整えました。中身を確認して、承認するだけ。
      </p>

      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="種別 / 隊員 / タイトルで絞る"
      />

      {filtered.length === 0 ? (
        <EmptyState
          message={
            approvals.length === 0
              ? "未承認はありません。お疲れさまでした。"
              : "条件に合うものがありません。"
          }
        />
      ) : (
        <ul className="mt-5 space-y-px text-left">
          {filtered.map((a) => (
            <li
              key={a.id}
              className="border-b border-slate-100 py-3 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {a.kind}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {a.member}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-slate-900">
                    {a.title}
                  </div>
                  <div className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-600">
                    <Bot className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                    <span className="leading-snug">
                      {a.ai}
                      {a.citations.length > 0 && (
                        <span className="ml-1 text-slate-400">
                          ・引用 {a.citations.length} 件
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 pt-1">
                  <button
                    onClick={() =>
                      openSheet({ kind: "approval-detail", approval: a })
                    }
                    className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-500"
                  >
                    詳細
                  </button>
                  <button
                    onClick={() =>
                      openSheet({ kind: "reject-comment", approval: a })
                    }
                    className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-500"
                  >
                    差戻し
                  </button>
                  <button
                    onClick={() => approveOne(a.id)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    承認
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------- 2. 月報タブ -------------------- */

const statusMeta: Record<MemberStatus, { label: string; className: string }> = {
  submitted: {
    label: "提出済",
    className: "border-slate-300 bg-slate-50 text-slate-700",
  },
  approved: {
    label: "承認済",
    className: "border-slate-300 bg-slate-900 text-white",
  },
  draft: {
    label: "下書き",
    className: "border-slate-200 bg-white text-slate-500",
  },
  none: {
    label: "未着手",
    className: "border-slate-200 bg-white text-slate-400",
  },
};

function ReportTab() {
  const { managed, openSheet } = useApp();
  const [q, setQ] = React.useState("");

  const roster = ALL_MEMBERS.filter((m) => managed.includes(m.name));
  const filtered = roster.filter((m) =>
    q.trim() ? m.name.includes(q) || m.role.includes(q) : true
  );

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">月報</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        {REPORT_MONTH}分 ・ 担当隊員 {managed.length} 名の状況
      </p>

      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="隊員名・役割で絞る"
      />

      {filtered.length === 0 ? (
        <EmptyState message="条件に合う隊員がいません。" />
      ) : (
        <div
          className="mt-5 grid gap-2"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(120px, 1fr))",
          }}
        >
          {filtered.map((m) => {
            const status = memberStatusMap[m.name] ?? "none";
            const s = statusMeta[status];
            return (
              <button
                key={m.name}
                onClick={() =>
                  openSheet({ kind: "member-detail", member: m.name })
                }
                className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-center transition hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                  {m.initials}
                </div>
                <div className="text-[12px] font-bold text-slate-900">
                  {m.name}
                </div>
                <div className="text-[10px] text-slate-500">{m.role}</div>
                <span
                  className={`mt-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${s.className}`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------- 3. お知らせタブ -------------------- */

function NoticeTab() {
  const { managed, notices, addNotice, openSheet, noticeTargets } = useApp();
  const [body, setBody] = React.useState("");
  const [sent, setSent] = React.useState(false);

  function send() {
    if (!body.trim()) return;
    addNotice(body.trim(), noticeTargets.length);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setBody("");
    }, 1600);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow">
          <Check className="h-8 w-8" />
        </div>
        <div className="mt-4 text-[14px] font-bold text-slate-900">
          送信しました
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          {noticeTargets.length} 名に通知が届きます
        </div>
      </div>
    );
  }

  const isAll = noticeTargets.length === managed.length;

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">お知らせ</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        担当隊員 {managed.length} 名に一斉配信(個別解除可)
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
            送信先:
            <strong className="text-slate-700">
              {isAll
                ? `担当 ${managed.length} 名 全員`
                : `${noticeTargets.length} 名`}
            </strong>
            <button
              onClick={() => openSheet({ kind: "notice-targets" })}
              className="ml-1 underline underline-offset-2 hover:no-underline"
            >
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
          {notices.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => openSheet({ kind: "notice-detail", notice: n })}
                className="flex w-full items-center gap-3 border-b border-slate-100 py-2 text-left last:border-b-0 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-slate-800">
                    {n.title}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">
                    {n.date} ・ 既読 {n.read} / {n.targets}
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
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
    <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-[12px] text-slate-500">
      {message}
    </div>
  );
}

/* -------------------- Sheet (全画面パネル) -------------------- */

function SheetRoot() {
  const { sheet, openSheet } = useApp();
  if (!sheet) return null;
  const close = () => openSheet(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {sheet.kind === "approval-detail" && (
        <ApprovalDetailSheet approval={sheet.approval} onClose={close} />
      )}
      {sheet.kind === "reject-comment" && (
        <RejectSheet approval={sheet.approval} onClose={close} />
      )}
      {sheet.kind === "member-detail" && (
        <MemberDetailSheet name={sheet.member} onClose={close} />
      )}
      {sheet.kind === "notice-targets" && <TargetsSheet onClose={close} />}
      {sheet.kind === "notice-detail" && (
        <NoticeDetailSheet notice={sheet.notice} onClose={close} />
      )}
      {sheet.kind === "settings" && <SettingsSheet onClose={close} />}
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

function ApprovalDetailSheet({
  approval,
  onClose,
}: {
  approval: Approval;
  onClose: () => void;
}) {
  const { approveOne, openSheet } = useApp();
  return (
    <>
      <SheetHeader title={`${approval.kind} ・ ${approval.member}`} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">{approval.title}</h1>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Bot className="h-3 w-3" />
            AI 判定材料
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-800">
            {approval.ai}
          </p>
          <div className="mt-1 text-[10px] text-slate-400">
            ※ AI は判定しません。視点と材料のみ提供します。
          </div>
        </div>

        {approval.citations.length > 0 && (
          <>
            <div className="mt-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              引用 {approval.citations.length} 件
            </div>
            <ul className="mt-2 space-y-2">
              {approval.citations.map((c, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="text-[11px] font-semibold text-slate-700">
                    {c.source}
                  </div>
                  <div className="mt-1 flex items-start gap-1.5 text-[12px] text-slate-600">
                    <Quote className="mt-0.5 h-3 w-3 shrink-0 text-slate-300" />
                    <span className="leading-snug">{c.quote}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          <button
            onClick={() => openSheet({ kind: "reject-comment", approval })}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500"
          >
            差戻し
          </button>
          <button
            onClick={() => {
              approveOne(approval.id);
              onClose();
            }}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            承認する
          </button>
        </div>
      </div>
    </>
  );
}

function RejectSheet({
  approval,
  onClose,
}: {
  approval: Approval;
  onClose: () => void;
}) {
  const { rejectOne } = useApp();
  const [comment, setComment] = React.useState("");
  const canSend = comment.trim().length >= 5;

  return (
    <>
      <SheetHeader title="差戻し" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="text-[11px] text-slate-500">
          {approval.kind} ・ {approval.member}
        </div>
        <h1 className="mt-1 text-lg font-bold tracking-tight">{approval.title}</h1>

        <div className="mt-5 text-[12px] font-bold text-slate-700">
          差戻し理由 <span className="text-rose-600">必須</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          隊員に何を直してほしいか具体的に。5 文字以上。
        </p>
        <textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="例:県外出張の事前承認が抜けています。理由書を添付し再申請してください。"
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />
      </div>
      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500"
          >
            やめる
          </button>
          <button
            onClick={() => {
              rejectOne(approval.id, comment);
              onClose();
            }}
            disabled={!canSend}
            className="rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            差戻す
          </button>
        </div>
      </div>
    </>
  );
}

function MemberDetailSheet({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  const member = ALL_MEMBERS.find((m) => m.name === name);
  const status = memberStatusMap[name] ?? "none";
  const s = statusMeta[status];

  const recent = [
    { date: "5/30", text: "空き家 A 邸 内覧、家族 4 人と現地調整。" },
    { date: "5/28", text: "観光協会 月例会(13:30〜)。" },
    { date: "5/25", text: "名古屋ファミリー Web 会議(60 分)。" },
  ];

  return (
    <>
      <SheetHeader
        title={`隊員詳細 ・ ${member?.role ?? ""}`}
        onClose={onClose}
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-[14px] font-bold text-slate-700 ring-1 ring-slate-200">
            {member?.initials}
          </div>
          <div>
            <div className="text-lg font-bold">{name}</div>
            <div className="text-[11px] text-slate-500">
              {member?.role} ・ {REPORT_MONTH}
            </div>
          </div>
          <span
            className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.className}`}
          >
            {s.label}
          </span>
        </div>

        <div className="mt-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {REPORT_MONTH} の活動(直近 3 件)
        </div>
        <ul className="mt-1 space-y-px">
          {recent.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-3 border-b border-slate-100 py-2.5 last:border-b-0"
            >
              <span className="shrink-0 text-[10px] font-bold text-slate-400">
                {r.date}
              </span>
              <span className="text-[12px] text-slate-700">{r.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          月報
        </div>
        <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-[12px] text-slate-600">
          {status === "approved" &&
            `${REPORT_MONTH} 月報は承認済みです。`}
          {status === "submitted" &&
            `${REPORT_MONTH} 月報は提出されています。承認タブから処理してください。`}
          {status === "draft" &&
            `${REPORT_MONTH} 月報は下書き中です。隊員にお声がけください。`}
          {status === "none" &&
            `${REPORT_MONTH} の月報はまだ着手されていません。`}
        </div>
      </div>
    </>
  );
}

function TargetsSheet({ onClose }: { onClose: () => void }) {
  const { managed, noticeTargets, setNoticeTargets } = useApp();
  const [local, setLocal] = React.useState<string[]>(
    noticeTargets.length ? noticeTargets : managed
  );

  function toggle(name: string) {
    setLocal((s) =>
      s.includes(name) ? s.filter((n) => n !== name) : [...s, name]
    );
  }

  return (
    <>
      <SheetHeader
        title="送信先を選ぶ"
        onClose={onClose}
        right={
          <button
            onClick={() => {
              setNoticeTargets(local);
              onClose();
            }}
            className="text-[11px] font-bold text-slate-900 hover:underline"
          >
            OK
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <p className="text-[11px] text-slate-500">
          チェック済み {local.length} / {managed.length} 名
        </p>
        <ul className="mt-3 space-y-px">
          {managed.map((m) => {
            const on = local.includes(m);
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
      </div>
    </>
  );
}

function NoticeDetailSheet({
  notice,
  onClose,
}: {
  notice: NoticeItem;
  onClose: () => void;
}) {
  return (
    <>
      <SheetHeader title="お知らせ" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">{notice.title}</h1>
        <div className="mt-1 text-[11px] text-slate-500">
          {notice.date} ・ 既読 {notice.read} / {notice.targets}
        </div>
        <div className="mt-5 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800">
          {notice.body}
        </div>
      </div>
    </>
  );
}

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { managed, setManaged } = useApp();
  const [local, setLocal] = React.useState<string[]>(managed);

  function toggle(name: string) {
    setLocal((s) =>
      s.includes(name) ? s.filter((n) => n !== name) : [...s, name]
    );
  }

  return (
    <>
      <SheetHeader
        title="設定"
        onClose={onClose}
        right={
          <button
            onClick={() => {
              setManaged(local);
              onClose();
            }}
            className="text-[11px] font-bold text-slate-900 hover:underline"
          >
            保存
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
          管轄する隊員
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">
          担当する協力隊員を選んでください。チェック済み {local.length} 名。
        </p>

        <ul className="mt-3 space-y-px">
          {ALL_MEMBERS.map((m) => {
            const on = local.includes(m.name);
            return (
              <li key={m.name}>
                <button
                  onClick={() => toggle(m.name)}
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
                    <div className="text-[10px] text-slate-500">{m.role}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 text-[10px] text-slate-400">
          ※ 通知先メールアドレス・ガードレールルール集の編集は本機能に追加予定。
        </div>
      </div>
    </>
  );
}
