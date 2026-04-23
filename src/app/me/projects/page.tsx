import Link from "next/link";
import type { Route } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockProjects } from "@/lib/mock/data";
import { ChevronLeft, ChevronRight, Target, Sparkles, CheckCircle2, Plus } from "lucide-react";

function statusBadge(s: "active" | "completed" | "paused") {
  switch (s) {
    case "active":
      return { label: "進行中", className: "bg-emerald-100 text-emerald-800" };
    case "completed":
      return { label: "完了", className: "bg-slate-200 text-slate-700" };
    case "paused":
      return { label: "一時停止", className: "bg-amber-100 text-amber-800" };
  }
}

export default function ProjectsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Link href="/me" className="-ml-1 text-slate-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">私のプロジェクト</h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          活動をパッケージで可視化。日報・月次報告と自動連携します。
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Card className="mb-4 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardBody className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <p className="text-xs text-violet-900">
              AI があなたの日報からプロジェクトを自動提案。
              編集・承認すると、役場・県の俯瞰ビューにも反映されます。
            </p>
          </CardBody>
        </Card>

        <div className="space-y-3">
          {mockProjects.map((p) => {
            const b = statusBadge(p.status);
            return (
              <Link key={p.id} href={`/me/projects/${p.id}` as Route} className="block">
                <Card>
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-slate-400" />
                          <Badge className={b.className}>{b.label}</Badge>
                        </div>
                        <h3 className="mt-1 text-sm font-bold text-slate-900">
                          {p.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                          {p.summary}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{p.periodStart} 〜 {p.periodEnd}</span>
                        <span className="font-semibold text-slate-900">
                          {p.progress}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-600">
                      {p.tags.map((t) => (
                        <Badge key={t} className="bg-slate-100 text-slate-600">
                          #{t}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {p.milestones.filter((m) => m.done).length} / {p.milestones.length} マイルストーン
                      </span>
                      <span>・</span>
                      <span>日報 {p.linkedLogCount} 件紐付け</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-medium text-slate-600">
          <Plus className="h-4 w-4" />
          新しいプロジェクトを追加
        </button>
      </div>
    </div>
  );
}
