import Link from "next/link";
import { Smartphone, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-semibold text-brand-600">
          地域おこし協力隊サポート(β)
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          活動記録・月次報告・役場連絡を一つに
        </h1>
        <p className="mt-4 text-slate-600">
          スマホで日報を書くだけで AI が月次報告を整え、役場との連絡もスムーズに。
        </p>
      </header>

      <section className="space-y-4">
        <Link href="/me" className="block">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-brand-600">
                  隊員用(スマホ前提)
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  アプリ画面のデモを見る
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  ホーム / 日報入力 / 月次レポート / お知らせ / チャット / 設定
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </Link>

        <Link href="/me/settings" className="block text-sm text-slate-500 underline">
          設定画面へ直接移動
        </Link>
      </section>

      <footer className="mt-16 space-y-1 text-xs text-slate-500">
        <p>
          現在モックデータで表示しています。Supabase/AI 連携は次フェーズで実装予定。
        </p>
        <p>
          旧版の静的 HTML モックは <code className="rounded bg-slate-100 px-1">mock/index.html</code> を参照。
        </p>
      </footer>
    </main>
  );
}
