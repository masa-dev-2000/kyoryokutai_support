import { describe, it, expect, vi, afterEach } from "vitest";

// 月報一覧(GET /api/monthly-reports)の閲覧スコープ回帰テスト(PR #79)。
// 既定は本人の月報。?userId で他人の月報を引けるのは役場職員(manager/admin)のみ。

async function getList(role: string, devUserId: string, qUserId?: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", devUserId);
  const mod = await import("../route");
  const url = qUserId
    ? `http://test/api/monthly-reports?userId=${qUserId}`
    : "http://test/api/monthly-reports";
  const res = await mod.GET(new Request(url));
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/monthly-reports 閲覧スコープ(#79 回帰)", () => {
  it("member は他人の userId を指定すると 403", async () => {
    const r = await getList("member", "m2", "m1");
    expect(r.status).toBe(403);
  });

  it("manager は担当隊員(m1)の月報を ?userId で閲覧できる", async () => {
    // m1(田中 あかり)はシードに月報あり。s1 は manager。
    const r = await getList("manager", "s1", "m1");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.json)).toBe(true);
    expect(r.json.length).toBeGreaterThan(0);
  });

  it("member は userId 未指定なら自分(m1)の月報を取得できる", async () => {
    const r = await getList("member", "m1");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.json)).toBe(true);
    expect(r.json.length).toBeGreaterThan(0);
  });
});
