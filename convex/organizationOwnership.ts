import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOrganizationMembership, requireOrganizationRole } from "./organizations";

/**
 * Transfer company/studio ownership.
 *
 * Usage reservations are now keyed directly by organization + UTC day, so
 * changing the human owner cannot reset or multiply the organization's shared
 * allowance. `createdByUserId` remains the current organization owner/billing
 * contact reference for backward compatibility and moves with the owner.
 */
export const transferOwnership = mutation({
  args: {
    organizationId: v.id("organizations"),
    newOwnerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId: currentOwnerUserId, membership: currentOwnerMembership } = await requireOrganizationRole(
      ctx,
      args.organizationId,
      ["owner"],
    );
    if (currentOwnerUserId === args.newOwnerUserId) return { transferred: false, reason: "already_owner" as const };

    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.status !== "active") throw new ConvexError("Organization not found");
    if (organization.kind === "personal") throw new ConvexError("Personal InventSmith ownership cannot be transferred");

    const targetMembership = await getOrganizationMembership(ctx, args.organizationId, args.newOwnerUserId);
    if (!targetMembership || targetMembership.status !== "active") {
      throw new ConvexError("The new owner must already be an active organization member");
    }

    const now = Date.now();
    await ctx.db.patch(currentOwnerMembership._id, { role: "admin", updatedAt: now });
    await ctx.db.patch(targetMembership._id, { role: "owner", updatedAt: now });
    await ctx.db.patch(organization._id, {
      // Keep the compatibility owner/billing-contact reference aligned with the
      // authoritative owner membership. Usage no longer depends on this field.
      createdByUserId: args.newOwnerUserId,
      updatedAt: now,
    });

    return {
      transferred: true,
      organizationId: organization._id,
      previousOwnerUserId: currentOwnerUserId,
      newOwnerUserId: args.newOwnerUserId,
    };
  },
});
