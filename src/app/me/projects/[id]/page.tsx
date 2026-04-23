import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockProjects } from "@/lib/mock/data";
import { ChevronLeft, CheckCircle2, Circle, Sparkles, Target } from "lucide-react";

export function generateStaticParams() {
  return mockProjects.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const p = mockProjects.find((x) => x.id === id);
  if (!p) notFound();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/me/projects" className="-ml-1 text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-slate-500">プロジェクト</div>
          <h1 className="truncate text-sm font-bold text-slate-900">
            {p.name}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">
                {p.periodStart} 〜 {p.periodEnd}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{p.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.tags.map((t) => (
                <Badge key={t} className="bg-slate-100 text-slate-600">
                  #{t}
                </Badge>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">進捗</span>
                <span className="font-semibold text-slate-900">{p.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            マイルストーン
          </h2>
          <Card>
            <div className="divide-y divide-slate-100">
              {p.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {m.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                  <span
                    className={
                      m.done
                        ? "text-sm text-slate-500 line-through"
                        : "text-sm text-slate-800"
                    }
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            これまでの成果
          </h2>
          <Card>
            <CardBody>
              <ul className="space-y-2 text-sm text-slate-700">
                {p.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {o}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>

        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardBody>
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
              <div>
                <div className="text-xs font-semibold text-violet-900">
                  AI からのひとこと
                </div>
                <p className="mt-1 text-sm text-violet-900">
                  このプロジェクトは予定より 10 日先行しています。残りは「レストラン本契約」がボトルネック。
                  類似事例「第 3 セクター販路開拓」を参考に、週次のフォローアップで契約化確度を上げる提案をしてみてください。
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-xs text-slate-600">
            関連日報 <strong className="text-slate-900">{p.linkedLogCount} 件</strong> が自動紐付けされています。
            月次報告・役場提出時に、このプロジェクトから自動で文章生成できます。
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
