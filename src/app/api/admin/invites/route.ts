import { ok, bad, readJson } from "@/lib/api/http";
import { requireSession } from "@/lib/api/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateBody = {
  email?: string;
  role?: string;
  municipalityName?: string;
};

/** POST /api/admin/invites — 招待トークン発行 */
export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;

  const { email, role = "member", municipalityName = "" } = await readJson<CreateBody>(req);

  // ランダムトークン生成
  const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 7日間有効
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    getDb().prepare(
      `INSERT INTO invite_tokens (token, email, role, municipality_name, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(token, email ?? null, role, municipalityName, expiresAt);
  } catch {
    return bad("DB error", 500);
  }

  const url = `${new URL(req.url).origin}/signup?token=${token}`;
  return ok({ token, url, expiresAt });
}
