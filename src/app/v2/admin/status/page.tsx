import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { mockMembers, statusBadge } from "@/lib/mock/data";
import { ChevronLeft, TrendingUp, FileCheck, Users, Sparkles, Download } from "lucide-react";

export default function StatusPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={8} />

      <div className="relative mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/v2/admin"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          役場ホームへ
        </Link>

        <header className="mt-4 flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">状況確認</h1>
            <p className="text-xs text-slate-600">隊員・KPI・議会報告まで</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md ring-2 ring-white/40">
            <Download className="h-3.5 w-3.5" />
            議会報告 PDF を生成
          </button>
        </header>

        {/* KPI bubbles */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <KpiBubble
            color="from-emerald-300 to-teal-500"
            label="担当隊員"
            value="5"
            unit="名"
            icon={<Users className="h-5 w-5" />}
          />
          <KpiBubble
            color="from-sky-300 to-blue-500"
            label="今月日報率"
            value="82"
            unit="%"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiBubble
            color="from-amber-300 to-orange-500"
            label="月次提出"
            value="3"
            unit="/ 5"
            icon={<FileCheck className="h-5 w-5" />}
          />
        </div>

        {/* Members */}
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            担当隊員
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockMembers.map((m) => {
              const b = statusBadge(m.currentMonthStatus);
              return (
                <div
                  key={m.id}
                  className="relative rounded-3xl bg-white/80 p-4 shadow-md ring-1 ring-slate-200 backdrop-blur transition hover:shadow-lg"
                >
                  <span className="pointer-events-none absolute left-[8%] top-[10%] h-[12%] w-[20%] rounded-full bg-white/60 blur-sm" />
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ring-2 ring-white ${m.avatarColor}`}
                    >
                      {m.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">
                        {m.fullName}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {m.role}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="text-slate-600">
                      日報 {m.thisMonthLogCount} 件
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${b.className}`}
                    >
                      {b.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-10 rounded-3xl bg-gradient-to-r from-violet-100/80 to-indigo-100/80 p-5 ring-1 ring-violet-200 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-white p-2 text-violet-700 shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-violet-900">
              <strong>AI からの状況報告</strong>:
              当月、空き家バンク関連が前月比 +40%。未提出 2 名(山本・鈴木)は日報頻度も低下傾向。**面談を推奨**します。
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function KpiBubble({
  color,
  label,
  value,
  unit,
  icon,
}: {
  color: string;
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-4 text-white shadow-lg ring-2 ring-white/40`}
    >
      <span className="pointer-events-none absolute left-[10%] top-[10%] h-[20%] w-[30%] rounded-full bg-white/60 blur-sm" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold opacity-90">{label}</span>
          <span className="opacity-80">{icon}</span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-sm opacity-90">{unit}</span>
        </div>
      </div>
    </div>
  );
}
