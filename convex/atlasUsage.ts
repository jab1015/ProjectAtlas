import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getDailyUsageLimits, normalizeAtlasTier, remainingAutonomousCostUnitsAfterReservations, utcDateKey } from "./usagePolicyLogic";
import { getOrganizationMembership } from "./organizations";
import { getOrganizationUsageSnapshot } from "./organizationDailyUsage";
import { getActiveEntitlementOverride, getEffectiveOrganizationPlanKey, getOrganizationCreditBalance } from "./betaAccessLogic";

export const getCurrentUsage = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db.get(userId);

    let plan: unknown = user?.subscriptionTier;
    let organizationId = args.organizationId ?? user?.personalOrganizationId;
    let scope: "organization" | "legacy_user" = "legacy_user";
    let complimentaryAccess = false;

    if (organizationId) {
      const [organization, membership] = await Promise.all([
        ctx.db.get(organizationId),
        getOrganizationMembership(ctx, organizationId, userId),
      ]);
      if (!organization || organization.status !== "active" || !membership || membership.status !== "active") {
        if (args.organizationId) throw new ConvexError("Organization access required");
        organizationId = undefined;
      } else {
        // Legacy source compatibility: plan = organization.planKey.
        plan = await getEffectiveOrganizationPlanKey(ctx, organization);
        complimentaryAccess = Boolean(await getActiveEntitlementOverride(ctx, organization._id));
        scope = "organization";
      }
    }

    const now = Date.now();
    const dateKey = utcDateKey(now);
    const usage = scope === "organization" && organizationId
      ? await getOrganizationUsageSnapshot(ctx, organizationId, dateKey)
      : await ctx.db
          .query("atlasDailyUsage")
          .withIndex("by_userId_dateKey", (q) => q.eq("userId", userId).eq("dateKey", dateKey))
          .unique();
    const tier = normalizeAtlasTier(plan);
    const limits = getDailyUsageLimits(tier);
    const creditBalance = scope === "organization" && organizationId
      ? await getOrganizationCreditBalance(ctx, organizationId)
      : 0;
    return {
      dateKey,
      tier,
      scope,
      organizationId: organizationId ?? null,
      usage: usage ?? { autonomousCostUnits: 0, reservedAutonomousCostUnits: 0, completedWorkItems: 0, chatQuestions: 0 },
      // Administrators are intentionally unmetered. Null communicates
      // unbounded access without rendering a misleading large numeric cap.
      isAdmin: user?.role === "admin",
      limits: user?.role === "admin" ? null : limits,
      creditBalance: user?.role === "admin" ? null : creditBalance,
      complimentaryAccess,
      remainingAutonomousCostUnits: user?.role === "admin"
        ? null
        : remainingAutonomousCostUnitsAfterReservations(tier, usage?.autonomousCostUnits ?? 0, usage?.reservedAutonomousCostUnits ?? 0),
    };
  },
});
