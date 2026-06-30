import { ok, bad, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/api/auth";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateBody = {
  email?: string;
  role?: string;
  municipalityName?: string;
};

/** POST /api/admin/invites — 招待トークン発行 */
export async function POST(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;

  const { email, role = "member", municipalityName = "" } = await readJson<CreateBody>(req);

  let token: string;
  let expiresAt: string;
  try {
    ({ token, expiresAt } = await getRepos().invites.create({
      email: email?.trim() || null,
      role,
      municipalityName,
      createdBy: sess.userId,
    }));
  } catch {
    return bad("DB error", 500);
  }

  const url = `${new URL(req.url).origin}/signup?token=${token}`;
  return ok({ token, url, expiresAt });
}
