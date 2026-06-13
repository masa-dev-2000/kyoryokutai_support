import { ok, readJson } from "@/lib/api/http";
import { all, run, genId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

type Step = {
  id?: string;
  stepNo: number;
  approverType: "dept" | "host_org" | "admin";
  approverLabel: string;
  department?: string;
  hostOrganizationId?: string;
};
type Route = { id: string; name: string; kind: string; isDefault: boolean; steps: Step[] };

function loadRoutes(): Route[] {
  const routes = all<Record<string, unknown>>(
    "SELECT * FROM approval_routes WHERE municipality_id=? ORDER BY kind, is_default DESC",
    [MUNI]
  );
  return routes.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    kind: r.kind as string,
    isDefault: !!(r.is_default as number),
    steps: all<Record<string, unknown>>(
      "SELECT * FROM approval_route_steps WHERE route_id=? ORDER BY step_no",
      [r.id]
    ).map((s) => ({
      id: s.id as string,
      stepNo: s.step_no as number,
      approverType: s.approver_type as Step["approverType"],
      approverLabel: s.approver_label as string,
      department: (s.department as string) ?? undefined,
      hostOrganizationId: (s.host_organization_id as string) ?? undefined,
    })),
  }));
}

export async function GET() {
  return ok(loadRoutes());
}

type CreateBody = { name: string; kind: string; isDefault?: boolean; steps: Step[] };

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const id = genId("rt");
  run(
    "INSERT INTO approval_routes (id,municipality_id,name,kind,is_default) VALUES (?,?,?,?,?)",
    [id, MUNI, b.name, b.kind, b.isDefault ? 1 : 0]
  );
  for (const s of b.steps ?? []) {
    run(
      `INSERT INTO approval_route_steps (id,route_id,step_no,approver_type,approver_label,department,host_organization_id)
       VALUES (?,?,?,?,?,?,?)`,
      [genId("st"), id, s.stepNo, s.approverType, s.approverLabel, s.department ?? null, s.hostOrganizationId ?? null]
    );
  }
  return ok(loadRoutes().find((r) => r.id === id), 201);
}
