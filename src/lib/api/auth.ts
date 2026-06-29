import { getSessionUserId, getAppUser } from "@/lib/auth/server";
import { bad } from "@/lib/api/http";

// ローカル開発(docs/27: AUTH_PROVIDER=none)では Supabase を介さず固定ユーザーで動かす。
// 本番は AUTH_PROVIDER=supabase のため、この分岐は通らず「実ユーザーのみ」になる。
const LOCAL_DEV = process.env.AUTH_PROVIDER === "none";
const DEV_USER_ID = process.env.DEV_USER_ID ?? process.env.DEMO_USER_ID ?? "m1";
const DEV_USER_ROLE = process.env.DEV_USER_ROLE ?? "member";

/** 認証のみ確認する。未認証なら 401 Response。 */
export async function requireSession(): Promise<{ authId: string } | Response> {
  if (LOCAL_DEV) return { authId: "local-dev" };
  const authId = await getSessionUserId();
  if (!authId) return bad("認証が必要です", 401);
  return { authId };
}

/**
 * セッションから「本人の app userId・role」を解決する。
 * - 未認証 → 401
 * - 認証済みだが users 未登録(招待されていない)→ 403
 * クライアントが送ってくる userId は信用せず、必ずこの値を使う(なりすまし防止)。
 * ローカル開発(AUTH_PROVIDER=none)では固定の開発ユーザーを返す。
 */
export async function requireAppUser(): Promise<{ authId: string; userId: string; role: string } | Response> {
  if (LOCAL_DEV) return { authId: "local-dev", userId: DEV_USER_ID, role: DEV_USER_ROLE };
  const authId = await getSessionUserId();
  if (!authId) return bad("認証が必要です", 401);
  const appUser = await getAppUser(authId);
  if (!appUser) return bad("このアカウントは未登録です(管理者の招待が必要です)", 403);
  return { authId, userId: appUser.id, role: appUser.role };
}

/** 運営者(super)専用ルートの先頭で呼ぶ。super 以外は 403。 */
export async function requireSuper(): Promise<{ authId: string; userId: string; role: string } | Response> {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  if (sess.role !== "super") return bad("運営者(super)権限が必要です", 403);
  return sess;
}
