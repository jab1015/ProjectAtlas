import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "convex/accountDeletion.ts"), "utf8");

describe("organization-aware account deletion", () => {
  it("blocks company/studio owners until ownership is resolved", () => {
    expect(source).toContain('membership.role === "owner" && organization.kind !== "personal"');
    expect(source).toContain("Transfer or close company/studio ownership before deleting this account");
  });

  it("deletes only legacy or personal-organization inventions", () => {
    expect(source).toContain(".filter((invention) => !invention.organizationId)");
    expect(source).toContain("personalOrganizationIds");
    expect(source).toContain('withIndex("by_organizationId"');
    expect(source).not.toContain("for (const invention of inventions) {\n    const result = await deleteInventionData(ctx, invention._id);\n    generatedFilesDeleted += result.generatedFilesDeleted;\n    uploadedFilesDeleted += result.uploadedFilesDeleted;\n  }\n\n  const notifications");
  });

  it("removes the departing member's grants and memberships without deleting company inventions", () => {
    expect(source).toContain('query("inventionAccessGrants")');
    expect(source).toContain('withIndex("by_userId"');
    expect(source).toContain("for (const grant of accessGrants) await ctx.db.delete(grant._id)");
    expect(source).toContain("for (const membership of memberships) await ctx.db.delete(membership._id)");
  });

  it("deletes uploaded evidence storage and invention-level access grants when personal invention data is deleted", () => {
    expect(source).toContain("source.metadata?.storageId");
    expect(source).toContain('query("inventionAccessGrants").withIndex("by_inventionId"');
  });

  it("removes usage rows only when the owned personal organization itself is deleted", () => {
    expect(source).toContain('query("organizationDailyUsage")');
    expect(source).toContain('withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))');
    expect(source).toContain("organizationUsageRowsDeleted += organizationUsage.length");
    expect(source).toContain("usageRowsDeleted: usage.length + organizationUsageRowsDeleted");
    expect(source).toContain("Company/studio ledgers are intentionally untouched when a member leaves");
  });
});
