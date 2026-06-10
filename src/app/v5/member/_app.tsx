"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  Mic,
  Bot,
  ChevronLeft,
  Bell,
  Check,
  Camera,
  Type,
  Quote,
  EyeOff,
  Building2,
  Users,
  UserCircle2,
  Sparkles,
  ChevronRight,
  Plus,
} from "lucide-react";

type Tab = "home" | "record" | "mentor";

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("home");

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 pb-28">
      <div className="pointer-events-none fixed -top-32 -left-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-md px-4 pt-4">
        <TopBar />
        <div className="mt-4">
          {tab === "home" && <HomeTab onJumpTo={setTab} />}
          {tab === "record" && <RecordTab />}
          {tab === "mentor" && <MentorTab />}
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </main>
  );
}

/* -------------------- Top Bar (minimal) -------------------- */

function TopBar() {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/v5"
        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur"
      >
        <ChevronLeft className="h-3 w-3" />
        モード
      </Link>
      <div className="text-center text-[11px] leading-tight">
        <div className="font-bold text-slate-900">田中 あかり</div>
        <div className="text-[9px] text-slate-500">新温泉町 / 任期 2 年目</div>
      </div>
      <button className="relative rounded-full bg-white/80 p-2 shadow-sm backdrop-blur">
        <Bell className="h-4 w-4 text-slate-600" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>
    </div>
  );
}

/* -------------------- HOME(超シンプル) -------------------- */

function HomeTab({ onJumpTo }: { onJumpTo: (t: Tab) => void }) {
  return (
    <div className="space-y-5">
      {/* Greeting (1 line) */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">
          おはよう ☀️
        </h1>
        <p className="mt-0.5 text-xs text-slate-600">
          今日は <strong>古民家見学</strong> がありますね。
        </p>
      </div>

      {/* Today's checklist */}
      <SimpleCard title="今日やること" sub="3 / 5 完了">
        <ul className="divide-y divide-slate-100">
          <Task text="10:00 空き家見学(A 邸)" done time="10:00" />
          <Task text="13:30 地域おこし協議会" done time="13:30" />
          <Task text="活動記録を 1 件登録" done />
          <Task text="夕方の振り返り音声" />
          <Task text="メンターに 1 つ質問" />
        </ul>
      </SimpleCard>

      {/* Primary CTA = jump to record */}
      <button
        onClick={() => onJumpTo("record")}
        className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-4 text-left text-white shadow-lg ring-2 ring-white/40 active:scale-[0.98]"
      >
        <div className="rounded-xl bg-white/25 p-2 ring-1 ring-white/40">
          <Mic className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">話して記録する</div>
          <div className="text-[11px] opacity-90">3 分話せば日報も月報も完成</div>
        </div>
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Recent records (3 items) */}
      <SimpleCard title="最近の記録">
        <ul className="space-y-2">
          <RecentItem
            time="昨日 17:24"
            label="空き家清掃ボランティア(B 邸)"
            tags={["空き家"]}
          />
          <RecentItem
            time="2 日前 14:10"
            label="移住相談 Web 会議 / 名古屋ファミリー"
            tags={["移住相談"]}
          />
          <RecentItem
            time="3 日前 19:45"
            label="夕方の振り返り 5 分"
            tags={["振り返り"]}
            voice
          />
        </ul>
      </SimpleCard>
    </div>
  );
}

function Task({
  text,
  done = false,
  time,
}: {
  text: string;
  done?: boolean;
  time?: string;
}) {
  return (
    <li className="flex items-center gap-2.5 py-2">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          done ? "bg-emerald-500 text-white" : "border-2 border-slate-300 bg-white"
        }`}
      >
        {done && <Check className="h-3 w-3" />}
      </span>
      {time && (
        <span className="w-10 shrink-0 text-[10px] font-mono text-slate-500">
          {time}
        </span>
      )}
      <span
        className={`flex-1 text-[12px] ${
          done ? "text-slate-400 line-through" : "text-slate-800"
        }`}
      >
        {text}
      </span>
    </li>
  );
}

function RecentItem({
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
    <li className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500">{time}</span>
        {voice && <Mic className="h-3 w-3 text-rose-400" />}
      </div>
      <div className="mt-0.5 text-[12px] font-semibold text-slate-800">
        {label}
      </div>
      <div className="mt-1 flex gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-600"
          >
            #{t}
          </span>
        ))}
      </div>
    </li>
  );
}

/* -------------------- RECORD(主役だけ) -------------------- */

type RecordKind = "voice" | "photo" | "text";

function RecordTab() {
  const [kind, setKind] = React.useState<RecordKind>("voice");

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">記録する</h1>
        <p className="mt-0.5 text-xs text-slate-600">
          どれか 1 つで OK。あとは AI が組み立てます。
        </p>
      </div>

      {/* Segmented selector */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        <SegBtn
          active={kind === "voice"}
          onClick={() => setKind("voice")}
          icon={<Mic className="h-3.5 w-3.5" />}
          label="話す"
        />
        <SegBtn
          active={kind === "photo"}
          onClick={() => setKind("photo")}
          icon={<Camera className="h-3.5 w-3.5" />}
          label="写真"
        />
        <SegBtn
          active={kind === "text"}
          onClick={() => setKind("text")}
          icon={<Type className="h-3.5 w-3.5" />}
          label="文字"
        />
      </div>

      {/* Main canvas */}
      {kind === "voice" && (
        <RecordCanvas
          gradient="from-rose-400 via-pink-500 to-purple-500"
          icon={<Mic className="h-20 w-20" />}
          title="タップで録音"
          sub="3 分話せば日報・タグ付け・月報まで全自動"
          cta="録音を始める"
        />
      )}
      {kind === "photo" && (
        <RecordCanvas
          gradient="from-amber-400 via-orange-400 to-rose-400"
          icon={<Camera className="h-20 w-20" />}
          title="シャッターを切る"
          sub="レシート → 経費申請 / 活動写真 → 自動タグ"
          cta="カメラを開く"
        />
      )}
      {kind === "text" && (
        <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-100">
          <textarea
            rows={5}
            placeholder="今日あったことを 1-2 行で..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <button className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95">
            記録する
          </button>
        </div>
      )}
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function RecordCanvas({
  gradient,
  icon,
  title,
  sub,
  cta,
}: {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  cta: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 text-center text-white shadow-2xl ring-2 ring-white/40`}
    >
      <span className="pointer-events-none absolute left-[8%] top-[10%] h-[18%] w-[26%] rounded-full bg-white/40 blur-md" />
      <div className="relative">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/60 backdrop-blur-sm">
          {icon}
        </div>
        <div className="mt-5 text-lg font-black">{title}</div>
        <div className="mt-1 text-[11px] opacity-90">{sub}</div>
        <button className="mt-5 w-full rounded-full bg-white py-3 text-sm font-bold text-slate-900 shadow-lg active:scale-95">
          {cta}
        </button>
      </div>
    </div>
  );
}

/* -------------------- MENTOR(質問 + 直近の助言) -------------------- */

type Advice = {
  perspective: "municipality" | "community" | "member" | "small_start";
  body: string;
  cites: string[];
  eyesOff: boolean;
};

const demoQuestion =
  "古民家を借りて隊員仲間とコワーキングスペースを試作したい。活動費で家賃の一部を出せる?";

const demoAdvices: Advice[] = [
  {
    perspective: "municipality",
    body: "活動拠点としての賃借料は対象になり得る(JOIN Q&A)。事前協議が原則、ミッションとの紐付けが必須。",
    cites: ["JOIN Q&A"],
    eyesOff: false,
  },
  {
    perspective: "community",
    body: "「閉じた空間」に見えると地域から距離を置かれる懸念。週 1 で地域開放日を設けると自治会の信頼を得やすい。",
    cites: ["海士町 古民家コワーキング 2024"],
    eyesOff: false,
  },
  {
    perspective: "member",
    body: "1 年目=試作 / 2 年目=巻き込み / 3 年目=運営移譲、の段階で組み立てると任期内で成果物として残せる。",
    cites: [],
    eyesOff: false,
  },
  {
    perspective: "small_start",
    body: "月 2 回・3 時間だけ短期賃借 → SNS 募集 → 来場者数と写真を記録。1 週間でできる。",
    cites: [],
    eyesOff: false,
  },
];

function MentorTab() {
  const [showAdvice, setShowAdvice] = React.useState(true);
  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">
          AI メンターに聞く
        </h1>
        <p className="mt-0.5 text-xs text-slate-600">
          役場・地域・あなた、3 つの目線で材料を出します。
          <br />
          判定はしません — 決めるのはあなたと役場。
        </p>
      </div>

      {/* Input box */}
      <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100">
        <div className="text-[10px] font-bold text-emerald-700">あなたの質問</div>
        <textarea
          rows={3}
          defaultValue={demoQuestion}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <div className="mt-2 flex gap-2">
          <button className="rounded-full bg-white p-2.5 ring-1 ring-slate-200 active:scale-95">
            <Mic className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={() => setShowAdvice(true)}
            className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95"
          >
            <Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" />
            助言を見る
          </button>
        </div>
      </div>

      {/* Advice (collapsed by default after first view) */}
      {showAdvice && (
        <SimpleCard title="あおいの 4 視点" sub="引用付き">
          <div className="space-y-2">
            {demoAdvices.map((a) => (
              <AdviceRow key={a.perspective} {...a} />
            ))}
          </div>
        </SimpleCard>
      )}

      {/* Recent chats (3 items) */}
      <SimpleCard title="最近のやりとり">
        <ul className="space-y-2">
          <ChatItem
            title="観光協会との連携、どこから?"
            sub="まずは月例会議の傍聴から…"
            date="3 日前"
          />
          <ChatItem
            title="卒業後に法人化したい"
            sub="OB 12 名のキャリア事例から…"
            date="1 週間前"
          />
          <ChatItem
            title="副業で農産物を売っていい?"
            sub="事前申請 + 月 20h 以内…"
            date="2 週間前"
          />
        </ul>
      </SimpleCard>
    </div>
  );
}

function AdviceRow({ perspective, body, cites, eyesOff }: Advice) {
  const meta = {
    municipality: {
      label: "役場目線",
      icon: <Building2 className="h-3.5 w-3.5" />,
      color: "bg-violet-500",
      bg: "bg-violet-50 ring-violet-100",
    },
    community: {
      label: "地域目線",
      icon: <Users className="h-3.5 w-3.5" />,
      color: "bg-emerald-500",
      bg: "bg-emerald-50 ring-emerald-100",
    },
    member: {
      label: "あなた目線",
      icon: <UserCircle2 className="h-3.5 w-3.5" />,
      color: "bg-sky-500",
      bg: "bg-sky-50 ring-sky-100",
    },
    small_start: {
      label: "スモールスタート",
      icon: <Sparkles className="h-3.5 w-3.5" />,
      color: "bg-amber-500",
      bg: "bg-amber-50 ring-amber-100",
    },
  }[perspective];
  return (
    <div className={`rounded-xl p-2.5 ring-1 ${meta.bg}`}>
      <div className="flex items-center gap-1.5">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ${meta.color} text-white`}
        >
          {meta.icon}
        </span>
        <span className="text-[11px] font-bold text-slate-900">{meta.label}</span>
        {eyesOff && (
          <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
            <EyeOff className="h-2.5 w-2.5" />
            役場非表示
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] leading-snug text-slate-700">{body}</p>
      {cites.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {cites.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 ring-1 ring-white"
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

function ChatItem({
  title,
  sub,
  date,
}: {
  title: string;
  sub: string;
  date: string;
}) {
  return (
    <li className="flex items-start justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 truncate text-[10px] text-slate-500">{sub}</div>
      </div>
      <span className="shrink-0 text-[9px] text-slate-400">{date}</span>
    </li>
  );
}

/* -------------------- Common -------------------- */

function SimpleCard({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

/* -------------------- Bottom Nav(3 個厳選) -------------------- */

function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md">
      <div className="mx-3 mb-3 rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-around px-4 py-2.5">
          <NavBtn
            icon={<Home className="h-5 w-5" />}
            label="ホーム"
            active={active === "home"}
            onClick={() => onChange("home")}
          />
          {/* center FAB */}
          <button
            onClick={() => onChange("record")}
            className={`-mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 text-white shadow-xl ring-4 ring-white transition active:scale-95 ${
              active === "record" ? "scale-110" : ""
            }`}
            aria-label="記録"
          >
            <Mic className="h-7 w-7" />
          </button>
          <NavBtn
            icon={<Bot className="h-5 w-5" />}
            label="相談"
            active={active === "mentor"}
            onClick={() => onChange("mentor")}
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
      className={`flex w-16 flex-col items-center gap-0.5 py-1 transition ${
        active ? "text-emerald-600" : "text-slate-500"
      }`}
    >
      <span className={`${active ? "scale-110" : ""} transition-transform`}>
        {icon}
      </span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
