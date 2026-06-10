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
  CheckCircle2,
  AlertTriangle,
  Quote,
  Receipt,
  ChevronRight,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Tab = "home" | "approve" | "more";

export function ManagerApp() {
  const [tab, setTab] = React.useState<Tab>("home");

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 pb-28">
      <div className="pointer-events-none fixed -top-32 -right-20 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -left-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-md px-4 pt-4">
        <TopBar />
        <div className="mt-4">
          {tab === "home" && <HomeTab onJumpTo={setTab} />}
          {tab === "approve" && <ApproveTab />}
          {tab === "more" && <MoreTab />}
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
        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur"
      >
        <ChevronLeft className="h-3 w-3" />
        モード
      </Link>
      <div className="text-center text-[11px] leading-tight">
        <div className="font-bold text-slate-900">谷本 室長</div>
        <div className="text-[9px] text-slate-500">新温泉町 / 企画課</div>
      </div>
      <button className="relative rounded-full bg-white/80 p-2 shadow-sm backdrop-blur">
        <Bell className="h-4 w-4 text-slate-600" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>
    </div>
  );
}

/* -------------------- HOME(超シンプル) -------------------- */

const pending = [
  {
    id: "p1",
    type: "活動相談",
    typeIcon: <Sparkles className="h-3 w-3" />,
    member: "田中 あかり",
    title: "古民家コワーキング試作の活動費利用",
    ai: "JOIN Q&A 引用あり / 海士町に類似事例 / スモールスタート案あり",
    verdict: "approve" as const,
    citations: 2,
  },
  {
    id: "p2",
    type: "月次報告",
    typeIcon: <FileText className="h-3 w-3" />,
    member: "佐藤 美咲",
    title: "2026 年 5 月 月次報告(AI 生成)",
    ai: "活動 23 件から自動生成 / 住民広報文併記",
    verdict: "approve" as const,
    citations: 0,
  },
  {
    id: "p3",
    type: "経費",
    typeIcon: <Receipt className="h-3 w-3" />,
    member: "山本 健一",
    title: "島根県視察 ¥38,400",
    ai: "ガードレール検知:県外出張は事前承認が必要",
    verdict: "review" as const,
    citations: 1,
  },
];

function HomeTab({ onJumpTo }: { onJumpTo: (t: Tab) => void }) {
  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">
          今週は <span className="text-violet-700">3 件</span> です。
        </h1>
        <p className="mt-0.5 text-xs text-slate-600">
          AI が判定材料を整えました。承認するだけで OK。
        </p>
      </div>

      {/* This week summary (1 line) */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-600 p-4 text-white shadow-md ring-2 ring-white/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
              今週の所要(目安)
            </div>
            <div className="mt-0.5 text-3xl font-black">約 8 分</div>
          </div>
          <div className="text-right text-[10px] opacity-90">
            v3 比 -33%
            <br />
            導入前比 -94%
          </div>
        </div>
      </div>

      {/* Approval queue (主役) */}
      <SimpleCard title="承認待ち" sub={`${pending.length} 件`}>
        <div className="space-y-2">
          {pending.map((p) => (
            <ApprovalRow key={p.id} {...p} compact />
          ))}
        </div>
        <button
          onClick={() => onJumpTo("approve")}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-slate-100 py-2 text-[11px] font-bold text-slate-700 active:bg-slate-200"
        >
          すべて表示してまとめて承認
          <ChevronRight className="h-3 w-3" />
        </button>
      </SimpleCard>
    </div>
  );
}

/* -------------------- APPROVE(全件) -------------------- */

function ApproveTab() {
  return (
    <div className="space-y-5">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">承認</h1>
        <p className="mt-0.5 text-xs text-slate-600">
          承認待ち <strong>{pending.length} 件</strong>。AI 判定材料付き。
        </p>
      </div>
      <div className="space-y-3">
        {pending.map((p) => (
          <ApprovalRow key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}

function ApprovalRow({
  type,
  typeIcon,
  member,
  title,
  ai,
  verdict,
  citations,
  compact = false,
}: {
  type: string;
  typeIcon: React.ReactNode;
  member: string;
  title: string;
  ai: string;
  verdict: "approve" | "review";
  citations: number;
  compact?: boolean;
}) {
  const isApprove = verdict === "approve";
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-100">
          {typeIcon}
          {type}
        </span>
        <span className="text-[10px] text-slate-500">{member}</span>
      </div>
      <div className="mt-1.5 text-[13px] font-bold text-slate-900">{title}</div>
      {!compact && (
        <div className="mt-2 rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-100">
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
      )}
      {compact && (
        <div className="mt-1 truncate text-[11px] text-slate-500">{ai}</div>
      )}
      <div className="mt-2 flex gap-2">
        <button className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 active:scale-95">
          詳細
        </button>
        <button
          className={`flex-1 rounded-full py-1.5 text-[11px] font-bold text-white shadow-sm active:scale-95 ${
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

/* -------------------- MORE(サブタブで切替) -------------------- */

type SubTab = "members" | "reports" | "kpi";

function MoreTab() {
  const [sub, setSub] = React.useState<SubTab>("members");
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">もっと見る</h1>
      </div>

      {/* sub tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        <SubBtn
          icon={<Users className="h-3.5 w-3.5" />}
          label="隊員"
          active={sub === "members"}
          onClick={() => setSub("members")}
        />
        <SubBtn
          icon={<FileText className="h-3.5 w-3.5" />}
          label="レポート"
          active={sub === "reports"}
          onClick={() => setSub("reports")}
        />
        <SubBtn
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          label="KPI"
          active={sub === "kpi"}
          onClick={() => setSub("kpi")}
        />
      </div>

      {sub === "members" && <MembersList />}
      {sub === "reports" && <ReportsList />}
      {sub === "kpi" && <KpiList />}
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

const memberRoster: {
  name: string;
  role: string;
  status: "good" | "active" | "warn";
  color: string;
  progress: number;
  initials: string;
  badge: string;
}[] = [
  { name: "田中 あかり", role: "移住促進・空き家", status: "active", color: "from-emerald-300 to-teal-500", progress: 78, initials: "あか", badge: "活動相談中" },
  { name: "山本 健一", role: "農業支援", status: "warn", color: "from-amber-300 to-orange-500", progress: 42, initials: "健", badge: "経費要確認" },
  { name: "佐藤 美咲", role: "観光・インバウンド", status: "good", color: "from-sky-300 to-blue-500", progress: 88, initials: "美", badge: "月報提出済" },
  { name: "鈴木 悠人", role: "教育・子育て", status: "warn", color: "from-rose-300 to-pink-500", progress: 35, initials: "悠", badge: "副業時間超過" },
  { name: "高橋 大輔", role: "DX 推進", status: "active", color: "from-violet-300 to-indigo-500", progress: 60, initials: "大", badge: "順調" },
];

function MembersList() {
  return (
    <SimpleCard title="担当隊員" sub="5 名">
      <div className="space-y-2">
        {memberRoster.map((m) => {
          const badgeColor = {
            good: "bg-emerald-100 text-emerald-700",
            active: "bg-sky-100 text-sky-700",
            warn: "bg-amber-100 text-amber-700",
          }[m.status];
          return (
            <div
              key={m.name}
              className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-xs font-bold text-white ring-2 ring-white`}
              >
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-slate-900">
                    {m.name}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${badgeColor}`}
                  >
                    {m.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">{m.role}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress
                    value={m.progress}
                    className="h-1 flex-1 bg-slate-200"
                  />
                  <span className="text-[9px] text-slate-500">
                    {m.progress}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SimpleCard>
  );
}

function ReportsList() {
  const reports = [
    { title: "6 月議会 報告書", sub: "AI 下書き済 / 5 名分統合", date: "昨日", urgent: false },
    { title: "県 月次報告(5 月分)", sub: "確定待ち / 5 月 31 日締切", date: "3 日前", urgent: true },
    { title: "関係人口レポート", sub: "自動更新中", date: "今日", urgent: false },
    { title: "総務省 年次活動報告", sub: "10 月作成予定", date: "—", urgent: false },
  ];
  return (
    <SimpleCard title="自動レポート" sub={`${reports.length} 種類`}>
      <div className="space-y-2">
        {reports.map((r) => (
          <div
            key={r.title}
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5"
          >
            <FileText className="h-5 w-5 shrink-0 text-slate-500" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-slate-900">
                  {r.title}
                </span>
                {r.urgent && (
                  <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                    急ぎ
                  </span>
                )}
              </div>
              <div className="truncate text-[10px] text-slate-500">{r.sub}</div>
            </div>
            <span className="shrink-0 text-[9px] text-slate-400">{r.date}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}

function KpiList() {
  const items = [
    { label: "介入時間(月)", value: "1.2 h", sub: "導入前 7.5h → -84%", icon: <Clock className="h-4 w-4 text-emerald-600" /> },
    { label: "AI 自動処理率", value: "82 %", sub: "申請・記録の自動整形", icon: <Bot className="h-4 w-4 text-sky-600" /> },
    { label: "プロジェクト数", value: "11 件", sub: "前月比 +3 件", icon: <TrendingUp className="h-4 w-4 text-violet-600" /> },
    { label: "関係人口", value: "284 人", sub: "イベント+移住相談", icon: <Users className="h-4 w-4 text-amber-600" /> },
  ];
  return (
    <SimpleCard title="KPI ダッシュボード" sub="今月">
      <div className="grid grid-cols-2 gap-2">
        {items.map((k) => (
          <div
            key={k.label}
            className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100"
          >
            <div className="flex items-center gap-1">
              {k.icon}
              <span className="text-[10px] font-bold text-slate-700">
                {k.label}
              </span>
            </div>
            <div className="mt-1 text-xl font-black text-slate-900">
              {k.value}
            </div>
            <div className="text-[9px] text-slate-500">{k.sub}</div>
          </div>
        ))}
      </div>
    </SimpleCard>
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
          {/* center FAB - 承認 */}
          <button
            onClick={() => onChange("approve")}
            className={`-mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-white shadow-xl ring-4 ring-white transition active:scale-95 ${
              active === "approve" ? "scale-110" : ""
            }`}
            aria-label="承認"
          >
            <CheckSquare className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white">
              3
            </span>
          </button>
          <NavBtn
            icon={<BarChart3 className="h-5 w-5" />}
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
        active ? "text-violet-600" : "text-slate-500"
      }`}
    >
      <span className={`${active ? "scale-110" : ""} transition-transform`}>
        {icon}
      </span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
