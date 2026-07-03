import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    let entries;

    if (args.productId !== undefined) {
      entries = await ctx.db
        .query("faqEntries")
        .withIndex("by_productId", (q) => q.eq("productId", args.productId))
        .collect();
    } else {
      entries = await ctx.db.query("faqEntries").collect();
    }

    // Sort by sortOrder, then createdAt
    entries.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.createdAt - b.createdAt;
    });

    return entries;
  },
});

export const create = mutation({
  args: {
    productId: v.optional(v.id("products")),
    question: v.string(),
    answer: v.string(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entryId = await ctx.db.insert("faqEntries", {
      productId: args.productId,
      question: args.question,
      answer: args.answer,
      sortOrder: args.sortOrder ?? 0,
      createdAt: Date.now(),
    });

    return entryId;
  },
});

export const update = mutation({
  args: {
    id: v.id("faqEntries"),
    productId: v.optional(v.id("products")),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;

    const entry = await ctx.db.get(id);
    if (!entry) {
      throw new Error(`FAQ entry ${id} not found`);
    }

    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        update[key] = value;
      }
    }

    await ctx.db.patch(id, update);
  },
});

export const remove = mutation({
  args: { id: v.id("faqEntries") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.id);
    if (!entry) {
      throw new Error(`FAQ entry ${args.id} not found`);
    }

    await ctx.db.delete(args.id);
  },
});
