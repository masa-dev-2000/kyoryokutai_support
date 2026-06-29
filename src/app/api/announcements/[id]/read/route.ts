import { ok } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/announcements/[id]/read — 既読を記録する */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  await getRepos().announcements.markRead(id, sess.userId);
  return ok({ ok: true });
}
