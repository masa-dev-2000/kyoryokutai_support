import type { Repos } from "./types";
import { sqliteRepos } from "./sqlite";
import { supabaseRepos } from "./supabase";

export type { Repos } from "./types";

// DB_PROVIDER=supabase → Supabase(Postgres + サービスロールキー)
// DB_PROVIDER=sqlite   → SQLite(ローカル PoC / デフォルト)
export function getRepos(): Repos {
  const kind = (process.env.DB_PROVIDER ?? "sqlite").toLowerCase();
  switch (kind) {
    case "supabase": return supabaseRepos;
    case "sqlite":
    default:
      return sqliteRepos;
  }
}

