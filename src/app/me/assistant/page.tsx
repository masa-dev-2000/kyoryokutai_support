import Link from "next/link";
import type { Route } from "next";
import { assistantModes } from "@/lib/mock/data";
import { Sparkles, ChevronLeft, ArrowRight } from "lucide-react";

export default function AssistantHubPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/me" className="-ml-1 text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">AI に相談</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
          <div className="flex items-center gap-2 text-violet-900">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">
              あなた専用の 24/7 サポーター
            </span>
          </div>
          <p className="mt-1 text-xs text-violet-700">
            単に肯定するのではなく、戦略的に評価・サポートします。
          </p>
        </div>

        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          何をサポートしますか?
        </h2>

        <div className="space-y-3">
          {assistantModes.map((m) => (
            <Link
              key={m.id}
              href={`/me/assistant/${m.id}` as Route}
              className="block"
            >
              <div
                className={`overflow-hidden rounded-2xl bg-gradient-to-br ${m.accentClass} p-0.5 shadow-md`}
              >
                <div className="flex items-center gap-3 rounded-[calc(1rem-2px)] bg-white px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                    {m.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900">
                      {m.label}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      {m.description}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
          💡 <strong>ヒント:</strong> 答えが返ってくる前に、過去の事例(事例集)を参照するので、似た悩みの解決事例をまじえて提案してくれます。
        </div>
      </div>
    </div>
  );
}
