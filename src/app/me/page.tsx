import Link from "next/link";
import type { Route } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Flame, Pencil, Bell, FileText, MessageCircle, ChevronRight } from "lucide-react";
import {
  currentMember,
  mockAnnouncements,
  mockDailyLogs,
  mockMonthlyReport,
  statusBadge,
} from "@/lib/mock/data";

export default function MemberHomePage() {
  const unreadCount = mockAnnouncements.filter((a) => !a.read).length;
  const todayLog = mockDailyLogs[0];
  const report = mockMonthlyReport;
  const badge = statusBadge(currentMember.currentMonthStatus);

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

      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-3 text-sm">
        <Flame className="h-6 w-6 text-emerald-600" />
        <div>
          <div className="font-semibold text-emerald-900">
            12 日連続で記録中
          </div>
          <div className="text-xs text-emerald-700">
            今月は {currentMember.thisMonthLogCount} / 30 日
          </div>
        </div>
      </div>

      <Link href="/me/logs/new" className="block">
        <Card className="bg-brand-600 text-white shadow-lg shadow-brand-600/20">
          <CardBody className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-emerald-100">
                今日の日報
              </div>
              <div className="mt-1 text-base font-bold">
                まだ記入していません
              </div>
              <div className="mt-1 text-xs text-emerald-100">
                音声入力でも OK
              </div>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Pencil className="h-6 w-6" />
            </div>
          </CardBody>
        </Card>
      </Link>

      <Link href={`/me/reports/${report.yearMonth}` as Route}>
        <Card>
          <CardBody className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">
                  {report.yearMonth} 月次報告
                </div>
                <div className="mt-0.5 font-semibold text-slate-900">
                  AI ドラフト生成済
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  日報 {report.sourceLogCount} 件から作成
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge className={badge.className}>{badge.label}</Badge>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </CardBody>
        </Card>
      </Link>

      <Link href="/me/announcements" className="block">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="relative rounded-xl bg-amber-100 p-2 text-amber-700">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900">お知らせ</div>
                <div className="text-xs text-slate-500">
                  {unreadCount > 0 ? `未読 ${unreadCount} 件` : "未読なし"}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </CardBody>
        </Card>
      </Link>

      <Link href="/me/chat" className="block">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  役場担当とのチャット
                </div>
                <div className="text-xs text-slate-500">
                  新着メッセージ 1 件
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </CardBody>
        </Card>
      </Link>

      <section className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            最近の日報
          </h2>
          <Link
            href="/me/logs"
            className="text-xs font-medium text-brand-600"
          >
            すべて見る
          </Link>
        </div>
        <Card>
          {mockDailyLogs.slice(0, 3).map((log, i) => (
            <div
              key={log.id}
              className={i > 0 ? "border-t border-slate-100" : ""}
            >
              <CardBody className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-500">
                    {log.date} ({log.weekday})
                  </div>
                  <div className="mt-0.5 truncate text-sm font-medium text-slate-800">
                    {log.bodyMd.split("\n")[0]}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {log.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-slate-100 text-slate-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
              </CardBody>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
