import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { requireAdmin } from "./authHelpers";

async function requireOwnedInvention(ctx: Parameters<typeof getAuthUserId>[0] & { db: any }, inventionId: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Authentication required");
  const invention = await ctx.db.get(inventionId);
  if (!invention || invention.userId !== userId) {
    throw new ConvexError("Invention not found or access denied");
  }
  return { userId, invention };
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const generateInventionEvidenceUploadUrl = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireOwnedInvention(ctx, args.inventionId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const registerInventionEvidence = mutation({
  args: {
    inventionId: v.id("inventions"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.optional(v.string()),
    title: v.optional(v.string()),
    evidenceKind: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireOwnedInvention(ctx, args.inventionId);
    const now = Date.now();

    const sourceId = await ctx.db.insert("evidenceSources", {
      inventionId: args.inventionId,
      sourceType: "other",
      title: args.title?.trim() || args.fileName,
      locator: `convex-storage:${args.storageId}`,
      accessedAt: now,
      excerpt: args.notes?.trim() || undefined,
      reliability: "unverified",
      metadata: {
        provenance: "inventor_upload",
        uploadedByUserId: userId,
        storageId: args.storageId,
        fileName: args.fileName,
        fileSize: args.fileSize,
        mimeType: args.mimeType,
        evidenceKind: args.evidenceKind ?? "other",
        uploadedAt: now,
      },
      createdAt: now,
    });

    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      eventType: "inventor_input_received",
      actorType: "inventor",
      summary: `Uploaded evidence: ${args.fileName}`,
      metadata: {
        evidenceSourceId: sourceId,
        evidenceKind: args.evidenceKind ?? "other",
        fileName: args.fileName,
      },
      createdAt: now,
    });

    return sourceId;
  },
});

export const listInventionEvidence = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireOwnedInvention(ctx, args.inventionId);
    const sources = await ctx.db
      .query("evidenceSources")
      .withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId))
      .collect();

    const inventorUploads = sources.filter(
      (source: any) => source.metadata?.provenance === "inventor_upload"
    );

    return await Promise.all(
      inventorUploads
        .sort((a: any, b: any) => b.createdAt - a.createdAt)
        .map(async (source: any) => {
          const storageId = source.metadata?.storageId;
          const downloadUrl = storageId ? await ctx.storage.getUrl(storageId) : null;
          return {
            _id: source._id,
            title: source.title,
            notes: source.excerpt,
            reliability: source.reliability,
            createdAt: source.createdAt,
            fileName: source.metadata?.fileName ?? source.title,
            fileSize: source.metadata?.fileSize ?? null,
            mimeType: source.metadata?.mimeType ?? null,
            evidenceKind: source.metadata?.evidenceKind ?? "other",
            downloadUrl,
          };
        })
    );
  },
});

export const removeInventionEvidence = mutation({
  args: {
    inventionId: v.id("inventions"),
    evidenceSourceId: v.id("evidenceSources"),
  },
  handler: async (ctx, args) => {
    await requireOwnedInvention(ctx, args.inventionId);
    const source = await ctx.db.get(args.evidenceSourceId);
    if (!source || source.inventionId !== args.inventionId) {
      throw new ConvexError("Evidence not found or access denied");
    }
    if (source.metadata?.provenance !== "inventor_upload") {
      throw new ConvexError("Only inventor-uploaded evidence can be removed here");
    }

    const storageId = source.metadata?.storageId;
    if (storageId) await ctx.storage.delete(storageId);
    await ctx.db.delete(args.evidenceSourceId);
  },
});

export const getByProduct = query({
  args: { downloadToken: v.string() },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_downloadToken", (q) => q.eq("downloadToken", args.downloadToken))
      .unique();
    if (!purchase || purchase.fulfillmentStatus !== "fulfilled") return [];
    const files = await ctx.db
      .query("productFiles")
      .withIndex("by_productId", (q) => q.eq("productId", purchase.productId))
      .collect();

    files.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.createdAt - b.createdAt;
    });

    return Promise.all(files.map(async (file) => ({
      _id: file._id,
      displayName: file.displayName,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      downloadUrl: await ctx.storage.getUrl(file.storageId),
    })));
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    displayName: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const fileId = await ctx.db.insert("productFiles", {
      productId: args.productId,
      displayName: args.displayName,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      sortOrder: args.sortOrder ?? 0,
      createdAt: Date.now(),
    });

    return fileId;
  },
});

export const remove = mutation({
  args: { id: v.id("productFiles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error(`ProductFile ${args.id} not found`);
    }

    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.id);
  },
});

export const getDownloadUrl = query({
  args: { storageId: v.id("_storage"), downloadToken: v.string() },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_downloadToken", (q) => q.eq("downloadToken", args.downloadToken))
      .unique();
    if (!purchase || purchase.fulfillmentStatus !== "fulfilled") return null;
    const files = await ctx.db.query("productFiles").withIndex("by_productId", (q) => q.eq("productId", purchase.productId)).collect();
    if (!files.some((file) => file.storageId === args.storageId)) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});