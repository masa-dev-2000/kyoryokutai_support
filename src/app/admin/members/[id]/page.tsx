import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  mockMembers,
  mockDailyLogs,
  mockMonthlyReport,
  mockBudget,
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
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <Link
          href="/admin/members"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          隊員一覧に戻る
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <Avatar
            initials={m.initials}
            className={`h-14 w-14 text-lg ${m.avatarColor}`}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {m.fullName}
              </h1>
              <Badge className={b.className}>{b.label}</Badge>
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {m.municipality} / {m.role} / 着任 {m.assignedAt} 〜 {m.termEndAt}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium">
              <Phone className="h-3.5 w-3.5" />
              電話
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium">
              <Mail className="h-3.5 w-3.5" />
              メール
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6 p-8">
        {/* Left: profile + budget */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardBody>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                活動概要
              </h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">今月 日報数</span>
                  <span className="font-semibold text-slate-900">
                    {m.thisMonthLogCount} 件
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">最終日報</span>
                  <span className="font-semibold text-slate-900">
                    {m.lastLogDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">連続記録</span>
                  <span className="font-semibold text-slate-900">
                    12 日
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                活動費(2026 年度)
              </h3>
              <div className="mt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">使用率</span>
                  <span className="font-semibold text-slate-900">
                    {budgetUsedPct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${budgetUsedPct}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  {formatJpy(mockBudget.used)} / {formatJpy(mockBudget.totalBudget)}
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs">
                {mockBudget.categories.map((c) => (
                  <div key={c.name} className="flex justify-between">
                    <span className="text-slate-600">{c.name}</span>
                    <span className="tabular-nums text-slate-800">
                      {formatJpy(c.used)} / {formatJpy(c.budget)}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardBody>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <div className="text-xs text-amber-900">
                  <div className="font-semibold">未承認の月次報告があります</div>
                  <div className="mt-1">
                    2026 年 4 月分のドラフトが提出されました。下部でレビュー・承認してください。
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: daily logs + monthly approval */}
        <div className="col-span-2 space-y-6">
          {/* Monthly approval panel */}
          <Card>
            <div className="border-b border-slate-100 px-5 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  月次報告レビュー({report.yearMonth})
                </h3>
                <Badge className="bg-violet-100 text-violet-800">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI 生成ドラフト
                </Badge>
              </div>
            </div>
            <CardBody>
              <details className="rounded-lg border border-slate-200">
                <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  報告書ドラフトを開く(日報 {report.sourceLogCount} 件を集約)
                </summary>
                <div className="border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-800 whitespace-pre-line">
                  {report.body}
                </div>
              </details>

              <div className="mt-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  承認前フィードバック(必須)
                </h4>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    ① 評価できる点{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    className="h-16 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="例: 空き家バンク登録 6 件は大きな成果"
                    defaultValue="空き家バンク登録 6 件は大きな成果。現地案内から移住確定へ繋がった点も素晴らしい。"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    ② 改善提案(任意)
                  </label>
                  <textarea
                    className="h-16 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="関係課と連携の機会を作りましょう 等"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    ③ 来月の期待(任意)
                  </label>
                  <textarea
                    className="h-16 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="レストラン本契約の成功を期待 等"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    ①評価できる点の記入が**必須**。空のままでは承認できません。
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    差戻し
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20">
                    <Check className="h-4 w-4" />
                    承認する
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Daily log timeline */}
          <Card>
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                日報タイムライン(直近)
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {mockDailyLogs.map((log) => (
                <div key={log.id} className="px-5 py-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-baseline gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">
                        {log.date}
                      </span>
                      <span>({log.weekday})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      {log.hasVoice && <Mic className="h-3 w-3" />}
                      {log.imageCount > 0 && (
                        <span className="flex items-center gap-0.5">
                          <ImageIcon className="h-3 w-3" />
                          {log.imageCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                    {log.bodyMd}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {log.tags.map((t) => (
                      <Badge key={t} className="bg-slate-100 text-slate-600">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick message */}
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-slate-900">
                個別お知らせ送信
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {m.fullName} さんにメッセージを送ります(電話・メール運用と併用)
              </p>
              <textarea
                className="mt-3 h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="メッセージを入力..."
              />
              <div className="mt-2 flex justify-end">
                <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                  <Send className="h-4 w-4" />
                  送信
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
