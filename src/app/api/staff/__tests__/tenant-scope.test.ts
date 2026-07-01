import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { get, run, genId } from "@/lib/db";

// #130 regression tests: admin-scoped staff routes must not cross municipality boundaries.
const MUNI_B = "muni_test_staff_b";
let adminBId = "";
let staffBId = "";

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
    "Test Staff City B",
    "Test Prefecture",
    1000000,
  ]);
  adminBId = genId("adm");
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
    [adminBId, MUNI_B, "municipality", "admin", "Admin B", "adminb2@test.example.jp", "active"]
  );
  staffBId = genId("s");
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,title,department,status) VALUES (?,?,?,?,?,?,?,?,?)",
    [staffBId, MUNI_B, "municipality", "manager", "Staff B", `${staffBId}@town.example.jp`, "Lead", "General Affairs", "active"]
  );
});

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/staff tenant scope", () => {
  it("rejects non-admin users before listing staff", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "member");
    vi.stubEnv("DEV_USER_ID", "m1");
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(403);
  });

  it("hides municipality B staff from municipality A admin", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((s) => s.id === staffBId)).toBe(false);
    expect(list.some((s) => s.id === "s1")).toBe(true);
  });

  it("hides municipality A staff from municipality B admin", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((s) => s.id === "s1")).toBe(false);
    expect(list.some((s) => s.id === staffBId)).toBe(true);
  });
});

describe("POST /api/staff tenant scope", () => {
  it("creates staff in the admin user's municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "New Staff B", dept: "General Affairs" }),
      })
    );
    expect(res.status).toBe(201);
    const created = (await res.json()) as { id: string };
    const row = get<{ municipality_id: string }>("SELECT municipality_id FROM users WHERE id=?", [created.id]);
    expect(row?.municipality_id).toBe(MUNI_B);
  });

  it("returns 404 when an admin updates staff in another municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: staffBId, name: "Changed", dept: "General Affairs" }),
      })
    );
    expect(res.status).toBe(404);
    const row = get<{ name: string }>("SELECT name FROM users WHERE id=?", [staffBId]);
    expect(row?.name).toBe("Staff B");
  });

  it("returns 404 when the target id belongs to a member in the same municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "m1", name: "Changed", dept: "General Affairs" }),
      })
    );
    expect(res.status).toBe(404);
    const row = get<{ name: string }>("SELECT name FROM users WHERE id=?", ["m1"]);
    expect(row?.name).not.toBe("Changed");
  });
});

describe("DELETE /api/staff/[id] tenant scope", () => {
  it("returns 404 and leaves the row in place when deleting another municipality's staff", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadIdRoute();
    const res = await mod.DELETE(new Request("http://test/api/staff/x", { method: "DELETE" }), {
      params: Promise.resolve({ id: staffBId }),
    });
    expect(res.status).toBe(404);
    const row = get<{ id: string }>("SELECT id FROM users WHERE id=?", [staffBId]);
    expect(row?.id).toBe(staffBId);
  });
});
