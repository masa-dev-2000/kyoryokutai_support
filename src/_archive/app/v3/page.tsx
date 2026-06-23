import Link from "next/link";
import {
  ChevronLeft,
  Building2,
  UserCircle2,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function V3HubPage() {
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
              v3 / 役場主眼版
            </Badge>
            <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
              ラボ実装
            </Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            管理職が動かなくても、組織が動く。
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            ガードレール + 自走支援 + 自動レポート。
            <br />
            役場担当者は <strong className="text-slate-900">週 1 回見るだけ</strong>。経費承認も議会報告も AI が下書き、あなたは承認するだけ。
          </p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <EntryCard
            href="/v3/manager"
            badge="役場 / 管理者"
            badgeColor="bg-violet-100 text-violet-900"
            icon={<Building2 className="h-6 w-6" />}
            title="管理職モード"
            sub="週 1 回見るだけ UI"
            bullets={[
              "未承認の経費・月次が 1 画面で確認できる",
              "議会・県・国 報告は AI 下書き済み",
              "離任予兆・ガードレール逸脱は自動でハイライト",
            ]}
            accent="violet"
          />
          <EntryCard
            href="/v3/member"
            badge="協力隊 / 従業員"
            badgeColor="bg-emerald-100 text-emerald-900"
            icon={<UserCircle2 className="h-6 w-6" />}
            title="隊員モード"
            sub="ガードレール内で自走"
            bullets={[
              "「これってやっていい？」を AI に聞ける",
              "やってよい / グレー / ダメ を即答",
              "話すだけで日報・月報が完成",
            ]}
            accent="emerald"
          />
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            v3 の核となる仕組み
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <PillarCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="ガードレール"
              body="「やってよい / グレー / ダメ」を AI が即答。役場の判断を肩代わり。"
              color="text-emerald-700 bg-emerald-50 ring-emerald-200"
            />
            <PillarCard
              icon={<Sparkles className="h-5 w-5" />}
              title="自走支援"
              body="隊員は役場に聞かなくても動ける。役場は介入を最小化。"
              color="text-sky-700 bg-sky-50 ring-sky-200"
            />
            <PillarCard
              icon={<ClipboardList className="h-5 w-5" />}
              title="自動レポート"
              body="月次 → 議会 → 県 → 国 まで階層構造で自動生成。"
              color="text-amber-700 bg-amber-50 ring-amber-200"
            />
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">v3 のドキュメント</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-700">
              <span className="font-mono text-xs text-slate-500">docs/12</span>
              v3 要件固めヒアリング(N=6 + オーナー判断)
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <span className="font-mono text-xs text-slate-500">docs/13</span>
              v3 機能インベントリ + 汎用化への布石(Plan B)
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <span className="font-mono text-xs text-slate-500">docs/14</span>
              競合ポジショニング(gamba!/Teamspirit/kintone との差別化)
            </li>
          </ul>
        </section>

        <footer className="mt-10 text-center text-xs text-slate-500">
          v3 はラボ実装です。データはすべてモックです。
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
