import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Sparkles,
  MapPin,
  Calendar,
  Target,
} from "lucide-react";

const trendWeeks = [
  { label: "第1週", posts: 12 },
  { label: "第2週", posts: 18 },
  { label: "第3週", posts: 24 },
  { label: "第4週", posts: 32 },
];

const topTags = [
  { name: "移住促進", count: 18 },
  { name: "空き家バンク", count: 12 },
  { name: "農業", count: 10 },
  { name: "販路開拓", count: 7 },
  { name: "観光", count: 5 },
];

const regionActivity = [
  { name: "丹波篠山市", active: 3, posts: 52 },
  { name: "養父市", active: 2, posts: 24 },
  { name: "朝来市", active: 1, posts: 18 },
];

export default function AdminAnalyticsPage() {
  const maxPosts = Math.max(...trendWeeks.map((t) => t.posts));
  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-xl font-bold text-slate-900">活動サマリー</h1>
        <div className="text-xs text-slate-500">
          2026 年 4 月 / 丹波篠山市 + 近隣自治体
        </div>
      </header>

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">総日報投稿</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-1 text-3xl font-bold">86</div>
              <div className="text-xs text-emerald-600">+28% 前月比</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">アクティブ隊員</span>
                <Target className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-1 text-3xl font-bold">4 / 5</div>
              <div className="text-xs text-slate-500">80%</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">平均稼働日数</span>
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-1 text-3xl font-bold">17.2</div>
              <div className="text-xs text-slate-500">/ 月</div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">週次トレンド</h3>
            </div>
            <CardBody>
              <div className="flex h-40 items-end gap-4">
                {trendWeeks.map((w) => (
                  <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                    <div className="text-[11px] font-semibold text-slate-700">
                      {w.posts}
                    </div>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400"
                      style={{ height: `${(w.posts / maxPosts) * 100}%` }}
                    />
                    <div className="text-[11px] text-slate-500">{w.label}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold">人気タグ TOP5</h3>
            </div>
            <CardBody>
              <div className="space-y-2.5">
                {topTags.map((t) => (
                  <div key={t.name}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700">{t.name}</span>
                      <span className="font-semibold text-slate-900">
                        {t.count} 件
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${(t.count / topTags[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-semibold">近隣自治体との比較</h3>
            <p className="text-[11px] text-slate-500">
              匿名化された活動データ(opt-in した自治体のみ)
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">自治体</th>
                <th className="px-5 py-2.5 font-medium">アクティブ隊員</th>
                <th className="px-5 py-2.5 font-medium">今月投稿数</th>
                <th className="px-5 py-2.5 font-medium">1人あたり</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regionActivity.map((r, i) => (
                <tr key={r.name} className="hover:bg-slate-50">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {r.name}
                      {i === 0 && (
                        <Badge className="ml-1 bg-brand-100 text-brand-700">
                          あなた
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-slate-700">{r.active}</td>
                  <td className="px-5 py-2.5 text-slate-700">{r.posts}</td>
                  <td className="px-5 py-2.5 font-semibold text-slate-900">
                    {(r.posts / r.active).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-violet-900">
                  AI によるレポート(議会向けドラフト)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-violet-900">
                  当月、本市の協力隊は **総活動日数 86 日**(前月比 +28%)を記録し、特に空き家バンク関連で 6 件の成約に繋がりました。隣接する養父・朝来両市と比較して**1 人あたりの活動密度が 1.2 倍**と高水準。集計結果は 4 月議会報告資料として自動作成・エクスポートできます。
                </p>
                <button className="mt-3 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white">
                  議会報告 PDF を生成
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
