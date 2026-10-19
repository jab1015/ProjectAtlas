import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const convex = (file: string) => fs.readFileSync(path.join(root, "convex", file), "utf8");
const web = (file: string) => fs.readFileSync(path.join(root, "src", file), "utf8");

describe("InventSmith beta access and credit controls", () => {
  it("keeps complimentary access separate, time-bounded, and auditable", () => {
    const schema = convex("schema.ts");
    const access = convex("betaAccessLogic.ts");
    expect(schema).toContain("organizationEntitlementOverrides: defineTable");
    expect(schema).toContain("expiresAt: v.optional(v.number())");
    expect(schema).toContain("revokedByUserId");
    expect(access).toContain("override.startsAt <= now");
    expect(access).toContain("override.expiresAt > now");
  });

  it("provides administrator-only account grants, revocation, and ledger adjustments", () => {
    const source = convex("betaAccess.ts");
    expect(source).toContain("export const grantComplimentaryAccess");
    expect(source).toContain("export const revokeComplimentaryAccess");
    expect(source).toContain("export const adjustCredits");
    expect(source).toContain("await requireAdmin(ctx)");
    expect(source).toContain("Credit adjustment cannot make the balance negative");
    expect(source).toContain("Superseded by a new access grant");
  });

  it("uses the effective complimentary plan in organization capacity and work paths", () => {
    expect(convex("organizationInventions.ts")).toContain("getEffectiveOrganizationPlanKey");
    expect(convex("organizationInvitations.ts")).toContain("getEffectiveOrganizationPlanKey");
    expect(convex("organizationUsageScope.ts")).toContain("getEffectiveOrganizationPlanKey");
    expect(convex("atlasWorkState.ts")).toContain("getOrganizationCreditBalance");
  });

  it("lets an administrator select an existing account and configure its access inline", () => {
    const page = web("app/(admin)/admin/beta-access/page.tsx");
    const sidebar = web("components/admin/admin-sidebar.tsx");
    expect(page).toContain("Manage access");
    expect(page).toContain("Lifetime access (no expiration)");
    expect(page).toContain("Grant lifetime access");
    expect(page).toContain("submitGrant(event, account.email)");
    expect(page).not.toContain("beta tester email");
    expect(sidebar).toContain("/admin/beta-access");
  });
});
