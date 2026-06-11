"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Sparkles,
  X,
  Plus,
  Search,
} from "lucide-react";

/* ============================================================
   v5 隊員アプリ ─ モノクロ・業務リスト型(再々設計)
   方針: グラデ/FAB/カード過多を捨て、Bear/Notes/Linear 系の
   情報密度高めの「メモアプリらしい日報ツール」にする。
   ============================================================ */

type Category =
  | "akiya"
  | "ijuu"
  | "event"
  | "meeting"
  | "trip"
  | "pr"
  | "expense"
  | "reflect";

const categoryLabel: Record<Category, string> = {
  akiya: "空き家",
  ijuu: "移住相談",
  event: "イベント",
  meeting: "会議",
  trip: "出張",
  pr: "広報",
  expense: "経費",
  reflect: "振り返り",
};

type LogEntry = {
  id: string;
  category: Category;
  memo: string;
};

type DayEntry = {
  date: string; // "2026-06-09"
  display: string; // "6月9日(月)"
  records: LogEntry[];
};

const todayDisplay = "6月10日(火)";

const past: DayEntry[] = [
  {
    date: "2026-06-09",
    display: "6月9日(月)",
    records: [
      { id: "r1", category: "akiya", memo: "A邸内覧、家族4人と現地調整。築80年、構造は良好。" },
      { id: "r2", category: "meeting", memo: "観光協会 月例会(13:30〜)" },
      { id: "r3", category: "reflect", memo: "夕方の振り返り。空き家の動きが活発化、来月はDM配布。" },
    ],
  },
  {
    date: "2026-06-08",
    display: "6月8日(日)",
    records: [
      { id: "r4", category: "akiya", memo: "B邸 清掃ボランティア。地元自治会と合同。" },
    ],
  },
  {
    date: "2026-06-07",
    display: "6月7日(土)",
    records: [
      { id: "r5", category: "ijuu", memo: "移住相談 Web会議 / 名古屋ファミリー(60分)" },
      { id: "r6", category: "pr", memo: "Instagram 空き家紹介投稿、いいね 84件" },
    ],
  },
  {
    date: "2026-06-06",
    display: "6月6日(金)",
    records: [
      { id: "r7", category: "trip", memo: "島根県 視察。類似事例調査(¥38,400 経費要申請)" },
    ],
  },
  {
    date: "2026-06-05",
    display: "6月5日(木)",
    records: [
      { id: "r8", category: "ijuu", memo: "移住検討者 家族 視察対応" },
      { id: "r9", category: "event", memo: "地域おこし協議会 出展準備" },
    ],
  },
];

export function MemberApp() {
  const [mentorOpen, setMentorOpen] = React.useState(false);
  const [composeCategory, setComposeCategory] = React.useState<Category | null>(
    null
  );
  const [composeText, setComposeText] = React.useState("");
  const [entries, setEntries] = React.useState<LogEntry[]>([]);

  function add() {
    if (!composeCategory && !composeText.trim()) return;
    setEntries((es) => [
      {
        id: String(Date.now()),
        category: composeCategory ?? "reflect",
        memo: composeText.trim() || "(メモなし)",
      },
      ...es,
    ]);
    setComposeText("");
    setComposeCategory(null);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ─── Header (fixed, minimal) ─── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur">
        <Link
          href="/v5"
          className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          切替
        </Link>
        <div className="text-center">
          <div className="text-[12px] font-semibold">田中 あかり</div>
          <div className="text-[10px] text-slate-500">新温泉町 / 移住促進</div>
        </div>
        <button
          onClick={() => setMentorOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900"
        >
          <Sparkles className="h-3.5 w-3.5" />
          相談
        </button>
      </header>

      {/* ─── Composer (上部固定エリア / Today) ─── */}
      <section className="border-b border-slate-200 px-4 pb-3 pt-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TODAY ・ {todayDisplay}
          </h2>
          <span className="text-[10px] text-slate-400">
            {entries.length === 0 ? "まだ書いていません" : `${entries.length} 件 記録済`}
          </span>
        </div>

        {/* Quick category chips */}
        <div className="flex flex-wrap gap-1">
          {(Object.keys(categoryLabel) as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => setComposeCategory(c)}
              className={`rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                composeCategory === c
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:border-slate-400"
              }`}
            >
              {categoryLabel[c]}
            </button>
          ))}
        </div>

        {/* Compose text */}
        <div className="mt-2 flex items-start gap-2">
          <input
            type="text"
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="今日の活動を 1 行で…"
            className="flex-1 border-b border-slate-200 bg-transparent px-0 py-1.5 text-[13px] placeholder-slate-400 focus:border-slate-900 focus:outline-none"
          />
          <button
            onClick={add}
            disabled={!composeCategory && !composeText.trim()}
            className="rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white transition disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
          >
            記録
          </button>
        </div>

        {/* Today's added records */}
        {entries.length > 0 && (
          <ul className="mt-3 space-y-0">
            {entries.map((e) => (
              <RecordRow key={e.id} record={e} />
            ))}
          </ul>
        )}
      </section>

      {/* ─── Past entries (timeline list) ─── */}
      <section>
        {past.map((day) => (
          <DaySection key={day.date} day={day} />
        ))}
      </section>

      {/* ─── Monthly footer ─── */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-[11px] text-slate-600">
        今月 ・ 23 件 ・{" "}
        <button className="font-bold text-slate-900 underline underline-offset-2 hover:no-underline">
          月報を見る
        </button>
      </section>

      {mentorOpen && <MentorPanel onClose={() => setMentorOpen(false)} />}
    </main>
  );
}

function DaySection({ day }: { day: DayEntry }) {
  return (
    <div className="border-b border-slate-100">
      <div className="flex items-center justify-between bg-slate-50 px-4 py-1.5">
        <span className="text-[11px] font-bold text-slate-700">
          {day.display}
        </span>
        <span className="text-[10px] text-slate-500">{day.records.length} 件</span>
      </div>
      <ul>
        {day.records.map((r) => (
          <RecordRow key={r.id} record={r} />
        ))}
      </ul>
    </div>
  );
}

function RecordRow({ record }: { record: LogEntry }) {
  return (
    <li className="flex items-start gap-2 border-t border-slate-100 px-4 py-2 first:border-t-0 hover:bg-slate-50/60">
      <span className="mt-0.5 shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-600">
        {categoryLabel[record.category]}
      </span>
      <span className="flex-1 text-[12px] leading-relaxed text-slate-800">
        {record.memo}
      </span>
    </li>
  );
}

/* -------------------- メンターパネル (Slide-up) -------------------- */

function MentorPanel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = React.useState(
    "古民家を借りて隊員仲間とコワーキングスペースを試作したい。活動費で家賃の一部を出せる?"
  );
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1 text-[12px] text-slate-700 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
          閉じる
        </button>
        <div className="text-[12px] font-semibold">AI メンター・あおい</div>
        <button className="text-[11px] text-slate-500 hover:text-slate-900">
          履歴
        </button>
      </header>

      {/* Q&A */}
      <div className="flex-1 overflow-y-auto">
        <section className="border-b border-slate-200 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            質問
          </div>
          <textarea
            rows={3}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1.5 w-full resize-none border-0 bg-transparent text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button className="rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white">
            助言を見る
          </button>
        </section>

        <section>
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            あおいの 4 視点
          </div>
          <AdviceRow
            label="役場目線"
            body="活動拠点としての賃借料は対象になり得る(JOIN Q&A)。事前協議が原則、ミッションとの紐付けが必須。"
            citation="JOIN Q&A"
          />
          <AdviceRow
            label="地域目線"
            body="「閉じた空間」に見えると地域から距離を置かれる懸念。週 1 で地域開放日を設けると自治会の信頼を得やすい。"
            citation="海士町 古民家コワーキング 2024"
          />
          <AdviceRow
            label="あなた目線"
            body="1 年目=試作 / 2 年目=巻き込み / 3 年目=運営移譲、の段階で組み立てると任期内で成果物として残せる。"
          />
          <AdviceRow
            label="スモールスタート"
            body="月 2 回・3 時間だけ短期賃借 → SNS 募集 → 来場者数と写真を記録。1 週間でできる。"
          />
        </section>
      </div>
    </div>
  );
}

function AdviceRow({
  label,
  body,
  citation,
}: {
  label: string;
  body: string;
  citation?: string;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-3">
      <div className="text-[10px] font-bold text-slate-700">{label}</div>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-800">{body}</p>
      {citation && (
        <div className="mt-1.5 font-mono text-[10px] text-slate-500">
          引用: {citation}
        </div>
      )}
    </div>
  );
}
