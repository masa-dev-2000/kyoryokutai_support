import { ok } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

// 進行中(pending)の承認のみ返す。完了/差戻しはキューから外れる。
export async function GET(req: Request) {
  const muni = new URL(req.url).searchParams.get("muni") ?? MUNI;
  return ok(await getRepos().approvals.listPending(muni));
}
