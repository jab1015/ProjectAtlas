import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const create = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    priceAmountCents: v.number(),
    currency: v.optional(v.string()),
    compareAtPriceCents: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    coverImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))
    ),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    formatInfo: v.optional(v.string()),
    fileSize: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let slug = generateSlug(args.title);

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
      thumbnailUrl: args.thumbnailUrl,
      status: args.status ?? "draft",
      featured: args.featured,
      sortOrder: args.sortOrder,
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

export const update = internalMutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    priceAmountCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    compareAtPriceCents: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    coverImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))
    ),
    featured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
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

    // Build update object with only defined fields
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        update[key] = value;
      }
    }

    // If title changed, regenerate slug
    if (fields.title && fields.title !== product.title) {
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

export const updateStatus = internalMutation({
  args: {
    id: v.id("products"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error(`Product ${args.id} not found`);
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const updateCheckoutUrl = internalMutation({
  args: {
    id: v.id("products"),
    platformProductId: v.string(),
    checkoutUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error(`Product ${args.id} not found`);
    }

    await ctx.db.patch(args.id, {
      platformProductId: args.platformProductId,
      checkoutUrl: args.checkoutUrl,
      updatedAt: Date.now(),
    });
  },
});

export const incrementSales = internalMutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error(`Product ${args.id} not found`);
    }

    await ctx.db.patch(args.id, {
      totalSales: (product.totalSales ?? 0) + 1,
      updatedAt: Date.now(),
    });
  },
});
