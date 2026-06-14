import type { Repos } from "./types";
import { sqliteRepos } from "./sqlite";

export type { Repos } from "./types";

// DB_PROVIDER で差し替え(載せ替え 10 か条 #2)。
//   sqlite(既定) = ローカル / Vercel デモ(node:sqlite)
//   supabase     = Phase 1 本番(Postgres + RLS、SET LOCAL app.current_user_id)
//                  ※ src/lib/db/repositories/supabase.ts を Phase 1 で追加
export function getRepos(): Repos {
  const kind = (process.env.DB_PROVIDER ?? "sqlite").toLowerCase();
  switch (kind) {
    // case "supabase": return supabaseRepos;  // Phase 1 で実装
    case "sqlite":
    default:
      return sqliteRepos;
  }
}
