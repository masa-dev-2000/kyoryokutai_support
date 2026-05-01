import Link from "next/link";
import type { Route } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Mic, Activity } from "lucide-react";

type LabExperiment = {
  id: string;
  title: string;
  href: Route;
  description: string;
  status: "active" | "draft" | "archived";
  variants: number;
  tags: string[];
};

const experiments: LabExperiment[] = [
  {
    id: "integrated-flow",
    title: "統合フロー(3 タッチポイント)",
    href: "/lab/integrated-flow",
    description:
      "ユーザーは「計画 / 実行 / 振り返り」だけ。日報・月報・事例・進捗・成果は AI が自動で組み立てる。",
    status: "active",
    variants: 4,
    tags: ["統合UX", "AI自動生成", "認知負荷ゼロ"],
  },
  {
    id: "action-log",
    title: "行動ベース記録",
    href: "/lab/action-log",
    description:
      "日報を書く代わりに、行動ごとに記録する方式。記憶の揮発を防ぐ。",
    status: "active",
    variants: 1,
    tags: ["記録方式", "音声", "AI 補完"],
  },
];

function statusBadge(s: LabExperiment["status"]) {
  switch (s) {
    case "active":
      return { label: "実験中", className: "bg-emerald-100 text-emerald-800" };
    case "draft":
      return { label: "下書き", className: "bg-slate-100 text-slate-600" };
    case "archived":
      return { label: "アーカイブ", className: "bg-slate-200 text-slate-500" };
  }
}

export default function LabIndex() {
  return (
    <div className="px-5 py-4 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">🧪 ラボ</h1>
        <p className="mt-1 text-xs text-slate-600">
          機能アイデアを試す場所。本番ページ(<code>/me</code>, <code>/admin</code>)とは独立しており、いつでも捨てられます。
        </p>
      </header>

      <Card>
        <CardBody>
          <h2 className="text-sm font-semibold text-slate-900">
            運用ルール
          </h2>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li>• 機能ごとにディレクトリ分け(<code>/lab/&lt;feature&gt;/</code>)</li>
            <li>• 各機能内で UI バリアント比較(<code>v1</code>, <code>v2</code>, ...)</li>
            <li>• 採用時は <code>/me</code> or <code>/admin</code> にコピー、ラボから削除</li>
          </ul>
        </CardBody>
      </Card>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          実験中の機能 ({experiments.length})
        </h2>
        <div className="space-y-3">
          {experiments.map((e) => {
            const b = statusBadge(e.status);
            return (
              <Link key={e.id} href={e.href} className="block">
                <Card>
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {e.title}
                          </h3>
                          <Badge className={b.className}>{b.label}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {e.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {e.tags.map((t) => (
                            <Badge
                              key={t}
                              className="bg-slate-100 text-slate-600"
                            >
                              #{t}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500">
                          バリアント {e.variants} 件
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
        <Activity className="mx-auto mb-1 h-5 w-5 text-slate-400" />
        新しい実験は <code>src/app/lab/&lt;feature&gt;/</code> に追加
      </section>
    </div>
  );
}
