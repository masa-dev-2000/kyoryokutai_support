"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Route } from "next";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type TutorialStep = {
  id: string;
  render: ReactNode;
};

type Props = {
  title: string;
  steps: TutorialStep[];
  finishLabel: string;
  finishHref: Route;
  accent?: "emerald" | "violet";
};

const accentMap = {
  emerald: {
    barFrom: "from-emerald-400",
    barTo: "to-teal-500",
    barOn: "bg-emerald-300",
    nextBg: "from-emerald-400 to-teal-500",
    nextShadow: "shadow-emerald-300/50",
    pillBg: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  violet: {
    barFrom: "from-violet-400",
    barTo: "to-indigo-500",
    barOn: "bg-violet-300",
    nextBg: "from-violet-400 to-indigo-500",
    nextShadow: "shadow-violet-300/50",
    pillBg: "bg-violet-50 text-violet-800 ring-violet-200",
  },
};

export function TutorialFlow({
  title,
  steps,
  finishLabel,
  finishHref,
  accent = "emerald",
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const a = accentMap[accent];

  const next = () => {
    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      router.push(finishHref);
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/tutorial"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          チュートリアル
        </Link>
        <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 backdrop-blur">
          <Sparkles className="h-3 w-3" />
          {title}
        </div>
        <button
          onClick={() => router.push(finishHref)}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          スキップ
        </button>
      </div>

      {/* Progress */}
      <div className="mt-3 flex justify-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === step
                ? `w-8 bg-gradient-to-r ${a.barFrom} ${a.barTo}`
                : i < step
                  ? `w-1.5 ${a.barOn}`
                  : "w-1.5 bg-slate-300",
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex flex-1 items-center justify-center py-6">
        <div
          key={step}
          className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {steps[step].render}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-4">
        <button
          onClick={prev}
          disabled={step === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md ring-1 ring-slate-200 backdrop-blur transition active:scale-95 disabled:opacity-30 disabled:shadow-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-[11px] font-semibold text-slate-500">
          {step + 1} / {steps.length}
        </div>

        <button
          onClick={next}
          className={cn(
            "relative flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-br px-6 font-bold text-white shadow-lg ring-2 ring-white/40 transition active:scale-95 max-w-[60%]",
            a.nextBg,
            a.nextShadow,
          )}
        >
          <span className="absolute left-[12%] top-[20%] h-[35%] w-[20%] rounded-full bg-white/60 blur-[2px]" />
          <span className="relative">
            {step + 1 < steps.length ? "次へ" : finishLabel}
          </span>
          <ChevronRight className="relative h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============== 共通サブコンポーネント ============== */

export function ChatLine({
  speaker,
  children,
}: {
  speaker: "ai" | "user";
  children: ReactNode;
}) {
  if (speaker === "ai") {
    return (
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 text-white shadow-sm">
          <Sparkles className="h-3 w-3" />
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white/90 px-3 py-1.5 text-xs leading-relaxed text-slate-800 shadow-sm ring-1 ring-violet-100">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-400 to-teal-500 px-3 py-1.5 text-xs text-white shadow ring-2 ring-white/30">
        {children}
      </div>
    </div>
  );
}

export function Pill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 backdrop-blur">
      {icon}
      {label}
    </div>
  );
}
