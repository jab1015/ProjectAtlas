import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export type UsageScopeCtx = QueryCtx | MutationCtx;

/**
 * Resolve the transitional usage/billing scope for an invention.
 *
 * The existing atlasDailyUsage table is user-keyed. Until the persisted usage
 * ledger is migrated to organization IDs, organization-owned inventions charge
 * the organization's creator/billing owner row so adding collaborators cannot
 * multiply AI/CAD/render allowances. Legacy inventions continue charging their
 * legacy owner exactly as before.
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
    usageUserId: invention.userId,
    plan: legacyOwner?.subscriptionTier,
    scope: "legacy_user" as const,
  };
}
