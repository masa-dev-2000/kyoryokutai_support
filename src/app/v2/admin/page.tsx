import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { ChevronLeft, BarChart3, Megaphone, ClipboardCheck } from "lucide-react";

export default function V2AdminHubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={12} />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
        <Link
          href="/v2"
          className="inline-flex items-center gap-1 self-start text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          戻る
        </Link>

        <header className="mt-6 text-center">
          <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 ring-1 ring-violet-300">
            役場 / v2
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            丹波篠山市 総務課
          </h1>
          <p className="mt-2 text-xs text-slate-600">
            山田課長 さん / 担当隊員 5 名
          </p>
        </header>

        <div className="mt-16 flex flex-1 items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
            <BubbleButton
              href="/v2/admin/status"
              label="状況確認"
              sublabel="隊員・KPI・議会報告"
              icon={<BarChart3 className="h-7 w-7" />}
              color="emerald"
              size="xl"
              float="slow"
              delay={0}
            />
            <BubbleButton
              href="/v2/admin/share"
              label="情報共有"
              sublabel="お知らせ・全国事例"
              icon={<Megaphone className="h-7 w-7" />}
              color="sky"
              size="xl"
              float="normal"
              delay={300}
            />
            <BubbleButton
              href="/v2/admin/approve"
              label="申請承認"
              sublabel="月次・経費"
              icon={<ClipboardCheck className="h-7 w-7" />}
              color="amber"
              size="xl"
              float="fast"
              delay={600}
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
