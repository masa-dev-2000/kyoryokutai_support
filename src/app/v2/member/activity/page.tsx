import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { ChevronLeft, Mic, MessageSquare, FileText, Receipt } from "lucide-react";

export default function ActivityHubPage() {
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
          <h1 className="text-xl font-bold text-slate-900">日々の動き</h1>
          <p className="mt-1 text-xs text-slate-600">
            行動を記録し、夜に振り返り、必要なら申請する
          </p>
        </header>

        {/* Big primary bubble: 行動を記録 */}
        <div className="mt-10 flex justify-center">
          <BubbleButton
            href="/v2/member/activity/record"
            label="行動を記録"
            sublabel="その場で・短く"
            icon={<Mic className="h-7 w-7" />}
            color="emerald"
            size="xl"
            float="normal"
            delay={0}
          />
        </div>

        {/* Secondary bubbles */}
        <div className="mt-12 grid grid-cols-2 gap-4 place-items-center">
          <BubbleButton
            href="/v2/member/activity/review"
            label="夜の振り返り"
            sublabel="AI と対話 5 分"
            icon={<MessageSquare className="h-5 w-5" />}
            color="amber"
            size="md"
            float="slow"
            delay={300}
          />
          <BubbleButton
            label="月次の確認"
            sublabel="自動生成済"
            icon={<FileText className="h-5 w-5" />}
            color="violet"
            size="md"
            float="fast"
            delay={500}
          />
          <BubbleButton
            label="経費申請"
            sublabel="レシート → AI"
            icon={<Receipt className="h-5 w-5" />}
            color="sky"
            size="md"
            float="normal"
            delay={700}
          />
          <BubbleButton
            label="その他申請"
            sublabel="休暇 / 出張"
            color="rose"
            size="md"
            float="slow"
            delay={900}
          />
        </div>

        <div className="mt-auto pt-8 text-center text-[11px] text-slate-500">
          記録は AI が裏でプロジェクトに紐付け
        </div>
      </div>
    </main>
  );
}
