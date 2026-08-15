import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { FULL_JOURNEY_STAGES, routeForJourneyStage } from "./fullJourneyDefinition";

export const getJourneyCenter = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const invention = await ctx.db.get(args.inventionId);
    if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found or access denied");

    const [workItems, deliverables, reviews, approvals, decisions, evidence] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
    ]);

    const deliverableById = new Map(deliverables.map((item) => [String(item._id), item]));
    const stageRows = FULL_JOURNEY_STAGES.map((stage) => {
      const relevant = stage.requiredWorkKinds.map((kind) => workItems.find((item) => item.kind === kind)).filter(Boolean);
      const completedCount = relevant.filter((item) => item?.status === "completed").length;
      const blockedItems = relevant.filter((item) => item?.status === "blocked" || item?.status === "awaiting_approval");
      const activeItems = relevant.filter((item) => item?.status === "queued" || item?.status === "running");
      const failedItems = relevant.filter((item) => item?.status === "failed");
      const staleItems = relevant.filter((item) => item?.status === "stale");
      const relevantWorkIds = new Set(relevant.map((item) => item ? String(item._id) : ""));
      const stageDeliverables = deliverables.filter((item) => item.workItemId && relevantWorkIds.has(String(item.workItemId)));
      const stageReviews = reviews.filter((review) => {
        const deliverable = deliverableById.get(String(review.deliverableId));
        return Boolean(deliverable?.workItemId && relevantWorkIds.has(String(deliverable.workItemId)));
      });
      const pendingReviews = stageReviews.filter((review) => review.status !== "accepted");
      const initialized = relevant.length > 0;
      const allWorkComplete = stage.requiredWorkKinds.length > 0 && completedCount === stage.requiredWorkKinds.length;
      const hasStaleDeliverable = stageDeliverables.some((item) => Boolean(item.staleReason));

      let status: "complete" | "professional_review" | "blocked" | "working" | "ready_to_start" | "planned" | "needs_refresh" | "failed";
      if (staleItems.length > 0 || hasStaleDeliverable) status = "needs_refresh";
      else if (failedItems.length > 0) status = "failed";
      else if (blockedItems.length > 0) status = "blocked";
      else if (allWorkComplete && pendingReviews.length > 0) status = "professional_review";
      else if (allWorkComplete) status = "complete";
      else if (activeItems.length > 0 || initialized) status = "working";
      else status = stage.id <= 5 ? "ready_to_start" : "planned";

      return {
        id: stage.id,
        name: stage.name,
        href: routeForJourneyStage(String(invention._id), stage),
        status,
        requiredWorkCount: stage.requiredWorkKinds.length,
        initializedWorkCount: relevant.length,
        completedWorkCount: completedCount,
        blockedCount: blockedItems.length,
        failedCount: failedItems.length,
        pendingProfessionalReviews: pendingReviews.length,
        deliverableCount: stageDeliverables.length,
      };
    });

    const firstIncomplete = stageRows.find((stage) => stage.status !== "complete") ?? stageRows[stageRows.length - 1];
    const pendingApprovalCount = approvals.filter((item) => item.status === "pending").length;
    const openDecisionCount = decisions.filter((item) => item.status === "open").length;
    const blockedWorkCount = workItems.filter((item) => item.status === "blocked" || item.status === "awaiting_approval").length;
    const pendingReviewCount = reviews.filter((item) => item.status !== "accepted" && item.status !== "declined").length;
    const completedStages = stageRows.filter((stage) => stage.status === "complete").length;

    let nextAction = `Continue ${firstIncomplete.name}.`;
    if (pendingApprovalCount > 0) nextAction = `Review ${pendingApprovalCount} pending authorization${pendingApprovalCount === 1 ? "" : "s"}.`;
    else if (openDecisionCount > 0) nextAction = `Resolve ${openDecisionCount} inventor decision${openDecisionCount === 1 ? "" : "s"}.`;
    else if (blockedWorkCount > 0) nextAction = `Provide the smallest required input for ${blockedWorkCount} blocked work item${blockedWorkCount === 1 ? "" : "s"}.`;
    else if (firstIncomplete.status === "professional_review") nextAction = `Professional review is required before ${firstIncomplete.name} can be treated as complete.`;
    else if (firstIncomplete.status === "needs_refresh") nextAction = `Refresh ${firstIncomplete.name} because upstream evidence or invention facts changed.`;
    else if (firstIncomplete.status === "failed") nextAction = `Retry or resolve failed ${firstIncomplete.name} work.`;

    return {
      invention: { _id: invention._id, title: invention.title, updatedAt: invention.updatedAt },
      stages: stageRows,
      currentStage: firstIncomplete,
      completedStages,
      totalStages: stageRows.length,
      nextAction,
      attention: {
        pendingApprovals: pendingApprovalCount,
        openDecisions: openDecisionCount,
        blockedWork: blockedWorkCount,
        pendingProfessionalReviews: pendingReviewCount,
      },
      evidence: {
        total: evidence.length,
        inventorProvided: evidence.filter((item) => item.metadata?.provenance === "inventor_upload").length,
        verified: evidence.filter((item) => item.reliability !== "unverified").length,
      },
    };
  },
});
