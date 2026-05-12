import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles, Pencil, Send, Clock } from "lucide-react";
import { mockMonthlyReport } from "@/lib/mock/data";

type Props = { params: Promise<{ ym: string }> };

export function generateStaticParams() {
  return [
    { ym: "2026-04" },
    { ym: "2026-03" },
    { ym: "2026-02" },
    { ym: "2026-01" },
    { ym: "2025-12" },
  ];
}

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="mt-5 text-base font-bold text-slate-900">
          {line.slice(3)}
        </h2>,
      );
      i++;
    } else if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="mt-3 text-sm font-semibold text-slate-800">
          {line.slice(4)}
        </h3>,
      );
      i++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={i} className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-800">
          {items.map((it, k) => (
            <li key={k}>{it}</li>
          ))}
        </ul>,
      );
    } else if (line.trim() === "") {
      i++;
    } else {
      nodes.push(
        <p key={i} className="mt-1 text-sm leading-relaxed text-slate-800">
          {line}
        </p>,
      );
      i++;
    }
  }
  return nodes;
}

export default async function ReportDetailPage({ params }: Props) {
  const { ym } = await params;
  const report = mockMonthlyReport;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <Link
          href="/v1/me/reports"
          className="flex items-center gap-1 text-sm text-slate-600"
        >
          <ChevronLeft className="h-5 w-5" />
          戻る
        </Link>
        <div className="text-sm font-semibold">{ym} 月次報告</div>
        <button className="text-sm font-medium text-brand-600">
          <Pencil className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-900">
              AI が日報 {report.sourceLogCount} 件から作成
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-violet-700">
            <Clock className="h-3 w-3" />
            所要 3 秒 / 従来の月次報告作成時間 平均 2.5 時間
          </div>
        </div>

        <article className="mt-4">{renderMarkdown(report.body)}</article>

        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
          このドラフトは AI により自動生成されています。内容を確認のうえ、
          編集してから提出してください。
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            役場からのフィードバック(先月分の例)
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                山
              </span>
              <span className="font-medium">山田 総務課長</span>
              <span>/ 2026 年 3 月分を承認</span>
            </div>
            <div className="mt-2 space-y-1 text-slate-800">
              <p>
                <strong>評価できる点</strong>: 空き家バンク登録 6 件は大きな成果。
              </p>
              <p>
                <strong>改善提案</strong>: 販路開拓は関係課と連携の機会を増やせそう。
              </p>
              <p>
                <strong>来月の期待</strong>: レストラン本契約、成功を祈っています。
              </p>
            </div>
            <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900">
              承認時に**コメント必須**。役場から声が返ってくる仕組みです。
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-200 bg-white px-5 py-3">
        <Button variant="secondary" size="lg">
          <Pencil className="h-4 w-4" />
          編集する
        </Button>
        <Button size="lg">
          <Send className="h-4 w-4" />
          市に提出する
        </Button>
      </div>
    </div>
  );
}
