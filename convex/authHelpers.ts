/**
 * Atlas auth helper functions.
 * These are thin wrappers called from queries/mutations that need
 * role/tier checks.
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export async function isAdmin(ctx: AuthCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

export async function canAccessStage(ctx: AuthCtx, stageId: number): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  if (!user) return false;

  // Admin bypass
  if (user.role === "admin") return true;

  // Stages 1–4: available to all tiers
  if (stageId <= 4) return true;

  // Stages 5+: require inventor_pro or enterprise
  const tier = user.subscriptionTier ?? "explorer";
  return tier === "inventor_pro" || tier === "enterprise";
}

export async function canCreateInvention(ctx: AuthCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  if (!user) return false;

  // Admin/pro: unlimited
  if (user.role === "admin") return true;
  const tier = user.subscriptionTier ?? "explorer";
  if (tier === "inventor_pro" || tier === "enterprise") return true;

  // Explorer: max 1 active invention
  const existing = await ctx.db
    .query("inventions")
    .withIndex("by_userId_status", (q) =>
      q.eq("userId", userId).eq("status", "active")
    )
    .collect();

  return existing.length === 0;
}

// ── Public query for current user with role/tier ─────────────────────────────

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role ?? "user",
      subscriptionTier: user.subscriptionTier ?? "explorer",
    };
  },
});

export const getCanCreateInvention = query({
  args: {},
  handler: async (ctx) => {
    return canCreateInvention(ctx);
  },
});
