import { ok, bad, readJson } from "@/lib/api/http";
import { all, run } from "@/lib/db";
import { mapApproval } from "@/lib/api/mappers";
import { applyApprove, applyReject, type ApprovalStep } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { action: "approve" | "reject"; comment?: string };

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await readJson<Body>(req);
  const row = all<Record<string, unknown>>("SELECT * FROM approvals WHERE id=?", [id])[0];
  if (!row) return bad("not found", 404);
  if (row.status !== "pending") return bad("既に処理済みです", 409);

  const steps = JSON.parse(row.steps as string) as ApprovalStep[];
  const current = row.current_step as number;

  let next;
  if (b.action === "approve") {
    next = applyApprove(steps, current);
  } else if (b.action === "reject") {
    if (!b.comment || b.comment.trim().length < 5) return bad("差戻し理由は 5 文字以上が必要です");
    next = applyReject(steps, current, b.comment.trim());
  } else {
    return bad("action は approve / reject");
  }

  run("UPDATE approvals SET steps=?, current_step=?, status=? WHERE id=?", [
    JSON.stringify(next.steps),
    next.currentStep,
    next.status,
    id,
  ]);

  // 月次報告が最終承認されたら monthly_reports を承認済みに反映
  if (next.status === "approved" && row.kind === "月次報告" && row.target_id) {
    run("UPDATE monthly_reports SET status='approved', status_label='役場承認' WHERE id=?", [row.target_id as string]);
  }
  // 経費が最終承認されたら expenses を承認に
  if (next.status === "approved" && row.kind === "経費" && row.target_id) {
    run("UPDATE expenses SET status='承認' WHERE id=?", [row.target_id as string]);
  }

  const updated = all("SELECT * FROM approvals WHERE id=?", [id])[0];
  return ok({ approval: mapApproval(updated), result: next.status });
}
