import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { ChevronLeft, Smartphone, Building2 } from "lucide-react";

export default function V2HubPage() {
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
            v2
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            計画 / 動き / 学び
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            ユーザーは 3 つだけ。
            <br />
            あとは AI が組み立てる、新しい体験。
          </p>
        </header>

        <div className="mt-16 flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-12 sm:flex-row sm:gap-20">
            <BubbleButton
              href="/v2/member"
              label="隊員として使う"
              sublabel="スマホ"
              icon={<Smartphone className="h-6 w-6" />}
              color="emerald"
              size="xl"
              float="normal"
              delay={0}
            />
            <BubbleButton
              href="/v2/admin"
              label="役場として使う"
              sublabel="PC"
              icon={<Building2 className="h-6 w-6" />}
              color="violet"
              size="xl"
              float="slow"
              delay={400}
            />
          </div>
        </div>

        <footer className="mt-8 flex flex-col items-center gap-3 text-center text-xs text-slate-500">
          <Link
            href="/tutorial"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 font-semibold text-emerald-700 shadow-md ring-1 ring-emerald-200 transition hover:bg-white"
          >
            🫧 つかい方を見る(2 分)
          </Link>
          <p>タップで弾けて画面が切り替わります</p>
        </footer>
      </div>
    </main>
  );
}
