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
  Lightbulb,
  TrendingUp,
  Building2,
  Calendar,
  Quote,
} from "lucide-react";

/* ============================================================
   v5 隊員アプリ ─ 検索エンジン型・4 機能(日報 / 月報 / 経費 / 事例)
   方針:
   - 1 viewport で完結(PC / SP 両方スクロールなし基調)
   - 中央に検索ボックス、上に機能タブ
   - 業務ツールとして読める白基調 + slate アクセント
   - 日報が月報の素材(日々書く → 月末に AI が月報化)

   2026-06-11 改修:
   - 日報: 今日の作成状況 + 過去日報 + 右下 FAB で作成シート
   - 月報: 行クリックで月報詳細(プレビュー)シート
   - 経費: 検索 + 詳細シート + 経費申請ボタン → 申請シート
   - 事例: 行クリックで事例詳細シート
   ============================================================ */

type Tab = "daily" | "report" | "expense" | "case";

/* -------------------- データ -------------------- */

const dailyCategories = [
  "空き家",
  "移住相談",
  "イベント",
  "会議",
  "出張",
  "広報",
  "経費",
  "振り返り",
];

type DailyLog = {
  id: string;
  category: string;
  memo: string;
  date: string;
  time: string;
};

const seedLogs: DailyLog[] = [
  {
    id: "l1",
    category: "空き家",
    memo: "A 邸内覧、家族 4 人と現地調整。築 80 年、構造は良好。",
    date: "今日",
    time: "14:20",
  },
  {
    id: "l2",
    category: "会議",
    memo: "観光協会 月例会(13:30〜)",
    date: "今日",
    time: "11:05",
  },
  {
    id: "l3",
    category: "移住相談",
    memo: "名古屋ファミリー Web 会議(60 分)",
    date: "昨日",
    time: "16:40",
  },
  {
    id: "l4",
    category: "広報",
    memo: "町報の特集記事ドラフト、写真選定",
    date: "昨日",
    time: "10:30",
  },
  {
    id: "l5",
    category: "イベント",
    memo: "夏祭り実行委員会、出店者リスト確定",
    date: "6/8",
    time: "19:00",
  },
  {
    id: "l6",
    category: "空き家",
    memo: "B 邸 所有者連絡、内覧日程調整",
    date: "6/8",
    time: "14:00",
  },
];

type Report = {
  id: string;
  yearMonth: string;
  status: "draft" | "submitted" | "approved";
  statusLabel: string;
  logCount: number;
  summary: string;
  sections: { title: string; body: string }[];
};

const reports: Report[] = [
  {
    id: "r-2026-06",
    yearMonth: "2026 年 6 月",
    status: "draft",
    statusLabel: "自動生成中",
    logCount: 23,
    summary:
      "空き家バンク立ち上げで 2 件の新規登録。移住相談 5 件のうち 1 家族が現地視察まで進行。",
    sections: [
      {
        title: "活動サマリ",
        body: "6 月は空き家バンク事業の本格稼働月。A 邸の所有者交渉が成立し、内覧公開まで進めた。移住相談は前月比 +2 件。",
      },
      {
        title: "個別活動の詳細",
        body: "・空き家:A 邸 / B 邸 の所有者交渉、内覧 3 件\n・移住相談:5 件(うち 1 件現地視察まで)\n・イベント:夏祭り実行委員会 2 回参加\n・広報:町報 7 月号 特集ドラフト",
      },
      {
        title: "成果物",
        body: "空き家バンク登録:2 件(累計 12 件)\n移住相談アンケート:5 件回収",
      },
      {
        title: "来月計画",
        body: "・夏祭り当日の運営(7/14)\n・移住者向け体験ツアー初回開催(7/27)\n・空き家バンク累計 15 件を目標",
      },
      {
        title: "所感・課題",
        body: "空き家所有者の高齢化で意思決定に時間がかかる場面が増えている。家族親族との合意形成プロセスを共有できる場が欲しい。",
      },
    ],
  },
  {
    id: "r-2026-05",
    yearMonth: "2026 年 5 月",
    status: "approved",
    statusLabel: "役場承認 5/31",
    logCount: 21,
    summary:
      "GW を活用した移住体験ツアーを初めて実施、4 家族参加。観光協会との連携体制を確立。",
    sections: [
      {
        title: "活動サマリ",
        body: "GW を活用した移住体験ツアーを 4/29-5/1 で実施。延べ 4 家族 13 名参加。事後アンケートで満足度 4.6/5。",
      },
      {
        title: "個別活動の詳細",
        body: "・移住体験ツアー:4 家族 13 名、3 日間\n・観光協会との連携協定:5/20 締結\n・空き家:C 邸の解体相談、D 邸内覧 2 回",
      },
      {
        title: "成果物",
        body: "移住体験ツアー報告書\n観光協会連携協定書\nC 邸解体スキーム案",
      },
      {
        title: "来月計画",
        body: "・空き家バンク本格稼働\n・移住相談プロセスの標準化",
      },
      {
        title: "所感・課題",
        body: "ツアー参加者の満足度は高かったが、現地での移動手段に課題。レンタカー手配のサポートが必要。",
      },
    ],
  },
  {
    id: "r-2026-04",
    yearMonth: "2026 年 4 月",
    status: "approved",
    statusLabel: "役場承認 4/30",
    logCount: 18,
    summary:
      "年度初頭の体制構築月。空き家バンク立ち上げ準備、住民広報強化。",
    sections: [
      {
        title: "活動サマリ",
        body: "年度初頭の体制構築月。空き家バンク立ち上げ準備として既存物件の棚卸し、住民広報強化。",
      },
      {
        title: "個別活動の詳細",
        body: "・空き家:既存物件 28 件の棚卸し、所有者リスト整備\n・広報:町報 5 月号 担当ページ\n・住民会議:3 地区で開催",
      },
      {
        title: "成果物",
        body: "空き家リスト(28 件)\n空き家バンク事業計画書 v1",
      },
      {
        title: "来月計画",
        body: "・移住体験ツアー実施\n・観光協会との連携締結",
      },
      {
        title: "所感・課題",
        body: "住民会議で「外からの人を呼ぶ前にやることがある」という意見も。地域内合意形成を丁寧に。",
      },
    ],
  },
];

type ExpenseItem = {
  id: string;
  title: string;
  amount: string;
  status: "申請可" | "要確認" | "対象外";
  reason: string;
  citation: { source: string; quote: string };
};

const expenseHistory: ExpenseItem[] = [
  {
    id: "e1",
    title: "町報 印刷費 ¥12,800",
    amount: "¥12,800",
    status: "申請可",
    reason: "広報物の印刷費は活動費対象。過去 4 件同様に承認。",
    citation: {
      source: "新温泉町 活動費ガイドライン v2.1",
      quote: "広報物の印刷費は活動費の対象に含まれます。",
    },
  },
  {
    id: "e2",
    title: "視察出張費 ¥38,400(島根県)",
    amount: "¥38,400",
    status: "要確認",
    reason: "県外出張は事前承認が必要。事後申請の場合は理由書添付。",
    citation: {
      source: "新温泉町 活動費ガイドライン v2.1",
      quote: "県外出張は事前承認(町長決裁)必須。事後申請は理由書添付。",
    },
  },
  {
    id: "e3",
    title: "古民家家賃 月 5 万円",
    amount: "¥50,000/月",
    status: "申請可",
    reason: "活動拠点の賃借料は対象。海士町に類似事例あり(月 4 万円承認)。",
    citation: {
      source: "JOIN お役立ちツール Q&A",
      quote: "活動拠点として賃借する家屋の賃料は活動費の対象に含まれます。",
    },
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
    summary:
      "自治会連動の DM 配布で空き家所有者にリーチ。1 年目で 12 件の登録、うち 4 件成約。",
    kpi: "登録 12 件 / 成約 4 件 / 移住 3 家族",
    effect: "町外からの移住 7 名増、空き家率 -0.4 pt",
    process: [
      {
        phase: "1-3 月目",
        body: "既存の空き家リスト棚卸し。所有者連絡先の整備に注力。",
      },
      {
        phase: "4-6 月目",
        body: "自治会経由で所有者に挨拶状を DM 配布(18 件)。返信 9 件。",
      },
      {
        phase: "7-9 月目",
        body: "内覧 7 件、登録 5 件。並行して移住希望者リスト作成。",
      },
      {
        phase: "10-12 月目",
        body: "成約 4 件、移住 3 家族受け入れ。",
      },
    ],
    learning:
      "自治会経由の DM は反応率が高い(直接送付の 3 倍)。所有者の心理的ハードルが「知らない人より地域経由」で下がる。",
  },
  {
    id: "c2",
    title: "空き家清掃ボランティアの定着",
    area: "島根県 海士町",
    year: "2023",
    author: "中島(隊員 2 年目)",
    summary:
      "月 1 回の空き家清掃ボランティアを継続開催。地元住民との関係構築の場として機能。",
    kpi: "12 回開催 / 延べ参加 84 名 / 清掃完了 8 物件",
    effect: "地元住民との関係構築 + 物件の早期市場投入",
    process: [
      {
        phase: "1-2 月目",
        body: "地元自治会と相談、第 1 回は地域住民のみで開催。",
      },
      {
        phase: "3-6 月目",
        body: "SNS で外部にも告知、移住希望者の参加が増える。",
      },
      {
        phase: "7-12 月目",
        body: "月 1 定期化、清掃完了物件は空き家バンクに即登録。",
      },
    ],
    learning:
      "地元 → 外部の順で開いていくと、住民の抵抗が少ない。清掃 + 交流の二段構造が効く。",
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
      {
        phase: "申請",
        body: "市町村窓口で DIY 補助金の交付申請。",
      },
      {
        phase: "実施",
        body: "補助対象工事を実施(壁紙・水回り等)。",
      },
      {
        phase: "登録",
        body: "工事完了後に空き家バンクに登録。",
      },
    ],
    learning:
      "補助金申請のタイミングを物件登録と連動させると、所有者の意思決定が早まる。",
  },
];

const trendCases = [
  { id: "t1", title: "空き家バンク立ち上げ", count: 34 },
  { id: "t2", title: "移住相談ネットワーク", count: 28 },
  { id: "t3", title: "観光協会との連携", count: 19 },
];

/* -------------------- Context -------------------- */

type Sheet =
  | { kind: "daily-create" }
  | { kind: "report-detail"; report: Report }
  | { kind: "expense-detail"; item: ExpenseItem }
  | { kind: "expense-create" }
  | { kind: "case-detail"; case: CaseItem }
  | { kind: "mentor" }
  | null;

type Ctx = {
  logs: DailyLog[];
  addLog: (category: string, memo: string) => void;
  sheet: Sheet;
  openSheet: (s: Sheet) => void;
};

const AppCtx = React.createContext<Ctx | null>(null);
const useApp = () => {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("AppCtx missing");
  return c;
};

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("daily");
  const [logs, setLogs] = React.useState<DailyLog[]>(seedLogs);
  const [sheet, setSheet] = React.useState<Sheet>(null);

  const ctx: Ctx = {
    logs,
    addLog: (category, memo) =>
      setLogs((ls) => [
        {
          id: String(Date.now()),
          category,
          memo,
          date: "今日",
          time: new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...ls,
      ]),
    sheet,
    openSheet: setSheet,
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

        <Footer />
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
      <TabBtn label="日報" active={active === "daily"} onClick={() => onChange("daily")} />
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

function Footer() {
  return (
    <footer className="border-t border-slate-100 py-2 text-center text-[10px] text-slate-400">
      地域おこし協力隊サポートシステム ・ v5 lab
    </footer>
  );
}

/* -------------------- 1. 日報タブ -------------------- */

function DailyTab() {
  const { logs, openSheet } = useApp();
  const today = logs.filter((l) => l.date === "今日");
  const past = logs.filter((l) => l.date !== "今日");

  const categoriesUsedToday = Array.from(new Set(today.map((l) => l.category)));

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">日報</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          今日やったことを 1 行で。月末に AI が月報へまとめます
        </p>
      </div>

      {/* 今日の作成状況 */}
      <section className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            今日の作成状況
          </div>
          <div className="text-[10px] text-slate-400">
            6 月 11 日(木)
          </div>
        </div>
        <div className="mt-2 flex items-end gap-3">
          <div>
            <div className="text-3xl font-black text-slate-900">
              {today.length}
            </div>
            <div className="text-[10px] text-slate-500">件 記録済</div>
          </div>
          {categoriesUsedToday.length > 0 && (
            <div className="flex flex-1 flex-wrap gap-1 pb-1">
              {categoriesUsedToday.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        {today.length > 0 ? (
          <ul className="mt-3 space-y-px">
            {today.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-3 border-t border-slate-200/70 py-2 first:border-t-0"
              >
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {l.category}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-slate-800">
                  {l.memo}
                </span>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {l.time}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white/50 px-3 py-4 text-center text-[11px] text-slate-500">
            まだ記録がありません。右下の <strong>+</strong> から作成
          </div>
        )}
      </section>

      {/* 過去の日報 */}
      <section className="mx-auto mt-6 max-w-xl">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          過去の日報
        </div>
        {past.length === 0 ? (
          <div className="text-[11px] text-slate-400">過去の記録はありません</div>
        ) : (
          <ul className="space-y-px">
            {past.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0"
              >
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {l.category}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-slate-800">
                  {l.memo}
                </span>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {l.date} {l.time}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* フローティング作成ボタン */}
      <button
        onClick={() => openSheet({ kind: "daily-create" })}
        className="fixed bottom-10 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-white transition hover:bg-slate-800 active:scale-95"
        aria-label="日報を作成"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
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
        日々のログから AI が自動生成します
      </p>

      <SearchBox value={q} onChange={setQ} placeholder="月を指定 ・ 例:2026 年 6 月" />

      {filtered.length === 0 ? (
        <EmptyState message="該当する月報がありません。" />
      ) : (
        <ul className="mt-6 space-y-px text-left">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="border-b border-slate-100 last:border-b-0"
            >
              <button
                onClick={() => openSheet({ kind: "report-detail", report: r })}
                className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-slate-50/60"
              >
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1 px-1">
                  <div className="text-[13px] font-semibold text-slate-900">
                    {r.yearMonth}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {r.statusLabel} ・ ログ {r.logCount} 件
                  </div>
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
                  {r.status === "draft"
                    ? "下書き"
                    : r.status === "submitted"
                    ? "提出済"
                    : "承認済"}
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

function ExpenseTab() {
  const { openSheet } = useApp();
  const [q, setQ] = React.useState("");

  const matched = q.trim()
    ? expenseHistory.filter((e) => e.title.includes(q))
    : expenseHistory;

  return (
    <div className="relative">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">経費</h1>
        <p className="mt-1 text-[12px] text-slate-500">
          これ通るかな?を AI と過去事例で確かめる
        </p>

        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="例:古民家家賃 / 視察出張費 / 印刷費"
        />
      </div>

      <div className="mt-4 text-left">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {q.trim() ? `検索結果 ${matched.length} 件` : "過去の申請履歴"}
        </div>
        {matched.length === 0 ? (
          <EmptyState message="該当する経費がありません。新規申請から起こしてください。" />
        ) : (
          <ul className="space-y-px">
            {matched.map((e) => (
              <li
                key={e.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <button
                  onClick={() => openSheet({ kind: "expense-detail", item: e })}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
                >
                  <Receipt className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1 px-1">
                    <div className="text-[13px] font-semibold text-slate-900">
                      {e.title}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-slate-500">
                      {e.reason}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      e.status === "申請可"
                        ? "border-slate-300 bg-slate-50 text-slate-700"
                        : e.status === "要確認"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
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

/* -------------------- 4. 事例タブ -------------------- */

function CaseTab() {
  const { openSheet } = useApp();
  const [q, setQ] = React.useState("");

  const matched = q.trim()
    ? cases.filter(
        (c) => c.title.includes(q) || c.area.includes(q) || c.summary.includes(q)
      )
    : [];

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">事例</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        全国の協力隊の活動から探す
      </p>

      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="キーワード ・ 例:空き家 移住相談 観光協会"
      />

      {q.trim() === "" ? (
        <div className="mt-6">
          <div className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
            トレンド
          </div>
          <ul className="mt-1 space-y-px text-left">
            {trendCases.map((t) => (
              <li
                key={t.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <button
                  onClick={() => setQ(t.title)}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
                >
                  <TrendingUp className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1 px-1">
                    <div className="text-[13px] font-semibold text-slate-900">
                      {t.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {t.count} 件 ・ 全国
                    </div>
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
            <li
              key={c.id}
              className="border-b border-slate-100 last:border-b-0"
            >
              <button
                onClick={() => openSheet({ kind: "case-detail", case: c })}
                className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-slate-50/60"
              >
                <Lightbulb className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1 px-1">
                  <div className="text-[13px] font-semibold text-slate-900">
                    {c.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {c.area} ・ {c.year}
                  </div>
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

/* -------------------- Sheet (全画面) -------------------- */

function SheetRoot() {
  const { sheet, openSheet } = useApp();
  if (!sheet) return null;
  const close = () => openSheet(null);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {sheet.kind === "daily-create" && <DailyCreateSheet onClose={close} />}
      {sheet.kind === "report-detail" && (
        <ReportDetailSheet report={sheet.report} onClose={close} />
      )}
      {sheet.kind === "expense-detail" && (
        <ExpenseDetailSheet item={sheet.item} onClose={close} />
      )}
      {sheet.kind === "expense-create" && (
        <ExpenseCreateSheet onClose={close} />
      )}
      {sheet.kind === "case-detail" && (
        <CaseDetailSheet item={sheet.case} onClose={close} />
      )}
      {sheet.kind === "mentor" && <MentorSheet onClose={close} />}
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

/* -------- 日報作成シート -------- */

function DailyCreateSheet({ onClose }: { onClose: () => void }) {
  const { addLog } = useApp();
  const [category, setCategory] = React.useState<string | null>(null);
  const [memo, setMemo] = React.useState("");
  const canSave = !!category || memo.trim().length > 0;

  function save() {
    if (!canSave) return;
    addLog(category ?? "振り返り", memo.trim() || "(メモなし)");
    onClose();
  }

  return (
    <>
      <SheetHeader
        title="日報を書く"
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
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          カテゴリ
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {dailyCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory((cur) => (cur === c ? null : c))}
              className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
                category === c
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-600 hover:border-slate-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          メモ
        </div>
        <textarea
          rows={5}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例:A 邸を内覧、移住希望者と一緒に。築 80 年だが構造良好。"
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-4 flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-500">
            <Mic className="h-3.5 w-3.5" />
            音声で
          </button>
          <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-500">
            <Camera className="h-3.5 w-3.5" />
            写真
          </button>
        </div>

        <div className="mt-6 text-[10px] text-slate-400">
          ※ 月末に AI が日報をまとめて月報の下書きを作ります
        </div>
      </div>
    </>
  );
}

/* -------- 月報詳細シート -------- */

function ReportDetailSheet({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  return (
    <>
      <SheetHeader title={report.yearMonth} onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              report.status === "draft"
                ? "border-slate-300 bg-slate-50 text-slate-700"
                : report.status === "submitted"
                ? "border-slate-300 bg-white text-slate-700"
                : "border-slate-300 bg-slate-900 text-white"
            }`}
          >
            {report.status === "draft"
              ? "下書き"
              : report.status === "submitted"
              ? "提出済"
              : "承認済"}
          </span>
          <span className="text-[11px] text-slate-500">{report.statusLabel}</span>
          <span className="text-[11px] text-slate-400">
            ・ ログ {report.logCount} 件から
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          {report.yearMonth} 月次報告
        </h1>
        <p className="mt-1 text-[12px] text-slate-600">{report.summary}</p>

        <div className="mt-6 space-y-5">
          {report.sections.map((s) => (
            <section key={s.title}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {s.title}
              </div>
              <div className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-[12px] leading-relaxed text-slate-800">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 text-[10px] text-slate-400">
          ※ AI が日々のログから自動生成しました。提出前に内容を確認してください。
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

/* -------- 経費詳細シート -------- */

function ExpenseDetailSheet({
  item,
  onClose,
}: {
  item: ExpenseItem;
  onClose: () => void;
}) {
  const { openSheet } = useApp();
  return (
    <>
      <SheetHeader title="経費の確認" onClose={onClose} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">{item.title}</h1>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              item.status === "申請可"
                ? "border-slate-300 bg-slate-50 text-slate-700"
                : item.status === "要確認"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {item.status}
          </span>
          <span className="text-[11px] text-slate-500">{item.amount}</span>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            AI 判定材料
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-800">
            {item.reason}
          </p>
          <div className="mt-1 text-[10px] text-slate-400">
            ※ AI は判定しません。視点と材料のみ提供します。
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-[11px] font-semibold text-slate-700">
            {item.citation.source}
          </div>
          <div className="mt-1 flex items-start gap-1.5 text-[12px] text-slate-600">
            <Quote className="mt-0.5 h-3 w-3 shrink-0 text-slate-300" />
            <span className="leading-snug">{item.citation.quote}</span>
          </div>
        </div>

        <div className="mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          類似の過去申請
        </div>
        <ul className="mt-2 space-y-px">
          <li className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-b-0">
            <Receipt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1 text-[12px] text-slate-700">
              佐用町 拠点賃借 月 4 万円 → 承認
            </div>
          </li>
          <li className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-b-0">
            <Receipt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1 text-[12px] text-slate-700">
              海士町 古民家コワーキング → 承認(週 1 開放条件)
            </div>
          </li>
        </ul>
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500"
          >
            閉じる
          </button>
          <button
            onClick={() => openSheet({ kind: "expense-create" })}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            この内容で申請
          </button>
        </div>
      </div>
    </>
  );
}

/* -------- 経費申請シート -------- */

function ExpenseCreateSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const canSubmit = title.trim() && amount.trim() && purpose.trim().length >= 5;

  return (
    <>
      <SheetHeader
        title="経費申請"
        onClose={onClose}
        right={
          <button
            onClick={onClose}
            disabled={!canSubmit}
            className="text-[11px] font-bold text-slate-900 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          >
            申請
          </button>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          タイトル
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例:町報 7 月号 印刷費"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          金額
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="例:12800"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          用途 ・ 内容 <span className="text-rose-600">必須</span>
        </div>
        <textarea
          rows={4}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="何のために、どのような効果を見込んで支出するか。"
          className="mt-1 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] focus:border-slate-900 focus:outline-none"
        />

        <div className="mt-4 flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-slate-500">
            <Camera className="h-3.5 w-3.5" />
            領収書を撮る
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-[11px] leading-relaxed text-slate-600">
          <strong className="text-slate-800">AI の事前チェック:</strong>
          <br />
          入力後に「これ通るかな?」を AI と過去事例で確認します。
        </div>
      </div>
    </>
  );
}

/* -------- 事例詳細シート -------- */

function CaseDetailSheet({
  item,
  onClose,
}: {
  item: CaseItem;
  onClose: () => void;
}) {
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
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              KPI
            </div>
            <div className="mt-1 text-[12px] text-slate-800">{item.kpi}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              効果
            </div>
            <div className="mt-1 text-[12px] text-slate-800">{item.effect}</div>
          </div>
        </div>

        <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          プロセス
        </div>
        <ol className="mt-2 space-y-2">
          {item.process.map((p, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {p.phase}
              </div>
              <div className="mt-1 text-[12px] leading-relaxed text-slate-800">
                {p.body}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            学び
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-800">
            {item.learning}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-2">
          <button className="rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-500">
            保存
          </button>
          <button className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800">
            <Sparkles className="h-3.5 w-3.5" />
            自分の地域に翻案
          </button>
        </div>
      </div>
    </>
  );
}

/* -------- メンターシート(既存・移植) -------- */

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
