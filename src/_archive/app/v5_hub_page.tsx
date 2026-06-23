import Link from "next/link";
import {
  ChevronLeft,
  ArrowRight,
  UserCircle2,
  Building2,
  Shield,
} from "lucide-react";

export default function V5HubPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-3 w-3" />
          トップ
        </Link>
        <div className="text-[11px] text-slate-500">v5 ・ lab build</div>
        <span className="w-10" />
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            どちらで使いますか?
          </h1>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
            業務ツール寄せの v5 検証ビルド。
            <br />
            隊員と役場で別画面を用意しています。
          </p>
        </div>

        <div className="mt-8 grid w-full gap-2">
          <ModeCard
            href="/v5/member"
            role="隊員"
            title="活動を記録する"
            sub="活動報告 ・ 月報 ・ 経費 ・ 事例"
            icon={<UserCircle2 className="h-5 w-5" />}
          />
          <ModeCard
            href="/v5/manager"
            role="役場"
            title="隊員をサポートする"
            sub="承認 ・ 月報 ・ お知らせ"
            icon={<Building2 className="h-5 w-5" />}
          />
          <ModeCard
            href="/v5/admin"
            role="管理者"
            title="組織の設定をする"
            sub="職員 ・ 担当割当 ・ 隊員台帳"
            icon={<Shield className="h-5 w-5" />}
          />
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400">
          検索エンジン型 UI ・ 白基調 ・ AI は判定しません
        </p>
      </div>

      <footer className="border-t border-slate-100 py-2 text-center text-[10px] text-slate-400">
        地域おこし協力隊サポートシステム ・ v5 lab
      </footer>
    </main>
  );
}

function ModeCard({
  href,
  role,
  title,
  sub,
  icon,
}: {
  href: string;
  role: string;
  title: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href as never}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {role}
        </div>
        <div className="text-[14px] font-bold text-slate-900">{title}</div>
        <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
    </Link>
  );
}
