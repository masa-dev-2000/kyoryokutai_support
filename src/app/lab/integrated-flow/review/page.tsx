"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { reviewQuestions, mockActions } from "@/lib/mock/data";
import {
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Check,
  MessageSquare,
  Mic,
  FileText,
  Bookmark,
} from "lucide-react";

export default function ReviewPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState("");
  const [completed, setCompleted] = useState(false);

  const todaysActions = mockActions.filter((a) =>
    a.timestamp.startsWith("2026-04-23"),
  );
  const current = reviewQuestions[stepIndex];
  const progress = (Object.keys(answers).length / reviewQuestions.length) * 100;

  const submit = () => {
    const newAnswers = { ...answers, [current.id]: currentInput };
    setAnswers(newAnswers);
    setCurrentInput("");
    if (stepIndex + 1 < reviewQuestions.length) {
      setStepIndex(stepIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const skip = () => {
    const newAnswers = { ...answers, [current.id]: "" };
    setAnswers(newAnswers);
    setCurrentInput("");
    if (stepIndex + 1 < reviewQuestions.length) {
      setStepIndex(stepIndex + 1);
    } else {
      setCompleted(true);
    }
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
            ✅ 振り返り完了
          </Badge>
          <h1 className="mt-2 text-xl font-bold">今日の日報ができました</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            行動 {todaysActions.length} 件 + 振り返り {Object.keys(answers).length} 問から AI が組み立て
          </p>
        </header>

        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-900">
              <Sparkles className="h-4 w-4" />
              AI が生成した日報
            </div>
            <Separator className="my-3 bg-violet-200" />
            <article className="space-y-2 text-sm leading-relaxed text-slate-800">
              <p>
                <strong>2026 年 4 月 23 日(金)</strong>
              </p>
              <p>
                午前は篠山地区での空き家現地確認(2 件)、午後は山の芋生産者との販路打合せを実施。市役所では広報誌寄稿の締切確定。
              </p>
              <p>
                <strong>プロジェクト進捗</strong>: 空き家バンク登録促進は登録 6/10 件、内覧 18/20 件まで進捗。司法書士同席フローが効いている。
              </p>
              <p>
                <strong>所感</strong>:{" "}
                {answers.learning ||
                  "高齢所有者には司法書士同席が決め手になることを再確認。"}
              </p>
            </article>
            <Separator className="my-3 bg-violet-200" />
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                #空き家バンク
              </Badge>
              <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                #移住促進
              </Badge>
              <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                #販路開拓
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              この日報から自動で派生
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <DerivativeItem
                icon={FileText}
                label="月次報告 (4月分)"
                desc="30 日分の日報を集約予定 - 月末ボタンで生成"
              />
              <DerivativeItem
                icon={Bookmark}
                label="事例候補 - 司法書士同席で登録率向上"
                desc="プロジェクト節目で AI が事例化を提案"
              />
              <DerivativeItem
                icon={Sparkles}
                label="プロジェクト進捗 +2 件"
                desc="登録 6/10、内覧 18/20 に自動更新済"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            編集する
          </Button>
          <Button className="flex-1">
            <Check />
            日報として確定
          </Button>
        </div>
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
          <MessageSquare className="h-4 w-4 text-amber-600" />
          <h1 className="text-base font-bold">③ 夜の振り返り</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          AI が今日のアクションを把握しています。残りを補う質問にだけ答えてください。
        </p>
        <Progress value={progress} className="mt-3 h-1.5" />
        <div className="mt-1 text-[11px] text-muted-foreground">
          {stepIndex + 1} / {reviewQuestions.length}
        </div>
      </header>

      {/* Today's context */}
      <Card className="border-emerald-200 bg-emerald-50 flex-shrink-0">
        <CardContent>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <Sparkles className="h-3.5 w-3.5" />
            AI が把握している今日のアクション
          </div>
          <ul className="mt-2 space-y-1 text-xs text-emerald-900">
            {todaysActions.slice(0, 3).map((a) => (
              <li key={a.id}>
                <span className="font-mono mr-1">
                  {a.timestamp.slice(11, 16)}
                </span>
                {a.bodyMd.slice(0, 35)}…
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 flex-shrink-0">
        <CardContent>
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-amber-900">
                AI からの質問
              </div>
              <p className="mt-1 text-base font-bold leading-snug text-amber-950">
                {current.question}
              </p>
              {current.context && (
                <p className="mt-1 text-xs text-amber-700">{current.context}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1">
        <Textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="話して入力 or タップで入力(任意・スキップ可)"
          className="h-32 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="icon">
          <Mic />
        </Button>
        <Button variant="outline" className="flex-1" onClick={skip}>
          スキップ
        </Button>
        <Button
          className="flex-1"
          disabled={!currentInput.trim()}
          onClick={submit}
        >
          {stepIndex + 1 < reviewQuestions.length ? (
            <>
              次へ
              <ArrowRight />
            </>
          ) : (
            <>
              <Check />
              日報を生成
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function DerivativeItem({
  icon: Icon,
  label,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2">
      <div className="mt-0.5 rounded-md bg-background p-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
