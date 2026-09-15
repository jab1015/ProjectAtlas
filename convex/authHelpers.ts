/**
 * InventSmith auth helper functions.
 * These are thin wrappers called from queries/mutations that need
 * role/tier checks.
 *
 * During the organization migration, legacy user-scoped invention creation
 * deliberately routes through the same plan-capacity policy that will become
 * organization-scoped. This keeps single-user behavior stable while removing
 * a second source of truth for active-invention limits.
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { canCreateActiveInvention } from "./organizationPolicyLogic";

type AuthCtx = QueryCtx | MutationCtx;
type SubscriptionTier = "free" | "inventor" | "pro" | "enterprise";

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

export async function isAdmin(ctx: AuthCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

export async function requireAdmin(ctx: AuthCtx): Promise<void> {
  if (!(await isAdmin(ctx))) throw new ConvexError("Administrator authorization required");
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

  // Stages 5+: require Pro or Enterprise while legacy user billing remains active.
  return canTierAccessPaidStages(user.subscriptionTier);
}

export async function canCreateInvention(ctx: AuthCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  if (!user) return false;

  // Admin bypass
  if (user.role === "admin") return true;

  const existing = await ctx.db
    .query("inventions")
    .withIndex("by_userId_status", (q) =>
      q.eq("userId", userId).eq("status", "active")
    )
    .collect();

  // Legacy user subscriptionTier aliases normalize inside the organization policy.
  // Once organization rows are introduced, callers can supply organization planKey
  // and organization-scoped active counts to the same policy function.
  return canCreateActiveInvention(user.subscriptionTier, existing.length);
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
