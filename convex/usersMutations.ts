import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const linkPurchasesByEmail = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_customerEmail", (q) =>
        q.eq("customerEmail", args.email)
      )
      .collect();

    for (const purchase of purchases) {
      if (!purchase.userId) {
        await ctx.db.patch(purchase._id, { userId: args.userId });
      }
    }
  },
});
