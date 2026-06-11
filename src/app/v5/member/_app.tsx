"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Check,
} from "lucide-react";

/* ============================================================
   v5 隊員アプリ ─ 検索エンジン型・4 機能(日報 / 月報 / 経費 / 事例)
   方針:
   - 1 viewport で完結(PC / SP 両方スクロールなし)
   - 中央に検索ボックス、上に機能タブ
   - 業務ツールとして読める白基調 + slate アクセント
   - 日報が月報の素材(日々書く → 月末に AI が月報化)
   ============================================================ */

type Tab = "daily" | "report" | "expense" | "case";

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("daily");
  const [mentorOpen, setMentorOpen] = React.useState(false);

  return (
    <main className="flex h-screen flex-col bg-white text-slate-900">
      <Header onMentorOpen={() => setMentorOpen(true)} />
      <Tabs active={tab} onChange={setTab} />

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">
          {tab === "daily" && <DailyTab />}
          {tab === "report" && <ReportTab />}
          {tab === "expense" && <ExpenseTab />}
          {tab === "case" && <CaseTab />}
        </div>
      </div>

      <Footer />
      {mentorOpen && <MentorPanel onClose={() => setMentorOpen(false)} />}
    </main>
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
      <TabBtn
        label="日報"
        active={active === "daily"}
        onClick={() => onChange("daily")}
      />
      <TabBtn
        label="月報"
        active={active === "report"}
        onClick={() => onChange("report")}
      />
      <TabBtn
        label="経費"
        active={active === "expense"}
        onClick={() => onChange("expense")}
      />
      <TabBtn
        label="事例"
        active={active === "case"}
        onClick={() => onChange("case")}
      />
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
  when: string;
};

const seedLogs: DailyLog[] = [
  { id: "l1", category: "空き家", memo: "A 邸内覧、家族 4 人と現地調整。築 80 年、構造は良好。", when: "今日 14:20" },
  { id: "l2", category: "会議", memo: "観光協会 月例会(13:30〜)", when: "今日 11:05" },
  { id: "l3", category: "移住相談", memo: "名古屋ファミリー Web 会議(60 分)", when: "昨日 16:40" },
];

function DailyTab() {
  const [category, setCategory] = React.useState<string | null>(null);
  const [memo, setMemo] = React.useState("");
  const [logs, setLogs] = React.useState<DailyLog[]>(seedLogs);

  const canSave = !!category || memo.trim().length > 0;

  function save() {
    if (!canSave) return;
    setLogs((ls) => [
      {
        id: String(Date.now()),
        category: category ?? "振り返り",
        memo: memo.trim() || "(メモなし)",
        when: "今日",
      },
      ...ls,
    ]);
    setCategory(null);
    setMemo("");
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">日報</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        今日やったことを 1 行で。月末に AI が月報へまとめます
      </p>

      {/* カテゴリチップ */}
      <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-1.5">
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

      {/* 入力ボックス */}
      <div className="mx-auto mt-3 flex max-w-xl items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition focus-within:border-slate-900 focus-within:shadow-md">
        <Plus className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          placeholder="例:A 邸を内覧、移住希望者と一緒に"
          className="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={save}
          disabled={!canSave}
          className="rounded-full bg-slate-900 px-4 py-1 text-[12px] font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          記録
        </button>
      </div>

      {/* 今日 / 直近のログ */}
      <ul className="mt-6 space-y-px text-left">
        {logs.slice(0, 4).map((l) => (
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
            <span className="shrink-0 text-[10px] text-slate-400">{l.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------- 2. 月報タブ -------------------- */

function ReportTab() {
  const [q, setQ] = React.useState("");
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">月報</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        日々のログから AI が自動生成します
      </p>

      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="月を指定 ・ 例:2026 年 6 月"
      />

      <ul className="mt-6 space-y-px text-left">
        <ResultRow
          title="2026 年 6 月"
          sub="自動生成中 ・ 23 件のログから"
          right="プレビュー"
          emphasis
        />
        <ResultRow
          title="2026 年 5 月"
          sub="提出済 ・ 役場承認 5/31"
          right="開く"
        />
        <ResultRow
          title="2026 年 4 月"
          sub="提出済 ・ 役場承認 4/30"
          right="開く"
        />
      </ul>
    </div>
  );
}

/* -------------------- 3. 経費タブ -------------------- */

function ExpenseTab() {
  const [q, setQ] = React.useState("古民家コワーキング 家賃 月 5 万円");
  const checked = q.trim().length > 0;
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight">経費</h1>
      <p className="mt-1 text-[12px] text-slate-500">
        これ通るかな?を AI と過去事例で確かめる
      </p>

      <SearchBox
        value={q}
        onChange={setQ}
        placeholder="例:古民家家賃 月 5 万円 / 視察出張費 ¥38,400"
      />

      {checked && (
        <>
          {/* 通過確度 */}
          <div className="mt-5 flex items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              <strong>通る可能性 高</strong>(過去 6 件中 5 件が承認)
            </span>
          </div>

          <ul className="mt-3 space-y-px text-left">
            <ResultRow
              title="海士町 古民家コワーキング(2024)"
              sub="活動拠点として申請 → 承認(週 1 地域開放日が条件)"
              right="詳細"
            />
            <ResultRow
              title="JOIN お役立ちツール Q&A"
              sub="「活動拠点としての賃借料は対象」"
              right="出典"
            />
            <ResultRow
              title="佐用町 役場 過去承認ログ(類似)"
              sub="拠点賃借 月 4 万円 → 承認 / 月 8 万円 → 差戻"
              right="詳細"
            />
          </ul>
        </>
      )}
    </div>
  );
}

/* -------------------- 4. 事例タブ -------------------- */

function CaseTab() {
  const [q, setQ] = React.useState("");
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
        <div>
          <div className="mt-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
            トレンド
          </div>
          <ul className="mt-1 space-y-px text-left">
            <ResultRow title="空き家バンク立ち上げ" sub="34 件 ・ 全国" right="検索" />
            <ResultRow title="移住相談ネットワーク" sub="28 件 ・ 全国" right="検索" />
            <ResultRow title="観光協会との連携" sub="19 件 ・ 全国" right="検索" />
          </ul>
        </div>
      ) : (
        <ul className="mt-5 space-y-px text-left">
          <ResultRow
            title="空き家バンクで 1 年目 12 件登録(養父市・山本氏)"
            sub="自治会連動の DM 配布が効いた"
            right="詳細"
          />
          <ResultRow
            title="空き家清掃ボランティアの定着(海士町)"
            sub="月 1 開催で地元との関係構築"
            right="詳細"
          />
          <ResultRow
            title="DIY 補助金との組み合わせ(JOIN)"
            sub="物件登録時の補助金活用例"
            right="出典"
          />
        </ul>
      )}
    </div>
  );
}

/* -------------------- Reusable: SearchBox / ResultRow -------------------- */

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

function ResultRow({
  title,
  sub,
  right,
  emphasis,
}: {
  title: string;
  sub?: string;
  right?: string;
  emphasis?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 border-b border-slate-100 py-2.5 transition last:border-b-0 hover:bg-slate-50/60 ${
        emphasis ? "bg-slate-50/30" : ""
      }`}
    >
      <div className="min-w-0 flex-1 px-1">
        <div className="text-[13px] font-semibold text-slate-900">{title}</div>
        {sub && (
          <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
        )}
      </div>
      {right && (
        <button className="inline-flex items-center gap-0.5 px-2 text-[11px] font-semibold text-slate-700 hover:text-slate-900">
          {right}
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </li>
  );
}

/* -------------------- メンターパネル -------------------- */

function MentorPanel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = React.useState(
    "古民家を借りて隊員仲間とコワーキングスペースを試作したい。活動費で家賃の一部を出せる?"
  );
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
        <div className="text-[12px] font-semibold">AI メンター・あおい</div>
        <span className="w-12" />
      </header>

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
    </div>
  );
}
