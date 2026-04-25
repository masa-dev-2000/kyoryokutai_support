import Link from "next/link";
import { Smartphone, ArrowRight, Building2, LayoutDashboard, FlaskConical } from "lucide-react";

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

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/me" className="block">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-brand-600">
                  隊員用(スマホ画面)
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  隊員アプリを見る
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  ホーム / 日報 / 月次レポート / 事例DB / AI 相談 / 連絡
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
            </div>
          </div>
        </Link>

        <Link href="/admin" className="block">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-900 p-2.5 text-white">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-700">
                  役場担当者用(PC 画面)
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  管理ダッシュボードを見る
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  隊員一覧 / 月次報告承認 / お知らせ配信 / 活動サマリー / 事例集
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-700">
            役場・県の皆さまへ
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
              <strong>隊員の活動が見える化</strong>: プロジェクト単位・タグ別・予算消化を俯瞰。議会報告 PDF も AI で生成。
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
              <strong>全国事例・イベント情報にワンクリック</strong>: 他自治体の取り組みを匿名化参照、研修情報も集約。
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

      <section className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          既存リソースとの違い
        </div>
        <h2 className="mt-1 text-sm font-semibold text-violet-900">
          静的な Excel / PDF 配布から、動的な SaaS へ
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-3 py-2 font-medium">観点</th>
                <th className="px-3 py-2 font-medium">JOIN お役立ちツール</th>
                <th className="px-3 py-2 font-medium text-brand-700">本サービス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 text-slate-500">形式</td>
                <td className="px-3 py-2 text-slate-700">Excel / PDF 静的ファイル</td>
                <td className="px-3 py-2 font-medium text-brand-700">Web SaaS</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-500">データ連携</td>
                <td className="px-3 py-2 text-slate-700">なし</td>
                <td className="px-3 py-2 font-medium text-brand-700">日報・月次・事例が連動</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-500">AI 活用</td>
                <td className="px-3 py-2 text-slate-700">なし</td>
                <td className="px-3 py-2 font-medium text-brand-700">月次生成 / 壁打ち / 事例検索</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-500">活用実態</td>
                <td className="px-3 py-2 text-slate-700">ダウンロードして閉じる</td>
                <td className="px-3 py-2 font-medium text-brand-700">毎日使われる</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-violet-800">
          JOIN の知見を否定せず、動的 SaaS として補完します。
        </p>
      </section>

      <section className="mt-6">
        <Link href="/lab" className="block">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:bg-amber-100">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-amber-700" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-amber-700">
                  実験中の機能
                </div>
                <div className="mt-0.5 text-sm font-bold text-amber-900">
                  🧪 ラボ — 行動ベース記録(音声 + AI)など検証中
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-700" />
            </div>
          </div>
        </Link>
      </section>

      <footer className="mt-12 space-y-1 text-xs text-slate-500">
        <p>
          現在モックデータで表示しています。本番実装は Supabase / AI バックエンドで構築予定。
        </p>
      </footer>
    </main>
  );
}
