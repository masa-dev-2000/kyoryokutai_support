import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockContacts, mockAnnouncements, formatJstDate } from "@/lib/mock/data";
import { Phone, Mail, Bell, ChevronRight } from "lucide-react";

export default function ContactPage() {
  const unread = mockAnnouncements.filter((a) => !a.read);
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-slate-900">連絡</h1>
        <p className="mt-1 text-xs text-slate-500">
          担当者への連絡と役場からのお知らせ
        </p>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
        <section>
          <h2 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            あなたの担当者 {mockContacts.length} 名
          </h2>
          <div className="space-y-2">
            {mockContacts.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex items-center gap-3">
                  <Avatar
                    initials={c.initials}
                    className={`h-11 w-11 ${c.avatarColor}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {c.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {c.department} / {c.role}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <a
                      href={`tel:${c.phone}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      aria-label={`${c.name}に電話`}
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                      aria-label={`${c.name}にメール`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          <p className="mt-2 px-1 text-xs text-slate-500">
            電話・メールは自動的に端末の標準アプリが起動します。
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Bell className="h-3.5 w-3.5" />
              役場からのお知らせ
            </h2>
            <Link
              href="/me/announcements"
              className="text-xs font-medium text-brand-600"
            >
              すべて見る
            </Link>
          </div>
          <div className="space-y-2">
            {mockAnnouncements.slice(0, 3).map((a) => (
              <Card key={a.id}>
                <CardBody className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {a.title}
                      </div>
                      {!a.read && (
                        <Badge className="bg-rose-100 text-rose-700">新着</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {a.authorName} / {formatJstDate(a.createdAt)}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                      {a.body}
                    </p>
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                </CardBody>
              </Card>
            ))}
          </div>
          {unread.length > 0 && (
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              未読 {unread.length} 件あります
            </div>
          )}
        </section>

        <p className="text-center text-xs text-slate-400">
          連絡・相談はまず電話で。記録として残したい内容は日報へ。
        </p>
      </div>
    </div>
  );
}
