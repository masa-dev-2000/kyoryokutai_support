import { ok, readJson } from "@/lib/api/http";
import { all, run, genId } from "@/lib/db";
import { mapLog } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  const rows = all(
    "SELECT * FROM activity_logs WHERE user_id=? ORDER BY log_date DESC, log_time DESC",
    [userId]
  );
  return ok(rows.map(mapLog));
}

type CreateBody = {
  userId?: string;
  type: string;
  topic: string;
  hours: number;
  distanceKm?: number;
  body: string;
  date?: string;
  time?: string;
  expense?: number;
};

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const id = genId("log");
  const date = b.date ?? new Date().toISOString().slice(0, 10);
  const time = b.time ?? new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  run(
    `INSERT INTO activity_logs (id,user_id,municipality_id,activity_type,topic,hours,distance_km,body,log_date,log_time,expense_amount)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, b.userId ?? "m1", MUNI, b.type, b.topic, b.hours, b.distanceKm ?? null, b.body, date, time, b.expense ?? null]
  );
  const row = all("SELECT * FROM activity_logs WHERE id=?", [id])[0];
  return ok(mapLog(row), 201);
}
