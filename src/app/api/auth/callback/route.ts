import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { homePathForRole, safeRelativePath } from "@/lib/auth/role-path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // open redirect 防止: next は同一オリジンの相対パスのみ許可
  const next = safeRelativePath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: import("@supabase/ssr").CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const role = user ? await getAppUserRole(user.id, user.email) : null;

  return NextResponse.redirect(`${origin}${next ?? homePathForRole(role)}`);
}

async function getAppUserRole(authId: string, email: string | null | undefined): Promise<string | null> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: appUser } = await admin
    .from("users")
    .select("id, role")
    .eq("auth_id", authId)
    .single();

  if (appUser?.role) return appUser.role as string;
  if (!email) return null;

  const { data: byEmail } = await admin
    .from("users")
    .select("id, role")
    .eq("email", email)
    .single();

  if (!byEmail) return null;

  await admin.from("users").update({ auth_id: authId }).eq("id", byEmail.id);
  return byEmail.role as string;
}
