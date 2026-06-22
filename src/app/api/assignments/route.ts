import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSession } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// { [staffId]: memberId[] } を返す(admin 画面の形)
export async function GET() {
  return ok(await getRepos().assignments.map());
}

// 指定職員の担当隊員を total replace
export async function PUT(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;
  const { staffId, memberIds } = await readJson<{ staffId: string; memberIds: string[] }>(req);
  await getRepos().assignments.replace(staffId, memberIds ?? []);
  return ok({ staffId, memberIds });
}
