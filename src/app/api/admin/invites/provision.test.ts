import { describe, it, expect } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";
import { BUDGET_CATEGORIES, DEFAULT_ALLOCATION, currentFiscalYear } from "@/lib/budget";

// #74 修正: 招待発行時に招待先 users 行を pre-provision する。
// これにより /api/auth/me が email で auth_id を紐づけられ、招待後すぐログインできる。
const ADMIN_ID = "m1";

describe("invites.createProvisioned (#74 招待先の pre-provision)", () => {
  it("管理者招待で users 行(role=admin)が作られ、トークンも発行される", async () => {
    const { token } = await sqliteRepos.invites.createProvisioned({
      email: "newadmin74@example.jp",
      name: "招待 管理太郎",
      role: "admin",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    });

    // トークンは email 固定で発行される
    const row = await sqliteRepos.invites.findByToken(token);
    expect(row).not.toBeNull();
    expect(row!.email).toBe("newadmin74@example.jp");
    expect(row!.role).toBe("admin");

    // role=admin の users 行が作られている。
    const admins = await sqliteRepos.super.listUsers({ role: "admin" });
    expect(admins.some((u) => u.email === "newadmin74@example.jp")).toBe(true);
  });

  it("職員招待で職員一覧に現れ、隊員一覧には現れない", async () => {
    await sqliteRepos.invites.createProvisioned({
      email: "newmgr74@example.jp",
      name: "招待 職員花子",
      role: "manager",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    });
    const staff = await sqliteRepos.staff.list();
    const members = await sqliteRepos.members.list();
    expect(staff.some((s) => s.name === "招待 職員花子")).toBe(true);
    expect(members.some((m) => m.name === "招待 職員花子")).toBe(false);
  });

  it("隊員招待で隊員行が作られ、当年度の既定予算枠が seed される", async () => {
    await sqliteRepos.invites.createProvisioned({
      email: "newmember74@example.jp",
      name: "招待 隊員次郎",
      role: "member",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    });
    const members = await sqliteRepos.members.list();
    const created = members.find((m) => m.name === "招待 隊員次郎");
    expect(created, "隊員行が作られていない").toBeTruthy();

    const lines = await sqliteRepos.budgets.summaryByUser(created!.id, currentFiscalYear());
    for (const cat of BUDGET_CATEGORIES) {
      const line = lines.find((l) => l.category === cat);
      expect(line!.amountLimit).toBe(DEFAULT_ALLOCATION[cat] ?? 0);
    }
  });

  it("同じ email・同ロールで2回招待しても users 行は重複しない(冪等)", async () => {
    const args = {
      email: "dup74@example.jp",
      name: "招待 重複三郎",
      role: "member" as const,
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    };
    await sqliteRepos.invites.createProvisioned(args);
    await sqliteRepos.invites.createProvisioned(args);

    const members = await sqliteRepos.members.list();
    const matches = members.filter((m) => m.name === "招待 重複三郎");
    expect(matches.length).toBe(1);
  });

  it("同じ email を別ロールで再招待すると ROLE_CONFLICT で弾く(権限取り違え防止)", async () => {
    const base = {
      email: "conflict74@example.jp",
      name: "招待 競合四郎",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    };
    await sqliteRepos.invites.createProvisioned({ ...base, role: "member" });
    await expect(
      sqliteRepos.invites.createProvisioned({ ...base, role: "admin" }),
    ).rejects.toThrow("ROLE_CONFLICT");
  });
});
