import { redirect } from "next/navigation";

// 本番入口は v5 に一本化(A案 2026-06-23)。
// 旧トップ(プロトタイプ選択)と v1〜v4/lab は src/_archive/app へ退避。
export default function HomePage() {
  redirect("/v5/login");
}
