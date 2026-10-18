/**
 * InventSmith seed: ensures jerry.brown1015@gmail.com has admin + enterprise tier.
 * Runs idempotently — safe to call multiple times.
 *
 * This is an internalMutation so it can only be triggered from trusted contexts
 * (cron jobs, actions, or direct dashboard invocation). It is NOT exposed as
 * a public mutation.
 */

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_EMAIL = "jerry.brown1015@gmail.com";
const ADMIN_SUBSCRIPTION_TIER = "enterprise";

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
      if (existing.role !== "admin" || existing.subscriptionTier !== ADMIN_SUBSCRIPTION_TIER) {
        await ctx.db.patch(existing._id, {
          role: "admin",
          subscriptionTier: ADMIN_SUBSCRIPTION_TIER,
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
      subscriptionTier: ADMIN_SUBSCRIPTION_TIER,
      createdAt: Date.now(),
    });

    return { created: true, userId };
  },
});

// Test-environment bootstrap only: create the password-auth record for the
// already designated owner/admin identity. The password is never stored here;
// callers provide a one-time Scrypt hash and the owner completes setup through
// the normal password-reset email flow.
export const ensureAdminAuthAccount = internalMutation({
  args: { secretHash: v.string() },
  handler: async (ctx, args) => {
    const email = ADMIN_EMAIL;
    const existingUsers = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).collect();
    const user = existingUsers.find((candidate) => candidate.role === "admin") ?? existingUsers[0];
    const userId = user?._id ?? await ctx.db.insert("users", {
      email,
      role: "admin",
      subscriptionTier: ADMIN_SUBSCRIPTION_TIER,
      emailVerificationTime: Date.now(),
      createdAt: Date.now(),
    });

    await ctx.db.patch(userId, {
      email,
      role: "admin",
      subscriptionTier: ADMIN_SUBSCRIPTION_TIER,
      emailVerificationTime: Date.now(),
    });

    const existingAccount = await ctx.db.query("authAccounts").withIndex("providerAndAccountId", (q) => q.eq("provider", "password").eq("providerAccountId", email)).unique();
    if (existingAccount) {
      await ctx.db.patch(existingAccount._id, { userId, secret: args.secretHash });
      return { created: false, repaired: true, userId, accountId: existingAccount._id };
    }

    const accountId = await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: email,
      secret: args.secretHash,
    });
    return { created: true, repaired: false, userId, accountId };
  },
});
