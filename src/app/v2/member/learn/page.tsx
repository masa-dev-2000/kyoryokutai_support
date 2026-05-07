import Link from "next/link";
import type { Route } from "next";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { v2LearnItems } from "@/lib/mock/data";
import { ChevronLeft, Sparkles } from "lucide-react";

export default function LearnHubPage() {
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
          <h1 className="text-xl font-bold text-slate-900">学ぶ・相談する</h1>
          <p className="mt-1 text-xs text-slate-600">
            事例で学び、AI で壁打ちする
          </p>
        </header>

        <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-6">
          {/* 事例検索 - 大きめ */}
          <BubbleButton
            href="/v2/member/learn/cases"
            label="全国の事例"
            sublabel="10 件以上の成功例"
            icon={<span className="text-2xl">🔍</span>}
            color="violet"
            size="xl"
            float="normal"
            delay={0}
          />

          {/* AIモード4つ */}
          <div className="grid grid-cols-2 gap-4 place-items-center">
            {v2LearnItems
              .filter((i) => i.type === "ai-mode")
              .map((m, i) => (
                <BubbleButton
                  key={m.id}
                  href={`/v2/member/learn/ai/${m.id.replace("ai-", "")}` as Route}
                  label={m.title}
                  sublabel={m.description}
                  icon={<span className="text-xl">{m.emoji}</span>}
                  color={m.color}
                  size="md"
                  float={
                    i % 3 === 0 ? "slow" : i % 3 === 1 ? "normal" : "fast"
                  }
                  delay={i * 200}
                />
              ))}
          </div>
        </div>

        <footer className="mt-auto pt-6 text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 ring-1 ring-amber-200">
            <Sparkles className="h-3 w-3" />
            AI が事例も参照して相談に乗ります
          </div>
        </footer>
      </div>
    </main>
  );
}
