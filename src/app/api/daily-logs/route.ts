import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UpsertBody = {
  userId?: string;
  date?: string;
  note?: string;
};

/** GET /api/daily-logs?userId=m1&date=2026-06-16 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const userId = params.get("userId") ?? process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";
  const date = params.get("date") ?? new Date().toISOString().slice(0, 10);
  const row = await getRepos().dailyLogs.getByDate(userId, date);
  return ok(row ?? null);
}

/** POST /api/daily-logs — 日報ヘッダーを upsert する(ADR-021) */
export async function POST(req: Request) {
  const b = await readJson<UpsertBody>(req);
  const userId = b.userId ?? process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";
  const date = b.date ?? new Date().toISOString().slice(0, 10);
  const row = await getRepos().dailyLogs.upsert(userId, date, b.note);
  return ok(row, 200);
}
