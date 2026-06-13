import { ok } from "@/lib/api/http";
import { run } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  run("DELETE FROM assignments WHERE staff_id=?", [id]);
  run("DELETE FROM users WHERE id=? AND role='manager'", [id]);
  return ok({ id, deleted: true });
}
