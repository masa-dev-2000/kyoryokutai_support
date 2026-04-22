import Link from "next/link";
import { Smartphone, ArrowRight, Building2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10">
        <p className="text-sm font-semibold text-brand-600">
          地域おこし協力隊サポート(β)
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          隊員の活動を可視化し、役場との関係をなめらかに。
        </h1>
        <p className="mt-4 text-slate-600">
          スマホで日報を書くだけで AI が月次報告を整え、活動の見える化・事例共有・AI 相談まで一つに。
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
                  ホーム / 日報 / 月次レポート / 事例DB / AI 相談 / 連絡
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-700">
            役場の皆さまへ
          </h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-600">•</span>
            <span>
              <strong>報告書の質と提出率が上がる</strong>: 日報を AI が月次報告に自動整形。督促工数を削減。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-600">•</span>
            <span>
              <strong>隊員の活動が見える化</strong>: 活動タグ・予算消化・月次進捗を一覧で把握。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-600">•</span>
            <span>
              <strong>担当課負担の軽減</strong>: チャット対応ではなく既存の電話・メール運用を尊重。新機能は最小限。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-600">•</span>
            <span>
              <strong>全国事例へのアクセス</strong>: 他自治体の取り組みを匿名化して参照できる。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-600">•</span>
            <span>
              <strong>個人情報はアプリ内に閉じる</strong>: 厳格な権限分離と日本国内保管。
            </span>
          </li>
        </ul>
      </section>

      <footer className="mt-12 space-y-1 text-xs text-slate-500">
        <p>
          現在モックデータで表示しています。本番実装は Supabase / AI バックエンドで構築予定。
        </p>
      </footer>
    </main>
  );
}
