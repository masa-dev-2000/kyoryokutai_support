import { ok } from "@/lib/api/http";
import { run } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ルートのステップから参照されている場合は外す(整合性)
  run("UPDATE approval_route_steps SET host_organization_id=NULL WHERE host_organization_id=?", [id]);
  run("DELETE FROM host_organizations WHERE id=?", [id]);
  return ok({ id, deleted: true });
}
