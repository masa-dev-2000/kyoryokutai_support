import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { ChevronLeft, Smartphone, Building2 } from "lucide-react";

export default function TutorialHubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={14} />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 self-start text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          トップへ戻る
        </Link>

        <header className="mt-6 text-center max-w-xl mx-auto">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-300">
            🫧 チュートリアル
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            どちらの立場で見ますか?
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            それぞれ約 2 分の解説です。
          </p>
        </header>

        <div className="mt-16 flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-12 sm:flex-row sm:gap-20">
            <BubbleButton
              href="/v2/tutorial/member"
              label="協力隊員 として"
              sublabel="3 つの行動"
              icon={<Smartphone className="h-7 w-7" />}
              color="emerald"
              size="xl"
              float="normal"
              delay={0}
            />
            <BubbleButton
              href="/v2/tutorial/admin"
              label="役場 として"
              sublabel="3 つの責任"
              icon={<Building2 className="h-7 w-7" />}
              color="violet"
              size="xl"
              float="slow"
              delay={400}
            />
          </div>
        </div>

        <footer className="mt-8 text-center text-[11px] text-slate-500">
          シャボン玉をタップ
        </footer>
      </div>
    </main>
  );
}
