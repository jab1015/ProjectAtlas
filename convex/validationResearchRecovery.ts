import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireInventionReadAccess } from "./organizations";
import { summarizeValidationRecovery } from "./validationResearchRecoveryLogic";

/**
 * Small route-safe view of validation recovery state.
 *
 * Unlike the legacy validation query, authorization follows the organization
 * access boundary. The response contains no research content, only counts and
 * state needed to offer a safe retry affordance.
 */
export const getValidationRecoveryState = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    await requireInventionReadAccess(ctx, inventionId);

    const latest = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();

    if (!latest) {
      return {
        state: "waiting" as const,
        successfulSectionCount: 0,
        failedSectionCount: 0,
        pendingSectionCount: 0,
        canRetryFailed: false,
      };
    }

    return summarizeValidationRecovery({
      researchStatus: latest.researchStatus,
      status: latest.status,
      sections: latest.sections,
      sectionsJson: latest.sectionsJson,
    });
  },
});
