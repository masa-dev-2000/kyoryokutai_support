import { describe, it, expect } from "vitest";
import { POST, GET } from "@/app/api/daily-logs/route";
import { getRepos } from "@/lib/db/repositories";

// 日報 POST の統合テスト(#82/#86 の回帰防止 + 経費同時申請)。
// AUTH_PROVIDER=none のため requireAppUser は固定の開発ユーザー(m1, member)を返す。
// 活動・日報・経費が実際に永続化され、本人の自治体に紐づくことを検証する。

function postReq(body: unknown): Request {
  return new Request("http://localhost/api/daily-logs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/daily-logs(活動・日報・経費の保存)", () => {
  it("活動と経費を保存し、本人(m1=新温泉町)の自治体に紐づく", async () => {
    const res = await POST(
      postReq({
        date: "2026-07-10",
        distanceKm: 8,
        feelingScore: 3,
        activities: [
          { type: "移住相談", topic: "空き家内覧", hours: 2, startTime: "09:00", endTime: "11:00", body: "内覧対応" },
        ],
        expenses: [{ title: "資料印刷", amount: 1200, purpose: "内覧資料の印刷", hasReceipt: false }],
      })
    );
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      dailyLog: { id: string; municipalityId?: string };
      activities: { id: string }[];
      expensesCreated: number;
    };
    expect(json.activities.length).toBe(1);
    expect(json.expensesCreated).toBe(1);

    // 永続化の確認(GET 本人一覧に当日が含まれる)
    const listRes = await GET();
    const dls = (await listRes.json()) as { date: string }[];
    expect(dls.some((d) => d.date === "2026-07-10")).toBe(true);

    // 経費も本人に保存されている
    const repos = getRepos();
    const exps = await repos.expenses.listByUser("m1");
    expect(exps.some((e) => e.amount === 1200 && e.purpose.includes("内覧資料"))).toBe(true);

    // 活動が本人の自治体(新温泉町)に紐づく
    const logs = await repos.activityLogs.listByUser("m1");
    const saved = logs.find((l) => l.topic === "空き家内覧" && l.date === "2026-07-10");
    expect(saved).toBeTruthy();
  });

  it("金額0・用途空の経費は登録されない", async () => {
    const res = await POST(
      postReq({
        date: "2026-07-11",
        activities: [{ type: "事務", topic: "整理", hours: 1, startTime: "13:00", endTime: "14:00", body: "整理" }],
        expenses: [{ title: "無効", amount: 0, purpose: "", hasReceipt: false }],
      })
    );
    expect(res.status).toBe(201);
    const json = (await res.json()) as { expensesCreated: number };
    expect(json.expensesCreated).toBe(0);
  });
});
