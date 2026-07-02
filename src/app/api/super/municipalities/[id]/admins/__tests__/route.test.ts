import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { get, run, genId } from "@/lib/db";

// #65: POST /api/super/municipalities/[id]/admins の回帰テスト。
// super による任意自治体への admin pre-provision + 招待発行が
// 冪等(同 email 再招待)・ROLE_CONFLICT 検知・email 小文字正規化(#74)を満たすこと。
const MUNI_TARGET = "muni_test_admins_target";
let superId = "";
let memberEmail = "";

function loadRoute() {
  vi.resetModules();
  return import("../route");
}

function post(body: unknown, id = MUNI_TARGET) {
  return {
    req: new Request(`http://test/api/super/municipalities/${id}/admins`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    ctx: { params: Promise.resolve({ id }) },
  };
}

function stubRole(role: string, userId: string) {
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", userId);
}

beforeAll(() => {
  run("INSERT INTO municipalities (id,name,prefecture,annual_budget) VALUES (?,?,?,?)", [
    MUNI_TARGET,
    "Admins Target Town",
    "Test Prefecture",
    1000000,
  ]);
  superId = genId("sup");
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
    [superId, "muni_shinonsen", "municipality", "super", "Super Ops", "superops@ops.example.jp", "active"]
  );
  // ROLE_CONFLICT 用: 対象自治体に member として存在する email
  const memberId = genId("m");
  memberEmail = `${memberId}@member.example.jp`;
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
    [memberId, MUNI_TARGET, "member", "member", "Member T", memberEmail, "active"]
  );
});

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/super/municipalities/[id]/admins", () => {
  it("super で POST すると 201 で token/url/expiresAt を返し、users 行を対象自治体に role=admin で作る", async () => {
    stubRole("super", superId);
    const mod = await loadRoute();
    const { req, ctx } = post({ email: "newadmin@example.jp", name: "新規 管理者" });
    const res = await mod.POST(req, ctx);
    expect(res.status).toBe(201);
    const body = (await res.json()) as { token: string; url: string; expiresAt: string };
    expect(body.token).toMatch(/^[0-9a-f]{48}$/);
    expect(body.url).toContain(`/signup?token=${body.token}`);
    expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now());

    const row = get<{ municipality_id: string; role: string; status: string }>(
      "SELECT municipality_id, role, status FROM users WHERE email=?",
      ["newadmin@example.jp"]
    );
    expect(row?.municipality_id).toBe(MUNI_TARGET);
    expect(row?.role).toBe("admin");
    expect(row?.status).toBe("active");
  });

  it("同一リクエストを 2 回送ってもどちらも 2xx で users 行は重複しない", async () => {
    stubRole("super", superId);
    const mod = await loadRoute();
    const email = "twiceadmin@example.jp";

    const a = post({ email, name: "二回 管理者" });
    const first = await mod.POST(a.req, a.ctx);
    expect(first.status).toBe(201);
    const b = post({ email, name: "二回 管理者" });
    const second = await mod.POST(b.req, b.ctx);
    expect(second.status).toBe(201);

    const count = get<{ c: number }>("SELECT COUNT(*) c FROM users WHERE email=?", [email]);
    expect(count?.c).toBe(1);
  });

  it("その自治体に member として存在する email は 409 を返す", async () => {
    stubRole("super", superId);
    const mod = await loadRoute();
    const { req, ctx } = post({ email: memberEmail, name: "競合 管理者" });
    const res = await mod.POST(req, ctx);
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("このメールアドレスは既に別の権限で登録されています");
  });

  it("admin role で呼ぶと 403", async () => {
    stubRole("admin", "adm1");
    const mod = await loadRoute();
    const { req, ctx } = post({ email: "blocked@example.jp", name: "不許可" });
    const res = await mod.POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it("member role で呼ぶと 403", async () => {
    stubRole("member", "m1");
    const mod = await loadRoute();
    const { req, ctx } = post({ email: "blocked2@example.jp", name: "不許可" });
    const res = await mod.POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it("email 欠落は 400", async () => {
    stubRole("super", superId);
    const mod = await loadRoute();
    const { req, ctx } = post({ name: "名前だけ" });
    const res = await mod.POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it("name 欠落は 400", async () => {
    stubRole("super", superId);
    const mod = await loadRoute();
    const { req, ctx } = post({ email: "noname@example.jp" });
    const res = await mod.POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it("大文字混じり email は小文字で保存され、小文字での再招待も冪等(#74)", async () => {
    stubRole("super", superId);
    const mod = await loadRoute();

    const a = post({ email: "Admin@Example.JP", name: "大文字 管理者" });
    const first = await mod.POST(a.req, a.ctx);
    expect(first.status).toBe(201);
    const stored = get<{ email: string }>("SELECT email FROM users WHERE email=?", ["admin@example.jp"]);
    expect(stored?.email).toBe("admin@example.jp");

    const b = post({ email: "admin@example.jp", name: "大文字 管理者" });
    const second = await mod.POST(b.req, b.ctx);
    expect(second.status).toBe(201);
    const count = get<{ c: number }>("SELECT COUNT(*) c FROM users WHERE email=?", ["admin@example.jp"]);
    expect(count?.c).toBe(1);
  });
});
