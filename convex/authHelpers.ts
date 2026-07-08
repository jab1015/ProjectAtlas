/**
 * Atlas auth helper functions.
 * These are thin wrappers called from queries/mutations that need
 * role/tier checks.
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

type AuthCtx = QueryCtx | MutationCtx;
type SubscriptionTier = "free" | "inventor" | "pro" | "enterprise";

const ACTIVE_INVENTION_LIMITS: Record<SubscriptionTier, number> = {
  free: 1,
  inventor: 3,
  pro: 10,
  enterprise: Number.POSITIVE_INFINITY,
};

function normalizeSubscriptionTier(tier: unknown): SubscriptionTier {
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

function canTierAccessPaidStages(tier: unknown): boolean {
  const normalizedTier = normalizeSubscriptionTier(tier);
  return normalizedTier === "pro" || normalizedTier === "enterprise";
}

function getActiveInventionLimit(tier: unknown): number {
  return ACTIVE_INVENTION_LIMITS[normalizeSubscriptionTier(tier)];
}

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

  // Stages 5+: require Pro or Enterprise.
  return canTierAccessPaidStages(user.subscriptionTier);
}

export async function canCreateInvention(ctx: AuthCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  if (!user) return false;

  // Admin bypass
  if (user.role === "admin") return true;
  const inventionLimit = getActiveInventionLimit(user.subscriptionTier);

  const existing = await ctx.db
    .query("inventions")
    .withIndex("by_userId_status", (q) =>
      q.eq("userId", userId).eq("status", "active")
    )
    .collect();

  return existing.length < inventionLimit;
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
      subscriptionTier: normalizeSubscriptionTier(user.subscriptionTier),
    };
  },
});

export const getCanCreateInvention = query({
  args: {},
  handler: async (ctx) => {
    return canCreateInvention(ctx);
  },
});
