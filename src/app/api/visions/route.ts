import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/visions — ログイン本人の任期ビジョン(無ければ null) */
export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  return ok(await getRepos().visions.get(sess.userId));
}

/** POST /api/visions — 任期ビジョンを upsert */
export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const b = await readJson<{ body?: string }>(req);
  return ok(await getRepos().visions.upsert(sess.userId, b.body ?? ""), 201);
}
