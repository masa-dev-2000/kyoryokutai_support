import Link from "next/link";
import type { Route } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight, Sparkles } from "lucide-react";

type ReportRow = {
  ym: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  aiGenerated: boolean;
  submittedOn?: string;
};

const reports: ReportRow[] = [
  { ym: "2026-04", status: "draft", aiGenerated: true },
  { ym: "2026-03", status: "approved", aiGenerated: true, submittedOn: "2026-04-05" },
  { ym: "2026-02", status: "approved", aiGenerated: false, submittedOn: "2026-03-04" },
  { ym: "2026-01", status: "approved", aiGenerated: false, submittedOn: "2026-02-03" },
  { ym: "2025-12", status: "approved", aiGenerated: false, submittedOn: "2026-01-05" },
];

function statusBadge(s: ReportRow["status"]) {
  switch (s) {
    case "approved":
      return { label: "承認済", className: "bg-emerald-100 text-emerald-800" };
    case "submitted":
      return { label: "提出済", className: "bg-sky-100 text-sky-800" };
    case "draft":
      return { label: "ドラフト", className: "bg-amber-100 text-amber-800" };
    case "rejected":
      return { label: "差戻し", className: "bg-rose-100 text-rose-800" };
  }
}

export default function ReportsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-slate-900">月次レポート</h1>
        <p className="mt-1 text-xs text-slate-500">
          AI が日報をもとに月次報告を下書きします
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-2">
          {reports.map((r) => {
            const badge = statusBadge(r.status);
            return (
              <Link
                key={r.ym}
                href={`/v1/me/reports/${r.ym}` as Route}
                className="block"
              >
                <Card>
                  <CardBody className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {r.ym.replace("-", " 年 ")} 月
                        </div>
                        {r.aiGenerated && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-violet-700">
                            <Sparkles className="h-3 w-3" />
                            AI 生成
                          </div>
                        )}
                        {r.submittedOn && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            提出: {r.submittedOn}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={badge.className}>{badge.label}</Badge>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
