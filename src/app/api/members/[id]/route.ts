import { ok } from "@/lib/api/http";
import { run } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 退任(データは保持し status=retired に)+ 担当割当から外す。
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  run("UPDATE users SET status='retired' WHERE id=?", [id]);
  run("DELETE FROM assignments WHERE member_id=?", [id]);
  return ok({ id, status: "retired" });
}
