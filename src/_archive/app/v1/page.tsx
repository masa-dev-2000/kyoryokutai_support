import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { Smartphone, LayoutDashboard, ChevronLeft, FlaskConical, BookOpen } from "lucide-react";

export default function V1HubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={10} />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 self-start text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          トップへ戻る
        </Link>

        <header className="mt-6 text-center">
          <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            v1
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            既存の機能フル実装版
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            日報・月次・事例・チャット・お知らせ等を多くのページに分割した版
          </p>
        </header>

        <div className="mt-12 flex flex-1 flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-12">
            <BubbleButton
              href="/v1/me"
              label="隊員アプリ"
              sublabel="スマホ前提"
              icon={<Smartphone className="h-5 w-5" />}
              color="emerald"
              size="lg"
              float="normal"
              delay={0}
            />
            <BubbleButton
              href="/v1/admin"
              label="役場画面"
              sublabel="PC 前提"
              icon={<LayoutDashboard className="h-5 w-5" />}
              color="sky"
              size="lg"
              float="slow"
              delay={300}
            />
          </div>
          <div className="flex items-center gap-6">
            <BubbleButton
              href="/v1/tutorial"
              label="つかい方"
              sublabel="チュートリアル"
              icon={<BookOpen className="h-5 w-5" />}
              color="violet"
              size="md"
              float="fast"
              delay={500}
            />
            <BubbleButton
              href="/lab"
              label="ラボ"
              sublabel="実験中の UI"
              icon={<FlaskConical className="h-5 w-5" />}
              color="amber"
              size="md"
              float="slow"
              delay={700}
            />
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-500">
          このバージョンは比較用に保存中
        </footer>
      </div>
    </main>
  );
}
