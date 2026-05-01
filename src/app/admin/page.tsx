import Link from "next/link";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockMembers, statusBadge } from "@/lib/mock/data";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileCheck,
  Clock,
  Download,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const kpis = [
  {
    label: "担当隊員数",
    value: "5",
    unit: "名",
    delta: "+1",
    deltaPositive: true,
    icon: Users,
  },
  {
    label: "今月の日報投稿率",
    value: "82",
    unit: "%",
    delta: "+14pt",
    deltaPositive: true,
    icon: TrendingUp,
  },
  {
    label: "月次報告 提出済",
    value: "3",
    unit: "/ 5",
    delta: "2名 未提出",
    deltaPositive: false,
    icon: FileCheck,
  },
  {
    label: "平均作成時間削減",
    value: "-68",
    unit: "%",
    delta: "2.5h → 48分",
    deltaPositive: true,
    icon: Clock,
  },
];

const categoryDistribution = [
  { name: "移住促進", pct: 32 },
  { name: "農業・一次産業", pct: 24 },
  { name: "観光", pct: 18 },
  { name: "教育・子育て", pct: 12 },
  { name: "その他", pct: 14 },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <header className="border-b bg-card px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ダッシュボード</h1>
            <div className="text-xs text-muted-foreground">
              2026 年 4 月 / 最終更新 10 分前
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download />
              CSV 出力
            </Button>
            <Button size="sm">
              <FileText />
              月次報告 一括 DL
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-muted-foreground">
                      {k.label}
                    </div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{k.value}</span>
                    <span className="text-sm text-muted-foreground">
                      {k.unit}
                    </span>
                  </div>
                  <div
                    className={
                      k.deltaPositive
                        ? "mt-1 flex items-center gap-0.5 text-xs font-medium text-emerald-600"
                        : "mt-1 flex items-center gap-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {k.deltaPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {k.delta}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-sm font-semibold">担当隊員一覧</h2>
              <Button variant="link" size="sm" asChild>
                <Link href="/admin/members">すべて見る →</Link>
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 font-medium">隊員</th>
                  <th className="px-5 py-2 font-medium">着任</th>
                  <th className="px-5 py-2 font-medium">最終日報</th>
                  <th className="px-5 py-2 font-medium">今月レポート</th>
                  <th className="px-5 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockMembers.map((m) => {
                  const b = statusBadge(m.currentMonthStatus);
                  return (
                    <tr key={m.id} className="hover:bg-muted/40">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar
                            initials={m.initials}
                            className={`h-8 w-8 ${m.avatarColor}`}
                          />
                          <div>
                            <div className="font-medium">{m.fullName}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {m.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground">
                        {m.assignedAt}
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground">
                        {m.lastLogDate}
                      </td>
                      <td className="px-5 py-2.5">
                        <Badge variant="secondary" className={b.className}>
                          {b.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-2.5">
                        <Button variant="link" size="sm" asChild>
                          <Link href={`/admin/members/${m.id}` as Route}>
                            詳細 →
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card>
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-semibold">活動カテゴリ分布</h2>
              <div className="text-[11px] text-muted-foreground">
                今月の日報タグ
              </div>
            </div>
            <CardContent>
              <div className="space-y-3">
                {categoryDistribution.map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs">
                      <span>{c.name}</span>
                      <span className="font-semibold">{c.pct}%</span>
                    </div>
                    <Progress value={c.pct} className="mt-1 h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-violet-900">
                  AI インサイト(丹波篠山市)
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-violet-900">
                  <li>
                    ・今月は「**空き家バンク**」関連活動が前月比 +40%。田中・木村隊員が中心。
                  </li>
                  <li>
                    ・「**販路開拓**」に取り組む隊員が増加。県内他市町との連携機会あり。
                  </li>
                  <li>
                    ・未提出 2 名(山本・鈴木)は日報頻度も低下傾向。**面談を推奨**。
                  </li>
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 px-0 text-violet-700"
                  asChild
                >
                  <Link href="/admin/analytics">
                    詳しいサマリーを見る
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
