import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockDailyLogs } from "@/lib/mock/data";
import { Plus, Search, Mic, ImageIcon } from "lucide-react";

export default function LogsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">日報</h1>
          <Link
            href="/v1/me/logs/new"
            className="flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white shadow-md shadow-brand-600/20"
          >
            <Plus className="h-4 w-4" />
            新規
          </Link>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="キーワード・タグで検索"
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>2026 年 4 月</span>
          <span>{mockDailyLogs.length} 件</span>
        </div>
        <div className="space-y-3">
          {mockDailyLogs.map((log) => (
            <Card key={log.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5 text-xs text-slate-500">
                    <span className="text-base font-bold text-slate-900">
                      {new Date(log.date).getDate()}
                    </span>
                    <span>({log.weekday})</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    {log.hasVoice && <Mic className="h-3.5 w-3.5" />}
                    {log.imageCount > 0 && (
                      <span className="flex items-center gap-0.5 text-xs">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {log.imageCount}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                  {log.bodyMd}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {log.tags.map((tag) => (
                    <Badge key={tag} className="bg-slate-100 text-slate-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Button variant="secondary" className="mt-6 w-full">
          もっと読み込む
        </Button>
      </div>
    </div>
  );
}
