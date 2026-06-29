import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: import('@supabase/ssr').CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component で setAll が呼ばれた場合は無視
          }
        },
      },
    }
  );
}

/** 現在のセッションユーザーの auth.users.id を返す。未ログインは null */
export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** auth.users.id から users テーブルの UUID を引く */
export async function getAppUserId(authId: string): Promise<string | null> {
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single();
  return data?.id ?? null;
}

/** auth.users.id から app ユーザー(id + role)を 1 クエリで引く。未登録は null */
export async function getAppUser(authId: string): Promise<{ id: string; role: string } | null> {
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await admin
    .from("users")
    .select("id, role")
    .eq("auth_id", authId)
    .single();
  return data ? { id: data.id as string, role: data.role as string } : null;
}

/** auth.users.id から users テーブルの role を引く(#64: super ガード用) */
export async function getSessionRole(authId: string): Promise<string | null> {
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data } = await admin
    .from("users")
    .select("role")
    .eq("auth_id", authId)
    .single();
  return data?.role ?? null;
}
