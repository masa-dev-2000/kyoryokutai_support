import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { BubbleButton } from "@/components/bubble/bubble-button";
import {
  ChevronLeft,
  Smartphone,
  LayoutDashboard,
  Sparkles,
  FileText,
  FolderSearch,
  CalendarDays,
  Target,
  Bell,
  ClipboardCheck,
} from "lucide-react";

export default function V1TutorialPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={12} />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8">
        <Link
          href="/v1"
          className="inline-flex items-center gap-1 self-start text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          v1 ハブへ戻る
        </Link>

        <header className="mt-6 text-center max-w-xl mx-auto">
          <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            v1 つかい方
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            既存の機能フル実装版
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            日報・月次・事例・お知らせ等を、機能ごとにページ分けした版。
            <br />
            各機能の存在をひと目で確認できます。
          </p>
        </header>

        {/* 隊員側 */}
        <section className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-700">
              隊員アプリの中身(スマホ画面)
            </h2>
          </div>
          <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-emerald-200 backdrop-blur">
            <ul className="grid gap-3 sm:grid-cols-2 text-sm">
              <FeatureRow
                icon={<Target className="h-4 w-4 text-violet-600" />}
                label="ホーム"
                desc="今日の一歩・進行中PJ・おすすめイベント"
              />
              <FeatureRow
                icon={<FileText className="h-4 w-4 text-emerald-600" />}
                label="日報"
                desc="一覧 / 入力 / 検索"
              />
              <FeatureRow
                icon={<FileText className="h-4 w-4 text-violet-600" />}
                label="月次レポート"
                desc="AI ドラフト + 編集 + 提出"
              />
              <FeatureRow
                icon={<FolderSearch className="h-4 w-4 text-amber-600" />}
                label="事例DB"
                desc="全国の活動事例検索"
              />
              <FeatureRow
                icon={<Sparkles className="h-4 w-4 text-violet-600" />}
                label="AI 相談"
                desc="戦略 / 提案 / キャリア / 悩み の 4 モード"
              />
              <FeatureRow
                icon={<CalendarDays className="h-4 w-4 text-sky-600" />}
                label="全国イベント"
                desc="研修・交流会・視察"
              />
              <FeatureRow
                icon={<Bell className="h-4 w-4 text-amber-600" />}
                label="連絡(お知らせ)"
                desc="役場からの配信を確認"
              />
              <FeatureRow
                icon={<Target className="h-4 w-4 text-emerald-600" />}
                label="プロジェクト"
                desc="活動を計画 → 進捗管理"
              />
            </ul>
          </div>
        </section>

        {/* 役場側 */}
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-semibold text-slate-700">
              役場画面の中身(PC)
            </h2>
          </div>
          <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-sky-200 backdrop-blur">
            <ul className="grid gap-3 sm:grid-cols-2 text-sm">
              <FeatureRow
                icon={<LayoutDashboard className="h-4 w-4 text-emerald-600" />}
                label="ダッシュボード"
                desc="KPI・隊員一覧・AIインサイト"
              />
              <FeatureRow
                icon={<Smartphone className="h-4 w-4 text-violet-600" />}
                label="隊員詳細"
                desc="日報・プロジェクト・月次承認(必須コメント)"
              />
              <FeatureRow
                icon={<Bell className="h-4 w-4 text-amber-600" />}
                label="お知らせ配信"
                desc="一斉 or 個別 + 既読率"
              />
              <FeatureRow
                icon={<ClipboardCheck className="h-4 w-4 text-violet-600" />}
                label="活動サマリー"
                desc="議会報告 PDF を AI が自動生成"
              />
              <FeatureRow
                icon={<FolderSearch className="h-4 w-4 text-amber-600" />}
                label="事例ライブラリ"
                desc="他自治体の取り組み参照"
              />
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 flex justify-center gap-6">
          <BubbleButton
            href="/v1/me"
            label="隊員アプリへ"
            icon={<Smartphone className="h-5 w-5" />}
            color="emerald"
            size="md"
            float="normal"
            delay={0}
          />
          <BubbleButton
            href="/v1/admin"
            label="役場画面へ"
            icon={<LayoutDashboard className="h-5 w-5" />}
            color="sky"
            size="md"
            float="slow"
            delay={300}
          />
        </div>

        <footer className="mt-8 text-center text-xs text-slate-500">
          v2 では「計画 / 動き / 学び」の 3 機能ベースに再設計しています
        </footer>
      </div>
    </main>
  );
}

function FeatureRow({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-slate-50/60 px-3 py-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-600">{desc}</div>
      </div>
    </li>
  );
}
