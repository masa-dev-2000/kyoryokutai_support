import { ok } from "@/lib/api/http";
import { requireSuper } from "@/lib/api/auth";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/super/overview - super-only municipality overview. */
export async function GET() {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;

  return ok(await getRepos().super.overview());
}
