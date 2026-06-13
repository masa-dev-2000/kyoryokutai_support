import { ok, readJson } from "@/lib/api/http";
import { all, run, genId } from "@/lib/db";
import { mapExpense } from "@/lib/api/mappers";
import { expandRoute } from "@/lib/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  const rows = all("SELECT * FROM expenses WHERE user_id=? ORDER BY created_at DESC", [userId]);
  return ok(rows.map(mapExpense));
}

type CreateBody = {
  userId?: string;
  title: string;
  amount: number;
  purpose: string;
  status?: string;
};

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const id = genId("exp");
  run(
    `INSERT INTO expenses (id,user_id,municipality_id,expense_kind,title,amount_requested,purpose,status,ai_note,citations,has_receipt,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      b.userId ?? "m1",
      MUNI,
      "single",
      b.title,
      b.amount,
      b.purpose,
      b.status ?? "申請中",
      "AI 判定材料は申請後に表示されます。",
      JSON.stringify([]),
      0,
      new Date().toISOString().slice(0, 10),
    ]
  );

  // 役場側の承認キューに投入(隊員申請 → 役場が見える、ADR-012)
  const member = all<{ name: string }>("SELECT name FROM users WHERE id=?", [b.userId ?? "m1"])[0];
  const { routeName, steps } = expandRoute("経費", "担当課");
  run(
    `INSERT INTO approvals (id,municipality_id,kind,applicant_id,member_name,title,ai,citations,detail,route_name,steps,current_step,status,target_table,target_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      genId("ap"),
      MUNI,
      "経費",
      b.userId ?? "m1",
      member?.name ?? "隊員",
      `${b.title} ¥${b.amount.toLocaleString()}`,
      "隊員からの新規経費申請。AI 判定材料は未生成。",
      JSON.stringify([]),
      JSON.stringify({ kind: "経費", purpose: b.purpose, amount: b.amount, payee: "", paidDate: "", receipt: false }),
      routeName,
      JSON.stringify(steps),
      0,
      "pending",
      "expenses",
      id,
    ]
  );

  const row = all("SELECT * FROM expenses WHERE id=?", [id])[0];
  return ok(mapExpense(row), 201);
}
