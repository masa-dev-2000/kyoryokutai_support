import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthProvider, AuthUser } from "./types";

// Supabase Auth 実装(Phase 1 本番、ADR-018)。
// Magic Link はメール送信が Supabase → AWS SES SMTP 経由(docs/24 §6.1)。
// getCurrentUser は Cookie のアクセストークンを検証する。

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;
function client(): SupabaseClient {
  if (!URL || !ANON) throw new Error("Supabase 未設定(NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)");
  if (!_client) _client = createClient(URL, ANON, { auth: { persistSession: false } });
  return _client;
}

export class SupabaseAuthProvider implements AuthProvider {
  readonly name = "supabase";

  async sendMagicLink(email: string, redirectTo: string): Promise<void> {
    const { error } = await client().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw new Error(`Magic Link 送信失敗: ${error.message}`);
  }

  async verifySession(jwt: string): Promise<AuthUser | null> {
    const { data, error } = await client().auth.getUser(jwt);
    if (error || !data.user) return null;
    return { userId: data.user.id, email: data.user.email ?? "" };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // Cookie からアクセストークンを取得して検証(Next の cookies() を使用)
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const token = store.get("sb-access-token")?.value;
    if (!token) return null;
    return this.verifySession(token);
  }

  async signOut(): Promise<void> {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    store.delete("sb-access-token");
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    if (!URL || !ANON) return { ok: false, detail: "Supabase 未設定(URL / ANON_KEY)" };
    return { ok: true, detail: `supabase auth 設定済 / ${URL}` };
  }
}
