import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schemaSource = readFileSync("convex/schema.ts", "utf8");
const organizationSource = readFileSync("convex/organizations.ts", "utf8");

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

  it("requires active organization membership and explicit authorization for shared inventions", () => {
    expect(organizationSource).toContain('membership.status !== "active"');
    expect(organizationSource).toContain("defaultInventionAccessForRole");
    expect(organizationSource).toContain("requireInventionEditAccess");
    expect(organizationSource).toContain("requireInventionManageAccess");
    expect(organizationSource).toContain("Target user must be an active organization member");
  });
});
