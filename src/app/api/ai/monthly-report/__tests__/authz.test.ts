import { afterEach, describe, expect, it, vi } from "vitest";

async function postMonthlyReport(role: string, devUserId: string, body: unknown) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", devUserId);
  vi.stubEnv("AI_PROVIDER", "mock");
  const mod = await import("../route");
  const res = await mod.POST(
    new Request("http://test/api/ai/monthly-report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/ai/monthly-report 対象隊員スコープ", () => {
  it("member は他人の userId を指定できない", async () => {
    const r = await postMonthlyReport("member", "m2", { userId: "m1", ym: "2026-05" });
    expect(r.status).toBe(403);
  });

  it("manager は userId で指定した隊員の活動ログから月報を生成できる", async () => {
    const r = await postMonthlyReport("manager", "s1", { userId: "m1", ym: "2026-05" });
    expect(r.status).toBe(200);
    expect(r.json.logCount).toBeGreaterThan(0);
    expect(r.json.provider).toBe("mock");
    expect(r.json.markdown).toContain("## 活動サマリ");
  });
});
