import { describe, it, expect, vi, afterEach } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";

// 差戻し(reject)が対象(月報・経費)の status に反映されることの回帰テスト(承認連動の穴)。
// これが無いと、承認キューから外れても月報は「提出済」、経費は元状態のまま残る。

const MUNI = "muni_shinonsen";

async function decideReject(id: string, comment: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", "manager");
  vi.stubEnv("DEV_USER_ID", "s1");
  const mod = await import("../route");
  const req = new Request("http://test/api/approvals/x/decide", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "reject", comment }),
  });
  const res = await mod.POST(req, { params: Promise.resolve({ id }) });
  return { status: res.status, json: await res.json() };
}

// 単段の pending 承認を作り、その id を取得する(enqueue は void のため title で引く)。
async function enqueueSingleStep(kind: string, title: string, targetTable: string, targetId: string) {
  await sqliteRepos.approvals.enqueue({
    muni: MUNI,
    kind,
    applicantId: "m1",
    memberName: "テスト隊員",
    title,
    ai: "",
    detail: {},
    routeName: "担当課",
    steps: [{ approverType: "dept", approverLabel: "担当課", status: "pending" }],
    targetTable,
    targetId,
  });
  const pending = await sqliteRepos.approvals.listPending(MUNI);
  const found = pending.find((a) => a.title === title);
  if (!found) throw new Error("enqueue した承認が見つからない");
  return found.id;
}

afterEach(() => vi.unstubAllEnvs());

describe("差戻しの対象反映(承認連動)", () => {
  it("月報の差戻しで monthly_reports が rejected になる", async () => {
    const rep = await sqliteRepos.monthlyReports.submit({ userId: "m2", ym: "2026-04", markdown: "テスト月報本文" });
    expect(rep.status).toBe("submitted");

    const apId = await enqueueSingleStep("月次報告", "差戻しテスト月報", "monthly_reports", rep.id);
    const r = await decideReject(apId, "活動時間の内訳を追記してください");
    expect(r.status).toBe(200);
    expect(r.json.result).toBe("rejected");

    const after = (await sqliteRepos.monthlyReports.listByUser("m2")).find((x) => x.id === rep.id);
    expect(after?.status).toBe("rejected");
    expect(after?.statusLabel).toContain("差戻し");
  });

  it("経費の差戻しで expenses が「差戻し」になる", async () => {
    // 既存シード経費 e2(未精算)を対象にする。
    const before = (await sqliteRepos.expenses.listByUser("m1")).find((x) => x.id === "e2");
    expect(before?.status).not.toBe("差戻し");

    const apId = await enqueueSingleStep("経費", "差戻しテスト経費", "expenses", "e2");
    const r = await decideReject(apId, "領収書の添付をお願いします");
    expect(r.status).toBe(200);
    expect(r.json.result).toBe("rejected");

    const after = (await sqliteRepos.expenses.listByUser("m1")).find((x) => x.id === "e2");
    expect(after?.status).toBe("差戻し");
  });
});
