import { afterEach, describe, expect, it, vi } from "vitest";

async function getMembers(role: string, devUserId: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", devUserId);
  const mod = await import("../route");
  const res = await mod.GET();
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/members 閲覧スコープ", () => {
  it("member はロスター一覧を取得できない", async () => {
    const r = await getMembers("member", "m1");
    expect(r.status).toBe(403);
  });

  it("manager はロスター一覧を取得できる", async () => {
    const r = await getMembers("manager", "s1");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.json)).toBe(true);
    expect(r.json.length).toBeGreaterThan(0);
  });
});
