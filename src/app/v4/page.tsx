import Link from "next/link";
import {
  ChevronLeft,
  Building2,
  UserCircle2,
  Bot,
  Sparkles,
  BookOpen,
  Database,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function V4HubPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          トップへ戻る
        </Link>

        <header className="mt-6 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
              v4 / AI = 第三の当事者
            </Badge>
            <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
              ラボ実装
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            協力隊に "AI の先輩" がつく。
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            記録すれば月報も議会報告も勝手に整い、迷えば <strong className="text-slate-900">3 つの視点</strong> でアドバイスがくる。役場は判断するだけ。
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            v3 は「管理職が動かなくても回る」、v4 は <strong>「AI が第三の当事者として参加する」</strong>。AI = メンター + ガードレール + 複数視点を与える第三者。
          </p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <EntryCard
            href="/v4/member"
            badge="協力隊 / 従業員"
            badgeColor="bg-emerald-100 text-emerald-900"
            icon={<UserCircle2 className="h-6 w-6" />}
            title="隊員モード"
            sub="AI メンターと一緒に動く"
            bullets={[
              "話せば記録 → 日報・月報・経費が勝手に整う",
              "「これってやっていい?」で 3 視点の助言が返る",
              "過去隊員の事例を引いて回答",
            ]}
            accent="emerald"
          />
          <EntryCard
            href="/v4/manager"
            badge="役場 / 管理者"
            badgeColor="bg-violet-100 text-violet-900"
            icon={<Building2 className="h-6 w-6" />}
            title="管理職モード"
            sub="承認するだけ"
            bullets={[
              "AI が判定材料を整え、承認ボタン 1 つで完了",
              "議会・県・国 報告書は AI 下書き済み",
              "KPI ダッシュボードで自治体への説明も即対応",
            ]}
            accent="violet"
          />
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            v4 の核となる 4 つの仕組み
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PillarCard
              icon={<Database className="h-5 w-5" />}
              title="A. 収集と配信"
              body="1 記録 → N 出力。日報・月報・議会・県・国まで自動。"
              color="text-emerald-700 bg-emerald-50 ring-emerald-200"
            />
            <PillarCard
              icon={<Sparkles className="h-5 w-5" />}
              title="B. 合意形成"
              body="3 視点 + スモールスタート案で擦り合わせを高速化。"
              color="text-sky-700 bg-sky-50 ring-sky-200"
            />
            <PillarCard
              icon={<Bot className="h-5 w-5" />}
              title="C. メンター"
              body="「何すればいいか分からない」を防ぐ AI の先輩。"
              color="text-amber-700 bg-amber-50 ring-amber-200"
            />
            <PillarCard
              icon={<BookOpen className="h-5 w-5" />}
              title="D. 計測"
              body="役場の介入時間・活動量質・地域インパクトを可視化。"
              color="text-violet-700 bg-violet-50 ring-violet-200"
            />
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">v4 のドキュメント</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2 text-slate-700">
              <span className="mt-0.5 font-mono text-xs text-slate-500">docs/15</span>
              <span>v4 要件書(AI = 第三の当事者、4 カテゴリ機能、PoC 技術選定)</span>
            </li>
            <li className="flex items-start gap-2 text-slate-700">
              <span className="mt-0.5 font-mono text-xs text-slate-500">docs/16</span>
              <span>v4 データモデル(10 テーブル / 1 入力 → N 出力 / pgvector 同居)</span>
            </li>
            <li className="flex items-start gap-2 text-slate-700">
              <span className="mt-0.5 font-mono text-xs text-slate-500">docs/17</span>
              <span>v4 RAG アーキ(Web 起点シード + 並行蓄積 / 4 視点プロンプト)</span>
            </li>
          </ul>
        </section>

        <footer className="mt-10 text-center text-xs text-slate-500">
          v4 はラボ実装です。データはすべてモック / 一部はデモ用のスタブです。
        </footer>
      </div>
    </main>
  );
}

function EntryCard({
  href,
  badge,
  badgeColor,
  icon,
  title,
  sub,
  bullets,
  accent,
}: {
  href: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  bullets: string[];
  accent: "violet" | "emerald";
}) {
  const ring =
    accent === "violet"
      ? "hover:ring-violet-400 hover:shadow-violet-200/40"
      : "hover:ring-emerald-400 hover:shadow-emerald-200/40";
  const arrow =
    accent === "violet" ? "text-violet-600" : "text-emerald-600";
  return (
    <Link
      href={href as never}
      className={`group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-transparent transition hover:shadow-lg ${ring}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeColor}`}
        >
          {badge}
        </span>
        <ArrowRight
          className={`h-5 w-5 transition group-hover:translate-x-1 ${arrow}`}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div>
        <div>
          <div className="text-lg font-bold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{sub}</div>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            {b}
          </li>
        ))}
      </ul>
    </Link>
  );
}

function PillarCard({
  icon,
  title,
  body,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  color: string;
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-lg p-1.5 ring-1 ${color}`}>{icon}</span>
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-xs leading-relaxed text-slate-600">
        {body}
      </CardContent>
    </Card>
  );
}
