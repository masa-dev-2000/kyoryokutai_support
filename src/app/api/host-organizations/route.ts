import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAdmin, requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  if (sess.role !== "manager" && sess.role !== "admin" && sess.role !== "super") return bad("権限がありません", 403);
  const muniId = sess.role === "super" ? undefined : sess.municipalityId;
  return ok(await getRepos().hostOrgs.list(muniId));
}

type Body = { id?: string; name: string; kind?: string; contactUserId?: string };

export async function POST(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const b = await readJson<Body>(req);
  try {
    const saved = await getRepos().hostOrgs.upsert(b, sess.municipalityId);
    return ok(saved, b.id ? 200 : 201);
  } catch (e) {
    if (e instanceof Error && e.message === "TENANT_MISMATCH") return bad("見つかりません", 404);
    throw e;
  }
}
