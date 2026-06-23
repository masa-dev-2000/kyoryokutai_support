import { ok, bad } from "@/lib/api/http";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenRow = {
  token: string;
  email: string | null;
  role: string;
  municipality_name: string;
  expires_at: string;
  used_at: string | null;
};

/** GET /api/admin/invites/[token] — トークン検証(signup ページが呼ぶ) */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = getDb()
    .prepare("SELECT * FROM invite_tokens WHERE token=?")
    .get(token) as TokenRow | undefined;

  if (!row) return bad("招待リンクが無効です", 404);
  if (row.used_at) return bad("この招待リンクはすでに使用されています", 410);
  if (new Date(row.expires_at) < new Date()) return bad("招待リンクの有効期限が切れています", 410);

  return ok({
    email: row.email,
    role: row.role,
    municipalityName: row.municipality_name,
  });
}

/** PATCH /api/admin/invites/[token] — 使用済みマーク(signup 完了時に呼ぶ) */
export async function PATCH(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  getDb()
    .prepare("UPDATE invite_tokens SET used_at=datetime('now') WHERE token=? AND used_at IS NULL")
    .run(token);
  return ok({ ok: true });
}
