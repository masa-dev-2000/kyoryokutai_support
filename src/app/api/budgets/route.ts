import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser, requireAdmin } from "@/lib/api/auth";
import { currentFiscalYear } from "@/lib/budget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/budgets?userId=&fiscalYear= — 費目別予算枠サマリ。本人 or admin/super のみ。 */
export async function GET(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") ?? sess.userId;
  const fiscalYear = url.searchParams.get("fiscalYear") ?? currentFiscalYear();
  const isPrivileged = sess.role === "admin" || sess.role === "super";
  if (userId !== sess.userId && !isPrivileged) return bad("他の隊員の予算枠は閲覧できません", 403);
  return ok(await getRepos().budgets.summaryByUser(userId, fiscalYear));
}

type PutBody = { userId: string; fiscalYear?: string; allocations: { category: string; amountLimit: number }[] };

/** PUT /api/budgets — 隊員の費目別予算枠を全置換(admin のみ)。 */
export async function PUT(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;
  const b = await readJson<PutBody>(req);
  if (!b.userId || !Array.isArray(b.allocations)) return bad("userId / allocations は必須です");
  const fiscalYear = b.fiscalYear ?? currentFiscalYear();
  return ok(await getRepos().budgets.upsert(b.userId, fiscalYear, b.allocations));
}
