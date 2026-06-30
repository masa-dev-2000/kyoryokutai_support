import { defineConfig, devices } from "@playwright/test";

// member ロールの E2E スモーク。
// - AUTH_PROVIDER=none + DEV_USER_ROLE=member で、外部認証なしに本人(m1)として /member を開く。
// - DB はテスト専用 sqlite(.data/e2e.db)。本番 Supabase には触れない。
// - webServer は本番ビルドを起動(env をここで渡すので OS 非依存)。
//
// 実行: npx playwright install chromium && npm run test:e2e
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/member`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      AUTH_PROVIDER: "none",
      DB_PROVIDER: "sqlite",
      DATABASE_PATH: ".data/e2e.db",
      DEV_USER_ROLE: "member",
      DEV_USER_ID: "m1",
      AI_PROVIDER: "mock",
    },
  },
});
