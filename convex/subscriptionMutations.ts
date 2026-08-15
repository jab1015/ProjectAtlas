import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { effectiveTierForSubscription } from "./subscriptionPolicyLogic";

export const applySubscriptionEvent = internalMutation({
  args: {
    providerEventId: v.string(), customerEmail: v.string(),
    tier: v.union(v.literal("inventor"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    ),
    subscriptionId: v.optional(v.string()), billingCustomerId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()), occurredAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("subscriptionEvents").withIndex("by_providerEventId", (q) => q.eq("providerEventId", args.providerEventId)).unique();
    if (existing) return { duplicate: true, applied: Boolean(existing.appliedUserId) };
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.customerEmail)).first();
    const receivedAt = Date.now();
    const stale = Boolean(user && (user.subscriptionUpdatedAt ?? 0) > args.occurredAt);
    const eventId = await ctx.db.insert("subscriptionEvents", { ...args, appliedUserId: user && !stale ? user._id : undefined, receivedAt });
    if (!user) return { duplicate: false, applied: false, eventId };
    if (stale) return { duplicate: false, applied: false, eventId, stale: true };
    await ctx.db.patch(user._id, {
      subscriptionTier: user.role === "admin" ? "enterprise" : effectiveTierForSubscription(args.tier, args.status, args.currentPeriodEnd, receivedAt),
      subscriptionStatus: args.status, subscriptionId: args.subscriptionId,
      billingCustomerId: args.billingCustomerId, subscriptionCurrentPeriodEnd: args.currentPeriodEnd,
      subscriptionUpdatedAt: args.occurredAt,
    });
    return { duplicate: false, applied: true, eventId };
  },
});
