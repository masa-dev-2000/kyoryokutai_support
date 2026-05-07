"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Target,
  Activity,
  GraduationCap,
  Mic,
  MessageSquare,
  FileText,
  TrendingUp,
  Bookmark,
  Presentation,
  Building2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 7;

export default function TutorialPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const next = () => {
    if (step + 1 < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      router.push("/v2");
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={14} />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            トップ
          </Link>
          <div className="text-[11px] font-semibold text-slate-500">
            {step + 1} / {TOTAL_STEPS}
          </div>
          <button
            onClick={() => router.push("/v2")}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            スキップ
          </button>
        </div>

        {/* Progress dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === step
                  ? "w-8 bg-gradient-to-r from-emerald-400 to-teal-500"
                  : i < step
                    ? "w-1.5 bg-emerald-300"
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
            {step === 0 && <StepWelcome />}
            {step === 1 && <StepThreeFunctions />}
            {step === 2 && <StepAiAssembles />}
            {step === 3 && <StepProject />}
            {step === 4 && <StepActivity />}
            {step === 5 && <StepLearn />}
            {step === 6 && <StepStart />}
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

          <button
            onClick={next}
            className="relative flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 px-6 font-bold text-white shadow-lg shadow-emerald-300/50 ring-2 ring-white/40 transition active:scale-95"
          >
            <span className="absolute left-[12%] top-[20%] h-[35%] w-[20%] rounded-full bg-white/60 blur-[2px]" />
            <span className="relative">
              {step + 1 < TOTAL_STEPS ? "次へ" : "v2 を試す"}
            </span>
            <ChevronRight className="relative h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

/* ==================== Steps ==================== */

function StepWelcome() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-teal-400 to-sky-400 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-sky-400 opacity-40 blur-xl" />
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/90 blur-sm" />
          <Sparkles className="relative h-16 w-16" />
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-slate-900">
        ようこそ 🫧
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        地域おこし協力隊サポートへ。
        <br />
        ユーザーは <strong>3 つだけ</strong>。
        <br />
        あとは AI が組み立てる、新しい体験。
      </p>
      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-xs text-emerald-800 ring-1 ring-emerald-200 backdrop-blur">
        <Sparkles className="h-3 w-3" />2 分のチュートリアルを始めます
      </div>
    </div>
  );
}

function StepThreeFunctions() {
  return (
    <div>
      <h2 className="text-center text-xl font-bold text-slate-900">
        ユーザーがやる 3 つ
      </h2>
      <p className="mt-2 text-center text-xs text-slate-600">
        スマホで、3 つの行動だけ
      </p>

      <div className="mt-8 flex flex-col items-center gap-6">
        <BubbleButton
          label="プロジェクト"
          sublabel="計画 + 進捗"
          icon={<Target className="h-6 w-6" />}
          color="violet"
          size="lg"
          float="slow"
          delay={0}
        />
        <div className="flex items-center gap-5">
          <BubbleButton
            label="日々の動き"
            sublabel="記録 + 振り返り"
            icon={<Activity className="h-5 w-5" />}
            color="emerald"
            size="md"
            float="normal"
            delay={300}
          />
          <BubbleButton
            label="学ぶ・相談"
            sublabel="事例 + AI"
            icon={<GraduationCap className="h-5 w-5" />}
            color="amber"
            size="md"
            float="fast"
            delay={600}
          />
        </div>
      </div>
    </div>
  );
}

function StepAiAssembles() {
  const items = [
    { label: "日報", icon: FileText, color: "from-violet-300 to-indigo-400" },
    { label: "月報", icon: FileText, color: "from-sky-300 to-blue-400" },
    { label: "事例", icon: Bookmark, color: "from-amber-300 to-orange-400" },
    { label: "進捗", icon: TrendingUp, color: "from-emerald-300 to-teal-400" },
    {
      label: "成果発表",
      icon: Presentation,
      color: "from-rose-300 to-pink-400",
    },
  ];
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-slate-900">
        AI が裏側で全部組み立てる
      </h2>
      <p className="mt-2 text-xs text-slate-600">
        あなたの会話と記録から、これらが自動生成されます
      </p>

      <div className="mt-8 grid grid-cols-3 gap-x-3 gap-y-6 place-items-center">
        {items.map((item, i) => {
          const Icon = item.icon;
          const floatClass = ["animate-float-slow", "animate-float", "animate-float-fast"][i % 3];
          return (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-xl ring-2 ring-white/50",
                  item.color,
                  floatClass,
                )}
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[1px]" />
                <Icon className="relative h-7 w-7" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs text-violet-800 ring-1 ring-violet-200">
        <Sparkles className="h-3 w-3" />
        書く負担なし、情報の棄損もなし
      </div>
    </div>
  );
}

function StepProject() {
  return (
    <div>
      <div className="flex justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 via-violet-400 to-indigo-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <Target className="relative h-12 w-12" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-xl font-bold text-slate-900">
        ① プロジェクト
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
        やりたいことを<strong>話すだけ</strong>。
        <br />
        AI が会話で <strong>目標 / KPI / 効果測定</strong>
        を一緒に固めます。
      </p>

      <div className="mt-6 space-y-2">
        <ChatLine speaker="ai">
          最近、気になっていることは?
        </ChatLine>
        <ChatLine speaker="user">空き家がもったいないなあって</ChatLine>
        <ChatLine speaker="ai">
          素敵な目標。半年で何件登録できたら成功?
        </ChatLine>
      </div>

      <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs text-violet-800 ring-1 ring-violet-200">
        <Sparkles className="h-3 w-3" />
        専門用語を覚える必要なし
      </div>
    </div>
  );
}

function StepActivity() {
  return (
    <div>
      <div className="flex justify-center gap-3">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <Mic className="relative h-9 w-9" />
        </div>
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-white shadow-2xl ring-2 ring-white/50 animate-float-slow"
          style={{ animationDelay: "200ms" }}
        >
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <MessageSquare className="relative h-9 w-9" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-xl font-bold text-slate-900">
        ② 日々の動き
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
        現場では<strong>話すだけ</strong>で記録。
        <br />
        夜は AI が <strong>あなたの行動</strong>を見ながら聞いてきます。
      </p>

      <div className="mt-6 space-y-2">
        <ChatLine speaker="ai">
          16:42 田中さん訪問の件、司法書士同席は来週いつ?
        </ChatLine>
        <ChatLine speaker="user">水曜午後、佐藤先生同席で</ChatLine>
        <ChatLine speaker="ai">
          ありがとう。会話で田中さんが一番気にされていたのは?
        </ChatLine>
      </div>

      <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 ring-1 ring-emerald-200">
        <Sparkles className="h-3 w-3" />
        記憶の揮発を防ぎ、日報が完成
      </div>
    </div>
  );
}

function StepLearn() {
  return (
    <div>
      <div className="flex justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <GraduationCap className="relative h-12 w-12" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-xl font-bold text-slate-900">
        ③ 学ぶ・相談する
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
        全国の<strong>事例</strong>から学ぶ。
        <br />
        AI が <strong>4 つのモード</strong>で壁打ちしてくれる。
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { emoji: "🎯", label: "戦略レビュー" },
          { emoji: "🏛", label: "提案準備" },
          { emoji: "💼", label: "キャリア相談" },
          { emoji: "💭", label: "悩み相談" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-amber-200 bg-white/80 px-3 py-2.5 text-center backdrop-blur"
          >
            <div className="text-xl">{m.emoji}</div>
            <div className="mt-0.5 text-xs font-semibold text-slate-700">
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepStart() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-teal-400 to-emerald-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 opacity-40 blur-xl" />
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/90 blur-sm" />
          <Check className="relative h-20 w-20" strokeWidth={2.5} />
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-bold text-slate-900">
        準備完了!
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        計画を立てて、毎日少し記録するだけ。
        <br />
        役場へのレポートも事例も、AI が組み立てます。
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-[11px]">
        <Pill icon={<Target className="h-3 w-3" />} label="計画" />
        <Pill icon={<Activity className="h-3 w-3" />} label="動き" />
        <Pill icon={<GraduationCap className="h-3 w-3" />} label="学び" />
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs text-violet-800 ring-1 ring-violet-200">
        <Building2 className="h-3 w-3" />
        役場側は別画面で承認・反応
      </div>
    </div>
  );
}

function ChatLine({
  speaker,
  children,
}: {
  speaker: "ai" | "user";
  children: React.ReactNode;
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

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-full bg-white/80 px-3 py-1.5 font-semibold text-slate-700 ring-1 ring-slate-200 backdrop-blur">
      {icon}
      {label}
    </div>
  );
}
