import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { mockMembers } from "@/lib/mock/data";
import { ChevronLeft, Send, Sparkles } from "lucide-react";

export default function NewAnnouncementPage() {
  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <Link
          href="/admin/announcements"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          お知らせ一覧に戻る
        </Link>
        <h1 className="mt-3 text-xl font-bold text-slate-900">
          新規お知らせ配信
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-6 p-8">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardBody>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                タイトル
              </label>
              <input
                type="text"
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="例: 5 月の全体ミーティングについて"
              />

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                本文
              </label>
              <textarea
                className="mt-2 h-40 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="内容を入力してください。Markdown も使えます。"
              />
              <div className="mt-2 flex items-center gap-1 text-xs text-violet-700">
                <Sparkles className="h-3 w-3" />
                AI に文面を整えてもらう
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                配信対象
              </h3>
              <div className="mt-3 space-y-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-brand-500 bg-brand-50 px-3 py-2">
                  <input type="radio" name="scope" defaultChecked />
                  <span className="text-sm font-semibold text-slate-900">
                    全隊員({mockMembers.length} 名)
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <input type="radio" name="scope" />
                  <span className="text-sm text-slate-700">
                    個別選択
                  </span>
                </label>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              下書き保存
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
              <Send className="h-4 w-4" />
              配信する
            </button>
          </div>
        </div>

        <aside className="col-span-1">
          <Card>
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                配信対象プレビュー
              </h3>
              <p className="text-xs text-slate-500">
                全員に届きます
              </p>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {mockMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-5 py-2.5"
                >
                  <Avatar
                    initials={m.initials}
                    className={`h-8 w-8 ${m.avatarColor}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {m.fullName}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">
                      {m.municipality}
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
