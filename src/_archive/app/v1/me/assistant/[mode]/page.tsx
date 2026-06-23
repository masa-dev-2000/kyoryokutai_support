import Link from "next/link";
import { notFound } from "next/navigation";
import { assistantModes } from "@/lib/mock/data";
import { ChevronLeft, Sparkles, Mic, Send } from "lucide-react";

export function generateStaticParams() {
  return assistantModes.map((m) => ({ mode: m.id }));
}

type Props = { params: Promise<{ mode: string }> };

const sampleConversations: Record<string, Array<{ from: "ai" | "me"; text: string }>> = {
  strategy: [
    { from: "ai", text: "事業計画を教えてください。戦略視点で評価します(地域貢献・独自性・実現可能性・持続性)。" },
    { from: "me", text: "移住促進のイベントを年2回開きたい。" },
    { from: "ai", text: "率直に言うと「年2回のイベント」だけだと、移住促進への寄与は限定的です。\n\n▼ 批判的観点\n1. 単発イベントは参加者の記憶に残りにくい\n2. 似た企画は他自治体で既に行われている\n3. 費用対効果の測定が困難\n\n▼ 改善案\n- イベントを「継続した移住者の受け皿作り」の一部として位置づける\n- 過去参加者のフォロー体制を先に作る\n- 地元事業者を巻き込んで「住んだ後の仕事」の手触りを提供\n\n類似事例を 2 件ピックアップしました(事例集を参照)。" },
  ],
  proposal: [
    { from: "ai", text: "役場に提案したい内容を教えてください。却下されそうな論点と別アプローチを整理します。" },
    { from: "me", text: "地域猫活動を業務にしたい。" },
    { from: "ai", text: "「協力隊業務として直接」は却下される可能性が高いです(他地域でも前例あり)。\n\n▼ 想定される役場の懸念\n- 「公的業務」としての正当化が弱い\n- 税金の使い途として説明しにくい\n\n▼ 別アプローチの提案\n1. 既に地域猫活動をしている住民を「支援」する形に組み替える\n2. 観光・移住促進との接続(猫×カフェ×島)\n3. 小さく開始 → 実績を見せる戦略\n\n参考事例「地域猫活動を協力隊業務化した交渉の記録」(C-001)。詳細を表示しますか?" },
  ],
  career: [
    { from: "ai", text: "任期終了までの期間と、今考えている選択肢を教えてください。" },
    { from: "me", text: "あと 1 年半。残留希望だけど受け入れ先が明言してくれない。" },
    { from: "ai", text: "1 年半は長いようで短いタイムライン。\n\n▼ 今やるべきこと\n- 受入れ先に「正式な着地点」を 3 ヶ月以内に聞く(曖昧回答なら別路線準備)\n- 起業オプションの下地作り(事業計画・補助金リサーチ)\n- 自治体残留(役場採用)の可能性確認\n\n▼ 参考事例\n類似ケース「第3セクター勤務→1 年半で着地点確認」(C-005)\n\n次のステップ: 受入れ先面談の質問リスト、作りますか?" },
  ],
  worry: [
    { from: "ai", text: "今感じている課題を一緒に整理してみましょう。どんなことが頭を占めていますか?" },
    { from: "me", text: "活動の方向性に迷っている。広げすぎた気がする。" },
    { from: "ai", text: "「広げすぎた感」は多くの協力隊が 2 年目に感じる典型的な症状です。\n\n▼ 整理のための 3 つの問い\n1. 今の活動の中で、あなたにしかできないものは?\n2. 任期後も続けたいものは?\n3. 地元の人が本当に喜んでいるのはどれ?\n\nまず 1 つ目から、思いつくままに書き出してみませんか?" },
  ],
};

export default async function AssistantChatPage({ params }: Props) {
  const { mode } = await params;
  const modeDef = assistantModes.find((m) => m.id === mode);
  if (!modeDef) notFound();
  const convo = sampleConversations[mode] ?? [];

  return (
    <div className="flex h-full flex-col">
      <header className={`border-b border-slate-100 bg-gradient-to-r ${modeDef.accentClass} px-4 py-3 text-white`}>
        <div className="flex items-center gap-2">
          <Link href="/v1/me/assistant" className="-ml-1 text-white/80">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-xl">{modeDef.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-bold leading-tight">{modeDef.label}</div>
            <div className="text-[11px] leading-tight opacity-90">{modeDef.description}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
        {convo.map((m, i) => {
          const mine = m.from === "me";
          return (
            <div key={i} className={mine ? "flex justify-end" : "flex justify-start gap-2"}>
              {!mine && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                </div>
              )}
              <div
                className={
                  mine
                    ? "max-w-[80%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-sm text-white shadow-md shadow-brand-600/20"
                    : "max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm"
                }
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] text-amber-900">
          ※ ベータ版のためサンプル応答を表示しています
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-3 py-2">
        <div className="flex items-end gap-2">
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <Mic className="h-5 w-5" />
          </button>
          <div className="flex-1 rounded-2xl bg-slate-100 px-3 py-2">
            <div className="text-sm text-slate-400">質問や相談を入力</div>
          </div>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-400">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
