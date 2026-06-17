import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USER = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const userId = sp.get("userId") ?? DEFAULT_USER;
  const kind = sp.get("kind") ?? "topic";
  return ok(await getRepos().topics.list(userId, kind));
}

export async function POST(req: Request) {
  const { userId = DEFAULT_USER, name, kind = "topic" } = await readJson<{ userId?: string; name: string; kind?: string }>(req);
  return ok(await getRepos().topics.add(userId, name, kind));
}

export async function DELETE(req: Request) {
  const sp = new URL(req.url).searchParams;
  const userId = sp.get("userId") ?? DEFAULT_USER;
  const name = sp.get("name") ?? "";
  const kind = sp.get("kind") ?? "topic";
  return ok(await getRepos().topics.remove(userId, name, kind));
}
