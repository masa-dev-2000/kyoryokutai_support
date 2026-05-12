import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mockAnnouncements,
  mockMembers,
  formatJstDate,
} from "@/lib/mock/data";
import { Plus, Eye, Send, Users } from "lucide-react";

export default function AdminAnnouncementsPage() {
  return (
    <div>
      <header className="border-b bg-card px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">お知らせ配信</h1>
            <div className="text-xs text-muted-foreground">
              隊員 {mockMembers.length} 名に一斉配信 or 個別選択
            </div>
          </div>
          <Button asChild>
            <Link href="/v1/admin/announcements/new">
              <Plus />
              新規配信
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    今月 配信済
                  </div>
                  <div className="text-xl font-bold">
                    {mockAnnouncements.length}
                    <span className="ml-0.5 text-xs text-muted-foreground">
                      件
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    平均 既読率
                  </div>
                  <div className="text-xl font-bold">
                    84
                    <span className="ml-0.5 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary p-2 text-foreground">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">配信対象</div>
                  <div className="text-xl font-bold">
                    {mockMembers.length}
                    <span className="ml-0.5 text-xs text-muted-foreground">
                      名
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold">配信履歴</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">タイトル</th>
                <th className="px-5 py-3 font-medium">配信日時</th>
                <th className="px-5 py-3 font-medium">対象</th>
                <th className="px-5 py-3 font-medium">既読 / 未読</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockAnnouncements.map((a, i) => {
                const read = mockMembers.length - (i === 0 ? 3 : i === 1 ? 1 : 0);
                const readPct = (read / mockMembers.length) * 100;
                return (
                  <tr key={a.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="font-medium">{a.title}</div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {a.body}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatJstDate(a.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary">
                        全隊員({mockMembers.length} 名)
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-emerald-700">
                        {read}
                      </span>{" "}
                      / {mockMembers.length}
                      <Progress value={readPct} className="mt-1 h-1 w-20" />
                    </td>
                    <td className="px-5 py-3">
                      <Button variant="link" size="sm">
                        詳細
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
