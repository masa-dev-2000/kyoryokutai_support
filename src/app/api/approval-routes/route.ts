import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import type { RouteStepDTO } from "@/lib/db/repositories/types";
import { requireAdmin } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getRepos().routes.list());
}

type CreateBody = { name: string; kind: string; isDefault?: boolean; steps: RouteStepDTO[] };
type UpsertBody = CreateBody & { id?: string };

export async function POST(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const b = await readJson<CreateBody>(req);
  return ok(await getRepos().routes.create(b), 201);
}

export async function PUT(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const b = await readJson<UpsertBody>(req);
  return ok(await getRepos().routes.upsert(b));
}
