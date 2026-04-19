import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-semibold text-brand-600">
          地域おこし協力隊サポート
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          活動記録・月次報告・役場連絡を一つに
        </h1>
        <p className="mt-4 text-slate-600">
          スマホで日報を書くだけで AI が月次報告を整え、役場との連絡もスムーズに。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/login"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="text-xs font-semibold text-brand-600">隊員として</div>
          <div className="mt-2 text-lg font-bold">日報を書く</div>
          <p className="mt-2 text-sm text-slate-600">
            スマホから数秒で記録。音声入力・写真添付対応。
          </p>
        </Link>
        <Link
          href="/login"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="text-xs font-semibold text-slate-600">
            自治体担当として
          </div>
          <div className="mt-2 text-lg font-bold">隊員を見守る</div>
          <p className="mt-2 text-sm text-slate-600">
            担当隊員の活動と月次報告をひと目で確認。
          </p>
        </Link>
      </section>

      <footer className="mt-16 text-xs text-slate-500">
        <p>
          現在ベータ版開発中。兵庫県内の非豊岡市町村向けに順次展開予定。
        </p>
      </footer>
    </main>
  );
}
