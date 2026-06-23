import Link from "next/link";
import { FlaskConical, Home } from "lucide-react";

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-900">
        🧪 ラボ(実験中) — 本番機能ではありません。デモ・検証用
      </div>
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-2 text-xs text-slate-600">
        <Link href="/lab" className="flex items-center gap-1 hover:text-slate-900">
          <FlaskConical className="h-3.5 w-3.5" />
          ラボ
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/" className="flex items-center gap-1 hover:text-slate-900">
          <Home className="h-3.5 w-3.5" />
          トップへ戻る
        </Link>
      </div>
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  );
}
