import { ok, bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/invites/[token] — トークン検証(signup ページが呼ぶ) */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await getRepos().invites.findByToken(token);

  if (!row) return bad("招待リンクが無効です", 404);
  if (row.usedAt) return bad("この招待リンクはすでに使用されています", 410);
  if (new Date(row.expiresAt) < new Date()) return bad("招待リンクの有効期限が切れています", 410);

  return ok({
    email: row.email,
    role: row.role,
    municipalityName: row.municipalityName,
  });
}

/** PATCH /api/admin/invites/[token] — 使用済みマーク(signup 完了時に呼ぶ) */
export async function PATCH(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await getRepos().invites.markUsed(token);
  return ok({ ok: true });
}
