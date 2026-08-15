import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getDailyUsageLimits, normalizeAtlasTier, remainingAutonomousCostUnitsAfterReservations, utcDateKey } from "./usagePolicyLogic";

export const getCurrentUsage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db.get(userId);
    const now = Date.now();
    const dateKey = utcDateKey(now);
    const usage = await ctx.db.query("atlasDailyUsage").withIndex("by_userId_dateKey", (q) => q.eq("userId", userId).eq("dateKey", dateKey)).unique();
    const tier = normalizeAtlasTier(user?.subscriptionTier);
    const limits = getDailyUsageLimits(tier);
    return {
      dateKey,
      tier,
      usage: usage ?? { autonomousCostUnits: 0, reservedAutonomousCostUnits: 0, completedWorkItems: 0, chatQuestions: 0 },
      limits,
      remainingAutonomousCostUnits: remainingAutonomousCostUnitsAfterReservations(tier, usage?.autonomousCostUnits ?? 0, usage?.reservedAutonomousCostUnits ?? 0),
    };
  },
});
