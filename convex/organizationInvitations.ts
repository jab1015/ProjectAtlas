import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getOrganizationMembership, requireOrganizationRole } from "./organizations";
import { getOrganizationPlanPolicy } from "./organizationPolicyLogic";

const INVITATION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

type InviteRole = "admin" | "member" | "viewer" | "professional";

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized) || normalized.length > 320) {
    throw new ConvexError("Enter a valid email address");
  }
  return normalized;
}

async function getUniqueAccountByEmail(ctx: MutationCtx, email: string) {
  const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).collect();
  if (users.length !== 1) return null;
  return users[0];
}

async function countReservedSeats(ctx: MutationCtx, organizationId: Id<"organizations">, now: number) {
  const [memberships, invitations] = await Promise.all([
    ctx.db
      .query("organizationMemberships")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .collect(),
    ctx.db
      .query("organizationInvitations")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
      .collect(),
  ]);
  const members = memberships.filter((membership) => membership.status === "active" || membership.status === "invited").length;
  const pendingInvites = invitations.filter((invitation) => invitation.status === "pending" && invitation.expiresAt > now).length;
  return members + pendingInvites;
}

async function expirePendingInvitation(ctx: MutationCtx, invitation: any, now: number) {
  if (invitation.status === "pending" && invitation.expiresAt <= now) {
    await ctx.db.patch(invitation._id, { status: "expired", updatedAt: now });
    return true;
  }
  return false;
}

export const inviteMemberByEmail = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer"), v.literal("professional")),
  },
  handler: async (ctx, args) => {
    const { userId: invitedByUserId } = await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);
    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.status !== "active") throw new ConvexError("Organization not found");

    const email = normalizeEmail(args.email);
    const inviter = await ctx.db.get(invitedByUserId);
    if (inviter?.email?.trim().toLowerCase() === email) throw new ConvexError("You already belong to this organization");

    // Password auth currently has no verified-email delivery provider. Until one
    // is configured, invitations are deliberately bound to a specific account
    // that already exists rather than trusting an address registered later.
    const intendedUser = await getUniqueAccountByEmail(ctx, email);
    if (!intendedUser) {
      throw new ConvexError("That person must create an InventSmith account before a secure invitation can be issued");
    }
    const membership = await getOrganizationMembership(ctx, args.organizationId, intendedUser._id);
    if (membership?.status === "active") throw new ConvexError("That person already belongs to this organization");

    const now = Date.now();
    const existingInvitations = await ctx.db
      .query("organizationInvitations")
      .withIndex("by_organizationId_email", (q) => q.eq("organizationId", args.organizationId).eq("email", email))
      .collect();
    const pending = existingInvitations.find((invitation) => invitation.status === "pending" && invitation.expiresAt > now);
    for (const invitation of existingInvitations) await expirePendingInvitation(ctx, invitation, now);

    // Migration-safe account binding: acceptedByUserId is pre-populated while
    // status is pending, then remains the same user when status becomes accepted.
    // Status, not the presence of this field, is the source of truth for consent.
    if (pending) {
      await ctx.db.patch(pending._id, {
        acceptedByUserId: intendedUser._id,
        role: args.role,
        invitedByUserId,
        expiresAt: now + INVITATION_TTL_MS,
        updatedAt: now,
      });
      return { invitationId: pending._id, created: false, expiresAt: now + INVITATION_TTL_MS };
    }

    const policy = getOrganizationPlanPolicy(organization.planKey);
    const reservedSeats = await countReservedSeats(ctx, args.organizationId, now);
    if (policy.includedSeatLimit !== null && reservedSeats >= policy.includedSeatLimit) {
      throw new ConvexError("Organization included-seat limit reached");
    }

    const expiresAt = now + INVITATION_TTL_MS;
    const invitationId = await ctx.db.insert("organizationInvitations", {
      organizationId: args.organizationId,
      email,
      role: args.role as InviteRole,
      status: "pending",
      invitedByUserId,
      acceptedByUserId: intendedUser._id,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
    return { invitationId, created: true, expiresAt };
  },
});

export const listOrganizationInvitations = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);
    const now = Date.now();
    const invitations = await ctx.db
      .query("organizationInvitations")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    return invitations
      .filter((invitation) => invitation.status === "pending" && invitation.expiresAt > now)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((invitation) => ({
        invitationId: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      }));
  },
});

export const revokeInvitation = mutation({
  args: { organizationId: v.id("organizations"), invitationId: v.id("organizationInvitations") },
  handler: async (ctx, args) => {
    await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.organizationId !== args.organizationId) throw new ConvexError("Invitation not found");
    if (invitation.status !== "pending") return { revoked: false };
    const now = Date.now();
    if (invitation.expiresAt <= now) {
      await ctx.db.patch(invitation._id, { status: "expired", updatedAt: now });
      return { revoked: false };
    }
    await ctx.db.patch(invitation._id, { status: "revoked", updatedAt: now });
    return { revoked: true };
  },
});

export const getMyPendingInvitations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const user = await ctx.db.get(userId);
    const email = user?.email?.trim().toLowerCase();
    if (!email) return [];

    const usersForEmail = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).collect();
    if (usersForEmail.length !== 1 || usersForEmail[0]._id !== userId) return [];

    const now = Date.now();
    const invitations = await ctx.db
      .query("organizationInvitations")
      .withIndex("by_email_status", (q) => q.eq("email", email).eq("status", "pending"))
      .collect();
    const result = [];
    for (const invitation of invitations) {
      if (invitation.expiresAt <= now) continue;
      // Invitations created before stable account binding are intentionally hidden
      // until an organization administrator reissues them.
      if (!invitation.acceptedByUserId || invitation.acceptedByUserId !== userId) continue;
      const organization = await ctx.db.get(invitation.organizationId);
      if (!organization || organization.status !== "active") continue;
      result.push({
        invitationId: invitation._id,
        organizationId: organization._id,
        organizationName: organization.name,
        organizationKind: organization.kind,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      });
    }
    return result.sort((a, b) => a.expiresAt - b.expiresAt);
  },
});

export const acceptInvitation = mutation({
  args: { invitationId: v.id("organizationInvitations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const user = await ctx.db.get(userId);
    const userEmail = user?.email?.trim().toLowerCase();
    if (!userEmail) throw new ConvexError("An account email is required to accept an invitation");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.status !== "pending") throw new ConvexError("Invitation is no longer available");
    if (!invitation.acceptedByUserId) {
      throw new ConvexError("This invitation predates secure account binding and must be reissued by an organization administrator");
    }
    if (invitation.acceptedByUserId !== userId) throw new ConvexError("This invitation belongs to a different InventSmith account");
    if (invitation.email !== userEmail) throw new ConvexError("This invitation email no longer matches the intended account; ask an organization administrator to reissue it");
    const intendedUser = await getUniqueAccountByEmail(ctx, invitation.email);
    if (!intendedUser || intendedUser._id !== userId) throw new ConvexError("This invitation belongs to a different InventSmith account");

    const now = Date.now();
    if (invitation.expiresAt <= now) {
      await ctx.db.patch(invitation._id, { status: "expired", updatedAt: now });
      throw new ConvexError("This invitation has expired");
    }

    const organization = await ctx.db.get(invitation.organizationId);
    if (!organization || organization.status !== "active") throw new ConvexError("Organization is no longer available");

    const policy = getOrganizationPlanPolicy(organization.planKey);
    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", organization._id))
      .collect();
    const existing = memberships.find((membership) => membership.userId === userId);

    // Acceptance converts this pending invitation into a membership rather than
    // consuming a second seat. Recalculate the projected reservation total so a
    // plan downgrade or stale over-reservation cannot push the organization past
    // its current included-seat limit.
    const reservedSeats = await countReservedSeats(ctx, organization._id, now);
    const existingAlreadyOccupiesSeat = Boolean(existing && (existing.status === "active" || existing.status === "invited"));
    const projectedReservedSeats = reservedSeats - 1 + (existingAlreadyOccupiesSeat ? 0 : 1);
    if (policy.includedSeatLimit !== null && projectedReservedSeats > policy.includedSeatLimit) {
      throw new ConvexError("The organization no longer has an available seat for this invitation");
    }

    let membershipId: Id<"organizationMemberships">;
    if (existing) {
      if (existing.status === "active") {
        membershipId = existing._id;
      } else {
        await ctx.db.patch(existing._id, { role: invitation.role, status: "active", updatedAt: now });
        membershipId = existing._id;
      }
    } else {
      membershipId = await ctx.db.insert("organizationMemberships", {
        organizationId: organization._id,
        userId,
        role: invitation.role,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedByUserId: userId,
      updatedAt: now,
    });
    return { organizationId: organization._id, membershipId, role: invitation.role };
  },
});
