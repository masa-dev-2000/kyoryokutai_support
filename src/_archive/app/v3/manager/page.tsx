import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Receipt,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockMembers } from "@/lib/mock/data";

const pendingApprovals = [
  {
    id: "a1",
    type: "経費",
    memberName: "田中 あかり",
    title: "空き家清掃用品 ¥4,820",
    aiAdvice: "適正",
    advice: "go" as const,
    summary: "ガードレール内・予算枠内・領収書添付済",
  },
  {
    id: "a2",
    type: "月次報告",
    memberName: "佐藤 美咲",
    title: "2026 年 4 月 月次報告",
    aiAdvice: "下書き完了",
    advice: "go" as const,
    summary: "活動 23 件から AI 生成、住民向け広報文も併記",
  },
  {
    id: "a3",
    type: "経費",
    memberName: "山本 健一",
    title: "出張(島根県視察)¥38,400",
    aiAdvice: "要確認",
    advice: "gray" as const,
    summary: "ガードレール「県外出張は事前承認」に該当・事前申請なし",
  },
];

const guardrailIncidents = [
  {
    id: "g1",
    severity: "warn" as const,
    member: "鈴木 悠人",
    text: "副業時間が今月 28h / 上限 20h を超過。隊員には自動通知済。",
  },
  {
    id: "g2",
    severity: "info" as const,
    member: "山本 健一",
    text: "日報投稿が 7 日途絶。AI が振り返り音声リクエストを送信済。",
  },
];

const reportShortcuts = [
  { id: "r1", label: "5 月議会 報告書", status: "AI 下書き済", date: "2026-05-18" },
  { id: "r2", label: "県 月次報告(4 月分)", status: "確定待ち", date: "2026-05-15" },
  { id: "r3", label: "総務省 年次活動報告", status: "10 月作成予定", date: "—" },
];

export default function V3ManagerHome() {
  const approvalCount = pendingApprovals.length;
  const memberCount = mockMembers.length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/v3"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          v3 ホームへ
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
              今週、見るべきことだけ。
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              2026-05-20 火 / 谷本 室長 さん / 担当隊員 {memberCount} 名
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              今週の所要時間(目安)
            </div>
            <div className="mt-1 text-2xl font-bold text-violet-700">約 12 分</div>
            <div className="text-[11px] text-slate-500">
              (うち承認 {approvalCount} 件 / 確認 2 件)
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat
            color="emerald"
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="今週、AI が処理済"
            value="47"
            unit="件"
            sub="日報整形・タグ付け・報告書下書き等"
          />
          <SummaryStat
            color="violet"
            icon={<Clock className="h-5 w-5" />}
            label="承認待ち"
            value={String(approvalCount)}
            unit="件"
            sub="経費 2 件 / 月次 1 件"
          />
          <SummaryStat
            color="amber"
            icon={<AlertTriangle className="h-5 w-5" />}
            label="ガードレール検知"
            value="2"
            unit="件"
            sub="うち自動対応済 2 件"
          />
          <SummaryStat
            color="sky"
            icon={<TrendingUp className="h-5 w-5" />}
            label="管理コスト(月)"
            value="1.2"
            unit="h"
            sub="導入前 7.5h → 84% 削減"
          />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* 承認待ち */}
          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                承認待ち({approvalCount})
              </h2>
              <span className="text-[11px] text-slate-400">
                ラボ:このプレビューだけ動作
              </span>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map((a) => (
                <ApprovalRow key={a.id} {...a} />
              ))}
            </div>
          </section>

          {/* ガードレール検知 */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                ガードレール検知
              </h2>
              <span className="text-[11px] text-slate-400">ルール 24 件</span>
            </div>
            <div className="space-y-3">
              {guardrailIncidents.map((g) => (
                <IncidentCard key={g.id} {...g} />
              ))}
              <Card className="border-dashed border-slate-300 bg-slate-50">
                <CardContent className="px-4 py-3 text-xs text-slate-500">
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
                  その他はすべて AI が自動対応済(隊員へ通知 / 期限延長 / 注意喚起 等)
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* 報告書ショートカット */}
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">自動レポート</h2>
            <span className="text-[11px] text-slate-400">月次 / 議会 / 県 / 国</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {reportShortcuts.map((r) => (
              <Card
                key={r.id}
                className="border-slate-200 bg-white transition hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-50 text-[10px] text-slate-600"
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-sm">{r.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-[11px] text-slate-500">
                    最終更新: {r.date}
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    下書きを開く
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI 要約 */}
        <section className="mt-10 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-violet-700 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-violet-950">
              <div className="font-semibold">
                AI からの今週の所感(週 1 回 月曜配信)
              </div>
              <p className="mt-1 text-violet-900">
                今週は経費承認 2 件、月次 1 件、ガードレール検知 2 件。
                山本さんの県外出張は事前申請が漏れているため、
                <strong className="text-violet-950">
                  「申請忘れの再発防止メッセージ」のドラフトを用意済
                </strong>
                です。承認時にワンクリックで送信できます。
                来週は議会用報告書の確定が控えています(5/27 締切)。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryStat({
  color,
  icon,
  label,
  value,
  unit,
  sub,
}: {
  color: "emerald" | "violet" | "amber" | "sky";
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  sub: string;
}) {
  const ringMap = {
    emerald: "ring-emerald-200 text-emerald-700 bg-emerald-50",
    violet: "ring-violet-200 text-violet-700 bg-violet-50",
    amber: "ring-amber-200 text-amber-700 bg-amber-50",
    sky: "ring-sky-200 text-sky-700 bg-sky-50",
  };
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </span>
          <span className={`rounded-lg p-1.5 ring-1 ${ringMap[color]}`}>
            {icon}
          </span>
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

function ApprovalRow({
  type,
  memberName,
  title,
  aiAdvice,
  advice,
  summary,
}: {
  type: string;
  memberName: string;
  title: string;
  aiAdvice: string;
  advice: "go" | "gray" | "stop";
  summary: string;
}) {
  const adviceStyle = {
    go: "border-emerald-200 bg-emerald-50 text-emerald-800",
    gray: "border-amber-200 bg-amber-50 text-amber-800",
    stop: "border-rose-200 bg-rose-50 text-rose-800",
  }[advice];
  const adviceIcon = {
    go: <CheckCircle2 className="h-3.5 w-3.5" />,
    gray: <AlertTriangle className="h-3.5 w-3.5" />,
    stop: <AlertTriangle className="h-3.5 w-3.5" />,
  }[advice];

  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {type === "経費" ? (
                  <Receipt className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                {type}
              </span>
              <span className="text-xs text-slate-500">{memberName}</span>
            </div>
            <div className="mt-1.5 text-sm font-semibold text-slate-900">
              {title}
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${adviceStyle}`}
            >
              {adviceIcon}
              AI 判定: {aiAdvice}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-slate-600">
              {summary}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline">
              詳細
            </Button>
            <Button size="sm" variant={advice === "go" ? "default" : "secondary"}>
              {advice === "go" ? "承認" : "確認して承認"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IncidentCard({
  severity,
  member,
  text,
}: {
  severity: "info" | "warn" | "stop";
  member: string;
  text: string;
}) {
  const sev = {
    info: {
      icon: <ShieldCheck className="h-4 w-4" />,
      color: "border-sky-200 bg-sky-50 text-sky-800",
    },
    warn: {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "border-amber-200 bg-amber-50 text-amber-900",
    },
    stop: {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "border-rose-200 bg-rose-50 text-rose-900",
    },
  }[severity];

  return (
    <Card className={`border ${sev.color}`}>
      <CardContent className="px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5">{sev.icon}</span>
          <div className="flex-1 text-xs">
            <div className="font-semibold">{member}</div>
            <div className="mt-1 leading-relaxed">{text}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
