import { describe, it, expect, vi, afterEach } from "vitest";

// お知らせ配信(POST /api/announcements)の認可・なりすまし回帰テスト(PR #77)。
// 配信は役場職員のみ。senderId/senderName は body を信用せずセッションから確定する。

function reqPost(body: unknown) {
  return new Request("http://test/api/announcements", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function post(role: string, devUserId: string, body: unknown) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", devUserId);
  const mod = await import("../route");
  const res = await mod.POST(reqPost(body));
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/announcements 配信認可(#77 回帰)", () => {
  it("member は役場名義で配信できない(403)", async () => {
    const r = await post("member", "m1", { body: "勝手なお知らせ" });
    expect(r.status).toBe(403);
  });

  it("manager でも本文が空なら 400", async () => {
    const r = await post("manager", "s1", { body: "   " });
    expect(r.status).toBe(400);
  });

  it("manager の配信は senderId/senderName を body ではなくセッションから確定する", async () => {
    const r = await post("manager", "s1", {
      body: "6 月例会の議題について",
      senderId: "HACKER",
      senderName: "なりすまし",
    });
    expect(r.status).toBe(201);
    // body で渡した偽の senderName は無視され、セッションの s1(谷本 拓海)が記録される。
    expect(r.json.sender).toBe("谷本 拓海");
  });
});
