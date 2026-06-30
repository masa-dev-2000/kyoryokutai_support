import { ok, bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ローカル sqlite のフォールバックは seed/sqlite の自治体 id("muni_shinonsen")に合わせる。
// 以前は UUID 既定で、env 未設定のローカル開発だと承認キューが seed と別自治体になり空表示だった(H5)。
// 本番(Supabase)は NEXT_PUBLIC_DEMO_MUNI_ID を設定するためこの既定は使われない。
const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "muni_shinonsen";

// 進行中(pending)の承認のみ返す。完了/差戻しはキューから外れる。
// 承認キューは役場職員(manager/admin)のみ閲覧可。未認証アクセスを遮断。
export async function GET(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  if (sess.role !== "manager" && sess.role !== "admin") return bad("権限がありません", 403);
  const muni = new URL(req.url).searchParams.get("muni") ?? MUNI;
  return ok(await getRepos().approvals.listPending(muni));
}
