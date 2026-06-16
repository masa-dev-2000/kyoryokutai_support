import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { expandRoute } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "10000000-0000-4000-8000-000000000001";
const DEFAULT_USER = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? DEFAULT_USER;
  return ok(await getRepos().activityLogs.listByUser(userId));
}

type InlineExpense = {
  title?: string;
  amount: number;
  purpose: string;
  hasReceipt?: boolean;
};

type CreateBody = {
  userId?: string;
  type: string;
  topic: string;
  hours: number;
  distanceKm?: number;
  body: string;
  date?: string;
  time?: string;
  /** ADR-014 動線①:活動報告と一緒に投入する経費明細(複数可) */
  expenses?: InlineExpense[];
};

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const userId = b.userId ?? DEFAULT_USER;
  const repos = getRepos();

  // 経費明細の合計を activity_logs.expense_amount に集約(月報集計の表示用キャッシュ)
  const expenses = (b.expenses ?? []).filter((e) => e.amount > 0 && e.purpose?.trim());
  const expenseSum = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const created = await repos.activityLogs.create({
    userId,
    type: b.type,
    topic: b.topic,
    hours: b.hours,
    distanceKm: b.distanceKm,
    body: b.body,
    date: b.date,
    time: b.time,
    expense: expenseSum > 0 ? expenseSum : undefined,
  });

  // 経費明細を expenses に同時投入(source_activity_log_id + index で関連)
  const memberName = (await repos.users.nameOf(userId)) ?? "隊員";
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    const exp = await repos.expenses.createFromLog({
      userId,
      activityLogId: created.id,
      receiptIndex: i,
      title: e.title?.trim() || e.purpose.slice(0, 15),
      amount: e.amount,
      purpose: e.purpose.trim(),
      hasReceipt: !!e.hasReceipt,
      status: "申請中",
    });
    // 役場側の承認キューに投入(隊員申請 → 役場が見える、ADR-012)
    const { routeName, steps } = expandRoute("経費", "担当課");
    await repos.approvals.enqueue({
      muni: MUNI,
      kind: "経費",
      applicantId: userId,
      memberName,
      title: `${exp.title} ¥${exp.amount.toLocaleString()}`,
      ai: "活動報告と同時に登録された経費(ADR-014 動線①)。AI 判定材料は申請後に表示されます。",
      detail: {
        kind: "経費",
        purpose: exp.purpose,
        amount: exp.amount,
        payee: "",
        paidDate: created.date,
        receipt: e.hasReceipt,
      },
      routeName,
      steps,
      targetTable: "expenses",
      targetId: exp.id,
    });
  }

  return ok({ ...created, expensesCreated: expenses.length }, 201);
}
