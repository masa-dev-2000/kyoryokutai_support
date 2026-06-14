import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import type { RouteStepDTO } from "@/lib/db/repositories/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getRepos().routes.list());
}

type CreateBody = { name: string; kind: string; isDefault?: boolean; steps: RouteStepDTO[] };

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  return ok(await getRepos().routes.create(b), 201);
}
