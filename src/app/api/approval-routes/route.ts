import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import type { RouteStepDTO } from "@/lib/db/repositories/types";
import { requireAdmin, requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 承認ルート構成は役場職員(manager/admin)のみ閲覧可。未認証アクセスを遮断。
export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  if (sess.role !== "manager" && sess.role !== "admin") return bad("権限がありません", 403);
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
