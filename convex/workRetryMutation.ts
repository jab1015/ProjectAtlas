import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { departmentAgentAuditMetadata, resolveDepartmentAgent } from "./departmentAgentLogic";
import { requireInventionEditAccess } from "./organizations";
import { resolveInventionUsageScope } from "./organizationUsageScope";
import { getOrganizationUsageSnapshot } from "./organizationDailyUsage";
import { MAX_AUTONOMOUS_RUN_BUDGET, remainingAutonomousCostUnitsAfterReservations, utcDateKey } from "./usagePolicyLogic";

const runAvailableWork = makeFunctionReference<
  "action",
  { inventionId: Id<"inventions">; costBudgetUnits?: number },
  unknown
>("atlasWorkOrchestration:runAvailableWork");

export const MAX_MANUAL_WORK_RETRY_LIMIT = 5;

export async function retryFailedWorkItemHandler(
  ctx: MutationCtx,
  args: { inventionId: Id<"inventions">; workItemId: Id<"atlasWorkItems"> },
) {
  const item = await ctx.db.get(args.workItemId);
  if (!item || item.inventionId !== args.inventionId) throw new ConvexError("Work item not found");
  const { userId } = await requireInventionEditAccess(ctx, args.inventionId);
  if (item.status !== "failed") throw new ConvexError("Only failed work can be retried");

  // Validate the assignment before queuing so a retry can never reproduce the
  // missing-agent failure that caused this work item to stop.
  const agent = resolveDepartmentAgent(item.inputSnapshot, item.kind);
  const currentLimit = item.maxAttempts ?? 3;
  const currentAttemptCeiling = Math.max(currentLimit, item.attemptCount);
  if (currentAttemptCeiling >= MAX_MANUAL_WORK_RETRY_LIMIT) {
    throw new ConvexError("This work item has reached its retry limit. Contact InventSmith support for help.");
  }

  const usageScope = await resolveInventionUsageScope(ctx, args.inventionId);
  if (!usageScope) throw new ConvexError("Invention not found");
  const now = Date.now();
  const dateKey = utcDateKey(now);
  const usage = usageScope.scope === "organization"
    ? await getOrganizationUsageSnapshot(ctx, usageScope.organizationId, dateKey)
    : await ctx.db
        .query("atlasDailyUsage")
        .withIndex("by_userId_dateKey", (q) => q.eq("userId", usageScope.usageUserId).eq("dateKey", dateKey))
        .unique();
  const remaining = usageScope.isAdmin
    ? Number.MAX_SAFE_INTEGER
    : remainingAutonomousCostUnitsAfterReservations(
        usageScope.plan,
        usage?.autonomousCostUnits ?? 0,
        usage?.reservedAutonomousCostUnits ?? 0,
      );
  if (remaining <= 0) return { queued: false as const, reason: "daily_usage_limit" as const };

  const nextAttemptLimit = currentAttemptCeiling + 1;
  await ctx.db.patch(item._id, {
    status: "queued",
    maxAttempts: nextAttemptLimit,
    lastError: undefined,
    inputSnapshot: { ...(item.inputSnapshot ?? {}), department: agent.department },
    updatedAt: now,
  });
  await ctx.db.insert("atlasExecutionEvents", {
    inventionId: args.inventionId,
    workItemId: item._id,
    eventType: "work_queued",
    actorType: "inventor",
    summary: `Authorized collaborator retried ${item.title}.`,
    attemptNumber: item.attemptCount,
    metadata: {
      changeType: "manual_work_retry",
      priorAttemptCount: item.attemptCount,
      nextAttemptLimit,
      ...departmentAgentAuditMetadata({ ...(item.inputSnapshot ?? {}), department: agent.department }, item.kind),
      requestedByUserId: String(userId),
    },
    createdAt: now,
  });
  await ctx.scheduler.runAfter(0, runAvailableWork, {
    inventionId: args.inventionId,
    costBudgetUnits: Math.min(MAX_AUTONOMOUS_RUN_BUDGET, remaining),
  });
  return { queued: true as const, reason: "scheduled" as const };
}

export const retryFailedWorkItem = mutation({
  args: {
    inventionId: v.id("inventions"),
    workItemId: v.id("atlasWorkItems"),
  },
  handler: retryFailedWorkItemHandler,
});
