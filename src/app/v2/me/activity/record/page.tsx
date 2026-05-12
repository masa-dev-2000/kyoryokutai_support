"use client";

import Link from "next/link";
import { useState } from "react";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { ChevronLeft, Mic, Pause, Sparkles, Check } from "lucide-react";

type Step = "idle" | "recording" | "transcribing" | "saved";

export default function RecordPage() {
  const [step, setStep] = useState<Step>("idle");

  const start = () => setStep("recording");
  const stop = () => {
    setStep("transcribing");
    setTimeout(() => setStep("saved"), 1200);
  };
  const reset = () => setStep("idle");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={8} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-6">
        <Link
          href="/v2/me/activity"
          className="inline-flex items-center gap-1 self-start text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          戻る
        </Link>

        <header className="mt-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">行動を記録</h1>
          <p className="mt-1 text-xs text-slate-600">話すだけ。1 つの行動を短く</p>
        </header>

        <div className="mt-12 flex flex-1 items-center justify-center">
          {step === "idle" && (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={start}
                className="relative inline-flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-white shadow-2xl ring-2 ring-white/50 animate-float active:scale-95"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 opacity-50 blur-xl" />
                <span className="absolute left-[18%] top-[12%] h-[28%] w-[28%] rounded-full bg-white/90 blur-sm" />
                <Mic className="relative h-16 w-16" strokeWidth={2.5} />
              </button>
              <p className="text-center text-sm font-semibold text-slate-700">
                タップで録音開始
              </p>
              <p className="text-center text-[11px] text-slate-500">
                例: 「篠山の田中さん訪問。空き家登録に前向き」
              </p>
            </div>
          )}

          {step === "recording" && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={stop}
                className="relative inline-flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 via-rose-400 to-pink-500 text-white shadow-2xl ring-2 ring-white/50 active:scale-95"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-rose-300 opacity-50" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-300 to-pink-500 opacity-60 blur-xl" />
                <span className="absolute left-[18%] top-[12%] h-[28%] w-[28%] rounded-full bg-white/90 blur-sm" />
                <Pause className="relative h-16 w-16" strokeWidth={2.5} />
              </button>
              <div className="font-mono text-3xl font-bold text-rose-600">
                00:23
              </div>
              <div className="flex h-6 items-end gap-1">
                {[3, 5, 7, 9, 11, 9, 7, 5, 3, 5, 7, 9, 11, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-rose-400 animate-pulse"
                    style={{ height: `${h * 2}px`, animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500">録音中… タップで停止</p>
            </div>
          )}

          {step === "transcribing" && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative inline-flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
                <span className="absolute left-[18%] top-[12%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
                <Sparkles className="relative h-12 w-12 animate-shimmer" />
              </div>
              <p className="text-sm font-semibold text-violet-900">
                AI が文字起こし中…
              </p>
            </div>
          )}

          {step === "saved" && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative inline-flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
                <span className="absolute left-[18%] top-[12%] h-[28%] w-[28%] rounded-full bg-white/90 blur-sm" />
                <Check className="relative h-16 w-16" strokeWidth={3} />
              </div>
              <p className="text-base font-bold text-emerald-900">
                記録しました
              </p>
              <p className="text-center text-xs text-slate-600 max-w-xs">
                「篠山地区の田中さんを訪問。空き家バンクの登録に前向き。
                司法書士の同席を希望されたので来週改めて訪問予定。」
              </p>
              <div className="mt-2 flex gap-2 text-[11px]">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800">
                  #空き家バンク
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800">
                  #移住促進
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-[11px] text-violet-700 ring-1 ring-violet-200">
                <Sparkles className="h-3 w-3" />
                プロジェクト「空き家活用」に紐付け済
              </div>
              <BubbleButton
                onClick={reset}
                label="もう一つ記録"
                color="emerald"
                size="md"
                float="normal"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
