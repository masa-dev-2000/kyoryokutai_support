import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";
import type { WeekPlan, CycleIntake } from "@/lib/db/repositories/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/monthly-cycles[?ym=YYYY-MM] — ログイン本人のサイクル
 *  ym 指定: 当該月(無ければ null) / 未指定: 全サイクル一覧 */
export async function GET(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const ym = new URL(req.url).searchParams.get("ym");
  const repos = getRepos();
  if (ym) return ok(await repos.monthlyCycles.getByMonth(sess.userId, ym));
  return ok(await repos.monthlyCycles.listByUser(sess.userId));
}

type Body = {
  ym?: string;
  monthlyGoal?: string;
  actionPlan?: WeekPlan[];
  intake?: CycleIntake | null;
  reflection?: string;
  status?: string;
};

/** POST /api/monthly-cycles — 月次サイクルを upsert(user_id + ym 単位) */
export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const b = await readJson<Body>(req);
  if (!b.ym) return bad("ym(YYYY-MM)が必要です");
  const userId = sess.userId;
  const cycle = await getRepos().monthlyCycles.upsert(userId, b.ym, {
    monthlyGoal: b.monthlyGoal,
    actionPlan: b.actionPlan,
    intake: b.intake,
    reflection: b.reflection,
    status: b.status,
  });
  return ok(cycle, 201);
}
