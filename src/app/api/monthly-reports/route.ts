import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { expandRoute } from "@/lib/workflow";
import { requireAppUser, requireSession } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "10000000-0000-4000-8000-000000000001";
const DEFAULT_USER = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";

export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  return ok(await getRepos().monthlyReports.listByUser(sess.userId));
}

type SubmitBody = { userId?: string; ym: string; markdown: string; plan?: string };

/** POST /api/monthly-reports — 月報を役場に提出(永続化 + 承認キュー投入) */
export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;
  const b = await readJson<SubmitBody>(req);
  if (!b.ym || !/^\d{4}-\d{2}$/.test(b.ym)) return bad("ym(YYYY-MM)が必要です");
  if (!b.markdown?.trim()) return bad("月報本文が空です");

  const repos = getRepos();
  const userId = b.userId ?? DEFAULT_USER;
  const report = await repos.monthlyReports.submit({ userId, ym: b.ym, markdown: b.markdown.trim(), plan: b.plan?.trim() });

  // 役場側の承認キューに投入(月次報告 ルート)
  const memberName = (await repos.users.nameOf(userId)) ?? "隊員";
  const { routeName, steps } = expandRoute("月次報告", "担当課");
  await repos.approvals.enqueue({
    muni: MUNI,
    kind: "月次報告",
    applicantId: userId,
    memberName,
    title: `${report.yearMonth} の月次報告`,
    ai: "隊員が提出した月次報告。活動ログから AI 生成・本人確認済み。",
    detail: { kind: "月次報告", ym: b.ym, body: b.markdown.trim(), plan: b.plan?.trim() ?? "" },
    routeName,
    steps,
    targetTable: "monthly_reports",
    targetId: report.id,
  });

  return ok(report, 201);
}
