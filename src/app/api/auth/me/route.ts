import { ok } from "@/lib/api/http";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/me — セッションユーザーの app userId・role を返す */
export async function GET() {
  // ローカル開発(docs/27: AUTH_PROVIDER=none)は固定の開発ユーザー。
  // データ層(requireAppUser)と同じ id を返して整合させる。本番は通らない。
  if (process.env.AUTH_PROVIDER === "none") {
    const userId = process.env.DEV_USER_ID ?? process.env.DEMO_USER_ID ?? "m1";
    const name = (await getRepos().users.nameOf(userId)) ?? "開発ユーザー";
    return ok({ authenticated: true, userId, name, role: process.env.DEV_USER_ROLE ?? "member" });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cs: { name: string; value: string; options?: import('@supabase/ssr').CookieOptions }[]) { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // auth_id で public.users を引く
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: appUser } = await admin
    .from("users")
    .select("id, name, role, email")
    .eq("auth_id", user.id)
    .single();

  // auth_id 未紐付けの場合は email で検索してリンクのみ行う(#64: 自動作成は廃止)
  if (!appUser) {
    const { data: byEmail } = await admin
      .from("users")
      .select("id, name, role, email")
      .eq("email", user.email ?? "")
      .single();

    if (byEmail) {
      await admin.from("users").update({ auth_id: user.id }).eq("id", byEmail.id);
      return ok({ authenticated: true, userId: byEmail.id, name: byEmail.name, role: byEmail.role });
    }

    // #64: 招待トークン経由で登録されたメアド以外は拒否(自動 member 作成しない)
    return NextResponse.json(
      { authenticated: false, error: "not_provisioned", email: user.email },
      { status: 403 }
    );
  }

  return ok({ authenticated: true, userId: appUser.id, name: appUser.name, role: appUser.role });
}
