import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("convex/organizationInventions.ts", "utf8");
const initializer = readFileSync("convex/inventionInitialization.ts", "utf8");

describe("organization-native invention lifecycle", () => {
  it("enforces organization membership and plan capacity when creating", () => {
    expect(source).toContain("Organization access required");
    expect(source).toContain('membership.role === "viewer" || membership.role === "professional"');
    expect(source).toContain("canCreateActiveInvention(organization.planKey, activeInventions.length)");
    expect(source).toContain("Organization active-invention limit reached");
  });

  it("creates organization ownership, creator management access and classified canonical memory together", () => {
    expect(source).toContain('ctx.db.insert("inventions"');
    expect(source).toContain("organizationId: args.organizationId");
    expect(source).toContain('ctx.db.insert("inventionAccessGrants"');
    expect(source).toContain('access: "manage"');
    expect(source).toContain("initializeClassifiedInvention");
    expect(initializer).toContain('ctx.db.insert("inventionRecords"');
    expect(initializer).toContain("riskClassForClassification(classification)");
  });

  it("requires management access for archive/restore and rechecks capacity on restore", () => {
    expect(source).toContain('if (access !== "manage")');
    expect(source).toContain("export const archive");
    expect(source).toContain("export const restore");
    expect(source).toContain("Migrate invention to an organization first");
  });
});
