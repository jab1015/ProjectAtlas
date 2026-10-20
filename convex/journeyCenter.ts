import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { journeyStagesForProductType, routeForJourneyStage } from "./fullJourneyDefinition";
import { classifyInvention } from "./inventionClassificationLogic";
import { requireInventionReadAccess } from "./organizations";

export const getJourneyCenter = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionReadAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    const classification = classifyInvention(invention);
    const journeyStages = journeyStagesForProductType(classification.productType);

    const [workItems, deliverables, reviews, approvals, decisions, evidence, evidenceRequests] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("evidenceRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).order("desc").collect(),
    ]);

    const deliverableById = new Map(deliverables.map((item) => [String(item._id), item]));
    const stageRows = journeyStages.map((stage) => {
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
    const hasActiveValidationSurvey = evidenceRequests.some((request) => request.kind === "survey" && request.status === "active" && request.title.startsWith("[Validation follow-up]"));

    let nextAction = `Open ${firstIncomplete.name} and follow the first step.`;
    if (pendingApprovalCount > 0) nextAction = `Review an approval so InventSmith can continue (${pendingApprovalCount} waiting).`;
    else if (openDecisionCount > 0) nextAction = `Answer an open question so InventSmith can continue (${openDecisionCount} waiting).`;
    else if (blockedWorkCount > 0) nextAction = `Open ${firstIncomplete.name} to see what information is missing (${blockedWorkCount} item${blockedWorkCount === 1 ? "" : "s"}).`;
    else if (firstIncomplete.status === "professional_review") nextAction = `${firstIncomplete.name} is ready for a qualified professional to review.`;
    else if (firstIncomplete.status === "needs_refresh") nextAction = `Open ${firstIncomplete.name}; new information means some work needs updating.`;
    else if (firstIncomplete.status === "failed") nextAction = `Open ${firstIncomplete.name} and retry the step that failed.`;
    else if (firstIncomplete.name === "Validation" && hasActiveValidationSurvey) nextAction = "Share your prepared survey with five people who may have this problem, then add their answers as evidence.";

    return {
      invention: {
        _id: invention._id,
        title: invention.title,
        updatedAt: invention.updatedAt,
        productType: classification.productType,
        supportClass: classification.supportClass,
        regulatedCategories: classification.categories,
      },
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
