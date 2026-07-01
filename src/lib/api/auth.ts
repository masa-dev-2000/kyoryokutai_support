import { getSessionUserId, getAppUser } from "@/lib/auth/server";
import { bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

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
 * セッションから「本人の app userId・role・所属自治体」を解決する。
 * - 未認証 → 401
 * - 認証済みだが users 未登録(招待されていない)→ 403
 * クライアントが送ってくる userId・municipalityId は信用せず、必ずこの値を使う(なりすまし防止)。
 * ローカル開発(AUTH_PROVIDER=none)では固定の開発ユーザーを返す(muni は既存の
 * users.municipalityOf() で本人由来に解決し、定数の二重管理を避ける)。
 */
export async function requireAppUser(): Promise<{ authId: string; userId: string; role: string; municipalityId: string } | Response> {
  if (LOCAL_DEV) {
    const municipalityId = await getRepos().users.municipalityOf(DEV_USER_ID);
    return { authId: "local-dev", userId: DEV_USER_ID, role: DEV_USER_ROLE, municipalityId };
  }
  const authId = await getSessionUserId();
  if (!authId) return bad("認証が必要です", 401);
  const appUser = await getAppUser(authId);
  if (!appUser) return bad("このアカウントは未登録です(管理者の招待が必要です)", 403);
  return { authId, userId: appUser.id, role: appUser.role, municipalityId: appUser.municipalityId };
}

/** 運営者(super)専用ルートの先頭で呼ぶ。super 以外は 403。 */
export async function requireSuper(): Promise<{ authId: string; userId: string; role: string; municipalityId: string } | Response> {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  if (sess.role !== "super") return bad("運営者(super)権限が必要です", 403);
  return sess;
}

/** 管理者(admin)専用ルートの先頭で呼ぶ。admin / super 以外は 403。 */
export async function requireAdmin(): Promise<{ authId: string; userId: string; role: string; municipalityId: string } | Response> {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  if (sess.role !== "admin" && sess.role !== "super") return bad("管理者(admin)権限が必要です", 403);
  return sess;
}
