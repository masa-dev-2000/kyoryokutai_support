"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockActions } from "@/lib/mock/data";
import {
  ChevronLeft,
  Mic,
  Pause,
  Activity,
  Sparkles,
  Pencil,
  Camera,
  Tag as TagIcon,
} from "lucide-react";

const stamps = [
  { icon: "🏠", label: "訪問" },
  { icon: "🌾", label: "農作業" },
  { icon: "🤝", label: "打合せ" },
  { icon: "📞", label: "相談対応" },
  { icon: "🚗", label: "移動" },
  { icon: "💡", label: "企画" },
];

export default function ExecutePage() {
  const [recording, setRecording] = useState(false);

  return (
    <div className="px-5 py-4 space-y-4">
      <Button variant="link" size="sm" className="-ml-2 px-2" asChild>
        <Link href="/lab/integrated-flow">
          <ChevronLeft />
          統合フローへ戻る
        </Link>
      </Button>

      <header>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          <h1 className="text-base font-bold">② タスク実行</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          現場で短く記録するだけ。プロジェクトには AI が自動で紐付け候補を提示
        </p>
      </header>

      {/* Active Project Banner */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-emerald-900">
            <Sparkles className="h-3.5 w-3.5" />
            アクティブプロジェクト:{" "}
            <strong>空き家バンク登録促進プロジェクト</strong>
          </div>
        </CardContent>
      </Card>

      {/* Quick Recording */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-4">
            <button
              onClick={() => setRecording(!recording)}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-xl transition active:scale-95 ${
                recording
                  ? "bg-rose-500 text-white"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {recording && (
                <span className="absolute inset-0 animate-ping rounded-full bg-rose-300 opacity-50" />
              )}
              {recording ? (
                <Pause className="relative h-7 w-7" />
              ) : (
                <Mic className="relative h-7 w-7" />
              )}
            </button>
            <div className="text-center">
              <div className="text-sm font-semibold">
                {recording ? "録音中..." : "マイクを押して話す"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                その場の出来事を 1 つだけ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t pt-3">
            <Button variant="outline" size="sm" className="h-auto flex-col gap-1 py-3">
              <Pencil />
              <span className="text-[11px]">テキスト</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-1 py-3">
              <Camera />
              <span className="text-[11px]">写真</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto flex-col gap-1 py-3">
              <TagIcon />
              <span className="text-[11px]">タグだけ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stamps */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          スタンプで一瞬記録
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {stamps.map((s) => (
            <button
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-xl border bg-card px-2 py-3 transition hover:bg-muted/40"
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[11px] font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's actions */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          今日の記録({mockActions.filter((a) => a.timestamp.startsWith("2026-04-23")).length} 件)
        </h2>
        <div className="space-y-2">
          {mockActions
            .filter((a) => a.timestamp.startsWith("2026-04-23"))
            .map((a) => (
              <Card key={a.id}>
                <CardContent>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">
                      {a.timestamp.slice(11, 16)}
                    </span>
                    {a.type === "voice" && (
                      <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                        <Mic className="mr-1 h-3 w-3" />
                        {a.duration}
                      </Badge>
                    )}
                    {a.aiCompleted && (
                      <Badge
                        variant="secondary"
                        className="bg-violet-100 text-violet-700"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI 補完済
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm">{a.bodyMd}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-[10px] bg-secondary text-muted-foreground"
                      >
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
            <p>
              夜の振り返りで、AI がこれら 4 件を確認しながら不足を聞き返してくれます。
              書き残したモレを補うので、日報の完成度が一段上がります。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
