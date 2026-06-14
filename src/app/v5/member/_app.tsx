"use client";

import * as React from "react";
import Link from "next/link";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import {
  Search,
  ChevronLeft,
  Sparkles,
  Bell,
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

type Tab = "daily" | "report" | "expense" | "case";

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
  distanceKm?: number;
  body: string;
  date: string;
  time: string;
  expense?: number;
};

const seedLogs: ActivityLog[] = [
  // 今日(6/11)
  { id: "l1", type: "現場訪問", topic: "空き家", hours: 2, body: "A 邸内覧、家族 4 人と現地調整。築 80 年、構造は良好。次回 6/15 に再訪。", date: "2026-06-11", time: "14:20" },
  { id: "l2", type: "会議", topic: "観光協会", hours: 1.5, body: "観光協会 月例会(13:30〜)。夏祭りの出店枠について議論。", date: "2026-06-11", time: "11:05" },
  // 6 月の過去
  { id: "l3", type: "会議", topic: "移住相談", hours: 1, body: "名古屋ファミリー Web 会議(60 分)。8 月の現地視察日程を仮押さえ。", date: "2026-06-10", time: "16:40" },
  { id: "l4", type: "広報", topic: "町報", hours: 2.5, body: "町報の特集記事ドラフト、写真選定。締切 6/18。", date: "2026-06-10", time: "10:30" },
  { id: "l5", type: "イベント", topic: "夏祭り", hours: 3, body: "夏祭り実行委員会、出店者リスト確定。次回現地下見 6/22。", date: "2026-06-08", time: "19:00", expense: 1200 },
  { id: "l6", type: "現場訪問", topic: "空き家", hours: 1.5, body: "B 邸 所有者連絡、内覧日程調整。所有者親族との合意形成が課題。", date: "2026-06-08", time: "14:00" },
  { id: "l7", type: "出張", topic: "空き家", hours: 6, body: "島根県視察。海士町の古民家活用事例を視察。", date: "2026-06-05", time: "09:00", expense: 38400 },
  { id: "l8", type: "内勤", topic: "町報", hours: 2, body: "町報 6 月号 印刷費精算処理。", date: "2026-06-03", time: "10:00", expense: 12800 },
  // 5 月分
  { id: "m1", type: "現場訪問", topic: "空き家", hours: 2, body: "A 邸 内覧、家族 4 人と現地調整。", date: "2026-05-02", time: "10:00" },
  { id: "m2", type: "会議", topic: "移住相談", hours: 1.5, body: "GW 体験ツアー振り返り MTG。", date: "2026-05-04", time: "13:00" },
  { id: "m3", type: "広報", topic: "町報", hours: 3, body: "町報 6 月号 編集作業。", date: "2026-05-07", time: "10:00" },
  { id: "m4", type: "会議", topic: "観光協会", hours: 2, body: "観光協会 連携協議。", date: "2026-05-10", time: "14:00" },
  { id: "m5", type: "イベント", topic: "夏祭り", hours: 4, body: "夏祭り実行委員会。", date: "2026-05-12", time: "19:00", expense: 1200 },
  { id: "m6", type: "現場訪問", topic: "空き家", hours: 1.5, body: "B 邸 所有者打合せ。", date: "2026-05-15", time: "10:00" },
  { id: "m7", type: "出張", topic: "移住相談", hours: 6, body: "大阪移住相談会出展。", date: "2026-05-18", time: "09:00", expense: 22000 },
  { id: "m8", type: "会議", topic: "観光協会", hours: 1, body: "観光協会 連携協定締結会。", date: "2026-05-20", time: "15:00" },
  { id: "m9", type: "現場訪問", topic: "空き家", hours: 2, body: "C 邸 解体相談 現地確認。", date: "2026-05-22", time: "13:30" },
  { id: "m10", type: "内勤", topic: "町報", hours: 2, body: "町報印刷費精算。", date: "2026-05-25", time: "10:00", expense: 12800 },
  { id: "m11", type: "現場訪問", topic: "空き家", hours: 1.5, body: "D 邸 内覧 2 回目。", date: "2026-05-28", time: "14:00" },
  { id: "m12", type: "振り返り", topic: "移住相談", hours: 1, body: "5 月度振り返り。", date: "2026-05-30", time: "17:00" },
  // 4 月分
  { id: "a1", type: "内勤", topic: "空き家", hours: 4, body: "既存空き家リスト棚卸し。所有者連絡先整備。", date: "2026-04-03", time: "09:00" },
  { id: "a2", type: "会議", topic: "観光協会", hours: 1.5, body: "着任挨拶 兼 観光協会への顔出し。", date: "2026-04-05", time: "13:00" },
  { id: "a3", type: "広報", topic: "町報", hours: 3, body: "町報 5 月号 担当ページ作成。", date: "2026-04-08", time: "10:00" },
  { id: "a4", type: "イベント", topic: "夏祭り", hours: 5, body: "GW 体験ツアー準備 ・ 行程設計。", date: "2026-04-15", time: "10:00", expense: 8500 },
  { id: "a5", type: "イベント", topic: "夏祭り", hours: 8, body: "GW 体験ツアー 1 日目(4/29)。", date: "2026-04-29", time: "09:00", expense: 45000 },
  { id: "a6", type: "イベント", topic: "夏祭り", hours: 8, body: "GW 体験ツアー 2 日目(4/30)。", date: "2026-04-30", time: "09:00" },
];

type Report = {
  id: string;
  yearMonth: string;
  ym: string;
  status: "draft" | "submitted" | "approved";
  statusLabel: string;
};

const seedReports: Report[] = [
  { id: "r-2026-06", yearMonth: "2026 年 6 月", ym: "2026-06", status: "draft", statusLabel: "自動生成中" },
  { id: "r-2026-05", yearMonth: "2026 年 5 月", ym: "2026-05", status: "approved", statusLabel: "役場承認 5/31" },
  { id: "r-2026-04", yearMonth: "2026 年 4 月", ym: "2026-04", status: "approved", statusLabel: "役場承認 4/30" },
];

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
  { id: "e1", title: "町報 印刷費", amount: 12800, purpose: "町報 6 月号の印刷費。広報物の制作費として申請。", status: "精算済", aiNote: "広報物の印刷費は活動費対象。過去 4 件同様に承認実績あり。", citation: { source: "新温泉町 活動費ガイドライン v2.1", quote: "広報物の印刷費は活動費の対象に含まれます。" }, createdAt: "2026-06-03", hasReceipt: true },
  { id: "e2", title: "島根県視察 出張費", amount: 38400, purpose: "海士町の古民家活用事例を視察し、自地域での運用設計に活かす。", status: "未精算", aiNote: "県外出張は事前承認が必要。本件は事前承認済み。", citation: { source: "新温泉町 活動費ガイドライン v2.1", quote: "県外出張は事前承認(町長決裁)必須。" }, createdAt: "2026-06-01", hasReceipt: false },
  { id: "e3", title: "古民家家賃 月 5 万円", amount: 50000, purpose: "活動拠点として A 邸を月 5 万円で賃借。週 1 で地域開放を予定。", status: "申請中", aiNote: "拠点賃借料は対象。海士町に類似事例あり(月 4 万円承認)。", citation: { source: "JOIN お役立ちツール Q&A", quote: "活動拠点として賃借する家屋の賃料は活動費の対象に含まれます。" }, createdAt: "2026-06-09", hasReceipt: false },
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

const seedCases: CaseItem[] = [
  { id: "c1", title: "空き家バンクで 1 年目 12 件登録", area: "兵庫県 養父市", year: "2024", author: "山本(隊員 1 年目)", summary: "自治会連動の DM 配布で空き家所有者にリーチ。1 年目で 12 件の登録、うち 4 件成約。", kpi: "登録 12 件 / 成約 4 件 / 移住 3 家族", effect: "町外からの移住 7 名増、空き家率 -0.4 pt", process: [{ phase: "1-3 月目", body: "既存の空き家リスト棚卸し。所有者連絡先の整備に注力。" }, { phase: "4-6 月目", body: "自治会経由で所有者に挨拶状を DM 配布(18 件)。返信 9 件。" }, { phase: "7-9 月目", body: "内覧 7 件、登録 5 件。並行して移住希望者リスト作成。" }, { phase: "10-12 月目", body: "成約 4 件、移住 3 家族受け入れ。" }], learning: "自治会経由の DM は反応率が高い(直接送付の 3 倍)。所有者の心理的ハードルが「知らない人より地域経由」で下がる。" },
  { id: "c2", title: "空き家清掃ボランティアの定着", area: "島根県 海士町", year: "2023", author: "中島(隊員 2 年目)", summary: "月 1 回の空き家清掃ボランティアを継続開催。地元住民との関係構築の場として機能。", kpi: "12 回開催 / 延べ参加 84 名 / 清掃完了 8 物件", effect: "地元住民との関係構築 + 物件の早期市場投入", process: [{ phase: "1-2 月目", body: "地元自治会と相談、第 1 回は地域住民のみで開催。" }, { phase: "3-6 月目", body: "SNS で外部にも告知、移住希望者の参加が増える。" }, { phase: "7-12 月目", body: "月 1 定期化、清掃完了物件は空き家バンクに即登録。" }], learning: "地元 → 外部の順で開いていくと、住民の抵抗が少ない。清掃 + 交流の二段構造が効く。" },
  { id: "c3", title: "DIY 補助金との組み合わせ", area: "全国(JOIN)", year: "2024", author: "JOIN お役立ちツール", summary: "空き家物件登録時に DIY 補助金を活用するスキーム例。", kpi: "補助上限 50 万円 / 申請期間 2 ヶ月", effect: "物件登録のインセンティブ強化", process: [{ phase: "申請", body: "市町村窓口で DIY 補助金の交付申請。" }, { phase: "実施", body: "補助対象工事を実施(壁紙・水回り等)。" }, { phase: "登録", body: "工事完了後に空き家バンクに登録。" }], learning: "補助金申請のタイミングを物件登録と連動させると、所有者の意思決定が早まる。" },
];

const seedTrend = [
  { id: "t1", title: "空き家バンク立ち上げ", count: 34 },
  { id: "t2", title: "移住相談ネットワーク", count: 28 },
  { id: "t3", title: "観光協会との連携", count: 19 },
];

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
  | { kind: "activity-create"; editing?: ActivityLog }
  | { kind: "activity-detail"; log: ActivityLog }
  | { kind: "report-detail"; report: Report }
  | { kind: "report-day"; date: string }
  | { kind: "expense-detail"; item: ExpenseRequest }
  | { kind: "expense-create" }
  | { kind: "expense-settle"; item: ExpenseRequest }
  | { kind: "case-detail"; case: CaseItem }
  | { kind: "consult"; context: ConsultContext; onAdopt?: (text: string) => void }
  | { kind: "topic-edit" }
  | { kind: "announcements" }
  | { kind: "rules-panel" };

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

type Ctx = {
  logs: ActivityLog[];
  addLog: (l: Omit<ActivityLog, "id"> & { expenses?: InlineExpense[] }) => void | Promise<void>;
  updateLog: (id: string, patch: Partial<Omit<ActivityLog, "id">>) => void | Promise<void>;
  deleteLog: (id: string) => void | Promise<void>;
  topics: string[];
  addTopic: (t: string) => void;
  removeTopic: (t: string) => void;
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
  plan: string;
  setPlan: (p: string) => void;
};

const MEMBER_ID = "m1";

const AppCtx = React.createContext<Ctx | null>(null);
const useApp = () => {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("AppCtx missing");
  return c;
};

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("daily");
  // 初期値はシード(即描画)→ マウント後にバックエンドの実データで置換
  const [logs, setLogs] = React.useState<ActivityLog[]>(seedLogs);
  const [topics, setTopics] = React.useState<string[]>(DEFAULT_TOPICS);
  const [expenses, setExpenses] = React.useState<ExpenseRequest[]>(initialExpenses);
  const [reports, setReports] = React.useState<Report[]>(seedReports);
  const [caseItems, setCaseItems] = React.useState<CaseItem[]>(seedCases);
  const [trend, setTrend] = React.useState<TrendItem[]>(seedTrend);
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [rules, setRules] = React.useState<Notice[]>([]);
  const [sheets, setSheets] = React.useState<Sheet[]>([]);
  const [plan, setPlan] = React.useState(
    "・夏祭り当日の運営(7/14)\n・移住者向け体験ツアー初回開催(7/27)\n・空き家バンク累計 15 件を目標"
  );

  // バックエンドから初期データ取得(SQLite + API Routes)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [lg, tp, ex, rp, cs, ns, rl] = await Promise.all([
          apiGet<ActivityLog[]>(`/api/activity-logs?userId=${MEMBER_ID}`),
          apiGet<string[]>(`/api/topics?userId=${MEMBER_ID}`),
          apiGet<ExpenseRequest[]>(`/api/expenses?userId=${MEMBER_ID}`),
          apiGet<Report[]>(`/api/monthly-reports?userId=${MEMBER_ID}`),
          apiGet<{ cases: CaseItem[]; trend: TrendItem[] }>(`/api/cases`),
          apiGet<Notice[]>(`/api/announcements`),
          apiGet<Notice[]>(`/api/announcements?kinds=rule,qa`),
        ]);
        if (!alive) return;
        setLogs(lg);
        setTopics(tp);
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
  }, []);

  const ctx: Ctx = {
    logs,
    addLog: async (l) => {
      // 経費明細は receiptDataUrl(クライアント表示専用)を落として送る
      const { expenses, ...rest } = l;
      const payload = {
        userId: MEMBER_ID,
        ...rest,
        ...(expenses && expenses.length > 0
          ? {
              expenses: expenses.map((e) => ({
                title: e.title,
                amount: e.amount,
                purpose: e.purpose,
                hasReceipt: !!e.hasReceipt,
              })),
            }
          : {}),
      };
      const created = await apiPost<ActivityLog>("/api/activity-logs", payload);
      setLogs((ls) => [created, ...ls]);
      if (expenses && expenses.length > 0) {
        // 同時登録した経費を経費一覧にも反映(取り直し)
        try {
          const ex = await apiGet<ExpenseRequest[]>(`/api/expenses?userId=${MEMBER_ID}`);
          setExpenses(ex);
        } catch { /* noop */ }
      }
    },
    updateLog: async (id, patch) => {
      const updated = await apiPatch<ActivityLog>(`/api/activity-logs/${id}`, { ...patch, userId: MEMBER_ID });
      setLogs((ls) => ls.map((l) => (l.id === id ? updated : l)));
      // 同月の月報が差し戻された可能性があるため再取得
      try {
        const rp = await apiGet<Report[]>(`/api/monthly-reports?userId=${MEMBER_ID}`);
        setReports(rp);
      } catch { /* noop */ }
    },
    deleteLog: async (id) => {
      await apiDelete<null>(`/api/activity-logs/${id}?userId=${MEMBER_ID}`);
      setLogs((ls) => ls.filter((l) => l.id !== id));
      // 同月の月報が差し戻された可能性があるため再取得
      try {
        const rp = await apiGet<Report[]>(`/api/monthly-reports?userId=${MEMBER_ID}`);
        setReports(rp);
      } catch { /* noop */ }
    },
    topics,
    addTopic: async (t) => {
      const next = await apiPost<string[]>("/api/topics", { userId: MEMBER_ID, name: t });
      setTopics(next);
    },
    removeTopic: async (t) => {
      const next = await apiDelete<string[]>(`/api/topics?userId=${MEMBER_ID}&name=${encodeURIComponent(t)}`);
      setTopics(next);
    },
    expenses,
    addExpense: async (e) => {
      const created = await apiPost<ExpenseRequest>("/api/expenses", { userId: MEMBER_ID, ...e });
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
    plan,
    setPlan,
  };

  return (
    <AppCtx.Provider value={ctx}>
      <main className="flex h-screen flex-col bg-white text-slate-900">
        <Header
          onConsultMenu={() => setSheets([{ kind: "consult", context: { kind: "menu" } }])}
          onBell={() => setSheets([{ kind: "announcements" }])}
          unread={notices.length}
        />
        <Tabs active={tab} onChange={setTab} />

        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-20">
          <div className="mx-auto w-full max-w-2xl flex-1 py-4">
            {tab === "daily" && <DailyTab />}
            {tab === "report" && <ReportTab />}
            {tab === "expense" && <ExpenseTab />}
            {tab === "case" && <CaseTab />}
          </div>
        </div>

        <Footer onTopicEdit={() => setSheets([{ kind: "topic-edit" }])} />
        <SheetRoot />
      </main>
    </AppCtx.Provider>
  );
}

/* -------------------- Header / Tabs / Footer -------------------- */

function Header({ onConsultMenu, onBell, unread }: { onConsultMenu: () => void; onBell: () => void; unread: number }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
      <Link href="/v5" className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-900">
        <ChevronLeft className="h-3 w-3" />
        切替
      </Link>
      <div className="text-center text-[11px] text-slate-500">田中 あかり / 新温泉町</div>
      <div className="flex items-center gap-3">
        <button
          onClick={onBell}
          className="relative inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900"
          title="お知らせ・ルール"
          aria-label="お知らせを開く"
        >
          <Bell className="h-3.5 w-3.5" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-0.5 text-[8px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
        <button
          onClick={onConsultMenu}
          className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900"
          title="目的別の AI 相談"
        >
          <Sparkles className="h-3 w-3" />
          相談
        </button>
      </div>
    </header>
  );
}

function Tabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="flex items-center justify-center gap-1 border-b border-slate-100 px-5 py-1.5">
      <TabBtn label="活動報告" active={active === "daily"} onClick={() => onChange("daily")} />
      <TabBtn label="月報" active={active === "report"} onClick={() => onChange("report")} />
      <TabBtn label="経費" active={active === "expense"} onClick={() => onChange("expense")} />
      <TabBtn label="事例" active={active === "case"} onClick={() => onChange("case")} />
    </nav>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative px-4 py-1.5 text-[12px] font-semibold transition ${active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
      {label}
      {active && <span className="absolute bottom-[-7px] left-1/2 h-[2px] w-6 -translate-x-1/2 bg-slate-900" />}
    </button>
  );
}

function Footer({ onTopicEdit }: { onTopicEdit: () => void }) {
  return (
    <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400">
      <span>地域おこし協力隊サポートシステム ・ v5 lab</span>
      <button onClick={onTopicEdit} className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-900">
        <SettingsIcon className="h-3 w-3" />
        活動内容を編集
      </button>
    </footer>
  );
}

/* -------------------- 1. 活動報告タブ(レイアウト整理版)-------------------- */

function todayKey() {
  return "2026-06-11";
}

function DailyTab() {
  const { logs, pushSheet } = useApp();
  const today = logs.filter((l) => l.date === todayKey());
  const past = logs.filter((l) => l.date !== todayKey());

  const grouped: Record<string, ActivityLog[]> = {};
  for (const l of past) (grouped[l.date] ??= []).push(l);
  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  const todayHours = today.reduce((s, l) => s + l.hours, 0);

  return (
    <div className="relative">
      {/* ── ヘッダ(右上に新規ボタンを明示)── */}
      <div className="relative text-center">
        <h1 className="text-3xl font-bold tracking-tight">活動報告</h1>
        <p className="mt-1 text-[12px] text-slate-500">活動のたびに 1 件、月末に AI が月報へまとめます</p>
        <button
          onClick={() => pushSheet({ kind: "activity-create" })}
          className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          新規
        </button>
      </div>

      {/* ── 今日 ─ 太く目立たせる(主役) ── */}
      <section className="mt-7">
        <div className="mb-2 flex items-center justify-between border-b-2 border-slate-900 pb-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[15px] font-black tracking-tight text-slate-900">今日</h2>
            <span className="text-[10px] text-slate-500">6 月 11 日(木)</span>
          </div>
          <button
            onClick={() => pushSheet({ kind: "activity-create" })}
            className="inline-flex items-center gap-0.5 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:border-slate-900 hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" />
            報告を追加
          </button>
        </div>

        {today.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-[12px] text-slate-500">
            まだ記録がありません。上の「<strong>+ 報告を追加</strong>」または右下の <strong>+</strong> から作成
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-baseline gap-4">
              <div>
                <span className="text-[28px] font-black leading-none text-slate-900">{today.length}</span>
                <span className="ml-1 text-[11px] text-slate-500">件</span>
              </div>
              <div>
                <span className="text-[28px] font-black leading-none text-slate-900">{todayHours}</span>
                <span className="ml-1 text-[11px] text-slate-500">時間</span>
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {today.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => pushSheet({ kind: "activity-detail", log: l })}
                    className="flex w-full items-start gap-2.5 py-2.5 text-left hover:bg-slate-50/60"
                  >
                    <span className="mt-0.5 shrink-0 text-[10px] font-bold text-slate-400 tabular-nums">{l.time}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="rounded-sm border border-slate-300 bg-white px-1 text-[10px] font-bold text-slate-700">
                          {l.type}
                        </span>
                        <span className="rounded-sm border border-slate-200 bg-slate-50 px-1 text-[10px] font-semibold text-slate-600">
                          {l.topic}
                        </span>
                        <span className="ml-auto text-[10px] tabular-nums text-slate-500">{l.hours}h</span>
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] text-slate-800">{l.body}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ── 過去 ─ 薄く控えめに(サブ) ── */}
      <section className="mt-8">
        <div className="mb-2 border-b border-slate-200 pb-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">過去</h2>
        </div>
        {sortedDates.length === 0 ? (
          <div className="text-[11px] text-slate-400">過去の記録はありません</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sortedDates.map((date) => {
              const items = grouped[date];
              const totalHours = items.reduce((s, l) => s + l.hours, 0);
              return (
                <li key={date} className="py-3">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-[12px] font-bold tabular-nums text-slate-700">{formatDateShort(date)}</span>
                    <span className="text-[10px] text-slate-400">
                      {items.length} 件 ・ {totalHours}h
                    </span>
                  </div>
                  <ul className="space-y-px">
                    {items.map((l) => (
                      <li key={l.id}>
                        <button
                          onClick={() => pushSheet({ kind: "activity-detail", log: l })}
                          className="flex w-full items-start gap-2 py-1 text-left hover:bg-slate-50/60"
                        >
                          <span className="mt-0.5 shrink-0 rounded-sm border border-slate-200 bg-white px-1 text-[10px] font-semibold text-slate-600">
                            {l.type}
                          </span>
                          <span className="mt-0.5 shrink-0 rounded-sm border border-slate-200 bg-slate-50 px-1 text-[10px] font-medium text-slate-500">
                            {l.topic}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12px] text-slate-600">{l.body}</span>
                          <span className="shrink-0 text-[10px] tabular-nums text-slate-400">{l.hours}h</span>
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

      {/* FAB */}
      <button
        onClick={() => pushSheet({ kind: "activity-create" })}
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
  const { pushSheet, reports } = useApp();
  // 年ドロップダウン:データから年を抽出 + 「すべて」
  const years = React.useMemo(() => {
    const ys = new Set<string>();
    reports.forEach((r) => ys.add(r.ym.slice(0, 4)));
    return ["すべて", ...Array.from(ys).sort((a, b) => (a < b ? 1 : -1))];
  }, [reports]);
  const [year, setYear] = React.useState<string>("すべて");
  const filtered = reports.filter((r) => year === "すべて" || r.ym.startsWith(year));

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">月報</h1>
      <p className="mt-1 text-[12px] text-slate-500">日々の活動から AI が自動生成します</p>

      {/* 年ドロップダウン(検索ボックスを置き換え)*/}
      <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)] focus-within:border-slate-900">
        <Calendar className="h-4 w-4 text-slate-400" />
        <label htmlFor="report-year" className="text-[11px] text-slate-500">年で絞り込み</label>
        <select
          id="report-year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="bg-transparent text-[13px] font-semibold text-slate-900 focus:outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y === "すべて" ? y : `${y} 年`}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="該当する月報がありません。" />
      ) : (
        <ul className="mt-6 space-y-px text-left">
          {filtered.map((r) => (
            <li key={r.id} className="border-b border-slate-100 last:border-b-0">
              <button onClick={() => pushSheet({ kind: "report-detail", report: r })} className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-slate-50/60">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1 px-1">
                  <div className="text-[13px] font-semibold text-slate-900">{r.yearMonth}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{r.statusLabel}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${r.status === "draft" ? "border-slate-300 bg-slate-50 text-slate-700" : r.status === "submitted" ? "border-slate-300 bg-white text-slate-700" : "border-slate-300 bg-slate-900 text-white"}`}>
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

/* -------------------- 3. 経費タブ(使用状況サマリ追加)-------------------- */

type ExpenseSubTab = "request" | "settle";

function ExpenseTab() {
  const { expenses, logs, pushSheet } = useApp();
  const [sub, setSub] = React.useState<ExpenseSubTab>("request");
  const [q, setQ] = React.useState("");

  // 経費使用状況計算(精算済 or 未精算の合計を年間とみなす / モック)
  const fiscalYearLogs = logs.filter((l) => l.date >= "2026-04-01" && l.date < "2027-04-01");
  const usedByMonth: Record<string, number> = {};
  for (const l of fiscalYearLogs) {
    const m = l.date.slice(0, 7);
    usedByMonth[m] = (usedByMonth[m] ?? 0) + (l.expense ?? 0);
  }
  const usedTotal = Object.values(usedByMonth).reduce((s, v) => s + v, 0);
  const monthsActive = Object.keys(usedByMonth).length || 1;
  const monthlyAvg = Math.round(usedTotal / monthsActive);
  const remaining = ANNUAL_BUDGET - usedTotal;
  const pct = (usedTotal / ANNUAL_BUDGET) * 100;

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

      {/* 現在の使用状況 ─ グラフ中心、カードなし */}
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
        <div className="mt-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
          <span>月平均 ¥{(monthlyAvg / 10000).toFixed(1)}万</span>
          <span>残り ¥{(remaining / 10000).toFixed(1)}万</span>
        </div>
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
                    <div className="text-[13px] font-semibold text-slate-900">
                      {e.title}
                      <span className="ml-1.5 text-[11px] font-normal text-slate-500">¥{e.amount.toLocaleString()}</span>
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

  // report-day は「ポップアップ」(中央ダイアログ)で表示する。
  // 他は従来通り全画面シート。
  if (sheet.kind === "report-day") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        onClick={close}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <ReportDaySheet date={sheet.date} onClose={close} depth={stackDepth} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {sheet.kind === "activity-create" && <ActivityCreateSheet onClose={close} editing={sheet.editing} />}
      {sheet.kind === "activity-detail" && <ActivityDetailSheet log={sheet.log} onClose={close} />}
      {sheet.kind === "report-detail" && <ReportDetailSheet report={sheet.report} onClose={close} />}
      {sheet.kind === "expense-detail" && <ExpenseDetailSheet item={sheet.item} onClose={close} />}
      {sheet.kind === "expense-create" && <ExpenseCreateSheet onClose={close} />}
      {sheet.kind === "expense-settle" && <ExpenseSettleSheet item={sheet.item} onClose={close} />}
      {sheet.kind === "case-detail" && <CaseDetailSheet item={sheet.case} onClose={close} />}
      {sheet.kind === "consult" && <ConsultSheet context={sheet.context} onAdopt={sheet.onAdopt} onClose={close} />}
      {sheet.kind === "topic-edit" && <TopicEditSheet onClose={close} />}
      {sheet.kind === "announcements" && <AnnouncementsSheet onClose={close} />}
      {sheet.kind === "rules-panel" && <RulesPanelSheet onClose={close} />}
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

/* -------- 活動報告 作成シート(入力ごとに相談ボタン)-------- */

function ActivityCreateSheet({ onClose, editing }: { onClose: () => void; editing?: ActivityLog }) {
  const { addLog, updateLog, topics } = useApp();
  const isEdit = !!editing;
  const [type, setType] = React.useState<string | null>(editing?.type ?? null);
  const [topic, setTopic] = React.useState<string | null>(editing?.topic ?? null);
  const [hours, setHours] = React.useState<string>(editing ? String(editing.hours) : "1");
  const [distance, setDistance] = React.useState<string>(editing?.distanceKm != null ? String(editing.distanceKm) : "");
  const [body, setBody] = React.useState(editing?.body ?? "");
  const [saving, setSaving] = React.useState(false);

  // メモのブラッシュアップ(押下 → AI が清書 → プレビュー → 採用 / やめる)
  const [polishing, setPolishing] = React.useState(false);
  const [polished, setPolished] = React.useState<string | null>(null);

  async function brushUp() {
    if (!body.trim() || polishing) return;
    setPolishing(true);
    try {
      const r = await apiPost<{ reply: string }>("/api/ai/consult", {
        context: "polish-memo",
        payload: { current: body },
      });
      setPolished(r.reply.trim());
    } catch {
      setPolished("(AI への接続に失敗しました。少し時間をおいて再度お試しください)");
    } finally {
      setPolishing(false);
    }
  }

  // 経費明細(ADR-014 動線①):複数登録可、レシート画像は dataURL でプレビュー
  const [inlineExpenses, setInlineExpenses] = React.useState<InlineExpense[]>([]);
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

  // 経費は「金額 > 0 かつ 用途が 1 文字以上」の行のみ送信
  const validExpenses = inlineExpenses.filter((e) => e.amount > 0 && e.purpose.trim().length > 0);
  const expenseSum = validExpenses.reduce((s, e) => s + e.amount, 0);

  const canSave = !!type && !!topic && parseFloat(hours) > 0 && body.trim().length > 0 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      if (editing) {
        await updateLog(editing.id, {
          type: type!,
          topic: topic!,
          hours: parseFloat(hours),
          distanceKm: distance ? parseFloat(distance) : undefined,
          body: body.trim(),
        });
      } else {
        await addLog({
          type: type!,
          topic: topic!,
          hours: parseFloat(hours),
          distanceKm: distance ? parseFloat(distance) : undefined,
          body: body.trim(),
          date: todayKey(),
          time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
          expenses: validExpenses.length > 0 ? validExpenses : undefined,
        });
      }
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <SheetHeader
        title={isEdit ? "活動報告を編集" : "活動報告を書く"}
        onClose={onClose}
        right={
          <button onClick={save} disabled={!canSave} className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300">
            {isEdit ? "更新" : "記録"}
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <Label>活動の種類</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {ACTIVITY_TYPES.map((c) => (
            <button key={c} onClick={() => setType((cur) => (cur === c ? null : c))} className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${type === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}>
              {c}
            </button>
          ))}
        </div>

        <Label>活動内容(あなたのテーマ)</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {topics.map((c) => (
            <button key={c} onClick={() => setTopic((cur) => (cur === c ? null : c))} className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${topic === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}>
              {c}
            </button>
          ))}
        </div>

        <Label>活動時間</Label>
        <div className="mt-1 flex items-center gap-2">
          <input type="number" step="0.5" min="0" value={hours} onChange={(e) => setHours(e.target.value)} className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          <span className="text-[12px] text-slate-600">時間</span>
        </div>

        <Label>移動距離(任意)</Label>
        <div className="mt-1 flex items-center gap-2">
          <input type="number" step="0.1" min="0" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="例:12.5" className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          <span className="text-[12px] text-slate-600">km(車での移動)</span>
        </div>

        <Label right={
          <button
            type="button"
            onClick={brushUp}
            disabled={!body.trim() || polishing}
            title="メモを 5W1H に沿って清書します(事実は変えません)"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <Sparkles className="h-3 w-3" />
            {polishing ? "清書中…" : "メモをブラッシュアップ"}
          </button>
        }>
          メモ
        </Label>
        <textarea
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="例:A 邸を内覧、移住希望者と一緒に。築 80 年だが構造良好。"
          className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />
        <div className="mt-1 text-[10px] text-slate-400">
          住民個人を特定する情報は記載しないでください。迷ったら 5W1H(いつ・どこで・誰と・何を・なぜ・どうやって)で。
        </div>

        {polished && (
          <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                AI 清書プレビュー
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPolished(null)}
                  className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:border-slate-500"
                >
                  やめる
                </button>
                <button
                  onClick={brushUp}
                  disabled={polishing}
                  className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:border-slate-500"
                >
                  もう一度
                </button>
                <button
                  onClick={() => { setBody(polished); setPolished(null); }}
                  className="inline-flex items-center gap-0.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-slate-800"
                >
                  <Check className="h-3 w-3" />
                  採用する
                </button>
              </div>
            </div>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed text-slate-800">{polished}</pre>
            <p className="mt-1 text-[9px] text-slate-400">※ 事実は変えていません。気になる箇所は採用後に手で直してください。</p>
          </div>
        )}

        {/* ─── 経費明細(ADR-014 動線①、複数登録可)─── */}
        <Label
          right={
            <button
              type="button"
              onClick={addExpense}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-900 hover:bg-slate-50"
            >
              <Plus className="h-3 w-3" />
              経費を追加
            </button>
          }
        >
          💴 経費(任意)
        </Label>
        {inlineExpenses.length === 0 ? (
          <div className="mt-1 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-[11px] text-slate-500">
            この活動で支出があれば「<strong>+ 経費を追加</strong>」(現場で簡単に複数登録できます)
          </div>
        ) : (
          <ul className="mt-1 space-y-2">
            {inlineExpenses.map((e, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">明細 #{i + 1}</div>
                  <button
                    onClick={() => removeExpense(i)}
                    className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    削除
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500">タイトル(任意)</label>
                    <input
                      type="text"
                      value={e.title ?? ""}
                      onChange={(ev) => updateExpense(i, { title: ev.target.value })}
                      placeholder="例:ボールペン"
                      className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">金額 <span className="text-rose-600">必須</span></label>
                    <input
                      type="number"
                      min="0"
                      value={e.amount || ""}
                      onChange={(ev) => updateExpense(i, { amount: parseInt(ev.target.value || "0", 10) })}
                      placeholder="円"
                      className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="text-[10px] text-slate-500">用途 <span className="text-rose-600">必須</span></label>
                  <input
                    type="text"
                    value={e.purpose}
                    onChange={(ev) => updateExpense(i, { purpose: ev.target.value })}
                    placeholder="例:町報の写真撮影で使用"
                    className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="mt-2">
                  <label className="text-[10px] text-slate-500">レシート(任意)</label>
                  <div className="mt-0.5 flex items-center gap-2">
                    <label className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${e.hasReceipt ? "border-slate-900 bg-slate-50 text-slate-900" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}>
                      <Camera className="h-3 w-3" />
                      {e.hasReceipt ? "添付済(タップで変更)" : "画像を選択"}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(ev) => onReceiptFile(i, ev.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>
                    {e.hasReceipt && (
                      <button
                        onClick={() => updateExpense(i, { hasReceipt: false, receiptDataUrl: undefined })}
                        className="text-[10px] text-slate-400 hover:text-rose-700"
                      >
                        外す
                      </button>
                    )}
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
            <span>合計 ¥{expenseSum.toLocaleString()} を経費申請(申請中)として記録</span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-500">
            <Mic className="h-3.5 w-3.5" />
            音声で(後日)
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
          {typeof log.distanceKm === "number" && (
            <span className="text-[11px] text-slate-500">・移動 {log.distanceKm} km</span>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-relaxed text-slate-800">{log.body}</p>

        {typeof log.expense === "number" && (
          <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
            <Wallet className="h-3 w-3" />
            この活動で発生した経費:¥{log.expense.toLocaleString()}
          </div>
        )}

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
  const { logs, plan, setPlan, pushSheet } = useApp();
  const ym = report.ym;
  const monthLogs = logs.filter((l) => l.date.startsWith(ym));

  // AI 月報生成(再生成ボタンから呼び出し)
  const [generated, setGenerated] = React.useState<string | null>(null);
  const [genState, setGenState] = React.useState<"idle" | "loading" | "error">("idle");
  async function regenerate() {
    setGenState("loading");
    try {
      const r = await apiPost<{ markdown: string }>("/api/ai/monthly-report", { userId: "m1", ym });
      setGenerated(r.markdown);
      setGenState("idle");
    } catch {
      setGenState("error");
    }
  }

  const totalHours = monthLogs.reduce((s, l) => s + l.hours, 0);
  const totalExpense = monthLogs.reduce((s, l) => s + (l.expense ?? 0), 0);
  const totalCount = monthLogs.length;

  const byDate: Record<string, ActivityLog[]> = {};
  for (const l of monthLogs) (byDate[l.date] ??= []).push(l);

  // 活動時間:種類別(積算棒に使う)
  const byType: Record<string, number> = {};
  for (const l of monthLogs) byType[l.type] = (byType[l.type] ?? 0) + l.hours;
  // 表示順は ACTIVITY_TYPES 並び(値があるものだけ)
  const typeOrder = ACTIVITY_TYPES.filter((t) => byType[t] > 0);
  // 最低活動時間に対する進捗(超過分は「達成」、未達分は「残り」)
  const hoursProgress = Math.min(totalHours / MIN_MONTHLY_HOURS, 1);
  const hoursRemain = Math.max(MIN_MONTHLY_HOURS - totalHours, 0);
  const hoursOver = Math.max(totalHours - MIN_MONTHLY_HOURS, 0);

  // 経費:カテゴリ(= 活動内容 topic)別合計
  const byCat: Record<string, number> = {};
  for (const l of monthLogs) {
    if (typeof l.expense === "number" && l.expense > 0) {
      byCat[l.topic] = (byCat[l.topic] ?? 0) + l.expense;
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

  // 来月計画(フォーム化):継続 / 新規 / 振り返り の 3 セクション
  // 既存 plan(自由テキスト)から見出し付きで分割、保存時に再結合
  const parsed = React.useMemo(() => parsePlan(plan), [plan]);
  const [planForm, setPlanForm] = React.useState(parsed);
  React.useEffect(() => setPlanForm(parsePlan(plan)), [plan]);
  function commitPlan(next: typeof planForm) {
    setPlanForm(next);
    setPlan(formatPlan(next));
  }

  // 計画ブラッシュアップ(フォーム全体を AI で清書 → プレビュー)
  const [polishingPlan, setPolishingPlan] = React.useState(false);
  const [polishedPlan, setPolishedPlan] = React.useState<string | null>(null);
  async function brushUpPlan() {
    if (polishingPlan) return;
    setPolishingPlan(true);
    try {
      const r = await apiPost<{ reply: string }>("/api/ai/consult", {
        context: "polish-memo",
        payload: { current: formatPlan(planForm) },
      });
      setPolishedPlan(r.reply.trim());
    } catch {
      setPolishedPlan("(AI 接続失敗。少し時間をおいて再度お試しください)");
    } finally {
      setPolishingPlan(false);
    }
  }

  return (
    <>
      <SheetHeader title={report.yearMonth} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${report.status === "draft" ? "border-slate-300 bg-slate-50 text-slate-700" : report.status === "submitted" ? "border-slate-300 bg-white text-slate-700" : "border-slate-300 bg-slate-900 text-white"}`}>
            {report.status === "draft" ? "下書き" : report.status === "submitted" ? "提出済" : "承認済"}
          </span>
          <span className="text-[11px] text-slate-500">{report.statusLabel}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">{report.yearMonth}</h1>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryCell icon={<FileText className="h-3.5 w-3.5" />} value={`${totalCount}`} label="活動件数" />
          <SummaryCell icon={<Clock className="h-3.5 w-3.5" />} value={`${totalHours}`} label="活動時間" suffix="h" />
          <SummaryCell icon={<Wallet className="h-3.5 w-3.5" />} value={`¥${(totalExpense / 1000).toFixed(0)}k`} label="経費使用" />
        </div>

        {/* カレンダー(凡例 + 経費表示) */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">活動カレンダー</div>
            <div className="text-[9px] text-slate-400">右上=件数 / 下=時間・経費</div>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400">
            {["日", "月", "火", "水", "木", "金", "土"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c, i) =>
              c === null ? <div key={i} /> : (
                <button
                  key={i}
                  onClick={() => c.logs.length > 0 && pushSheet({ kind: "report-day", date: c.date })}
                  disabled={c.logs.length === 0}
                  className={`relative aspect-square rounded-lg border p-1 text-left text-[10px] transition ${c.logs.length > 0 ? "border-slate-300 bg-white hover:border-slate-900 hover:shadow" : "border-slate-100 bg-slate-50/40 text-slate-300"}`}
                >
                  <span className="absolute left-1 top-0.5 font-bold text-slate-700">{c.day}</span>
                  {c.logs.length > 0 && (
                    <>
                      <span className="absolute right-1 top-0.5 text-[9px] font-bold text-slate-500">{c.logs.length}件</span>
                      <span className="absolute bottom-3 left-1 right-1 text-[9px] font-semibold text-slate-700">
                        {c.logs.reduce((s, l) => s + l.hours, 0)}h
                      </span>
                      {c.logs.some((l) => l.expense) && (
                        <span className="absolute bottom-0.5 left-1 right-1 truncate text-[8px] text-slate-500">
                          ¥{Math.round(c.logs.reduce((s, l) => s + (l.expense ?? 0), 0) / 100) / 10}k
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* 活動時間:積算棒(種類別セグメント)+ 最低活動時間 120h との比較 */}
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

            {/* 積算バー:基準 120h を 100% とし、種類別セグメントを左から積む */}
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
              {/* 100% ライン(基準到達点) */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                <div className="h-full w-px bg-slate-900" />
              </div>
              {/* 進捗パーセント */}
              <div className="mt-1 flex justify-end text-[10px] text-slate-500">
                {Math.round(hoursProgress * 100)}% 達成
              </div>
            </div>

            {/* 凡例(値あるものだけ)*/}
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

        {/* 経費使用:カテゴリ(活動内容 topic)別の積算棒 + 月予算との比較 */}
        {totalExpense > 0 && (
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
                {catOrder.map((cat, i) => {
                  const w = (byCat[cat] / MONTHLY_BUDGET) * 100;
                  // カテゴリ色:slate 系の濃淡で識別(色を増やさない方針の妥協)
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                <div className="h-full w-px bg-slate-900" />
              </div>
            </div>

            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
              {catOrder.map((cat, i) => (
                <li key={cat} className="inline-flex items-center gap-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${["bg-slate-900", "bg-slate-700", "bg-slate-500", "bg-slate-400", "bg-slate-300", "bg-slate-200"][i % 6]}`} />
                  <span className="text-slate-600">{cat}</span>
                  <span className="font-bold tabular-nums text-slate-800">¥{byCat[cat].toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 来月の計画(フォーム化:継続 / 新規 / 振り返り + AI ブラッシュアップ)*/}
        <Label
          right={
            <button
              type="button"
              onClick={brushUpPlan}
              disabled={polishingPlan}
              title="3 セクションをまとめて 5W1H に沿った言い回しに整えます"
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <Sparkles className="h-3 w-3" />
              {polishingPlan ? "清書中…" : "計画をブラッシュアップ"}
            </button>
          }
        >
          来月の計画
        </Label>
        <p className="mt-1 text-[10px] text-slate-400">3 つの区分で書き分けると、役場が読みやすくなります。</p>

        <div className="mt-2 space-y-2">
          <PlanField
            label="継続"
            sub="進行中のプロジェクトのマイルストーン"
            value={planForm.continueText}
            placeholder="例:空き家バンク登録 累計 15 件を目標"
            onChange={(v) => commitPlan({ ...planForm, continueText: v })}
          />
          <PlanField
            label="新規"
            sub="今月の手応えから次に試したい施策"
            value={planForm.newText}
            placeholder="例:移住者向け体験ツアー 初回開催(7/27)"
            onChange={(v) => commitPlan({ ...planForm, newText: v })}
          />
          <PlanField
            label="振り返り"
            sub="中間レビュー / KPI 確認の予定"
            value={planForm.reviewText}
            placeholder="例:7 月末に Q2 振り返り 1on1(担当課)"
            onChange={(v) => commitPlan({ ...planForm, reviewText: v })}
          />
        </div>

        {polishedPlan && (
          <div className="mt-3 rounded-xl border border-slate-300 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI 清書プレビュー</div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPolishedPlan(null)} className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:border-slate-500">やめる</button>
                <button onClick={brushUpPlan} disabled={polishingPlan} className="rounded-full border border-slate-300 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:border-slate-500">もう一度</button>
                <button
                  onClick={() => {
                    commitPlan(parsePlan(polishedPlan));
                    setPolishedPlan(null);
                  }}
                  className="inline-flex items-center gap-0.5 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-slate-800"
                >
                  <Check className="h-3 w-3" />
                  採用する
                </button>
              </div>
            </div>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed text-slate-800">{polishedPlan}</pre>
            <p className="mt-1 text-[9px] text-slate-400">※ 採用すると 3 区分のフォームを上書きします。事実は変えていません。</p>
          </div>
        )}

        <div className="mt-4 text-[10px] text-slate-400">※ AI が日々の活動から自動でまとめます。提出前に確認してください。</div>
      </div>

      {(generated || genState === "loading" || genState === "error") && (
        <div className="mx-auto w-full max-w-2xl px-6 pb-6">
          <Label>AI 生成 月報(下書き)</Label>
          <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[12px] leading-relaxed text-slate-800">
            {genState === "loading" && <p className="text-slate-500">活動ログから生成中…</p>}
            {genState === "error" && <p className="text-rose-700">生成に失敗しました。AI プロバイダ(ollama/anthropic/mock)の設定を確認してください。</p>}
            {generated && <pre className="whitespace-pre-wrap font-sans">{generated}</pre>}
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          <button
            onClick={regenerate}
            disabled={genState === "loading"}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            {genState === "loading" ? "生成中…" : generated ? "再生成" : "AI 生成"}
          </button>
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
    </>
  );
}

function ReportDaySheet({ date, onClose, depth }: { date: string; onClose: () => void; depth: number }) {
  const { logs, pushSheet } = useApp();
  const items = logs.filter((l) => l.date === date);
  const totalHours = items.reduce((s, l) => s + l.hours, 0);
  const totalExpense = items.reduce((s, l) => s + (l.expense ?? 0), 0);

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-2.5">
        <div className="text-[12px] font-bold text-slate-900">{formatDateShort(date)} の活動</div>
        <button onClick={onClose} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="閉じる">
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-[11px] text-slate-500">
          {items.length} 件 ・ {totalHours} 時間
          {totalExpense > 0 && ` ・ 経費 ¥${totalExpense.toLocaleString()}`}
        </div>
        <ul className="mt-3 space-y-2">
          {items.map((l) => (
            <li key={l.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700">{l.type}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{l.topic}</span>
                <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  {l.hours}h
                </span>
                {typeof l.distanceKm === "number" && (
                  <span className="text-[10px] text-slate-500">{l.distanceKm}km</span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-800">{l.body}</p>
              <div className="mt-2 flex items-center justify-between">
                {l.expense ? (
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                    <Wallet className="h-3 w-3" />
                    ¥{l.expense.toLocaleString()}
                  </div>
                ) : <span />}
                <button
                  onClick={() => pushSheet({ kind: "activity-create", editing: l })}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  <Pencil className="h-3 w-3" />
                  編集
                </button>
              </div>
            </li>
          ))}
        </ul>
        {depth > 1 && (
          <div className="mt-4 text-center">
            <button onClick={onClose} className="text-[11px] text-slate-500 hover:underline">
              カレンダーに戻る
            </button>
          </div>
        )}
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
  const [saving, setSaving] = React.useState(false);
  const amountNum = parseInt(amount.replace(/[^0-9]/g, ""), 10);
  const canSubmit = !!title.trim() && amountNum > 0 && purpose.trim().length >= 5 && !saving;

  async function submit() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await addExpense({ title: title.trim(), amount: amountNum, purpose: purpose.trim(), status: "申請中" });
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <SheetHeader
        title="経費を申請(事前)"
        onClose={onClose}
        right={
          <button onClick={submit} disabled={!canSubmit} className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300">
            申請
          </button>
        }
      />
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
          <button onClick={onClose} className="text-[11px] font-bold text-slate-900 hover:underline">完了</button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <p className="text-[11px] text-slate-500">あなた専用の活動テーマ。活動報告を書くときの選択肢として使われます。</p>

        <div className="mt-4 flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="例:商店街活性化" className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none" />
          <button onClick={add} disabled={!input.trim()} className="rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">追加</button>
        </div>

        <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">登録中({topics.length})</div>
        {topics.length === 0 ? (
          <div className="mt-2 text-[11px] text-slate-400">まだ登録されていません</div>
        ) : (
          <ul className="mt-2 space-y-px">
            {topics.map((t) => (
              <li key={t} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-b-0">
                <span className="flex-1 text-[13px] text-slate-800">{t}</span>
                <button onClick={() => removeTopic(t)} className="text-[11px] text-slate-400 hover:text-rose-700">削除</button>
              </li>
            ))}
          </ul>
        )}
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
