import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockMembers, statusBadge } from "@/lib/mock/data";
import { Search, Filter, Plus, ChevronRight } from "lucide-react";

export default function AdminMembersPage() {
  return (
    <div>
      <header className="border-b bg-card px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">隊員一覧</h1>
            <div className="text-xs text-muted-foreground">
              {mockMembers.length} 名 / 丹波篠山市
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter />
              フィルタ
            </Button>
            <Button size="sm">
              <Plus />
              隊員を追加
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="名前・担当・活動分野で検索"
              className="h-9 pl-9"
            />
          </div>
          <div className="flex gap-1 text-xs">
            <Button variant="default" size="sm" className="h-7 rounded-full px-3">
              すべて
            </Button>
            <Button variant="outline" size="sm" className="h-7 rounded-full px-3">
              未提出あり
            </Button>
            <Button variant="outline" size="sm" className="h-7 rounded-full px-3">
              活動低下
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <Card>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">隊員</th>
                <th className="px-5 py-3 font-medium">着任 / 満了</th>
                <th className="px-5 py-3 font-medium">今月 日報数</th>
                <th className="px-5 py-3 font-medium">最終日報</th>
                <th className="px-5 py-3 font-medium">今月レポート</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockMembers.map((m) => {
                const b = statusBadge(m.currentMonthStatus);
                return (
                  <tr key={m.id} className="group hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={m.initials}
                          className={`h-10 w-10 ${m.avatarColor}`}
                        />
                        <div>
                          <div className="font-medium">{m.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.role} / {m.municipality}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <div>{m.assignedAt}</div>
                      <div className="text-xs">〜 {m.termEndAt}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold">
                        {m.thisMonthLogCount}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        / 22 日間
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {m.lastLogDate}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className={b.className}>
                        {b.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button
                        variant="link"
                        size="sm"
                        className="opacity-0 transition group-hover:opacity-100"
                        asChild
                      >
                        <Link href={`/v1/admin/members/${m.id}` as Route}>
                          詳細
                          <ChevronRight />
                        </Link>
                      </Button>
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
