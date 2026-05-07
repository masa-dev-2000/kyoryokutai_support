import Link from "next/link";
import type { Route } from "next";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { v2Projects } from "@/lib/mock/data";
import { ChevronLeft, Plus, Sparkles } from "lucide-react";

export default function ProjectsPage() {
  const active = v2Projects.filter((p) => p.status !== "completed");
  const completed = v2Projects.filter((p) => p.status === "completed");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={10} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
        <Link
          href="/v2/member"
          className="inline-flex items-center gap-1 self-start text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          戻る
        </Link>

        <header className="mt-4">
          <h1 className="text-xl font-bold text-slate-900">プロジェクト</h1>
          <p className="mt-1 text-xs text-slate-600">
            進行中 {active.length} 件・完了 {completed.length} 件
          </p>
        </header>

        {/* Active projects as bubbles */}
        <section className="mt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            進行中
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            {active.map((p, i) => (
              <BubbleButton
                key={p.id}
                href={`/v2/member/projects/${p.id}` as Route}
                label={p.name}
                sublabel={`${p.progress}% / ${p.highlight}`}
                icon={<span className="text-2xl">{p.emoji}</span>}
                color={p.color}
                size={p.progress > 50 ? "lg" : "md"}
                float={i % 3 === 0 ? "slow" : i % 3 === 1 ? "normal" : "fast"}
                delay={i * 250}
              />
            ))}

            {/* New project bubble */}
            <BubbleButton
              href="/v2/member/projects/new"
              label="新しい計画"
              sublabel="AI と一緒に"
              icon={<Plus className="h-6 w-6" />}
              color="slate"
              size="md"
              float="fast"
              delay={active.length * 250}
            />
          </div>
        </section>

        {/* Completed (= 事例) */}
        {completed.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              完了 / 公開中(事例)
            </h2>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
              {completed.map((p, i) => (
                <BubbleButton
                  key={p.id}
                  href={`/v2/member/projects/${p.id}` as Route}
                  label={p.name}
                  sublabel={p.highlight}
                  icon={<span className="text-2xl">{p.emoji}</span>}
                  color={p.color}
                  size="md"
                  float="slow"
                  delay={i * 200}
                />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-auto pt-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] text-violet-700 ring-1 ring-violet-200">
            <Sparkles className="h-3 w-3" />
            完了 + 公開で「事例」になります
          </div>
        </footer>
      </div>
    </main>
  );
}
