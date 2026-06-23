import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { mockCases } from "@/lib/mock/data";
import { ChevronLeft, Sparkles, MapPin, Search } from "lucide-react";

export default function CasesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={8} />

      <div className="relative mx-auto max-w-md px-5 py-6">
        <Link
          href="/v2/me/learn"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          学ぶに戻る
        </Link>

        <header className="mt-4">
          <h1 className="text-xl font-bold text-slate-900">全国の事例</h1>
          <p className="mt-1 text-xs text-slate-600">
            完了 + 公開された協力隊プロジェクト
          </p>
        </header>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="キーワード・地域で検索"
            className="h-11 w-full rounded-full border-none bg-white/80 pl-10 pr-4 text-sm shadow-md ring-1 ring-violet-200 backdrop-blur focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div className="mt-4 rounded-3xl bg-violet-100/70 p-3 text-[11px] text-violet-900 ring-1 ring-violet-200 backdrop-blur flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
          <p>
            あなたの活動タグ(空き家・移住・販路)から AI がおすすめを上位表示
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {mockCases.map((c) => (
            <div
              key={c.id}
              className="relative rounded-3xl bg-white/80 p-4 shadow-md ring-1 ring-slate-200 backdrop-blur"
            >
              <span className="pointer-events-none absolute left-[8%] top-[10%] h-[10%] w-[20%] rounded-full bg-white/60 blur-sm" />
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3" />
                {c.region} · {c.authorAnon}
              </div>
              <h3 className="mt-1 font-bold text-slate-900">{c.title}</h3>
              <p className="mt-1 text-xs text-slate-600">{c.summary}</p>
              <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] text-emerald-900">
                ✨ {c.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
