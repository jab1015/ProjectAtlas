import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    featured: v.optional(v.boolean()),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    let testimonials;

    if (args.productId !== undefined) {
      testimonials = await ctx.db
        .query("testimonials")
        .withIndex("by_productId", (q) =>
          q.eq("productId", args.productId)
        )
        .collect();
    } else if (args.featured !== undefined) {
      testimonials = await ctx.db
        .query("testimonials")
        .withIndex("by_featured", (q) => q.eq("featured", args.featured))
        .collect();
    } else {
      testimonials = await ctx.db.query("testimonials").collect();
    }

    // Sort by sortOrder, then createdAt
    testimonials.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.createdAt - a.createdAt;
    });

    return testimonials;
  },
});

export const create = mutation({
  args: {
    productId: v.optional(v.id("products")),
    customerName: v.string(),
    customerTitle: v.optional(v.string()),
    quote: v.string(),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const testimonialId = await ctx.db.insert("testimonials", {
      productId: args.productId,
      customerName: args.customerName,
      customerTitle: args.customerTitle,
      quote: args.quote,
      rating: args.rating,
      featured: args.featured ?? false,
      sortOrder: args.sortOrder ?? 0,
      createdAt: Date.now(),
    });

    return testimonialId;
  },
});

export const update = mutation({
  args: {
    id: v.id("testimonials"),
    productId: v.optional(v.id("products")),
    customerName: v.optional(v.string()),
    customerTitle: v.optional(v.string()),
    quote: v.optional(v.string()),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;

    const testimonial = await ctx.db.get(id);
    if (!testimonial) {
      throw new Error(`Testimonial ${id} not found`);
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
  args: { id: v.id("testimonials") },
  handler: async (ctx, args) => {
    const testimonial = await ctx.db.get(args.id);
    if (!testimonial) {
      throw new Error(`Testimonial ${args.id} not found`);
    }

    await ctx.db.delete(args.id);
  },
});
