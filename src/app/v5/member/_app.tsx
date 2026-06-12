"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  Sparkles,
  X,
  ArrowRight,
  Plus,
  Check,
  Receipt,
  FileText,
  Camera,
  Mic,
  TrendingUp,
  Building2,
  Calendar,
  Quote,
  Settings as SettingsIcon,
  Clock,
  Lightbulb,
  Wallet,
} from "lucide-react";

/* ============================================================
   v5 隊員アプリ ─ 検索エンジン型・4 機能
     活動報告 / 月報 / 経費 / 事例

   2026-06-12 改修:
   - 「日報」→「活動報告」に改名(1 日 1 回前提を撤廃)
   - 活動分類を 2 軸に分離: 活動の種類(固定) × 活動内容(ユーザー設定)
   - 活動時間を必須入力
   - 5W1H ヒント表示(自由記述補助)
   - 月報詳細をカレンダー形式 + サマリ + グラフ + 来月計画 に
   - 経費を「申請」「精算」の 2 サブタブに分離
   ============================================================ */

type Tab = "daily" | "report" | "expense" | "case";

/* -------------------- 活動分類 -------------------- */

// 活動の種類(共通・固定)
const ACTIVITY_TYPES = [
  "会議",
  "出張",
  "現場訪問",
  "広報",
  "内勤",
  "イベント",
  "振り返り",
  "その他",
];

// 活動内容(ユーザー固有・編集可能)─ 田中(移住促進)のデフォルト
const DEFAULT_TOPICS = [
  "空き家",
  "移住相談",
  "町報",
  "観光協会",
  "夏祭り",
];

/* -------------------- データ -------------------- */

type ActivityLog = {
  id: string;
  type: string; // 活動の種類
  topic: string; // 活動内容(ユーザー固有)
  hours: number; // 活動時間
  body: string; // 5W1H ベースのメモ
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  expense?: number; // この活動で発生した経費(任意)
};

const seedLogs: ActivityLog[] = [
  { id: "l1", type: "現場訪問", topic: "空き家", hours: 2, body: "A 邸内覧、家族 4 人と現地調整。築 80 年、構造は良好。次回 6/15 に再訪。", date: "2026-06-11", time: "14:20" },
  { id: "l2", type: "会議", topic: "観光協会", hours: 1.5, body: "観光協会 月例会(13:30〜)。夏祭りの出店枠について議論。", date: "2026-06-11", time: "11:05" },
  { id: "l3", type: "会議", topic: "移住相談", hours: 1, body: "名古屋ファミリー Web 会議(60 分)。8 月の現地視察日程を仮押さえ。", date: "2026-06-10", time: "16:40" },
  { id: "l4", type: "広報", topic: "町報", hours: 2.5, body: "町報の特集記事ドラフト、写真選定。締切 6/18。", date: "2026-06-10", time: "10:30" },
  { id: "l5", type: "イベント", topic: "夏祭り", hours: 3, body: "夏祭り実行委員会、出店者リスト確定。次回現地下見 6/22。", date: "2026-06-08", time: "19:00", expense: 1200 },
  { id: "l6", type: "現場訪問", topic: "空き家", hours: 1.5, body: "B 邸 所有者連絡、内覧日程調整。所有者親族との合意形成が課題。", date: "2026-06-08", time: "14:00" },
  { id: "l7", type: "出張", topic: "空き家", hours: 6, body: "島根県視察。海士町の古民家活用事例を視察。", date: "2026-06-05", time: "09:00", expense: 38400 },
  { id: "l8", type: "内勤", topic: "町報", hours: 2, body: "町報 6 月号 印刷費精算処理。", date: "2026-06-03", time: "10:00", expense: 12800 },
];

type Report = {
  id: string;
  yearMonth: string;
  status: "draft" | "submitted" | "approved";
  statusLabel: string;
  plan?: string; // 来月計画
};

const reports: Report[] = [
  { id: "r-2026-06", yearMonth: "2026 年 6 月", status: "draft", statusLabel: "自動生成中" },
  { id: "r-2026-05", yearMonth: "2026 年 5 月", status: "approved", statusLabel: "役場承認 5/31" },
  { id: "r-2026-04", yearMonth: "2026 年 4 月", status: "approved", statusLabel: "役場承認 4/30" },
];

// 経費申請(まだ精算前のものも含む)
type ExpenseRequest = {
  id: string;
  title: string;
  amount: number;
  purpose: string;
  status: "申請中" | "承認" | "差戻し" | "未精算" | "精算済";
  aiNote: string;
  citation: { source: string; quote: string };
  createdAt: string;
  hasReceipt: boolean;
};

const initialExpenses: ExpenseRequest[] = [
  {
    id: "e1",
    title: "町報 印刷費",
    amount: 12800,
    purpose: "町報 6 月号の印刷費。広報物の制作費として申請。",
    status: "精算済",
    aiNote: "広報物の印刷費は活動費対象。過去 4 件同様に承認実績あり。",
    citation: { source: "新温泉町 活動費ガイドライン v2.1", quote: "広報物の印刷費は活動費の対象に含まれます。" },
    createdAt: "2026-06-03",
    hasReceipt: true,
  },
  {
    id: "e2",
    title: "島根県視察 出張費",
    amount: 38400,
    purpose: "海士町の古民家活用事例を視察し、自地域での運用設計に活かす。",
    status: "未精算",
    aiNote: "県外出張は事前承認が必要。本件は事前承認済み。",
    citation: { source: "新温泉町 活動費ガイドライン v2.1", quote: "県外出張は事前承認(町長決裁)必須。" },
    createdAt: "2026-06-01",
    hasReceipt: false,
  },
  {
    id: "e3",
    title: "古民家家賃 月 5 万円",
    amount: 50000,
    purpose: "活動拠点として A 邸を月 5 万円で賃借。週 1 で地域開放を予定。",
    status: "申請中",
    aiNote: "拠点賃借料は対象。海士町に類似事例あり(月 4 万円承認)。",
    citation: { source: "JOIN お役立ちツール Q&A", quote: "活動拠点として賃借する家屋の賃料は活動費の対象に含まれます。" },
    createdAt: "2026-06-09",
    hasReceipt: false,
  },
];

type CaseItem = {
  id: string;
  title: string;
  area: string;
  year: string;
  author: string;
  summary: string;
  kpi: string;
  effect: string;
  process: { phase: string; body: string }[];
  learning: string;
};

const cases: CaseItem[] = [
  {
    id: "c1",
    title: "空き家バンクで 1 年目 12 件登録",
    area: "兵庫県 養父市",
    year: "2024",
    author: "山本(隊員 1 年目)",
    summary: "自治会連動の DM 配布で空き家所有者にリーチ。1 年目で 12 件の登録、うち 4 件成約。",
    kpi: "登録 12 件 / 成約 4 件 / 移住 3 家族",
    effect: "町外からの移住 7 名増、空き家率 -0.4 pt",
    process: [
      { phase: "1-3 月目", body: "既存の空き家リスト棚卸し。所有者連絡先の整備に注力。" },
      { phase: "4-6 月目", body: "自治会経由で所有者に挨拶状を DM 配布(18 件)。返信 9 件。" },
      { phase: "7-9 月目", body: "内覧 7 件、登録 5 件。並行して移住希望者リスト作成。" },
      { phase: "10-12 月目", body: "成約 4 件、移住 3 家族受け入れ。" },
    ],
    learning: "自治会経由の DM は反応率が高い(直接送付の 3 倍)。所有者の心理的ハードルが「知らない人より地域経由」で下がる。",
  },
  {
    id: "c2",
    title: "空き家清掃ボランティアの定着",
    area: "島根県 海士町",
    year: "2023",
    author: "中島(隊員 2 年目)",
    summary: "月 1 回の空き家清掃ボランティアを継続開催。地元住民との関係構築の場として機能。",
    kpi: "12 回開催 / 延べ参加 84 名 / 清掃完了 8 物件",
    effect: "地元住民との関係構築 + 物件の早期市場投入",
    process: [
      { phase: "1-2 月目", body: "地元自治会と相談、第 1 回は地域住民のみで開催。" },
      { phase: "3-6 月目", body: "SNS で外部にも告知、移住希望者の参加が増える。" },
      { phase: "7-12 月目", body: "月 1 定期化、清掃完了物件は空き家バンクに即登録。" },
    ],
    learning: "地元 → 外部の順で開いていくと、住民の抵抗が少ない。清掃 + 交流の二段構造が効く。",
  },
  {
    id: "c3",
    title: "DIY 補助金との組み合わせ",
    area: "全国(JOIN)",
    year: "2024",
    author: "JOIN お役立ちツール",
    summary: "空き家物件登録時に DIY 補助金を活用するスキーム例。",
    kpi: "補助上限 50 万円 / 申請期間 2 ヶ月",
    effect: "物件登録のインセンティブ強化",
    process: [
      { phase: "申請", body: "市町村窓口で DIY 補助金の交付申請。" },
      { phase: "実施", body: "補助対象工事を実施(壁紙・水回り等)。" },
      { phase: "登録", body: "工事完了後に空き家バンクに登録。" },
    ],
    learning: "補助金申請のタイミングを物件登録と連動させると、所有者の意思決定が早まる。",
  },
];

const trendCases = [
  { id: "t1", title: "空き家バンク立ち上げ", count: 34 },
  { id: "t2", title: "移住相談ネットワーク", count: 28 },
  { id: "t3", title: "観光協会との連携", count: 19 },
];

/* -------------------- Context -------------------- */

type Sheet =
  | { kind: "activity-create"; presetDate?: string }
  | { kind: "activity-detail"; log: ActivityLog }
  | { kind: "report-detail"; report: Report }
  | { kind: "report-day"; date: string }
  | { kind: "expense-detail"; item: ExpenseRequest }
  | { kind: "expense-create" }
  | { kind: "expense-settle"; item: ExpenseRequest }
  | { kind: "case-detail"; case: CaseItem }
  | { kind: "mentor" }
  | { kind: "topic-edit" }
  | null;

type Ctx = {
  logs: ActivityLog[];
  addLog: (l: Omit<ActivityLog, "id">) => void;
  topics: string[];
  addTopic: (t: string) => void;
  removeTopic: (t: string) => void;
  expenses: ExpenseRequest[];
  addExpense: (e: Omit<ExpenseRequest, "id" | "createdAt" | "aiNote" | "citation" | "hasReceipt">) => void;
  markSettled: (id: string) => void;
  sheet: Sheet;
  openSheet: (s: Sheet) => void;
  plan: string;
  setPlan: (p: string) => void;
};

const AppCtx = React.createContext<Ctx | null>(null);
const useApp = () => {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("AppCtx missing");
  return c;
};

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("daily");
  const [logs, setLogs] = React.useState<ActivityLog[]>(seedLogs);
  const [topics, setTopics] = React.useState<string[]>(DEFAULT_TOPICS);
  const [expenses, setExpenses] = React.useState<ExpenseRequest[]>(initialExpenses);
  const [sheet, setSheet] = React.useState<Sheet>(null);
  const [plan, setPlan] = React.useState(
    "・夏祭り当日の運営(7/14)\n・移住者向け体験ツアー初回開催(7/27)\n・空き家バンク累計 15 件を目標"
  );

  const ctx: Ctx = {
    logs,
    addLog: (l) =>
      setLogs((ls) => [{ id: String(Date.now()), ...l }, ...ls]),
    topics,
    addTopic: (t) =>
      setTopics((ts) => (ts.includes(t) ? ts : [...ts, t])),
    removeTopic: (t) => setTopics((ts) => ts.filter((x) => x !== t)),
    expenses,
    addExpense: (e) =>
      setExpenses((es) => [
        {
          id: String(Date.now()),
          createdAt: new Date().toISOString().slice(0, 10),
          aiNote: "AI 判定材料は申請後に表示されます。",
          citation: { source: "(検索中)", quote: "" },
          hasReceipt: false,
          ...e,
        },
        ...es,
      ]),
    markSettled: (id) =>
      setExpenses((es) =>
        es.map((e) => (e.id === id ? { ...e, status: "精算済", hasReceipt: true } : e))
      ),
    sheet,
    openSheet: setSheet,
    plan,
    setPlan,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <main className="flex h-screen flex-col bg-white text-slate-900">
        <Header onMentorOpen={() => setSheet({ kind: "mentor" })} />
        <Tabs active={tab} onChange={setTab} />

        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-20">
          <div className="mx-auto w-full max-w-2xl flex-1 py-4">
            {tab === "daily" && <DailyTab />}
            {tab === "report" && <ReportTab />}
            {tab === "expense" && <ExpenseTab />}
            {tab === "case" && <CaseTab />}
          </div>
        </div>

        <Footer onTopicEdit={() => setSheet({ kind: "topic-edit" })} />
        <SheetRoot />
      </main>
    </AppCtx.Provider>
  );
}

/* -------------------- Header / Tabs / Footer -------------------- */

function Header({ onMentorOpen }: { onMentorOpen: () => void }) {
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
        田中 あかり / 新温泉町
      </div>
      <button
        onClick={onMentorOpen}
        className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900"
      >
        <Sparkles className="h-3 w-3" />
        相談
      </button>
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
      <TabBtn label="活動報告" active={active === "daily"} onClick={() => onChange("daily")} />
      <TabBtn label="月報" active={active === "report"} onClick={() => onChange("report")} />
      <TabBtn label="経費" active={active === "expense"} onClick={() => onChange("expense")} />
      <TabBtn label="事例" active={active === "case"} onClick={() => onChange("case")} />
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

function Footer({ onTopicEdit }: { onTopicEdit: () => void }) {
  return (
    <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400">
      <span>地域おこし協力隊サポートシステム ・ v5 lab</span>
      <button
        onClick={onTopicEdit}
        className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-900"
      >
        <SettingsIcon className="h-3 w-3" />
        活動内容を編集
      </button>
    </footer>
  );
}

/* -------------------- 1. 活動報告タブ -------------------- */

function todayKey() {
  return "2026-06-11"; // モック上の今日
}

function DailyTab() {
  const { logs, openSheet } = useApp();
  const today = logs.filter((l) => l.date === todayKey());
  const past = logs.filter((l) => l.date !== todayKey());

  // 日付グループ化
  const grouped: Record<string, ActivityLog[]> = {};
  for (const l of past) {
    (grouped[l.date] ??= []).push(l);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  const todayHours = today.reduce((s, l) => s + l.hours, 0);
  const topicsUsedToday = Array.from(new Set(today.map((l) => l.topic)));

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">活動報告</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          活動のたびに 1 件。月末に AI が月報へまとめます
        </p>
      </div>

      {/* 今日の作成状況 */}
      <section className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            今日の活動報告
          </div>
          <div className="text-[10px] text-slate-400">6 月 11 日(木)</div>
        </div>
        <div className="mt-2 flex items-end gap-3">
          <div>
            <div className="text-3xl font-black text-slate-900">{today.length}</div>
            <div className="text-[10px] text-slate-500">件</div>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <div className="text-2xl font-black text-slate-900">{todayHours}</div>
            <div className="text-[10px] text-slate-500">時間</div>
          </div>
          {topicsUsedToday.length > 0 && (
            <div className="flex flex-1 flex-wrap gap-1 pb-1">
              {topicsUsedToday.map((c) => (
                <span key={c} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        {today.length > 0 ? (
          <ul className="mt-3 space-y-px">
            {today.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => openSheet({ kind: "activity-detail", log: l })}
                  className="flex w-full items-center gap-2 border-t border-slate-200/70 py-2 text-left first:border-t-0 hover:bg-white/60"
                >
                  <span className="shrink-0 rounded-full border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {l.type}
                  </span>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {l.topic}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-slate-800">
                    {l.body}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-400">
                    {l.hours}h
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white/50 px-3 py-4 text-center text-[11px] text-slate-500">
            まだ記録がありません。右下の <strong>+</strong> から作成
          </div>
        )}
      </section>

      {/* 過去の活動報告 ─ 日付グループ化 */}
      <section className="mx-auto mt-6 max-w-xl">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          過去の活動報告
        </div>
        {sortedDates.length === 0 ? (
          <div className="text-[11px] text-slate-400">過去の記録はありません</div>
        ) : (
          <ul className="space-y-3">
            {sortedDates.map((date) => {
              const items = grouped[date];
              const totalHours = items.reduce((s, l) => s + l.hours, 0);
              return (
                <li
                  key={date}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <div className="text-[12px] font-bold text-slate-900">
                      {formatDateShort(date)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {items.length} 件 ・ {totalHours} 時間
                    </div>
                  </div>
                  <ul className="space-y-px">
                    {items.map((l) => (
                      <li key={l.id}>
                        <button
                          onClick={() => openSheet({ kind: "activity-detail", log: l })}
                          className="flex w-full items-center gap-2 border-t border-slate-100 py-1.5 text-left first:border-t-0 hover:bg-slate-50"
                        >
                          <span className="shrink-0 rounded-full border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {l.type}
                          </span>
                          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {l.topic}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12px] text-slate-700">
                            {l.body}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {l.hours}h
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button
        onClick={() => openSheet({ kind: "activity-create" })}
        className="fixed bottom-10 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
        aria-label="活動報告を作成"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

function formatDateShort(d: string) {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

/* -------------------- 2. 月報タブ -------------------- */

function ReportTab() {
  const { openSheet } = useApp();
  const [q, setQ] = React.useState("");
  const filtered = reports.filter((r) =>
    q.trim() ? r.yearMonth.includes(q) : true
  );

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">月報</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        日々の活動から AI が自動生成します
      </p>

      <SearchBox value={q} onChange={setQ} placeholder="月を指定 ・ 例:2026 年 6 月" />

      {filtered.length === 0 ? (
        <EmptyState message="該当する月報がありません。" />
      ) : (
        <ul className="mt-6 space-y-px text-left">
          {filtered.map((r) => (
            <li key={r.id} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => openSheet({ kind: "report-detail", report: r })}
                className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-slate-50/60"
              >
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1 px-1">
                  <div className="text-[13px] font-semibold text-slate-900">
                    {r.yearMonth}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{r.statusLabel}</div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    r.status === "draft"
                      ? "border-slate-300 bg-slate-50 text-slate-700"
                      : r.status === "submitted"
                      ? "border-slate-300 bg-white text-slate-700"
                      : "border-slate-300 bg-slate-900 text-white"
                  }`}
                >
                  {r.status === "draft" ? "下書き" : r.status === "submitted" ? "提出済" : "承認済"}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------- 3. 経費タブ -------------------- */

type ExpenseSubTab = "request" | "settle";

function ExpenseTab() {
  const { expenses, openSheet } = useApp();
  const [sub, setSub] = React.useState<ExpenseSubTab>("request");
  const [q, setQ] = React.useState("");

  const matched = expenses.filter((e) => (q.trim() ? e.title.includes(q) || e.purpose.includes(q) : true));

  const requestItems = matched.filter((e) => ["申請中", "承認", "差戻し"].includes(e.status));
  const settleItems = matched.filter((e) => ["承認", "未精算", "精算済"].includes(e.status));

  const items = sub === "request" ? requestItems : settleItems;

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">経費</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          申請(事前)と精算(事後)を分けて管理
        </p>
      </div>

      {/* サブタブ */}
      <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-1 rounded-full border border-slate-200 bg-white p-1">
        <SubTabBtn label="申請" active={sub === "request"} onClick={() => setSub("request")} />
        <SubTabBtn label="精算" active={sub === "settle"} onClick={() => setSub("settle")} />
      </div>

      <div className="mt-3">
        <SearchBox value={q} onChange={setQ} placeholder={sub === "request" ? "申請内容で絞る" : "精算待ち / 精算済を探す"} />
      </div>

      <div className="mt-4 text-left">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {sub === "request" ? "経費申請(事前承認)" : "経費精算(事後)"}
          <span className="ml-1 font-normal text-slate-400">{items.length} 件</span>
        </div>
        {items.length === 0 ? (
          <EmptyState message={sub === "request" ? "申請はまだありません。右下から起こしてください。" : "精算対象はありません。"} />
        ) : (
          <ul className="space-y-px">
            {items.map((e) => (
              <li key={e.id} className="border-b border-slate-100 last:border-b-0">
                <button
                  onClick={() =>
                    sub === "settle" && (e.status === "承認" || e.status === "未精算")
                      ? openSheet({ kind: "expense-settle", item: e })
                      : openSheet({ kind: "expense-detail", item: e })
                  }
                  className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
                >
                  <Receipt className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1 px-1">
                    <div className="text-[13px] font-semibold text-slate-900">
                      {e.title}
                      <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                        ¥{e.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-slate-500">{e.purpose}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(e.status)}`}
                  >
                    {e.status}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => openSheet({ kind: "expense-create" })}
        className="fixed bottom-10 right-6 z-30 inline-flex h-12 items-center gap-1.5 rounded-full bg-slate-900 px-5 text-[12px] font-bold text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        経費申請
      </button>
    </div>
  );
}

function SubTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1 text-[12px] font-semibold transition ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

function statusClass(s: ExpenseRequest["status"]) {
  switch (s) {
    case "申請中":
      return "border-slate-300 bg-slate-50 text-slate-700";
    case "承認":
      return "border-slate-300 bg-white text-slate-700";
    case "差戻し":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "未精算":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "精算済":
      return "border-slate-300 bg-slate-900 text-white";
  }
}

/* -------------------- 4. 事例タブ -------------------- */

function CaseTab() {
  const { openSheet } = useApp();
  const [q, setQ] = React.useState("");

  const matched = q.trim()
    ? cases.filter((c) => c.title.includes(q) || c.area.includes(q) || c.summary.includes(q))
    : [];

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">事例</h1>
      <p className="mt-1 text-[12px] text-slate-500">全国の協力隊の活動から探す</p>

      <SearchBox value={q} onChange={setQ} placeholder="キーワード ・ 例:空き家 移住相談 観光協会" />

      {q.trim() === "" ? (
        <div className="mt-6">
          <div className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">トレンド</div>
          <ul className="mt-1 space-y-px text-left">
            {trendCases.map((t) => (
              <li key={t.id} className="border-b border-slate-100 last:border-b-0">
                <button
                  onClick={() => setQ(t.title)}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
                >
                  <TrendingUp className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1 px-1">
                    <div className="text-[13px] font-semibold text-slate-900">{t.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{t.count} 件 ・ 全国</div>
                  </div>
                  <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : matched.length === 0 ? (
        <EmptyState message="該当する事例がありません。" />
      ) : (
        <ul className="mt-5 space-y-px text-left">
          {matched.map((c) => (
            <li key={c.id} className="border-b border-slate-100 last:border-b-0">
              <button
                onClick={() => openSheet({ kind: "case-detail", case: c })}
                className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
              >
                <Lightbulb className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1 px-1">
                  <div className="text-[13px] font-semibold text-slate-900">{c.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{c.area} ・ {c.year}</div>
                </div>
                <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      )}
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
        <button onClick={() => onChange("")} className="text-slate-400 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center text-[12px] text-slate-500">
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
      {sheet.kind === "activity-create" && <ActivityCreateSheet presetDate={sheet.presetDate} onClose={close} />}
      {sheet.kind === "activity-detail" && <ActivityDetailSheet log={sheet.log} onClose={close} />}
      {sheet.kind === "report-detail" && <ReportDetailSheet report={sheet.report} onClose={close} />}
      {sheet.kind === "report-day" && <ReportDaySheet date={sheet.date} onClose={close} />}
      {sheet.kind === "expense-detail" && <ExpenseDetailSheet item={sheet.item} onClose={close} />}
      {sheet.kind === "expense-create" && <ExpenseCreateSheet onClose={close} />}
      {sheet.kind === "expense-settle" && <ExpenseSettleSheet item={sheet.item} onClose={close} />}
      {sheet.kind === "case-detail" && <CaseDetailSheet item={sheet.case} onClose={close} />}
      {sheet.kind === "mentor" && <MentorSheet onClose={close} />}
      {sheet.kind === "topic-edit" && <TopicEditSheet onClose={close} />}
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
      <button onClick={onClose} className="inline-flex items-center gap-1 text-[12px] text-slate-700 hover:text-slate-900">
        <X className="h-4 w-4" />
        閉じる
      </button>
      <div className="text-[12px] font-semibold">{title}</div>
      <div className="min-w-12 text-right">{right}</div>
    </header>
  );
}

/* -------- 活動報告 作成シート(2 軸 + 時間 + 5W1H) -------- */

function ActivityCreateSheet({
  presetDate,
  onClose,
}: {
  presetDate?: string;
  onClose: () => void;
}) {
  const { addLog, topics } = useApp();
  const [type, setType] = React.useState<string | null>(null);
  const [topic, setTopic] = React.useState<string | null>(null);
  const [hours, setHours] = React.useState<string>("1");
  const [body, setBody] = React.useState("");

  const canSave = !!type && !!topic && parseFloat(hours) > 0 && body.trim().length > 0;

  function save() {
    if (!canSave) return;
    addLog({
      type: type!,
      topic: topic!,
      hours: parseFloat(hours),
      body: body.trim(),
      date: presetDate ?? todayKey(),
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    });
    onClose();
  }

  return (
    <>
      <SheetHeader
        title="活動報告を書く"
        onClose={onClose}
        right={
          <button
            onClick={save}
            disabled={!canSave}
            className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          >
            記録
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <Label>活動の種類</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {ACTIVITY_TYPES.map((c) => (
            <button
              key={c}
              onClick={() => setType((cur) => (cur === c ? null : c))}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
                type === c
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:border-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <Label>活動内容(あなたのテーマ)</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {topics.map((c) => (
            <button
              key={c}
              onClick={() => setTopic((cur) => (cur === c ? null : c))}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
                topic === c
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:border-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-1 text-[10px] text-slate-400">
          ※ 活動内容はあなた専用です。<button onClick={onClose} className="underline">フッタの「活動内容を編集」</button>で追加・削除できます。
        </div>

        <Label>活動時間</Label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            step="0.5"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
          />
          <span className="text-[12px] text-slate-600">時間</span>
        </div>

        <Label>メモ</Label>
        <textarea
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="例:A 邸を内覧、移住希望者と一緒に。築 80 年だが構造良好。"
          className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          <strong className="text-slate-800">迷ったらこの順で:</strong>
          <br />
          いつ ・ どこで ・ 誰と ・ 何を ・ なぜ ・ どうやって(5W1H)
          <br />
          <span className="text-slate-400">困ったら右上「相談」から AI に整理してもらえます。</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-500">
            <Mic className="h-3.5 w-3.5" />
            音声で
          </button>
          <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-500">
            <Camera className="h-3.5 w-3.5" />
            写真・資料
          </button>
        </div>
      </div>
    </>
  );
}

/* -------- 活動報告 詳細シート -------- */

function ActivityDetailSheet({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  return (
    <>
      <SheetHeader title="活動報告" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>{formatDateShort(log.date)}</span>
          <span>・</span>
          <span>{log.time}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700">
            {log.type}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {log.topic}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            {log.hours} 時間
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800">
          {log.body}
        </p>

        {typeof log.expense === "number" && (
          <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
            <Wallet className="h-3 w-3" />
            この活動で発生した経費:¥{log.expense.toLocaleString()}
          </div>
        )}
      </div>
    </>
  );
}

/* -------- 月報詳細(カレンダー + サマリ + グラフ + 来月計画)-------- */

function ReportDetailSheet({ report, onClose }: { report: Report; onClose: () => void }) {
  const { logs, plan, setPlan, openSheet } = useApp();
  const ym = report.id.replace("r-", ""); // "2026-06"
  const monthLogs = logs.filter((l) => l.date.startsWith(ym));

  const totalHours = monthLogs.reduce((s, l) => s + l.hours, 0);
  const totalExpense = monthLogs.reduce((s, l) => s + (l.expense ?? 0), 0);
  const totalCount = monthLogs.length;

  // 日付別集計
  const byDate: Record<string, ActivityLog[]> = {};
  for (const l of monthLogs) (byDate[l.date] ??= []).push(l);

  // 種類別集計
  const byType: Record<string, number> = {};
  for (const l of monthLogs) byType[l.type] = (byType[l.type] ?? 0) + l.hours;

  // カレンダー描画用
  const [yr, mo] = ym.split("-").map(Number);
  const firstDay = new Date(yr, mo - 1, 1);
  const startWeekday = firstDay.getDay(); // 0=日
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const cells: ({ day: number; date: string; logs: ActivityLog[] } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${ym}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, date: dateStr, logs: byDate[dateStr] ?? [] });
  }

  return (
    <>
      <SheetHeader title={report.yearMonth} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              report.status === "draft"
                ? "border-slate-300 bg-slate-50 text-slate-700"
                : report.status === "submitted"
                ? "border-slate-300 bg-white text-slate-700"
                : "border-slate-300 bg-slate-900 text-white"
            }`}
          >
            {report.status === "draft" ? "下書き" : report.status === "submitted" ? "提出済" : "承認済"}
          </span>
          <span className="text-[11px] text-slate-500">{report.statusLabel}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">{report.yearMonth}</h1>

        {/* サマリ */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryCell icon={<FileText className="h-3.5 w-3.5" />} value={`${totalCount}`} label="活動件数" />
          <SummaryCell icon={<Clock className="h-3.5 w-3.5" />} value={`${totalHours}`} label="活動時間" suffix="h" />
          <SummaryCell icon={<Wallet className="h-3.5 w-3.5" />} value={`¥${totalExpense.toLocaleString()}`} label="経費使用" />
        </div>

        {/* カレンダー */}
        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">活動カレンダー</div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400">
            {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c, i) =>
              c === null ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  onClick={() => c.logs.length > 0 && openSheet({ kind: "report-day", date: c.date })}
                  disabled={c.logs.length === 0}
                  className={`relative aspect-square rounded-lg border text-left text-[10px] transition ${
                    c.logs.length > 0
                      ? "border-slate-300 bg-white hover:border-slate-900 hover:shadow"
                      : "border-slate-100 bg-slate-50/40 text-slate-300"
                  }`}
                >
                  <span className="absolute left-1 top-0.5 font-bold text-slate-700">
                    {c.day}
                  </span>
                  {c.logs.length > 0 && (
                    <>
                      <span className="absolute right-1 top-0.5 text-[8px] font-bold text-slate-500">
                        {c.logs.length}
                      </span>
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

        {/* 活動時間グラフ(種類別) */}
        {Object.keys(byType).length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              種類別 活動時間
            </div>
            <ul className="mt-2 space-y-1">
              {Object.entries(byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, h]) => {
                  const max = Math.max(...Object.values(byType));
                  const pct = (h / max) * 100;
                  return (
                    <li key={type} className="flex items-center gap-2">
                      <div className="w-16 text-[11px] text-slate-600">{type}</div>
                      <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-slate-900 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-[11px] font-bold text-slate-700">
                        {h}h
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        {/* 経費使用状況 */}
        {totalExpense > 0 && (
          <div className="mt-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              経費使用(年間活動費上限 ¥2,000,000 想定)
            </div>
            <div className="mt-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-slate-900"
                style={{ width: `${Math.min((totalExpense / 2000000) * 100, 100)}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-slate-600">
              ¥{totalExpense.toLocaleString()} 使用 ・ 残り想定 ¥
              {(2000000 - totalExpense).toLocaleString()}
            </div>
          </div>
        )}

        {/* 来月計画(編集可能) */}
        <div className="mt-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            来月の計画
          </div>
          <textarea
            rows={4}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="来月やりたいこと・継続することを箇条書きで"
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div className="mt-4 text-[10px] text-slate-400">
          ※ AI が日々の活動から自動でまとめます。提出前に確認してください。
        </div>
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          <button className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">
            再生成
          </button>
          {report.status === "draft" ? (
            <button className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800">
              <Check className="h-3.5 w-3.5" />
              役場に提出
            </button>
          ) : (
            <button className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">
              PDF 出力
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function SummaryCell({
  icon,
  value,
  label,
  suffix,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  suffix?: string;
}) {
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

function ReportDaySheet({ date, onClose }: { date: string; onClose: () => void }) {
  const { logs, openSheet } = useApp();
  const items = logs.filter((l) => l.date === date);
  const totalHours = items.reduce((s, l) => s + l.hours, 0);
  const totalExpense = items.reduce((s, l) => s + (l.expense ?? 0), 0);

  return (
    <>
      <SheetHeader title={formatDateShort(date)} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="text-[11px] text-slate-500">
          {items.length} 件 ・ {totalHours} 時間
          {totalExpense > 0 && ` ・ 経費 ¥${totalExpense.toLocaleString()}`}
        </div>
        <ul className="mt-4 space-y-2">
          {items.map((l) => (
            <li key={l.id} className="rounded-xl border border-slate-200 bg-white p-3">
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
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* -------- 経費 詳細シート -------- */

function ExpenseDetailSheet({ item, onClose }: { item: ExpenseRequest; onClose: () => void }) {
  const { openSheet } = useApp();
  return (
    <>
      <SheetHeader title="経費申請の詳細" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">{item.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(item.status)}`}
          >
            {item.status}
          </span>
          <span className="text-[11px] text-slate-500">
            ¥{item.amount.toLocaleString()} ・ 起票 {item.createdAt}
          </span>
        </div>

        <Label>申請内容 ・ 用途</Label>
        <p className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800">
          {item.purpose}
        </p>

        <Label>AI 判定材料</Label>
        <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
          <p className="text-[12px] leading-relaxed text-slate-800">{item.aiNote}</p>
          <div className="mt-1 text-[10px] text-slate-400">
            ※ AI は判定しません。視点と材料のみ提供します。
          </div>
        </div>

        {item.citation.quote && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] font-semibold text-slate-700">
              {item.citation.source}
            </div>
            <div className="mt-1 flex items-start gap-1.5 text-[12px] text-slate-600">
              <Quote className="mt-0.5 h-3 w-3 shrink-0 text-slate-300" />
              <span className="leading-snug">{item.citation.quote}</span>
            </div>
          </div>
        )}

        <Label>類似の過去申請</Label>
        <ul className="mt-1 space-y-px">
          <li className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-b-0">
            <Receipt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1 text-[12px] text-slate-700">
              佐用町 拠点賃借 月 4 万円 → 承認
            </div>
          </li>
          <li className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-b-0">
            <Receipt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1 text-[12px] text-slate-700">
              海士町 古民家コワーキング → 承認(週 1 開放条件)
            </div>
          </li>
        </ul>

        {item.status === "承認" || item.status === "未精算" ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
            <strong>未精算です。</strong>
            支出が確定したら「精算」サブタブから領収書を添付して精算してください。
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          {item.status === "承認" || item.status === "未精算" ? (
            <button
              onClick={() => openSheet({ kind: "expense-settle", item })}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800"
            >
              <Receipt className="h-3.5 w-3.5" />
              精算する
            </button>
          ) : (
            <button onClick={onClose} className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">
              閉じる
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* -------- 経費 申請シート(事前) -------- */

function ExpenseCreateSheet({ onClose }: { onClose: () => void }) {
  const { addExpense } = useApp();
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const amountNum = parseInt(amount.replace(/[^0-9]/g, ""), 10);
  const canSubmit = title.trim() && amountNum > 0 && purpose.trim().length >= 5;

  function submit() {
    if (!canSubmit) return;
    addExpense({
      title: title.trim(),
      amount: amountNum,
      purpose: purpose.trim(),
      status: "申請中",
    });
    onClose();
  }

  return (
    <>
      <SheetHeader
        title="経費を申請(事前)"
        onClose={onClose}
        right={
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          >
            申請
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          <strong className="text-slate-800">この画面は「事前申請」です。</strong>
          <br />
          支出する前に内容と金額を申請します。領収書は支出後に「精算」サブタブから登録してください。
        </div>

        <Label>タイトル</Label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例:町報 7 月号 印刷費"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <Label>金額(円)</Label>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="例:12800"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <Label>
          用途 ・ 内容 <span className="text-rose-600">必須</span>
        </Label>
        <textarea
          rows={5}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="何のために、どのような効果を見込んで支出するか。"
          className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          <strong className="text-slate-800">AI の事前チェック:</strong>
          <br />
          申請後に「これ通るかな?」を AI と過去事例で確認します。
        </div>
      </div>
    </>
  );
}

/* -------- 経費 精算シート(事後・領収書) -------- */

function ExpenseSettleSheet({ item, onClose }: { item: ExpenseRequest; onClose: () => void }) {
  const { markSettled } = useApp();
  const [actual, setActual] = React.useState(String(item.amount));
  const [note, setNote] = React.useState("");
  const [hasReceipt, setHasReceipt] = React.useState(item.hasReceipt);

  function submit() {
    markSettled(item.id);
    onClose();
  }

  return (
    <>
      <SheetHeader
        title="経費を精算(事後)"
        onClose={onClose}
        right={
          <button
            onClick={submit}
            disabled={!hasReceipt}
            className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          >
            精算
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          <strong className="text-slate-800">{item.title}</strong> の精算
          <br />
          申請金額: ¥{item.amount.toLocaleString()}
        </div>

        <Label>実際の支出額(円)</Label>
        <input
          type="text"
          inputMode="numeric"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <Label>領収書</Label>
        <button
          onClick={() => setHasReceipt(true)}
          className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition ${
            hasReceipt
              ? "border-slate-900 bg-slate-50 text-slate-900"
              : "border-slate-300 bg-white text-slate-500 hover:border-slate-500"
          }`}
        >
          <Camera className="h-5 w-5" />
          {hasReceipt ? "領収書 添付済(タップで再撮影)" : "領収書を撮影 / 選択"}
        </button>

        <Label>精算メモ(任意)</Label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例:消費税込で +800 円の差異あり。レシート参照。"
          className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-4 text-[10px] text-slate-400">
          領収書を添付すると「精算」ボタンが有効になります。
        </div>
      </div>
    </>
  );
}

/* -------- 事例 詳細シート -------- */

function CaseDetailSheet({ item, onClose }: { item: CaseItem; onClose: () => void }) {
  return (
    <>
      <SheetHeader title="事例" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-0.5">
            <Building2 className="h-3 w-3" />
            {item.area}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Calendar className="h-3 w-3" />
            {item.year}
          </span>
          <span>・ {item.author}</span>
        </div>

        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800">
          {item.summary}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">KPI</div>
            <div className="mt-1 text-[12px] text-slate-800">{item.kpi}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">効果</div>
            <div className="mt-1 text-[12px] text-slate-800">{item.effect}</div>
          </div>
        </div>

        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">プロセス</div>
        <ol className="mt-2 space-y-2">
          {item.process.map((p, i) => (
            <li key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{p.phase}</div>
              <div className="mt-1 text-[12px] leading-relaxed text-slate-800">{p.body}</div>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">学び</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-800">{item.learning}</p>
        </div>
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          <button className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">保存</button>
          <button className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800">
            <Sparkles className="h-3.5 w-3.5" />
            自分の地域に翻案
          </button>
        </div>
      </div>
    </>
  );
}

/* -------- 活動内容(トピック)編集シート -------- */

function TopicEditSheet({ onClose }: { onClose: () => void }) {
  const { topics, addTopic, removeTopic } = useApp();
  const [input, setInput] = React.useState("");

  function add() {
    const v = input.trim();
    if (!v) return;
    addTopic(v);
    setInput("");
  }

  return (
    <>
      <SheetHeader
        title="活動内容を編集"
        onClose={onClose}
        right={
          <button onClick={onClose} className="text-[11px] font-bold text-slate-900 hover:underline">
            完了
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <p className="text-[11px] text-slate-500">
          あなた専用の活動テーマ。活動報告を書くときの選択肢として使われます。
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="例:商店街活性化"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
          />
          <button
            onClick={add}
            disabled={!input.trim()}
            className="rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            追加
          </button>
        </div>

        <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          登録中({topics.length})
        </div>
        {topics.length === 0 ? (
          <div className="mt-2 text-[11px] text-slate-400">まだ登録されていません</div>
        ) : (
          <ul className="mt-2 space-y-px">
            {topics.map((t) => (
              <li key={t} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-b-0">
                <span className="flex-1 text-[13px] text-slate-800">{t}</span>
                <button
                  onClick={() => removeTopic(t)}
                  className="text-[11px] text-slate-400 hover:text-rose-700"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* -------- メンターシート -------- */

function MentorSheet({ onClose }: { onClose: () => void }) {
  const [q, setQ] = React.useState(
    "古民家を借りて隊員仲間とコワーキングスペースを試作したい。活動費で家賃の一部を出せる?"
  );
  return (
    <>
      <SheetHeader title="AI メンター・あおい" onClose={onClose} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold tracking-tight">相談する</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          わからないこと・迷っていることを聞いてください
        </p>

        <textarea
          rows={3}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mt-6 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-[13px] focus:border-slate-900 focus:outline-none"
        />
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-900 bg-slate-900 px-5 py-2 text-[12px] font-bold text-white hover:bg-slate-800">
          <Sparkles className="h-3.5 w-3.5" />
          助言を見る
        </button>
        <div className="mt-4 text-[10px] text-slate-400">
          ※ AI は判定しません。視点と材料のみ提供します。
        </div>
      </div>
    </>
  );
}
