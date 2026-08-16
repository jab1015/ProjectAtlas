import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOrganizationMembership, requireOrganizationRole } from "./organizations";
import { utcDateKey } from "./usagePolicyLogic";

/**
 * Transfer company/studio ownership without creating a quota-reset loophole.
 *
 * `organizations.createdByUserId` is also the transitional shared usage/billing
 * anchor until the persisted usage ledger is keyed directly by organization.
 * For that reason it moves with ownership for now. Transfer is refused after
 * any shared usage has been consumed/reserved today; the owner can retry after
 * the UTC usage reset. Once the organization-native ledger replaces this
 * transition, that restriction can be removed.
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

    const dateKey = utcDateKey(Date.now());
    const currentUsage = await ctx.db
      .query("atlasDailyUsage")
      .withIndex("by_userId_dateKey", (q) => q.eq("userId", currentOwnerUserId).eq("dateKey", dateKey))
      .unique();
    if (
      currentUsage &&
      (currentUsage.autonomousCostUnits > 0 ||
        (currentUsage.reservedAutonomousCostUnits ?? 0) > 0 ||
        currentUsage.chatQuestions > 0)
    ) {
      throw new ConvexError("Ownership transfer is available after the shared daily usage allowance resets at 00:00 UTC");
    }

    const now = Date.now();
    await ctx.db.patch(currentOwnerMembership._id, { role: "admin", updatedAt: now });
    await ctx.db.patch(targetMembership._id, { role: "owner", updatedAt: now });
    await ctx.db.patch(organization._id, {
      // Transitional field doubles as the organization billing/usage owner.
      // Move it so account deletion never leaves a dangling user reference.
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
