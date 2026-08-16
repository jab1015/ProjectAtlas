import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "convex/privacyExport.ts"), "utf8");
const organizationExport = readFileSync(join(process.cwd(), "convex/organizationExport.ts"), "utf8");

describe("organization-aware personal data export", () => {
  it("exports only legacy/personal-organization inventions from My Data", () => {
    expect(source).toContain("personalExportScope");
    expect(source).toContain("personalOrganizationIds");
    expect(source).toContain("!invention.organizationId || personalOrganizationIds.has(String(invention.organizationId))");
    expect(source).toContain("Company/studio invention and usage data is excluded from this personal export");
  });

  it("reports organization affiliations without treating company projects as personal data", () => {
    expect(source).toContain("organizationAffiliations");
    expect(source).toContain("membershipStatus: membership.status");
    expect(source).toContain("role: membership.role");
  });

  it("exports personal organization usage without leaking company/studio usage", () => {
    expect(source).toContain("personalOrganizationIdValues");
    expect(source).toContain('query("organizationDailyUsage")');
    expect(source).toContain("personalOrganizationDailyUsage: personalOrganizationUsage");
    expect(organizationExport).toContain('query("organizationDailyUsage")');
    expect(organizationExport).toContain("dailyUsage");
    expect(organizationExport).toContain('requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"])');
  });

  it("keeps binary bytes and authentication secrets out of the JSON export", () => {
    expect(source).toContain("binaryContentIncluded: false");
    expect(source).toContain('"password hashes"');
    expect(source).toContain('"auth sessions"');
    expect(source).not.toContain('query("authSessions")');
  });
});
