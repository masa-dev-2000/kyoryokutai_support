import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAdmin } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const muniId = sess.role === "super" ? undefined : sess.municipalityId;
  return ok(await getRepos().members.list(muniId));
}

type Body = { id?: string; name: string; role: string; startedAt?: string; term?: string; hostOrganizationId?: string | null; approvalRouteId?: string | null };

export async function POST(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const b = await readJson<Body>(req);
  try {
    const saved = await getRepos().members.upsert(b, sess.municipalityId);
    return ok(saved, b.id ? 200 : 201);
  } catch (e) {
    if (e instanceof Error && e.message === "TENANT_MISMATCH") return bad("見つかりません", 404);
    throw e;
  }
}
