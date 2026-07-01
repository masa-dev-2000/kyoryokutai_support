import { describe, it, expect, vi, afterEach } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";

// 月報の再提出で承認キューが二重にならないことの回帰テスト。
// submit() は同月を上書きするため、2 回目の提出で新たな pending 承認を作ってはいけない。

// route の MUNI フォールバック(env 未設定時)と同じ値で承認キューを照合する。
// #95 でルート既定が "muni_shinonsen" に整合済み。ここもそれに合わせる(ズレるとキュー照合が空振りする)。
const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "muni_shinonsen";

async function submit(ym: string, markdown: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", "member");
  vi.stubEnv("DEV_USER_ID", "m2"); // m2 はシードに月報・月報承認が無く、独立して検証できる
  const mod = await import("../route");
  const req = new Request("http://test/api/monthly-reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ym, markdown }),
  });
  const res = await mod.POST(req);
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("月報 再提出の二重キュー防止", () => {
  it("同月を 2 回提出しても承認キューは 1 件のまま", async () => {
    const first = await submit("2026-04", "初回提出の本文");
    expect(first.status).toBe(201);

    const pendingAfter1 = (await sqliteRepos.approvals.listPending(MUNI)).filter(
      (a) => a.kind === "月次報告" && a.applicantId === "m2"
    );
    expect(pendingAfter1.length).toBe(1);

    // 内容を直して再提出
    const second = await submit("2026-04", "修正後の本文(再提出)");
    expect(second.status).toBe(201);

    const pendingAfter2 = (await sqliteRepos.approvals.listPending(MUNI)).filter(
      (a) => a.kind === "月次報告" && a.applicantId === "m2"
    );
    expect(pendingAfter2.length).toBe(1); // 二重化しない
    expect(pendingAfter2[0]?.detail).toMatchObject({
      body: "修正後の本文(再提出)",
      plan: "",
    });
  });

  it("別の月は別の承認キューになる", async () => {
    await submit("2026-04", "4 月分");
    await submit("2026-05", "5 月分");
    const pending = (await sqliteRepos.approvals.listPending(MUNI)).filter(
      (a) => a.kind === "月次報告" && a.applicantId === "m2"
    );
    expect(pending.length).toBe(2);
  });
});
