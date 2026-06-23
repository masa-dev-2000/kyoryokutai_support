import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { ChevronLeft, Target, Activity, GraduationCap, Bell } from "lucide-react";

export default function V2MemberHubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={12} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/v2"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            戻る
          </Link>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
              2
            </span>
          </button>
        </div>

        <header className="mt-4 text-center">
          <p className="text-xs text-slate-500">2026 / 4 / 30 (金) - 田中 あかり さん</p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">
            今日は何しようかな?
          </h1>
        </header>

        <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-8">
          {/* 配置: 三角形に */}
          <BubbleButton
            href="/v2/me/projects"
            label="プロジェクト"
            sublabel="進行中 3 件"
            icon={<Target className="h-7 w-7" />}
            color="violet"
            size="xl"
            float="slow"
            delay={0}
          />

          <div className="flex items-center gap-6">
            <BubbleButton
              href="/v2/me/activity"
              label="日々の動き"
              sublabel="記録 / 振り返り"
              icon={<Activity className="h-6 w-6" />}
              color="emerald"
              size="lg"
              float="normal"
              delay={300}
            />
            <BubbleButton
              href="/v2/me/learn"
              label="学ぶ・相談"
              sublabel="事例 / AI 壁打ち"
              icon={<GraduationCap className="h-6 w-6" />}
              color="amber"
              size="lg"
              float="fast"
              delay={600}
            />
          </div>
        </div>

        <footer className="mt-6 text-center text-[11px] text-slate-500">
          シャボン玉をタップ
        </footer>
      </div>
    </main>
  );
}
