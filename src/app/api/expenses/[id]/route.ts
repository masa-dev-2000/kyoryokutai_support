import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PatchBody = { status?: string; amountSettled?: number; hasReceipt?: boolean; settleNote?: string };

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await readJson<PatchBody>(req);
  const updated = await getRepos().expenses.update(id, b);
  if (!updated) return bad("not found", 404);
  return ok(updated);
}
