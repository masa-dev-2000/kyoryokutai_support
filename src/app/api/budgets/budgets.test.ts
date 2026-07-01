import { describe, it, expect } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";
import {
  ANNUAL_BUDGET_TOTAL,
  BUDGET_CATEGORIES,
  DEFAULT_ALLOCATION,
  currentFiscalYear,
  defaultAllocationList,
} from "@/lib/budget";

// 予算枠配分の回帰テスト。
// - 既定配分(defaultAllocationList)が年間総額に一致すること。
// - 新規隊員を作成すると seedDefaultBudget により当年度の予算枠が
//   既定配分どおりに自動投入されること。

describe("予算 既定配分 (budget.ts)", () => {
  it("既定配分の合計が年間総額(2,000,000)に一致する", () => {
    const total = defaultAllocationList().reduce((s, a) => s + a.amountLimit, 0);
    expect(ANNUAL_BUDGET_TOTAL).toBe(2_000_000);
    expect(total).toBe(ANNUAL_BUDGET_TOTAL);
  });

  it("既定配分は全費目を網羅する", () => {
    const cats = defaultAllocationList().map((a) => a.category);
    expect(cats).toEqual([...BUDGET_CATEGORIES]);
    for (const c of BUDGET_CATEGORIES) {
      expect(DEFAULT_ALLOCATION[c]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("seedDefaultBudget (新規隊員作成時の予算枠自動投入)", () => {
  it("members.upsert で作成した隊員に当年度の既定予算枠が入る", async () => {
    const created = await sqliteRepos.members.upsert({
      name: "予算 検証太郎",
      role: "member",
    }, "muni_shinonsen");
    expect(created.id).toBeTruthy();

    const fy = currentFiscalYear();
    const lines = await sqliteRepos.budgets.summaryByUser(created.id, fy);

    // 費目ごとに既定配分の上限額が設定され、未使用(remaining=上限)であること。
    for (const cat of BUDGET_CATEGORIES) {
      const line = lines.find((l) => l.category === cat);
      expect(line, `費目 ${cat} の予算行が無い`).toBeTruthy();
      expect(line!.amountLimit).toBe(DEFAULT_ALLOCATION[cat] ?? 0);
      expect(line!.used).toBe(0);
      expect(line!.remaining).toBe(line!.amountLimit);
    }

    const total = lines.reduce((s, l) => s + l.amountLimit, 0);
    expect(total).toBe(ANNUAL_BUDGET_TOTAL);
  });
});
