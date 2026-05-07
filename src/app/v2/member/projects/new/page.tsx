"use client";

import Link from "next/link";
import { useState } from "react";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleChat } from "@/components/bubble/bubble-chat";
import { Textarea } from "@/components/ui/textarea";
import { planConversation } from "@/lib/mock/data";
import { ChevronLeft, Send, Mic, Sparkles, Check } from "lucide-react";

const aiTurns = planConversation.filter((t) => t.speaker === "ai");

export default function V2NewProjectPage() {
  const [turnIndex, setTurnIndex] = useState(0);
  const [history, setHistory] = useState<
    { speaker: "ai" | "user"; body: string }[]
  >([{ speaker: "ai", body: aiTurns[0].body }]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);

  const current = aiTurns[turnIndex];

  const respond = (answer: string) => {
    const next = [...history, { speaker: "user" as const, body: answer }];
    setInput("");
    if (turnIndex + 1 < aiTurns.length) {
      next.push({ speaker: "ai", body: aiTurns[turnIndex + 1].body });
      setHistory(next);
      setTurnIndex(turnIndex + 1);
    } else {
      setHistory(next);
      setDone(true);
    }
  };

  const useExample = () => {
    if (current?.userExample) setInput(current.userExample);
  };

  if (done) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <AmbientBubbles count={12} />
        <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-12">
          <div className="relative inline-flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 shadow-2xl ring-2 ring-white/50 animate-float">
            <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
            <Check className="h-16 w-16 text-white" strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-center text-xl font-bold text-slate-900">
            プロジェクトが完成しました
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            目標・KPI・効果測定が AI によって整理されました。
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/v2/member/projects"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-300/50 ring-2 ring-white/40"
            >
              プロジェクト一覧へ →
            </Link>
            <Link
              href="/v2/member"
              className="text-center text-xs text-slate-600 hover:text-slate-900"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={8} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 py-4">
        <div className="flex items-center justify-between px-2">
          <Link
            href="/v2/member/projects"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            戻る
          </Link>
          <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] text-violet-700 ring-1 ring-violet-200 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {turnIndex + 1} / {aiTurns.length}
          </div>
        </div>

        <header className="mt-4 px-2">
          <h1 className="text-base font-bold text-slate-900">
            新しいプロジェクト
          </h1>
          <p className="mt-0.5 text-[11px] text-slate-600">
            AI が会話で計画を一緒に固めます
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {history.map((t, i) => (
            <BubbleChat key={i} speaker={t.speaker} body={t.body} />
          ))}
        </div>

        <div className="space-y-2 px-1">
          {current?.hint && (
            <div className="px-2 text-[11px] text-violet-700">
              💡 {current.hint}
            </div>
          )}

          <div className="rounded-[28px] bg-white/80 p-2 shadow-lg ring-2 ring-emerald-100 backdrop-blur">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="話して入力 or タップで入力"
              className="h-16 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-2 px-1 pb-1">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Mic className="h-4 w-4" />
              </button>
              <button
                disabled={!input.trim()}
                onClick={() => respond(input)}
                className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-300/40 ring-2 ring-white/40 disabled:opacity-30 disabled:shadow-none"
              >
                返信
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {current?.userExample && (
            <button
              onClick={useExample}
              className="w-full rounded-2xl border border-dashed border-slate-300 bg-white/40 px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-white/70 backdrop-blur"
            >
              <span className="font-semibold">回答例:</span> {current.userExample}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
