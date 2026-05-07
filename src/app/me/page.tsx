import Link from "next/link";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Flame,
  Pencil,
  Sparkles,
  FolderSearch,
  Wallet,
  FileText,
  ChevronRight,
  Target,
  CalendarDays,
  FlaskConical,
} from "lucide-react";
import {
  currentMember,
  mockMonthlyReport,
  mockBudget,
  mockContacts,
  mockProjects,
  mockEvents,
  statusBadge,
} from "@/lib/mock/data";

function formatJpy(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export default function MemberHomePage() {
  const report = mockMonthlyReport;
  const reportBadge = statusBadge(currentMember.currentMonthStatus);
  const budget = mockBudget;
  const used = Math.round((budget.used / budget.totalBudget) * 100);

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-5">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Avatar
          initials={currentMember.initials}
          className={`h-11 w-11 ${currentMember.avatarColor}`}
        />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">
            {currentMember.municipality} / {currentMember.role}
          </div>
          <div className="text-base font-bold">
            {currentMember.fullName} さん
          </div>
        </div>
      </header>

      {/* Lab banner (実験用UIへの導線) */}
      <Link href="/lab" className="block">
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 transition hover:bg-amber-100">
          <FlaskConical className="h-4 w-4 shrink-0 text-amber-700" />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-amber-900">🧪 ラボ</span>
            <span className="ml-1 text-amber-800">
              統合フロー(計画 / 実行 / 振り返り)を試す
            </span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-amber-700" />
        </div>
      </Link>

      {/* Streak */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
          <Flame className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-emerald-900">
            12 日連続で記録中
          </div>
          <div className="text-xs text-emerald-700">
            今月 {currentMember.thisMonthLogCount} / 30 日
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <Link href="/me/logs/new" className="block">
        <Card className="border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-emerald-100">
                今日の一歩
              </div>
              <div className="mt-1 text-lg font-bold">日報を書く</div>
              <div className="mt-0.5 text-xs text-emerald-100">
                テキスト・音声・写真、どれでも OK
              </div>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Pencil className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Quick actions */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          活動を広げる
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/me/assistant" className="block">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 p-0.5 shadow-md">
              <div className="flex h-full flex-col rounded-[calc(1rem-2px)] bg-card px-3 py-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700">
                    AI に相談
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  戦略レビュー / 提案準備 / キャリア / 悩み
                </p>
              </div>
            </div>
          </Link>

          <Link href="/me/cases" className="block">
            <Card className="h-full">
              <CardContent className="flex h-full flex-col py-3">
                <div className="flex items-center gap-1.5">
                  <FolderSearch className="h-4 w-4 text-foreground" />
                  <span className="text-xs font-semibold">事例を探す</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  全国の活動事例 / 役場提案の材料
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/me/projects" className="block">
            <Card className="h-full">
              <CardContent className="flex h-full flex-col py-3">
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold">私のプロジェクト</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  活動をパッケージで可視化 / 進捗管理
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/me/events" className="block">
            <Card className="h-full">
              <CardContent className="flex h-full flex-col py-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-semibold">全国イベント</span>
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  研修 / 交流会 / 視察 を集約
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Status */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          今月の状況
        </h2>
        <div className="space-y-3">
          <Link href={`/me/reports/${report.yearMonth}` as Route}>
            <Card>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {report.yearMonth} 月次報告
                    </div>
                    <div className="text-sm font-semibold">
                      AI ドラフト生成済
                    </div>
                    <div className="text-xs text-muted-foreground">
                      日報 {report.sourceLogCount} 件から
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={reportBadge.className}>
                    {reportBadge.label}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-100 p-2 text-teal-700">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {budget.fiscalYear} 年度 活動費
                    </div>
                    <div className="text-sm font-semibold">
                      残 {formatJpy(budget.totalBudget - budget.used)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatJpy(budget.used)} / {formatJpy(budget.totalBudget)}{" "}
                      ({used}%)
                    </div>
                  </div>
                </div>
              </div>
              <Progress value={used} className="mt-3 h-1.5" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            進行中のプロジェクト
          </h2>
          <Link
            href="/me/projects"
            className="text-xs font-medium text-primary"
          >
            すべて見る
          </Link>
        </div>
        <Card>
          <div className="divide-y">
            {mockProjects.slice(0, 2).map((p) => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-sm font-semibold">{p.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    {p.progress}%
                  </span>
                </div>
                <Progress value={p.progress} className="mt-2 h-1.5" />
                <div className="mt-1 text-[11px] text-muted-foreground">
                  日報 {p.linkedLogCount} 件紐付け / 〜{p.periodEnd}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Events */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            おすすめイベント
          </h2>
          <Link
            href="/me/events"
            className="text-xs font-medium text-primary"
          >
            すべて見る
          </Link>
        </div>
        <Card>
          <div className="divide-y">
            {mockEvents.slice(0, 2).map((e) => (
              <div key={e.id} className="flex items-start gap-3 px-5 py-3">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-sky-100 text-sky-900">
                  <span className="text-[10px]">
                    {e.startDate.slice(5, 7).replace(/^0/, "")}月
                  </span>
                  <span className="text-sm font-bold leading-tight">
                    {e.startDate.slice(8, 10).replace(/^0/, "")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {e.title}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {e.location} / {e.host}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
