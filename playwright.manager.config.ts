import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_MANAGER_PORT ?? 3020);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const databasePath = process.env.E2E_MANAGER_DATABASE_PATH ?? ".data/e2e-manager.db";
const shouldStartServer = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /manager\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  retries: 0,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: shouldStartServer
    ? {
        command: `npm run dev -- --webpack --hostname 127.0.0.1 --port ${port}`,
        url: `${baseURL}/manager/`,
        timeout: 120_000,
        reuseExistingServer: false,
        env: {
          ...process.env,
          AUTH_PROVIDER: "none",
          DEV_USER_ROLE: "manager",
          DEV_USER_ID: "s1",
          DB_PROVIDER: "sqlite",
          DATABASE_PATH: databasePath,
          AI_PROVIDER: "mock",
          STORAGE_PROVIDER: "local",
          EMAIL_PROVIDER: "console",
          NEXT_PUBLIC_APP_URL: baseURL,
        },
      }
    : undefined,
});
