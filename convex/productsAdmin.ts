import { mutation } from "./_generated/server";
import { v } from "convex/values";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    priceAmountCents: v.number(),
    currency: v.optional(v.string()),
    compareAtPriceCents: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    coverImageUrl: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))
    ),
    featured: v.optional(v.boolean()),
    formatInfo: v.optional(v.string()),
    fileSize: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let slug = args.slug || generateSlug(args.title);

    // Ensure slug uniqueness
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      slug = `${slug}-${now}`;
    }

    const productId = await ctx.db.insert("products", {
      title: args.title,
      slug,
      description: args.description,
      shortDescription: args.shortDescription,
      priceAmountCents: args.priceAmountCents,
      currency: args.currency ?? "usd",
      compareAtPriceCents: args.compareAtPriceCents,
      categoryId: args.categoryId,
      coverImageUrl: args.coverImageUrl,
      status: args.status ?? "draft",
      featured: args.featured,
      formatInfo: args.formatInfo,
      fileSize: args.fileSize,
      totalSales: 0,
      tags: args.tags,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      createdAt: now,
      updatedAt: now,
    });

    return productId;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    priceAmountCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    compareAtPriceCents: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    coverImageUrl: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))
    ),
    featured: v.optional(v.boolean()),
    formatInfo: v.optional(v.string()),
    fileSize: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;

    const product = await ctx.db.get(id);
    if (!product) {
      throw new Error(`Product ${id} not found`);
    }

    const update: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        update[key] = value;
      }
    }

    // If title changed and slug not explicitly provided, regenerate slug
    if (fields.title && fields.title !== product.title && !fields.slug) {
      let slug = generateSlug(fields.title);
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

      if (existing && existing._id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
      update.slug = slug;
    }

    await ctx.db.patch(id, update);
  },
});

export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error(`Product ${args.id} not found`);
    }

    // Delete associated files
    const files = await ctx.db
      .query("productFiles")
      .withIndex("by_productId", (q) => q.eq("productId", args.id))
      .collect();

    for (const file of files) {
      await ctx.storage.delete(file.storageId);
      await ctx.db.delete(file._id);
    }

    await ctx.db.delete(args.id);
  },
});
