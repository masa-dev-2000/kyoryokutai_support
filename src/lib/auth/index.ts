import type { AuthProvider } from "./types";
import { NoneAuthProvider } from "./none";
import { SupabaseAuthProvider } from "./supabase";

export type { AuthProvider, AuthUser } from "./types";

// AUTH_PROVIDER で差し替え(載せ替え 10 か条 #1)。
//   none(既定)  = 開発 / Vercel デモ(固定ユーザー)
//   supabase     = Phase 1 本番(Magic Link、ADR-018)
//   cognito      = Phase 2(将来、新ファイル 1 つ追加で対応)
export function getAuthProvider(): AuthProvider {
  const kind = (process.env.AUTH_PROVIDER ?? "none").toLowerCase();
  switch (kind) {
    case "supabase":
      return new SupabaseAuthProvider();
    case "none":
    default:
      return new NoneAuthProvider();
  }
}
