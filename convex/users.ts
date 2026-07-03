import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

const ADMIN_EMAIL = "jerry.brown1015@gmail.com";

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
      if (user.subscriptionTier !== "inventor_pro") updates.subscriptionTier = "inventor_pro";
    } else {
      if (!user.role) updates.role = "user";
      if (!user.subscriptionTier) updates.subscriptionTier = "explorer";
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }

    return { userId };
  },
});
