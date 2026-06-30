import { ok } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAdmin } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 退任(データは保持し status=retired に)+ 担当割当から外す。
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  await getRepos().members.retire(id);
  return ok({ id, status: "retired" });
}
