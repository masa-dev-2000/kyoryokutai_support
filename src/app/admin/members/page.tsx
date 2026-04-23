import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { mockMembers, statusBadge } from "@/lib/mock/data";
import { Search, Filter, Plus, ChevronRight } from "lucide-react";

export default function AdminMembersPage() {
  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">隊員一覧</h1>
            <div className="text-xs text-slate-500">
              {mockMembers.length} 名 / 丹波篠山市
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              <Filter className="h-4 w-4" />
              フィルタ
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              <Plus className="h-4 w-4" />
              隊員を追加
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="名前・担当・活動分野で検索"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex gap-1 text-xs">
            <button className="rounded-full bg-slate-900 px-3 py-1 text-white">
              すべて
            </button>
            <button className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              未提出あり
            </button>
            <button className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              活動低下
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <Card>
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">隊員</th>
                <th className="px-5 py-3 font-medium">着任 / 満了</th>
                <th className="px-5 py-3 font-medium">今月 日報数</th>
                <th className="px-5 py-3 font-medium">最終日報</th>
                <th className="px-5 py-3 font-medium">今月レポート</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockMembers.map((m) => {
                const b = statusBadge(m.currentMonthStatus);
                return (
                  <tr key={m.id} className="group hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={m.initials}
                          className={`h-10 w-10 ${m.avatarColor}`}
                        />
                        <div>
                          <div className="font-medium text-slate-900">
                            {m.fullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {m.role} / {m.municipality}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div>{m.assignedAt}</div>
                      <div className="text-xs text-slate-400">
                        〜 {m.termEndAt}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-900 font-semibold">
                        {m.thisMonthLogCount}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        / 22 日間
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {m.lastLogDate}
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={b.className}>{b.label}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/members/${m.id}` as Route}
                        className="flex items-center gap-1 text-xs font-medium text-brand-600 opacity-0 transition group-hover:opacity-100"
                      >
                        詳細
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
