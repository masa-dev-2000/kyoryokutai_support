import { describe, expect, it } from "vitest";
import { jstDateString, jstFiscalYear, jstMonthDay, jstTimeHHMM, jstYearMonth } from "../time";

describe("JST time helpers", () => {
  it("uses the JST calendar date near UTC month boundaries", () => {
    const jstMorningAtMonthStart = new Date("2026-06-30T23:59:00Z");

    expect(jstDateString(jstMorningAtMonthStart)).toBe("2026-07-01");
    expect(jstYearMonth(0, jstMorningAtMonthStart)).toBe("2026-07");
    expect(jstYearMonth(-1, jstMorningAtMonthStart)).toBe("2026-06");
  });

  it("formats JST clock and month/day labels", () => {
    const date = new Date("2026-06-30T15:05:00Z");

    expect(jstTimeHHMM(date)).toBe("00:05");
    expect(jstMonthDay(date)).toBe("7/1");
  });

  it("calculates fiscal year by JST date", () => {
    expect(jstFiscalYear(new Date("2026-03-31T15:00:00Z"))).toBe("2026");
    expect(jstFiscalYear(new Date("2026-03-31T14:59:00Z"))).toBe("2025");
  });
});
