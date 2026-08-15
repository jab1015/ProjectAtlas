import { describe, expect, it } from "vitest";
import { classifyWorkHealth, operationalSeverity } from "@convex/operationalHealthLogic";

describe("Atlas operational health", () => {
  it("distinguishes active work from an expired lease", () => {
    expect(classifyWorkHealth({ status: "running", leaseExpiresAt: 1_001 }, 1_000)).toBe("healthy");
    expect(classifyWorkHealth({ status: "running", leaseExpiresAt: 1_000 }, 1_000)).toBe("expired");
  });

  it("surfaces failed and human-blocked work", () => {
    expect(classifyWorkHealth({ status: "failed" }, 1_000)).toBe("failed");
    expect(classifyWorkHealth({ status: "blocked" }, 1_000)).toBe("blocked");
    expect(classifyWorkHealth({ status: "awaiting_approval" }, 1_000)).toBe("blocked");
  });

  it("orders failures and expired leases ahead of human gates", () => {
    expect(operationalSeverity("failed")).toBeLessThan(operationalSeverity("expired"));
    expect(operationalSeverity("expired")).toBeLessThan(operationalSeverity("blocked"));
  });
});
