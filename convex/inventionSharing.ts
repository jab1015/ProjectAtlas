import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getOrganizationMembership,
  requireInventionManageAccess,
} from "./organizations";
import { defaultInventionAccessForRole } from "./organizationPolicyLogic";

export const listAssignments = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionManageAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention?.organizationId) throw new ConvexError("Migrate invention to an organization first");
    const organizationId = invention.organizationId;

    const [memberships, grants] = await Promise.all([
      ctx.db
        .query("organizationMemberships")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
        .collect(),
      ctx.db
        .query("inventionAccessGrants")
        .withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId))
        .collect(),
    ]);
    const grantByUserId = new Map(grants.map((grant) => [String(grant.userId), grant]));

    const assignments = [];
    for (const membership of memberships) {
      if (membership.status !== "active") continue;
      const user = await ctx.db.get(membership.userId);
      const explicit = grantByUserId.get(String(membership.userId));
      const inheritedAccess = defaultInventionAccessForRole(membership.role);
      assignments.push({
        userId: membership.userId,
        name: user?.name,
        email: user?.email,
        role: membership.role,
        inheritedAccess,
        explicitAccess: explicit?.access ?? null,
        effectiveAccess: explicit?.access ?? inheritedAccess,
      });
    }
    return assignments;
  },
});

export const setAssignment = mutation({
  args: {
    inventionId: v.id("inventions"),
    userId: v.id("users"),
    access: v.union(v.literal("manage"), v.literal("edit"), v.literal("view"), v.literal("review")),
  },
  handler: async (ctx, args) => {
    const { userId: actingUserId } = await requireInventionManageAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention?.organizationId) throw new ConvexError("Migrate invention to an organization first");

    const membership = await getOrganizationMembership(ctx, invention.organizationId, args.userId);
    if (!membership || membership.status !== "active") throw new ConvexError("Target user must be an active organization member");
    if (membership.role === "owner" && args.access !== "manage") {
      throw new ConvexError("Organization owner must retain management access");
    }

    const existing = await ctx.db
      .query("inventionAccessGrants")
      .withIndex("by_inventionId_userId", (q) => q.eq("inventionId", args.inventionId).eq("userId", args.userId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { access: args.access, grantedByUserId: actingUserId, updatedAt: now });
      return existing._id;
    }
    return ctx.db.insert("inventionAccessGrants", {
      inventionId: args.inventionId,
      organizationId: invention.organizationId,
      userId: args.userId,
      access: args.access,
      grantedByUserId: actingUserId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const clearAssignment = mutation({
  args: { inventionId: v.id("inventions"), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireInventionManageAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention?.organizationId) throw new ConvexError("Migrate invention to an organization first");

    const membership = await getOrganizationMembership(ctx, invention.organizationId, args.userId);
    if (!membership || membership.status !== "active") throw new ConvexError("Active organization member not found");
    if (membership.role === "owner") throw new ConvexError("Organization owner management access cannot be removed");

    const existing = await ctx.db
      .query("inventionAccessGrants")
      .withIndex("by_inventionId_userId", (q) => q.eq("inventionId", args.inventionId).eq("userId", args.userId))
      .first();
    if (!existing) return { cleared: false, fallbackAccess: defaultInventionAccessForRole(membership.role) };
    await ctx.db.delete(existing._id);
    return { cleared: true, fallbackAccess: defaultInventionAccessForRole(membership.role) };
  },
});
