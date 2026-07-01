import { expect, test, type Dialog, type Page } from "@playwright/test";

const seedMunicipality = "新温泉町";
const budgetError = "年間活動費枠は0以上の数値で入力してください";

async function gotoSuper(page: Page) {
  await page.goto("/super/");
  await expect(page.getByText("運営者ダッシュボード")).toBeVisible();
  await expect(page.getByRole("button", { name: "概要" })).toBeVisible();
  await expect(page.getByText(seedMunicipality).first()).toBeVisible();
}

async function openSeedMunicipality(page: Page) {
  await gotoSuper(page);
  await page.getByRole("cell", { name: seedMunicipality }).first().click();
  await expect(page.getByRole("button", { name: "編集" })).toBeVisible();
  await expect(page.getByText("アカウント")).toBeVisible();
}

function seedOverviewRow(page: Page) {
  return page.getByRole("row", { name: new RegExp(seedMunicipality) }).first();
}

async function handleDialog(page: Page, action: () => Promise<unknown>, handler: (dialog: Dialog) => Promise<void>) {
  const dialogHandled = new Promise<void>((resolve, reject) => {
    page.once("dialog", async (dialog) => {
      try {
        await handler(dialog);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  await action();
  await dialogHandled;
}

test.describe("super dashboard", () => {
  test("shows overview and analytics for a local super user", async ({ page }) => {
    await gotoSuper(page);

    await expect(page.getByText("自治体").first()).toBeVisible();
    await expect(page.getByText("隊員").first()).toBeVisible();
    await expect(page.getByText("役場職員")).toBeVisible();
    await expect(page.getByText("運営者(super)")).toBeVisible();
    await expect(page.getByRole("button", { name: "自治体を追加" })).toBeVisible();
    await expect(page.getByRole("button", { name: "管理者を招待" }).first()).toBeVisible();

    await page.getByRole("button", { name: "分析" }).click();
    await expect(page.getByText("直近6ヶ月の活動記録")).toBeVisible();
    await expect(page.getByText("自治体別活動量")).toBeVisible();
    await expect(page.getByText(seedMunicipality).first()).toBeVisible();
  });

  test("creates a municipality and continues to the admin setup modal", async ({ page }) => {
    const name = `E2Eテスト町 ${Date.now()}`;

    await gotoSuper(page);
    await page.getByRole("button", { name: "自治体を追加" }).click();
    await expect(page.getByRole("heading", { name: "自治体を追加" })).toBeVisible();

    await page.getByLabel("自治体名").fill(name);
    await page.getByLabel("都道府県").fill("東京都");
    await page.getByLabel("年間活動費枠(円)").fill("");
    await page.getByRole("button", { name: "作成する" }).click();
    await expect(page.getByText(budgetError)).toBeVisible();

    await page.getByLabel("年間活動費枠(円)").fill("123456");
    await page.getByRole("button", { name: "作成する" }).click();

    await expect(page.getByRole("heading", { name: `${name} の管理者を設定` })).toBeVisible();
    await page.getByRole("button", { name: /管理者を設定を閉じる/ }).click();
    await expect(page.getByText(name).first()).toBeVisible();
  });

  test("shows municipality detail, account controls, and edit validation", async ({ page }) => {
    await openSeedMunicipality(page);

    await expect(page.getByText(/兵庫県・年間予算/)).toBeVisible();
    await expect(page.getByText("最近の保留承認")).toBeVisible();
    await expect(page.locator('select[aria-label$="のroleを変更"]').first()).toBeVisible();
    await expect(page.locator('select[aria-label$="の状態を変更"]').first()).toBeVisible();
    await expect(page.locator('select[aria-label$="の所属自治体を変更"]').first()).toBeVisible();
    await expect(page.locator('button[aria-label$="を削除"]').first()).toBeVisible();

    await page.getByRole("button", { name: "編集" }).click();
    await expect(page.getByRole("heading", { name: "自治体を編集" })).toBeVisible();
    await page.getByLabel("年間活動費枠(円)").fill("-1");
    await page.getByRole("button", { name: "保存する" }).click();
    await expect(page.getByText(budgetError)).toBeVisible();
    await page.getByRole("button", { name: "自治体を編集を閉じる" }).click();
  });

  test("requires confirmation for dangerous account changes and blocks deleting a municipality with users", async ({ page }) => {
    await gotoSuper(page);
    await seedOverviewRow(page).getByRole("button", { name: "管理者を招待" }).click();
    await page.getByRole("button", { name: "既存ユーザーを昇格" }).click();
    const promoteSelect = page.getByLabel("昇格するユーザー");
    await expect(promoteSelect).toBeVisible();
    await promoteSelect.selectOption({ index: 1 });
    await handleDialog(
      page,
      () => page.getByRole("button", { name: "admin に昇格" }).click(),
      async (dialog) => {
        expect(dialog.message()).toContain("adminに昇格");
        await dialog.dismiss();
      }
    );
    await page.getByRole("button", { name: /管理者を設定を閉じる/ }).click();

    await openSeedMunicipality(page);

    const roleSelect = page.locator('select[aria-label$="のroleを変更"]').first();
    await handleDialog(
      page,
      () => roleSelect.selectOption("super"),
      async (dialog) => {
        expect(dialog.message()).toContain("super権限");
        await dialog.dismiss();
      }
    );

    await handleDialog(
      page,
      () => page.getByRole("button", { name: "削除" }).first().click(),
      async (dialog) => {
        expect(dialog.message()).toContain(`自治体「${seedMunicipality}」を削除`);
        await dialog.accept();
      }
    );
    await expect(page.getByText(/所属ユーザーが .* 名います/)).toBeVisible();
  });
});
