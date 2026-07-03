import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const list = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("productFiles")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();

    // Sort by sortOrder
    files.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });

    return files;
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
  },
  handler: async (ctx, args) => {
    // Get the current max sortOrder for this product
    const existingFiles = await ctx.db
      .query("productFiles")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();

    const maxOrder = existingFiles.reduce(
      (max, f) => Math.max(max, f.sortOrder ?? 0),
      0
    );

    const id = await ctx.db.insert("productFiles", {
      productId: args.productId,
      displayName: args.displayName,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      sortOrder: maxOrder + 1,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("productFiles"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) throw new Error("File not found");

    // Delete from storage
    await ctx.storage.delete(file.storageId);

    // Delete the record
    await ctx.db.delete(args.id);
  },
});

export const updateSortOrder = mutation({
  args: {
    id: v.id("productFiles"),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) throw new Error("File not found");

    await ctx.db.patch(args.id, { sortOrder: args.sortOrder });
  },
});
