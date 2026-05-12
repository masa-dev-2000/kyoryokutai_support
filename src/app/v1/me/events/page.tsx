import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/lib/mock/data";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Video,
  Sparkles,
  Check,
} from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Link href="/v1/me" className="-ml-1 text-slate-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">全国イベント</h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          研修 / 交流会 / 勉強会 / 視察 を全国から集約
        </p>

        <div className="mt-3 flex gap-1 overflow-x-auto">
          {["すべて", "交流会", "研修", "視察", "オンライン", "兵庫県内"].map(
            (tag, i) => (
              <button
                key={tag}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                  i === 0
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tag}
              </button>
            ),
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Card className="mb-4 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardBody className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
            <p className="text-xs text-violet-900">
              AI があなたの活動タグ(移住促進・空き家・販路開拓)に合うイベントを優先表示しています。
            </p>
          </CardBody>
        </Card>

        <div className="space-y-3">
          {mockEvents.map((e) => (
            <Card key={e.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span className="font-semibold text-slate-900">
                        {e.startDate === e.endDate
                          ? e.startDate
                          : `${e.startDate} 〜 ${e.endDate}`}
                      </span>
                      {e.isOnline && (
                        <span className="ml-1 flex items-center gap-0.5 text-sky-700">
                          <Video className="h-3 w-3" />
                          オンライン可
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-slate-900">
                      {e.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {e.description}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3" />
                  <span>{e.location}</span>
                  <span className="mx-1">·</span>
                  <span>主催: {e.host}</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {e.tags.map((t) => (
                    <Badge key={t} className="bg-slate-100 text-slate-600">
                      #{t}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-rose-600">
                    申込締切 {e.deadline}
                  </span>
                  {e.joined ? (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <Check className="mr-1 h-3 w-3" />
                      参加予定
                    </Badge>
                  ) : (
                    <button className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                      詳細・申込
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          イベントを登録したい? 運営までご連絡ください。
        </p>
      </div>
    </div>
  );
}
