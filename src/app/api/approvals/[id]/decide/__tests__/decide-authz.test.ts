import { describe, it, expect, vi, afterEach } from "vitest";

// 承認/差戻し(decide)の認可ガード回帰テスト(PR #77)。
// 役場職員(manager/admin)以外の自己承認・無権限承認を遮断していることを保証する。
// AUTH_PROVIDER=none + DEV_USER_ROLE 切替で各ロールになりすます(vitest.config 参照)。

function reqPost(body: unknown) {
  return new Request("http://test/api/approvals/x/decide", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ロールを切り替えて route を再評価する(auth.ts は import 時に DEV_USER_ROLE を捕捉するため)。
async function decide(role: string, id: string, body: unknown) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", role === "member" ? "m1" : "s1");
  const mod = await import("../route");
  const res = await mod.POST(reqPost(body), { params: Promise.resolve({ id }) });
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/approvals/[id]/decide 認可ガード(#77 回帰)", () => {
  it("member は承認できない(自己承認・無権限承認を 403 で遮断)", async () => {
    const r = await decide("member", "a1", { action: "approve" });
    expect(r.status).toBe(403);
    expect(r.json.error).toContain("承認権限");
  });

  it("member はロールゲートで弾かれ、存在しない id でも DB 参照前に 403", async () => {
    const r = await decide("member", "no-such-id", { action: "approve" });
    expect(r.status).toBe(403);
  });

  it("manager は承認できる(多段ルートは次ステップへ前進し pending 継続)", async () => {
    // a4: 担当課 → 受入団体 → 企画課 の 3 段、current_step=0。
    const r = await decide("manager", "a4", { action: "approve" });
    expect(r.status).toBe(200);
    expect(r.json.result).toBe("pending");
  });

  it("manager の最終承認で approved になり、再処理は 409", async () => {
    // a2: 最終ステップが pending(current_step=1)。1 回承認で確定。
    const first = await decide("manager", "a2", { action: "approve" });
    expect(first.status).toBe(200);
    expect(first.json.result).toBe("approved");

    const again = await decide("manager", "a2", { action: "approve" });
    expect(again.status).toBe(409);
  });

  it("manager の差戻しは理由 5 文字未満で 400、妥当な理由で rejected", async () => {
    const tooShort = await decide("manager", "a3", { action: "reject", comment: "x" });
    expect(tooShort.status).toBe(400);

    const ok = await decide("manager", "a3", { action: "reject", comment: "添付不足のため差戻します" });
    expect(ok.status).toBe(200);
    expect(ok.json.result).toBe("rejected");
  });
});
