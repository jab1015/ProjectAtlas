/**
 * Atlas seed: ensures jerry.brown1015@gmail.com has admin + inventor_pro role.
 * Runs idempotently — safe to call multiple times.
 *
 * This is an internalMutation so it can only be triggered from trusted contexts
 * (cron jobs, actions, or direct dashboard invocation). It is NOT exposed as
 * a public mutation.
 */

import { internalMutation } from "./_generated/server";

const ADMIN_EMAIL = "jerry.brown1015@gmail.com";

export const ensureAdminUser = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Look up user by email
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", ADMIN_EMAIL))
      .first();

    if (existing) {
      // Update role and tier if not already set correctly
      if (existing.role !== "admin" || existing.subscriptionTier !== "inventor_pro") {
        await ctx.db.patch(existing._id, {
          role: "admin",
          subscriptionTier: "inventor_pro",
        });
      }
      return { updated: true, userId: existing._id };
    }

    // User hasn't signed up yet — create a placeholder record.
    // When they sign in via @convex-dev/auth, the auth system will find
    // their email and merge, or we match post-login.
    // NOTE: The actual merge happens in users.ts store callback —
    // so we just pre-create the user row here.
    const userId = await ctx.db.insert("users", {
      email: ADMIN_EMAIL,
      role: "admin",
      subscriptionTier: "inventor_pro",
      createdAt: Date.now(),
    });

    return { created: true, userId };
  },
});
