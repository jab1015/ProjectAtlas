import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireInventionEditAccess } from "./organizations";

const extractInventorEvidenceFile = makeFunctionReference<"action", { evidenceSourceId: Id<"evidenceSources"> }, unknown>("evidenceFileExtraction:extractInventorEvidenceFile");

export const retryEvidenceExtraction = mutation({
  args: { inventionId: v.id("inventions"), evidenceSourceId: v.id("evidenceSources") },
  handler: async (ctx, args) => {
    await requireInventionEditAccess(ctx, args.inventionId);
    const source = await ctx.db.get(args.evidenceSourceId);
    if (!source || source.inventionId !== args.inventionId || source.metadata?.provenance !== "inventor_upload") {
      throw new ConvexError("Evidence not found or access denied");
    }
    const storageId = source.metadata?.storageId as Id<"_storage"> | undefined;
    if (!storageId) throw new ConvexError("This evidence file is no longer available for extraction");
    const currentStatus = typeof source.metadata?.extractionStatus === "string" ? source.metadata.extractionStatus : null;
    if (currentStatus === "queued" || currentStatus === "running") return { scheduled: false, reason: "already_queued" as const };

    const now = Date.now();
    await ctx.db.patch(source._id, {
      metadata: {
        ...(source.metadata ?? {}),
        extractionStatus: "queued",
        extractionError: undefined,
        extractionRetryRequestedAt: now,
      },
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      eventType: "work_queued",
      actorType: "inventor",
      summary: `An authorized collaborator requested another structured-evidence extraction pass for ${source.title}.`,
      metadata: { evidenceSourceId: String(source._id), changeType: "evidence_extraction_retry" },
      createdAt: now,
    });
    await ctx.scheduler.runAfter(0, extractInventorEvidenceFile, { evidenceSourceId: source._id });
    return { scheduled: true, reason: "queued" as const };
  },
});
