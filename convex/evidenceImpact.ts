import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const PRESERVE_WORK_KINDS = new Set(["idea_capture"]);

function staleReason(action: "uploaded" | "removed", label: string): string {
  return `Inventor evidence was ${action}: ${label}. Downstream analysis must be refreshed before relying on this output.`;
}

export async function applyInventorEvidenceChange(
  ctx: MutationCtx,
  inventionId: Id<"inventions">,
  input: {
    action: "uploaded" | "removed";
    sourceId?: Id<"evidenceSources">;
    label: string;
    evidenceKind?: string;
    extraction?: unknown;
    now: number;
  }
) {
  const reason = staleReason(input.action, input.label);

  const invention = await ctx.db.get(inventionId);
  if (invention) {
    await ctx.db.patch(inventionId, { updatedAt: input.now });
  }

  const record = await ctx.db
    .query("inventionRecords")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .unique();

  if (record) {
    const existingBrief =
      record.structuredBrief && typeof record.structuredBrief === "object"
        ? record.structuredBrief as Record<string, unknown>
        : {};
    const existingEvidence = Array.isArray(existingBrief.inventorEvidence)
      ? existingBrief.inventorEvidence as Array<Record<string, unknown>>
      : [];

    const nextEvidence = input.action === "uploaded"
      ? [
          ...existingEvidence.filter((item) => item.sourceId !== String(input.sourceId)),
          {
            sourceId: input.sourceId ? String(input.sourceId) : undefined,
            label: input.label,
            evidenceKind: input.evidenceKind ?? "other",
            provenance: "inventor_upload",
            extraction: input.extraction ?? null,
            recordedAt: input.now,
          },
        ]
      : existingEvidence.filter((item) => item.sourceId !== String(input.sourceId));

    await ctx.db.patch(record._id, {
      structuredBrief: {
        ...existingBrief,
        inventorEvidence: nextEvidence,
        inventorEvidenceLastChangedAt: input.now,
      },
      updatedAt: input.now,
    });
  }

  const workItems = await ctx.db
    .query("atlasWorkItems")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .collect();

  for (const item of workItems) {
    if (PRESERVE_WORK_KINDS.has(item.kind)) continue;
    if (item.status === "running" || item.status === "cancelled") continue;

    if (item.status === "completed" || item.status === "failed" || item.status === "stale") {
      await ctx.db.patch(item._id, {
        status: "queued",
        attemptCount: 0,
        completedAt: undefined,
        startedAt: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        reservedCostUnits: undefined,
        reservationDateKey: undefined,
        actualCostUnits: undefined,
        outputSummary: undefined,
        blockedReason: undefined,
        humanGateType: undefined,
        lastError: reason,
        updatedAt: input.now,
      });
    }
  }

  const findings = await ctx.db
    .query("evidenceFindings")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .collect();

  for (const finding of findings) {
    const sourceIds = input.sourceId
      ? finding.sourceIds.filter((sourceId) => sourceId !== input.sourceId)
      : finding.sourceIds;
    await ctx.db.patch(finding._id, {
      sourceIds,
      status: "stale",
      updatedAt: input.now,
    });
  }

  const deliverables = await ctx.db
    .query("atlasDeliverables")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .collect();

  for (const deliverable of deliverables) {
    const sourceIds = input.sourceId
      ? deliverable.sourceIds.filter((sourceId) => sourceId !== input.sourceId)
      : deliverable.sourceIds;
    await ctx.db.patch(deliverable._id, {
      sourceIds,
      staleReason: reason,
      updatedAt: input.now,
    });
  }

  await ctx.db.insert("atlasExecutionEvents", {
    inventionId,
    eventType: "invention_changed",
    actorType: "system",
    summary: reason,
    metadata: {
      changeType: "inventor_evidence",
      action: input.action,
      sourceId: input.sourceId ? String(input.sourceId) : undefined,
      evidenceKind: input.evidenceKind ?? "other",
      structuredExtractionAvailable: Boolean(input.extraction),
    },
    createdAt: input.now,
  });
}
