import { ok, bad, readJson } from "@/lib/api/http";
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

/** PATCH /api/super/municipalities/[id] — 自治体の名称/都道府県/年間予算を更新(super 専用) */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const body = await readJson<{ name?: string; prefecture?: string; annualBudget?: number }>(req);
  const patch: { name?: string; prefecture?: string; annualBudget?: number } = {};
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.prefecture === "string" && body.prefecture.trim()) patch.prefecture = body.prefecture.trim();
  if (typeof body.annualBudget === "number" && body.annualBudget >= 0) patch.annualBudget = body.annualBudget;
  if (Object.keys(patch).length === 0) return bad("更新する項目がありません", 400);
  const updated = await getRepos().super.updateMunicipality(id, patch);
  if (!updated) return bad("自治体が見つかりません", 404);
  return ok(updated);
}

/** DELETE /api/super/municipalities/[id] — 自治体を削除(super 専用)。所属ユーザーが居る場合は拒否 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const detail = await getRepos().super.municipalityDetail(id);
  if (!detail) return bad("自治体が見つかりません", 404);
  const userCount = detail.members.length + detail.staff.length;
  if (userCount > 0) {
    return bad(`所属ユーザーが ${userCount} 名います。先にユーザーを移動/削除してください`, 409);
  }
  await getRepos().super.deleteMunicipality(id);
  return ok(null, 204);
}
