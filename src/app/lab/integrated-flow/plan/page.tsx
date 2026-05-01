"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { planSteps } from "@/lib/mock/data";
import {
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Check,
  Target,
  Mic,
  RotateCcw,
} from "lucide-react";

export default function PlanPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState("");
  const [completed, setCompleted] = useState(false);

  const current = planSteps[stepIndex];
  const progress = (Object.keys(answers).length / planSteps.length) * 100;

  const next = () => {
    const newAnswers = { ...answers, [current.id]: currentInput };
    setAnswers(newAnswers);
    setCurrentInput("");
    if (stepIndex + 1 < planSteps.length) {
      setStepIndex(stepIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const useExample = () => {
    if (current.example) setCurrentInput(current.example);
  };

  const reset = () => {
    setStepIndex(0);
    setAnswers({});
    setCurrentInput("");
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="px-5 py-4 space-y-4">
        <Button variant="link" size="sm" className="-ml-2 px-2" asChild>
          <Link href="/lab/integrated-flow">
            <ChevronLeft />
            統合フローへ戻る
          </Link>
        </Button>

        <header>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            ✅ プロジェクト計画 完成
          </Badge>
          <h1 className="mt-2 text-xl font-bold">
            空き家バンク登録促進プロジェクト
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            AI が以下のように整理しました。編集も可能です。
          </p>
        </header>

        <Card className="border-primary/30">
          <CardContent className="space-y-4">
            <SummaryRow label="目的" value={answers.what} />
            <SummaryRow label="意義" value={answers.why} />
            <SummaryRow label="期間" value={answers.period} />
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">KPI</Label>
              <p className="mt-1 text-sm leading-relaxed">{answers.kpi}</p>
            </div>
            <Separator />
            <SummaryRow label="効果測定" value={answers.measure} />
            <SummaryRow label="リスク" value={answers.risk} />
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardContent>
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
              <div className="space-y-2 text-xs text-violet-900">
                <p>
                  <strong>AI からの追加提案</strong>:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>「司法書士同席」のリスクは、月次でフォローするよう設定済</li>
                  <li>類似事例 2 件(C-001, C-003)を参考に、登録率を 15% 上げる施策があります</li>
                  <li>最初の 1 ヶ月は週次で進捗確認することをおすすめします</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={reset}>
            <RotateCcw />
            やり直す
          </Button>
          <Button className="flex-1">
            <Check />
            プロジェクトとして保存
          </Button>
        </div>

        <Card>
          <CardContent className="text-xs text-muted-foreground">
            この計画から自動で:
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>毎日のアクション → 自動でこのプロジェクトに紐付け候補</li>
              <li>夜の振り返り → KPI に紐付けて進捗集計</li>
              <li>月次報告 / 事例 / 成果発表 → AI が文脈込みで自動生成</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 py-4 gap-4 min-h-[calc(100vh-120px)]">
      <Button variant="link" size="sm" className="-ml-2 px-2 self-start" asChild>
        <Link href="/lab/integrated-flow">
          <ChevronLeft />
          統合フローへ戻る
        </Link>
      </Button>

      <header>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-violet-600" />
          <h1 className="text-base font-bold">① プロジェクト計画</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          AI が 6 つの質問で計画を一緒に組み立てます
        </p>
        <Progress value={progress} className="mt-3 h-1.5" />
        <div className="mt-1 text-[11px] text-muted-foreground">
          {stepIndex + 1} / {planSteps.length}
        </div>
      </header>

      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 flex-shrink-0">
        <CardContent>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-violet-900">
                AI からの質問
              </div>
              <p className="mt-1 text-base font-bold leading-snug text-violet-950">
                {current.question}
              </p>
              {current.hint && (
                <p className="mt-1 text-xs text-violet-700">{current.hint}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 space-y-3">
        <Textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="ここに入力(音声でも OK)"
          className="h-32 resize-none"
        />

        {current.example && (
          <button
            onClick={useExample}
            className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-left text-[11px] text-muted-foreground hover:bg-muted/60 w-full"
          >
            <span className="font-semibold">例:</span> {current.example}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="icon">
          <Mic />
        </Button>
        <Button
          className="flex-1"
          disabled={!currentInput.trim()}
          onClick={next}
        >
          {stepIndex + 1 < planSteps.length ? (
            <>
              次へ
              <ArrowRight />
            </>
          ) : (
            <>
              <Check />
              計画を完成させる
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="mt-1 text-sm leading-relaxed">{value || "(未入力)"}</p>
    </div>
  );
}
