import { describe, it, expect } from "vitest";
import { get, run } from "@/lib/db";
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

describe("super.updateMunicipality", () => {
  it("名称・都道府県・年間予算を部分更新できる", async () => {
    const created = await sqliteRepos.super.createMunicipality({ name: "旧名町", prefecture: "京都府" });
    const updated = await sqliteRepos.super.updateMunicipality(created.id, { name: "新名町", annualBudget: 3000000 });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("新名町");
    expect(updated?.prefecture).toBe("京都府"); // 未指定は据え置き
    const contract = await sqliteRepos.super.getContract(created.id);
    expect(contract?.annualBudget).toBe(3000000);
  });

  it("存在しない ID は null を返す", async () => {
    const r = await sqliteRepos.super.updateMunicipality("muni_does_not_exist", { name: "x" });
    expect(r).toBeNull();
  });
});

describe("super.deleteMunicipality", () => {
  it("自治体を削除すると overview から消える", async () => {
    const created = await sqliteRepos.super.createMunicipality({ name: "消える町", prefecture: "兵庫県" });
    const before = (await sqliteRepos.super.overview()).totals.municipalities;

    await sqliteRepos.super.deleteMunicipality(created.id);

    const after = await sqliteRepos.super.overview();
    expect(after.totals.municipalities).toBe(before - 1);
    expect(after.municipalities.map((m) => m.id)).not.toContain(created.id);
    expect(await sqliteRepos.super.municipalityDetail(created.id)).toBeNull();
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

  it("同 email + role=admin の再招待は冪等(users 1 行のまま・新トークン発行)", async () => {
    const muni = await sqliteRepos.super.createMunicipality({ name: "再招待町", prefecture: "兵庫県" });
    const email = "readmin@example.com";
    const first = await sqliteRepos.super.createAdminInvite({
      municipalityId: muni.id, email, name: "再招待 太郎", createdBy: "u_super",
    });
    const second = await sqliteRepos.super.createAdminInvite({
      municipalityId: muni.id, email, name: "再招待 太郎", createdBy: "u_super",
    });

    expect(second.token).toMatch(/^[0-9a-f]{48}$/);
    expect(second.token).not.toBe(first.token);
    const count = get<{ c: number }>("SELECT COUNT(*) c FROM users WHERE email=?", [email]);
    expect(count?.c).toBe(1);
  });

  it("retired にした admin を再招待すると active に戻る", async () => {
    const muni = await sqliteRepos.super.createMunicipality({ name: "復帰町", prefecture: "兵庫県" });
    const email = "retired-admin@example.com";
    await sqliteRepos.super.createAdminInvite({
      municipalityId: muni.id, email, name: "復帰 花子", createdBy: "u_super",
    });
    run("UPDATE users SET status='retired' WHERE email=?", [email]);

    await sqliteRepos.super.createAdminInvite({
      municipalityId: muni.id, email, name: "復帰 花子", createdBy: "u_super",
    });

    const row = get<{ status: string }>("SELECT status FROM users WHERE email=?", [email]);
    expect(row?.status).toBe("active");
  });

  it("既に member として存在する email は ROLE_CONFLICT で弾く", async () => {
    const muni = await sqliteRepos.super.createMunicipality({ name: "競合町", prefecture: "兵庫県" });
    await expect(
      sqliteRepos.super.createAdminInvite({
        municipalityId: muni.id,
        email: "m1@member.example.jp", // seed の隊員
        name: "競合 次郎",
        createdBy: "u_super",
      })
    ).rejects.toThrow("ROLE_CONFLICT");
  });

  it("新規 email は対象自治体(作成者の自治体ではない)に provisioning される", async () => {
    const muni = await sqliteRepos.super.createMunicipality({ name: "対象町", prefecture: "兵庫県" });
    const email = "target-admin@example.com";
    // createdBy に seed の adm1(muni_shinonsen 所属)を使い、対象自治体が優先されることを確認する
    const res = await sqliteRepos.super.createAdminInvite({
      municipalityId: muni.id, email, name: "対象 三郎", createdBy: "adm1",
    });

    const user = get<{ municipality_id: string }>("SELECT municipality_id FROM users WHERE email=?", [email]);
    expect(user?.municipality_id).toBe(muni.id);
    expect(user?.municipality_id).not.toBe(SEED_MUNI);

    const inv = get<{ role: string; municipality_name: string }>(
      "SELECT role, municipality_name FROM invite_tokens WHERE token=?",
      [res.token]
    );
    expect(inv?.role).toBe("admin");
    expect(inv?.municipality_name).toBe("対象町");
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
