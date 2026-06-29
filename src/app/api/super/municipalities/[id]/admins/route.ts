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
  if (!b.email?.trim() || !b.name?.trim()) return bad("email / name は必須です");
  const inv = await getRepos().super.createAdminInvite({
    municipalityId: id,
    email: b.email.trim(),
    name: b.name.trim(),
    createdBy: sess.userId,
  });
  const url = `${new URL(req.url).origin}/signup?token=${inv.token}`;
  return ok({ ...inv, url }, 201);
}
