import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getByPlatformProductId = internalQuery({
  args: { platformProductId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_platformProductId", (q) =>
        q.eq("platformProductId", args.platformProductId)
      )
      .first();
  },
});
