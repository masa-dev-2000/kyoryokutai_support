import { ok } from "@/lib/api/http";
import { all } from "@/lib/db";
import { mapReport } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  const rows = all("SELECT * FROM monthly_reports WHERE user_id=? ORDER BY year_month DESC", [userId]);
  return ok(rows.map(mapReport));
}
