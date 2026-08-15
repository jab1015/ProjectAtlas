import { internalMutation, internalQuery } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { applyInventorEvidenceChange } from "./evidenceImpact";

export const getByProductId = internalQuery({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const files = await ctx.db.query("productFiles").withIndex("by_productId", (q) => q.eq("productId", args.productId)).collect();
    files.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.createdAt - b.createdAt;
    });
    return files;
  },
});

export const getEvidenceExtractionContext = internalQuery({
  args: { evidenceSourceId: v.id("evidenceSources") },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.evidenceSourceId);
    if (!source || source.metadata?.provenance !== "inventor_upload") throw new ConvexError("Inventor evidence source not found");
    const storageId = source.metadata?.storageId as Id<"_storage"> | undefined;
    if (!storageId) throw new ConvexError("Evidence source has no stored file");
    return {
      sourceId: source._id,
      inventionId: source.inventionId,
      title: source.title,
      evidenceKind: typeof source.metadata?.evidenceKind === "string" ? source.metadata.evidenceKind : "other",
      fileName: typeof source.metadata?.fileName === "string" ? source.metadata.fileName : source.title,
      fileSize: typeof source.metadata?.fileSize === "number" ? source.metadata.fileSize : 0,
      mimeType: typeof source.metadata?.mimeType === "string" ? source.metadata.mimeType : "application/octet-stream",
      storageId,
    };
  },
});

export const recordEvidenceExtraction = internalMutation({
  args: {
    evidenceSourceId: v.id("evidenceSources"),
    extraction: v.any(),
    extractedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.evidenceSourceId);
    if (!source || source.metadata?.provenance !== "inventor_upload") throw new ConvexError("Inventor evidence source not found");
    const evidenceKind = typeof source.metadata?.evidenceKind === "string" ? source.metadata.evidenceKind : "other";
    await ctx.db.patch(source._id, {
      metadata: {
        ...(source.metadata ?? {}),
        extraction: args.extraction,
        extractionStatus: "completed",
        extractedAt: args.extractedAt,
        extractionError: undefined,
      },
    });
    await applyInventorEvidenceChange(ctx, source.inventionId, {
      action: "uploaded",
      sourceId: source._id,
      label: source.title,
      evidenceKind,
      extraction: args.extraction,
      now: args.extractedAt,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: source.inventionId,
      eventType: "evidence_extracted",
      actorType: "atlas",
      summary: `InventSmith extracted structured evidence from ${source.title}.`,
      metadata: { evidenceSourceId: String(source._id), evidenceKind, extractionMode: "ai_file" },
      createdAt: args.extractedAt,
    });
  },
});

export const recordEvidenceExtractionFailure = internalMutation({
  args: {
    evidenceSourceId: v.id("evidenceSources"),
    error: v.string(),
    failedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.evidenceSourceId);
    if (!source || source.metadata?.provenance !== "inventor_upload") return;
    await ctx.db.patch(source._id, {
      metadata: {
        ...(source.metadata ?? {}),
        extractionStatus: "failed",
        extractionError: args.error.slice(0, 1000),
        extractionFailedAt: args.failedAt,
      },
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: source.inventionId,
      eventType: "work_failed",
      actorType: "system",
      summary: `InventSmith could not automatically extract ${source.title}; the original evidence remains preserved for review.`,
      metadata: { evidenceSourceId: String(source._id), error: args.error.slice(0, 500) },
      createdAt: args.failedAt,
    });
  },
});
