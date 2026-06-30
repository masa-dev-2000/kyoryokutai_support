import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAdmin } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getRepos().hostOrgs.list());
}

type Body = { id?: string; name: string; kind?: string; contactUserId?: string };

export async function POST(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const b = await readJson<Body>(req);
  const saved = await getRepos().hostOrgs.upsert(b);
  return ok(saved, b.id ? 200 : 201);
}
