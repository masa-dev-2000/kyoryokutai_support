import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { get, run, genId } from "@/lib/db";

// #168 regression tests: admin-scoped host-organization routes must not cross municipality boundaries.
// GET は無認証だった(修正前)。POST/DELETE は id 捏造・定数テナント書込で本番では必ず失敗していた。
const MUNI_B = "muni_test_hostorgs_b";
let adminBId = "";
let hostBId = "";

function loadRoute() {
  vi.resetModules();
  return import("../route");
}

function loadIdRoute() {
  vi.resetModules();
  return import("../[id]/route");
}

beforeAll(() => {
  run("INSERT INTO municipalities (id,name,prefecture,annual_budget) VALUES (?,?,?,?)", [
    MUNI_B,
    "Host Test City B",
    "Test Prefecture",
    1000000,
  ]);
  adminBId = genId("adm");
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
    [adminBId, MUNI_B, "municipality", "admin", "Admin Host B", "adminhostb@test.example.jp", "active"]
  );
  hostBId = genId("ho");
  run("INSERT INTO host_organizations (id,municipality_id,name,kind,contact_user_id) VALUES (?,?,?,?,?)", [
    hostBId, MUNI_B, "B町受入団体", "npo", null,
  ]);
});

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/host-organizations tenant scope", () => {
  it("rejects member users", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "member");
    vi.stubEnv("DEV_USER_ID", "m1");
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(403);
  });

  it("hides municipality B host orgs from municipality A admin", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((h) => h.id === "ho_nogyo")).toBe(true);
    expect(list.some((h) => h.id === hostBId)).toBe(false);
  });

  it("hides municipality A host orgs from municipality B admin", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((h) => h.id === hostBId)).toBe(true);
    expect(list.some((h) => h.id === "ho_nogyo")).toBe(false);
  });

  it("lets super users list host orgs across municipalities", async () => {
    const superId = genId("sup");
    run(
      "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
      [superId, MUNI_B, "municipality", "super", "Super Host User", "superhost@ops.example.jp", "active"]
    );
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "super");
    vi.stubEnv("DEV_USER_ID", superId);
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((h) => h.id === "ho_nogyo")).toBe(true);
    expect(list.some((h) => h.id === hostBId)).toBe(true);
  });
});

describe("POST /api/host-organizations tenant scope", () => {
  it("creates a host org in the admin user's municipality when id is omitted", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/host-organizations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "B町新規団体", kind: "農業法人" }),
      })
    );
    expect(res.status).toBe(201);
    const created = (await res.json()) as { id: string };
    const row = get<{ municipality_id: string }>("SELECT municipality_id FROM host_organizations WHERE id=?", [created.id]);
    expect(row?.municipality_id).toBe(MUNI_B);
  });

  it("returns 404 when an admin updates a host org in another municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/host-organizations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: hostBId, name: "乗っ取り", kind: "npo" }),
      })
    );
    expect(res.status).toBe(404);
    const row = get<{ name: string }>("SELECT name FROM host_organizations WHERE id=?", [hostBId]);
    expect(row?.name).toBe("B町受入団体");
  });

  it("lets an admin update a host org in their own municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/host-organizations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: hostBId, name: "B町受入団体(改名)", kind: "npo" }),
      })
    );
    expect(res.status).toBe(200);
    const row = get<{ name: string }>("SELECT name FROM host_organizations WHERE id=?", [hostBId]);
    expect(row?.name).toBe("B町受入団体(改名)");
  });
});

describe("DELETE /api/host-organizations/[id] tenant scope", () => {
  it("returns 404 and keeps the row when deleting another municipality's host org", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadIdRoute();
    const res = await mod.DELETE(new Request("http://test/api/host-organizations/x", { method: "DELETE" }), {
      params: Promise.resolve({ id: hostBId }),
    });
    expect(res.status).toBe(404);
    const row = get<{ id: string }>("SELECT id FROM host_organizations WHERE id=?", [hostBId]);
    expect(row?.id).toBe(hostBId);
  });

  it("deletes a host org in the admin user's own municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadIdRoute();
    const res = await mod.DELETE(new Request("http://test/api/host-organizations/x", { method: "DELETE" }), {
      params: Promise.resolve({ id: hostBId }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { deleted: boolean };
    expect(body.deleted).toBe(true);
    const row = get<{ id: string }>("SELECT id FROM host_organizations WHERE id=?", [hostBId]);
    expect(row).toBeUndefined();
  });
});
