import { describe, it, expect, beforeAll } from "vitest";
import { run, get, genId } from "@/lib/db";
import { sqliteRepos } from "@/lib/db/repositories/sqlite";

// #82/#86 回帰防止:
// 活動・日報の保存は固定の自治体定数ではなく「本人の所属自治体」で行われること。
// 本番では users が想定と別テナント(テスト町)に属しており、固定定数だと
// daily_logs.municipality_id_fkey に違反して保存が丸ごと失敗していた(DB 0 件)。
// 別テナントのユーザーで作成し、書込先 municipality_id が本人由来であることを検証する。

const OTHER_MUNI = "muni_other_test";
const OTHER_USER = "u_other_test";

describe("#82/#86 活動・日報の保存は本人の自治体に紐づく", () => {
  beforeAll(() => {
    // シード(新温泉町)とは別の自治体 + そこに属する隊員を投入
    run("INSERT INTO municipalities (id,name,prefecture,annual_budget) VALUES (?,?,?,?)", [
      OTHER_MUNI,
      "別テスト町",
      "兵庫県",
      2000000,
    ]);
    run(
      `INSERT INTO users (id,municipality_id,host_organization_id,organization_type,role,name,email,role_label,title,department,term,started_at,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [OTHER_USER, OTHER_MUNI, null, "member", "member", "別町 隊員", "other@member.example.jp", "移住促進", null, null, "1 年目", "2026-04-01", "active"]
    );
  });

  it("dailyLogs.upsert は本人(別テスト町)の municipality_id で作成する", async () => {
    const dl = await sqliteRepos.dailyLogs.upsert(OTHER_USER, "2026-07-01", { distanceKm: 12, feelingScore: 3 });
    const row = get<{ municipality_id: string }>("SELECT municipality_id FROM daily_logs WHERE id=?", [dl.id]);
    expect(row?.municipality_id).toBe(OTHER_MUNI);
  });

  it("activityLogs.create は本人の municipality_id で活動と日報を作成する", async () => {
    const created = await sqliteRepos.activityLogs.create({
      userId: OTHER_USER,
      type: "移住相談",
      topic: "空き家内覧",
      hours: 2,
      startTime: "09:00",
      endTime: "11:00",
      body: "内覧対応",
      date: "2026-07-02",
    });
    const log = get<{ municipality_id: string; daily_log_id: string }>(
      "SELECT municipality_id, daily_log_id FROM activity_logs WHERE id=?",
      [created.id]
    );
    expect(log?.municipality_id).toBe(OTHER_MUNI);
    // 自動結線された日報も本人の自治体であること
    const dl = get<{ municipality_id: string }>("SELECT municipality_id FROM daily_logs WHERE id=?", [log!.daily_log_id]);
    expect(dl?.municipality_id).toBe(OTHER_MUNI);
  });

  it("expenses.listByUser は紐づく日報の日付を返す", async () => {
    const date = "2026-07-03";
    const dl = await sqliteRepos.dailyLogs.upsert(OTHER_USER, date);
    const exp = await sqliteRepos.expenses.create({
      userId: OTHER_USER,
      dailyLogId: dl.id,
      title: "備品",
      amount: 1200,
      purpose: "相談会で使う備品購入",
      status: "申請中",
      category: "備品",
    });

    expect(exp.dailyLogDate).toBe(date);
    const listed = await sqliteRepos.expenses.listByUser(OTHER_USER);
    expect(listed.find((e) => e.id === exp.id)?.dailyLogDate).toBe(date);
  });

  it("expenses.listByUser は活動由来経費の日報日付も返す", async () => {
    const date = "2026-07-04";
    const log = await sqliteRepos.activityLogs.create({
      userId: OTHER_USER,
      type: "移住相談",
      topic: "空き家内覧",
      hours: 1.5,
      startTime: "13:00",
      endTime: "14:30",
      body: "内覧同行",
      date,
    });
    const exp = await sqliteRepos.expenses.createFromLog({
      userId: OTHER_USER,
      activityLogId: log.id,
      receiptIndex: 0,
      title: "交通費",
      amount: 900,
      purpose: "内覧同行の移動費",
      hasReceipt: false,
      status: "申請中",
    });

    expect(exp.dailyLogDate).toBe(date);
    run("UPDATE expenses SET daily_log_id=NULL WHERE id=?", [exp.id]);
    const listed = await sqliteRepos.expenses.listByUser(OTHER_USER);
    expect(listed.find((e) => e.id === exp.id)?.dailyLogDate).toBe(date);
  });

  it("users.municipalityOf は本人の所属自治体を返す", async () => {
    expect(await sqliteRepos.users.municipalityOf(OTHER_USER)).toBe(OTHER_MUNI);
    // シードの隊員 m1 は新温泉町
    expect(await sqliteRepos.users.municipalityOf("m1")).toBe("muni_shinonsen");
  });
});
