import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  mockMembers,
  mockDailyLogs,
  mockMonthlyReport,
  mockBudget,
  mockProjects,
  statusBadge,
} from "@/lib/mock/data";
import {
  ChevronLeft,
  Phone,
  Mail,
  Sparkles,
  Send,
  AlertCircle,
  Check,
  FileText,
  Mic,
  ImageIcon,
  Target,
} from "lucide-react";

export function generateStaticParams() {
  return mockMembers.map((m) => ({ id: m.id }));
}

type Props = { params: Promise<{ id: string }> };

function formatJpy(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export default async function AdminMemberDetailPage({ params }: Props) {
  const { id } = await params;
  const m = mockMembers.find((x) => x.id === id);
  if (!m) notFound();

  const b = statusBadge(m.currentMonthStatus);
  const report = mockMonthlyReport;
  const budgetUsedPct = Math.round(
    (mockBudget.used / mockBudget.totalBudget) * 100,
  );

  return (
    <div>
      <header className="border-b bg-card px-8 py-5">
        <Button variant="link" size="sm" className="-ml-2 px-2" asChild>
          <Link href="/admin/members">
            <ChevronLeft />
            隊員一覧に戻る
          </Link>
        </Button>
        <div className="mt-3 flex items-center gap-4">
          <Avatar
            initials={m.initials}
            className={`h-14 w-14 text-lg ${m.avatarColor}`}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{m.fullName}</h1>
              <Badge variant="secondary" className={b.className}>
                {b.label}
              </Badge>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {m.municipality} / {m.role} / 着任 {m.assignedAt} 〜 {m.termEndAt}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Phone />
              電話
            </Button>
            <Button variant="outline" size="sm">
              <Mail />
              メール
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 p-8">
        {/* Left */}
        <aside className="col-span-1 space-y-4">
          <Card>
            <CardContent>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                活動概要
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">今月 日報数</dt>
                  <dd className="font-semibold">{m.thisMonthLogCount} 件</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">最終日報</dt>
                  <dd className="font-semibold">{m.lastLogDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">連続記録</dt>
                  <dd className="font-semibold">12 日</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                活動費(2026 年度)
              </h3>
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">使用率</span>
                  <span className="font-semibold">{budgetUsedPct}%</span>
                </div>
                <Progress value={budgetUsedPct} className="mt-2 h-2" />
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {formatJpy(mockBudget.used)} /{" "}
                  {formatJpy(mockBudget.totalBudget)}
                </div>
              </div>
              <Separator className="my-3" />
              <ul className="space-y-1.5 text-xs">
                {mockBudget.categories.map((c) => (
                  <li key={c.name} className="flex justify-between">
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="tabular-nums">
                      {formatJpy(c.used)} / {formatJpy(c.budget)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <div className="text-xs text-amber-900">
                  <div className="font-semibold">
                    未承認の月次報告があります
                  </div>
                  <div className="mt-1">
                    2026 年 4 月分のドラフトが提出されました。下部でレビュー・承認してください。
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right */}
        <section className="col-span-2 space-y-6">
          <Tabs defaultValue="approval" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="approval" className="flex-1">
                月次レビュー
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex-1">
                プロジェクト ({mockProjects.length})
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex-1">
                日報
              </TabsTrigger>
              <TabsTrigger value="message" className="flex-1">
                個別連絡
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approval" className="space-y-4">
              <Card>
                <div className="flex items-center justify-between border-b px-5 py-3">
                  <h3 className="text-sm font-semibold">
                    月次報告レビュー({report.yearMonth})
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-violet-100 text-violet-800"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI 生成ドラフト
                  </Badge>
                </div>
                <CardContent>
                  <details className="rounded-lg border">
                    <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium hover:bg-muted/40">
                      報告書ドラフトを開く(日報 {report.sourceLogCount}{" "}
                      件を集約)
                    </summary>
                    <div className="border-t px-4 py-3 text-sm leading-relaxed whitespace-pre-line">
                      {report.body}
                    </div>
                  </details>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      承認前フィードバック(必須)
                    </h4>
                    <div className="space-y-1">
                      <Label htmlFor="praise">
                        ① 評価できる点{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="praise"
                        className="h-16"
                        placeholder="例: 空き家バンク登録 6 件は大きな成果"
                        defaultValue="空き家バンク登録 6 件は大きな成果。現地案内から移住確定へ繋がった点も素晴らしい。"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="improve">② 改善提案(任意)</Label>
                      <Textarea
                        id="improve"
                        className="h-16"
                        placeholder="関係課と連携の機会を作りましょう 等"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="next">③ 来月の期待(任意)</Label>
                      <Textarea
                        id="next"
                        className="h-16"
                        placeholder="レストラン本契約の成功を期待 等"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                      <Sparkles className="h-3.5 w-3.5" />
                      ① 評価できる点の記入が**必須**。空のままでは承認できません。
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        差戻し
                      </Button>
                      <Button size="sm" className="bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700">
                        <Check />
                        承認する
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <Card>
                <div className="border-b px-5 py-3">
                  <h3 className="text-sm font-semibold">
                    活動プロジェクト({mockProjects.length} 件)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    日報・月次と自動連携
                  </p>
                </div>
                <div className="divide-y">
                  {mockProjects.map((p) => (
                    <div key={p.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="font-semibold">{p.name}</span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {p.summary}
                          </p>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {p.periodStart} 〜 {p.periodEnd} / 日報{" "}
                            {p.linkedLogCount} 件
                          </div>
                        </div>
                        <div className="w-28 shrink-0">
                          <div className="flex justify-end text-xs font-semibold text-emerald-700">
                            {p.progress}%
                          </div>
                          <Progress
                            value={p.progress}
                            className="mt-1 h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <div className="border-b px-5 py-3">
                  <h3 className="text-sm font-semibold">
                    日報タイムライン(直近)
                  </h3>
                </div>
                <div className="divide-y">
                  {mockDailyLogs.map((log) => (
                    <div key={log.id} className="px-5 py-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-baseline gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="font-semibold text-foreground">
                            {log.date}
                          </span>
                          <span>({log.weekday})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.hasVoice && <Mic className="h-3 w-3" />}
                          {log.imageCount > 0 && (
                            <span className="flex items-center gap-0.5">
                              <ImageIcon className="h-3 w-3" />
                              {log.imageCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">
                        {log.bodyMd}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {log.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="bg-secondary text-muted-foreground"
                          >
                            #{t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="message">
              <Card>
                <CardContent>
                  <h3 className="text-sm font-semibold">個別お知らせ送信</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.fullName}{" "}
                    さんにメッセージを送ります(電話・メール運用と併用)
                  </p>
                  <Textarea
                    className="mt-3 h-24"
                    placeholder="メッセージを入力..."
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm">
                      <Send />
                      送信
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
