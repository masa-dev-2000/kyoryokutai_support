import { ok } from "@/lib/api/http";
import { all } from "@/lib/db";
import { mapApproval } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

// 進行中(pending)の承認のみ返す。完了/差戻しはキューから外れる。
export async function GET(req: Request) {
  const muni = new URL(req.url).searchParams.get("muni") ?? MUNI;
  const rows = all(
    "SELECT * FROM approvals WHERE municipality_id=? AND status='pending' ORDER BY created_at",
    [muni]
  );
  return ok(rows.map(mapApproval));
}
