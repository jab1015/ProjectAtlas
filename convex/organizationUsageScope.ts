import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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

  if (invention.organizationId) {
    const organization = await ctx.db.get(invention.organizationId);
    if (organization && organization.status === "active") {
      return {
        invention,
        organization,
        organizationId: organization._id,
        usageUserId: organization.createdByUserId,
        plan: organization.planKey,
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
    plan: legacyOwner?.subscriptionTier,
    scope: "legacy_user" as const,
  };
}
