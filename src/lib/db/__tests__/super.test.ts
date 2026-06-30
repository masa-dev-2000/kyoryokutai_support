import { describe, it, expect } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";

// super(運営者)リポジトリ層のユニットテスト。
// repos.test.ts の疎通パターンに倣い、sqlite シードに対して
// 主要な運営操作(自治体作成 / admin 招待 / ユーザー削除 / 契約取得)を検証する。
const SEED_MUNI = "muni_shinonsen"; // seed.ts の新温泉町

describe("super.createMunicipality", () => {
  it("自治体を新規作成し overview に反映される", async () => {
    const before = (await sqliteRepos.super.overview()).totals.municipalities;
    const created = await sqliteRepos.super.createMunicipality({ name: "テスト町", prefecture: "兵庫県" });

    expect(created.id).toBeTruthy();
    expect(created.name).toBe("テスト町");
    expect(created.prefecture).toBe("兵庫県");

    const after = await sqliteRepos.super.overview();
    expect(after.totals.municipalities).toBe(before + 1);
    expect(after.municipalities.map((m) => m.name)).toContain("テスト町");
  });

  it("annualBudget 未指定なら既定枠(200万円)で契約を取得できる", async () => {
    const created = await sqliteRepos.super.createMunicipality({ name: "枠デフォ町", prefecture: "兵庫県" });
    const contract = await sqliteRepos.super.getContract(created.id);
    expect(contract?.annualBudget).toBe(2000000);
  });
});

describe("super.createAdminInvite", () => {
  it("admin を pre-provision し、招待トークンを発行する", async () => {
    const muni = await sqliteRepos.super.createMunicipality({ name: "招待先町", prefecture: "兵庫県" });
    const res = await sqliteRepos.super.createAdminInvite({
      municipalityId: muni.id,
      email: "admin@example.com",
      name: "招待 太郎",
      createdBy: "u_super",
    });

    // トークンと有効期限
    expect(res.token).toMatch(/^[0-9a-f]{48}$/);
    expect(new Date(res.expiresAt).getTime()).toBeGreaterThan(Date.now());

    // /api/auth/me が email で紐づけられるよう users 行が先に作られている
    const users = await sqliteRepos.super.listUsers({ municipalityId: muni.id, role: "admin" });
    const admin = users.find((u) => u.email === "admin@example.com");
    expect(admin).toBeDefined();
    expect(admin?.role).toBe("admin");
    expect(admin?.status).toBe("active");
    expect(admin?.municipalityId).toBe(muni.id);
  });
});

describe("super.deleteUser", () => {
  it("ユーザーを削除すると一覧から消える", async () => {
    const before = await sqliteRepos.super.listUsers({ municipalityId: SEED_MUNI, role: "member" });
    expect(before.length).toBeGreaterThan(0);
    const target = before[0];

    await sqliteRepos.super.deleteUser(target.id);

    const after = await sqliteRepos.super.listUsers({ municipalityId: SEED_MUNI, role: "member" });
    expect(after.map((u) => u.id)).not.toContain(target.id);
    expect(after.length).toBe(before.length - 1);
  });
});

describe("super.getContract", () => {
  it("契約未設定のシード自治体は既定値(year1 / trial)を返す", async () => {
    const c = await sqliteRepos.super.getContract(SEED_MUNI);
    expect(c).not.toBeNull();
    expect(c?.municipalityId).toBe(SEED_MUNI);
    expect(c?.plan).toBe("year1");
    expect(c?.contractStatus).toBe("trial");
  });

  it("存在しない自治体 ID は null を返す", async () => {
    const c = await sqliteRepos.super.getContract("muni_does_not_exist");
    expect(c).toBeNull();
  });
});
