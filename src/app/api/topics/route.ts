import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  return ok(await getRepos().topics.list(userId));
}

export async function POST(req: Request) {
  const { userId = "m1", name } = await readJson<{ userId?: string; name: string }>(req);
  return ok(await getRepos().topics.add(userId, name));
}

export async function DELETE(req: Request) {
  const sp = new URL(req.url).searchParams;
  const userId = sp.get("userId") ?? "m1";
  const name = sp.get("name") ?? "";
  return ok(await getRepos().topics.remove(userId, name));
}
