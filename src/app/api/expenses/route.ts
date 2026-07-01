import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { expandRoute, expandAssignedRoute } from "@/lib/workflow";
import { requireAppUser } from "@/lib/api/auth";
import { jstDateString } from "@/lib/time";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  return ok(await getRepos().expenses.listByUser(sess.userId));
}

type CreateBody = {
  title: string;
  amount: number;
  purpose: string;
  status?: string;
  category?: string;
  /** ADR-021: 日報から経費を起票する場合に渡す。省略時は当日の日報を自動 upsert して結線する */
  dailyLogId?: string;
  date?: string;
  receiptKey?: string;
};

export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const b = await readJson<CreateBody>(req);
  if (!b.title?.trim() || !(b.amount > 0) || !b.purpose?.trim()) return bad("title / amount / purpose は必須です");
  const repos = getRepos();
  const userId = sess.userId;

  // ADR-021: daily_log_id の解決 — 明示指定 > 当日 upsert
  let dailyLogId = b.dailyLogId;
  if (!dailyLogId) {
    const date = b.date ?? jstDateString();
    const dl = await repos.dailyLogs.upsert(userId, date);
    dailyLogId = dl.id;
  }

  const created = await repos.expenses.create({ userId, title: b.title, amount: b.amount, purpose: b.purpose, status: b.status, category: b.category, dailyLogId, receiptKey: b.receiptKey });

  // 役場側の承認キューに投入(隊員申請 → 役場が見える、ADR-012)
  const memberName = (await repos.users.nameOf(userId)) ?? "隊員";
  // 承認キューのテナントは本人の所属自治体(固定定数では本番 FK 違反になる)
  const muni = await repos.users.municipalityOf(userId);
  // ADR-012: 隊員に割り当てられたルートを優先(委託型=団体ステップ含む)。未割当は既定。
  const assigned = await repos.routes.getForUser(userId);
  const { routeName, steps } =
    assigned && assigned.steps.length ? expandAssignedRoute(assigned) : expandRoute("経費", "担当課");
  await repos.approvals.enqueue({
    muni,
    kind: "経費",
    applicantId: userId,
    memberName,
    title: `${b.title} ¥${b.amount.toLocaleString()}`,
    ai: "隊員からの新規経費申請。AI 判定材料は未生成。",
    detail: { kind: "経費", purpose: b.purpose, amount: b.amount, category: created.category, payee: "", paidDate: "", receipt: false },
    routeName,
    steps,
    targetTable: "expenses",
    targetId: created.id,
  });

  return ok(created, 201);
}
