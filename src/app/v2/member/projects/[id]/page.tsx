import Link from "next/link";
import { notFound } from "next/navigation";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { v2Projects } from "@/lib/mock/data";
import {
  ChevronLeft,
  Sparkles,
  Target,
  TrendingUp,
  Bookmark,
  Send,
  CheckCircle2,
} from "lucide-react";

export function generateStaticParams() {
  return v2Projects.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export default async function V2ProjectDetail({ params }: Props) {
  const { id } = await params;
  const p = v2Projects.find((x) => x.id === id);
  if (!p) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={8} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
        <Link
          href="/v2/member/projects"
          className="inline-flex items-center gap-1 self-start text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          プロジェクト一覧へ
        </Link>

        <header className="mt-4 text-center">
          <span className="text-5xl">{p.emoji}</span>
          <h1 className="mt-2 text-xl font-bold leading-tight text-slate-900">
            {p.name}
          </h1>
          <p className="mt-1 text-xs text-slate-600">{p.highlight}</p>
        </header>

        {/* Progress bubble */}
        <div className="mt-8 flex items-center justify-center">
          <div className="relative inline-flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 via-emerald-300 to-teal-400 shadow-2xl ring-2 ring-white/50 animate-float">
            <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
            <div className="relative text-center">
              <div className="text-4xl font-bold text-white">
                {p.progress}
                <span className="text-xl">%</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-white/90">
                progress
              </div>
            </div>
          </div>
        </div>

        {/* Action bubbles */}
        <div className="mt-10 grid grid-cols-2 gap-3 place-items-center">
          <BubbleButton
            label="計画を見る"
            sublabel="目標 / KPI"
            icon={<Target className="h-5 w-5" />}
            color="violet"
            size="sm"
            float="slow"
            delay={0}
          />
          <BubbleButton
            label="進捗詳細"
            sublabel="日報・行動"
            icon={<TrendingUp className="h-5 w-5" />}
            color="emerald"
            size="sm"
            float="normal"
            delay={200}
          />
          <BubbleButton
            label="関連事例"
            sublabel="参考にする"
            icon={<Bookmark className="h-5 w-5" />}
            color="amber"
            size="sm"
            float="fast"
            delay={400}
          />
          {p.status !== "completed" ? (
            <BubbleButton
              label="完了 + 公開"
              sublabel="事例にする"
              icon={<Send className="h-5 w-5" />}
              color="rose"
              size="sm"
              float="slow"
              delay={600}
            />
          ) : (
            <BubbleButton
              label="事例公開済"
              sublabel="ありがとう"
              icon={<CheckCircle2 className="h-5 w-5" />}
              color="rose"
              size="sm"
              float="slow"
              delay={600}
            />
          )}
        </div>

        <div className="mt-auto pt-6 text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] text-violet-700 ring-1 ring-violet-200">
            <Sparkles className="h-3 w-3" />
            日々の動きが自動でこのプロジェクトに紐付きます
          </div>
        </div>
      </div>
    </main>
  );
}
