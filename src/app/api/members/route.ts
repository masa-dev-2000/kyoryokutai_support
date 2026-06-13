import { ok, readJson } from "@/lib/api/http";
import { all, run, get, genId } from "@/lib/db";
import { mapMember } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

export async function GET() {
  const rows = all("SELECT * FROM users WHERE role='member' AND status='active' ORDER BY started_at", []);
  return ok(rows.map(mapMember));
}

type Body = { id?: string; name: string; role: string; startedAt?: string; term?: string };

export async function POST(req: Request) {
  const b = await readJson<Body>(req);
  const existing = b.id ? get("SELECT id FROM users WHERE id=?", [b.id]) : undefined;
  if (existing) {
    run("UPDATE users SET name=?, role_label=?, started_at=?, term=? WHERE id=?", [
      b.name,
      b.role,
      b.startedAt ?? "未設定",
      b.term ?? "1 年目",
      b.id,
    ]);
    return ok(mapMember(all("SELECT * FROM users WHERE id=?", [b.id])[0]));
  }
  const id = b.id ?? genId("m");
  run(
    `INSERT INTO users (id,municipality_id,organization_type,role,name,email,role_label,term,started_at,status)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, MUNI, "member", "member", b.name, `${id}@member.example.jp`, b.role, b.term ?? "1 年目", b.startedAt ?? "未設定", "active"]
  );
  return ok(mapMember(all("SELECT * FROM users WHERE id=?", [id])[0]), 201);
}
