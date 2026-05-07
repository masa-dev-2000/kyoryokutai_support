import Link from "next/link";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Activity,
  Sparkles,
  Home,
  Mic,
  ArrowRight,
  Target,
  MessageSquare,
} from "lucide-react";

type LabExperiment = {
  id: string;
  title: string;
  href: Route;
  description: string;
  status: "active" | "draft" | "archived";
  highlight?: string;
  variants: { label: string; href: Route; isPrimary?: boolean }[];
  tags: string[];
};

const experiments: LabExperiment[] = [
  {
    id: "integrated-flow",
    title: "統合フロー(3 タッチポイント)",
    href: "/lab/integrated-flow",
    description:
      "ユーザーは「計画 / 実行 / 振り返り」だけ。日報・月報・事例・進捗・成果は AI が自動で組み立てる。",
    status: "active",
    highlight: "認知負荷ゼロ・情報棄損ゼロを目指す統合UX",
    variants: [
      {
        label: "コンセプト全体図",
        href: "/lab/integrated-flow",
        isPrimary: true,
      },
      { label: "① プロジェクト計画", href: "/lab/integrated-flow/plan" },
      { label: "② タスク実行", href: "/lab/integrated-flow/execute" },
      { label: "③ 夜の振り返り", href: "/lab/integrated-flow/review" },
      { label: "自動生成物のショーケース", href: "/lab/integrated-flow/outputs" },
    ],
    tags: ["統合UX", "AI自動生成", "対話型計画", "対話型振り返り"],
  },
  {
    id: "action-log",
    title: "行動ベース記録",
    href: "/lab/action-log",
    description:
      "日報を書く代わりに、行動ごとに記録する方式。記憶の揮発を防ぐ。",
    status: "active",
    variants: [
      { label: "バリアント比較", href: "/lab/action-log", isPrimary: true },
      {
        label: "v3. 音声 + AI 質問(MVP 候補)",
        href: "/lab/action-log/v3-voice",
      },
      { label: "v1. ミニポスト型", href: "/lab/action-log/v1-post" },
      { label: "v2. スタンプ型", href: "/lab/action-log/v2-stamp" },
    ],
    tags: ["記録方式", "音声", "AI 補完", "スタンプ"],
  },
];

function statusBadge(s: LabExperiment["status"]) {
  switch (s) {
    case "active":
      return { label: "実験中", className: "bg-emerald-100 text-emerald-800" };
    case "draft":
      return { label: "下書き", className: "bg-secondary text-muted-foreground" };
    case "archived":
      return { label: "アーカイブ", className: "bg-secondary text-muted-foreground" };
  }
}

export default function LabIndex() {
  return (
    <div className="space-y-5 px-5 py-4">
      <header>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          🧪 ラボ
        </Badge>
        <h1 className="mt-2 text-2xl font-bold">実験用 UI 一覧</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          機能アイデアを検証する場所。本番(<code>/me</code>, <code>/admin</code>)とは独立。
        </p>
      </header>

      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home />
                トップ
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/me">
                <Mic />
                隊員アプリ
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <Activity />
                役場画面
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          実験中の機能 ({experiments.length})
        </h2>

        {experiments.map((e) => {
          const b = statusBadge(e.status);
          return (
            <Card key={e.id} className="overflow-hidden">
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{e.title}</h3>
                      <Badge variant="secondary" className={b.className}>
                        {b.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {e.description}
                    </p>
                    {e.highlight && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                        <Sparkles className="h-3 w-3" />
                        {e.highlight}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {e.tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px] bg-secondary text-muted-foreground"
                    >
                      #{t}
                    </Badge>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1.5">
                  {e.variants.map((v) => (
                    <Link key={v.href} href={v.href} className="block">
                      <div
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 transition hover:bg-muted/50 ${
                          v.isPrimary ? "border-primary/30 bg-primary/5" : ""
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            v.isPrimary ? "font-semibold" : ""
                          }`}
                        >
                          {v.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-dashed">
        <CardContent className="text-xs text-muted-foreground">
          <strong>運用ルール</strong>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>
              機能ごとに <code>/lab/&lt;feature&gt;/</code> でディレクトリ分け
            </li>
            <li>
              UI バリアント比較(<code>v1</code>, <code>v2</code>, …)
            </li>
            <li>
              採用時は <code>/me</code> または <code>/admin</code> にコピー、ラボから削除
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
