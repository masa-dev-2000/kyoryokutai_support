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
  Quote,
  EyeOff,
  Building2,
  Users,
  UserCircle2,
  Sparkles,
  ChevronRight,
  Clock,
  Briefcase,
  Plane,
  Megaphone,
  PartyPopper,
  Receipt,
  PenLine,
  X,
  Home as HomeIcon,
  FolderKanban,
  History as HistoryIcon,
  CircleDot,
} from "lucide-react";

type Tab = "home" | "record" | "more";

type Project = {
  id: string;
  title: string;
  status: "active" | "planning";
  progress: number;
  categoryId: string;
  thisWeek: string;
  nextStep?: string;
};

const projects: Project[] = [
  {
    id: "p1",
    title: "空き家バンク立ち上げ",
    status: "active",
    progress: 64,
    categoryId: "akiya",
    thisWeek: "B 邸内覧、家族 4 人で現地調整",
    nextStep: "条件交渉 → 契約",
  },
  {
    id: "p2",
    title: "移住相談ネットワーク",
    status: "active",
    progress: 35,
    categoryId: "ijuu",
    thisWeek: "名古屋ファミリー相談 / 6 月例会の準備",
  },
  {
    id: "p3",
    title: "古民家コワーキング試作",
    status: "planning",
    progress: 10,
    categoryId: "akiya",
    thisWeek: "提案書ドラフト中(役場相談中)",
  },
];

export function MemberApp() {
  const [tab, setTab] = React.useState<Tab>("home");
  const [recordPreset, setRecordPreset] = React.useState<string | null>(null);

  function jumpToRecord(presetCategoryId?: string) {
    setRecordPreset(presetCategoryId ?? null);
    setTab("record");
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 pb-28">
      <div className="pointer-events-none fixed -top-32 -left-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-md px-4 pt-4">
        <TopBar />
        <div className="mt-4">
          {tab === "home" && <HomeTab onJumpToRecord={jumpToRecord} />}
          {tab === "record" && (
            <RecordTab
              presetId={recordPreset}
              onConsumePreset={() => setRecordPreset(null)}
            />
          )}
          {tab === "more" && <MoreTab />}
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

/* -------------------- HOME(プロジェクト主役・引き算) -------------------- */

function HomeTab({
  onJumpToRecord,
}: {
  onJumpToRecord: (categoryId?: string) => void;
}) {
  const active = projects.filter((p) => p.status === "active");
  const planning = projects.filter((p) => p.status === "planning");

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="px-1 flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-slate-900">今、動いてる</h1>
        <span className="text-[10px] text-slate-500">{active.length} 件 進行中</span>
      </div>

      {/* Active projects (主役) */}
      <div className="space-y-3">
        {active.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onRecord={() => onJumpToRecord(p.categoryId)}
          />
        ))}
      </div>

      {/* Planning(小さく) */}
      {planning.length > 0 && (
        <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-slate-100 backdrop-blur">
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <CircleDot className="h-3 w-3" />
            計画中
          </div>
          {planning.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between text-[12px]"
            >
              <span className="font-semibold text-slate-700">{p.title}</span>
              <span className="text-[10px] text-slate-500">{p.thisWeek}</span>
            </div>
          ))}
        </div>
      )}

      {/* 最近の動き(補助・コンパクト) */}
      <SimpleCard title="最近の動き">
        <ul className="space-y-1.5">
          <RecentLine date="昨日" label="空き家清掃ボランティア(B 邸)" />
          <RecentLine date="2 日前" label="移住相談 / 名古屋ファミリー" />
          <RecentLine date="3 日前" label="夕方の振り返り 5 分" />
        </ul>
      </SimpleCard>
    </div>
  );
}

function ProjectCard({
  project,
  onRecord,
}: {
  project: Project;
  onRecord: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-slate-900">{project.title}</h3>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
            進行中
          </span>
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="w-10 text-right text-[11px] font-bold text-slate-700">
            {project.progress}%
          </span>
        </div>

        {/* This week */}
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
          <div className="text-[10px] font-bold text-slate-500">今週</div>
          <div className="mt-0.5 text-[12px] text-slate-800">{project.thisWeek}</div>
          {project.nextStep && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
              <ChevronRight className="h-3 w-3" />
              次:{project.nextStep}
            </div>
          )}
        </div>
      </div>

      {/* Quick record */}
      <button
        onClick={onRecord}
        className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 py-2.5 text-[11px] font-bold text-emerald-700 transition active:bg-emerald-50"
      >
        <PenLine className="h-3.5 w-3.5" />
        このプロジェクトに記録する
      </button>
    </div>
  );
}

function RecentLine({ date, label }: { date: string; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[12px]">
      <span className="w-12 shrink-0 font-mono text-[10px] text-slate-500">
        {date}
      </span>
      <span className="truncate text-slate-700">{label}</span>
    </li>
  );
}

/* -------------------- RECORD(フォーム主体・最小手間) -------------------- */

type Category = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const categories: Category[] = [
  { id: "akiya",     label: "空き家",   icon: <HomeIcon className="h-5 w-5" />,      color: "from-amber-400 to-orange-500" },
  { id: "ijuu",      label: "移住相談", icon: <Users className="h-5 w-5" />,         color: "from-emerald-400 to-teal-500" },
  { id: "event",     label: "イベント", icon: <PartyPopper className="h-5 w-5" />,   color: "from-rose-400 to-pink-500" },
  { id: "meeting",   label: "会議",     icon: <Briefcase className="h-5 w-5" />,     color: "from-violet-400 to-indigo-500" },
  { id: "trip",      label: "出張",     icon: <Plane className="h-5 w-5" />,         color: "from-sky-400 to-blue-500" },
  { id: "pr",        label: "広報",     icon: <Megaphone className="h-5 w-5" />,     color: "from-fuchsia-400 to-purple-500" },
  { id: "expense",   label: "経費",     icon: <Receipt className="h-5 w-5" />,       color: "from-lime-400 to-emerald-500" },
  { id: "reflect",   label: "振り返り", icon: <PenLine className="h-5 w-5" />,       color: "from-slate-400 to-slate-600" },
];

function RecordTab({
  presetId,
  onConsumePreset,
}: {
  presetId: string | null;
  onConsumePreset: () => void;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(presetId);
  const [memo, setMemo] = React.useState("");
  const [photoAttached, setPhotoAttached] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (presetId) {
      setSelectedId(presetId);
      onConsumePreset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId]);

  const selected = categories.find((c) => c.id === selectedId);
  const canSave = !!selectedId;

  function reset() {
    setSelectedId(null);
    setMemo("");
    setPhotoAttached(false);
  }

  function save() {
    if (!canSave) return;
    setSavedAt(new Date());
    setTimeout(() => {
      reset();
      setSavedAt(null);
    }, 1600);
  }

  if (savedAt) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl">
          <Check className="h-12 w-12" />
        </div>
        <div className="mt-4 text-lg font-bold text-slate-900">
          記録しました
        </div>
        <div className="mt-1 text-xs text-slate-500">
          AI がタグ付けと月報への反映を行います
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">記録する</h1>
        <p className="mt-0.5 text-xs text-slate-600">
          種類をタップ → メモは <strong>任意</strong> → 保存。それだけ。
        </p>
      </div>

      {/* 1. 種類選択(必須・1 タップ) */}
      <SimpleCard title="① 何をしましたか?" sub={selected ? "選択済み" : "1 つ選ぶ"}>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((c) => (
            <CategoryTile
              key={c.id}
              category={c}
              active={selectedId === c.id}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>
      </SimpleCard>

      {/* 2. メモ(任意) */}
      <SimpleCard title="② ひと言メモ" sub="任意 / 空欄でも OK">
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="例:A 邸を内覧、移住希望者と一緒に"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </SimpleCard>

      {/* 3. オプション(写真・時刻) */}
      <SimpleCard title="③ オプション" sub="任意">
        <div className="grid grid-cols-2 gap-2">
          <OptionTile
            icon={<Camera className="h-4 w-4" />}
            label={photoAttached ? "写真 1 枚" : "写真を追加"}
            active={photoAttached}
            onClick={() => setPhotoAttached((v) => !v)}
            color="amber"
          />
          <OptionTile
            icon={<Clock className="h-4 w-4" />}
            label="今(変更可)"
            active={false}
            onClick={() => {}}
            color="slate"
          />
        </div>
      </SimpleCard>

      {/* Save */}
      <button
        onClick={save}
        disabled={!canSave}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-lg transition ${
          canSave
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 active:scale-[0.98]"
            : "cursor-not-allowed bg-slate-300"
        }`}
      >
        <Check className="h-4 w-4" />
        {canSave ? `${selected?.label}を記録する` : "種類を選んでください"}
      </button>

      {/* Voice fallback (secondary) */}
      <button className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white py-2.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 active:scale-95">
        <Mic className="h-3.5 w-3.5" />
        声で書き取る(代わりに使う)
      </button>
    </div>
  );
}

function CategoryTile({
  category,
  active,
  onClick,
}: {
  category: Category;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition active:scale-95 ${
        active
          ? `bg-gradient-to-br ${category.color} text-white shadow-md ring-2 ring-white/40`
          : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
      }`}
    >
      {active && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white">
          <Check className="h-3 w-3" />
        </span>
      )}
      {category.icon}
      {category.label}
    </button>
  );
}

function OptionTile({
  icon,
  label,
  active,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color: "amber" | "slate";
}) {
  const colorClass = active
    ? color === "amber"
      ? "bg-amber-100 text-amber-800 ring-amber-200"
      : "bg-slate-100 text-slate-800 ring-slate-200"
    : "bg-slate-50 text-slate-600 ring-slate-200";
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-semibold ring-1 active:scale-95 ${colorClass}`}
    >
      {icon}
      {label}
      {active && <X className="h-3 w-3 opacity-60" />}
    </button>
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

/* -------------------- MORE(プロジェクト / 相談 / 履歴) -------------------- */

type MoreSubTab = "projects" | "mentor" | "history";

function MoreTab() {
  const [sub, setSub] = React.useState<MoreSubTab>("projects");
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">もっと見る</h1>
      </div>

      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        <SubBtn
          icon={<FolderKanban className="h-3.5 w-3.5" />}
          label="プロジェクト"
          active={sub === "projects"}
          onClick={() => setSub("projects")}
        />
        <SubBtn
          icon={<Bot className="h-3.5 w-3.5" />}
          label="相談"
          active={sub === "mentor"}
          onClick={() => setSub("mentor")}
        />
        <SubBtn
          icon={<HistoryIcon className="h-3.5 w-3.5" />}
          label="履歴"
          active={sub === "history"}
          onClick={() => setSub("history")}
        />
      </div>

      {sub === "projects" && <ProjectsList />}
      {sub === "mentor" && <MentorSubTab />}
      {sub === "history" && <HistorySubTab />}
    </div>
  );
}

function SubBtn({
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
      className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProjectsList() {
  return (
    <SimpleCard title="プロジェクト一覧" sub={`${projects.length} 件`}>
      <div className="space-y-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                p.status === "active" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-slate-900">
                {p.title}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${
                      p.status === "active"
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                        : "bg-gradient-to-r from-amber-400 to-orange-500"
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-600">
                  {p.progress}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}

function MentorSubTab() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="text-[10px] font-bold text-emerald-700">あなたの質問</div>
        <textarea
          rows={3}
          defaultValue={demoQuestion}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
        <button className="mt-2 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-white shadow-sm active:scale-95">
          <Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" />
          助言を見る
        </button>
      </div>
      <SimpleCard title="あおいの 4 視点" sub="引用付き">
        <div className="space-y-2">
          {demoAdvices.map((a) => (
            <AdviceRow key={a.perspective} {...a} />
          ))}
        </div>
      </SimpleCard>
    </div>
  );
}

function HistorySubTab() {
  return (
    <SimpleCard title="活動履歴" sub="今月 18 件">
      <ul className="space-y-1.5">
        <RecentLine date="06-05" label="移住検討者 家族 視察対応" />
        <RecentLine date="06-03" label="空き家清掃 + 写真撮影" />
        <RecentLine date="06-01" label="月初の振り返り 音声" />
        <RecentLine date="05-28" label="観光協会 月例会" />
        <RecentLine date="05-25" label="地域イベント 出展準備" />
      </ul>
    </SimpleCard>
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
            className={`-mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-white shadow-xl ring-4 ring-white transition active:scale-95 ${
              active === "record" ? "scale-110" : ""
            }`}
            aria-label="記録"
          >
            <PenLine className="h-7 w-7" />
          </button>
          <NavBtn
            icon={<FolderKanban className="h-5 w-5" />}
            label="もっと"
            active={active === "more"}
            onClick={() => onChange("more")}
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
