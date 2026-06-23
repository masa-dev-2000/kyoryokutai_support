import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { mockAnnouncements, mockCases, formatJstDate } from "@/lib/mock/data";
import { ChevronLeft, Plus, Megaphone, BookOpen, Sparkles } from "lucide-react";

export default function SharePage() {
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
            <h1 className="text-2xl font-bold text-slate-900">情報共有</h1>
            <p className="text-xs text-slate-600">お知らせ配信と全国事例参照</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md ring-2 ring-white/40">
            <Plus className="h-3.5 w-3.5" />
            新規お知らせ配信
          </button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* お知らせ */}
          <section>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Megaphone className="h-3.5 w-3.5" />
              配信履歴
            </h2>
            <div className="space-y-3">
              {mockAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className="relative rounded-3xl bg-white/80 p-4 shadow-md ring-1 ring-slate-200 backdrop-blur"
                >
                  <span className="pointer-events-none absolute left-[8%] top-[10%] h-[12%] w-[20%] rounded-full bg-white/60 blur-sm" />
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">
                        {a.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatJstDate(a.createdAt)}
                      </div>
                    </div>
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                      既読 4/5
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                    {a.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 全国事例 */}
          <section>
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <BookOpen className="h-3.5 w-3.5" />
              全国事例(おすすめ)
            </h2>

            <div className="rounded-3xl bg-gradient-to-br from-violet-100/80 to-indigo-100/80 p-4 ring-1 ring-violet-200 backdrop-blur mb-3">
              <div className="flex items-start gap-2 text-xs text-violet-900">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  当自治体の活動傾向(空き家・移住・販路)から AI が選定
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mockCases.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="relative rounded-3xl bg-white/80 p-4 shadow-md ring-1 ring-slate-200 backdrop-blur"
                >
                  <span className="pointer-events-none absolute left-[8%] top-[10%] h-[12%] w-[20%] rounded-full bg-white/60 blur-sm" />
                  <div className="text-[11px] text-slate-500">
                    {c.region} · {c.authorAnon} · {c.period}
                  </div>
                  <h3 className="mt-1 font-bold text-slate-900">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {c.summary}
                  </p>
                  <div className="mt-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] text-emerald-900">
                    ✨ {c.outcome}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
