import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
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

    // Sort by sortOrder, then createdAt
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

    // Delete the file from storage
    await ctx.storage.delete(file.storageId);

    // Delete the record
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
