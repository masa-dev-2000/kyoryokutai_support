import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { expandRoute } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  return ok(await getRepos().expenses.listByUser(userId));
}

type CreateBody = {
  userId?: string;
  title: string;
  amount: number;
  purpose: string;
  status?: string;
  category?: string;
  /** ADR-021: 日報から経費を起票する場合に渡す。省略時は当日の日報を自動 upsert して結線する */
  dailyLogId?: string;
  date?: string;
};

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const repos = getRepos();
  const userId = b.userId ?? "m1";

  // ADR-021: daily_log_id の解決 — 明示指定 > 当日 upsert
  let dailyLogId = b.dailyLogId;
  if (!dailyLogId) {
    const date = b.date ?? new Date().toISOString().slice(0, 10);
    const dl = await repos.dailyLogs.upsert(userId, date);
    dailyLogId = dl.id;
  }

  const created = await repos.expenses.create({ userId, title: b.title, amount: b.amount, purpose: b.purpose, status: b.status, category: b.category, dailyLogId });

  // 役場側の承認キューに投入(隊員申請 → 役場が見える、ADR-012)
  const memberName = (await repos.users.nameOf(userId)) ?? "隊員";
  const { routeName, steps } = expandRoute("経費", "担当課");
  await repos.approvals.enqueue({
    muni: MUNI,
    kind: "経費",
    applicantId: userId,
    memberName,
    title: `${b.title} ¥${b.amount.toLocaleString()}`,
    ai: "隊員からの新規経費申請。AI 判定材料は未生成。",
    detail: { kind: "経費", purpose: b.purpose, amount: b.amount, payee: "", paidDate: "", receipt: false },
    routeName,
    steps,
    targetTable: "expenses",
    targetId: created.id,
  });

  return ok(created, 201);
}
