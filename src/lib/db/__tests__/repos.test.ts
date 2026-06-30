import { describe, it, expect } from "vitest";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";

// テスト基盤の疎通確認(サンプル)。
// sqlite シードに対してリポジトリ層が期待どおり読めることを検証する。
// 各ロールはこのパターンを真似て、自分のドメインのテストを追加する。
describe("sqliteRepos (seed 疎通)", () => {
  it("members.list() がシードの隊員を返す", async () => {
    const members = await sqliteRepos.members.list();
    expect(members.length).toBeGreaterThanOrEqual(7);
    expect(members.map((m) => m.name)).toContain("田中 あかり");
  });

  it("users.count() が 0 より大きい(シード投入済み)", async () => {
    const n = await sqliteRepos.users.count();
    expect(n).toBeGreaterThan(0);
  });
});
