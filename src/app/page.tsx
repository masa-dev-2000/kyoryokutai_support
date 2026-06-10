import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { Sparkles, FlaskConical, Building2, Bot } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={16} />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 py-12">
        <header className="text-center max-w-xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
            <Sparkles className="h-3 w-3" />
            β
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            地域おこし協力隊
            <br />
            サポートシステム
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
            計画 / 動き / 学び ── ユーザーは 3 つだけ。
            <br />
            AI が日報・月報・事例・進捗・成果まで全部組み立てる
            <br className="hidden sm:block" />
            協力隊特化の SaaS です。
          </p>
        </header>

        <div className="mt-12 flex flex-1 items-center justify-center">
          <div className="grid grid-cols-2 gap-8 sm:flex sm:flex-row sm:flex-wrap sm:justify-center sm:gap-12">
            <BubbleButton
              href="/v1"
              label="v1"
              sublabel="既存の機能フル実装版"
              color="slate"
              size="lg"
              float="slow"
              delay={0}
            />
            <BubbleButton
              href="/v2"
              label="v2"
              sublabel="3 機能ベースの再設計版"
              icon={<Sparkles className="h-6 w-6" />}
              color="emerald"
              size="lg"
              float="normal"
              delay={300}
            />
            <BubbleButton
              href="/v3"
              label="v3"
              sublabel="役場主眼・ガードレール版"
              icon={<Building2 className="h-6 w-6" />}
              color="violet"
              size="lg"
              float="fast"
              delay={600}
            />
            <BubbleButton
              href="/v4"
              label="v4"
              sublabel="AI = 第三の当事者"
              icon={<Bot className="h-6 w-6" />}
              color="sky"
              size="lg"
              float="normal"
              delay={900}
            />
          </div>
        </div>

        <footer className="mt-12 flex flex-col items-center gap-3 text-center text-xs text-slate-500">
          <Link
            href="/v2/tutorial"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 font-semibold text-emerald-700 shadow-md ring-1 ring-emerald-200 transition hover:bg-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            🫧 はじめての方は チュートリアル(2 分)
          </Link>
          <Link
            href="/lab"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            🧪 ラボ — 実験中の UI を見る
          </Link>
          <p className="mt-2">
            タップすると弾けて画面が切り替わります。
          </p>
        </footer>
      </div>
    </main>
  );
}
