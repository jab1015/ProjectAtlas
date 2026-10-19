import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { requireInventionReadAccess, resolveInventionAccess } from "./organizations";

export const getActiveAccessibleInvention = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const visible = new Map<string, any>();

    // Preserve unmigrated legacy inventions during the additive transition.
    const legacy = await ctx.db
      .query("inventions")
      .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "active"))
      .collect();
    for (const invention of legacy) visible.set(String(invention._id), { ...invention, access: "manage" as const });

    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "active"))
      .collect();

    for (const membership of memberships) {
      const organization = await ctx.db.get(membership.organizationId);
      if (!organization || organization.status !== "active") continue;
      const inventions = await ctx.db
        .query("inventions")
        .withIndex("by_organizationId_status", (q) => q.eq("organizationId", membership.organizationId).eq("status", "active"))
        .collect();
      for (const invention of inventions) {
        const access = await resolveInventionAccess(ctx, invention._id, userId);
        if (access) visible.set(String(invention._id), { ...invention, access });
      }
    }

    return [...visible.values()].sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
  },
});

export const getInventionRouteState = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    const { access } = await requireInventionReadAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    return {
      inventionId: invention._id,
      title: invention.title,
      currentStageId: invention.currentStageId,
      status: invention.status,
      organizationId: invention.organizationId ?? null,
      access,
    };
  },
});
