import { describe, expect, it } from "vitest";
import { homePathForRole, safeRelativePath } from "../role-path";

describe("homePathForRole", () => {
  it("maps each known role to its home path", () => {
    expect(homePathForRole("super")).toBe("/super");
    expect(homePathForRole("admin")).toBe("/admin");
    expect(homePathForRole("manager")).toBe("/manager");
    expect(homePathForRole("member")).toBe("/member");
  });

  it("falls back to the member home for missing or unknown roles", () => {
    expect(homePathForRole(null)).toBe("/member");
    expect(homePathForRole(undefined)).toBe("/member");
    expect(homePathForRole("unknown")).toBe("/member");
  });
});

describe("safeRelativePath", () => {
  it("accepts same-origin relative paths", () => {
    expect(safeRelativePath("/manager")).toBe("/manager");
    expect(safeRelativePath("/member?tab=activity")).toBe("/member?tab=activity");
  });

  it("rejects missing, absolute, and protocol-relative paths", () => {
    expect(safeRelativePath(null)).toBeNull();
    expect(safeRelativePath("https://example.com")).toBeNull();
    expect(safeRelativePath("//example.com")).toBeNull();
    expect(safeRelativePath("member")).toBeNull();
  });
});
