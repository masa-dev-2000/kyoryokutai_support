import Link from "next/link";
import type { Route } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
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
    <div className="flex flex-col gap-4 px-5 pb-6 pt-5">
      <header className="flex items-center gap-3">
        <Avatar
          initials={currentMember.initials}
          className={`h-11 w-11 ${currentMember.avatarColor}`}
        />
        <div className="flex-1">
          <div className="text-xs text-slate-500">
            {currentMember.municipality} / {currentMember.role}
          </div>
          <div className="text-base font-bold text-slate-900">
            {currentMember.fullName} さん
          </div>
        </div>
      </header>

      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-3">
        <Flame className="h-6 w-6 text-emerald-600" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-emerald-900">
            12 日連続で記録中
          </div>
          <div className="text-xs text-emerald-700">
            今月 {currentMember.thisMonthLogCount} / 30 日
          </div>
        </div>
      </div>

      <Link href="/me/logs/new" className="block">
        <Card className="bg-brand-600 text-white shadow-lg shadow-brand-600/20">
          <CardBody className="flex items-center justify-between">
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
          </CardBody>
        </Card>
      </Link>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          活動を広げる
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/me/assistant" className="block">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 p-0.5 shadow-md">
              <div className="flex h-full flex-col rounded-[calc(1rem-2px)] bg-white px-3 py-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700">
                    AI に相談
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  戦略レビュー / 提案準備 / キャリア / 悩み
                </p>
              </div>
            </div>
          </Link>

          <Link href="/me/cases" className="block">
            <Card className="h-full">
              <CardBody className="flex h-full flex-col py-3">
                <div className="flex items-center gap-1.5">
                  <FolderSearch className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    事例を探す
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  全国の活動事例 / 役場提案の材料
                </p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/me/projects" className="block">
            <Card className="h-full">
              <CardBody className="flex h-full flex-col py-3">
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    私のプロジェクト
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  活動をパッケージで可視化 / 進捗管理
                </p>
              </CardBody>
            </Card>
          </Link>

          <Link href="/me/events" className="block">
            <Card className="h-full">
              <CardBody className="flex h-full flex-col py-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    全国イベント
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  研修 / 交流会 / 視察 を集約
                </p>
              </CardBody>
            </Card>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            進行中のプロジェクト
          </h2>
          <Link href="/me/projects" className="text-xs font-medium text-brand-600">
            すべて見る
          </Link>
        </div>
        <Card>
          <div className="divide-y divide-slate-100">
            {mockProjects.slice(0, 2).map((p) => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    {p.progress}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  日報 {p.linkedLogCount} 件紐付け / 〜{p.periodEnd}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            おすすめイベント
          </h2>
          <Link href="/me/events" className="text-xs font-medium text-brand-600">
            すべて見る
          </Link>
        </div>
        <Card>
          <div className="divide-y divide-slate-100">
            {mockEvents.slice(0, 2).map((e) => (
              <div key={e.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-sky-100 text-sky-900">
                    <span className="text-[10px]">
                      {e.startDate.slice(5, 7).replace(/^0/, "")}月
                    </span>
                    <span className="text-sm font-bold leading-tight">
                      {e.startDate.slice(8, 10).replace(/^0/, "")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {e.title}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {e.location} / 主催: {e.host}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          今月の状況
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <Link href={`/me/reports/${report.yearMonth}` as Route}>
            <Card>
              <CardBody className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      {report.yearMonth} 月次報告
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      AI ドラフト生成済
                    </div>
                    <div className="text-xs text-slate-500">
                      日報 {report.sourceLogCount} 件から
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={reportBadge.className}>
                    {reportBadge.label}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </CardBody>
            </Card>
          </Link>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-100 p-2 text-teal-700">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      {budget.fiscalYear} 年度 活動費
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      残 {formatJpy(budget.totalBudget - budget.used)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatJpy(budget.used)} / {formatJpy(budget.totalBudget)} 使用 ({used}%)
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500"
                  style={{ width: `${used}%` }}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            あなたの担当者
          </h2>
          <Link href="/me/chat" className="text-xs font-medium text-brand-600">
            すべて見る
          </Link>
        </div>
        <Card>
          <div className="divide-y divide-slate-100">
            {mockContacts.slice(0, 2).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <Avatar
                  initials={c.initials}
                  className={`h-9 w-9 ${c.avatarColor}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {c.name}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {c.department}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
