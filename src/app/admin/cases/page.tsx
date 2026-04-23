import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCases } from "@/lib/mock/data";
import { Search, Sparkles, MapPin, Download, FolderSearch } from "lucide-react";

export default function AdminCasesPage() {
  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">事例ライブラリ</h1>
            <div className="text-xs text-slate-500">
              全国の協力隊活動事例(匿名化)
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium">
            <Download className="h-4 w-4" />
            議会資料として出力
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="地域・活動・悩みで検索"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </header>

      <div className="space-y-4 p-8">
        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-violet-900">
                  当自治体向けにおすすめの事例
                </h3>
                <p className="mt-1 text-xs text-violet-700">
                  丹波篠山市の直近活動(空き家バンク・移住促進・販路開拓)から AI が選定しています。
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          {mockCases.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3" />
                  <span>{c.region}</span>
                  <span className="mx-1">·</span>
                  <span>{c.authorAnon}</span>
                  <span className="mx-1">·</span>
                  <span>{c.period}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {c.title}
                </h3>
                <p className="mt-1 text-sm text-slate-700">{c.summary}</p>
                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900">
                  ✨ 成果: {c.outcome}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.map((t) => (
                    <Badge key={t} className="bg-slate-100 text-slate-600">
                      #{t}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-brand-600">
                    <FolderSearch className="h-3 w-3" />
                    詳細
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
