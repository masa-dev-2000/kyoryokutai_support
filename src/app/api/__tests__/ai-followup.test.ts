import { describe, it, expect, beforeAll } from "vitest";
import { POST } from "@/app/api/ai/followup/route";

// AI 質問補完(api/ai/followup)のテスト。
// 外部依存を避けるため AI_PROVIDER=mock を使用(決定論的フォールバック)。
// 認証は AUTH_PROVIDER=none(requireSession は通る)。

beforeAll(() => {
  process.env.AI_PROVIDER = "mock";
});

function postReq(body: unknown): Request {
  return new Request("http://localhost/api/ai/followup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/followup(AI 質問補完)", () => {
  it("メモに対して非空の補完テキストを返す", async () => {
    const res = await POST(postReq({ current: "午後に空き家を内覧した" }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { question: string; provider: string };
    expect(json.provider).toBe("mock");
    expect(json.question.trim().length).toBeGreaterThan(0);
  });

  it("メモが空でも 200 で返る", async () => {
    const res = await POST(postReq({ current: "" }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { question: string };
    expect(typeof json.question).toBe("string");
  });
});
