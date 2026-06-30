import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { expandRoute, expandAssignedRoute } from "@/lib/workflow";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 単一テナント(対象自治体)の ID。デモ USER とは無関係のテナント定数。
const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "10000000-0000-4000-8000-000000000001";

type ActivityInput = {
  type: string;
  topic: string;
  hours: number;
  startTime?: string;
  endTime?: string;
  body: string;
};

type InlineExpense = {
  title?: string;
  amount: number;
  purpose: string;
  hasReceipt?: boolean;
  receiptKey?: string;
};

type CreateBody = {
  date?: string;
  distanceKm?: number;
  feelingScore?: number;
  activities: ActivityInput[];
  expenses?: InlineExpense[];
};

/** GET /api/daily-logs — ログイン本人の日報一覧 */
export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  return ok(await getRepos().dailyLogs.listByUser(sess.userId));
}

/** POST /api/daily-logs — 日報 + 複数活動を一括登録 */
export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const b = await readJson<CreateBody>(req);
  const userId = sess.userId;
  const date = b.date ?? new Date().toISOString().slice(0, 10);
  const repos = getRepos();

  const expenses = (b.expenses ?? []).filter((e) => e.amount > 0 && e.purpose?.trim());
  const expenseSum = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // 日報を upsert（移動距離・手応え・経費合計を保存）
  const dl = await repos.dailyLogs.upsert(userId, date, {
    distanceKm: b.distanceKm,
    feelingScore: b.feelingScore,
    expenseAmount: expenseSum > 0 ? expenseSum : undefined,
  });

  // 各活動を登録
  const time = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const createdActivities = [];
  for (const a of (Array.isArray(b.activities) ? b.activities : [])) {
    const created = await repos.activityLogs.create({
      userId,
      dailyLogId: dl.id,
      type: a.type,
      topic: a.topic,
      hours: a.hours,
      startTime: a.startTime,
      endTime: a.endTime,
      body: a.body,
      date,
      time,
    });
    createdActivities.push(created);
  }

  // 経費明細を登録
  const memberName = (await repos.users.nameOf(userId)) ?? "隊員";
  // ADR-012: 隊員に割り当てられたルートを優先(委託型=団体ステップ含む)。未割当は既定。
  const assigned = await repos.routes.getForUser(userId);
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    const activityLogId = createdActivities[0]?.id;
    if (!activityLogId) continue;
    const exp = await repos.expenses.createFromLog({
      userId,
      activityLogId,
      receiptIndex: i,
      title: e.title?.trim() || e.purpose.slice(0, 15),
      amount: e.amount,
      purpose: e.purpose.trim(),
      hasReceipt: !!e.hasReceipt || !!e.receiptKey,
      receiptKey: e.receiptKey,
      status: "申請中",
    });
    const { routeName, steps } =
      assigned && assigned.steps.length ? expandAssignedRoute(assigned) : expandRoute("経費", "担当課");
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
        category: exp.category,
        payee: "",
        paidDate: date,
        receipt: e.hasReceipt,
      },
      routeName,
      steps,
      targetTable: "expenses",
      targetId: exp.id,
    });
  }

  return ok({ dailyLog: dl, activities: createdActivities, expensesCreated: expenses.length }, 201);
}
