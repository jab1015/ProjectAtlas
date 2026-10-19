import { describe, expect, it } from "vitest";
import { safeWorkFailureSummary } from "@convex/workFailureSummary";

describe("safe work failure summaries", () => {
  it("explains common provider failures without echoing raw errors", () => {
    const raw = "401 Incorrect API key: sk-proj-super-secret";
    const summary = safeWorkFailureSummary(raw);
    expect(summary).toMatch(/rejected its configured credentials/i);
    expect(summary).not.toContain("sk-proj");
    expect(summary).not.toContain(raw);
  });

  it("distinguishes quota and rate-limit failures", () => {
    expect(safeWorkFailureSummary("insufficient_quota")).toMatch(/quota/i);
    expect(safeWorkFailureSummary("429 too many requests")).toMatch(/rate limited/i);
  });

  it("uses a safe generic message for unexpected provider errors", () => {
    expect(safeWorkFailureSummary("database internal details")).toMatch(/check InventSmith Operations/i);
  });
});
