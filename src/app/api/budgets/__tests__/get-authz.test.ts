import { afterEach, describe, expect, it, vi } from "vitest";

async function getBudget(role: string, devUserId: string, qUserId: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", devUserId);
  const mod = await import("../route");
  const res = await mod.GET(new Request(`http://test/api/budgets?userId=${qUserId}&fiscalYear=2026`));
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/budgets 閲覧スコープ", () => {
  it("member は他人の予算枠を取得できない", async () => {
    const r = await getBudget("member", "m2", "m1");
    expect(r.status).toBe(403);
  });

  it("manager は対象隊員の予算枠を取得できる", async () => {
    const r = await getBudget("manager", "s1", "m1");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.json)).toBe(true);
    expect(r.json.length).toBeGreaterThan(0);
  });
});
