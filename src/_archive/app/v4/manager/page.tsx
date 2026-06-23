import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  TrendingUp,
  Users,
  Clock,
  Bot,
  FileText,
  Quote,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const approvalQueue = [
  {
    id: "p1",
    memberName: "田中 あかり",
    type: "活動相談",
    title: "古民家コワーキング試作の活動費利用",
    aiSummary:
      "活動拠点としての賃借料は対象になり得る(JOIN Q&A 引用)。海士町に類似事例あり。スモールスタート案: 月 2 回 3 時間の短期賃借から開始。",
    citationCount: 2,
    suggested: "approve" as const,
  },
  {
    id: "p2",
    memberName: "佐藤 美咲",
    type: "月次報告",
    title: "2026 年 5 月 月次報告(自動生成)",
    aiSummary:
      "活動 23 件から AI 生成、住民広報文も併記。前月比で観光イベント +50%、空き家関連 +20%。",
    citationCount: 0,
    suggested: "approve" as const,
  },
  {
    id: "p3",
    memberName: "山本 健一",
    type: "経費",
    title: "島根県視察 出張費 ¥38,400",
    aiSummary:
      "ガードレール『県外出張は事前承認』に該当・事前申請なし。隊員側に再発防止メッセージのドラフト用意済。",
    citationCount: 1,
    suggested: "review" as const,
  },
];

const kpiOverview = [
  {
    label: "役場介入時間(月)",
    value: "1.2",
    unit: "h",
    sub: "導入前 7.5h → 84% 削減",
    color: "emerald",
  },
  {
    label: "AI 自動処理率",
    value: "82",
    unit: "%",
    sub: "申請・記録の自動整形",
    color: "sky",
  },
  {
    label: "隊員プロジェクト数",
    value: "11",
    unit: "件",
    sub: "前月比 +3 件",
    color: "violet",
  },
  {
    label: "関係人口インパクト",
    value: "284",
    unit: "人",
    sub: "イベント参加 + 移住相談",
    color: "amber",
  },
] as const;

export default function V4ManagerHome() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/v4"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          v4 ホームへ
        </Link>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-100 text-violet-900 hover:bg-violet-100">
                <Building2 className="mr-1 h-3 w-3" />
                管理職モード
              </Badge>
              <Badge variant="outline" className="border-slate-300 bg-white text-slate-600">
                新温泉町役場 / 企画課
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              承認するだけ。
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              2026-06-10 火 / 谷本 室長 さん / 担当隊員 5 名 / AI が判定材料を整え済み
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              今週の所要時間(目安)
            </div>
            <div className="mt-1 text-2xl font-bold text-violet-700">約 8 分</div>
            <div className="text-[11px] text-slate-500">
              v3 比 -33%(AI 判定材料拡充による)
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpiOverview.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                承認待ち({approvalQueue.length})
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <Bot className="h-3 w-3" />
                AI が事前に判定材料を整理済み
              </span>
            </div>
            <div className="space-y-3">
              {approvalQueue.map((q) => (
                <ApprovalCard key={q.id} {...q} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              自動レポート(下書き済)
            </h2>
            <div className="space-y-3">
              <ReportCard
                title="6 月議会 報告書"
                status="AI 下書き済"
                lastUpdate="2026-06-08"
              />
              <ReportCard
                title="県 月次報告(5 月分)"
                status="確定待ち"
                lastUpdate="2026-06-05"
              />
              <ReportCard
                title="関係人口レポート"
                status="自動更新中"
                lastUpdate="2026-06-09"
              />
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-violet-700 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-violet-950">
              <div className="font-semibold">
                AI からの今週の所感
              </div>
              <p className="mt-1 text-violet-900">
                今週は活動相談 1 件、月次 1 件、経費 1 件(要確認)。
                田中さんの古民家コワーキング案は <strong className="text-violet-950">海士町の類似事例</strong> と <strong className="text-violet-950">JOIN Q&A の引用</strong> で判断材料を整理済み。承認時はスモールスタート案 (月 2 回 3 時間の短期賃借) からの段階提案も自動でコメント付与できます。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  color: "emerald" | "violet" | "amber" | "sky";
}) {
  const map = {
    emerald: { ring: "ring-emerald-200 text-emerald-700 bg-emerald-50", icon: <Clock className="h-5 w-5" /> },
    violet: { ring: "ring-violet-200 text-violet-700 bg-violet-50", icon: <Users className="h-5 w-5" /> },
    sky: { ring: "ring-sky-200 text-sky-700 bg-sky-50", icon: <Bot className="h-5 w-5" /> },
    amber: { ring: "ring-amber-200 text-amber-700 bg-amber-50", icon: <TrendingUp className="h-5 w-5" /> },
  } as const;
  const m = map[color];
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </span>
          <span className={`rounded-lg p-1.5 ring-1 ${m.ring}`}>{m.icon}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
          <span className="text-sm text-slate-500">{unit}</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">{sub}</div>
      </CardContent>
    </Card>
  );
}

function ApprovalCard({
  memberName,
  type,
  title,
  aiSummary,
  citationCount,
  suggested,
}: {
  memberName: string;
  type: string;
  title: string;
  aiSummary: string;
  citationCount: number;
  suggested: "approve" | "review";
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <FileText className="h-3 w-3" />
                {type}
              </span>
              <span className="text-xs text-slate-500">{memberName}</span>
            </div>
            <div className="mt-1.5 text-sm font-semibold text-slate-900">
              {title}
            </div>
            <div className="mt-2 flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-800">AI の判定材料</div>
                <div className="mt-0.5 leading-relaxed">{aiSummary}</div>
                {citationCount > 0 && (
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <Quote className="h-2.5 w-2.5" />
                    引用 {citationCount} 件あり
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline">
              詳細
            </Button>
            <Button
              size="sm"
              variant={suggested === "approve" ? "default" : "secondary"}
            >
              {suggested === "approve" ? (
                <>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  承認
                </>
              ) : (
                "確認して承認"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportCard({
  title,
  status,
  lastUpdate,
}: {
  title: string;
  status: string;
  lastUpdate: string;
}) {
  return (
    <Card className="border-slate-200 bg-white transition hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <FileText className="h-4 w-4 text-slate-500" />
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-50 text-[10px] text-slate-600"
          >
            {status}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-[11px] text-slate-500">最終更新: {lastUpdate}</div>
        <Button variant="outline" size="sm" className="mt-3 w-full">
          下書きを開く <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
