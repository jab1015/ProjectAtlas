import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByToken = query({
  args: { downloadToken: v.string() },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_downloadToken", (q) =>
        q.eq("downloadToken", args.downloadToken)
      )
      .unique();

    if (!purchase) return null;

    const product = await ctx.db.get(purchase.productId);

    return { ...purchase, product };
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_customerEmail", (q) =>
        q.eq("customerEmail", args.email)
      )
      .collect();

    const purchasesWithProduct = await Promise.all(
      purchases.map(async (purchase) => {
        const product = await ctx.db.get(purchase.productId);
        return { ...purchase, product };
      })
    );

    // Sort by most recent first
    purchasesWithProduct.sort((a, b) => b.createdAt - a.createdAt);

    return purchasesWithProduct;
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const purchasesWithProduct = await Promise.all(
      purchases.map(async (purchase) => {
        const product = await ctx.db.get(purchase.productId);
        return { ...purchase, product };
      })
    );

    purchasesWithProduct.sort((a, b) => b.createdAt - a.createdAt);

    return purchasesWithProduct;
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const purchases = await ctx.db
      .query("purchases")
      .order("desc")
      .take(20);

    const purchasesWithProduct = await Promise.all(
      purchases.map(async (purchase) => {
        const product = await ctx.db.get(purchase.productId);
        return { ...purchase, product };
      })
    );

    return purchasesWithProduct;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const purchases = await ctx.db.query("purchases").collect();

    const purchasesWithProduct = await Promise.all(
      purchases.map(async (purchase) => {
        const product = await ctx.db.get(purchase.productId);
        return {
          ...purchase,
          productName: product?.title ?? "Deleted Product",
        };
      })
    );

    // Sort by most recent first
    purchasesWithProduct.sort((a, b) => b.createdAt - a.createdAt);

    return purchasesWithProduct;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allPurchases = await ctx.db.query("purchases").collect();

    const totalRevenue = allPurchases.reduce(
      (sum, p) => sum + p.amountCents,
      0
    );
    const totalPurchases = allPurchases.length;

    const uniqueEmails = new Set(allPurchases.map((p) => p.customerEmail));
    const uniqueCustomers = uniqueEmails.size;

    return {
      totalRevenueCents: totalRevenue,
      totalPurchases,
      uniqueCustomers,
    };
  },
});
