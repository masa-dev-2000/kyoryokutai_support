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
import { planConversation, planResultPreview } from "@/lib/mock/data";
import {
  ChevronLeft,
  Sparkles,
  Send,
  Check,
  Target,
  Mic,
  RotateCcw,
} from "lucide-react";

const aiTurns = planConversation.filter((t) => t.speaker === "ai");

export default function PlanPage() {
  const [turnIndex, setTurnIndex] = useState(0);
  const [history, setHistory] = useState<
    { speaker: "ai" | "user"; body: string }[]
  >([{ speaker: "ai", body: aiTurns[0].body }]);
  const [currentInput, setCurrentInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [capturedKeys, setCapturedKeys] = useState<string[]>([]);

  const current = aiTurns[turnIndex];
  const progress = ((turnIndex + 1) / aiTurns.length) * 100;

  const respond = (answer: string) => {
    const newHistory = [...history, { speaker: "user" as const, body: answer }];
    setCurrentInput("");

    if (current.capturedField) {
      setCapturedKeys((prev) =>
        prev.includes(current.capturedField!)
          ? prev
          : [...prev, current.capturedField!],
      );
    }

    if (turnIndex + 1 < aiTurns.length) {
      const nextAi = aiTurns[turnIndex + 1];
      newHistory.push({ speaker: "ai", body: nextAi.body });
      setHistory(newHistory);
      setTurnIndex(turnIndex + 1);
    } else {
      setHistory(newHistory);
      setCompleted(true);
    }
  };

  const useExample = () => {
    if (current?.userExample) setCurrentInput(current.userExample);
  };

  const reset = () => {
    setTurnIndex(0);
    setHistory([{ speaker: "ai", body: aiTurns[0].body }]);
    setCurrentInput("");
    setCompleted(false);
    setCapturedKeys([]);
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
            {planResultPreview.name}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            会話から AI が「目標 / KPI / 効果測定 / リスク」を整理しました。
          </p>
        </header>

        <Card className="border-primary/30">
          <CardContent className="space-y-4">
            <SummaryRow
              label="きっかけ"
              value={planResultPreview.topic}
            />
            <SummaryRow
              label="解きたい課題"
              value={planResultPreview.purpose}
            />
            <SummaryRow
              label="目指す未来(目標)"
              value={planResultPreview.outcome}
            />
            <Separator />
            <SummaryRow label="期間" value={planResultPreview.duration} />
            <div>
              <Label className="text-xs text-muted-foreground">
                成功指標(KPI)
              </Label>
              <ul className="mt-1.5 space-y-1 text-sm">
                {planResultPreview.metric.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <SummaryRow label="進め方" value={planResultPreview.method} />
            <div>
              <Label className="text-xs text-muted-foreground">
                想定リスク
              </Label>
              <ul className="mt-1.5 space-y-1 text-sm">
                {planResultPreview.risk.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
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
                  <li>類似事例 2 件(C-001 司法書士同席 / C-003 高齢所有者交渉)を計画と一緒に保存しました</li>
                  <li>最初の 1 ヶ月は週次で「登録交渉件数」を確認することをおすすめ</li>
                  <li>若年層リスト課題が出てきたら、別プロジェクトとして派生させましょう</li>
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
              <li>毎日のアクション → AIがこのプロジェクトに紐付け候補を提示</li>
              <li>夜の振り返り → KPI に紐付けて進捗集計</li>
              <li>月次報告 / 事例 / 成果発表 → AI が文脈込みで自動生成</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 py-4 gap-3 min-h-[calc(100vh-120px)]">
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
          AI が会話で「やりたいこと」を引き出し、計画として整理します
        </p>
        <Progress value={progress} className="mt-3 h-1.5" />
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {turnIndex + 1} / {aiTurns.length}
          </span>
          <span>把握済み: {capturedKeys.length} 項目</span>
        </div>
      </header>

      {/* Conversation history (scrollable) */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl bg-muted/40 p-3">
        {history.map((turn, i) => (
          <ChatBubble key={i} speaker={turn.speaker} body={turn.body} />
        ))}
      </div>

      {/* Input area */}
      <div className="space-y-2">
        {current?.hint && (
          <div className="text-[11px] text-muted-foreground px-1">
            💡 {current.hint}
          </div>
        )}

        <Textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="話して入力 or タップで入力"
          className="h-20 resize-none"
        />

        {current?.userExample && (
          <button
            onClick={useExample}
            className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-left text-[11px] text-muted-foreground hover:bg-muted/60 w-full"
          >
            <span className="font-semibold">回答例:</span> {current.userExample}
          </button>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Mic />
          </Button>
          <Button
            className="flex-1"
            disabled={!currentInput.trim()}
            onClick={() => respond(currentInput)}
          >
            {turnIndex + 1 < aiTurns.length ? (
              <>
                返信
                <Send />
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
    </div>
  );
}

function ChatBubble({
  speaker,
  body,
}: {
  speaker: "ai" | "user";
  body: string;
}) {
  if (speaker === "ai") {
    return (
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">
          {body}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-md shadow-primary/20">
        {body}
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
