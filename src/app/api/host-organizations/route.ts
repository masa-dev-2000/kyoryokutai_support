import { ok, readJson } from "@/lib/api/http";
import { all, get, run, genId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

type HostOrg = { id: string; name: string; kind?: string; contactUserId?: string };

function mapHost(r: Record<string, unknown>): HostOrg {
  return {
    id: r.id as string,
    name: r.name as string,
    kind: (r.kind as string) ?? undefined,
    contactUserId: (r.contact_user_id as string) ?? undefined,
  };
}

export async function GET() {
  const rows = all<Record<string, unknown>>(
    "SELECT * FROM host_organizations WHERE municipality_id=? ORDER BY name",
    [MUNI]
  );
  return ok(rows.map(mapHost));
}

type Body = { id?: string; name: string; kind?: string; contactUserId?: string };

export async function POST(req: Request) {
  const b = await readJson<Body>(req);
  if (b.id && get("SELECT id FROM host_organizations WHERE id=?", [b.id])) {
    run("UPDATE host_organizations SET name=?, kind=?, contact_user_id=? WHERE id=?", [
      b.name,
      b.kind ?? null,
      b.contactUserId ?? null,
      b.id,
    ]);
    return ok(mapHost(all("SELECT * FROM host_organizations WHERE id=?", [b.id])[0]));
  }
  const id = b.id ?? genId("ho");
  run(
    "INSERT INTO host_organizations (id,municipality_id,name,kind,contact_user_id) VALUES (?,?,?,?,?)",
    [id, MUNI, b.name, b.kind ?? null, b.contactUserId ?? null]
  );
  return ok(mapHost(all("SELECT * FROM host_organizations WHERE id=?", [id])[0]), 201);
}
