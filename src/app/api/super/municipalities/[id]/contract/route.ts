import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSuper } from "@/lib/api/auth";
import type { ContractPatch } from "@/lib/db/repositories/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/super/municipalities/[id]/contract — 契約情報(super 専用) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const contract = await getRepos().super.getContract(id);
  if (!contract) return bad("自治体が見つかりません", 404);
  return ok(contract);
}

/** PATCH /api/super/municipalities/[id]/contract — 契約情報の部分更新(super 専用) */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const b = await readJson<ContractPatch>(req);

  if (b.annualBudget !== undefined) {
    if (typeof b.annualBudget !== "number" || Number.isNaN(b.annualBudget) || b.annualBudget < 0) {
      return bad("年間活動費枠の値が不正です", 400);
    }
  }

  const updated = await getRepos().super.updateContract(id, b);
  if (!updated) return bad("自治体が見つかりません", 404);
  return ok(updated);
}
