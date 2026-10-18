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
  });

  it("uses the effective complimentary plan in organization capacity and work paths", () => {
    expect(convex("organizationInventions.ts")).toContain("getEffectiveOrganizationPlanKey");
    expect(convex("organizationInvitations.ts")).toContain("getEffectiveOrganizationPlanKey");
    expect(convex("organizationUsageScope.ts")).toContain("getEffectiveOrganizationPlanKey");
    expect(convex("atlasWorkState.ts")).toContain("getOrganizationCreditBalance");
  });

  it("exposes a dedicated admin surface without changing the base Explorer plan", () => {
    const page = web("app/(admin)/admin/beta-access/page.tsx");
    const sidebar = web("components/admin/admin-sidebar.tsx");
    expect(page).toContain("Grant complimentary access");
    expect(page).toContain("This creates a dated override");
    expect(sidebar).toContain("/admin/beta-access");
  });
});
