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

type CreateBody = { userId?: string; title: string; amount: number; purpose: string; status?: string; category?: string };

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const repos = getRepos();
  const userId = b.userId ?? "m1";

  const created = await repos.expenses.create({ userId, title: b.title, amount: b.amount, purpose: b.purpose, status: b.status, category: b.category });

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
