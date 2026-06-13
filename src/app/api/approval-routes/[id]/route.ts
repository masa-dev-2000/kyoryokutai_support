import { ok } from "@/lib/api/http";
import { run } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  run("DELETE FROM approval_route_steps WHERE route_id=?", [id]);
  run("DELETE FROM approval_routes WHERE id=?", [id]);
  return ok({ id, deleted: true });
}
