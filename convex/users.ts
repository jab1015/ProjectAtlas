import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const ADMIN_EMAIL = "jerry.brown1015@gmail.com";
const ADMIN_SUBSCRIPTION_TIER = "enterprise";

function normalizeSubscriptionTier(tier: unknown): "free" | "inventor" | "pro" | "enterprise" {
  switch (tier) {
    case "free":
    case "inventor":
    case "pro":
    case "enterprise":
      return tier;
    case "explorer":
      return "free";
    case "starter":
      return "inventor";
    case "inventor_pro":
      return "pro";
    default:
      return "free";
  }
}

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Called client-side after every sign-in to ensure user has role and tier set.
 * Idempotent — safe to call multiple times.
 * Also grants admin to the designated email.
 */
export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const isAdminEmail = user.email === ADMIN_EMAIL;

    const updates: Record<string, unknown> = {};

    if (isAdminEmail) {
      if (user.role !== "admin") updates.role = "admin";
      if (user.subscriptionTier !== ADMIN_SUBSCRIPTION_TIER) {
        updates.subscriptionTier = ADMIN_SUBSCRIPTION_TIER;
      }
    } else {
      if (!user.role) updates.role = "user";
      const normalizedTier = normalizeSubscriptionTier(user.subscriptionTier);
      if (!user.subscriptionTier || user.subscriptionTier !== normalizedTier) {
        updates.subscriptionTier = normalizedTier;
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }

    return { userId };
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const activeInventions = await ctx.db
      .query("inventions")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    return {
      name: user.name,
      email: user.email,
      subscriptionTier: normalizeSubscriptionTier(user.subscriptionTier),
      activeInventionCount: activeInventions.length,
    };
  },
});
