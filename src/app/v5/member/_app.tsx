"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  Mic,
  Bot,
  History,
  ChevronLeft,
  Bell,
  Flame,
  Trophy,
  ChevronRight,
  Sparkles,
  Building2,
  Users,
  UserCircle2,
  Quote,
  EyeOff,
  Camera,
  Type,
  Plus,
  Check,
  Calendar,
  BookOpen,
  Star,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Tab = "home" | "record" | "mentor" | "history";

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("home");

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-100 via-violet-50 to-rose-50 pb-24">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed -top-32 -left-20 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-20 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-md px-4 pt-4">
        <TopBar />
        <div className="mt-3">
          {tab === "home" && <HomeSection onJumpTo={setTab} />}
          {tab === "record" && <RecordSection />}
          {tab === "mentor" && <MentorSection />}
          {tab === "history" && <HistorySection />}
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </main>
  );
}

/* -------------------- Top Bar -------------------- */

function TopBar() {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/v5"
        className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur"
      >
        <ChevronLeft className="h-3 w-3" />
        v5
      </Link>
      {/* player status */}
      <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-md ring-1 ring-white/60 backdrop-blur">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 text-[10px] font-bold text-white ring-2 ring-white">
          あか
        </div>
        <div className="text-[11px] leading-tight">
          <div className="font-bold text-slate-900">田中 あかり</div>
          <div className="text-[9px] text-slate-500">任期 2 年目 / Lv.7</div>
        </div>
      </div>
      <button className="relative rounded-full bg-white/80 p-2 shadow-md ring-1 ring-white/60 backdrop-blur">
        <Bell className="h-4 w-4 text-slate-700" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
          3
        </span>
      </button>
    </div>
  );
}

/* -------------------- HOME -------------------- */

function HomeSection({ onJumpTo }: { onJumpTo: (t: Tab) => void }) {
  return (
    <div className="space-y-4">
      {/* Mentor hero */}
      <MentorHero
        message="おはよう!今日は古民家見学があるね。終わったら音声で記録しよう。質問があればいつでも聞いてね。"
        cta="相談する"
        onCta={() => onJumpTo("mentor")}
      />

      {/* Streak + Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatChip
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          label="記録連続"
          value="12"
          unit="日"
          color="from-orange-100 to-amber-50 ring-orange-200"
        />
        <StatChip
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
          label="達成"
          value="34"
          unit="件"
          color="from-amber-100 to-yellow-50 ring-amber-200"
        />
        <StatChip
          icon={<Star className="h-4 w-4 text-violet-500" />}
          label="評価"
          value="4.6"
          unit="★"
          color="from-violet-100 to-pink-50 ring-violet-200"
        />
      </div>

      {/* Today's Quests */}
      <Section title="今日のクエスト" hint="3 / 5 完了">
        <div className="space-y-2">
          <QuestRow text="10:00 空き家見学(A 邸)同行" done />
          <QuestRow text="13:30 地域おこし協議会 月例会" done />
          <QuestRow text="活動記録を 1 件登録する" done />
          <QuestRow text="夕方の振り返り音声を入れる" />
          <QuestRow text="メンターに 1 つ質問する" />
        </div>
        <div className="mt-3">
          <Progress value={60} className="h-2 bg-white/60" />
          <div className="mt-1 text-[10px] text-slate-500">
            あと 2 つで今日のクリア!
          </div>
        </div>
      </Section>

      {/* Quick Actions Grid */}
      <Section title="クイックアクション">
        <div className="grid grid-cols-4 gap-2">
          <QuickTile
            icon={<Mic className="h-6 w-6" />}
            label="録音"
            color="from-rose-400 to-pink-500"
            onClick={() => onJumpTo("record")}
          />
          <QuickTile
            icon={<Bot className="h-6 w-6" />}
            label="相談"
            color="from-emerald-400 to-teal-500"
            badge="NEW"
            onClick={() => onJumpTo("mentor")}
          />
          <QuickTile
            icon={<Camera className="h-6 w-6" />}
            label="経費写真"
            color="from-amber-400 to-orange-500"
            onClick={() => onJumpTo("record")}
          />
          <QuickTile
            icon={<BookOpen className="h-6 w-6" />}
            label="事例"
            color="from-violet-400 to-indigo-500"
            onClick={() => onJumpTo("mentor")}
          />
        </div>
      </Section>

      {/* Career news */}
      <CareerCard />
    </div>
  );
}

function MentorHero({
  message,
  cta,
  onCta,
}: {
  message: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-300 via-teal-400 to-sky-500 p-4 shadow-xl ring-2 ring-white/40">
      <span className="pointer-events-none absolute left-[6%] top-[10%] h-[18%] w-[26%] rounded-full bg-white/40 blur-md" />
      <div className="relative flex items-start gap-3">
        {/* mentor avatar */}
        <div className="shrink-0">
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-violet-300 via-pink-300 to-amber-300 shadow-lg ring-2 ring-white/70 animate-float">
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              ✨
            </div>
            <div className="pointer-events-none absolute left-[18%] top-[14%] h-[24%] w-[24%] rounded-full bg-white/70 blur-sm" />
          </div>
          <div className="mt-1 text-center text-[9px] font-bold text-white">
            あおい
          </div>
        </div>
        {/* speech bubble */}
        <div className="relative flex-1 rounded-2xl bg-white px-3 py-2 shadow-md">
          {/* tail */}
          <div className="absolute -left-1.5 top-3 h-3 w-3 rotate-45 bg-white" />
          <p className="text-[12px] leading-snug text-slate-800">{message}</p>
          <button
            onClick={onCta}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm active:scale-95"
          >
            {cta}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${color} p-2.5 shadow-sm ring-1`}
    >
      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-0.5">
        <span className="text-xl font-black text-slate-900">{value}</span>
        <span className="text-[10px] text-slate-600">{unit}</span>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white/80 p-4 shadow-md ring-1 ring-white/60 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {hint && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function QuestRow({ text, done = false }: { text: string; done?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${
        done ? "bg-emerald-50" : "bg-slate-50"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          done
            ? "bg-emerald-500 text-white"
            : "border-2 border-dashed border-slate-300 bg-white"
        }`}
      >
        {done && <Check className="h-3 w-3" />}
      </span>
      <span
        className={`flex-1 text-[12px] ${
          done ? "text-slate-500 line-through" : "text-slate-800"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

function QuickTile({
  icon,
  label,
  color,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-2xl bg-gradient-to-br ${color} p-2 text-white shadow-md ring-1 ring-white/40 transition active:scale-95`}
    >
      <span className="pointer-events-none absolute left-[10%] top-[10%] h-[24%] w-[26%] rounded-full bg-white/60 blur-sm" />
      <div className="relative flex h-full flex-col items-center justify-center gap-1">
        {icon}
        <span className="text-[10px] font-bold">{label}</span>
      </div>
      {badge && (
        <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-black text-white ring-2 ring-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function CareerCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 p-4 shadow-md ring-1 ring-white/60">
      <span className="pointer-events-none absolute left-[6%] top-[12%] h-[18%] w-[26%] rounded-full bg-white/50 blur-md" />
      <div className="relative flex items-start gap-3">
        <div className="rounded-2xl bg-white p-2 text-amber-700 shadow-sm">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex-1 text-[12px] leading-snug text-amber-950">
          <div className="font-bold">卒業後のあなた、見えてる?</div>
          <div className="mt-0.5">
            似たキャリアの OB <strong>12 名</strong> の事例が届いています。タップして相談 →
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- RECORD -------------------- */

function RecordSection() {
  return (
    <div className="space-y-4">
      <Section title="どう記録する?">
        <div className="grid grid-cols-3 gap-3">
          <RecordTile
            icon={<Mic className="h-7 w-7" />}
            title="音声"
            sub="話すだけ"
            color="from-rose-400 to-pink-500"
            recommended
          />
          <RecordTile
            icon={<Camera className="h-7 w-7" />}
            title="写真"
            sub="撮るだけ"
            color="from-amber-400 to-orange-500"
          />
          <RecordTile
            icon={<Type className="h-7 w-7" />}
            title="文字"
            sub="さっと書く"
            color="from-sky-400 to-blue-500"
          />
        </div>
      </Section>

      {/* Main capture canvas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 p-6 text-center text-white shadow-xl ring-2 ring-white/40">
        <span className="pointer-events-none absolute left-[8%] top-[10%] h-[18%] w-[26%] rounded-full bg-white/40 blur-md" />
        <div className="relative">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/60 backdrop-blur-sm">
            <Mic className="h-16 w-16" />
          </div>
          <div className="mt-3 text-lg font-black">タップで録音開始</div>
          <div className="mt-1 text-[12px] opacity-90">
            3 分話せば AI が:日報整形 / タグ付け
            <br />
            プロジェクト分類 / 月末に月報生成
          </div>
        </div>
      </div>

      <Section title="最近の記録">
        <ul className="space-y-2">
          <RecordItem
            time="昨日 17:24"
            label="空き家清掃ボランティア(B 邸)"
            tags={["空き家", "ボランティア"]}
          />
          <RecordItem
            time="2 日前 14:10"
            label="移住相談 Web 会議 / 名古屋ファミリー"
            tags={["移住相談"]}
          />
          <RecordItem
            time="3 日前 19:45"
            label="夕方の振り返り 5 分"
            tags={["振り返り"]}
            voice
          />
        </ul>
      </Section>
    </div>
  );
}

function RecordTile({
  icon,
  title,
  sub,
  color,
  recommended,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  color: string;
  recommended?: boolean;
}) {
  return (
    <button
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-3 text-white shadow-md ring-2 ring-white/40 transition active:scale-95`}
    >
      <span className="pointer-events-none absolute left-[10%] top-[10%] h-[22%] w-[26%] rounded-full bg-white/60 blur-sm" />
      <div className="relative flex flex-col items-center gap-1">
        {icon}
        <div className="text-sm font-black">{title}</div>
        <div className="text-[10px] opacity-90">{sub}</div>
      </div>
      {recommended && (
        <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[8px] font-black text-amber-900 ring-2 ring-white">
          推奨
        </span>
      )}
    </button>
  );
}

function RecordItem({
  time,
  label,
  tags,
  voice,
}: {
  time: string;
  label: string;
  tags: string[];
  voice?: boolean;
}) {
  return (
    <li className="rounded-2xl border border-slate-100 bg-white px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500">{time}</span>
        {voice && <Mic className="h-3 w-3 text-rose-500" />}
      </div>
      <div className="mt-0.5 text-[12px] font-semibold text-slate-800">
        {label}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-700"
          >
            #{t}
          </span>
        ))}
      </div>
    </li>
  );
}

/* -------------------- MENTOR (4 視点) -------------------- */

const demoAdvices = [
  {
    p: "municipality" as const,
    body: "活動拠点としての賃借料は対象になり得る(JOIN Q&A)。ただし事前協議が原則、ミッションとの紐付けが必須。",
    cites: ["JOIN お役立ちツール Q&A"],
    eyesOff: false,
  },
  {
    p: "community" as const,
    body: "『閉じた空間』に見えると地域から距離を置かれる懸念。週 1 で地域開放日を設けると自治会の信頼を得やすい(海士町事例)。",
    cites: ["海士町 古民家コワーキング 2024"],
    eyesOff: false,
  },
  {
    p: "member" as const,
    body: "1 年目=試作 / 2 年目=巻き込み / 3 年目=運営移譲、の 3 段階で組み立てると任期内で成果物として残せる。",
    cites: [],
    eyesOff: false,
  },
  {
    p: "small_start" as const,
    body: "月 2 回・3 時間だけ短期賃借 → SNS 募集 → 来場者数と写真を記録。1 週間でできるよ。",
    cites: [],
    eyesOff: false,
  },
];

function MentorSection() {
  return (
    <div className="space-y-4">
      <MentorHero
        message="やりたいこと・迷ってることがあれば聞いてね。役場・地域・あなた、3 つの目線で材料を出すよ。判定はしないから、決めるのは人間だよ。"
        cta="質問例を見る"
        onCta={() => {}}
      />

      {/* Input bar */}
      <div className="rounded-3xl bg-white/80 p-3 shadow-md ring-1 ring-white/60 backdrop-blur">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-3 ring-1 ring-emerald-100">
          <div className="text-[11px] font-bold text-emerald-800">
            あなたの質問
          </div>
          <div className="mt-1 text-[13px] text-slate-800">
            古民家を借りて隊員仲間とコワーキングスペースを試作したい。活動費で家賃の一部を出せる?
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <button className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-xs font-bold text-white shadow-sm active:scale-95">
            <Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" />
            助言を見る
          </button>
          <button className="rounded-full bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <Mic className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 4 視点回答 */}
      <Section title="あおいの 4 視点(デモ)" hint="引用付き">
        <div className="space-y-2.5">
          {demoAdvices.map((a) => (
            <AdviceCard key={a.p} {...a} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function AdviceCard({
  p,
  body,
  cites,
  eyesOff,
}: {
  p: "municipality" | "community" | "member" | "small_start";
  body: string;
  cites: string[];
  eyesOff: boolean;
}) {
  const meta = {
    municipality: {
      label: "役場目線",
      icon: <Building2 className="h-4 w-4" />,
      bg: "from-violet-100 to-indigo-50",
      iconBg: "bg-violet-500",
      ring: "ring-violet-200",
    },
    community: {
      label: "地域目線",
      icon: <Users className="h-4 w-4" />,
      bg: "from-emerald-100 to-teal-50",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-200",
    },
    member: {
      label: "あなた目線",
      icon: <UserCircle2 className="h-4 w-4" />,
      bg: "from-sky-100 to-cyan-50",
      iconBg: "bg-sky-500",
      ring: "ring-sky-200",
    },
    small_start: {
      label: "スモールスタート",
      icon: <Sparkles className="h-4 w-4" />,
      bg: "from-amber-100 to-yellow-50",
      iconBg: "bg-amber-500",
      ring: "ring-amber-200",
    },
  }[p];
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${meta.bg} p-3 ring-1 ${meta.ring}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full ${meta.iconBg} text-white`}
        >
          {meta.icon}
        </span>
        <span className="text-[12px] font-bold text-slate-900">
          {meta.label}
        </span>
        {eyesOff && (
          <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
            <EyeOff className="h-2.5 w-2.5" />
            役場非表示
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[12px] leading-snug text-slate-800">{body}</p>
      {cites.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {cites.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-semibold text-slate-700 ring-1 ring-white/80"
            >
              <Quote className="h-2.5 w-2.5" />
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- HISTORY -------------------- */

function HistorySection() {
  return (
    <div className="space-y-4">
      <Section title="メンター履歴" hint="42 件">
        <ul className="space-y-2">
          <HistoryItem
            title="観光協会との連携、どこから始めればいい?"
            sub="まずは月例会議の傍聴から。事例:養父市 山本さん…"
            date="3 日前"
            tag="C-1"
          />
          <HistoryItem
            title="卒業後に法人化したい。何から動くと?"
            sub="兵庫県内 OB 12 名のキャリア事例から…"
            date="1 週間前"
            tag="C-4"
          />
          <HistoryItem
            title="副業で農産物を売っていい?"
            sub="事前申請 + 月 20h 以内 + 主活動への支障なし…"
            date="2 週間前"
            tag="B-1"
          />
        </ul>
      </Section>

      <Section title="アーカイブされた記録" hint="今月 18 件">
        <ul className="space-y-2">
          <RecordItem
            time="06-05"
            label="移住検討者 家族 視察対応"
            tags={["移住相談"]}
          />
          <RecordItem
            time="06-03"
            label="空き家清掃 + 写真撮影"
            tags={["空き家"]}
          />
          <RecordItem
            time="06-01"
            label="月初の活動計画 振り返り"
            tags={["振り返り"]}
            voice
          />
        </ul>
      </Section>
    </div>
  );
}

function HistoryItem({
  title,
  sub,
  date,
  tag,
}: {
  title: string;
  sub: string;
  date: string;
  tag: string;
}) {
  return (
    <li className="rounded-2xl border border-slate-100 bg-white px-3 py-2 active:bg-slate-50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
              {tag}
            </span>
            <span className="text-[12px] font-semibold text-slate-900">
              {title}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[10px] text-slate-500">
            {sub}
          </div>
        </div>
        <span className="shrink-0 text-[9px] text-slate-400">{date}</span>
      </div>
    </li>
  );
}

/* -------------------- Bottom Nav -------------------- */

function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md">
      <div className="mx-3 mb-3 rounded-3xl border border-white/60 bg-white/85 shadow-2xl backdrop-blur-md ring-1 ring-slate-100">
        <div className="flex items-center justify-around px-2 py-2">
          <NavBtn
            icon={<Home className="h-5 w-5" />}
            label="ホーム"
            active={active === "home"}
            onClick={() => onChange("home")}
          />
          <NavBtn
            icon={<Mic className="h-5 w-5" />}
            label="記録"
            active={active === "record"}
            onClick={() => onChange("record")}
          />
          {/* center FAB */}
          <button
            onClick={() => onChange("mentor")}
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-500 text-white shadow-xl ring-4 ring-white active:scale-95"
            aria-label="相談"
          >
            <Bot className="h-6 w-6" />
          </button>
          <NavBtn
            icon={<History className="h-5 w-5" />}
            label="履歴"
            active={active === "history"}
            onClick={() => onChange("history")}
          />
          <NavBtn
            icon={<Plus className="h-5 w-5" />}
            label="その他"
            active={false}
            onClick={() => onChange("home")}
          />
        </div>
      </div>
    </nav>
  );
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-14 flex-col items-center gap-0.5 rounded-xl px-1 py-1 transition ${
        active ? "text-emerald-600" : "text-slate-500"
      }`}
    >
      <span
        className={`${
          active ? "scale-110" : ""
        } transition-transform`}
      >
        {icon}
      </span>
      <span className="text-[9px] font-bold">{label}</span>
      {active && (
        <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-500" />
      )}
    </button>
  );
}
