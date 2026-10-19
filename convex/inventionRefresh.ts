import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { scheduleAffectedDepartments } from "./validationEvidence";

const PRESERVE_WORK_KINDS = new Set(["idea_capture"]);

/**
 * Requeues generated work after a material inventor input change.
 *
 * Work that is already running is allowed to finish; completeWork compares the
 * claim timestamp with the invention timestamp and discards that output if it
 * was generated from an older input. Human-gated and cancelled work remains
 * gated rather than being silently authorized by a new document.
 */
export async function queueInventionRefresh(
  ctx: MutationCtx,
  inventionId: Id<"inventions">,
  reason: string,
  now: number,
) {
  const [workItems, deliverables, findings] = await Promise.all([
    ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
  ]);

  let queued = 0;
  let staleDeliverables = 0;
  let staleFindings = 0;

  for (const item of workItems) {
    if (PRESERVE_WORK_KINDS.has(item.kind) || ["running", "blocked", "cancelled"].includes(item.status)) continue;
    await ctx.db.patch(item._id, {
      status: "queued",
      attemptCount: 0,
      completedAt: undefined,
      startedAt: undefined,
      claimedAt: undefined,
      leaseExpiresAt: undefined,
      reservedCostUnits: undefined,
      reservedDailyCostUnits: undefined,
      reservedCreditUnits: undefined,
      reservationDateKey: undefined,
      actualCostUnits: undefined,
      outputSummary: undefined,
      blockedReason: undefined,
      humanGateType: undefined,
      lastError: reason,
      updatedAt: now,
    });
    queued += 1;
  }

  for (const deliverable of deliverables) {
    await ctx.db.patch(deliverable._id, { staleReason: reason, updatedAt: now });
    staleDeliverables += 1;
  }

  for (const finding of findings) {
    if (finding.status === "stale") continue;
    await ctx.db.patch(finding._id, { status: "stale", updatedAt: now });
    staleFindings += 1;
  }

  await ctx.db.insert("atlasExecutionEvents", {
    inventionId,
    eventType: "invention_changed",
    actorType: "system",
    summary: reason,
    metadata: {
      changeType: "automatic_department_refresh",
      queuedWorkItems: queued,
      staleDeliverables,
      staleFindings,
    },
    createdAt: now,
  });

  await scheduleAffectedDepartments(ctx, inventionId);
  return { queued, staleDeliverables, staleFindings };
}
