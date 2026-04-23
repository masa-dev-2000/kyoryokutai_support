import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAnnouncements, mockMembers, formatJstDate } from "@/lib/mock/data";
import { Plus, Eye, Send, Users } from "lucide-react";

export default function AdminAnnouncementsPage() {
  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              お知らせ配信
            </h1>
            <div className="text-xs text-slate-500">
              隊員 {mockMembers.length} 名に一斉配信 or 個別選択
            </div>
          </div>
          <Link
            href="/admin/announcements/new"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/20"
          >
            <Plus className="h-4 w-4" />
            新規配信
          </Link>
        </div>
      </header>

      <div className="space-y-6 p-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">今月 配信済</div>
                  <div className="text-xl font-bold">
                    {mockAnnouncements.length}
                    <span className="ml-0.5 text-xs text-slate-400">件</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">平均 既読率</div>
                  <div className="text-xl font-bold">
                    84<span className="ml-0.5 text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">配信対象</div>
                  <div className="text-xl font-bold">
                    {mockMembers.length}
                    <span className="ml-0.5 text-xs text-slate-400">名</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* List */}
        <Card>
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">配信履歴</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">タイトル</th>
                <th className="px-5 py-3 font-medium">配信日時</th>
                <th className="px-5 py-3 font-medium">対象</th>
                <th className="px-5 py-3 font-medium">既読 / 未読</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockAnnouncements.map((a, i) => {
                const read = mockMembers.length - (i === 0 ? 3 : i === 1 ? 1 : 0);
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">
                        {a.title}
                      </div>
                      <div className="line-clamp-1 text-xs text-slate-500">
                        {a.body}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatJstDate(a.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge className="bg-slate-100 text-slate-700">
                        全隊員({mockMembers.length} 名)
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <span className="font-semibold text-emerald-700">
                        {read}
                      </span>
                      {" "}
                      / {mockMembers.length}
                      <div className="mt-0.5 h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(read / mockMembers.length) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-xs font-medium text-brand-600">
                        詳細
                      </button>
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
