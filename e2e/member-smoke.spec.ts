import { test, expect } from "@playwright/test";

// member ロールのスモーク E2E。
// AUTH_PROVIDER=none で本人(m1)として /member が開く(ログイン不要)。
// まずは「アプリが起動し主要タブが描画される」ことを担保する軽量スモーク。

test.describe("member スモーク", () => {
  test("活動記録タブが起動し、主要タブと月セレクタが描画される", async ({ page }) => {
    await page.goto("/member");

    // 既定は活動記録タブ
    await expect(page.getByRole("heading", { name: "活動記録" })).toBeVisible();

    // タブが揃っている
    for (const label of ["活動", "経費", "連絡", "事例"]) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
    }

    // #88: 月セレクタ(対象月の直接選択)
    await expect(page.getByRole("button", { name: "対象の月を選択" })).toBeVisible();
  });

  test("経費タブに切り替えると一覧と申請ボタンが出る", async ({ page }) => {
    await page.goto("/member");
    await page.getByRole("button", { name: "経費", exact: true }).click();

    await expect(page.getByRole("heading", { name: "経費" })).toBeVisible();
    // サブタブ + 申請 FAB
    await expect(page.getByRole("button", { name: "経費申請" })).toBeVisible();
  });
});

// 完全フロー(ログイン→活動記録→保存反映→経費申請→月報提出)は
// data-testid 整備後に拡張する。現状はセレクタ堅牢性のためスモークに留める。
test.skip("フル業務フロー(活動記録→保存→経費→月報提出)", async () => {
  // TODO: カレンダー日タップ→活動入力(種類/トピック/時刻)→保存→当日に件数反映を確認
  // TODO: 今日のまとめで経費追加→保存→経費タブ申請中に表示を確認
  // TODO: 月報生成→提出→提出済バッジを確認
});
