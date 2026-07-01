import { afterEach, describe, expect, it, vi } from "vitest";

async function getOverview(role: string) {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", "u_super");
  const mod = await import("../route");
  const res = await mod.GET();
  return { status: res.status, json: await res.json() };
}

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/super/overview authz", () => {
  it("allows local dev super users without Supabase env", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const r = await getOverview("super");

    expect(r.status).toBe(200);
    expect(r.json.totals.municipalities).toBeGreaterThan(0);
  });

  it("rejects non-super local dev users", async () => {
    const r = await getOverview("admin");

    expect(r.status).toBe(403);
  });
});
