import { ok, readJson } from "@/lib/api/http";
import { all, run, get, genId } from "@/lib/db";
import { mapStaff } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

export async function GET() {
  const rows = all(
    "SELECT * FROM users WHERE role='manager' AND organization_type='municipality' ORDER BY created_at",
    []
  );
  return ok(rows.map(mapStaff));
}

type Body = { id?: string; name: string; title?: string; dept: string; email?: string };

export async function POST(req: Request) {
  const b = await readJson<Body>(req);
  const existing = b.id ? get("SELECT id FROM users WHERE id=?", [b.id]) : undefined;
  if (existing) {
    run("UPDATE users SET name=?, title=?, department=?, email=? WHERE id=?", [
      b.name,
      b.title ?? "職員",
      b.dept,
      b.email ?? "",
      b.id,
    ]);
    return ok(mapStaff(all("SELECT * FROM users WHERE id=?", [b.id])[0]));
  }
  const id = b.id ?? genId("s");
  run(
    `INSERT INTO users (id,municipality_id,organization_type,role,name,email,title,department,status)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, MUNI, "municipality", "manager", b.name, b.email ?? "", b.title ?? "職員", b.dept, "active"]
  );
  return ok(mapStaff(all("SELECT * FROM users WHERE id=?", [id])[0]), 201);
}
