import { ok } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSuper } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/super/analytics — 全国横断 KPI(super 専用) */
export async function GET() {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  return ok(await getRepos().super.analytics());
}
