"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Bell,
  Home,
  CheckSquare,
  FileText,
  Users,
  Bot,
  Sparkles,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Quote,
  ChevronRight,
  Receipt,
  Building2,
  Trophy,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Tab = "home" | "approve" | "reports" | "members";

export function ManagerApp() {
  const [tab, setTab] = React.useState<Tab>("home");

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-violet-100 via-indigo-50 to-sky-50 pb-24">
      <div className="pointer-events-none fixed -top-32 -right-20 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -left-20 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-md px-4 pt-4">
        <TopBar />
        <div className="mt-3">
          {tab === "home" && <HomeSection onJumpTo={setTab} />}
          {tab === "approve" && <ApproveSection />}
          {tab === "reports" && <ReportsSection />}
          {tab === "members" && <MembersSection />}
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
      <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-md ring-1 ring-white/60 backdrop-blur">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-[10px] font-bold text-white ring-2 ring-white">
          谷
        </div>
        <div className="text-[11px] leading-tight">
          <div className="font-bold text-slate-900">谷本 室長</div>
          <div className="text-[9px] text-slate-500">新温泉町 / 企画課</div>
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
      {/* AI hero */}
      <AiHero
        message="今週は活動相談 1 件・月次 1 件・経費 1 件。AI が判定材料を整えました。承認するだけで OK!"
        cta="承認画面へ"
        onCta={() => onJumpTo("approve")}
      />

      {/* Time saved */}
      <TimeSavedCard />

      {/* KPI grid */}
      <Section title="KPI ダッシュボード" hint="今月">
        <div className="grid grid-cols-2 gap-2">
          <KpiCard
            color="from-emerald-400 to-teal-500"
            icon={<Clock className="h-5 w-5" />}
            label="介入時間(月)"
            value="1.2"
            unit="h"
            sub="導入前 7.5h"
            ratio={84}
          />
          <KpiCard
            color="from-sky-400 to-blue-500"
            icon={<Bot className="h-5 w-5" />}
            label="AI 自動処理"
            value="82"
            unit="%"
            sub="申請・記録"
            ratio={82}
          />
          <KpiCard
            color="from-violet-400 to-indigo-500"
            icon={<TrendingUp className="h-5 w-5" />}
            label="プロジェクト"
            value="11"
            unit="件"
            sub="前月 +3"
            ratio={73}
          />
          <KpiCard
            color="from-amber-400 to-orange-500"
            icon={<Users className="h-5 w-5" />}
            label="関係人口"
            value="284"
            unit="人"
            sub="イベント+移住"
            ratio={68}
          />
        </div>
      </Section>

      {/* Quick actions */}
      <Section title="クイックアクション">
        <div className="grid grid-cols-4 gap-2">
          <QuickTile
            icon={<CheckSquare className="h-6 w-6" />}
            label="承認"
            color="from-emerald-400 to-teal-500"
            badge="3"
            onClick={() => onJumpTo("approve")}
          />
          <QuickTile
            icon={<FileText className="h-6 w-6" />}
            label="レポート"
            color="from-violet-400 to-indigo-500"
            onClick={() => onJumpTo("reports")}
          />
          <QuickTile
            icon={<Users className="h-6 w-6" />}
            label="隊員"
            color="from-sky-400 to-blue-500"
            onClick={() => onJumpTo("members")}
          />
          <QuickTile
            icon={<Trophy className="h-6 w-6" />}
            label="議会用"
            color="from-amber-400 to-orange-500"
            onClick={() => onJumpTo("reports")}
          />
        </div>
      </Section>
    </div>
  );
}

function AiHero({
  message,
  cta,
  onCta,
}: {
  message: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-400 via-indigo-500 to-blue-600 p-4 shadow-xl ring-2 ring-white/40">
      <span className="pointer-events-none absolute left-[6%] top-[10%] h-[18%] w-[26%] rounded-full bg-white/40 blur-md" />
      <div className="relative flex items-start gap-3">
        <div className="shrink-0">
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-violet-200 via-indigo-200 to-blue-300 shadow-lg ring-2 ring-white/70 animate-float">
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="pointer-events-none absolute left-[18%] top-[14%] h-[24%] w-[24%] rounded-full bg-white/70 blur-sm" />
          </div>
          <div className="mt-1 text-center text-[9px] font-bold text-white">
            アシスタント
          </div>
        </div>
        <div className="relative flex-1 rounded-2xl bg-white px-3 py-2 shadow-md">
          <div className="absolute -left-1.5 top-3 h-3 w-3 rotate-45 bg-white" />
          <p className="text-[12px] leading-snug text-slate-800">{message}</p>
          <button
            onClick={onCta}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm active:scale-95"
          >
            {cta}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeSavedCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-300 via-teal-400 to-sky-500 p-4 text-white shadow-xl ring-2 ring-white/40">
      <span className="pointer-events-none absolute left-[6%] top-[10%] h-[18%] w-[26%] rounded-full bg-white/40 blur-md" />
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">
            今週の所要時間
          </div>
          <div className="mt-1 text-4xl font-black">約 8 分</div>
          <div className="mt-1 text-[11px] opacity-90">
            v3 比 -33% / 導入前比 -94%
          </div>
        </div>
        <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm ring-1 ring-white/40">
          <Trophy className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  color,
  icon,
  label,
  value,
  unit,
  sub,
  ratio,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  sub: string;
  ratio: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-1.5">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white shadow-sm`}
        >
          {icon}
        </span>
        <span className="text-[10px] font-bold text-slate-700">{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-0.5">
        <span className="text-2xl font-black text-slate-900">{value}</span>
        <span className="text-[10px] text-slate-500">{unit}</span>
      </div>
      <div className="text-[9px] text-slate-500">{sub}</div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full bg-gradient-to-r ${color}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------- APPROVE -------------------- */

function ApproveSection() {
  return (
    <div className="space-y-4">
      <Section title="承認待ち" hint="3 件">
        <div className="space-y-3">
          <ApprovalCard
            type="活動相談"
            typeIcon={<Sparkles className="h-3 w-3" />}
            member="田中 あかり"
            title="古民家コワーキング試作の活動費利用"
            ai="JOIN Q&A 引用あり / 海士町に類似事例 / スモールスタート案: 月 2 回 3 時間"
            verdict="approve"
            citations={2}
          />
          <ApprovalCard
            type="月次報告"
            typeIcon={<FileText className="h-3 w-3" />}
            member="佐藤 美咲"
            title="2026 年 5 月 月次報告(AI 生成)"
            ai="活動 23 件から自動生成・住民広報文も併記"
            verdict="approve"
            citations={0}
          />
          <ApprovalCard
            type="経費"
            typeIcon={<Receipt className="h-3 w-3" />}
            member="山本 健一"
            title="島根県視察 ¥38,400"
            ai="ガードレール検知:県外出張は事前承認が必要。再発防止メッセージのドラフト用意済"
            verdict="review"
            citations={1}
          />
        </div>
      </Section>
    </div>
  );
}

function ApprovalCard({
  type,
  typeIcon,
  member,
  title,
  ai,
  verdict,
  citations,
}: {
  type: string;
  typeIcon: React.ReactNode;
  member: string;
  title: string;
  ai: string;
  verdict: "approve" | "review";
  citations: number;
}) {
  const isApprove = verdict === "approve";
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-4 shadow-md ring-1 ring-slate-100">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
          {typeIcon}
          {type}
        </span>
        <span className="text-[10px] text-slate-500">{member}</span>
      </div>
      <div className="mt-1.5 text-[13px] font-bold text-slate-900">{title}</div>
      <div className="mt-2 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-2.5 ring-1 ring-violet-100">
        <div className="flex items-start gap-1.5">
          <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
          <div className="flex-1 text-[11px] leading-snug text-slate-700">
            <div className="text-[10px] font-bold text-violet-800">
              AI の判定材料
            </div>
            <div className="mt-0.5">{ai}</div>
            {citations > 0 && (
              <div className="mt-1 inline-flex items-center gap-0.5 text-[9px] text-slate-500">
                <Quote className="h-2.5 w-2.5" />
                引用 {citations} 件
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="flex-1 rounded-full bg-white py-2 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 active:scale-95">
          詳細
        </button>
        <button
          className={`flex-1 rounded-full py-2 text-[11px] font-bold text-white shadow-sm active:scale-95 ${
            isApprove
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-amber-500 to-orange-500"
          }`}
        >
          {isApprove ? (
            <>
              <CheckCircle2 className="-mt-0.5 mr-1 inline h-3 w-3" />
              承認
            </>
          ) : (
            <>
              <AlertTriangle className="-mt-0.5 mr-1 inline h-3 w-3" />
              確認して承認
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* -------------------- REPORTS -------------------- */

function ReportsSection() {
  return (
    <div className="space-y-4">
      <Section title="自動レポート(下書き済)" hint="4 種類">
        <div className="space-y-2">
          <ReportRow
            title="6 月議会 報告書"
            sub="AI 下書き済 / 5 名分の活動を統合"
            updated="昨日"
            color="from-violet-400 to-indigo-500"
          />
          <ReportRow
            title="県 月次報告(5 月分)"
            sub="確定待ち / 5 月 31 日締切"
            updated="3 日前"
            color="from-sky-400 to-blue-500"
            urgent
          />
          <ReportRow
            title="関係人口レポート"
            sub="自動更新中 / イベント参加+移住相談"
            updated="今日"
            color="from-emerald-400 to-teal-500"
          />
          <ReportRow
            title="総務省 年次活動報告"
            sub="10 月作成予定"
            updated="—"
            color="from-amber-400 to-orange-500"
          />
        </div>
      </Section>

      <Section title="議会向け プレゼン素材" hint="ワンクリック">
        <button className="w-full rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 p-4 text-left text-white shadow-md ring-2 ring-white/40 active:scale-95">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <div className="text-sm font-black">議会説明 1 枚資料を生成</div>
          </div>
          <p className="mt-1 text-[11px] opacity-90">
            5 名分の活動 + KPI + 関係人口インパクトを PowerPoint 風 PDF に
          </p>
        </button>
      </Section>
    </div>
  );
}

function ReportRow({
  title,
  sub,
  updated,
  color,
  urgent,
}: {
  title: string;
  sub: string;
  updated: string;
  color: string;
  urgent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 active:bg-slate-50">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
      >
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-slate-900">{title}</span>
          {urgent && (
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
              急ぎ
            </span>
          )}
        </div>
        <div className="truncate text-[10px] text-slate-500">{sub}</div>
      </div>
      <div className="shrink-0 text-[9px] text-slate-400">{updated}</div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </div>
  );
}

/* -------------------- MEMBERS -------------------- */

const memberRoster: {
  name: string;
  role: string;
  status: "good" | "active" | "warn";
  color: string;
  progress: number;
  initials: string;
  badge: string;
}[] = [
  {
    name: "田中 あかり",
    role: "移住促進・空き家",
    status: "active",
    color: "from-emerald-300 to-teal-500",
    progress: 78,
    initials: "あか",
    badge: "活動相談中",
  },
  {
    name: "山本 健一",
    role: "農業支援",
    status: "warn",
    color: "from-amber-300 to-orange-500",
    progress: 42,
    initials: "健",
    badge: "経費要確認",
  },
  {
    name: "佐藤 美咲",
    role: "観光・インバウンド",
    status: "good",
    color: "from-sky-300 to-blue-500",
    progress: 88,
    initials: "美",
    badge: "月報提出済",
  },
  {
    name: "鈴木 悠人",
    role: "教育・子育て",
    status: "warn",
    color: "from-rose-300 to-pink-500",
    progress: 35,
    initials: "悠",
    badge: "副業時間超過",
  },
  {
    name: "高橋 大輔",
    role: "DX推進",
    status: "active",
    color: "from-violet-300 to-indigo-500",
    progress: 60,
    initials: "大",
    badge: "順調",
  },
];

function MembersSection() {
  return (
    <div className="space-y-4">
      <Section title="担当隊員" hint="5 名 / うち要対応 2 名">
        <div className="space-y-2">
          {memberRoster.map((m) => (
            <MemberRow key={m.name} {...m} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function MemberRow({
  name,
  role,
  status,
  color,
  progress,
  initials,
  badge,
}: {
  name: string;
  role: string;
  status: "good" | "active" | "warn";
  color: string;
  progress: number;
  initials: string;
  badge: string;
}) {
  const badgeColor = {
    good: "bg-emerald-100 text-emerald-700",
    active: "bg-sky-100 text-sky-700",
    warn: "bg-amber-100 text-amber-700",
  }[status];

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white shadow-sm ring-2 ring-white`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-slate-900">{name}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
        <div className="text-[10px] text-slate-500">{role}</div>
        <div className="mt-1 flex items-center gap-2">
          <Progress value={progress} className="h-1 flex-1 bg-slate-100" />
          <span className="text-[9px] text-slate-500">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Common Section/QuickTile -------------------- */

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
            icon={<FileText className="h-5 w-5" />}
            label="レポート"
            active={active === "reports"}
            onClick={() => onChange("reports")}
          />
          {/* center FAB */}
          <button
            onClick={() => onChange("approve")}
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-white shadow-xl ring-4 ring-white active:scale-95"
            aria-label="承認"
          >
            <CheckSquare className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white">
              3
            </span>
          </button>
          <NavBtn
            icon={<Users className="h-5 w-5" />}
            label="隊員"
            active={active === "members"}
            onClick={() => onChange("members")}
          />
          <NavBtn
            icon={<Building2 className="h-5 w-5" />}
            label="役場"
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
        active ? "text-violet-600" : "text-slate-500"
      }`}
    >
      <span className={`${active ? "scale-110" : ""} transition-transform`}>
        {icon}
      </span>
      <span className="text-[9px] font-bold">{label}</span>
      {active && (
        <span className="mt-0.5 h-1 w-1 rounded-full bg-violet-500" />
      )}
    </button>
  );
}
