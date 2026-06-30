import { describe, it, expect } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";
import { GET } from "./[token]/route";

// #74 招待リンク回帰テスト。
// 「管理者を招待」ボタンで発行したトークンが、発行→検証→単回使用まで
// 期待どおり動くことを sqlite シードに対して検証する(AUTH_PROVIDER=none)。
//
// createdBy はシード済みユーザー(m1)を使う。本番(Postgres)では
// created_by が users(id) への FK なので、実在ユーザーを渡す必要がある。
const ADMIN_ID = "m1";

function reqFor(token: string) {
  return new Request(`http://localhost/api/admin/invites/${token}/`);
}

describe("invites リポジトリ (#74 招待発行)", () => {
  it("create が トークン と 7 日後の有効期限を採番する", async () => {
    const before = Date.now();
    const { token, expiresAt } = await sqliteRepos.invites.create({
      email: "newadmin@example.jp",
      role: "admin",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    });
    expect(token).toMatch(/^[0-9a-f]{48}$/); // 24 byte hex
    const ms = new Date(expiresAt).getTime() - before;
    // おおよそ 7 日(誤差 1 分許容)
    expect(ms).toBeGreaterThan(7 * 24 * 60 * 60 * 1000 - 60_000);
    expect(ms).toBeLessThan(7 * 24 * 60 * 60 * 1000 + 60_000);
  });

  it("findByToken が 発行時の email / role / 自治体名 を返す", async () => {
    const { token } = await sqliteRepos.invites.create({
      email: "staff@town.example.jp",
      role: "manager",
      municipalityName: "香美町",
      createdBy: ADMIN_ID,
    });
    const row = await sqliteRepos.invites.findByToken(token);
    expect(row).not.toBeNull();
    expect(row!.email).toBe("staff@town.example.jp");
    expect(row!.role).toBe("manager");
    expect(row!.municipalityName).toBe("香美町");
    expect(row!.usedAt).toBeNull();
  });

  it("findByToken は 未知のトークンに null を返す", async () => {
    expect(await sqliteRepos.invites.findByToken("deadbeef")).toBeNull();
  });

  it("markUsed は usedAt を設定し、二重呼び出しでも冪等", async () => {
    const { token } = await sqliteRepos.invites.create({
      email: null,
      role: "member",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    });
    await sqliteRepos.invites.markUsed(token);
    const used = await sqliteRepos.invites.findByToken(token);
    expect(used!.usedAt).not.toBeNull();
    const firstUsedAt = used!.usedAt;
    // 二度目は no-op(used_at IS NULL 条件)。例外を投げず値も変えない。
    await sqliteRepos.invites.markUsed(token);
    const again = await sqliteRepos.invites.findByToken(token);
    expect(again!.usedAt).toBe(firstUsedAt);
  });
});

describe("GET /api/admin/invites/[token] (#74 トークン検証)", () => {
  it("有効なトークンは 200 と招待情報を返す", async () => {
    const { token } = await sqliteRepos.invites.create({
      email: "ok@example.jp",
      role: "admin",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    });
    const res = await GET(reqFor(token), { params: Promise.resolve({ token }) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      email: "ok@example.jp",
      role: "admin",
      municipalityName: "新温泉町",
    });
  });

  it("未知のトークンは 404", async () => {
    const res = await GET(reqFor("nope"), { params: Promise.resolve({ token: "nope" }) });
    expect(res.status).toBe(404);
  });

  it("使用済みトークンは 410", async () => {
    const { token } = await sqliteRepos.invites.create({
      email: null,
      role: "manager",
      municipalityName: "新温泉町",
      createdBy: ADMIN_ID,
    });
    await sqliteRepos.invites.markUsed(token);
    const res = await GET(reqFor(token), { params: Promise.resolve({ token }) });
    expect(res.status).toBe(410);
  });
});
