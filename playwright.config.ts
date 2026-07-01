import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://127.0.0.1:${port}`;
const databasePath = process.env.E2E_DATABASE_PATH ?? `.data/e2e-super-${Date.now()}.db`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      ...process.env,
      AUTH_PROVIDER: "none",
      DEV_USER_ID: "u_super",
      DEV_USER_ROLE: "super",
      DB_PROVIDER: "sqlite",
      DATABASE_PATH: databasePath,
      AI_PROVIDER: "mock",
      STORAGE_PROVIDER: "local",
      EMAIL_PROVIDER: "console",
      NEXT_PUBLIC_APP_URL: baseURL,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
