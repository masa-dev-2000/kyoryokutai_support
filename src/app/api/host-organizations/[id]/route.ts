import { ok, bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAdmin } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const removed = await getRepos().hostOrgs.remove(id, sess.municipalityId);
  if (!removed) return bad("見つかりません", 404);
  return ok({ id, deleted: true });
}
