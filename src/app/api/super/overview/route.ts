import { ok, bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSession } from "@/lib/api/auth";
import { getSessionRole } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/super/overview — 全自治体横断サマリ(super 専用) */
export async function GET() {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;

  const role = await getSessionRole(sess.authId);
  if (role !== "super") return bad("権限がありません", 403);

  return ok(await getRepos().super.overview());
}
