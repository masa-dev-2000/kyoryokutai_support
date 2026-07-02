import { describe, it, expect, beforeAll } from "vitest";
import { all, get, run, genId } from "@/lib/db";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";

// #169 回帰防止:
// 予算枠(budget_allocations)の municipality_id は固定定数ではなく
// 「対象ユーザーの所属自治体」で書き込まれること。
// 修正前は seedDefaultBudget / budgets.upsert が定数 MUNI を使っており、
// 本番(定数テナント不在)では FK 違反、別テナントでは誤テナント書込になっていた。

const MUNI_B = "muni_test_budget_b";

describe("#169 予算枠は対象ユーザーの自治体に紐づく", () => {
  beforeAll(() => {
    run("INSERT INTO municipalities (id,name,prefecture,annual_budget) VALUES (?,?,?,?)", [
      MUNI_B,
      "Budget Test City B",
      "Test Prefecture",
      2000000,
    ]);
  });

  it("members.upsert(新規)は本人の自治体で既定予算枠を生成する", async () => {
    const saved = await sqliteRepos.members.upsert({ name: "B町 隊員", role: "移住促進" }, MUNI_B);
    const rows = all<{ municipality_id: string }>(
      "SELECT municipality_id FROM budget_allocations WHERE user_id=?",
      [saved.id]
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.municipality_id === MUNI_B)).toBe(true);
  });

  it("budgets.upsert(insert 分岐)は本人の自治体で allocation を作る", async () => {
    const userId = genId("m");
    run(
      `INSERT INTO users (id,municipality_id,organization_type,role,name,email,role_label,term,started_at,status)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [userId, MUNI_B, "member", "member", "B町 隊員2", `${userId}@member.example.jp`, "農業支援", "1 年目", "2026-04-01", "active"]
    );
    await sqliteRepos.budgets.upsert(userId, "2026", [{ category: "活動費", amountLimit: 500000 }]);
    const row = get<{ municipality_id: string }>(
      "SELECT municipality_id FROM budget_allocations WHERE user_id=? AND fiscal_year=? AND category=?",
      [userId, "2026", "活動費"]
    );
    expect(row?.municipality_id).toBe(MUNI_B);
  });

  it("members.upsert は存在しない id 指定を TENANT_MISMATCH で拒否する(id 捏造の防止)", async () => {
    await expect(
      sqliteRepos.members.upsert({ id: "no_such_id", name: "捏造", role: "移住促進" }, MUNI_B)
    ).rejects.toThrow("TENANT_MISMATCH");
  });
});
