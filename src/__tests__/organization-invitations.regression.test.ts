import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(join(process.cwd(), "convex/schema.ts"), "utf8");
const invitations = readFileSync(join(process.cwd(), "convex/organizationInvitations.ts"), "utf8");
const organizations = readFileSync(join(process.cwd(), "convex/organizations.ts"), "utf8");
const page = readFileSync(join(process.cwd(), "src/app/(app)/organizations/page.tsx"), "utf8");

describe("organization invitations", () => {
  it("uses an additive invitation ledger with bounded statuses and lookup indexes", () => {
    expect(schema).toContain("organizationInvitations: defineTable");
    expect(schema).toContain('v.literal("pending"), v.literal("accepted"), v.literal("revoked"), v.literal("expired")');
    expect(schema).toContain('acceptedByUserId: v.optional(v.id("users"))');
    expect(schema).toContain('.index("by_organizationId_email", ["organizationId", "email"])');
    expect(schema).toContain('.index("by_email_status", ["email", "status"])');
  });

  it("requires organization management authority and reserves a purchased seat", () => {
    expect(invitations).toContain('requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"])');
    expect(invitations).toContain("countReservedSeats");
    expect(invitations).toContain('invitation.status === "pending" && invitation.expiresAt > now');
    expect(invitations).toContain("Organization included-seat limit reached");
    expect(organizations).toContain('query("organizationInvitations")');
    expect(organizations).toContain('invitation.status === "pending" && invitation.expiresAt > now');
  });

  it("binds each secure invitation to the exact pre-existing account, not only a mutable email", () => {
    expect(invitations).toContain("getUniqueAccountByEmail");
    expect(invitations).toContain("must create an InventSmith account before a secure invitation can be issued");
    expect(invitations).toContain("users.length !== 1");
    expect(invitations).toContain("acceptedByUserId: intendedUser._id");
    expect(invitations).toContain("invitation.acceptedByUserId !== userId");
    expect(invitations).toContain("Status, not the presence of this field, is the source of truth for consent");
  });

  it("fails closed for pre-binding invitations and requires administrator reissue", () => {
    expect(invitations).toContain("if (!invitation.acceptedByUserId)");
    expect(invitations).toContain("predates secure account binding and must be reissued");
    expect(invitations).toContain("if (!invitation.acceptedByUserId || invitation.acceptedByUserId !== userId) continue");
    expect(invitations).toContain("invitation email no longer matches the intended account");
  });

  it("grants membership only after explicit acceptance by the intended authenticated account", () => {
    expect(invitations).toContain("acceptInvitation");
    expect(invitations).toContain("invitation.email !== userEmail");
    expect(invitations).toContain('status: "accepted"');
    expect(invitations).toContain("acceptedByUserId: userId");
    expect(invitations).toContain('status: "active"');
  });

  it("supports revocation and expiration without granting invention access", () => {
    expect(invitations).toContain("revokeInvitation");
    expect(invitations).toContain('status: "revoked"');
    expect(invitations).toContain('status: "expired"');
    expect(invitations).not.toContain('insert("inventionAccessGrants"');
  });

  it("uses consent-based invitations in the organization UI instead of direct membership assignment", () => {
    expect(page).toContain("organizationInvitations:inviteMemberByEmail");
    expect(page).toContain("organizationInvitations:getMyPendingInvitations");
    expect(page).toContain("organizationInvitations:acceptInvitation");
    expect(page).toContain("organizationInvitations:revokeInvitation");
    expect(page).not.toContain("organizations:addMemberByEmail");
    expect(page).toContain("no membership or invention access is granted before acceptance");
  });
});
