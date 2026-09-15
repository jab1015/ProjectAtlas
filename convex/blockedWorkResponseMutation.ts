import { ConvexError } from "convex/values";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { validateBlockedWorkResponse } from "./reviewLogic";
import {
  MAX_AUTONOMOUS_RUN_BUDGET,
  remainingAutonomousCostUnitsAfterReservations,
  utcDateKey,
} from "./usagePolicyLogic";
import { requireInventionEditAccess } from "./organizations";
import { resolveInventionUsageScope } from "./organizationUsageScope";
import { getOrganizationUsageSnapshot } from "./organizationDailyUsage";

const runAvailableWork = makeFunctionReference<
  "action",
  { inventionId: Id<"inventions">; costBudgetUnits?: number },
  unknown
>("atlasWorkOrchestration:runAvailableWork");

export type RespondToBlockedWorkArgs = {
  workItemId: Id<"atlasWorkItems">;
  response: string;
};

/**
 * Actual handler used by the public respondToBlockedWork mutation.
 * Kept exportable so regression tests can exercise database and scheduler effects
 * without requiring a deployed Convex environment.
 */
export async function respondToBlockedWorkHandler(
  ctx: MutationCtx,
  { workItemId, response }: RespondToBlockedWorkArgs
) {
  const workItem = await ctx.db.get(workItemId);
  if (!workItem) throw new ConvexError("Work item not found");

  // Authorization deliberately precedes validation and every write so a caller
  // cannot use error differences or side effects to manipulate another invention.
  const { userId } = await requireInventionEditAccess(ctx, workItem.inventionId);
  const validation = validateBlockedWorkResponse(
    workItem.status,
    response,
    workItem.humanGateType
  );
  if (!validation.valid) throw new ConvexError(validation.error);

  const now = Date.now();
  const usageScope = await resolveInventionUsageScope(ctx, workItem.inventionId);
  if (!usageScope) throw new ConvexError("Invention not found");
  const dateKey = utcDateKey(now);
  const usage =
    usageScope.scope === "organization"
      ? await getOrganizationUsageSnapshot(ctx, usageScope.organizationId, dateKey)
      : await ctx.db
          .query("atlasDailyUsage")
          .withIndex("by_userId_dateKey", (q) =>
            q.eq("userId", usageScope.usageUserId).eq("dateKey", dateKey)
          )
          .unique();
  const remaining = remainingAutonomousCostUnitsAfterReservations(
    usageScope.plan,
    usage?.autonomousCostUnits ?? 0,
    usage?.reservedAutonomousCostUnits ?? 0
  );

  await ctx.db.patch(workItemId, {
    status: "queued",
    blockedReason: undefined,
    humanGateType: undefined,
    inputSnapshot: {
      previous: workItem.inputSnapshot ?? null,
      inventorResponse: validation.cleaned,
      receivedAt: now,
    },
    updatedAt: now,
  });
  await ctx.db.insert("atlasExecutionEvents", {
    inventionId: workItem.inventionId,
    workItemId,
    eventType: "inventor_input_received",
    actorType: "inventor",
    summary:
      "Authorized collaborator supplied the requested private information; work was requeued.",
    metadata: {
      gateType: workItem.humanGateType,
      characterCount: validation.cleaned.length,
      suppliedByUserId: String(userId),
      usageScope: usageScope.scope,
    },
    createdAt: now,
  });

  if (remaining > 0) {
    await ctx.scheduler.runAfter(0, runAvailableWork, {
      inventionId: workItem.inventionId,
      costBudgetUnits: Math.min(MAX_AUTONOMOUS_RUN_BUDGET, remaining),
    });
  }

  return { success: true };
}
