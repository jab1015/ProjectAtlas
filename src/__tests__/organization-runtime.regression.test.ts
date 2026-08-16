import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schemaSource = readFileSync("convex/schema.ts", "utf8");
const organizationSource = readFileSync("convex/organizations.ts", "utf8");
const usageScopeSource = readFileSync("convex/organizationUsageScope.ts", "utf8");
const chatSource = readFileSync("convex/atlasChat.ts", "utf8");
const workspaceSource = readFileSync("convex/inventionWorkspace.ts", "utf8");
const workStateSource = readFileSync("convex/atlasWorkState.ts", "utf8");
const nativeCadSource = readFileSync("convex/nativeCad.ts", "utf8");

describe("InventSmith organization runtime", () => {
  it("keeps organization-native tenancy represented in the Convex schema", () => {
    expect(schemaSource).toContain("organizations: defineTable");
    expect(schemaSource).toContain("organizationMemberships: defineTable");
    expect(schemaSource).toContain("inventionAccessGrants: defineTable");
    expect(schemaSource).toContain('personalOrganizationId: v.optional(v.id("organizations"))');
    expect(schemaSource).toContain('organizationId: v.optional(v.id("organizations"))');
    expect(schemaSource).toContain('.index("by_organizationId_status", ["organizationId", "status"])');
  });

  it("preserves legacy ownership until inventions are migrated", () => {
    expect(organizationSource).toContain("if (!invention.organizationId)");
    expect(organizationSource).toContain('return invention.userId === userId ? "manage" : null');
    expect(organizationSource).toContain("migrateMyLegacyInventions");
    expect(organizationSource).toContain("ensurePersonalOrganizationForUser");
  });

  it("requires active organization membership before any explicit invention grant", () => {
    const membershipCheck = organizationSource.indexOf("const membership = await getOrganizationMembership(ctx, invention.organizationId, userId)");
    const grantCheck = organizationSource.indexOf("const explicitGrant = await ctx.db");
    expect(membershipCheck).toBeGreaterThan(-1);
    expect(grantCheck).toBeGreaterThan(membershipCheck);
    expect(organizationSource).toContain('membership.status !== "active"');
    expect(organizationSource).toContain("defaultInventionAccessForRole");
    expect(organizationSource).toContain("requireInventionEditAccess");
    expect(organizationSource).toContain("requireInventionManageAccess");
    expect(organizationSource).toContain("Target user must be an active organization member");
  });

  it("enforces purchased seat capacity and protects the owner membership", () => {
    expect(organizationSource).toContain("countOccupiedSeats");
    expect(organizationSource).toContain("getOrganizationPlanPolicy(organization.planKey).includedSeatLimit");
    expect(organizationSource).toContain("Organization included-seat limit reached");
    expect(organizationSource).toContain("addMemberByEmail");
    expect(organizationSource).toContain("updateMemberRole");
    expect(organizationSource).toContain("removeMember");
    expect(organizationSource).toContain("Transfer organization ownership before removing the owner");
  });

  it("does not clone a personal paid entitlement when creating another company or studio", () => {
    expect(organizationSource).toContain("createOrganization");
    expect(organizationSource).toContain('planKey: "explorer"');
    expect(organizationSource).toContain("Billing activation upgrades this");
  });

  it("shares one usage allowance across organization members and inventions", () => {
    expect(usageScopeSource).toContain("organization.createdByUserId");
    expect(usageScopeSource).toContain("plan: organization.planKey");
    expect(usageScopeSource).toContain('scope: "organization" as const');
    expect(usageScopeSource).toContain("usageUserId: invention.userId");

    expect(chatSource).toContain("resolveInventionUsageScope(ctx, inventionId)");
    expect(chatSource).toContain('q.eq("userId", usageScope.usageUserId)');
    expect(chatSource).toContain("userId: usageScope.usageUserId");

    expect(workspaceSource).toContain("resolveInventionUsageScope(ctx, inventionId)");
    expect(workspaceSource).toContain('q.eq("userId", usageScope.usageUserId)');
    expect(workspaceSource).toContain("usageScope.plan");

    expect(workStateSource).toContain("resolveInventionUsageScope(ctx, args.inventionId)");
    expect(workStateSource).toContain("resolveInventionUsageScope(ctx, inventionId)");
    expect(workStateSource).toContain('q.eq("userId", usageScope.usageUserId)');
    expect(workStateSource).toContain("userId: usageScope.usageUserId");
    expect(workStateSource).toContain("canTierRunWorkKind(usageScope.plan, kind)");
  });

  it("keeps native CAD inside organization authorization and the shared usage budget", () => {
    expect(nativeCadSource).not.toContain("invention.userId !== userId");
    expect(nativeCadSource).toContain("requireInventionEditAccess(ctx, args.inventionId)");
    expect(nativeCadSource).toContain("requireInventionReadAccess(ctx, args.inventionId)");
    expect(nativeCadSource).toContain("resolveInventionUsageScope(ctx, args.inventionId)");
    expect(nativeCadSource).toContain("resolveInventionUsageScope(ctx, inventionId)");
    expect(nativeCadSource).toContain('q.eq("userId", usageScope.usageUserId)');
    expect(nativeCadSource).toContain("canTierRunWorkKind(usageScope.plan");
    expect(nativeCadSource).toContain("authorized collaborator requested an additional preliminary CAD generation pass");
  });

  it("keeps canonical invention ownership attribution stable when collaborators initialize missing records", () => {
    expect(workspaceSource).toContain("userId: invention.userId");
  });
});
