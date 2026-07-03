import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getByProductId = internalQuery({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("productFiles")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();

    // Sort by sortOrder, then createdAt
    files.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.createdAt - b.createdAt;
    });

    return files;
  },
});
