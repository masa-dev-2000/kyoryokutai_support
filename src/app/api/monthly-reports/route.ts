import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { expandRoute } from "@/lib/workflow";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ローカル sqlite のフォールバックは seed/sqlite の自治体 id("muni_shinonsen")に合わせる。
// 以前は UUID 既定で、env 未設定のローカル開発だと提出月報の承認キューが seed と別自治体になり空表示だった(H5)。
// 本番(Supabase)は NEXT_PUBLIC_DEMO_MUNI_ID を設定するためこの既定は使われない。
const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "muni_shinonsen";

export async function GET(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  // 既定は本人。役場職員(manager/admin)は ?userId で担当隊員の月報を閲覧可。
  let targetUserId = sess.userId;
  const qUserId = new URL(req.url).searchParams.get("userId");
  if (qUserId && qUserId !== sess.userId) {
    if (sess.role !== "manager" && sess.role !== "admin") return bad("権限がありません", 403);
    targetUserId = qUserId;
  }
  return ok(await getRepos().monthlyReports.listByUser(targetUserId));
}

type SubmitBody = { ym: string; markdown: string; plan?: string };

/** POST /api/monthly-reports — 月報を役場に提出(永続化 + 承認キュー投入) */
export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const b = await readJson<SubmitBody>(req);
  if (!b.ym || !/^\d{4}-\d{2}$/.test(b.ym)) return bad("ym(YYYY-MM)が必要です");
  if (!b.markdown?.trim()) return bad("月報本文が空です");

  const repos = getRepos();
  // なりすまし防止: 提出者はセッション本人に固定(body の userId は受け付けない)
  const userId = sess.userId;
  const report = await repos.monthlyReports.submit({ userId, ym: b.ym, markdown: b.markdown.trim(), plan: b.plan?.trim() });

  // 再提出時の二重キュー防止: 同一隊員・同月の月次報告が既に承認待ちなら再エンキューしない。
  // submit() は同月を上書きするため report.id は不変。役場は既存の承認1件で再提出後の内容も確認できる。
  const title = `${report.yearMonth} の月次報告`;
  const alreadyQueued = (await repos.approvals.listPending(MUNI)).some(
    (a) => a.kind === "月次報告" && a.applicantId === userId && a.title === title
  );

  // 役場側の承認キューに投入(月次報告 ルート)
  if (!alreadyQueued) {
    const memberName = (await repos.users.nameOf(userId)) ?? "隊員";
    const { routeName, steps } = expandRoute("月次報告", "担当課");
    await repos.approvals.enqueue({
      muni: MUNI,
      kind: "月次報告",
      applicantId: userId,
      memberName,
      title,
      ai: "隊員が提出した月次報告。活動ログから AI 生成・本人確認済み。",
      detail: { kind: "月次報告", ym: b.ym, body: b.markdown.trim(), plan: b.plan?.trim() ?? "" },
      routeName,
      steps,
      targetTable: "monthly_reports",
      targetId: report.id,
    });
  }

  return ok(report, 201);
}
