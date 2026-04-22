import { Card, CardBody } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { mockAnnouncements, formatJstDate } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export default function AnnouncementsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-slate-900">お知らせ</h1>
        <p className="mt-1 text-xs text-slate-500">役場からの配信一覧</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {mockAnnouncements.map((a) => (
          <Card key={a.id}>
            <CardBody>
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 rounded-xl p-2",
                    a.read ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700",
                  )}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-slate-900">
                      {a.title}
                      {!a.read && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-rose-500" />
                      )}
                    </div>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {a.authorName} / {formatJstDate(a.createdAt)}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {a.body}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
