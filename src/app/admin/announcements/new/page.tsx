import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockMembers } from "@/lib/mock/data";
import { ChevronLeft, Send, Sparkles } from "lucide-react";

export default function NewAnnouncementPage() {
  return (
    <div>
      <header className="border-b bg-card px-8 py-5">
        <Button variant="link" size="sm" className="-ml-2 px-2" asChild>
          <Link href="/admin/announcements">
            <ChevronLeft />
            お知らせ一覧に戻る
          </Link>
        </Button>
        <h1 className="mt-3 text-xl font-bold">新規お知らせ配信</h1>
      </header>

      <div className="grid grid-cols-3 gap-6 p-8">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  placeholder="例: 5 月の全体ミーティングについて"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="body">本文</Label>
                <Textarea
                  id="body"
                  className="h-40"
                  placeholder="内容を入力してください。Markdown も使えます。"
                />
                <Button variant="link" size="sm" className="px-0 text-violet-700">
                  <Sparkles />
                  AI に文面を整えてもらう
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                配信対象
              </h3>
              <div className="mt-3 space-y-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-primary bg-emerald-50 px-3 py-2">
                  <input type="radio" name="scope" defaultChecked />
                  <span className="text-sm font-semibold">
                    全隊員({mockMembers.length} 名)
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2">
                  <input type="radio" name="scope" />
                  <span className="text-sm">個別選択</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline">下書き保存</Button>
            <Button>
              <Send />
              配信する
            </Button>
          </div>
        </div>

        <aside className="col-span-1">
          <Card>
            <div className="border-b px-5 py-3">
              <h3 className="text-sm font-semibold">配信対象プレビュー</h3>
              <p className="text-xs text-muted-foreground">全員に届きます</p>
            </div>
            <div className="max-h-[500px] divide-y overflow-y-auto">
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
                    <div className="truncate text-sm font-medium">
                      {m.fullName}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
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
