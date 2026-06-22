import { getSessionUserId } from "@/lib/auth/server";
import { bad } from "@/lib/api/http";

/** POST/PATCH/DELETE ルートの先頭で呼ぶ。未認証なら 401 Response を返す。 */
export async function requireSession(): Promise<{ authId: string } | Response> {
  const authId = await getSessionUserId();
  if (!authId) return bad("認証が必要です", 401);
  return { authId };
}
