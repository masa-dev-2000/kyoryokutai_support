import { expect, type Locator, test } from "@playwright/test";

async function clickUntilVisible(click: () => Promise<void>, target: Locator) {
  await expect(async () => {
    await click();
    await expect(target).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
}

test.describe("manager screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/manager/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("manager-root")).toBeVisible();
  });

  test("loads the main tabs and approval queue", async ({ page }) => {
    await expect(page.getByTestId("manager-tab-approve")).toBeVisible();
    await expect(page.getByTestId("manager-tab-report")).toBeVisible();
    await expect(page.getByTestId("manager-tab-notice")).toBeVisible();
    await expect(page.getByTestId("approval-card").first()).toBeVisible();
  });

  test("opens an approval detail sheet", async ({ page }) => {
    await clickUntilVisible(
      () => page.getByTestId("approval-card").first().getByTestId("approval-detail-button").click(),
      page.getByTestId("approval-detail-sheet"),
    );
  });

  test("opens a member monthly report sheet", async ({ page }) => {
    await clickUntilVisible(
      () => page.getByTestId("manager-tab-report").click(),
      page.getByTestId("report-member-card").first(),
    );
    await clickUntilVisible(
      () => page.getByTestId("report-member-card").first().click(),
      page.getByTestId("member-month-sheet"),
    );
  });

  test("opens a notice detail sheet", async ({ page }) => {
    await clickUntilVisible(
      () => page.getByTestId("manager-tab-notice").click(),
      page.getByTestId("notice-card").first(),
    );
    await clickUntilVisible(
      () => page.getByTestId("notice-card").first().click(),
      page.getByTestId("notice-detail-sheet"),
    );
  });
});
