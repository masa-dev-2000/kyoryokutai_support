import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { applyApprove, applyReject, type ApprovalStep } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { action: "approve" | "reject"; comment?: string };

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await readJson<Body>(req);
  const repos = getRepos();

  const row = await repos.approvals.getRaw(id);
  if (!row) return bad("not found", 404);
  if (row.status !== "pending") return bad("既に処理済みです", 409);

  const steps = JSON.parse(row.steps) as ApprovalStep[];
  const current = row.current_step;

  let next;
  if (b.action === "approve") {
    next = applyApprove(steps, current);
  } else if (b.action === "reject") {
    if (!b.comment || b.comment.trim().length < 5) return bad("差戻し理由は 5 文字以上が必要です");
    next = applyReject(steps, current, b.comment.trim());
  } else {
    return bad("action は approve / reject");
  }

  await repos.approvals.updateState(id, next.steps, next.currentStep, next.status);

  // 最終承認の反映
  if (next.status === "approved" && row.target_id) {
    if (row.kind === "月次報告") await repos.monthlyReports.markApproved(row.target_id);
    if (row.kind === "経費") await repos.expenses.update(row.target_id, { status: "承認" });
  }

  const updated = await repos.approvals.getById(id);
  return ok({ approval: updated, result: next.status });
}
