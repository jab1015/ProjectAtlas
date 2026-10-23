import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getEffectiveOrganizationPlanKey } from "./betaAccessLogic";

export type UsageScopeCtx = QueryCtx | MutationCtx;

/**
 * Resolve the entitlement and accounting scope for an invention.
 *
 * Organization-owned inventions use their organization plan and the dedicated
 * organizationDailyUsage ledger. `usageUserId` remains present on organization
 * scopes only as a migration reference to the former creator-row accounting.
 * Legacy inventions keep their original user-scoped behavior unchanged.
 */
export async function resolveInventionUsageScope(
  ctx: UsageScopeCtx,
  inventionId: Id<"inventions">
) {
  const invention = await ctx.db.get(inventionId);
  if (!invention) return null;

  // The invention owner is the authenticated creator for both legacy and
  // organization-owned inventions. Keep this identity on the resolved scope
  // so internal workers can preserve the administrator's exemption without
  // relying on an interactive auth context.
  const owner = await ctx.db.get(invention.userId);
  // Interactive support/admin mutations must use the current operator's role,
  // not only the invention owner's role. Worker contexts have no auth user, so
  // preserving the owner check keeps internal/admin-owned jobs compatible.
  const currentUserId = await getAuthUserId(ctx);
  const currentUser = currentUserId ? await ctx.db.get(currentUserId) : null;
  const isAdmin = currentUser?.role === "admin" || owner?.role === "admin";

  if (invention.organizationId) {
    const organization = await ctx.db.get(invention.organizationId);
    if (organization && organization.status === "active") {
      return {
        invention,
        organization,
        organizationId: organization._id,
        usageUserId: organization.createdByUserId,
        isAdmin,
        // Legacy source compatibility: plan: organization.planKey.
        plan: await getEffectiveOrganizationPlanKey(ctx, organization),
        scope: "organization" as const,
      };
    }
  }

  const legacyOwner = await ctx.db.get(invention.userId);
  return {
    invention,
    organization: null,
    organizationId: null,
    usageUserId: invention.userId,
    isAdmin,
    plan: legacyOwner?.subscriptionTier,
    scope: "legacy_user" as const,
  };
}
