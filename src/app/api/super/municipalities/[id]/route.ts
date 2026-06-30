import { ok, bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSuper } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/super/municipalities/[id] — 自治体ドリルダウン詳細(super 専用) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const detail = await getRepos().super.municipalityDetail(id);
  if (!detail) return bad("自治体が見つかりません", 404);
  return ok(detail);
}
