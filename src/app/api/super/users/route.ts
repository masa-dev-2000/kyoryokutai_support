import { ok } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSuper } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/super/users — 全自治体横断のユーザー一覧(super 専用) */
export async function GET(req: Request) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;

  const sp = new URL(req.url).searchParams;
  const opts = {
    municipalityId: sp.get("municipalityId") ?? undefined,
    role: sp.get("role") ?? undefined,
    status: sp.get("status") ?? undefined,
  };
  return ok(await getRepos().super.listUsers(opts));
}
