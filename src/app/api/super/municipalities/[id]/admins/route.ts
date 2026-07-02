import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSuper } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { email?: string; name?: string };

/** POST /api/super/municipalities/[id]/admins
 *  指定自治体の admin を pre-provision + 招待トークン発行(#65) */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const b = await readJson<Body>(req);
  // Supabase Auth は email を小文字化して保持し、/api/auth/me は完全一致で紐づける。
  // pre-provision する users.email も小文字に正規化しないと大文字を含む招待で 403 が再発する(#74)。
  const cleanEmail = b.email?.trim().toLowerCase();
  const cleanName = b.name?.trim();
  if (!cleanEmail || !cleanName) return bad("email / name は必須です");
  let inv: { token: string; expiresAt: string };
  try {
    inv = await getRepos().super.createAdminInvite({
      municipalityId: id,
      email: cleanEmail,
      name: cleanName,
      createdBy: sess.userId,
    });
  } catch (e) {
    // 同じ email が別ロールで登録済み → サイレントに権限を取り違えないよう明示エラー。
    if (e instanceof Error && e.message === "ROLE_CONFLICT") {
      return bad("このメールアドレスは既に別の権限で登録されています", 409);
    }
    return bad("DB error", 500);
  }
  const url = `${new URL(req.url).origin}/signup?token=${inv.token}`;
  return ok({ ...inv, url }, 201);
}
