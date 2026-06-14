import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getRepos().hostOrgs.list());
}

type Body = { id?: string; name: string; kind?: string; contactUserId?: string };

export async function POST(req: Request) {
  const b = await readJson<Body>(req);
  const saved = await getRepos().hostOrgs.upsert(b);
  return ok(saved, b.id ? 200 : 201);
}
