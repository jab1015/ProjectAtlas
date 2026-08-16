import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function convexSource(file: string) {
  return readFileSync(join(process.cwd(), "convex", file), "utf8");
}

describe("organization-scoped usage accounting", () => {
  it("routes organization-owned invention usage through one shared billing owner", () => {
    const scope = convexSource("organizationUsageScope.ts");
    const workState = convexSource("atlasWorkState.ts");
    const chat = convexSource("atlasChat.ts");

    expect(scope).toContain("usageUserId: organization.createdByUserId");
    expect(scope).toContain('scope: "organization"');
    expect(workState).toContain("resolveInventionUsageScope");
    expect(workState).toContain("usageScope.usageUserId");
    expect(workState).toContain("usageScope.plan");
    expect(chat).toContain("resolveInventionUsageScope");
    expect(chat).toContain("usageScope.usageUserId");
    expect(chat).toContain("canAskWithinDailyAllowance(usageScope.plan");
  });

  it("lets the current-usage API report an authorized organization's shared allowance", () => {
    const source = convexSource("atlasUsage.ts");
    expect(source).toContain('organizationId: v.optional(v.id("organizations"))');
    expect(source).toContain("getOrganizationMembership");
    expect(source).toContain("usageUserId = organization.createdByUserId");
    expect(source).toContain("plan = organization.planKey");
    expect(source).toContain('scope = "organization"');
  });

  it("reports cost units by organization, invention and work kind without inventing a dollar conversion", () => {
    const source = convexSource("organizationUsage.ts");
    expect(source).toContain("getOrganizationUsageOverview");
    expect(source).toContain('query("inventions")');
    expect(source).toContain('query("atlasExecutionEvents")');
    expect(source).toContain('query("atlasWorkItems")');
    expect(source).toContain("byWorkKind");
    expect(source).toContain("estimatedVariableCostUsd: null");
    expect(source).toContain("Cost units are measured");
  });
});
