import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const kind = new URL(req.url).searchParams.get("kind") ?? "topic";
  return ok(await getRepos().topics.list(sess.userId, kind));
}

export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const { name, kind = "topic" } = await readJson<{ name: string; kind?: string }>(req);
  return ok(await getRepos().topics.add(sess.userId, name, kind));
}

export async function DELETE(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const sp = new URL(req.url).searchParams;
  const name = sp.get("name") ?? "";
  const kind = sp.get("kind") ?? "topic";
  return ok(await getRepos().topics.remove(sess.userId, name, kind));
}
