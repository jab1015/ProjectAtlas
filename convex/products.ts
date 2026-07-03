import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    let products;
    if (args.categoryId) {
      products = await ctx.db
        .query("products")
        .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
        .collect();
      // Filter to active only
      products = products.filter((p) => p.status === "active");
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect();
    }

    // Join category name
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        let categoryName: string | null = null;
        if (product.categoryId) {
          const category = await ctx.db.get(product.categoryId);
          categoryName = category?.name ?? null;
        }
        return { ...product, categoryName };
      })
    );

    // Sort by sortOrder, then createdAt
    productsWithCategory.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.createdAt - a.createdAt;
    });

    return productsWithCategory;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!product) return null;

    let categoryName: string | null = null;
    if (product.categoryId) {
      const category = await ctx.db.get(product.categoryId);
      categoryName = category?.name ?? null;
    }

    return { ...product, categoryName };
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();

    // Filter to active only and limit to 6
    const activeProducts = products
      .filter((p) => p.status === "active")
      .slice(0, 6);

    const productsWithCategory = await Promise.all(
      activeProducts.map(async (product) => {
        let categoryName: string | null = null;
        if (product.categoryId) {
          const category = await ctx.db.get(product.categoryId);
          categoryName = category?.name ?? null;
        }
        return { ...product, categoryName };
      })
    );

    return productsWithCategory;
  },
});

export const getByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_categoryId", (q) =>
        q.eq("categoryId", args.categoryId)
      )
      .collect();

    return products.filter((p) => p.status === "active");
  },
});

export const getRelated = query({
  args: {
    productId: v.id("products"),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    if (!args.categoryId) return [];

    const products = await ctx.db
      .query("products")
      .withIndex("by_categoryId", (q) =>
        q.eq("categoryId", args.categoryId)
      )
      .collect();

    const related = products
      .filter((p) => p._id !== args.productId && p.status === "active")
      .slice(0, 4);

    const productsWithCategory = await Promise.all(
      related.map(async (product) => {
        let categoryName: string | null = null;
        if (product.categoryId) {
          const category = await ctx.db.get(product.categoryId);
          categoryName = category?.name ?? null;
        }
        return { ...product, categoryName };
      })
    );

    return productsWithCategory;
  },
});

// Admin queries — return all products regardless of status

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        let categoryName: string | null = null;
        if (product.categoryId) {
          const category = await ctx.db.get(product.categoryId);
          categoryName = category?.name ?? null;
        }
        return { ...product, categoryName };
      })
    );

    // Sort by most recent first
    productsWithCategory.sort((a, b) => b.createdAt - a.createdAt);

    return productsWithCategory;
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    let categoryName: string | null = null;
    if (product.categoryId) {
      const category = await ctx.db.get(product.categoryId);
      categoryName = category?.name ?? null;
    }

    return { ...product, categoryName };
  },
});
