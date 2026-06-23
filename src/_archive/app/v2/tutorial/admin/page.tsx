import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import { TutorialFlow, ChatLine, Pill } from "@/components/tutorial/tutorial-flow";
import {
  Sparkles,
  BarChart3,
  Megaphone,
  ClipboardCheck,
  Building2,
  TrendingUp,
  Users,
  FileCheck,
  BookOpen,
  Download,
  Smartphone,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminTutorialPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={14} />
      <TutorialFlow
        title="役場 用"
        finishLabel="管理画面を試す"
        finishHref="/v2/admin"
        accent="violet"
        steps={[
          { id: "welcome", render: <StepWelcome /> },
          { id: "three", render: <StepThreeFunctions /> },
          { id: "less-burden", render: <StepLessBurden /> },
          { id: "status", render: <StepStatus /> },
          { id: "share", render: <StepShare /> },
          { id: "approve", render: <StepApprove /> },
          { id: "start", render: <StepStart /> },
        ]}
      />
    </main>
  );
}

function StepWelcome() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 via-indigo-400 to-violet-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 opacity-40 blur-xl" />
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/90 blur-sm" />
          <Building2 className="relative h-16 w-16" />
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-slate-900">
        役場の皆さまへ 🫧
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        負担を増やさず、隊員の活動を
        <br />
        <strong>見える化・支援できる</strong>仕組みです。
      </p>
      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-xs text-violet-800 ring-1 ring-violet-200 backdrop-blur">
        <Sparkles className="h-3 w-3" />2 分のチュートリアルを始めます
      </div>
    </div>
  );
}

function StepThreeFunctions() {
  return (
    <div>
      <h2 className="text-center text-xl font-bold text-slate-900">
        役場の責任 3 つ
      </h2>
      <p className="mt-2 text-center text-xs text-slate-600">
        この 3 機能で完結します
      </p>

      <div className="mt-8 flex flex-col items-center gap-6">
        <BubbleButton
          label="状況確認"
          sublabel="隊員 / KPI / 議会報告"
          icon={<BarChart3 className="h-6 w-6" />}
          color="emerald"
          size="lg"
          float="slow"
          delay={0}
        />
        <div className="flex items-center gap-5">
          <BubbleButton
            label="情報共有"
            sublabel="お知らせ / 事例"
            icon={<Megaphone className="h-5 w-5" />}
            color="sky"
            size="md"
            float="normal"
            delay={300}
          />
          <BubbleButton
            label="申請承認"
            sublabel="月次 / 経費"
            icon={<ClipboardCheck className="h-5 w-5" />}
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

function StepLessBurden() {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-slate-900">
        新しい負担はありません
      </h2>
      <p className="mt-2 text-xs text-slate-600">
        既存の電話・メール運用を尊重した設計
      </p>

      <div className="mt-8 grid gap-3">
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/80 p-3 ring-1 ring-emerald-200 backdrop-blur">
          <div className="text-2xl">📞</div>
          <div className="text-left text-xs leading-relaxed text-emerald-900">
            <strong>電話・LINE はそのまま</strong>。
            <br />
            チャット機能は意図的に外しました。
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-violet-50/80 p-3 ring-1 ring-violet-200 backdrop-blur">
          <div className="text-2xl">✨</div>
          <div className="text-left text-xs leading-relaxed text-violet-900">
            <strong>AI が下書き</strong>するので、
            <br />
            役場側はレビュー・承認のみ。
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-sky-50/80 p-3 ring-1 ring-sky-200 backdrop-blur">
          <div className="text-2xl">📋</div>
          <div className="text-left text-xs leading-relaxed text-sky-900">
            <strong>議会報告 PDF も自動生成</strong>。
            <br />
            集計の手間がほぼゼロに。
          </div>
        </div>
      </div>
    </div>
  );
}

function StepStatus() {
  const kpi = [
    { label: "担当", value: "5", unit: "名", icon: Users, color: "from-emerald-300 to-teal-500" },
    { label: "日報率", value: "82", unit: "%", icon: TrendingUp, color: "from-sky-300 to-blue-500" },
    { label: "提出", value: "3/5", unit: "", icon: FileCheck, color: "from-amber-300 to-orange-500" },
  ];
  return (
    <div>
      <div className="flex justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <BarChart3 className="relative h-12 w-12" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-xl font-bold text-slate-900">
        ① 状況確認
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
        担当隊員の活動を <strong>1 画面</strong> で把握。
        <br />
        AI が「面談を推奨」など気づきを提示。
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {kpi.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-gradient-to-br p-2.5 text-white shadow ring-2 ring-white/40",
                k.color,
              )}
            >
              <span className="pointer-events-none absolute left-[10%] top-[10%] h-[20%] w-[30%] rounded-full bg-white/60 blur-sm" />
              <Icon className="relative h-3.5 w-3.5 opacity-80" />
              <div className="relative mt-0.5 text-lg font-bold leading-none">
                {k.value}
                {k.unit && <span className="text-xs">{k.unit}</span>}
              </div>
              <div className="relative text-[10px] opacity-90">{k.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-violet-50/80 p-3 text-xs ring-1 ring-violet-200 backdrop-blur">
        <div className="flex items-start gap-2 text-violet-900">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
          <p>未提出 2 名は日報頻度も低下傾向。**面談を推奨**します。</p>
        </div>
      </div>
    </div>
  );
}

function StepShare() {
  return (
    <div>
      <div className="flex justify-center gap-3">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <Megaphone className="relative h-9 w-9" />
        </div>
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 via-violet-400 to-indigo-500 text-white shadow-2xl ring-2 ring-white/50 animate-float-slow"
          style={{ animationDelay: "200ms" }}
        >
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <BookOpen className="relative h-9 w-9" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-xl font-bold text-slate-900">
        ② 情報共有
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
        <strong>お知らせ配信</strong>と
        <strong>全国事例の参考</strong>。
        <br />
        他自治体の取り組みから AI が選定。
      </p>

      <div className="mt-6 space-y-2">
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          <div className="flex items-start justify-between">
            <div className="font-semibold text-sm text-slate-900">
              5 月の全体ミーティングについて
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
              既読 4/5
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            5/22 (金) 14:00〜 市役所 4 階 大会議室
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs text-sky-800 ring-1 ring-sky-200">
        <Sparkles className="h-3 w-3" />
        既読率も AI が「未読の方へ再通知?」と提案
      </div>
    </div>
  );
}

function StepApprove() {
  return (
    <div>
      <div className="flex justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[2px]" />
          <ClipboardCheck className="relative h-12 w-12" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-xl font-bold text-slate-900">
        ③ 申請承認
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
        月次報告は <strong>AI 下書き済</strong>。
        <br />
        承認時のコメントが <strong>必須</strong>です。
      </p>

      <div className="mt-6 rounded-2xl bg-amber-50/80 p-3 ring-1 ring-amber-300 backdrop-blur">
        <div className="text-xs font-semibold text-amber-900">
          承認前フィードバック(必須)
        </div>
        <div className="mt-2 space-y-1 text-[11px] text-amber-900">
          <div>① 評価できる点 <span className="text-rose-600">*</span></div>
          <div>② 改善提案(任意)</div>
          <div>③ 来月の期待(任意)</div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-amber-800">
          隊員のモチベーションを支えるため、空コメントでは承認できません。
          数行で OK。
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Pill icon={<Download className="h-3 w-3" />} label="PDF" />
        <Pill icon={<Sparkles className="h-3 w-3" />} label="議会報告" />
      </div>
    </div>
  );
}

function StepStart() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 via-indigo-400 to-violet-500 text-white shadow-2xl ring-2 ring-white/50 animate-float">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 opacity-40 blur-xl" />
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/90 blur-sm" />
          <Check className="relative h-20 w-20" strokeWidth={2.5} />
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-bold text-slate-900">
        準備完了!
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        状況を見る・お知らせる・承認する、それだけ。
        <br />
        集計や報告書作成の負担は AI が肩代わりします。
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Pill icon={<BarChart3 className="h-3 w-3" />} label="状況" />
        <Pill icon={<Megaphone className="h-3 w-3" />} label="共有" />
        <Pill icon={<ClipboardCheck className="h-3 w-3" />} label="承認" />
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 ring-1 ring-emerald-200">
        <Smartphone className="h-3 w-3" />
        隊員側は別アプリ(スマホ)で日報・振り返り
      </div>
    </div>
  );
}
