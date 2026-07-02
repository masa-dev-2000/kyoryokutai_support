import { describe, it, expect } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";

// 承認ルート検証(受入団体ステップは団体必須)。
// UI 側(RouteEditSheet.canSave / PR#75)は host_org ステップに
// hostOrganizationId を必須化している。その入力がデータ層まで
// 欠落なく往復することを検証する(団体必須の前提が壊れていないこと)。

describe("承認ルート 受入団体ステップ (#PR75 整合)", () => {
  it("host_org ステップの hostOrganizationId が保存・取得で保持される", async () => {
    const org = await sqliteRepos.hostOrgs.upsert({ name: "テスト受入団体", kind: "npo" }, "muni_shinonsen");
    expect(org.id).toBeTruthy();

    const created = await sqliteRepos.routes.create({
      name: "受入団体ルート",
      kind: "expense",
      steps: [
        { stepNo: 1, approverType: "host_org", approverLabel: "受入団体", hostOrganizationId: org.id },
        { stepNo: 2, approverType: "dept", approverLabel: "企画課" },
      ],
    });
    expect(created).toBeTruthy();

    const fetched = (await sqliteRepos.routes.list()).find((r) => r.id === created!.id);
    expect(fetched).toBeTruthy();

    const hostStep = fetched!.steps.find((s) => s.approverType === "host_org");
    expect(hostStep, "host_org ステップが消えている").toBeTruthy();
    expect(hostStep!.hostOrganizationId).toBe(org.id);

    const deptStep = fetched!.steps.find((s) => s.approverType === "dept");
    expect(deptStep!.approverLabel).toBe("企画課");
  });
});
