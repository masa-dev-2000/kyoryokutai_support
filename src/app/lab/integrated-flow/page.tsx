import Link from "next/link";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Target,
  Activity,
  MessageSquare,
  ArrowRight,
  Sparkles,
  FileText,
  TrendingUp,
  Bookmark,
  Presentation,
} from "lucide-react";

const touchpoints = [
  {
    id: "plan",
    href: "/lab/integrated-flow/plan",
    label: "① プロジェクト計画",
    icon: Target,
    color: "from-violet-500 to-indigo-500",
    description: "AI と対話で目標・KPI・効果測定を設計",
    frequency: "着任時 / 新規事業時",
  },
  {
    id: "execute",
    href: "/lab/integrated-flow/execute",
    label: "② タスク実行",
    icon: Activity,
    color: "from-emerald-500 to-teal-500",
    description: "現場で短く記録(音声・スタンプ・写真)",
    frequency: "日中・随時",
  },
  {
    id: "review",
    href: "/lab/integrated-flow/review",
    label: "③ 夜の振り返り",
    icon: MessageSquare,
    color: "from-amber-500 to-orange-500",
    description: "AI が質問、答えるだけで日報の素材ができる",
    frequency: "夜・1日 5 分",
  },
];

const outputs = [
  { label: "日報", icon: FileText, desc: "毎日自動生成" },
  { label: "月次報告", icon: FileText, desc: "月末に AI が組み立て" },
  { label: "プロジェクト進捗", icon: TrendingUp, desc: "目標 vs 実績を常時更新" },
  { label: "事例", icon: Bookmark, desc: "節目で AI が事例化" },
  { label: "成果発表", icon: Presentation, desc: "終了時に資料を生成" },
];

export default function IntegratedFlowConcept() {
  return (
    <div className="px-5 py-4 space-y-5">
      <Button variant="link" size="sm" className="-ml-2 px-2" asChild>
        <Link href="/lab">
          <ChevronLeft />
          ラボへ戻る
        </Link>
      </Button>

      <header>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          ✨ 統合フロー(3 タッチポイント)
        </Badge>
        <h1 className="mt-2 text-2xl font-bold leading-tight">
          ユーザーは 3 つだけやる。
          <br />
          残りは AI が組み立てる。
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          認知負荷を最小にしながら、情報の棄損ゼロで全アウトプットを揃える設計。
        </p>
      </header>

      {/* 3 Touchpoints */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          ユーザーがやる 3 つ
        </h2>
        <div className="space-y-3">
          {touchpoints.map((tp, i) => {
            const Icon = tp.icon;
            return (
              <Link key={tp.id} href={tp.href as Route} className="block">
                <Card className="transition hover:shadow-md">
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 rounded-2xl bg-gradient-to-br ${tp.color} p-3 text-white shadow-md`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold">{tp.label}</h3>
                          <Badge variant="secondary" className="text-[10px]">
                            {tp.frequency}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {tp.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Auto Outputs */}
      <section>
        <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          AI が自動で組み立てるもの
        </h2>
        <Link href="/lab/integrated-flow/outputs" className="block">
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 transition hover:shadow-md">
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-center">
                {outputs.map((o) => {
                  const Icon = o.icon;
                  return (
                    <div key={o.label} className="flex flex-col items-center gap-1">
                      <div className="rounded-xl bg-white/70 p-2 text-violet-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-[11px] font-semibold text-violet-900">
                        {o.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-3 bg-violet-200" />
              <p className="text-xs text-violet-900">
                ユーザーは閲覧するだけ。必要なら編集・公開承認のワンクリック。
              </p>
              <div className="mt-2 flex items-center justify-end gap-1 text-xs font-medium text-violet-700">
                自動生成のサンプルを見る
                <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      <Separator />

      {/* Strategic position */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          戦略的位置付け
        </h2>
        <Card>
          <CardContent className="text-xs space-y-2 text-muted-foreground">
            <p>
              <strong className="text-foreground">既存の入力負担(日報・月次・事例・プロジェクト・成果)</strong> を
              <strong className="text-foreground"> 3 タッチポイントに集約</strong>。
              入力箇所を減らしながら、出力の情報量と質は維持・向上。
            </p>
            <p>
              <strong className="text-foreground">JOIN の Excel</strong>:
              ダウンロードして閉じるだけ
            </p>
            <p>
              <strong className="text-foreground">kintone</strong>:
              フォーム化された記録(入力負担は減らない)
            </p>
            <p>
              <strong className="text-primary">本サービス</strong>:
              対話で集めた素材から AI が組み立てる(構造的に他者真似不可)
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          各画面を見る
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {touchpoints.map((tp) => {
            const Icon = tp.icon;
            return (
              <Button key={tp.id} variant="outline" asChild className="justify-start">
                <Link href={tp.href as Route}>
                  <Icon />
                  {tp.label.replace(/^[①②③]\s*/, "")}
                </Link>
              </Button>
            );
          })}
          <Button variant="outline" asChild className="col-span-2 justify-start">
            <Link href="/lab/integrated-flow/outputs">
              <Sparkles />
              自動生成物のショーケース
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
