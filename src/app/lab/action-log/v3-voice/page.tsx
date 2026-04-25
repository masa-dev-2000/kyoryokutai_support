"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Mic,
  Pause,
  Sparkles,
  Check,
  RotateCcw,
  X,
  Pencil,
} from "lucide-react";
import { mockActions, sampleAiFollowUps } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

type Step =
  | "idle"
  | "recording"
  | "transcribing"
  | "ai-question"
  | "summary"
  | "saved";

const sampleTranscript =
  "篠山地区の田中さんを訪問。空き家バンクの登録に前向き。司法書士の同席を希望されたので来週改めて訪問予定。";

export default function V3VoiceFirst() {
  const [step, setStep] = useState<Step>("idle");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const startRecording = () => setStep("recording");

  const stopRecording = () => {
    setStep("transcribing");
    setTimeout(() => setStep("ai-question"), 1200);
  };

  const submitAnswer = () => {
    const newAnswers = [...answers, currentInput];
    setAnswers(newAnswers);
    setCurrentInput("");
    if (questionIndex + 1 < sampleAiFollowUps.length) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStep("summary");
    }
  };

  const skipQuestion = () => {
    submitAnswerInternal("(スキップ)");
  };

  const submitAnswerInternal = (val: string) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    setCurrentInput("");
    if (questionIndex + 1 < sampleAiFollowUps.length) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStep("summary");
    }
  };

  const reset = () => {
    setStep("idle");
    setQuestionIndex(0);
    setAnswers([]);
    setCurrentInput("");
  };

  const save = () => setStep("saved");

  return (
    <div className="px-5 py-4 space-y-4">
      <Link
        href="/lab/action-log"
        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        バリアント一覧
      </Link>

      <header>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">
            v3. 音声ファースト + AI 質問
          </h1>
          <Badge className="bg-brand-100 text-brand-700">MVP 候補</Badge>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          話すだけ。AI が不足を聞き返して完成度を上げる。
        </p>
      </header>

      {/* Step UI */}
      <Card>
        <CardBody>
          {step === "idle" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <p className="text-center text-sm text-slate-600">
                ボタンをタップして話してください。
                <br />
                行動 1 つずつ短く OK。
              </p>
              <button
                onClick={startRecording}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 active:scale-95 transition"
              >
                <Mic className="h-9 w-9" />
              </button>
              <p className="text-center text-[11px] text-slate-500">
                例: 「篠山の田中さん訪問。空き家登録に前向き」
              </p>
            </div>
          )}

          {step === "recording" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-rose-300 opacity-50" />
                <button
                  onClick={stopRecording}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-rose-500 text-white shadow-xl active:scale-95 transition"
                >
                  <Pause className="h-9 w-9" />
                </button>
              </div>
              <div className="font-mono text-2xl font-bold text-rose-600">
                00:23
              </div>
              <div className="flex items-end gap-1 h-6">
                {[3, 5, 7, 9, 11, 9, 7, 5, 3, 5, 7, 9, 11, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-rose-400 animate-pulse"
                    style={{
                      height: `${h * 2}px`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                録音中… タップで停止
              </p>
            </div>
          )}

          {step === "transcribing" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm text-violet-900">
                <Sparkles className="h-4 w-4 animate-pulse" />
                文字起こし中…
              </div>
              <p className="text-[11px] text-slate-500">
                Whisper が日本語を高精度で書き起こし
              </p>
            </div>
          )}

          {(step === "ai-question" ||
            step === "summary" ||
            step === "saved") && (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  あなたが話した内容
                </div>
                <p className="mt-1 leading-relaxed">{sampleTranscript}</p>
              </div>

              {step === "ai-question" && (
                <AiQuestionStep
                  question={sampleAiFollowUps[questionIndex]}
                  total={sampleAiFollowUps.length}
                  current={questionIndex + 1}
                  value={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={submitAnswer}
                  onSkip={skipQuestion}
                />
              )}

              {step === "summary" && (
                <SummaryStep
                  answers={answers}
                  onEdit={() => {}}
                  onSave={save}
                  onReset={reset}
                />
              )}

              {step === "saved" && (
                <div className="rounded-xl bg-emerald-50 px-4 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-emerald-500 p-2 text-white">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-emerald-900">
                    保存しました
                  </div>
                  <p className="mt-1 text-xs text-emerald-800">
                    月次報告にも自動で反映されます
                  </p>
                  <button
                    onClick={reset}
                    className="mt-3 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700"
                  >
                    続けて記録する
                  </button>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent activity */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          今日の行動 ({mockActions.filter((a) => a.timestamp.startsWith("2026-04-23")).length} 件)
        </h2>
        <div className="space-y-2">
          {mockActions
            .filter((a) => a.timestamp.startsWith("2026-04-23"))
            .map((a) => (
              <Card key={a.id}>
                <CardBody>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono font-semibold text-slate-700">
                      {a.timestamp.slice(11, 16)}
                    </span>
                    {a.type === "voice" && (
                      <Badge className="bg-rose-100 text-rose-700">
                        <Mic className="mr-1 h-3 w-3" />
                        音声 {a.duration}
                      </Badge>
                    )}
                    {a.type === "post" && (
                      <Badge className="bg-slate-100 text-slate-600">
                        <Pencil className="mr-1 h-3 w-3" />
                        テキスト
                      </Badge>
                    )}
                    {a.type === "stamp" && (
                      <Badge className="bg-amber-100 text-amber-700">
                        スタンプ
                      </Badge>
                    )}
                    {a.aiCompleted && (
                      <Badge className="bg-violet-100 text-violet-700">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI 補完済
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-800">{a.bodyMd}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.tags.map((t) => (
                      <Badge
                        key={t}
                        className="bg-slate-100 text-slate-600 text-[10px]"
                      >
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
        </div>
      </section>

      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
        <CardBody>
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <p className="text-xs text-violet-900">
              夜にボタン 1 つで「AI が今日の行動を月次報告フォーマットで要約」してくれます。
              書く負担なく、提出できる粒度に。
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function AiQuestionStep({
  question,
  total,
  current,
  value,
  onChange,
  onSubmit,
  onSkip,
}: {
  question: { question: string; hint?: string };
  total: number;
  current: number;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <Sparkles className="h-3 w-3 text-violet-500" />
        AI からの質問({current}/{total})
      </div>
      <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-3">
        <div className="text-sm font-semibold text-violet-900">
          {question.question}
        </div>
        {question.hint && (
          <div className="mt-0.5 text-[11px] text-violet-700">
            {question.hint}
          </div>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="話して入力 or タップで入力"
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <div className="flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-sm font-medium text-slate-600"
        >
          スキップ
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white"
        >
          次へ
        </button>
      </div>
    </div>
  );
}

function SummaryStep({
  answers,
  onEdit,
  onSave,
  onReset,
}: {
  answers: string[];
  onEdit: () => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
          <Sparkles className="h-3.5 w-3.5" />
          完成版(AI が整形)
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-800">
          篠山地区の田中さん(78 歳)を訪問。空き家バンク登録に前向きで、
          司法書士の同席を希望されたため、来週改めて訪問予定。
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge className="bg-emerald-100 text-emerald-800">#空き家バンク</Badge>
          <Badge className="bg-emerald-100 text-emerald-800">#移住促進</Badge>
        </div>
        <div className="mt-2 text-[11px] text-emerald-800">
          関連プロジェクト: 「空き家バンク登録促進プロジェクト」に紐付け
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600"
          aria-label="やり直す"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          className="flex-1 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700"
        >
          編集する
        </button>
        <button
          onClick={onSave}
          className="flex-1 rounded-xl bg-brand-600 text-sm font-semibold text-white"
        >
          保存
        </button>
      </div>
    </div>
  );
}
