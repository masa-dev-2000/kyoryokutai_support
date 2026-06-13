import { ok, bad, readJson } from "@/lib/api/http";
import { all, run } from "@/lib/db";
import { mapExpense } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PatchBody = {
  status?: string;
  amountSettled?: number;
  hasReceipt?: boolean;
  settleNote?: string;
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await readJson<PatchBody>(req);
  const existing = all("SELECT * FROM expenses WHERE id=?", [id])[0];
  if (!existing) return bad("not found", 404);

  run(
    `UPDATE expenses SET
       status = COALESCE(?, status),
       amount_settled = COALESCE(?, amount_settled),
       has_receipt = COALESCE(?, has_receipt),
       settle_note = COALESCE(?, settle_note),
       updated_at = datetime('now')
     WHERE id=?`,
    [
      b.status ?? null,
      b.amountSettled ?? null,
      b.hasReceipt === undefined ? null : b.hasReceipt ? 1 : 0,
      b.settleNote ?? null,
      id,
    ]
  );
  const row = all("SELECT * FROM expenses WHERE id=?", [id])[0];
  return ok(mapExpense(row));
}
