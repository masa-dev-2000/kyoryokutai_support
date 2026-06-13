import { ok, readJson } from "@/lib/api/http";
import { all, run, genId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

// { [staffId]: memberId[] } を返す(admin 画面の形)
export async function GET() {
  const staff = all<{ id: string }>("SELECT id FROM users WHERE role='manager' AND organization_type='municipality'");
  const rows = all<{ staff_id: string; member_id: string }>("SELECT staff_id,member_id FROM assignments");
  const map: Record<string, string[]> = {};
  for (const s of staff) map[s.id] = [];
  for (const r of rows) (map[r.staff_id] ??= []).push(r.member_id);
  return ok(map);
}

// 指定職員の担当隊員を total replace
export async function PUT(req: Request) {
  const { staffId, memberIds } = await readJson<{ staffId: string; memberIds: string[] }>(req);
  run("DELETE FROM assignments WHERE staff_id=?", [staffId]);
  for (const mid of memberIds ?? []) {
    run("INSERT INTO assignments (id,municipality_id,staff_id,member_id) VALUES (?,?,?,?)", [
      genId("as"),
      MUNI,
      staffId,
      mid,
    ]);
  }
  return ok({ staffId, memberIds });
}
