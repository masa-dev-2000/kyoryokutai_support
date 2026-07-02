import { afterEach, describe, expect, it, vi } from "vitest";

async function getMonthly(role: string, devUserId: string, qUserId: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", devUserId);
  const mod = await import("../route");
  const res = await mod.GET(new Request(`http://test/api/activity-logs/monthly?userId=${qUserId}&ym=2026-05`));
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/activity-logs/monthly 閲覧スコープ", () => {
  it("member は他人の月次活動ログを取得できない", async () => {
    const r = await getMonthly("member", "m2", "m1");
    expect(r.status).toBe(403);
  });

  it("manager は対象隊員の月次活動ログを取得できる", async () => {
    const r = await getMonthly("manager", "s1", "m1");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.json)).toBe(true);
    expect(r.json.length).toBeGreaterThan(0);
  });
});
