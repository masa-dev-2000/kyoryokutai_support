"use client";

import Link from "next/link";
import { useState } from "react";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleChat } from "@/components/bubble/bubble-chat";
import { Textarea } from "@/components/ui/textarea";
import { reviewConversation } from "@/lib/mock/data";
import { ChevronLeft, Send, Mic, Sparkles, Check } from "lucide-react";

const aiTurns = reviewConversation.filter((t) => t.speaker === "ai");

export default function V2ReviewPage() {
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

  const skip = () => respond("(スキップ)");
  const useExample = () => {
    if (current?.userExample) setInput(current.userExample);
  };

  if (done) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <AmbientBubbles count={12} />
        <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-12">
          <div className="relative inline-flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
            <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
            <Check className="h-16 w-16" strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-center text-xl font-bold text-slate-900">
            今日の日報ができました
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            行動 4 件 + 振り返りから AI が組み立てました
          </p>
          <div className="mt-6 max-w-sm rounded-3xl bg-white/80 p-4 text-xs leading-relaxed text-slate-700 shadow-lg ring-1 ring-violet-100 backdrop-blur">
            <span className="block font-semibold text-violet-900">
              生成された日報(プレビュー)
            </span>
            <p className="mt-2">
              午前: 市役所打合せ(広報誌寄稿、5/10 締切確定)。
              午後: 山の芋・岡田さん宅で 800kg 収穫予定確認、レストラン試作品 5/10 発送。
              夕方: 篠山・田中さん 78 歳訪問、空き家登録に前向き(司法書士同席で再訪問予定)。
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/v2/member"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-300/50 ring-2 ring-white/40"
            >
              ホームに戻る →
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
            href="/v2/member/activity"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            戻る
          </Link>
          <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] text-amber-700 ring-1 ring-amber-200 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {turnIndex + 1} / {aiTurns.length}
          </div>
        </div>

        <header className="mt-4 px-2">
          <h1 className="text-base font-bold text-slate-900">夜の振り返り</h1>
          <p className="mt-0.5 text-[11px] text-slate-600">
            AI が今日の行動を 1 件ずつ深掘りします
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {history.map((t, i) => (
            <BubbleChat key={i} speaker={t.speaker} body={t.body} />
          ))}
        </div>

        <div className="space-y-2 px-1">
          {current?.hint && (
            <div className="px-2 text-[11px] text-amber-700">
              💡 {current.hint}
            </div>
          )}

          <div className="rounded-[28px] bg-white/80 p-2 shadow-lg ring-2 ring-amber-100 backdrop-blur">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="話して入力 or タップで入力(スキップ可)"
              className="h-16 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-2 px-1 pb-1">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Mic className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={skip}
                  className="rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-medium text-slate-600"
                >
                  スキップ
                </button>
                <button
                  disabled={!input.trim()}
                  onClick={() => respond(input)}
                  className="flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-amber-300/40 ring-2 ring-white/40 disabled:opacity-30 disabled:shadow-none"
                >
                  返信
                  <Send className="h-4 w-4" />
                </button>
              </div>
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
