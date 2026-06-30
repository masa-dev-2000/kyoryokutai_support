import { getSessionUserId, getSessionRole, getAppUserId } from "@/lib/auth/server";
import { bad } from "@/lib/api/http";

/** POST/PATCH/DELETE ルートの先頭で呼ぶ。未認証なら 401 Response を返す。 */
export async function requireSession(): Promise<{ authId: string } | Response> {
  const authId = await getSessionUserId();
  if (!authId) return bad("認証が必要です", 401);
  return { authId };
}

/**
 * super 専用ルートの先頭で呼ぶ。未認証は 401、super 以外は 403 を返す。
 * 成功時は { authId, userId, role } を返す。
 */
export async function requireSuper(): Promise<{ authId: string; userId: string | null; role: string } | Response> {
  const authId = await getSessionUserId();
  if (!authId) return bad("認証が必要です", 401);
  const role = await getSessionRole(authId);
  if (role !== "super") return bad("権限がありません", 403);
  const userId = await getAppUserId(authId);
  return { authId, userId, role };
}
