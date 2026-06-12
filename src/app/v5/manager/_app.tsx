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
  FileText,
  Clock,
  Wallet,
  Target,
  AlertCircle,
  CalendarDays,
  Receipt,
} from "lucide-react";

/* ============================================================
   v5 役場アプリ ─ 検索エンジン型・3 機能(承認 / 月報 / お知らせ)
   2026-06-12 改修:
   - 承認詳細にモック詳細を充足(活動相談/月次報告/経費 別レイアウト)
   - 月報タブに月選択(過去月閲覧)
   - 隊員カードクリックで月報詳細(カレンダー + サマリ + グラフ)
   - 「活動相談」「経費」の違いを画面で明示
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

type ConsultDetail = {
  kind: "活動相談";
  goal: string;
  background: string;
  plan: string;
  kpi: string;
  period: string;
  budget: string;
  risk: string;
};
type ReportDetail = {
  kind: "月次報告";
  ym: string; // YYYY-MM
  summary: string;
  sections: { title: string; body: string }[];
};
type ExpenseDetail = {
  kind: "経費";
  purpose: string;
  amount: number;
  payee: string;
  paidDate: string;
  receipt: boolean;
};

type Approval = {
  id: string;
  kind: "経費" | "月次報告" | "活動相談";
  member: string;
  title: string;
  ai: string;
  citations: { source: string; quote: string }[];
  detail: ConsultDetail | ReportDetail | ExpenseDetail;
};

type NoticeItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  targets: number;
  read: number;
};

/* -------------------- 月別ステータス -------------------- */

const AVAILABLE_MONTHS = [
  { id: "2026-04", label: "2026 年 4 月" },
  { id: "2026-05", label: "2026 年 5 月" },
  { id: "2026-06", label: "2026 年 6 月" },
];

const monthlyStatusMap: Record<string, Record<string, MemberStatus>> = {
  "2026-04": {
    "田中 あかり": "approved",
    "山本 健一": "approved",
    "佐藤 美咲": "approved",
    "鈴木 悠人": "approved",
    "高橋 大輔": "approved",
    "中村 さくら": "approved",
    "藤井 翔太": "approved",
  },
  "2026-05": {
    "田中 あかり": "submitted",
    "山本 健一": "draft",
    "佐藤 美咲": "approved",
    "鈴木 悠人": "none",
    "高橋 大輔": "submitted",
    "中村 さくら": "draft",
    "藤井 翔太": "approved",
  },
  "2026-06": {
    "田中 あかり": "draft",
    "山本 健一": "draft",
    "佐藤 美咲": "draft",
    "鈴木 悠人": "draft",
    "高橋 大輔": "draft",
    "中村 さくら": "none",
    "藤井 翔太": "draft",
  },
};

/* -------------------- 活動ログ(月報詳細用)-------------------- */

type ActivityLog = {
  date: string;
  type: string;
  topic: string;
  hours: number;
  body: string;
  expense?: number;
};

const memberLogs: Record<string, ActivityLog[]> = {
  "田中 あかり": [
    { date: "2026-05-02", type: "現場訪問", topic: "空き家", hours: 2, body: "A 邸 内覧、家族 4 人と現地調整。" },
    { date: "2026-05-04", type: "会議", topic: "移住相談", hours: 1.5, body: "GW 体験ツアー振り返り MTG。" },
    { date: "2026-05-07", type: "広報", topic: "町報", hours: 3, body: "町報 6 月号 編集作業。" },
    { date: "2026-05-10", type: "会議", topic: "観光協会", hours: 2, body: "観光協会 連携協議。" },
    { date: "2026-05-12", type: "イベント", topic: "夏祭り", hours: 4, body: "夏祭り実行委員会。", expense: 1200 },
    { date: "2026-05-15", type: "現場訪問", topic: "空き家", hours: 1.5, body: "B 邸 所有者打合せ。" },
    { date: "2026-05-18", type: "出張", topic: "移住相談", hours: 6, body: "大阪移住相談会出展。", expense: 22000 },
    { date: "2026-05-20", type: "会議", topic: "観光協会", hours: 1, body: "観光協会 連携協定締結会。" },
    { date: "2026-05-22", type: "現場訪問", topic: "空き家", hours: 2, body: "C 邸 解体相談 現地確認。" },
    { date: "2026-05-25", type: "内勤", topic: "町報", hours: 2, body: "町報印刷費精算。", expense: 12800 },
    { date: "2026-05-28", type: "現場訪問", topic: "空き家", hours: 1.5, body: "D 邸 内覧 2 回目。" },
    { date: "2026-05-30", type: "振り返り", topic: "移住相談", hours: 1, body: "5 月度振り返り。" },
  ],
  "高橋 大輔": [
    { date: "2026-05-06", type: "内勤", topic: "DX", hours: 4, body: "業務 DX 設計書作成。" },
    { date: "2026-05-13", type: "会議", topic: "DX", hours: 2, body: "kintone 設定相談会。" },
    { date: "2026-05-20", type: "現場訪問", topic: "DX", hours: 3, body: "観光協会 DX ヒアリング。" },
    { date: "2026-05-27", type: "イベント", topic: "DX", hours: 5, body: "町民 IT 勉強会開催。", expense: 8000 },
  ],
  "山本 健一": [
    { date: "2026-05-05", type: "現場訪問", topic: "農業", hours: 4, body: "農家ヒアリング。" },
    { date: "2026-05-15", type: "出張", topic: "農業", hours: 6, body: "島根県視察。", expense: 38400 },
  ],
  "佐藤 美咲": [
    { date: "2026-05-08", type: "会議", topic: "観光", hours: 2, body: "観光協会 月例会。" },
    { date: "2026-05-18", type: "イベント", topic: "観光", hours: 5, body: "観光イベント企画。" },
    { date: "2026-05-25", type: "広報", topic: "観光", hours: 3, body: "観光パンフレット作成。" },
  ],
};

const initialNotices: NoticeItem[] = [
  { id: "n1", title: "6 月例会の議題について", body: "6 月例会は 13:30 から、議題は空き家事業の進捗報告です。各自 5 分の持ち時間で。", date: "6/5", targets: 5, read: 5 },
  { id: "n2", title: "夏季活動費の申請期限", body: "夏季(7-9 月)の活動費申請は 6/20 まで。プロジェクト単位での起案を推奨。", date: "5/28", targets: 5, read: 4 },
  { id: "n3", title: "5 月度 月報提出のお願い", body: "5 月度の月報を 6/10 までに提出してください。AI 下書きでも構いません。", date: "5/24", targets: 5, read: 5 },
];

const initialApprovals: Approval[] = [
  {
    id: "a1",
    kind: "活動相談",
    member: "田中 あかり",
    title: "古民家コワーキング試作の活動費利用",
    ai: "JOIN Q&A の「活動拠点としての賃借料は対象」に該当。海士町に類似事例。スモールスタート案を併記。",
    citations: [
      { source: "JOIN お役立ちツール Q&A", quote: "活動拠点として賃借する家屋の賃料は活動費の対象に含まれます。" },
      { source: "海士町 古民家コワーキング(2024)", quote: "週 1 地域開放日を条件に承認。月 4 万円まで。" },
    ],
    detail: {
      kind: "活動相談",
      goal: "町内に協力隊・移住者・地元住民が混ざる「滞在型の作業拠点」を作り、移住前の体験から定住までの導線をつくる。",
      background: "A 邸の所有者から「使ってくれるなら賃料は月 5 万円で構わない」と提案あり。築 80 年だが構造良好、改修は最小限で済む見込み。",
      plan: "Phase 1(7-9 月):週 2 日の試験運営、利用者の声を集める\nPhase 2(10-12 月):週 4 日に拡張、地域開放日を月 1 から月 2 に\nPhase 3(2027 年 1 月-):有償化の可能性を検討",
      kpi: "・移住相談件数 月 5 件以上\n・地元住民の利用 月 10 名以上\n・体験滞在からの移住転換 年 2 家族",
      period: "2026-07-01 〜 2027-03-31(9 ヶ月)",
      budget: "賃料 月 5 万円 × 9 ヶ月 = 45 万円\n備品 5 万円(机・椅子等)\n光熱費 月 1 万円 × 9 ヶ月 = 9 万円\n合計 59 万円",
      risk: "・想定利用者が集まらない場合は月次でレビューし、Phase 1 で撤退判断\n・近隣住民との関係:着任前に説明会を開催",
    },
  },
  {
    id: "a2",
    kind: "月次報告",
    member: "田中 あかり",
    title: "2026 年 5 月 月次報告(AI 生成)",
    ai: "活動 12 件・24.5 時間 から自動生成。住民広報文も併記。プロジェクト「空き家バンク立ち上げ」進捗 60%。",
    citations: [],
    detail: {
      kind: "月次報告",
      ym: "2026-05",
      summary: "GW を活用した移住体験ツアーを 4/29-5/1 で実施。延べ 4 家族 13 名参加。事後アンケートで満足度 4.6/5。観光協会との連携協定 5/20 締結。",
      sections: [
        { title: "活動サマリ", body: "GW 移住体験ツアー実施。観光協会連携協定締結。空き家 B/C/D 邸対応。" },
        { title: "個別活動の詳細", body: "・移住体験ツアー:4 家族 13 名、3 日間\n・観光協会 連携協定:5/20 締結\n・空き家:B 邸内覧、C 邸解体相談、D 邸内覧 2 回" },
        { title: "成果物", body: "移住体験ツアー報告書\n観光協会連携協定書\nC 邸解体スキーム案" },
        { title: "来月計画", body: "・空き家バンク本格稼働\n・移住相談プロセスの標準化" },
        { title: "所感・課題", body: "ツアー参加者の満足度は高かったが、現地での移動手段に課題。レンタカー手配のサポートが必要。" },
      ],
    },
  },
  {
    id: "a3",
    kind: "月次報告",
    member: "高橋 大輔",
    title: "2026 年 5 月 月次報告(AI 生成)",
    ai: "活動 4 件・14 時間 から自動生成。DX 推進プロジェクト 2 件の進捗を集約。",
    citations: [],
    detail: {
      kind: "月次報告",
      ym: "2026-05",
      summary: "業務 DX 設計書を完成、kintone 設定相談会を開催。観光協会のヒアリング実施。町民 IT 勉強会を初開催し 18 名参加。",
      sections: [
        { title: "活動サマリ", body: "DX 設計書完成 / kintone 設定相談会 / 観光協会 DX ヒアリング / 町民 IT 勉強会(初開催)" },
        { title: "個別活動の詳細", body: "・業務 DX 設計書 v1.0 完成\n・kintone 設定相談会 2 回開催\n・観光協会 DX ヒアリング(代表理事と)\n・町民 IT 勉強会(参加 18 名)" },
        { title: "成果物", body: "業務 DX 設計書 v1.0\n町民 IT 勉強会 教材スライド" },
        { title: "来月計画", body: "・kintone 試験運用開始\n・町民 IT 勉強会 第 2 回(中級編)" },
        { title: "所感・課題", body: "町民 IT 勉強会の参加者層が想定より高齢。次回は教材難易度を調整する。" },
      ],
    },
  },
  {
    id: "a4",
    kind: "経費",
    member: "山本 健一",
    title: "島根県視察 ¥38,400",
    ai: "ガードレール:県外出張は事前承認が必要(本件は事後申請)。出張目的は隣県農業視察、目的妥当性は高。",
    citations: [
      { source: "新温泉町 活動費ガイドライン v2.1", quote: "県外出張は事前承認(町長決裁)必須。事後申請は理由書添付。" },
    ],
    detail: {
      kind: "経費",
      purpose: "島根県海士町の有機農業事例を視察。新温泉町の遊休農地活用に活かす。視察先:海士町 EAT 海士、隠岐國學習センター。",
      amount: 38400,
      payee: "本人立替(JR + 宿泊 + 視察先入場料)",
      paidDate: "2026-05-15",
      receipt: true,
    },
  },
];

/* -------------------- Sheet / Ctx -------------------- */

type Sheet =
  | { kind: "approval-detail"; approval: Approval }
  | { kind: "reject-comment"; approval: Approval }
  | { kind: "member-month-detail"; member: string; ym: string }
  | { kind: "report-day"; member: string; date: string }
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
        { id: String(Date.now()), title: body.slice(0, 24) || "(無題)", body, date: "今", targets, read: 0 },
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

        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8">
          <div className="mx-auto w-full max-w-3xl flex-1 py-4">
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
      <Link href="/v5" className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-3 w-3" />
        切替
      </Link>
      <div className="text-center text-[11px] text-slate-500">谷本 室長 / 新温泉町 / 企画課</div>
      <span className="whitespace-nowrap text-[11px] text-slate-400">担当 {managed.length} 名</span>
    </header>
  );
}

function Tabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { approvals } = useApp();
  return (
    <nav className="flex items-center justify-center gap-1 border-b border-slate-100 px-5 py-1.5">
      <TabBtn label="承認" badge={approvals.length} active={active === "approve"} onClick={() => onChange("approve")} />
      <TabBtn label="月報" active={active === "report"} onClick={() => onChange("report")} />
      <TabBtn label="お知らせ" active={active === "notice"} onClick={() => onChange("notice")} />
    </nav>
  );
}

function TabBtn({ label, badge, active, onClick }: { label: string; badge?: number; active: boolean; onClick: () => void }) {
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
      {active && <span className="absolute bottom-[-7px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-slate-900" />}
    </button>
  );
}

function Footer() {
  const { openSheet } = useApp();
  return (
    <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400">
      <span>地域おこし協力隊サポートシステム ・ v5 lab</span>
      <button onClick={() => openSheet({ kind: "settings" })} className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-900">
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
    return a.kind.toLowerCase().includes(k) || a.member.toLowerCase().includes(k) || a.title.toLowerCase().includes(k);
  });

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">承認</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        AI が判定材料を整えました。中身を確認して、承認するだけ。
      </p>
      <div className="mt-2 text-[10px] text-slate-400">
        <strong>活動相談</strong>=これから行う活動の事前承認 / <strong>経費</strong>=実支出の精算承認
      </div>

      <SearchBox value={q} onChange={setQ} placeholder="種別 / 隊員 / タイトルで絞る" />

      {filtered.length === 0 ? (
        <EmptyState message={approvals.length === 0 ? "未承認はありません。お疲れさまでした。" : "条件に合うものがありません。"} />
      ) : (
        <ul className="mt-5 space-y-px text-left">
          {filtered.map((a) => (
            <li key={a.id} className="border-b border-slate-100 py-3 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {a.kind}
                    </span>
                    <span className="text-[10px] text-slate-500">{a.member}</span>
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-slate-900">{a.title}</div>
                  <div className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-600">
                    <Bot className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                    <span className="leading-snug">
                      {a.ai}
                      {a.citations.length > 0 && (
                        <span className="ml-1 text-slate-400">・引用 {a.citations.length} 件</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 pt-1">
                  <button
                    onClick={() => openSheet({ kind: "approval-detail", approval: a })}
                    className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-500"
                  >
                    詳細
                  </button>
                  <button
                    onClick={() => openSheet({ kind: "reject-comment", approval: a })}
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

/* -------------------- 2. 月報タブ(月選択) -------------------- */

const statusMeta: Record<MemberStatus, { label: string; className: string }> = {
  submitted: { label: "提出済", className: "border-slate-300 bg-slate-50 text-slate-700" },
  approved: { label: "承認済", className: "border-slate-300 bg-slate-900 text-white" },
  draft: { label: "下書き", className: "border-slate-200 bg-white text-slate-500" },
  none: { label: "未着手", className: "border-slate-200 bg-white text-slate-400" },
};

function ReportTab() {
  const { managed, openSheet } = useApp();
  const [ym, setYm] = React.useState("2026-05");
  const [q, setQ] = React.useState("");

  const roster = ALL_MEMBERS.filter((m) => managed.includes(m.name));
  const filtered = roster.filter((m) => (q.trim() ? m.name.includes(q) || m.role.includes(q) : true));

  const idx = AVAILABLE_MONTHS.findIndex((m) => m.id === ym);
  const prevMonth = idx > 0 ? AVAILABLE_MONTHS[idx - 1] : null;
  const nextMonth = idx < AVAILABLE_MONTHS.length - 1 ? AVAILABLE_MONTHS[idx + 1] : null;
  const current = AVAILABLE_MONTHS[idx];
  const statusMap = monthlyStatusMap[ym] ?? {};

  // 月ごとの状況サマリ
  const counts: Record<MemberStatus, number> = { submitted: 0, approved: 0, draft: 0, none: 0 };
  for (const m of roster) counts[statusMap[m.name] ?? "none"]++;

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">月報</h1>
      <p className="mt-1 text-[12px] text-slate-500">担当隊員 {managed.length} 名の状況</p>

      {/* 月選択ナビ */}
      <div className="mx-auto mt-4 flex max-w-md items-center justify-between rounded-full border border-slate-200 bg-white px-2 py-1.5">
        <button
          onClick={() => prevMonth && setYm(prevMonth.id)}
          disabled={!prevMonth}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-[13px] font-bold text-slate-900">{current.label} 分</div>
        <button
          onClick={() => nextMonth && setYm(nextMonth.id)}
          disabled={!nextMonth}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>

      {/* サマリチップ */}
      <div className="mx-auto mt-3 flex max-w-md flex-wrap justify-center gap-1.5">
        {(["submitted", "approved", "draft", "none"] as MemberStatus[]).map((s) => (
          <span
            key={s}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusMeta[s].className}`}
          >
            {statusMeta[s].label} {counts[s]}
          </span>
        ))}
      </div>

      <SearchBox value={q} onChange={setQ} placeholder="隊員名・役割で絞る" />

      {filtered.length === 0 ? (
        <EmptyState message="条件に合う隊員がいません。" />
      ) : (
        <div
          className="mt-5 grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
        >
          {filtered.map((m) => {
            const status = statusMap[m.name] ?? "none";
            const s = statusMeta[status];
            return (
              <button
                key={m.name}
                onClick={() => openSheet({ kind: "member-month-detail", member: m.name, ym })}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-center transition hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                  {m.initials}
                </div>
                <div className="text-[12px] font-bold text-slate-900">{m.name}</div>
                <div className="text-[10px] text-slate-500">{m.role}</div>
                <span className={`mt-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${s.className}`}>
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
        <div className="mt-4 text-[14px] font-bold text-slate-900">送信しました</div>
        <div className="mt-1 text-[11px] text-slate-500">{noticeTargets.length} 名に通知が届きます</div>
      </div>
    );
  }

  const isAll = noticeTargets.length === managed.length;

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">お知らせ</h1>
      <p className="mt-1 text-[12px] text-slate-500">担当隊員 {managed.length} 名に一斉配信(個別解除可)</p>

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
            送信先:<strong className="text-slate-700">{isAll ? `担当 ${managed.length} 名 全員` : `${noticeTargets.length} 名`}</strong>
            <button onClick={() => openSheet({ kind: "notice-targets" })} className="ml-1 underline underline-offset-2 hover:no-underline">
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
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">直近の送信</div>
        <ul className="space-y-px">
          {notices.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => openSheet({ kind: "notice-detail", notice: n })}
                className="flex w-full items-center gap-3 border-b border-slate-100 py-2 text-left last:border-b-0 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-slate-800">{n.title}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{n.date} ・ 既読 {n.read} / {n.targets}</div>
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

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
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
        <button onClick={() => onChange("")} className="text-slate-400 hover:text-slate-600">
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 first:mt-0">
      {children}
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
      {sheet.kind === "approval-detail" && <ApprovalDetailSheet approval={sheet.approval} onClose={close} />}
      {sheet.kind === "reject-comment" && <RejectSheet approval={sheet.approval} onClose={close} />}
      {sheet.kind === "member-month-detail" && <MemberMonthSheet name={sheet.member} ym={sheet.ym} onClose={close} />}
      {sheet.kind === "report-day" && <ReportDaySheet name={sheet.member} date={sheet.date} onClose={close} />}
      {sheet.kind === "notice-targets" && <TargetsSheet onClose={close} />}
      {sheet.kind === "notice-detail" && <NoticeDetailSheet notice={sheet.notice} onClose={close} />}
      {sheet.kind === "settings" && <SettingsSheet onClose={close} />}
    </div>
  );
}

function SheetHeader({ title, onClose, right }: { title: string; onClose: () => void; right?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-5 py-2.5">
      <button onClick={onClose} className="inline-flex items-center gap-1 text-[12px] text-slate-700 hover:text-slate-900">
        <X className="h-4 w-4" />
        閉じる
      </button>
      <div className="text-[12px] font-semibold">{title}</div>
      <div className="min-w-12 text-right">{right}</div>
    </header>
  );
}

/* -------- 承認 詳細シート(kind 別に分岐) -------- */

function ApprovalDetailSheet({ approval, onClose }: { approval: Approval; onClose: () => void }) {
  const { approveOne, openSheet } = useApp();
  return (
    <>
      <SheetHeader title={`${approval.kind} ・ ${approval.member}`} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">{approval.title}</h1>

        {/* kind 別の詳細セクション */}
        {approval.detail.kind === "活動相談" && <ConsultDetailView d={approval.detail} />}
        {approval.detail.kind === "月次報告" && <ReportDetailView d={approval.detail} />}
        {approval.detail.kind === "経費" && <ExpenseDetailView d={approval.detail} />}

        {/* AI 判定材料 */}
        <Label>AI 判定材料</Label>
        <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
          <p className="text-[12px] leading-relaxed text-slate-800">{approval.ai}</p>
          <div className="mt-1 text-[10px] text-slate-400">
            ※ AI は判定しません。視点と材料のみ提供します。
          </div>
        </div>

        {approval.citations.length > 0 && (
          <>
            <Label>引用 {approval.citations.length} 件</Label>
            <ul className="mt-1 space-y-2">
              {approval.citations.map((c, i) => (
                <li key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold text-slate-700">{c.source}</div>
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

function ConsultDetailView({ d }: { d: ConsultDetail }) {
  return (
    <>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
        <Target className="h-3 w-3" />
        事前承認(これから行う活動)
      </div>

      <Label>目的・ゴール</Label>
      <Body>{d.goal}</Body>

      <Label>背景</Label>
      <Body>{d.background}</Body>

      <Label>実施計画</Label>
      <Body multiline>{d.plan}</Body>

      <Label>KPI</Label>
      <Body multiline>{d.kpi}</Body>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <CalendarDays className="h-3 w-3" />
            期間
          </div>
          <div className="mt-1 text-[12px] text-slate-800">{d.period}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Wallet className="h-3 w-3" />
            予算
          </div>
          <div className="mt-1 whitespace-pre-wrap text-[12px] text-slate-800">{d.budget}</div>
        </div>
      </div>

      <Label>リスクと対策</Label>
      <div className="mt-1 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-start gap-1.5">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-700" />
          <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-amber-900">{d.risk}</p>
        </div>
      </div>
    </>
  );
}

function ReportDetailView({ d }: { d: ReportDetail }) {
  return (
    <>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
        <FileText className="h-3 w-3" />
        月次報告({d.ym} 分)
      </div>

      <Label>サマリ</Label>
      <Body>{d.summary}</Body>

      {d.sections.map((s) => (
        <React.Fragment key={s.title}>
          <Label>{s.title}</Label>
          <Body multiline>{s.body}</Body>
        </React.Fragment>
      ))}
    </>
  );
}

function ExpenseDetailView({ d }: { d: ExpenseDetail }) {
  return (
    <>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
        <Receipt className="h-3 w-3" />
        精算承認(支出済の経費)
      </div>

      <Label>用途・内容</Label>
      <Body>{d.purpose}</Body>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">金額</div>
          <div className="mt-1 text-[14px] font-bold text-slate-900">¥{d.amount.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">支出日</div>
          <div className="mt-1 text-[12px] text-slate-800">{d.paidDate}</div>
        </div>
      </div>

      <Label>支払先</Label>
      <Body>{d.payee}</Body>

      <Label>領収書</Label>
      <div className={`mt-1 rounded-xl border p-3 ${d.receipt ? "border-slate-200 bg-slate-50/40" : "border-rose-200 bg-rose-50"}`}>
        <div className="flex items-center gap-2 text-[12px]">
          <Receipt className="h-4 w-4 text-slate-400" />
          {d.receipt ? <span className="text-slate-800">添付あり(タップで原本表示)</span> : <span className="text-rose-700">添付なし(差戻し推奨)</span>}
        </div>
      </div>
    </>
  );
}

function Body({ children, multiline }: { children: React.ReactNode; multiline?: boolean }) {
  return (
    <div
      className={`mt-1 rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800 ${
        multiline ? "whitespace-pre-wrap" : ""
      }`}
    >
      {children}
    </div>
  );
}

function RejectSheet({ approval, onClose }: { approval: Approval; onClose: () => void }) {
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

        <Label>差戻し理由 <span className="text-rose-600">必須</span></Label>
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
          <button onClick={onClose} className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">
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

/* -------- 隊員 × 月 詳細シート(カレンダー + サマリ + グラフ)-------- */

function MemberMonthSheet({ name, ym, onClose }: { name: string; ym: string; onClose: () => void }) {
  const { openSheet } = useApp();
  const member = ALL_MEMBERS.find((m) => m.name === name);
  const status = monthlyStatusMap[ym]?.[name] ?? "none";
  const s = statusMeta[status];

  const logs = (memberLogs[name] ?? []).filter((l) => l.date.startsWith(ym));
  const totalHours = logs.reduce((a, l) => a + l.hours, 0);
  const totalExpense = logs.reduce((a, l) => a + (l.expense ?? 0), 0);
  const totalCount = logs.length;

  // カレンダー
  const [yr, mo] = ym.split("-").map(Number);
  const startWeekday = new Date(yr, mo - 1, 1).getDay();
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const byDate: Record<string, ActivityLog[]> = {};
  for (const l of logs) (byDate[l.date] ??= []).push(l);
  const cells: ({ day: number; date: string; logs: ActivityLog[] } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${ym}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, date: dateStr, logs: byDate[dateStr] ?? [] });
  }

  // 種類別グラフ
  const byType: Record<string, number> = {};
  for (const l of logs) byType[l.type] = (byType[l.type] ?? 0) + l.hours;

  const monthLabel = AVAILABLE_MONTHS.find((m) => m.id === ym)?.label ?? ym;

  return (
    <>
      <SheetHeader title={`${name} ・ ${monthLabel}`} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[13px] font-bold text-slate-700 ring-1 ring-slate-200">
            {member?.initials}
          </div>
          <div>
            <div className="text-lg font-bold">{name}</div>
            <div className="text-[11px] text-slate-500">{member?.role}</div>
          </div>
          <span className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.className}`}>
            {s.label}
          </span>
        </div>

        {/* サマリ */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryCell icon={<FileText className="h-3.5 w-3.5" />} value={`${totalCount}`} label="活動件数" />
          <SummaryCell icon={<Clock className="h-3.5 w-3.5" />} value={`${totalHours}`} label="活動時間" suffix="h" />
          <SummaryCell icon={<Wallet className="h-3.5 w-3.5" />} value={`¥${totalExpense.toLocaleString()}`} label="経費使用" />
        </div>

        {totalCount === 0 ? (
          <EmptyState message={`${monthLabel} の活動記録がまだありません。`} />
        ) : (
          <>
            {/* カレンダー */}
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">活動カレンダー</div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400">
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((c, i) =>
                  c === null ? <div key={i} /> : (
                    <button
                      key={i}
                      onClick={() => c.logs.length > 0 && openSheet({ kind: "report-day", member: name, date: c.date })}
                      disabled={c.logs.length === 0}
                      className={`relative aspect-square rounded-lg border text-left text-[10px] transition ${
                        c.logs.length > 0
                          ? "border-slate-300 bg-white hover:border-slate-900 hover:shadow"
                          : "border-slate-100 bg-slate-50/40 text-slate-300"
                      }`}
                    >
                      <span className="absolute left-1 top-0.5 font-bold text-slate-700">{c.day}</span>
                      {c.logs.length > 0 && (
                        <>
                          <span className="absolute right-1 top-0.5 text-[8px] font-bold text-slate-500">{c.logs.length}</span>
                          <span className="absolute bottom-0.5 left-1 right-1 truncate text-[8px] text-slate-500">
                            {c.logs.reduce((s, l) => s + l.hours, 0)}h
                          </span>
                        </>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {Object.keys(byType).length > 0 && (
              <div className="mt-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">種類別 活動時間</div>
                <ul className="mt-2 space-y-1">
                  {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, h]) => {
                    const max = Math.max(...Object.values(byType));
                    const pct = (h / max) * 100;
                    return (
                      <li key={type} className="flex items-center gap-2">
                        <div className="w-16 text-[11px] text-slate-600">{type}</div>
                        <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-3 rounded-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-12 text-right text-[11px] font-bold text-slate-700">{h}h</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {totalExpense > 0 && (
              <div className="mt-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">経費使用(年間上限想定 ¥2,000,000)</div>
                <div className="mt-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-slate-900" style={{ width: `${Math.min((totalExpense / 2000000) * 100, 100)}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-slate-600">
                  ¥{totalExpense.toLocaleString()} 使用
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function SummaryCell({ icon, value, label, suffix }: { icon: React.ReactNode; value: string; label: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <div className="mx-auto flex h-5 w-5 items-center justify-center text-slate-400">{icon}</div>
      <div className="mt-1 text-[18px] font-black leading-none text-slate-900">
        {value}
        {suffix && <span className="ml-0.5 text-[10px] font-bold text-slate-500">{suffix}</span>}
      </div>
      <div className="mt-0.5 text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

function ReportDaySheet({ name, date, onClose }: { name: string; date: string; onClose: () => void }) {
  const logs = (memberLogs[name] ?? []).filter((l) => l.date === date);
  const totalHours = logs.reduce((s, l) => s + l.hours, 0);
  const totalExpense = logs.reduce((s, l) => s + (l.expense ?? 0), 0);
  const [, m, d] = date.split("-");

  return (
    <>
      <SheetHeader title={`${name} ・ ${Number(m)}/${Number(d)}`} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="text-[11px] text-slate-500">
          {logs.length} 件 ・ {totalHours} 時間
          {totalExpense > 0 && ` ・ 経費 ¥${totalExpense.toLocaleString()}`}
        </div>
        <ul className="mt-4 space-y-2">
          {logs.map((l, i) => (
            <li key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                  {l.type}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                  {l.topic}
                </span>
                <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  {l.hours}h
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-800">{l.body}</p>
              {l.expense && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-600">
                  <Wallet className="h-3 w-3" />
                  ¥{l.expense.toLocaleString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function TargetsSheet({ onClose }: { onClose: () => void }) {
  const { managed, noticeTargets, setNoticeTargets } = useApp();
  const [local, setLocal] = React.useState<string[]>(noticeTargets.length ? noticeTargets : managed);

  function toggle(name: string) {
    setLocal((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
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
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>
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

function NoticeDetailSheet({ notice, onClose }: { notice: NoticeItem; onClose: () => void }) {
  return (
    <>
      <SheetHeader title="お知らせ" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">{notice.title}</h1>
        <div className="mt-1 text-[11px] text-slate-500">{notice.date} ・ 既読 {notice.read} / {notice.targets}</div>
        <div className="mt-5 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-800">{notice.body}</div>
      </div>
    </>
  );
}

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { managed, setManaged } = useApp();
  const [local, setLocal] = React.useState<string[]>(managed);

  function toggle(name: string) {
    setLocal((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
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
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">管轄する隊員</h2>
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
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>
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
