import { ok } from "@/lib/api/http";
import { all } from "@/lib/db";
import { mapCase } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = all("SELECT * FROM cases_public ORDER BY created_at DESC");
  const trend = all<Record<string, unknown>>(
    "SELECT id,title,trend_count FROM cases_public WHERE trend_count IS NOT NULL ORDER BY trend_count DESC"
  ).map((r) => ({ id: r.id as string, title: r.title as string, count: r.trend_count as number }));
  return ok({ cases: rows.map(mapCase), trend });
}
