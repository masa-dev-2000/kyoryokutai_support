import Link from "next/link";
import { notFound } from "next/navigation";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleChat } from "@/components/bubble/bubble-chat";
import { assistantModes } from "@/lib/mock/data";
import { ChevronLeft, Mic, Send } from "lucide-react";

export function generateStaticParams() {
  return assistantModes.map((m) => ({ mode: m.id }));
}

type Props = { params: Promise<{ mode: string }> };

const sample: Record<string, { from: "ai" | "user"; body: string }[]> = {
  strategy: [
    {
      from: "ai",
      body: "事業計画を教えてください。戦略視点で評価します(地域貢献・独自性・実現可能性・持続性)。",
    },
    { from: "user", body: "移住促進のイベントを年 2 回開きたい" },
    {
      from: "ai",
      body: "率直に言うと、年 2 回のイベント単発だと移住促進の寄与は限定的です。\n\n気になる点:\n・参加者の記憶に残りにくい\n・他自治体で類似企画が多い\n・費用対効果の測定が困難\n\n改善提案:\n・継続した「移住者の受け皿作り」の一部に位置づける\n・過去参加者のフォロー体制\n・地元事業者を巻き込む\n\n類似事例 2 件をご紹介します。",
    },
  ],
  proposal: [
    {
      from: "ai",
      body: "役場に提案したい内容を教えてください。却下されそうな論点と別アプローチを整理します。",
    },
  ],
  career: [
    { from: "ai", body: "任期終了までの期間と今考えている選択肢を教えてください。" },
  ],
  worry: [
    { from: "ai", body: "今感じている課題を一緒に整理しましょう。何が頭を占めていますか?" },
  ],
};

export default async function AiModePage({ params }: Props) {
  const { mode } = await params;
  const def = assistantModes.find((m) => m.id === mode);
  if (!def) notFound();

  const conv = sample[mode] || [];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={8} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 py-4">
        <div className="flex items-center gap-2 px-2">
          <Link
            href="/v2/me/learn"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            戻る
          </Link>
        </div>

        <header className="mt-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{def.icon}</span>
            <h1 className="text-base font-bold">{def.label}</h1>
          </div>
          <p className="text-[11px] text-slate-600">{def.description}</p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {conv.map((m, i) => (
            <BubbleChat key={i} speaker={m.from} body={m.body} />
          ))}
          <div className="rounded-2xl bg-amber-50/80 p-2 text-center text-[11px] text-amber-900 ring-1 ring-amber-200 backdrop-blur">
            ※ ベータ版のためサンプル応答を表示しています
          </div>
        </div>

        <div className="rounded-[28px] bg-white/80 p-2 shadow-lg ring-2 ring-violet-100 backdrop-blur">
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-slate-400">
            質問や相談を入力
          </div>
          <div className="flex items-center justify-between gap-2 px-1 pb-1">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Mic className="h-4 w-4" />
            </button>
            <button className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 px-5 text-sm font-bold text-white shadow-lg shadow-violet-300/40 ring-2 ring-white/40">
              送信
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
