import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { classifyCostOperation, emptyCostClassSummary, addCostClassUsage } from "../../convex/costEconomicsLogic";

function convexSource(file: string) {
  return readFileSync(join(process.cwd(), "convex", file), "utf8");
}

describe("organization-scoped usage accounting", () => {
  it("uses one organization/day ledger instead of multiplying allowance by collaborator", () => {
    const scope = convexSource("organizationUsageScope.ts");
    const ledger = convexSource("organizationDailyUsage.ts");
    const workState = convexSource("atlasWorkState.ts");
    const chat = convexSource("atlasChat.ts");
    const schema = convexSource("schema.ts");

    expect(scope).toContain("organizationId: organization._id");
    expect(scope).toContain('scope: "organization"');
    expect(schema).toContain("organizationDailyUsage: defineTable");
    expect(schema).toContain('index("by_organizationId_dateKey", ["organizationId", "dateKey"])');
    expect(ledger).toContain("ensureOrganizationDailyUsage");
    expect(ledger).toContain("aggregateLegacyOrganizationUsage");
    expect(ledger).toContain('membership.status === "active"');
    expect(workState).toContain("ensureOrganizationDailyUsage");
    expect(workState).toContain("usageScope.organizationId");
    expect(chat).toContain("ensureOrganizationDailyUsage");
    expect(chat).toContain("usageScope.organizationId");
    expect(chat).toContain("canAskWithinDailyAllowance(usageScope.plan");
  });

  it("preserves user-scoped accounting for legacy inventions", () => {
    const scope = convexSource("organizationUsageScope.ts");
    const workState = convexSource("atlasWorkState.ts");
    const chat = convexSource("atlasChat.ts");

    expect(scope).toContain('scope: "legacy_user"');
    expect(scope).toContain("usageUserId: invention.userId");
    expect(workState).toContain('usageScope.scope === "legacy_user"');
    expect(workState).toContain('query("atlasDailyUsage")');
    expect(chat).toContain('usageScope.scope === "legacy_user"');
    expect(chat).toContain('insert("atlasDailyUsage"');
  });

  it("makes organization reservation checks and writes part of one mutation transaction", () => {
    const ledger = convexSource("organizationDailyUsage.ts");
    const workState = convexSource("atlasWorkState.ts");

    expect(ledger).toContain("indexed read plus insert/update occurs");
    expect(workState).toContain("remainingAutonomousCostUnitsAfterReservations");
    expect(workState).toContain("reservedAutonomousCostUnits");
    expect(workState).toContain("await ctx.db.patch(organizationUsage._id");
    expect(workState).toContain("settleUsageReservation");
    expect(workState).toContain("stale output was discarded");
  });

  it("lets the current-usage API report an authorized organization's shared allowance", () => {
    const source = convexSource("atlasUsage.ts");
    expect(source).toContain('organizationId: v.optional(v.id("organizations"))');
    expect(source).toContain("getOrganizationMembership");
    expect(source).toContain("getOrganizationUsageSnapshot");
    expect(source).toContain("plan = organization.planKey");
    expect(source).toContain('scope = "organization"');
  });

  it("reports cost units by organization, invention, operation kind/class and provider without inventing dollars", () => {
    const source = convexSource("organizationUsage.ts");
    expect(source).toContain("getOrganizationUsageOverview");
    expect(source).toContain('query("organizationDailyUsage")');
    expect(source).toContain('query("inventions")');
    expect(source).toContain('query("atlasExecutionEvents")');
    expect(source).toContain('query("atlasWorkItems")');
    expect(source).toContain("byOperationKind");
    expect(source).toContain("byOperationClass");
    expect(source).toContain("byProvider");
    expect(source).toContain("providerCoverageByCostUnits");
    expect(source).toContain("addCostClassUsage");
    expect(source).toContain("estimatedVariableCostUsd: null");
    expect(source).toContain("calibrationReady");
  });

  it("persists Ask InventSmith token/research attribution into execution events", () => {
    const chat = convexSource("atlasChat.ts");
    const chatAction = convexSource("atlasChatAction.ts");
    expect(chatAction).toContain("costUnitsFromTokens");
    expect(chatAction).toContain('provider: "openai"');
    expect(chatAction).toContain("providerUsage");
    expect(chat).toContain('"ask_inventsmith_research"');
    expect(chat).toContain("classifyCostOperation(operationKind)");
    expect(chat).toContain("costUnits: costUnits > 0 ? costUnits : undefined");
  });

  it("classifies expensive generation and research separately from routine work", () => {
    expect(classifyCostOperation("brief_analysis")).toBe("light");
    expect(classifyCostOperation("pricing_strategy")).toBe("standard");
    expect(classifyCostOperation("ask_inventsmith")).toBe("standard");
    expect(classifyCostOperation("ask_inventsmith_research")).toBe("expensive");
    expect(classifyCostOperation("preliminary_prior_art")).toBe("expensive");
    expect(classifyCostOperation("native_cad_generation")).toBe("premium");
    expect(classifyCostOperation("product_render_generation")).toBe("premium");

    const summary = emptyCostClassSummary();
    addCostClassUsage(summary, "brief_analysis", 2, true);
    addCostClassUsage(summary, "preliminary_prior_art", 12, true);
    addCostClassUsage(summary, "product_render_generation", 30, true);
    expect(summary.light).toEqual({ costUnits: 2, completions: 1 });
    expect(summary.expensive).toEqual({ costUnits: 12, completions: 1 });
    expect(summary.premium).toEqual({ costUnits: 30, completions: 1 });
  });
});
