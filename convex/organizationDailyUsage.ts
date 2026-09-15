import type { Id, Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type UsageCtx = QueryCtx | MutationCtx;

export type DailyUsageSnapshot = {
  autonomousCostUnits: number;
  reservedAutonomousCostUnits: number;
  completedWorkItems: number;
  chatQuestions: number;
};

const EMPTY_USAGE: DailyUsageSnapshot = {
  autonomousCostUnits: 0,
  reservedAutonomousCostUnits: 0,
  completedWorkItems: 0,
  chatQuestions: 0,
};

async function activeOrganizationMemberIds(
  ctx: UsageCtx,
  organizationId: Id<"organizations">
): Promise<Id<"users">[]> {
  const memberships = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
    .collect();
  return memberships
    .filter((membership) => membership.status === "active")
    .map((membership) => membership.userId);
}

/**
 * One-day migration bridge for data created before the organization ledger.
 *
 * Old usage rows cannot be attributed perfectly to an organization because they
 * only carry userId. Until the first organization row is created for a UTC day,
 * conservatively aggregate active members' legacy rows. Once persisted, every
 * subsequent organization reservation/charge uses exactly one org/date row.
 */
export async function aggregateLegacyOrganizationUsage(
  ctx: UsageCtx,
  organizationId: Id<"organizations">,
  dateKey: string
): Promise<DailyUsageSnapshot & { memberCount: number }> {
  const memberIds = await activeOrganizationMemberIds(ctx, organizationId);
  let autonomousCostUnits = 0;
  let reservedAutonomousCostUnits = 0;
  let completedWorkItems = 0;
  let chatQuestions = 0;

  for (const userId of memberIds) {
    const usage = await ctx.db
      .query("atlasDailyUsage")
      .withIndex("by_userId_dateKey", (q) => q.eq("userId", userId).eq("dateKey", dateKey))
      .unique();
    if (!usage) continue;
    autonomousCostUnits += Math.max(0, usage.autonomousCostUnits);
    reservedAutonomousCostUnits += Math.max(0, usage.reservedAutonomousCostUnits ?? 0);
    completedWorkItems += Math.max(0, usage.completedWorkItems);
    chatQuestions += Math.max(0, usage.chatQuestions);
  }

  return {
    autonomousCostUnits,
    reservedAutonomousCostUnits,
    completedWorkItems,
    chatQuestions,
    memberCount: memberIds.length,
  };
}

export async function findOrganizationDailyUsage(
  ctx: UsageCtx,
  organizationId: Id<"organizations">,
  dateKey: string
): Promise<Doc<"organizationDailyUsage"> | null> {
  return ctx.db
    .query("organizationDailyUsage")
    .withIndex("by_organizationId_dateKey", (q) =>
      q.eq("organizationId", organizationId).eq("dateKey", dateKey)
    )
    .unique();
}

export async function getOrganizationUsageSnapshot(
  ctx: UsageCtx,
  organizationId: Id<"organizations">,
  dateKey: string
): Promise<DailyUsageSnapshot> {
  const usage = await findOrganizationDailyUsage(ctx, organizationId, dateKey);
  if (usage) {
    return {
      autonomousCostUnits: usage.autonomousCostUnits,
      reservedAutonomousCostUnits: usage.reservedAutonomousCostUnits ?? 0,
      completedWorkItems: usage.completedWorkItems,
      chatQuestions: usage.chatQuestions,
    };
  }
  const legacy = await aggregateLegacyOrganizationUsage(ctx, organizationId, dateKey);
  return {
    autonomousCostUnits: legacy.autonomousCostUnits,
    reservedAutonomousCostUnits: legacy.reservedAutonomousCostUnits,
    completedWorkItems: legacy.completedWorkItems,
    chatQuestions: legacy.chatQuestions,
  };
}

/**
 * Materialize the single mutable organization/day row.
 *
 * Convex mutations are serializable. The indexed read plus insert/update occurs
 * in the caller's mutation transaction, so competing collaborators cannot both
 * reserve capacity from the same pre-reservation balance.
 */
export async function ensureOrganizationDailyUsage(
  ctx: MutationCtx,
  organizationId: Id<"organizations">,
  dateKey: string,
  now: number
): Promise<Doc<"organizationDailyUsage">> {
  const existing = await findOrganizationDailyUsage(ctx, organizationId, dateKey);
  if (existing) return existing;

  const legacy = await aggregateLegacyOrganizationUsage(ctx, organizationId, dateKey);
  const usageId = await ctx.db.insert("organizationDailyUsage", {
    organizationId,
    dateKey,
    autonomousCostUnits: legacy.autonomousCostUnits,
    reservedAutonomousCostUnits: legacy.reservedAutonomousCostUnits,
    completedWorkItems: legacy.completedWorkItems,
    chatQuestions: legacy.chatQuestions,
    legacyBaselineCapturedAt: now,
    legacyMemberCount: legacy.memberCount,
    updatedAt: now,
  });
  const created = await ctx.db.get(usageId);
  if (!created) throw new Error("Organization usage ledger could not be created");
  return created;
}

export function emptyDailyUsageSnapshot(): DailyUsageSnapshot {
  return { ...EMPTY_USAGE };
}
