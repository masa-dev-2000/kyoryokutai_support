import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { expandRoute } from "@/lib/workflow";
import { requireSession } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "10000000-0000-4000-8000-000000000001";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";
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
  receiptKey?: string;
};

export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;
  const b = await readJson<CreateBody>(req);
  if (!b.title?.trim() || !(b.amount > 0) || !b.purpose?.trim()) return bad("title / amount / purpose は必須です");
  const repos = getRepos();
  const userId = b.userId ?? process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";

  // ADR-021: daily_log_id の解決 — 明示指定 > 当日 upsert
  let dailyLogId = b.dailyLogId;
  if (!dailyLogId) {
    const date = b.date ?? new Date().toISOString().slice(0, 10);
    const dl = await repos.dailyLogs.upsert(userId, date);
    dailyLogId = dl.id;
  }

  const created = await repos.expenses.create({ userId, title: b.title, amount: b.amount, purpose: b.purpose, status: b.status, category: b.category, dailyLogId, receiptKey: b.receiptKey });

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
