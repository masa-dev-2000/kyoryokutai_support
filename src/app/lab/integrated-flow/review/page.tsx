"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { reviewConversation, mockActions } from "@/lib/mock/data";
import {
  ChevronLeft,
  Sparkles,
  Send,
  Check,
  MessageSquare,
  Mic,
  FileText,
  Bookmark,
  RotateCcw,
} from "lucide-react";

const aiTurns = reviewConversation.filter((t) => t.speaker === "ai");

export default function ReviewPage() {
  const [turnIndex, setTurnIndex] = useState(0);
  const [history, setHistory] = useState<
    { speaker: "ai" | "user"; body: string }[]
  >([{ speaker: "ai", body: aiTurns[0].body }]);
  const [currentInput, setCurrentInput] = useState("");
  const [completed, setCompleted] = useState(false);

  const current = aiTurns[turnIndex];
  const progress = ((turnIndex + 1) / aiTurns.length) * 100;
  const todaysActions = mockActions.filter((a) =>
    a.timestamp.startsWith("2026-04-23"),
  );

  const respond = (answer: string) => {
    const newHistory = [...history, { speaker: "user" as const, body: answer }];
    setCurrentInput("");

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
            行動 {todaysActions.length} 件 + 振り返り会話 から AI が組み立て
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
                <strong>午前</strong>: 市役所打合せ。広報誌寄稿(1500 字・テーマ「移住の決め手」)、締切 5/10 と確定。
              </p>
              <p>
                <strong>午後</strong>: 山の芋・岡田さん宅(14:05)で収穫予定 800kg を確認、レストラン試作品 2kg を 5/10 までに発送、5/15 ディナーで使用予定。
              </p>
              <p>
                <strong>夕方</strong>: 篠山地区の田中さん(78 歳)訪問(16:42)。空き家登録に前向き。来週水曜午後、司法書士・佐藤先生同席で再訪問予定。所有者の懸念は「相続のときの手間」。
              </p>
              <Separator className="my-2 bg-violet-200" />
              <p>
                <strong>所感(ハイライト)</strong>:
                司法書士同席で田中さんが安心された場面が印象的。
                高齢者には「相続周りの専門家がいる」という安心感が登録を進める鍵になりそう。
              </p>
              <p>
                <strong>課題</strong>:
                登録交渉が高齢者ばかりで時間がかかる。若年層所有者へのアプローチ手段が今後の課題。
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
              <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                #広報・情報発信
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
                desc="ハイライト発言から AI が事例化を提案"
              />
              <DerivativeItem
                icon={Sparkles}
                label="プロジェクト進捗 +2 件"
                desc="登録予定 +1、内覧予定 +1 に自動更新済"
              />
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
            日報として確定
          </Button>
        </div>
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
          <MessageSquare className="h-4 w-4 text-amber-600" />
          <h1 className="text-base font-bold">③ 夜の振り返り</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          AI が今日のアクションを 1 件ずつ深掘りします
        </p>
        <Progress value={progress} className="mt-3 h-1.5" />
        <div className="mt-1 text-[11px] text-muted-foreground">
          {turnIndex + 1} / {aiTurns.length}
        </div>
      </header>

      {/* Conversation history (scrollable) */}
      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl bg-muted/40 p-3">
        {history.map((turn, i) => (
          <ChatBubble key={i} speaker={turn.speaker} body={turn.body} />
        ))}

        {/* Source indicator (data AI is referencing) */}
        {current?.source && (
          <div className="ml-9 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 px-3 py-2 text-[11px]">
            <div className="flex items-center gap-1 font-semibold text-emerald-900">
              <Sparkles className="h-3 w-3" />
              AI が参照しているデータ
            </div>
            <div className="mt-0.5 text-emerald-800">
              <strong>{current.source.label}</strong>: {current.source.detail}
            </div>
          </div>
        )}
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
          placeholder="話して入力 or タップで入力(スキップ可)"
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
            variant="outline"
            className="flex-1"
            onClick={() => respond("(スキップ)")}
          >
            スキップ
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
                日報を生成
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
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
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
