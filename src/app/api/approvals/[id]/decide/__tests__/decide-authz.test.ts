import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { get, run } from "@/lib/db";
import type { ApprovalStep } from "@/lib/workflow";

const OTHER_MUNI = "muni_decide_authz_other";
const OTHER_MANAGER = "s_decide_other";
const OTHER_APPROVAL = "ap_decide_other";

function reqPost(body: unknown) {
  return new Request("http://test/api/approvals/x/decide", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function decide(role: string, id: string, body: unknown, userId = role === "member" ? "m1" : "s1") {
  vi.resetModules();
  vi.stubEnv("AUTH_PROVIDER", "none");
  vi.stubEnv("DEV_USER_ROLE", role);
  vi.stubEnv("DEV_USER_ID", userId);
  const mod = await import("../route");
  const res = await mod.POST(reqPost(body), { params: Promise.resolve({ id }) });
  return { status: res.status, json: await res.json() };
}

beforeAll(() => {
  run("INSERT INTO municipalities (id,name,prefecture,annual_budget) VALUES (?,?,?,?)", [
    OTHER_MUNI,
    "Other City",
    "Other Prefecture",
    1000000,
  ]);
  run(
    "INSERT INTO users (id,municipality_id,organization_type,role,name,email,status) VALUES (?,?,?,?,?,?,?)",
    [OTHER_MANAGER, OTHER_MUNI, "municipality", "manager", "Other Manager", "other-manager@example.jp", "active"]
  );
  run(
    `INSERT INTO approvals (id,municipality_id,kind,applicant_id,member_name,title,ai,citations,detail,route_name,steps,current_step,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      OTHER_APPROVAL,
      OTHER_MUNI,
      "test",
      null,
      "Other Member",
      "Other municipality approval",
      "",
      JSON.stringify([]),
      JSON.stringify({}),
      "Other Route",
      JSON.stringify([{ approverType: "dept", approverLabel: "Other Dept", status: "pending" }]),
      0,
      "pending",
    ]
  );
});

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/approvals/[id]/decide authz and audit", () => {
  it("rejects member users before reading approval rows", async () => {
    const r = await decide("member", "a1", { action: "approve" });
    expect(r.status).toBe(403);
  });

  it("rejects member users before revealing missing approval ids", async () => {
    const r = await decide("member", "no-such-id", { action: "approve" });
    expect(r.status).toBe(403);
  });

  it("blocks managers from deciding approvals in another municipality", async () => {
    const r = await decide("manager", OTHER_APPROVAL, { action: "approve" }, "s1");
    expect(r.status).toBe(404);
    const row = get<{ status: string; steps: string }>("SELECT status, steps FROM approvals WHERE id=?", [OTHER_APPROVAL]);
    expect(row?.status).toBe("pending");
    const steps = JSON.parse(row?.steps ?? "[]") as ApprovalStep[];
    expect(steps[0]?.decidedByUserId).toBeUndefined();
  });

  it("blocks another municipality manager from deciding seed approvals", async () => {
    const r = await decide("manager", "a1", { action: "approve" }, OTHER_MANAGER);
    expect(r.status).toBe(404);
  });

  it("allows manager approval and records the decider on the current step", async () => {
    const r = await decide("manager", "a4", { action: "approve" });
    expect(r.status).toBe(200);
    expect(r.json.result).toBe("pending");
    const decidedStep = r.json.approval.steps[0] as ApprovalStep;
    expect(decidedStep.status).toBe("approved");
    expect(decidedStep.decidedByUserId).toBe("s1");
    expect(decidedStep.decidedByRole).toBe("manager");
  });

  it("records top-level and step-level audit data for final approval", async () => {
    const first = await decide("manager", "a2", { action: "approve" });
    expect(first.status).toBe(200);
    expect(first.json.result).toBe("approved");

    const row = get<{ status: string; decided_by: string; decided_at: string | null; comment: string | null; steps: string }>(
      "SELECT status, decided_by, decided_at, comment, steps FROM approvals WHERE id=?",
      ["a2"]
    );
    expect(row?.status).toBe("approved");
    expect(row?.decided_by).toBe("s1");
    expect(row?.decided_at).toBeTruthy();
    expect(row?.comment).toBeNull();
    const steps = JSON.parse(row?.steps ?? "[]") as ApprovalStep[];
    expect(steps[1]?.decidedByUserId).toBe("s1");

    const again = await decide("manager", "a2", { action: "approve" });
    expect(again.status).toBe(409);
  });

  it("validates reject comments and records rejection audit data", async () => {
    const tooShort = await decide("manager", "a3", { action: "reject", comment: "x" });
    expect(tooShort.status).toBe(400);

    const comment = "Please attach the missing receipt";
    const ok = await decide("manager", "a3", { action: "reject", comment });
    expect(ok.status).toBe(200);
    expect(ok.json.result).toBe("rejected");

    const row = get<{ status: string; decided_by: string; decided_at: string | null; comment: string | null; steps: string }>(
      "SELECT status, decided_by, decided_at, comment, steps FROM approvals WHERE id=?",
      ["a3"]
    );
    expect(row?.status).toBe("rejected");
    expect(row?.decided_by).toBe("s1");
    expect(row?.decided_at).toBeTruthy();
    expect(row?.comment).toBe(comment);
    const steps = JSON.parse(row?.steps ?? "[]") as ApprovalStep[];
    expect(steps[0]?.comment).toBe(comment);
    expect(steps[0]?.decidedByUserId).toBe("s1");
    expect(steps[0]?.decidedByRole).toBe("manager");
  });
});
