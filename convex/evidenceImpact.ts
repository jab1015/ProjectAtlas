import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const PRESERVE_WORK_KINDS = new Set(["idea_capture"]);

function staleReason(action: "uploaded" | "removed", label: string): string {
  return `Inventor evidence was ${action}: ${label}. Downstream analysis must be refreshed before relying on this output.`;
}

function evidenceGateRelease(input: { action: "uploaded" | "removed"; evidenceKind?: string }, item: { kind: string; status: string }) {
  if (input.action !== "uploaded" || item.status !== "blocked") return null;
  if (input.evidenceKind === "prototype_test" && item.kind === "prototype_physical_evidence") {
    return {
      lastError: "Prototype evidence was supplied; InventSmith can evaluate the physical-evidence gate again.",
      summary: "InventSmith released the physical prototype-evidence gate because prototype test evidence was supplied.",
    };
  }
  if (input.evidenceKind === "manufacturer_quote" && item.kind === "manufacturer_quote_evidence") {
    return {
      lastError: "Manufacturer quote/RFQ evidence was supplied; InventSmith can evaluate the external-evidence gate again.",
      summary: "InventSmith released the manufacturer quote-evidence gate because a real quote/RFQ response was supplied.",
    };
  }
  return null;
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

    const release = evidenceGateRelease(input, item);
    if (release) {
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
        lastError: release.lastError,
        updatedAt: input.now,
      });
      await ctx.db.insert("atlasExecutionEvents", {
        inventionId,
        workItemId: item._id,
        eventType: "work_queued",
        actorType: "system",
        summary: release.summary,
        metadata: { evidenceKind: input.evidenceKind, sourceId: input.sourceId ? String(input.sourceId) : undefined },
        createdAt: input.now,
      });
      continue;
    }

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
