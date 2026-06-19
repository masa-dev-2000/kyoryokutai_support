"use client";

import * as React from "react";
import Link from "next/link";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import {
  Search,
  ChevronLeft,
  Sparkles,
  Pin,
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
  MessageSquare,
  Trash2,
  Pencil,
} from "lucide-react";

/* ============================================================
   v5 隊員アプリ ─ 検索エンジン型・4 機能(活動報告 / 月報 / 経費 / 事例)

   2026-06-12 改修(視線整理 + 相談ボタンの目的化):
   - 活動報告レイアウトの階層整理(今日=濃く、過去=薄く、見出しのみで誘導)
   - 月報カレンダーに経費を表示
   - Sheet をスタック化(日詳細「閉じる」→ カレンダーに戻る)
   - 2026 年 4 月分の活動データを追加(月切替で見られる)
   - 経費タブに「現在の使用状況」サマリ
   - 入力ごとのインライン相談ボタン(目的限定 AI 壁打ち)
   - ヘッダー相談ボタンを「相談メニュー」化(カテゴリ別エントリ)
   ============================================================ */

// ADR-020: 日報タブを廃止し「活動記録・経費・お知らせ・事例」の4タブに統合
type Tab = "report" | "expense" | "announce" | "case";

/* -------------------- 活動分類 -------------------- */

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
  type: string;
  topic: string;
  hours: number;
  body: string;
  date: string;
  time: string;
};

type DailyLogEntry = {
  id: string;
  date: string;
  note?: string;
  distanceKm?: number;
  expenseAmount?: number;
  feelingScore?: number;
};

// #56: 今日の手応え。「評価」ではなく「体力・気分」の自己申告にして
// 役場の目を気にした偽りを起きにくくする(エネルギー軸)。役場へは推移のみ共有する想定。
const FEELINGS: { score: number; emoji: string; label: string }[] = [
  { score: 1, emoji: "😴", label: "つかれた" },
  { score: 2, emoji: "🙂", label: "まあまあ" },
  { score: 3, emoji: "😊", label: "いい感じ" },
  { score: 4, emoji: "🔥", label: "充実" },
];
const feelingOf = (s?: number) => FEELINGS.find((f) => f.score === s);


type Report = {
  id: string;
  yearMonth: string;
  ym: string;
  status: "draft" | "submitted" | "approved";
  statusLabel: string;
};


// ADR-021: 経費カテゴリ(活動費・備品・通信費 等)。活動に紐づかない経費も第一級で扱う。
const EXPENSE_CATEGORIES = ["活動費", "旅費", "備品", "消耗品", "通信費", "謝金", "その他"];

type ExpenseRequest = {
  id: string;
  title: string;
  amount: number;
  purpose: string;
  status: "申請中" | "承認" | "差戻し" | "未精算" | "精算済";
  category?: string;
  aiNote: string;
  citation: { source: string; quote: string };
  createdAt: string;
  hasReceipt: boolean;
};


type CaseItem = {
  id: string;
  title: string;
  area: string;
  year: string;
  author: string;
  sourceUserId?: string | null;
  summary: string;
  kpi: string;
  effect: string;
  process: { phase: string; body: string }[];
  learning: string;
};


const ANNUAL_BUDGET = 2000000;

/* -------------------- 相談コンテキスト(目的別) -------------------- */

type ConsultContext =
  | { kind: "daily-write"; current: string }
  | { kind: "report-plan"; current: string }
  | { kind: "expense-purpose"; current: string; title?: string; amount?: string }
  | { kind: "case-find"; current: string }
  | { kind: "menu" };

const consultMeta: Record<Exclude<ConsultContext["kind"], "menu">, { title: string; intro: string; hint: string; mockReply: (cur: string) => string }> = {
  "daily-write": {
    title: "活動メモの整理",
    intro: "今書きたいことを 5W1H に沿って整理します。",
    hint: "誰と・どこで・何を・なぜ・どうやったか の順で。",
    mockReply: (cur) =>
      `【整理案】\n${cur ? `元の文章: ${cur.slice(0, 60)}...\n\n` : ""}・When: 日付・時間帯を明示\n・Where: 場所(具体的な施設名 / 地区名)\n・Who: 同席者・キーパーソン\n・What: 何をやったか(動詞で)\n・Why: 目的・背景\n・How: 次に繋げる方向\n\n例の構文:「{今日}{現場名}で{相手}と{活動}を実施。{目的}が背景。次は{次の行動}」`,
  },
  "report-plan": {
    title: "来月計画の壁打ち",
    intro: "今月の活動を踏まえて来月計画を整理します。",
    hint: "継続 / 新規 / 振り返り の 3 つに分けてみましょう。",
    mockReply: (cur) =>
      `【提案】\n${cur ? `元の計画: ${cur.slice(0, 60)}...\n\n` : ""}・継続: 進行中プロジェクトのマイルストーン明示(空き家バンク累計目標等)\n・新規: 今月の手応えから次月に試したい施策(移住者向け体験ツアー 等)\n・振り返り: 中間レビュー / KPI 確認の時期を 1 つ入れる\n\nそれぞれ 2 行ずつだと役場側が読みやすいです。`,
  },
  "expense-purpose": {
    title: "経費の用途を壁打ち",
    intro: "この経費が「活動費の趣旨」に沿うかを一緒に整理します。",
    hint: "目的 / 効果 / 過去事例 で組み立てるのが王道。",
    mockReply: (cur) =>
      `【用途案】\n${cur ? `元の文章: ${cur.slice(0, 60)}...\n\n` : ""}・目的: 何を達成したいか(KPI に対応する形で)\n・必要性: なぜ別の手段ではダメか\n・効果: 数値で見込みを書く(参加者 N 名、相談 N 件 等)\n・前例: 類似事例で承認実績があるかに触れる\n\n類似事例として「海士町 古民家コワーキング(2024)」が JOIN の Q&A に掲載されています。`,
  },
  "case-find": {
    title: "似た事例を探す",
    intro: "やりたいことに近い全国の事例を探します。",
    hint: "目的・地域規模・期間で絞ると見つかりやすいです。",
    mockReply: (cur) =>
      `【見つけた候補】\n${cur ? `相談内容: ${cur.slice(0, 60)}...\n\n` : ""}・養父市:「空き家バンクで 1 年目 12 件登録」─ 1 件目を取りに行く施策\n・海士町:「空き家清掃ボランティアの定着」─ 住民との関係構築\n・JOIN:「DIY 補助金との組み合わせ」─ 補助金活用スキーム\n\n下の「事例一覧へ」から詳細を確認できます。`,
  },
};

/* -------------------- Context -------------------- */

type Notice = { id: string; title: string; body: string; date: string; kind: string; isPinned: boolean; sender: string };

type Sheet =
  // ADR-020: date を指定するとその日付の活動として作成(カレンダー日付タップ起点)
  | { kind: "activity-create"; editing?: ActivityLog; date?: string }
  | { kind: "activity-detail"; log: ActivityLog }
  | { kind: "report-day"; date: string }
  | { kind: "report-detail"; report: Report }
  | { kind: "expense-detail"; item: ExpenseRequest }
  | { kind: "expense-create" }
  | { kind: "expense-settle"; item: ExpenseRequest }
  | { kind: "case-detail"; case: CaseItem }
  | { kind: "case-author"; userId: string; name: string; area: string }
  | { kind: "announce-detail"; notice: Notice }
  | { kind: "consult"; context: ConsultContext; onAdopt?: (text: string) => void }
  | { kind: "announcements" }
  | { kind: "rules-panel" }
  | { kind: "settings-menu" }
  | { kind: "profile" };

type TrendItem = { id: string; title: string; count: number };

// ADR-014 動線①:活動報告と一緒に登録する経費明細(複数可)
export type InlineExpense = {
  title?: string;
  amount: number;
  purpose: string;
  hasReceipt?: boolean;
  /** クライアント表示用のレシート画像 dataURL(本番では Storage に上げる、現状はプレビュー専用)*/
  receiptDataUrl?: string;
};

type FontLevel = "normal" | "large" | "xl";
const FONT_ZOOM: Record<FontLevel, number> = { normal: 1, large: 1.15, xl: 1.3 };

type Ctx = {
  logs: ActivityLog[];
  dailyLogs: DailyLogEntry[];
  fontLevel: FontLevel;
  setFontLevel: (l: FontLevel) => void;
  addDailyLog: (dl: {
    date: string;
    distanceKm?: number;
    feelingScore?: number;
    activities: { type: string; topic: string; hours: number; body: string }[];
    expenses?: InlineExpense[];
  }) => Promise<void>;
  addLog: (l: Omit<ActivityLog, "id">) => void | Promise<void>;
  updateLog: (id: string, patch: Partial<Omit<ActivityLog, "id">>) => void | Promise<void>;
  deleteLog: (id: string) => void | Promise<void>;
  topics: string[];
  addTopic: (t: string) => void;
  removeTopic: (t: string) => void;
  types: string[];
  addType: (t: string) => void;
  expenses: ExpenseRequest[];
  addExpense: (e: Omit<ExpenseRequest, "id" | "createdAt" | "aiNote" | "citation" | "hasReceipt">) => void | Promise<void>;
  markSettled: (id: string) => void;
  reports: Report[];
  caseItems: CaseItem[];
  trend: TrendItem[];
  notices: Notice[];
  rules: Notice[];
  sheets: Sheet[];
  pushSheet: (s: Sheet) => void;
  popSheet: () => void;
  closeAllSheets: () => void;
  /** スタックを畳んで指定日付の活動一覧シートだけを表示(活動保存後の遷移に使用) */
  showDay: (date: string) => void;
  plan: string;
  setPlan: (p: string) => void;
  memberId: string;
};

const DEMO_MEMBER_ID = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";

const AppCtx = React.createContext<Ctx | null>(null);
const useApp = () => {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("AppCtx missing");
  return c;
};

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("report");
  const [memberId, setMemberId] = React.useState(DEMO_MEMBER_ID);
  const [memberName, setMemberName] = React.useState<string | null>(null);
  // 初期値は空(マウント後にバックエンドの実データで置換)
  const [logs, setLogs] = React.useState<ActivityLog[]>([]);
  const [dailyLogs, setDailyLogs] = React.useState<DailyLogEntry[]>([]);
  const [topics, setTopics] = React.useState<string[]>(DEFAULT_TOPICS);
  // #48: 活動の種類。組み込み(ACTIVITY_TYPES)+ ユーザー追加分(kind=type)
  const [customTypes, setCustomTypes] = React.useState<string[]>([]);
  const [expenses, setExpenses] = React.useState<ExpenseRequest[]>([]);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [caseItems, setCaseItems] = React.useState<CaseItem[]>([]);
  const [trend, setTrend] = React.useState<TrendItem[]>([]);
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [rules, setRules] = React.useState<Notice[]>([]);
  const [sheets, setSheets] = React.useState<Sheet[]>([]);
  const [plan, setPlan] = React.useState(
    "・夏祭り当日の運営(7/14)\n・移住者向け体験ツアー初回開催(7/27)\n・空き家バンク累計 15 件を目標"
  );
  const [fontLevel, setFontLevelState] = React.useState<FontLevel>(() => {
    if (typeof window === "undefined") return "normal";
    return (localStorage.getItem("fontLevel") as FontLevel) ?? "normal";
  });
  const setFontLevel = (l: FontLevel) => {
    setFontLevelState(l);
    localStorage.setItem("fontLevel", l);
  };
  React.useEffect(() => {
    let el = document.getElementById("__font-zoom");
    if (!el) {
      el = document.createElement("style");
      el.id = "__font-zoom";
      document.head.appendChild(el);
    }
    // iOS Safari は html への zoom が効かないため body に適用する
    el.textContent = `body { zoom: ${FONT_ZOOM[fontLevel]}; }`;
  }, [fontLevel]);

  // セッションからログインユーザーの app userId を取得
  React.useEffect(() => {
    apiGet<{ authenticated: boolean; userId?: string; name?: string }>("/api/auth/me")
      .then((me) => {
        if (me.authenticated && me.userId) {
          setMemberId(me.userId);
          setMemberName(me.name ?? null);
        }
      })
      .catch(() => { /* 未ログイン or ネットワークエラー → デモ UUID のまま */ });
  }, []);

  // バックエンドから初期データ取得(Supabase + API Routes)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [lg, dl, tp, ty, ex, rp, cs, ns, rl] = await Promise.all([
          apiGet<ActivityLog[]>(`/api/activity-logs?userId=${memberId}`),
          apiGet<DailyLogEntry[]>(`/api/daily-logs?userId=${memberId}`),
          apiGet<string[]>(`/api/topics?userId=${memberId}`),
          apiGet<string[]>(`/api/topics?userId=${memberId}&kind=type`),
          apiGet<ExpenseRequest[]>(`/api/expenses?userId=${memberId}`),
          apiGet<Report[]>(`/api/monthly-reports?userId=${memberId}`),
          apiGet<{ cases: CaseItem[]; trend: TrendItem[] }>(`/api/cases`),
          apiGet<Notice[]>(`/api/announcements`),
          apiGet<Notice[]>(`/api/announcements?kinds=rule,qa`),
        ]);
        if (!alive) return;
        setLogs(lg);
        setDailyLogs(dl);
        setTopics(tp.length > 0 ? tp : DEFAULT_TOPICS);
        setCustomTypes(ty);
        setExpenses(ex);
        setReports(rp);
        setCaseItems(cs.cases);
        setTrend(cs.trend);
        setNotices(ns);
        setRules(rl);
      } catch {
        /* オフライン時はシードのまま */
      }
    })();
    return () => {
      alive = false;
    };
  }, [memberId]);

  const ctx: Ctx = {
    logs,
    dailyLogs,
    addDailyLog: async (input) => {
      const expenses = input.expenses?.map((e) => ({
        title: e.title,
        amount: e.amount,
        purpose: e.purpose,
        hasReceipt: !!e.hasReceipt,
      }));
      const result = await apiPost<{ dailyLog: DailyLogEntry; activities: ActivityLog[]; expensesCreated: number }>(
        "/api/daily-logs",
        { userId: memberId, ...input, expenses }
      );
      setDailyLogs((dls) => [result.dailyLog, ...dls.filter((d) => d.date !== result.dailyLog.date)]);
      setLogs((ls) => [...result.activities, ...ls]);
      if (result.expensesCreated > 0) {
        try {
          const ex = await apiGet<ExpenseRequest[]>(`/api/expenses?userId=${memberId}`);
          setExpenses(ex);
        } catch { /* noop */ }
      }
    },
    addLog: async (l) => {
      const created = await apiPost<ActivityLog>("/api/activity-logs", { userId: memberId, ...l });
      setLogs((ls) => [created, ...ls]);
    },
    updateLog: async (id, patch) => {
      const updated = await apiPatch<ActivityLog>(`/api/activity-logs/${id}`, { ...patch, userId: memberId } as Record<string, unknown>);
      setLogs((ls) => ls.map((l) => (l.id === id ? updated : l)));
      // 同月の月報が差し戻された可能性があるため再取得
      try {
        const rp = await apiGet<Report[]>(`/api/monthly-reports?userId=${memberId}`);
        setReports(rp);
      } catch { /* noop */ }
    },
    deleteLog: async (id) => {
      await apiDelete<null>(`/api/activity-logs/${id}?userId=${memberId}`);
      setLogs((ls) => ls.filter((l) => l.id !== id));
      // 同月の月報が差し戻された可能性があるため再取得
      try {
        const rp = await apiGet<Report[]>(`/api/monthly-reports?userId=${memberId}`);
        setReports(rp);
      } catch { /* noop */ }
    },
    topics,
    addTopic: async (t) => {
      const next = await apiPost<string[]>("/api/topics", { userId: memberId, name: t });
      setTopics(next);
    },
    removeTopic: async (t) => {
      const next = await apiDelete<string[]>(`/api/topics?userId=${memberId}&name=${encodeURIComponent(t)}`);
      setTopics(next);
    },
    // #48: 活動の種類(組み込み + ユーザー追加)
    types: [...ACTIVITY_TYPES, ...customTypes.filter((t) => !ACTIVITY_TYPES.includes(t))],
    addType: async (t) => {
      const next = await apiPost<string[]>("/api/topics", { userId: memberId, name: t, kind: "type" });
      setCustomTypes(next);
    },
    expenses,
    addExpense: async (e) => {
      const created = await apiPost<ExpenseRequest>("/api/expenses", { userId: memberId, ...e });
      setExpenses((es) => [created, ...es]);
    },
    markSettled: async (id) => {
      const updated = await apiPatch<ExpenseRequest>(`/api/expenses/${id}`, { status: "精算済", hasReceipt: true });
      setExpenses((es) => es.map((e) => (e.id === id ? updated : e)));
    },
    reports,
    caseItems,
    trend,
    notices,
    rules,
    sheets,
    pushSheet: (s) => setSheets((ss) => [...ss, s]),
    popSheet: () => setSheets((ss) => ss.slice(0, -1)),
    closeAllSheets: () => setSheets([]),
    showDay: (date) => setSheets([{ kind: "report-day", date }]),
    plan,
    setPlan,
    memberId,
    fontLevel,
    setFontLevel,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <main className="relative flex h-screen flex-col bg-white text-slate-900">
        {/* #49: ヘッダー + タブ欄を上部固定。Sheet は absolute inset-0 で zoom の影響下に置く */}
        <div className="sticky top-0 z-20 shrink-0 bg-white">
          <div className="mx-auto w-full max-w-2xl">
            <Header onSettings={() => setSheets([{ kind: "settings-menu" }])} userName={memberName} />
            <Tabs active={tab} onChange={setTab} unread={notices.length} />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-20">
          <div className="mx-auto w-full max-w-2xl flex-1 py-4">
            {tab === "report" && <ReportTab />}
            {tab === "expense" && <ExpenseTab />}
            {tab === "announce" && <AnnounceTab />}
            {tab === "case" && <CaseTab />}
          </div>
        </div>

        <SheetRoot />
      </main>
    </AppCtx.Provider>
  );
}

/* -------------------- Header / Tabs / Footer -------------------- */

function Header({ onSettings, userName }: { onSettings: () => void; userName?: string | null }) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/v5/login";
  }
  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
      <Link href="/v5" className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-3 w-3" />
        切替
      </Link>
      <div className="text-center text-[11px] text-slate-500">
        {userName ?? "田中 さくら"} / 新温泉町
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onSettings} className="p-1 text-slate-500 hover:text-slate-900" aria-label="設定">
          <SettingsIcon className="h-4 w-4" />
        </button>
        <button onClick={handleLogout} className="p-1 text-slate-400 hover:text-slate-700" aria-label="ログアウト" title="ログアウト">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function Tabs({ active, onChange, unread }: { active: Tab; onChange: (t: Tab) => void; unread: number }) {
  return (
    <nav className="flex items-center justify-center gap-1 border-b border-slate-100 px-5 py-1.5">
      <TabBtn label="活動記録" active={active === "report"} onClick={() => onChange("report")} />
      <TabBtn label="経費" active={active === "expense"} onClick={() => onChange("expense")} />
      <TabBtn label="お知らせ" active={active === "announce"} onClick={() => onChange("announce")} badge={unread > 0 ? unread : undefined} />
      <TabBtn label="事例" active={active === "case"} onClick={() => onChange("case")} />
    </nav>
  );
}

function TabBtn({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className={`relative px-4 py-1.5 text-[12px] font-semibold transition ${active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
      {label}
      {badge !== undefined && (
        <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-0.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
      {active && <span className="absolute bottom-[-7px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-slate-900" />}
    </button>
  );
}

/* -------------------- 日付ユーティリティ -------------------- */

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentYm() {
  return todayKey().slice(0, 7);
}

function shiftYm(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatYm(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return `${y} 年 ${m} 月`;
}

function formatDateShort(d: string) {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
}

/* -------------------- 2. 月報タブ -------------------- */

// ADR-020: 月報タブをカレンダー起点に。日付タップで活動の閲覧/作成へ。
function ReportTab() {
  const { pushSheet, logs } = useApp();
  const [ym, setYm] = React.useState<string>(currentYm());

  // カレンダー日付タップ:記録があれば一覧、なければ当日含めて作成シート
  function onDayTap(date: string) {
    const hasLogs = logs.some((l) => l.date === date);
    if (hasLogs) pushSheet({ kind: "report-day", date });
    else pushSheet({ kind: "activity-create", date });
  }

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">活動記録</h1>
        <p className="mt-1 text-[12px] text-slate-500">日付をタップして活動を記録・閲覧</p>
      </div>

      {/* 月セレクタ */}
      <div className="mt-5 flex items-center justify-center gap-2">
        <button
          onClick={() => setYm(shiftYm(ym, -1))}
          className="rounded-full border border-slate-300 bg-white p-1.5 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
          aria-label="前の月"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="inline-flex min-w-32 items-center justify-center gap-1.5 text-[15px] font-bold text-slate-900">
          <Calendar className="h-4 w-4 text-slate-400" />
          {formatYm(ym)}
        </div>
        <button
          onClick={() => setYm(shiftYm(ym, 1))}
          disabled={ym >= currentYm()}
          className="rounded-full border border-slate-300 bg-white p-1.5 text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
          aria-label="次の月"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* サマリー + カレンダー + グラフ */}
      <MonthOverview ym={ym} onDayTap={onDayTap} />

      {/* FAB: 当日の活動を追加(セカンダリ動線) */}
      <button
        onClick={() => pushSheet({ kind: "activity-create" })}
        className="absolute bottom-10 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
        style={{ right: "max(1.5rem, calc(50vw - 21rem + 1.5rem))" }}
        aria-label="今日の活動を追加"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

// ADR-020: サマリー→カレンダー→グラフの月次オーバービュー(月報タブ・月報詳細で共有)
function MonthOverview({ ym, onDayTap }: { ym: string; onDayTap: (date: string) => void }) {
  const { logs, dailyLogs } = useApp();
  const monthLogs = logs.filter((l) => l.date.startsWith(ym));
  const monthDailyLogs = dailyLogs.filter((d) => d.date.startsWith(ym));

  const totalHours = monthLogs.reduce((s, l) => s + l.hours, 0);
  const totalExpense = monthDailyLogs.reduce((s, d) => s + (d.expenseAmount ?? 0), 0);
  const byDate: Record<string, ActivityLog[]> = {};
  for (const l of monthLogs) (byDate[l.date] ??= []).push(l);

  // 活動時間:種類別(積算棒) — ACTIVITY_TYPES 順を優先し、それ以外は末尾に追加
  const byType: Record<string, number> = {};
  for (const l of monthLogs) byType[l.type] = (byType[l.type] ?? 0) + l.hours;
  const typeOrder = [
    ...ACTIVITY_TYPES.filter((t) => byType[t] > 0),
    ...Object.keys(byType).filter((t) => !ACTIVITY_TYPES.includes(t)),
  ];
  const hoursProgress = Math.min(totalHours / MIN_MONTHLY_HOURS, 1);
  const hoursRemain = Math.max(MIN_MONTHLY_HOURS - totalHours, 0);
  const hoursOver = Math.max(totalHours - MIN_MONTHLY_HOURS, 0);

  // 経費:カテゴリ(= 活動内容 topic)別合計(日報レベルの expenseAmount を使用)
  const byCat: Record<string, number> = {};
  for (const d of monthDailyLogs) {
    if (d.expenseAmount && d.expenseAmount > 0) {
      const dayLogs = byDate[d.date] ?? [];
      const key = dayLogs[0]?.topic ?? "その他";
      byCat[key] = (byCat[key] ?? 0) + d.expenseAmount;
    }
  }
  const catOrder = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const expBudgetPct = Math.min((totalExpense / MONTHLY_BUDGET) * 100, 100);

  const [yr, mo] = ym.split("-").map(Number);
  const startWeekday = new Date(yr, mo - 1, 1).getDay();
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const cells: ({ day: number; date: string; logs: ActivityLog[] } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${ym}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, date: dateStr, logs: byDate[dateStr] ?? [] });
  }

  return (
    <div className="mt-4 text-left">
      {/* カレンダー(日付タップで活動の閲覧/作成) */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">活動カレンダー</div>
          <div className="text-[9px] text-slate-400">日付タップで記録 / 右上=件数</div>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400">
          {["日", "月", "火", "水", "木", "金", "土"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((c, i) =>
            c === null ? <div key={i} /> : (
              <button
                key={i}
                onClick={() => onDayTap(c.date)}
                className={`relative aspect-square rounded-lg border p-1 text-left text-[10px] transition ${c.date === todayKey() ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : c.logs.length > 0 ? "border-slate-300 bg-white hover:border-slate-900 hover:shadow" : "border-slate-100 bg-slate-50/40 text-slate-300 hover:border-slate-400 hover:bg-white"}`}
              >
                <span className={`absolute left-1 top-0.5 font-bold ${c.logs.length > 0 ? "text-slate-700" : "text-slate-400"}`}>{c.day}</span>
                {c.logs.length > 0 ? (
                  <>
                    <span className="absolute right-1 top-0.5 text-[9px] font-bold text-slate-500">{c.logs.length}件</span>
                    <span className="absolute bottom-3 left-1 right-1 text-[9px] font-semibold text-slate-700">
                      {c.logs.reduce((s, l) => s + l.hours, 0)}h
                    </span>
                    {(() => { const d = monthDailyLogs.find((d) => d.date === c.date); return d?.expenseAmount ? <span className="absolute bottom-0.5 left-1 right-1 truncate text-[8px] text-slate-500">¥{Math.round(d.expenseAmount / 100) / 10}k</span> : null; })()}
                  </>
                ) : (
                  <Plus className="absolute bottom-1 right-1 h-2.5 w-2.5 text-slate-300" />
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* 活動時間:積算棒(種類別)+ 最低活動時間との比較 */}
      {typeOrder.length > 0 && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">活動時間(積算)</div>
            <div className="text-[10px] text-slate-500">
              <span className="font-bold text-slate-900 text-[12px]">{totalHours}h</span>
              <span className="mx-1 text-slate-400">/</span>
              <span>基準 {MIN_MONTHLY_HOURS}h</span>
              {hoursOver > 0 ? (
                <span className="ml-2 font-semibold text-slate-700">+{hoursOver}h 超過</span>
              ) : (
                <span className="ml-2 text-slate-500">残り {hoursRemain}h</span>
              )}
            </div>
          </div>

          <div className="mt-2 relative">
            <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
              {typeOrder.map((t) => {
                const w = (byType[t] / MIN_MONTHLY_HOURS) * 100;
                return (
                  <div
                    key={t}
                    className={`${TYPE_COLORS[t] ?? "bg-slate-400"} h-full`}
                    style={{ width: `${Math.min(w, 100)}%` }}
                    title={`${t}: ${byType[t]}h`}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex justify-end text-[10px] text-slate-500">
              {Math.round(hoursProgress * 100)}% 達成
            </div>
          </div>

          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            {typeOrder.map((t) => (
              <li key={t} className="inline-flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${TYPE_COLORS[t] ?? "bg-slate-400"}`} />
                <span className="text-slate-600">{t}</span>
                <span className="font-bold tabular-nums text-slate-800">{byType[t]}h</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 経費使用:カテゴリ別積算棒 + 月予算との比較 */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">経費使用(カテゴリ別積算)</div>
          <div className="text-[10px] text-slate-500">
            <span className="font-bold text-slate-900 text-[12px]">¥{totalExpense.toLocaleString()}</span>
            <span className="mx-1 text-slate-400">/</span>
            <span>月予算 ¥{(MONTHLY_BUDGET / 10000).toFixed(0)}万</span>
            <span className="ml-1 text-slate-400">({expBudgetPct.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="mt-2 relative">
          <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
            {catOrder.length === 0 ? (
              <div className="h-full w-full bg-slate-100" />
            ) : catOrder.map((cat, i) => {
              const w = (byCat[cat] / MONTHLY_BUDGET) * 100;
              const tone = ["bg-slate-900", "bg-slate-700", "bg-slate-500", "bg-slate-400", "bg-slate-300", "bg-slate-200"][i % 6];
              return (
                <div
                  key={cat}
                  className={`${tone} h-full`}
                  style={{ width: `${Math.min(w, 100)}%` }}
                  title={`${cat}: ¥${byCat[cat].toLocaleString()}`}
                />
              );
            })}
          </div>
        </div>

        {catOrder.length === 0 ? (
          <p className="mt-2 text-[11px] text-slate-400">申請 0件 ・ ¥0</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            {catOrder.map((cat, i) => (
              <li key={cat} className="inline-flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${["bg-slate-900", "bg-slate-700", "bg-slate-500", "bg-slate-400", "bg-slate-300", "bg-slate-200"][i % 6]}`} />
                <span className="text-slate-600">{cat}</span>
                <span className="font-bold tabular-nums text-slate-800">¥{byCat[cat].toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------- 3. 経費タブ(使用状況サマリ追加)-------------------- */

type ExpenseSubTab = "request" | "settle";

function ExpenseTab() {
  const { expenses, pushSheet } = useApp();
  const [sub, setSub] = React.useState<ExpenseSubTab>("request");
  const [q, setQ] = React.useState("");

  // ADR(#46): 経費使用状況をステータス別の積算で表示。
  // 使用額(メイン数字)= 清算済み合計(確定支出)。差戻しは集計に含めない。
  const sumByStatus = (s: ExpenseRequest["status"]) =>
    expenses.filter((e) => e.status === s).reduce((acc, e) => acc + e.amount, 0);
  const settledSum = sumByStatus("精算済");
  const approvedSum = sumByStatus("承認") + sumByStatus("未精算");
  const pendingSum = sumByStatus("申請中");
  const committedSum = settledSum + approvedSum + pendingSum; // 差戻しは除外
  const usedTotal = settledSum; // 使用額 = 清算済み
  const remaining = ANNUAL_BUDGET - committedSum; // 残予算はコミット済みベースで控除
  const pct = (settledSum / ANNUAL_BUDGET) * 100;
  // バーセグメント(左→右):清算済み → 承認済み → 申請中
  const segments = [
    { label: "清算済み", amount: settledSum, color: "bg-slate-700" },
    { label: "承認済み", amount: approvedSum, color: "bg-emerald-500" },
    { label: "申請中", amount: pendingSum, color: "bg-amber-400" },
  ].filter((seg) => seg.amount > 0);

  const matched = expenses.filter((e) => (q.trim() ? e.title.includes(q) || e.purpose.includes(q) : true));
  const requestItems = matched.filter((e) => ["申請中", "承認", "差戻し"].includes(e.status));
  const settleItems = matched.filter((e) => ["承認", "未精算", "精算済"].includes(e.status));
  const items = sub === "request" ? requestItems : settleItems;

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">経費</h1>
        <p className="mt-1 text-[12px] text-slate-500">申請(事前)と精算(事後)を分けて管理</p>
      </div>

      {/* 現在の使用状況 ─ ステータス別積算バー(#46) */}
      <section className="mx-auto mt-5 max-w-xl">
        <div className="flex items-baseline justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            経費使用(年度)
          </div>
          <div className="text-[11px] text-slate-500">
            <span className="font-bold text-slate-900">¥{(usedTotal / 10000).toFixed(1)}万</span>
            <span className="mx-0.5">/</span>
            <span>¥{(ANNUAL_BUDGET / 10000).toFixed(0)}万</span>
            <span className="ml-1.5 text-slate-400">{pct.toFixed(1)}%</span>
          </div>
        </div>
        <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-slate-100">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={`${seg.color} h-full`}
              style={{ width: `${Math.min((seg.amount / ANNUAL_BUDGET) * 100, 100)}%` }}
              title={`${seg.label}: ¥${seg.amount.toLocaleString()}`}
            />
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] text-slate-500">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {segments.map((seg) => (
              <li key={seg.label} className="inline-flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${seg.color}`} />
                <span className="text-slate-600">{seg.label}</span>
                <span className="font-bold tabular-nums text-slate-800">¥{seg.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <span>残り ¥{(remaining / 10000).toFixed(1)}万</span>
        </div>
        <p className="mt-1 text-[9px] text-slate-400">使用額=清算済み合計。残り=清算済み+承認済み+申請中を控除(差戻しは除く)。</p>
      </section>

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
                  onClick={() => sub === "settle" && (e.status === "承認" || e.status === "未精算") ? pushSheet({ kind: "expense-settle", item: e }) : pushSheet({ kind: "expense-detail", item: e })}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
                >
                  <Receipt className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1 px-1">
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                      {e.category && (
                        <span className="shrink-0 rounded-sm border border-slate-200 bg-slate-50 px-1 text-[10px] font-semibold text-slate-600">{e.category}</span>
                      )}
                      <span className="truncate">{e.title}</span>
                      <span className="ml-0.5 shrink-0 text-[11px] font-normal text-slate-500">¥{e.amount.toLocaleString()}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-slate-500">{e.purpose}</div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(e.status)}`}>{e.status}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => pushSheet({ kind: "expense-create" })}
        className="absolute bottom-10 z-30 inline-flex h-12 items-center gap-1.5 rounded-full bg-slate-900 px-5 text-[12px] font-bold text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
        style={{ right: "max(1.5rem, calc(50vw - 21rem + 1.5rem))" }}
      >
        <Plus className="h-4 w-4" />
        経費申請
      </button>
    </div>
  );
}

function SubTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex-1 rounded-full px-3 py-1 text-[12px] font-semibold transition ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>
      {label}
    </button>
  );
}

function statusClass(s: ExpenseRequest["status"]) {
  switch (s) {
    case "申請中": return "border-slate-300 bg-slate-50 text-slate-700";
    case "承認": return "border-slate-300 bg-white text-slate-700";
    case "差戻し": return "border-rose-200 bg-rose-50 text-rose-700";
    case "未精算": return "border-amber-200 bg-amber-50 text-amber-800";
    case "精算済": return "border-slate-300 bg-slate-900 text-white";
  }
}

/* -------------------- 3. お知らせタブ -------------------- */

function AnnounceTab() {
  const { notices, rules, memberId, pushSheet } = useApp();
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const all = [...notices, ...rules].sort((a, b) => b.date.localeCompare(a.date));

  const handleRead = async (id: string) => {
    if (readIds.has(id)) return;
    setReadIds((s) => new Set([...s, id]));
    await apiPost(`/api/announcements/${id}/read`, { userId: memberId });
  };

  if (all.length === 0) {
    return (
      <div className="py-16 text-center text-[13px] text-slate-400">
        役場からのお知らせはまだありません
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">お知らせ</h1>
        <p className="mt-1 text-[12px] text-slate-500">役場・担当課からのお知らせ</p>
      </div>
      <ul className="space-y-2">
        {all.map((n) => (
          <li
            key={n.id}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 cursor-pointer active:bg-slate-50"
            onClick={() => { handleRead(n.id); pushSheet({ kind: "announce-detail", notice: n }); }}
          >
            <div className="flex items-start gap-2">
              {n.isPinned && <Pin className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{n.date}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] text-slate-500">{n.sender}</span>
                  {!readIds.has(n.id) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
                <div className="mt-1 text-[13px] font-semibold text-slate-900">{n.title}</div>
                {n.body && <div className="mt-1 text-[12px] text-slate-600 whitespace-pre-wrap">{n.body}</div>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------- 4. 事例タブ(相談ボタン追加)-------------------- */

function CaseTab() {
  const { pushSheet, caseItems, trend } = useApp();
  const [q, setQ] = React.useState("");
  const matched = q.trim() ? caseItems.filter((c) => c.title.includes(q) || c.area.includes(q) || c.summary.includes(q)) : [];

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">事例</h1>
      <p className="mt-1 text-[12px] text-slate-500">全国の協力隊の活動から探す</p>

      <SearchBox value={q} onChange={setQ} placeholder="キーワード ・ 例:空き家 移住相談 観光協会" />

      <div className="mt-3 flex justify-center">
        <ConsultButton
          context={{ kind: "case-find", current: q }}
          label="やりたいことから探す"
        />
      </div>

      {q.trim() === "" ? (
        <div className="mt-5">
          <div className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">トレンド</div>
          <ul className="mt-1 space-y-px text-left">
            {trend.map((t) => (
              <li key={t.id} className="border-b border-slate-100 last:border-b-0">
                <button onClick={() => setQ(t.title)} className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60">
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
        <EmptyState message="該当する事例がありません。「やりたいことから探す」もお試しください。" />
      ) : (
        <ul className="mt-5 space-y-px text-left">
          {matched.map((c) => (
            <li key={c.id} className="border-b border-slate-100 last:border-b-0">
              <button onClick={() => pushSheet({ kind: "case-detail", case: c })} className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60">
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

/* -------------------- インライン相談ボタン -------------------- */

function ConsultButton({
  context,
  label = "AI と相談",
  onAdopt,
  className,
}: {
  context: ConsultContext;
  label?: string;
  onAdopt?: (text: string) => void;
  className?: string;
}) {
  const { pushSheet } = useApp();
  return (
    <button
      type="button"
      onClick={() => pushSheet({ kind: "consult", context, onAdopt })}
      className={`inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 ${className ?? ""}`}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </button>
  );
}

/* -------------------- Reusable -------------------- */

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition focus-within:border-slate-900 focus-within:shadow-md">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      {value && (
        <button onClick={() => onChange("")} className="text-slate-400 hover:text-slate-600">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center text-[12px] text-slate-500">{message}</div>;
}

function Label({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-center justify-between first:mt-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{children}</div>
      {right && <div>{right}</div>}
    </div>
  );
}

function SummaryCell({ value, label, suffix, icon }: { value: string; label: string; suffix?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      {icon && <div className="mx-auto flex h-5 w-5 items-center justify-center text-slate-400">{icon}</div>}
      <div className={`${icon ? "mt-1" : ""} text-[18px] font-black leading-none text-slate-900`}>
        {value}
        {suffix && <span className="ml-0.5 text-[10px] font-bold text-slate-500">{suffix}</span>}
      </div>
      <div className="mt-0.5 text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

/* -------------------- Sheets (スタック化) -------------------- */

function SheetRoot() {
  const { sheets, popSheet } = useApp();
  if (sheets.length === 0) return null;
  const sheet = sheets[sheets.length - 1];
  const close = () => popSheet();
  const stackDepth = sheets.length;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white">
      {sheet.kind === "activity-create" && <ActivityCreateSheet onClose={close} editing={sheet.editing} date={sheet.date} />}
      {sheet.kind === "report-day" && <ReportDaySheet date={sheet.date} onClose={close} depth={stackDepth} />}
      {sheet.kind === "report-detail" && <ReportDetailSheet report={sheet.report} onClose={close} />}
      {sheet.kind === "expense-detail" && <ExpenseDetailSheet item={sheet.item} onClose={close} />}
      {sheet.kind === "expense-create" && <ExpenseCreateSheet onClose={close} />}
      {sheet.kind === "expense-settle" && <ExpenseSettleSheet item={sheet.item} onClose={close} />}
      {sheet.kind === "case-detail" && <CaseDetailSheet item={sheet.case} onClose={close} />}
      {sheet.kind === "case-author" && <CaseAuthorSheet userId={sheet.userId} name={sheet.name} area={sheet.area} onClose={close} />}
      {sheet.kind === "consult" && <ConsultSheet context={sheet.context} onAdopt={sheet.onAdopt} onClose={close} />}
      {sheet.kind === "announce-detail" && <AnnounceDetailSheet notice={sheet.notice} onClose={close} />}
      {sheet.kind === "announcements" && <AnnouncementsSheet onClose={close} />}
      {sheet.kind === "rules-panel" && <RulesPanelSheet onClose={close} />}
      {sheet.kind === "settings-menu" && <SettingsMenuSheet onClose={close} />}
      {sheet.kind === "profile" && <ProfileSheet onClose={close} />}
    </div>
  );
}

function SheetHeader({ title, onClose, right, backLabel }: { title: string; onClose: () => void; right?: React.ReactNode; backLabel?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-5 py-2.5">
      <button onClick={onClose} className="inline-flex items-center gap-1 text-[12px] text-slate-700 hover:text-slate-900">
        {backLabel ? <ChevronLeft className="h-4 w-4" /> : <X className="h-4 w-4" />}
        {backLabel ?? "閉じる"}
      </button>
      <div className="text-[12px] font-semibold">{title}</div>
      <div className="min-w-12 text-right">{right}</div>
    </header>
  );
}

/* -------- チップ選択 + インライン追加(#48)-------- */

// 自由入力 + 過去の候補サジェスト方式。削除・リネームは不要。
function ChipPicker({
  options, selected, onSelect, onAdd, placeholder,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
  onAdd: (v: string) => void;
  placeholder: string;
}) {
  const [value, setValue] = React.useState(selected ?? "");
  const [focused, setFocused] = React.useState(false);

  const filtered = value.trim()
    ? options.filter((o) => o.includes(value.trim()) && o !== value.trim())
    : options.filter((o) => o !== selected);

  function commit(v: string) {
    const trimmed = v.trim();
    if (!trimmed) return;
    if (!options.includes(trimmed)) onAdd(trimmed);
    onSelect(trimmed);
    setValue(trimmed);
    setFocused(false);
  }

  return (
    <div className="relative mt-1">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); onSelect(e.target.value.trim()); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(value); } }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-100"
        />
        {selected && selected === value.trim() && (
          <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">{selected}</span>
        )}
      </div>
      {focused && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.slice(0, 8).map((o) => (
            <button
              key={o}
              type="button"
              onMouseDown={() => commit(o)}
              className="w-full px-3 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------- 今日の手応えピッカー(#56)-------- */
// 絵文字を 1 タップで選ぶだけ。もう一度押すと解除(任意項目)。
function FeelingPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="mt-1 grid grid-cols-4 gap-2">
      {FEELINGS.map((f) => {
        const active = value === f.score;
        return (
          <button
            key={f.score}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : f.score)}
            className={`flex flex-col items-center gap-0.5 rounded-xl border py-2 transition ${active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}
          >
            <span className="text-[22px] leading-none">{f.emoji}</span>
            <span className={`text-[10px] ${active ? "font-bold text-slate-900" : "text-slate-500"}`}>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------- 活動報告 作成シート -------- */
// 1 日報に複数の活動を登録できる。移動距離・経費・手応えは日報レベルで入力。

type InlineActivity = {
  type: string | null;
  topic: string | null;
  hours: string;
  body: string;
};

function ActivityCreateSheet({ onClose, editing, date }: { onClose: () => void; editing?: ActivityLog; date?: string }) {
  const { addDailyLog, updateLog, topics, addTopic, types, addType, showDay } = useApp();
  const isEdit = !!editing;
  const targetDate = editing?.date ?? date ?? todayKey();

  // 編集モード: 単一活動を編集
  const [editType, setEditType] = React.useState<string | null>(editing?.type ?? null);
  const [editTopic, setEditTopic] = React.useState<string | null>(editing?.topic ?? null);
  const [editHours, setEditHours] = React.useState<string>(editing ? String(editing.hours) : "1");
  const [editBody, setEditBody] = React.useState(editing?.body ?? "");

  // 新規モード: 複数活動 + 日報レベルフィールド
  const [activities, setActivities] = React.useState<InlineActivity[]>([
    { type: null, topic: null, hours: "1", body: "" },
  ]);
  const [distance, setDistance] = React.useState<string>("");
  const [feeling, setFeeling] = React.useState<number | null>(null);
  const [inlineExpenses, setInlineExpenses] = React.useState<InlineExpense[]>([]);
  const [saving, setSaving] = React.useState(false);

  function updateActivity(idx: number, patch: Partial<InlineActivity>) {
    setActivities((cur) => cur.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }
  function addActivity() {
    setActivities((cur) => [...cur, { type: null, topic: null, hours: "1", body: "" }]);
  }
  function removeActivity(idx: number) {
    setActivities((cur) => cur.filter((_, i) => i !== idx));
  }

  function addExpense() {
    setInlineExpenses((cur) => [...cur, { title: "", amount: 0, purpose: "", hasReceipt: false }]);
  }
  function updateExpense(idx: number, patch: Partial<InlineExpense>) {
    setInlineExpenses((cur) => cur.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  }
  function removeExpense(idx: number) {
    setInlineExpenses((cur) => cur.filter((_, i) => i !== idx));
  }
  async function onReceiptFile(idx: number, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateExpense(idx, { hasReceipt: true, receiptDataUrl: typeof reader.result === "string" ? reader.result : undefined });
    };
    reader.readAsDataURL(file);
  }

  const validExpenses = inlineExpenses.filter((e) => e.amount > 0 && e.purpose.trim().length > 0);
  const expenseSum = validExpenses.reduce((s, e) => s + e.amount, 0);
  const validActivities = activities.filter((a) => !!a.type && !!a.topic && parseFloat(a.hours) > 0);

  const canSave = isEdit
    ? !!editType && !!editTopic && parseFloat(editHours) > 0 && !saving
    : validActivities.length > 0 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateLog(editing!.id, {
          type: editType!,
          topic: editTopic!,
          hours: parseFloat(editHours),
          body: editBody.trim(),
        });
        showDay(editing!.date);
      } else {
        await addDailyLog({
          date: targetDate,
          distanceKm: distance ? parseFloat(distance) : undefined,
          feelingScore: feeling ?? undefined,
          activities: validActivities.map((a) => ({
            type: a.type!,
            topic: a.topic!,
            hours: parseFloat(a.hours),
            body: a.body.trim(),
          })),
          expenses: validExpenses.length > 0 ? validExpenses : undefined,
        });
        showDay(targetDate);
      }
    } catch {
      setSaving(false);
    }
  }

  if (isEdit) {
    return (
      <>
        <SheetHeader title="活動を編集" onClose={onClose} />
        <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
          <Label>活動の種類</Label>
          <ChipPicker options={types} selected={editType} onSelect={(c) => setEditType(c || null)} onAdd={(v) => { addType(v); setEditType(v); }} placeholder="例:研修、地域PR…" />
          <Label>活動内容</Label>
          <ChipPicker options={topics} selected={editTopic} onSelect={(c) => setEditTopic(c || null)} onAdd={(v) => { addTopic(v); setEditTopic(v); }} placeholder="例:商店街活性化…" />
          <Label>活動時間</Label>
          <div className="mt-1 flex items-center gap-2">
            <input type="number" step="0.5" min="0" value={editHours} onChange={(e) => setEditHours(e.target.value)} className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
            <span className="text-[12px] text-slate-600">時間</span>
          </div>
          <Label>メモ</Label>
          <textarea rows={4} value={editBody} onChange={(e) => setEditBody(e.target.value)} className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
        </div>
        <div className="border-t border-slate-200 bg-white px-5 py-3">
          <div className="mx-auto max-w-2xl">
            <button onClick={save} disabled={!canSave} className="w-full rounded-xl bg-slate-900 py-3 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
              {saving ? "更新中…" : "更新する"}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SheetHeader title={`${formatDateShort(targetDate)} の日報`} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">

        {/* 活動リスト */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">活動</span>
          <button type="button" onClick={addActivity} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-900 hover:bg-slate-50">
            <Plus className="h-3 w-3" />
            活動を追加
          </button>
        </div>

        <div className="space-y-3">
          {activities.map((a, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">活動 {i + 1}</span>
                {activities.length > 1 && (
                  <button type="button" onClick={() => removeActivity(i)} className="text-[10px] text-slate-400 hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-2">
                <Label>種類</Label>
                <ChipPicker options={types} selected={a.type} onSelect={(c) => updateActivity(i, { type: c || null })} onAdd={(v) => { addType(v); updateActivity(i, { type: v }); }} placeholder="例:研修、地域PR…" />
              </div>
              <div className="mt-2">
                <Label>内容</Label>
                <ChipPicker options={topics} selected={a.topic} onSelect={(c) => updateActivity(i, { topic: c || null })} onAdd={(v) => { addTopic(v); updateActivity(i, { topic: v }); }} placeholder="例:空き家バンク、移住相談…" />
              </div>
              <div className="mt-2 flex items-end gap-4">
                <div>
                  <Label>時間</Label>
                  <div className="mt-1 flex items-center gap-1.5">
                    <input type="number" step="0.5" min="0" value={a.hours} onChange={(e) => updateActivity(i, { hours: e.target.value })} className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
                    <span className="text-[12px] text-slate-600">h</span>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <Label>メモ</Label>
                <textarea rows={3} value={a.body} onChange={(e) => updateActivity(i, { body: e.target.value })} placeholder="例:A 邸を内覧、移住希望者と一緒に。築 80 年だが構造良好。" className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
              </div>
            </div>
          ))}
        </div>

        {/* 日報レベルのフィールド */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">今日のまとめ</div>

          <Label>移動距離(任意)</Label>
          <div className="mt-1 flex items-center gap-2">
            <input type="number" step="0.1" min="0" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="例:12.5" className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
            <span className="text-[12px] text-slate-600">km</span>
          </div>

          <Label>今日の手応え(任意)</Label>
          <FeelingPicker value={feeling} onChange={setFeeling} />
          <div className="mt-1 text-[10px] text-slate-400">
            「今日のコンディション」です。役場には推移だけが共有されます。
          </div>

          <Label
            right={
              <button type="button" onClick={addExpense} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-900 hover:bg-slate-50">
                <Plus className="h-3 w-3" />
                経費を追加
              </button>
            }
          >
            💴 経費(任意)
          </Label>
          {inlineExpenses.length === 0 ? (
            <div className="mt-1 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-[11px] text-slate-500">
              支出があれば「<strong>+ 経費を追加</strong>」
            </div>
          ) : (
            <ul className="mt-1 space-y-2">
              {inlineExpenses.map((e, i) => (
                <li key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">明細 #{i + 1}</div>
                    <button onClick={() => removeExpense(i)} className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] text-slate-400 hover:bg-rose-50 hover:text-rose-700">
                      <Trash2 className="h-3 w-3" />削除
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500">タイトル(任意)</label>
                      <input type="text" value={e.title ?? ""} onChange={(ev) => updateExpense(i, { title: ev.target.value })} placeholder="例:ボールペン" className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-slate-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">金額 <span className="text-rose-600">必須</span></label>
                      <input type="number" min="0" value={e.amount || ""} onChange={(ev) => updateExpense(i, { amount: parseInt(ev.target.value || "0", 10) })} placeholder="円" className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-slate-900 focus:outline-none" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] text-slate-500">用途 <span className="text-rose-600">必須</span></label>
                    <input type="text" value={e.purpose} onChange={(ev) => updateExpense(i, { purpose: ev.target.value })} placeholder="例:町報の写真撮影で使用" className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-slate-900 focus:outline-none" />
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] text-slate-500">レシート(任意)</label>
                    <div className="mt-0.5 flex items-center gap-2">
                      <label className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${e.hasReceipt ? "border-slate-900 bg-slate-50 text-slate-900" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}>
                        <Camera className="h-3 w-3" />
                        {e.hasReceipt ? "添付済" : "画像を選択"}
                        <input type="file" accept="image/*" capture="environment" onChange={(ev) => onReceiptFile(i, ev.target.files?.[0] ?? null)} className="hidden" />
                      </label>
                    </div>
                    {e.receiptDataUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={e.receiptDataUrl} alt="レシート" className="mt-2 max-h-32 rounded-lg border border-slate-200" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {validExpenses.length > 0 && (
            <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-slate-600">
              <Receipt className="h-3 w-3 text-slate-400" />
              <span>合計 ¥{expenseSum.toLocaleString()} を経費申請として記録</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-5 py-3">
        <div className="mx-auto max-w-2xl">
          <button onClick={save} disabled={!canSave} className="w-full rounded-xl bg-slate-900 py-3 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
            {saving ? "記録中…" : `${validActivities.length} 件の活動を記録する`}
          </button>
        </div>
      </div>
    </>
  );
}

/* -------- 活動報告 詳細シート -------- */

function ActivityDetailSheet({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  const { pushSheet, deleteLog, popSheet } = useApp();
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!confirm("この活動報告を削除しますか?")) return;
    setDeleting(true);
    try {
      await deleteLog(log.id);
      popSheet(); // 詳細を閉じる
    } catch {
      setDeleting(false);
    }
  }
  return (
    <>
      <SheetHeader
        title="活動報告"
        onClose={onClose}
        right={
          <button
            onClick={() => pushSheet({ kind: "activity-create", editing: log })}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-900 hover:bg-slate-50"
          >
            <Pencil className="h-3 w-3" />
            編集
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>{formatDateShort(log.date)}</span>
          <span>・</span>
          <span>{log.time}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700">{log.type}</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{log.topic}</span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            {log.hours} 時間
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800">{log.body}</p>

        <div className="mt-8 border-t border-slate-100 pt-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] text-red-500 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "削除中…" : "この活動報告を削除する"}
          </button>
        </div>
      </div>
    </>
  );
}

/* -------- 計画フォームのフィールド -------- */
function PlanField({
  label, sub, value, placeholder, onChange,
}: { label: string; sub: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-baseline gap-2">
        <div className="text-[11px] font-bold text-slate-900">{label}</div>
        <div className="text-[10px] text-slate-500">{sub}</div>
      </div>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] leading-relaxed focus:border-slate-900 focus:outline-none"
      />
    </div>
  );
}

/* -------- 来月計画フォーム ヘルパ -------- */
// 既存 plan(自由テキスト)を 3 セクション(継続/新規/振り返り)に分割する。
// 既存セッション互換のため、見出し未検出の場合は全部「継続」に入れる。
type PlanForm = { continueText: string; newText: string; reviewText: string };
function parsePlan(text: string): PlanForm {
  const t = text ?? "";
  const re = /^[\s#\-・]*(継続|新規|振り返り)\s*[::]?\s*$/m;
  if (!re.test(t)) return { continueText: t, newText: "", reviewText: "" };
  const parts = t.split(/\n(?=[\s#\-・]*(?:継続|新規|振り返り)\s*[::]?\s*$)/m);
  const out: PlanForm = { continueText: "", newText: "", reviewText: "" };
  for (const part of parts) {
    const m = part.match(/^[\s#\-・]*(継続|新規|振り返り)\s*[::]?\s*\n?([\s\S]*)$/m);
    if (!m) continue;
    const body = (m[2] ?? "").trim();
    if (m[1] === "継続") out.continueText = body;
    else if (m[1] === "新規") out.newText = body;
    else if (m[1] === "振り返り") out.reviewText = body;
  }
  return out;
}
function formatPlan(f: PlanForm): string {
  const sections: string[] = [];
  if (f.continueText.trim()) sections.push(`継続:\n${f.continueText.trim()}`);
  if (f.newText.trim()) sections.push(`新規:\n${f.newText.trim()}`);
  if (f.reviewText.trim()) sections.push(`振り返り:\n${f.reviewText.trim()}`);
  return sections.join("\n\n");
}

/* -------- 月報詳細(カレンダー + 経費表示)-------- */

// 種類別カラー(積算バーで重ねる用)。色は限定的に増やさない方針(設計原則 3)に
// 反するが、月報の積算グラフだけは識別性が必要なので slate トーンの濃淡で表現する。
const TYPE_COLORS: Record<string, string> = {
  会議:       "bg-slate-900",
  出張:       "bg-slate-700",
  現場訪問:   "bg-slate-500",
  広報:       "bg-slate-400",
  内勤:       "bg-slate-300",
  イベント:   "bg-slate-600",
  振り返り:   "bg-slate-800",
  その他:     "bg-slate-200",
};

// 月の最低活動時間(協力隊の活動基準:週 30h × 4 週 ≒ 120h を目安。自治体設定で上書き予定)
const MIN_MONTHLY_HOURS = 120;
const MONTHLY_BUDGET = 200000;

function ReportDetailSheet({ report, onClose }: { report: Report; onClose: () => void }) {
  const { plan, setPlan } = useApp();
  const ym = report.ym;

  // カレンダー日付クリックで開くローカルポップアップ
  const [dayPopup, setDayPopup] = React.useState<string | null>(null);

  // 計画 AI 生成(今月の活動から来月計画たたき台を生成)
  const [polishingPlan, setPolishingPlan] = React.useState(false);
  async function brushUpPlan() {
    if (polishingPlan) return;
    setPolishingPlan(true);
    try {
      const r = await apiPost<{ reply: string }>("/api/ai/consult", {
        context: "polish-memo",
        payload: { current: plan || `【${ym}月の活動まとめから来月の計画を作成してください】` },
      });
      setPlan(r.reply.trim());
    } catch {
      /* noop */
    } finally {
      setPolishingPlan(false);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* カレンダー日クリックで開くローカルポップアップ(背景に月報詳細が見える) */}
      {dayPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40"
          onClick={() => setDayPopup(null)}
        >
          <div
            className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ReportDaySheet date={dayPopup} onClose={() => setDayPopup(null)} depth={0} />
          </div>
        </div>
      )}
      <SheetHeader title={report.yearMonth} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${report.status === "draft" ? "border-slate-300 bg-slate-50 text-slate-700" : report.status === "submitted" ? "border-slate-300 bg-white text-slate-700" : "border-slate-300 bg-slate-900 text-white"}`}>
            {report.status === "draft" ? "下書き" : report.status === "submitted" ? "提出済" : "承認済"}
          </span>
          <span className="text-[11px] text-slate-500">{report.statusLabel}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">{report.yearMonth}</h1>

        {/* サマリー + カレンダー + グラフ(月報タブと共通) */}
        <MonthOverview ym={ym} onDayTap={(d) => setDayPopup(d)} />

        {/* 来月の計画 */}
        <Label
          right={
            <button
              type="button"
              onClick={brushUpPlan}
              disabled={polishingPlan}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 disabled:text-slate-300"
            >
              <Sparkles className="h-3 w-3" />
              {polishingPlan ? "考え中…" : "AI に起こしてもらう"}
            </button>
          }
        >
          来月の計画
        </Label>
        <textarea
          rows={4}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder={"完了したこと・継続すること・新しく取り組むことを自由に書いてください\n\nAI ボタンで今月の活動からたたき台を生成できます"}
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-slate-400"
        />
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          {report.status === "draft" ? (
            <button className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800">
              <Check className="h-3.5 w-3.5" />
              役場に提出
            </button>
          ) : (
            <button className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">PDF 出力</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportDaySheet({ date, onClose, depth }: { date: string; onClose: () => void; depth: number }) {
  const { logs, dailyLogs, pushSheet } = useApp();
  const items = logs.filter((l) => l.date === date);
  const dl = dailyLogs.find((d) => d.date === date);
  const totalHours = items.reduce((s, l) => s + l.hours, 0);

  return (
    <>
      <SheetHeader title={`${formatDateShort(date)} の活動`} onClose={onClose} backLabel={depth > 1 ? "カレンダー" : undefined} />
      <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-5 py-4">
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>{items.length} 件 ・ {totalHours} 時間</span>
          {dl?.distanceKm != null && <span>・ {dl.distanceKm} km</span>}
          {dl?.expenseAmount != null && dl.expenseAmount > 0 && <span>・ 経費 ¥{dl.expenseAmount.toLocaleString()}</span>}
          {dl && feelingOf(dl.feelingScore) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <span className="text-[13px] leading-none">{feelingOf(dl.feelingScore)!.emoji}</span>
              <span>{feelingOf(dl.feelingScore)!.label}</span>
            </span>
          )}
        </div>
        <ul className="mt-3 space-y-2">
          {items.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => pushSheet({ kind: "activity-create", editing: l })}
                className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-900 hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700">{l.type}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{l.topic}</span>
                  <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    {l.hours}h
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-800">{l.body}</p>
                <div className="mt-2 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 transition group-hover:text-slate-700">
                    <Pencil className="h-3 w-3" />
                    タップで編集
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {items.length === 0 && (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-[12px] text-slate-500">
            この日の記録はまだありません
          </div>
        )}

        {/* ADR-020: ReportDaySheet から当該日付の活動を追加 */}
        <button
          onClick={() => pushSheet({ kind: "activity-create", date })}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-3 text-[12px] font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
        >
          <Plus className="h-4 w-4" />
          この日の活動を追加
        </button>

      </div>
      </div>
    </>
  );
}

/* -------- 経費 詳細シート -------- */

function ExpenseDetailSheet({ item, onClose }: { item: ExpenseRequest; onClose: () => void }) {
  const { pushSheet } = useApp();
  const [aiNote, setAiNote] = React.useState<string>(item.aiNote);
  const [citation, setCitation] = React.useState(item.citation);
  const [loading, setLoading] = React.useState(false);

  async function recheck() {
    setLoading(true);
    try {
      const r = await apiPost<{ aiNote: string; citations: { source: string; quote: string }[] }>(
        "/api/ai/expense-check",
        { title: item.title, amount: item.amount, purpose: item.purpose }
      );
      setAiNote(r.aiNote);
      if (r.citations?.[0]) setCitation(r.citations[0]);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <SheetHeader title="経費申請の詳細" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">{item.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(item.status)}`}>{item.status}</span>
          <span className="text-[11px] text-slate-500">¥{item.amount.toLocaleString()} ・ 起票 {item.createdAt}</span>
        </div>

        <Label>申請内容 ・ 用途</Label>
        <p className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800">{item.purpose}</p>

        <Label
          right={
            <button
              type="button"
              onClick={recheck}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Sparkles className="h-3 w-3" />
              {loading ? "確認中…" : "AI に再確認"}
            </button>
          }
        >
          AI 判定材料
        </Label>
        <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
          <p className="text-[12px] leading-relaxed text-slate-800">{aiNote}</p>
          <div className="mt-1 text-[10px] text-slate-400">※ AI は判定しません。視点と材料のみ提供します。</div>
        </div>

        {citation.quote && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] font-semibold text-slate-700">{citation.source}</div>
            <div className="mt-1 flex items-start gap-1.5 text-[12px] text-slate-600">
              <Quote className="mt-0.5 h-3 w-3 shrink-0 text-slate-300" />
              <span className="leading-snug">{citation.quote}</span>
            </div>
          </div>
        )}

        <Label>類似の過去申請</Label>
        <ul className="mt-1 space-y-px">
          <li className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-b-0">
            <Receipt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1 text-[12px] text-slate-700">佐用町 拠点賃借 月 4 万円 → 承認</div>
          </li>
          <li className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-b-0">
            <Receipt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1 text-[12px] text-slate-700">海士町 古民家コワーキング → 承認(週 1 開放条件)</div>
          </li>
        </ul>

        {item.status === "承認" || item.status === "未精算" ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
            <strong>未精算です。</strong> 支出が確定したら「精算」サブタブから領収書を添付して精算してください。
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          {item.status === "承認" || item.status === "未精算" ? (
            <button onClick={() => pushSheet({ kind: "expense-settle", item })} className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800">
              <Receipt className="h-3.5 w-3.5" />
              精算する
            </button>
          ) : (
            <button onClick={onClose} className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">閉じる</button>
          )}
        </div>
      </div>
    </>
  );
}

/* -------- 経費 申請シート(用途欄に相談ボタン) -------- */

function ExpenseCreateSheet({ onClose }: { onClose: () => void }) {
  const { addExpense, pushSheet } = useApp();
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [category, setCategory] = React.useState<string>(EXPENSE_CATEGORIES[0]);
  const [saving, setSaving] = React.useState(false);
  const amountNum = parseInt(amount.replace(/[^0-9]/g, ""), 10);
  const canSubmit = !!title.trim() && amountNum > 0 && purpose.trim().length >= 5 && !saving;

  async function submit() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await addExpense({ title: title.trim(), amount: amountNum, purpose: purpose.trim(), status: "申請中", category });
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <SheetHeader title="経費を申請(事前)" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">事前申請(支出前)</div>
          <button
            type="button"
            onClick={() => pushSheet({ kind: "rules-panel" })}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50"
            title="この経費が通るかどうかの自治体ルールを見る"
          >
            📖 ルールを見る
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          <strong className="text-slate-800">この画面は「事前申請」です。</strong>
          <br />
          支出する前に内容と金額を申請します。領収書は支出後に「精算」サブタブから登録してください。
        </div>

        <Label right={
          <button
            type="button"
            onClick={async () => {
              if (!purpose.trim()) return;
              try {
                const r = await apiPost<{ title: string }>("/api/ai/expense-title", { purpose: purpose.trim(), amount: amountNum || undefined });
                if (r.title) setTitle(r.title);
              } catch { /* noop */ }
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50"
          >
            <Sparkles className="h-3 w-3" />
            AI でタイトル生成
          </button>
        }>
          タイトル
        </Label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="用途を書いてから「AI でタイトル生成」、または直接入力" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />

        <Label>カテゴリ</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${category === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-slate-400">活動に紐づかない経費(備品・通信費など)もここから申請できます。</p>

        <Label>金額(円)</Label>
        <input type="text" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="例:12800" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />

        <Label right={
          <ConsultButton
            context={{ kind: "expense-purpose", current: purpose, title, amount }}
            label="用途を相談"
            onAdopt={(t) => setPurpose(t)}
          />
        }>
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
          申請後に「これ通るかな?」を AI と過去事例で確認します。用途に迷ったら上の「用途を相談」を。
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-[13px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {saving ? "申請中…" : "申請する"}
        </button>
      </div>
    </>
  );
}

/* -------- 経費 精算シート -------- */

function ExpenseSettleSheet({ item, onClose }: { item: ExpenseRequest; onClose: () => void }) {
  const { markSettled } = useApp();
  const [actual, setActual] = React.useState(String(item.amount));
  const [note, setNote] = React.useState("");
  const [hasReceipt, setHasReceipt] = React.useState(item.hasReceipt);

  async function submit() {
    await markSettled(item.id);
    onClose();
  }

  return (
    <>
      <SheetHeader
        title="経費を精算(事後)"
        onClose={onClose}
        right={
          <button onClick={submit} disabled={!hasReceipt} className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300">
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
        <input type="text" inputMode="numeric" value={actual} onChange={(e) => setActual(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />

        <Label>領収書</Label>
        <button onClick={() => setHasReceipt(true)} className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition ${hasReceipt ? "border-slate-900 bg-slate-50 text-slate-900" : "border-slate-300 bg-white text-slate-500 hover:border-slate-500"}`}>
          <Camera className="h-5 w-5" />
          {hasReceipt ? "領収書 添付済(タップで再撮影)" : "領収書を撮影 / 選択"}
        </button>

        <Label>精算メモ(任意)</Label>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例:消費税込で +800 円の差異あり。レシート参照。" className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />

        <div className="mt-4 text-[10px] text-slate-400">領収書を添付すると「精算」ボタンが有効になります。</div>
      </div>
    </>
  );
}

/* -------- 事例 詳細シート -------- */

function CaseDetailSheet({ item, onClose }: { item: CaseItem; onClose: () => void }) {
  const { pushSheet } = useApp();
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
          {item.sourceUserId ? (
            <button
              type="button"
              onClick={() => pushSheet({ kind: "case-author", userId: item.sourceUserId!, name: item.author, area: item.area })}
              className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
            >
              ・ {item.author} →
            </button>
          ) : (
            <span>・ {item.author}</span>
          )}
        </div>

        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800">{item.summary}</p>

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

/* -------- 事例著者プロフィールシート -------- */

function CaseAuthorSheet({ userId, name, area, onClose }: { userId: string; name: string; area: string; onClose: () => void }) {
  const [profile, setProfile] = React.useState<{ name: string; municipality: string; bio?: string; assigned_at?: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiGet<{ name: string; municipality: string; bio?: string; assigned_at?: string }>(`/api/users/${userId}/profile`)
      .then(setProfile)
      .catch(() => setProfile({ name, municipality: area }))
      .finally(() => setLoading(false));
  }, [userId, name, area]);

  return (
    <>
      <SheetHeader title="著者プロフィール" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-[13px] text-slate-400">読み込み中…</div>
        ) : profile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-600">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{profile.name}</div>
                <div className="text-[12px] text-slate-500">{profile.municipality}</div>
                {profile.assigned_at && (
                  <div className="text-[11px] text-slate-400">着任: {profile.assigned_at.slice(0, 7)}</div>
                )}
              </div>
            </div>
            {profile.bio && (
              <p className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-[13px] leading-relaxed text-slate-800">{profile.bio}</p>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}

/* -------- 設定メニューシート -------- */

function SettingsMenuSheet({ onClose }: { onClose: () => void }) {
  const { pushSheet, fontLevel, setFontLevel } = useApp();
  // #48: 「活動内容を編集」は廃止。活動の種類・テーマは記録フォーム内の「+追加」で管理する。
  const items = [
    { label: "プロフィール", desc: "名前・自治体・自己紹介を編集", icon: <SettingsIcon className="h-4 w-4" />, action: () => pushSheet({ kind: "profile" }) },
  ];
  const fontOptions: { level: FontLevel; label: string; size: string }[] = [
    { level: "normal", label: "標準", size: "text-[13px]" },
    { level: "large", label: "大", size: "text-[16px]" },
    { level: "xl", label: "特大", size: "text-[19px]" },
  ];
  return (
    <>
      <SheetHeader title="設定" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        {/* 文字サイズ */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">文字の大きさ</div>
          <div className="flex gap-2">
            {fontOptions.map((opt) => (
              <button
                key={opt.level}
                onClick={() => setFontLevel(opt.level)}
                className={`flex-1 rounded-lg border py-2 transition ${fontLevel === opt.level ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"}`}
              >
                <span className={opt.size}>あ</span>
                <div className="mt-0.5 text-[10px] opacity-70">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <button
                onClick={item.action}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-900 hover:bg-slate-50/60"
              >
                <span className="text-slate-400">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-slate-900">{item.label}</div>
                  <div className="text-[11px] text-slate-500">{item.desc}</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* -------- プロフィールシート -------- */

function ProfileSheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = React.useState("田中 あかり");
  const [municipality, setMunicipality] = React.useState("新温泉町");
  const [startDate, setStartDate] = React.useState("2026-04-01");
  const [bio, setBio] = React.useState("");
  const [goal, setGoal] = React.useState("");

  return (
    <>
      <SheetHeader title="プロフィール" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col items-center gap-2 pb-6 border-b border-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-[28px]">
            🧑‍🌾
          </div>
          <div className="text-[15px] font-bold text-slate-900">{name || "—"}</div>
          <div className="text-[12px] text-slate-500">{municipality} 地域おこし協力隊</div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">名前</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">自治体</label>
            <input type="text" value={municipality} onChange={(e) => setMunicipality(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">着任日</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">自己紹介</label>
            <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="活動の背景や得意なことを書いてみましょう" className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">目標</label>
            <textarea rows={3} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="任期中に達成したいことを書いてみましょう" className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-slate-900 py-3 text-[13px] font-bold text-white transition hover:bg-slate-800"
        >
          保存
        </button>
      </div>
    </>
  );
}

/* -------- 相談シート(目的別 + メニュー) -------- */

function ConsultSheet({ context, onAdopt, onClose }: { context: ConsultContext; onAdopt?: (text: string) => void; onClose: () => void }) {
  const { pushSheet, popSheet } = useApp();

  // メニューモード
  if (context.kind === "menu") {
    return (
      <>
        <SheetHeader title="相談メニュー" onClose={onClose} />
        <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
          <p className="text-[12px] text-slate-500">どの場面で AI に相談しますか?目的を選ぶと、的を絞った提案が出やすくなります。</p>

          <ul className="mt-4 space-y-2">
            <MenuEntry
              icon={<FileText className="h-4 w-4" />}
              title="活動メモを整理したい"
              sub="5W1H に沿って文章を整える"
              onClick={() => {
                popSheet();
                pushSheet({ kind: "consult", context: { kind: "daily-write", current: "" } });
              }}
            />
            <MenuEntry
              icon={<Calendar className="h-4 w-4" />}
              title="来月の計画を考えたい"
              sub="今月の振り返りから提案"
              onClick={() => {
                popSheet();
                pushSheet({ kind: "consult", context: { kind: "report-plan", current: "" } });
              }}
            />
            <MenuEntry
              icon={<Wallet className="h-4 w-4" />}
              title="経費の用途を文章にしたい"
              sub="活動費の趣旨と過去事例から整理"
              onClick={() => {
                popSheet();
                pushSheet({ kind: "consult", context: { kind: "expense-purpose", current: "" } });
              }}
            />
            <MenuEntry
              icon={<Lightbulb className="h-4 w-4" />}
              title="似た事例を探したい"
              sub="やりたいことに近い全国の事例"
              onClick={() => {
                popSheet();
                pushSheet({ kind: "consult", context: { kind: "case-find", current: "" } });
              }}
            />
          </ul>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
            <strong className="text-slate-800">なぜ目的で分けるか:</strong>
            <br />
            全体的な相談より、用途を絞ったほうが AI の精度が上がります。入力欄の隣にある「相談」ボタンからでも同じシートを開けます。
          </div>
        </div>
      </>
    );
  }

  // 目的別モード
  const meta = consultMeta[context.kind];
  return (
    <ConsultInner context={context} meta={meta} onAdopt={onAdopt} onClose={onClose} />
  );
}

function ConsultInner({
  context,
  meta,
  onAdopt,
  onClose,
}: {
  context: Exclude<ConsultContext, { kind: "menu" }>;
  meta: { title: string; intro: string; hint: string; mockReply: (cur: string) => string };
  onAdopt?: (text: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = React.useState(context.current ?? "");
  const [reply, setReply] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function ask() {
    setLoading(true);
    try {
      const payload =
        context.kind === "expense-purpose"
          ? { current: input, title: context.title, amount: context.amount }
          : { current: input };
      const res = await apiPost<{ reply: string }>("/api/ai/consult", { context: context.kind, payload });
      setReply(res.reply);
    } catch {
      // AI 未接続時はローカルのひな形にフォールバック
      setReply(meta.mockReply(input));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SheetHeader title={meta.title} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          <strong className="text-slate-800">{meta.intro}</strong>
          <br />
          {meta.hint}
        </div>

        <Label>あなたの素材 ・ 質問</Label>
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="今書いている文章や、相談したい内容を入れてください"
          className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={ask}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-900 bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? "考え中…" : "助言を見る"}
          </button>
          <span className="text-[10px] text-slate-400">※ AI は判定しません。視点と材料のみ</span>
        </div>

        {reply && (
          <>
            <Label>提案</Label>
            <div className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[12px] leading-relaxed text-slate-800">
              {reply}
            </div>
            {onAdopt && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <button onClick={() => setReply(null)} className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-500">
                  もう一度
                </button>
                <button
                  onClick={() => {
                    onAdopt(reply);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800"
                >
                  <Check className="h-3.5 w-3.5" />
                  反映して閉じる
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

/* -------- お知らせ詳細シート -------- */

function AnnounceDetailSheet({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  return (
    <>
      <SheetHeader title="お知らせ詳細" onClose={onClose} backLabel="戻る" />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{notice.date}</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">{notice.sender}</span>
          {notice.isPinned && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">ピン留め</span>}
        </div>
        <h2 className="mt-3 text-[18px] font-bold text-slate-900">{notice.title}</h2>
        {notice.body && (
          <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-slate-700">{notice.body}</p>
        )}
      </div>
    </>
  );
}

/* -------- お知らせドロワー(右上ベル / ADR-013)-------- */
// ピン留め(rule/qa)を上段、新着(info)を時系列で下段。

function AnnouncementsSheet({ onClose }: { onClose: () => void }) {
  const { notices } = useApp();
  const pinned = notices.filter((n) => n.isPinned);
  const fresh = notices.filter((n) => !n.isPinned);
  const [open, setOpen] = React.useState<string | null>(null);

  return (
    <>
      <SheetHeader title="お知らせ" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        {pinned.length > 0 && (
          <>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Pin className="h-3 w-3" />
              ピン留め(常時参照)
            </div>
            <ul className="mt-2 space-y-px">
              {pinned.map((n) => (
                <NoticeRow key={n.id} n={n} open={open === n.id} onToggle={() => setOpen((cur) => (cur === n.id ? null : n.id))} />
              ))}
            </ul>
          </>
        )}

        <div className={`mt-${pinned.length > 0 ? 6 : 0} text-[11px] font-bold uppercase tracking-wider text-slate-500`}>新着</div>
        {fresh.length === 0 ? (
          <div className="mt-2 text-[11px] text-slate-400">新しいお知らせはありません。</div>
        ) : (
          <ul className="mt-2 space-y-px">
            {fresh.map((n) => (
              <NoticeRow key={n.id} n={n} open={open === n.id} onToggle={() => setOpen((cur) => (cur === n.id ? null : n.id))} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function NoticeRow({ n, open, onToggle }: { n: Notice; open: boolean; onToggle: () => void }) {
  const meta =
    n.kind === "rule" ? { label: "ルール", className: "border-slate-900 bg-slate-900 text-white" } :
    n.kind === "qa" ? { label: "Q&A", className: "border-slate-300 bg-slate-50 text-slate-700" } :
    { label: "お知らせ", className: "border-slate-200 bg-white text-slate-600" };
  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <button onClick={onToggle} className="flex w-full items-start gap-2 py-2.5 text-left hover:bg-slate-50/60">
        <span className={`mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${meta.className}`}>
          {meta.label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-slate-900">{n.title}</div>
          <div className="mt-0.5 text-[10px] text-slate-500">{n.sender || "役場"} ・ {n.date}</div>
          {open && (
            <p className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-[12px] leading-relaxed text-slate-800">
              {n.body}
            </p>
          )}
        </div>
      </button>
    </li>
  );
}

/* -------- ルール参照パネル(経費作成画面から開く / ADR-013 段階 1)-------- */

function RulesPanelSheet({ onClose }: { onClose: () => void }) {
  const { rules } = useApp();
  const [q, setQ] = React.useState("");
  const filtered = q.trim() ? rules.filter((r) => r.title.includes(q) || r.body.includes(q)) : rules;

  return (
    <>
      <SheetHeader title="経費のルール・Q&A" onClose={onClose} backLabel="経費入力に戻る" />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <p className="text-[11px] text-slate-500">
          自治体・受入団体が定めたルールと、よくある質問です。経費入力中いつでも参照できます。
        </p>
        <SearchBox value={q} onChange={setQ} placeholder="ルール本文で絞る" />
        {filtered.length === 0 ? (
          <EmptyState message="該当するルール / Q&A はありません。" />
        ) : (
          <ul className="mt-4 space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${r.kind === "rule" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-slate-50 text-slate-700"}`}>
                    {r.kind === "rule" ? "ルール" : "Q&A"}
                  </span>
                  <span className="text-[12.5px] font-bold text-slate-900">{r.title}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-700">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function MenuEntry({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-900 hover:shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-slate-900">{title}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
      </button>
    </li>
  );
}
