import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReadBody = { userId?: string };

/** POST /api/announcements/[id]/read — 既読を記録する */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await readJson<ReadBody>(req);
  const userId = b.userId ?? "a1000000-0000-4000-8000-000000000001";
  await getRepos().announcements.markRead(id, userId);
  return ok({ ok: true });
}
