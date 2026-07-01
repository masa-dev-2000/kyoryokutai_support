import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { get, run, genId } from "@/lib/db";

// #130 regression tests: admin-scoped member routes must not cross municipality boundaries.
const MUNI_B = "muni_test_members_b";
let adminBId = "";
let memberBId = "";

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
    "Test City B",
    "Test Prefecture",
    1000000,
  ]);
  adminBId = genId("adm");
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
    [adminBId, MUNI_B, "municipality", "admin", "Admin B", "adminb@test.example.jp", "active"]
  );
  memberBId = genId("m");
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,role_label,term,started_at,status) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [memberBId, MUNI_B, "member", "member", "Member B", `${memberBId}@member.example.jp`, "Member", "1", "2026-04-01", "active"]
  );
});

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/members tenant scope", () => {
  it("rejects member users before listing members", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "member");
    vi.stubEnv("DEV_USER_ID", "m1");
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(403);
  });

  it("hides municipality B members from municipality A admin", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((m) => m.id === memberBId)).toBe(false);
    expect(list.some((m) => m.id === "m1")).toBe(true);
  });

  it("hides municipality A members from municipality B admin", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((m) => m.id === "m1")).toBe(false);
    expect(list.some((m) => m.id === memberBId)).toBe(true);
  });

  it("lets managers list members in their municipality only", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "manager");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((m) => m.id === "m1")).toBe(false);
    expect(list.some((m) => m.id === memberBId)).toBe(true);
  });

  it("lets super users list members across municipalities", async () => {
    const superId = genId("sup");
    run(
      "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
      [superId, MUNI_B, "municipality", "super", "Super User", "super@ops.example.jp", "active"]
    );
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "super");
    vi.stubEnv("DEV_USER_ID", superId);
    const mod = await loadRoute();
    const res = await mod.GET();
    expect(res.status).toBe(200);
    const list = (await res.json()) as { id: string }[];
    expect(list.some((m) => m.id === "m1")).toBe(true);
    expect(list.some((m) => m.id === memberBId)).toBe(true);
  });
});

describe("POST /api/members tenant scope", () => {
  it("creates a member in the admin user's municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", adminBId);
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "New Member B", role: "Member", startedAt: "2026-07-01" }),
      })
    );
    expect(res.status).toBe(201);
    const created = (await res.json()) as { id: string };
    const row = get<{ municipality_id: string }>("SELECT municipality_id FROM users WHERE id=?", [created.id]);
    expect(row?.municipality_id).toBe(MUNI_B);
  });

  it("returns 404 when an admin updates a member in another municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: memberBId, name: "Changed", role: "Member" }),
      })
    );
    expect(res.status).toBe(404);
    const row = get<{ name: string }>("SELECT name FROM users WHERE id=?", [memberBId]);
    expect(row?.name).toBe("Member B");
  });

  it("returns 404 when the target id belongs to staff in the same municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadRoute();
    const res = await mod.POST(
      new Request("http://test/api/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "s1", name: "Changed", role: "Member" }),
      })
    );
    expect(res.status).toBe(404);
    const row = get<{ name: string }>("SELECT name FROM users WHERE id=?", ["s1"]);
    expect(row?.name).not.toBe("Changed");
  });
});

describe("DELETE /api/members/[id] tenant scope", () => {
  it("returns 404 and leaves the row active when deleting another municipality's member", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadIdRoute();
    const res = await mod.DELETE(new Request("http://test/api/members/x", { method: "DELETE" }), {
      params: Promise.resolve({ id: memberBId }),
    });
    expect(res.status).toBe(404);
    const row = get<{ status: string }>("SELECT status FROM users WHERE id=?", [memberBId]);
    expect(row?.status).toBe("active");
  });

  it("returns 404 when the target id is staff in the same municipality", async () => {
    vi.stubEnv("AUTH_PROVIDER", "none");
    vi.stubEnv("DEV_USER_ROLE", "admin");
    vi.stubEnv("DEV_USER_ID", "adm1");
    const mod = await loadIdRoute();
    const res = await mod.DELETE(new Request("http://test/api/members/x", { method: "DELETE" }), {
      params: Promise.resolve({ id: "s1" }),
    });
    expect(res.status).toBe(404);
    const row = get<{ status: string }>("SELECT status FROM users WHERE id=?", ["s1"]);
    expect(row?.status).toBe("active");
  });
});
