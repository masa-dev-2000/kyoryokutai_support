// 費目別予算枠(活動費 200 万/人)の共有定義。
// 経費カテゴリ(member 側 EXPENSE_CATEGORIES)と一本化し、admin/member/manager/repo から参照する。

export const BUDGET_CATEGORIES = ["活動費", "旅費", "備品", "消耗品", "通信費", "謝金", "その他"] as const;

// 1 隊員あたりの年額既定配分(合計 2,000,000 = 活動費上限)。admin が後で調整可。
export const DEFAULT_ALLOCATION: Record<string, number> = {
  活動費: 800000,
  旅費: 300000,
  備品: 300000,
  消耗品: 200000,
  通信費: 150000,
  謝金: 150000,
  その他: 100000,
};

import { jstFiscalYear } from "@/lib/time";

export const ANNUAL_BUDGET_TOTAL = 2000000;

/** 現在の年度(4 月始まり)を "YYYY" で返す。例: 2026-06 → "2026"、2026-02 → "2025"。 */
export function currentFiscalYear(d: Date = new Date()): string {
  return jstFiscalYear(d);
}

/** 既定配分を upsert 用の配列に変換 */
export function defaultAllocationList(): { category: string; amountLimit: number }[] {
  return BUDGET_CATEGORIES.map((category) => ({ category, amountLimit: DEFAULT_ALLOCATION[category] ?? 0 }));
}
