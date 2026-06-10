import Link from "next/link";
import { ChevronLeft, UserCircle2, Building2, ArrowRight, Sparkles } from "lucide-react";

export default function V5HubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-200 via-violet-100 to-rose-100">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-rose-300/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 self-start rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          トップ
        </Link>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700 shadow-sm ring-1 ring-violet-200">
            <Sparkles className="h-3 w-3" />
            v5 / Game-style UI
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
            さあ、はじめよう。
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            AI の先輩が、いつもそばに。
            <br />
            1 画面で全部できる、新しい体験。
          </p>
        </div>

        {/* Character preview */}
        <div className="relative mt-8 flex flex-col items-center">
          <div className="relative">
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-violet-300 via-pink-300 to-amber-300 shadow-2xl ring-4 ring-white/60" />
            {/* face */}
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              ✨
            </div>
            {/* highlight */}
            <div className="pointer-events-none absolute left-[15%] top-[12%] h-[28%] w-[28%] rounded-full bg-white/70 blur-md" />
          </div>
          <div className="mt-3 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-800 shadow-md ring-1 ring-white/60">
            AI メンター &quot;あおい&quot;
          </div>
        </div>

        {/* mode buttons */}
        <div className="mt-10 grid gap-3">
          <ModeCard
            href="/v5/member"
            badge="協力隊"
            title="プレイヤーとして"
            sub="クエスト・記録・相談を 1 画面で"
            icon={<UserCircle2 className="h-7 w-7" />}
            gradient="from-emerald-400 via-teal-400 to-sky-500"
          />
          <ModeCard
            href="/v5/manager"
            badge="役場"
            title="マスターとして"
            sub="承認 1 タップ・KPI 即時確認"
            icon={<Building2 className="h-7 w-7" />}
            gradient="from-violet-400 via-purple-400 to-indigo-500"
          />
        </div>

        <footer className="mt-auto pt-8 text-center text-[11px] text-slate-600">
          v4 のコンセプトを <strong>1 画面 UI</strong> で再構成したラボです
        </footer>
      </div>
    </main>
  );
}

function ModeCard({
  href,
  badge,
  title,
  sub,
  icon,
  gradient,
}: {
  href: string;
  badge: string;
  title: string;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <Link
      href={href as never}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-5 text-white shadow-xl ring-2 ring-white/40 transition active:scale-[0.98]`}
    >
      <span className="pointer-events-none absolute left-[8%] top-[10%] h-[20%] w-[24%] rounded-full bg-white/50 blur-md" />
      <div className="relative flex items-center gap-4">
        <div className="rounded-2xl bg-white/25 p-3 backdrop-blur-sm ring-1 ring-white/40">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
            {badge}
          </div>
          <div className="text-lg font-black">{title}</div>
          <div className="mt-0.5 text-[11px] opacity-90">{sub}</div>
        </div>
        <ArrowRight className="h-6 w-6 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
