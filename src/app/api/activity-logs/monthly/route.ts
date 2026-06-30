import { ok, bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USER = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";

// 指定隊員 × 指定月の活動ログを返す(expense_amount 込み)。
// listForAI は AI 入力用に整形済みかつ expense_amount を持つため、役場の月報詳細表示でも流用する。
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const userId = sp.get("userId") ?? DEFAULT_USER;
  const ym = sp.get("ym");
  if (!ym) return bad("ym(YYYY-MM)が必要です");
  return ok(await getRepos().activityLogs.listForAI(userId, ym));
}
