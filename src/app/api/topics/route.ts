import { ok, readJson } from "@/lib/api/http";
import { all, run, genId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  const rows = all<{ name: string }>(
    "SELECT name FROM activity_topics WHERE user_id=? ORDER BY sort_order",
    [userId]
  );
  return ok(rows.map((r) => r.name));
}

export async function POST(req: Request) {
  const { userId = "m1", name } = await readJson<{ userId?: string; name: string }>(req);
  const exists = all("SELECT 1 FROM activity_topics WHERE user_id=? AND name=?", [userId, name]);
  if (exists.length === 0) {
    const n = all<{ c: number }>("SELECT COUNT(*) c FROM activity_topics WHERE user_id=?", [userId])[0].c;
    run("INSERT INTO activity_topics (id,user_id,municipality_id,name,sort_order) VALUES (?,?,?,?,?)", [
      genId("tp"),
      userId,
      MUNI,
      name,
      n,
    ]);
  }
  const rows = all<{ name: string }>("SELECT name FROM activity_topics WHERE user_id=? ORDER BY sort_order", [userId]);
  return ok(rows.map((r) => r.name));
}

export async function DELETE(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  const name = new URL(req.url).searchParams.get("name") ?? "";
  run("DELETE FROM activity_topics WHERE user_id=? AND name=?", [userId, name]);
  const rows = all<{ name: string }>("SELECT name FROM activity_topics WHERE user_id=? ORDER BY sort_order", [userId]);
  return ok(rows.map((r) => r.name));
}
