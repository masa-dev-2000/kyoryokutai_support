import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Smartphone,
  ArrowRight,
  Building2,
  LayoutDashboard,
  FlaskConical,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10">
        <Badge variant="secondary" className="mb-3">
          β
        </Badge>
        <p className="text-sm font-semibold text-primary">
          地域おこし協力隊サポート
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          隊員の活動を可視化し、役場との関係をなめらかに。
        </h1>
        <p className="mt-4 text-muted-foreground">
          スマホで日報を書くだけで AI が月次報告を整え、活動の見える化・事例共有・AI 相談まで一つに。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/me" className="block">
          <Card className="h-full transition hover:shadow-md">
            <CardContent className="flex items-start gap-3 py-5">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-primary">
                  隊員用(スマホ画面)
                </div>
                <div className="mt-1 text-lg font-bold">
                  隊員アプリを見る
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  ホーム / 日報 / 月次レポート / 事例DB / AI 相談 / 連絡
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin" className="block">
          <Card className="h-full transition hover:shadow-md">
            <CardContent className="flex items-start gap-3 py-5">
              <div className="rounded-xl bg-foreground p-2.5 text-background">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold">
                  役場担当者用(PC 画面)
                </div>
                <div className="mt-1 text-lg font-bold">
                  管理ダッシュボードを見る
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  隊員一覧 / 月次報告承認 / お知らせ配信 / 活動サマリー / 事例集
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-amber-700" />
          <h2 className="text-sm font-semibold text-amber-900">
            🧪 ラボ — 実験中の UI
          </h2>
        </div>

        <Link href="/lab/integrated-flow" className="block">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 transition hover:shadow-md">
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="bg-violet-100 text-violet-800 mb-1">
                    新コンセプト
                  </Badge>
                  <div className="text-base font-bold text-amber-950">
                    統合フロー(3 タッチポイント)
                  </div>
                  <p className="mt-1 text-xs text-amber-900">
                    ユーザーは「① 計画 / ② 実行 / ③ 振り返り」だけ。
                    日報・月報・事例・進捗・成果は AI が自動で組み立て。
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-amber-700" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/lab" className="block">
          <Card className="border-amber-200 bg-amber-50 transition hover:bg-amber-100">
            <CardContent className="flex items-center gap-3 py-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <FlaskConical className="h-4 w-4" />
              </div>
              <div className="flex-1 text-sm font-semibold text-amber-900">
                すべての実験 UI を見る(行動ベース記録 v1-v3 等)
              </div>
              <ArrowRight className="h-4 w-4 text-amber-700" />
            </CardContent>
          </Card>
        </Link>
      </section>

      <Separator className="my-10" />

      <section className="rounded-2xl border bg-gradient-to-br from-secondary to-background p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-semibold">役場・県の皆さまへ</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>報告書の質と提出率が上がる</strong>: 日報を AI が月次報告に自動整形。督促工数を削減。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>隊員の活動が見える化</strong>: プロジェクト単位・タグ別・予算消化を俯瞰。議会報告 PDF も AI で生成。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>担当課負担の軽減</strong>: チャット対応ではなく既存の電話・メール運用を尊重。新機能は最小限。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>全国事例・イベント情報にワンクリック</strong>: 他自治体の取り組みを匿名化参照、研修情報も集約。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            <span>
              <strong>個人情報はアプリ内に閉じる</strong>: 厳格な権限分離と日本国内保管。
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-700" />
          <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            既存リソースとの違い
          </div>
        </div>
        <h2 className="mt-1 text-sm font-semibold text-violet-900">
          静的な Excel / PDF 配布から、動的な SaaS へ
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">観点</th>
                <th className="px-3 py-2 font-medium">JOIN お役立ちツール</th>
                <th className="px-3 py-2 font-medium text-primary">
                  本サービス
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 text-muted-foreground">形式</td>
                <td className="px-3 py-2">Excel / PDF 静的ファイル</td>
                <td className="px-3 py-2 font-medium text-primary">Web SaaS</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-muted-foreground">データ連携</td>
                <td className="px-3 py-2">なし</td>
                <td className="px-3 py-2 font-medium text-primary">
                  日報・月次・事例が連動
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-muted-foreground">AI 活用</td>
                <td className="px-3 py-2">なし</td>
                <td className="px-3 py-2 font-medium text-primary">
                  月次生成 / 壁打ち / 事例検索
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-muted-foreground">活用実態</td>
                <td className="px-3 py-2">ダウンロードして閉じる</td>
                <td className="px-3 py-2 font-medium text-primary">
                  毎日使われる
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-violet-800">
          JOIN の知見を否定せず、動的 SaaS として補完します。
        </p>
      </section>

      <footer className="mt-12 text-xs text-muted-foreground">
        <p>
          現在モックデータで表示しています。本番実装は Supabase / AI バックエンドで構築予定。
        </p>
      </footer>
    </main>
  );
}
