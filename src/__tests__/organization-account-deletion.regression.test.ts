import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "convex/accountDeletion.ts"), "utf8");

describe("organization-aware account deletion", () => {
  it("blocks company/studio owners until ownership is resolved even when membership is suspended", () => {
    expect(source).toContain('if (membership.status === "removed") continue');
    expect(source).toContain('membership.role === "owner" && organization.kind !== "personal"');
    expect(source).toContain("Transfer or close company/studio ownership before deleting this account");
    expect(source).not.toContain('if (membership.status !== "active") continue');
  });

  it("deletes only legacy or personal-organization inventions", () => {
    expect(source).toContain(".filter((invention) => !invention.organizationId)");
    expect(source).toContain("personalOrganizationIds");
    expect(source).toContain('withIndex("by_organizationId"');
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

  it("removes usage and invitation rows when the owned personal organization itself is deleted", () => {
    expect(source).toContain('query("organizationDailyUsage")');
    expect(source).toContain("organizationUsageRowsDeleted += organizationUsage.length");
    expect(source).toContain('query("organizationInvitations").withIndex("by_organizationId"');
    expect(source).toContain("usageRowsDeleted: usage.length + organizationUsageRowsDeleted");
  });

  it("anonymizes billing events only when stable user or personal-organization identity matches", () => {
    expect(source).toContain("matchingSubscriptionEvents");
    expect(source).toContain("personalSubscriptionEvents");
    expect(source).toContain("row.appliedUserId === userId");
    expect(source).toContain("belongsToPersonalOrganization");
    expect(source).toContain("if (!belongsToUser && !belongsToPersonalOrganization) return false");
    expect(source).toContain("subscriptionEventsAnonymized: personalSubscriptionEvents.length");
  });

  it("anonymizes bound invitations and uses email-only legacy rows only when the address uniquely identifies the deleted account", () => {
    expect(source).toContain("invitationRowsForEmail");
    expect(source).toContain("invitationRowsForAccount");
    expect(source).toContain("emailUniquelyBelongsToUser");
    expect(source).toContain("!row.acceptedByUserId || row.acceptedByUserId === userId");
    expect(source).toContain('row.acceptedByUserId === userId');
    expect(source).toContain("invitationRowsById");
    expect(source).toContain("changed email after the");
    expect(source).toContain("deleted-invite-${row._id}@invalid.local");
    expect(source).toContain('row.status === "pending" ? "revoked" : row.status');
    expect(source).toContain("acceptedByUserId: row.acceptedByUserId === userId ? undefined : row.acceptedByUserId");
    expect(source).toContain("invitationsAnonymized: invitationRows.length");
  });
});
