import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { journeyStagesForProductType, routeForJourneyStage } from "./fullJourneyDefinition";
import { classifyInvention } from "./inventionClassificationLogic";
import { requireInventionReadAccess } from "./organizations";
import { AUTONOMOUS_RESEARCH_KINDS, isAutonomousDecision, PROFESSIONAL_REVIEW_GATE_KINDS } from "./statusBriefingLogic";
import { getValidationFollowUpAction } from "./journeyNextActionLogic";
import { getJourneyStageStatus, getJourneyStageStatusExplanation } from "./journeyStageStatusLogic";
import { isInventorEvidenceSource } from "./chatEvidenceLogic";
import { progressForWorkKinds } from "./workLedgerProgressLogic";

function activityForWork(kind: string, title: string) {
  const activities: Record<string, string> = {
    preliminary_prior_art: "Searching USPTO, Google Patents, and related patent sources",
    feature_prior_art_comparison: "Comparing proposed features against prior-art references",
    distinguishing_features: "Developing alternative embodiments and design-around options",
    patent_design_handoff: "Preparing patent-to-design constraints for Product Design",
    competitor_discovery: "Researching competing products and alternatives",
    market_feasibility: "Assessing demand signals, customer pain, and market evidence",
    assumptions_unknowns: "Building the assumptions and unknowns register",
    technical_feasibility: "Assessing mechanisms, risks, and prototype questions",
    design_candidate_generation: "Generating differentiated product design candidates",
    design_candidate_scoring: "Scoring candidates for differentiation and feasibility",
    product_design_specification: "Writing the preliminary Product Design Specification",
    native_cad_generation: "Generating the preliminary parametric CAD model",
    product_render_generation: "Preparing the product presentation artwork",
  };
  return activities[kind] ?? title;
}

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

    const currentWorkItems = progressForWorkKinds(workItems, [...new Set(journeyStages.flatMap((stage) => stage.requiredWorkKinds))]).relevant;
    const latestDeliverableByKind = new Map<string, (typeof deliverables)[number]>();
    for (const item of deliverables) {
      const current = latestDeliverableByKind.get(item.kind);
      if (!current || item.version > current.version || (item.version === current.version && item.updatedAt > current.updatedAt)) latestDeliverableByKind.set(item.kind, item);
    }
    const currentDeliverables = [...latestDeliverableByKind.values()];
    const deliverableById = new Map(currentDeliverables.map((item) => [String(item._id), item]));
    const stageRows = journeyStages.map((stage) => {
      const stageProgress = progressForWorkKinds(currentWorkItems, stage.requiredWorkKinds);
      const relevant = stageProgress.relevant;
      const legalHandoff = currentDeliverables.find((item) => item.kind === "patent_design_handoff");
      const internalLegalAccepted = Boolean(legalHandoff && reviews.some((review) => String(review.deliverableId) === String(legalHandoff._id) && review.specialty === "patent" && review.status === "accepted"));
      const legalPrerequisitePending = stage.id === 5 && Boolean(legalHandoff) && !internalLegalAccepted;
      const completedCount = legalPrerequisitePending ? 0 : stageProgress.completed;
      const professionalGateItems = relevant.filter((item) => item && (item.humanGateType === "professional_review" || (item.kind === "patent_design_handoff" && /patent counsel|qualified patent/i.test(item.blockedReason ?? ""))));
      const blockedItems = relevant.filter((item) =>
        (item && (item.status === "blocked" || item.status === "awaiting_approval") && !AUTONOMOUS_RESEARCH_KINDS.has(item.kind) && !professionalGateItems.includes(item))
      );
      const runningItems = legalPrerequisitePending ? [] : relevant.filter((item) => item?.status === "running");
      const queuedItems = relevant.filter((item) => item?.status === "queued");
      const failedItems = legalPrerequisitePending ? [] : relevant.filter((item) => item?.status === "failed");
      const staleItems = relevant.filter((item) => item?.status === "stale");
      const relevantWorkIds = new Set(relevant.map((item) => item ? String(item._id) : ""));
      const stageDeliverables = currentDeliverables.filter((item) => item.workItemId && relevantWorkIds.has(String(item.workItemId)));
      const stageReviews = reviews.filter((review) => {
        const deliverable = deliverableById.get(String(review.deliverableId));
        return Boolean(deliverable?.workItemId && relevantWorkIds.has(String(deliverable.workItemId)));
      });
      const pendingReviews = stageReviews.filter((review) => review.status !== "accepted");
      const initialized = relevant.length > 0;
      const allWorkComplete = !legalPrerequisitePending && stageProgress.allComplete;
      const hasStaleDeliverable = stageDeliverables.some((item) => Boolean(item.staleReason));
      const progressPercent = legalPrerequisitePending ? 0 : stageProgress.progressPercent;
      const activeWork = runningItems[0] ?? queuedItems[0];

      // Keep queued work distinct from work that is actively running.
      const status = legalPrerequisitePending ? "queued" : getJourneyStageStatus({
        requiredWorkCount: stage.requiredWorkKinds.length,
        completedWorkCount: completedCount,
        pendingProfessionalReviews: pendingReviews.length,
        professionalGateCount: professionalGateItems.length,
        staleWorkCount: staleItems.length,
        hasStaleDeliverable,
        failedWorkCount: failedItems.length,
        blockedWorkCount: blockedItems.length,
        runningWorkCount: runningItems.length,
        queuedWorkCount: queuedItems.length,
        initialized,
        stageId: stage.id,
      });

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
        progressPercent,
        activeWorkCount: runningItems.length,
        queuedWorkCount: queuedItems.length,
        activityLabel: activeWork ? activityForWork(activeWork.kind, activeWork.title) : null,
        statusExplanation: legalPrerequisitePending
          ? "Product Design and CAD are queued behind the Patent Readiness handoff. Internal Legal must process that handoff before design work can begin or count as complete."
          : getJourneyStageStatusExplanation(status, {
          runningWorkCount: runningItems.length,
          queuedWorkCount: queuedItems.length,
          queuedWorkTitle: activeWork?.title,
          staleReason: staleItems[0]?.lastError,
        }),
      };
    });

    const firstIncomplete = stageRows.find((stage) => stage.status !== "complete") ?? stageRows[stageRows.length - 1];
    const pendingApprovalCount = approvals.filter((item) => item.status === "pending").length;
    const openDecisionCount = decisions.filter((item) => item.status === "open" && !isAutonomousDecision(item)).length;
    const blockedWorkCount = workItems.filter((item) =>
      (item.status === "blocked" || item.status === "awaiting_approval") && !AUTONOMOUS_RESEARCH_KINDS.has(item.kind) && !PROFESSIONAL_REVIEW_GATE_KINDS.has(item.kind)
    ).length;
    const pendingReviewCount = reviews.filter((item) => item.status !== "accepted" && item.status !== "declined").length;
    const completedStages = stageRows.filter((stage) => stage.status === "complete").length;
    const hasActiveValidationSurvey = evidenceRequests.some((request) => request.kind === "survey" && request.status === "active" && request.title.startsWith("[Validation follow-up]"));
    const customerValidationResponses = evidence.filter((item) => item.metadata?.evidenceOrigin === "public_response" || item.metadata?.validationStatus === "counted_customer_signal").length;

    let nextAction = `Open ${firstIncomplete.name} and follow the first step.`;
    if (pendingApprovalCount > 0) nextAction = `Review an approval so InventSmith can continue (${pendingApprovalCount} waiting).`;
    else if (openDecisionCount > 0) nextAction = `Answer an open question so InventSmith can continue (${openDecisionCount} waiting).`;
    else if (blockedWorkCount > 0) nextAction = `Open ${firstIncomplete.name} to see what information is missing (${blockedWorkCount} item${blockedWorkCount === 1 ? "" : "s"}).`;
    else if (firstIncomplete.status === "professional_review") nextAction = `${firstIncomplete.name} is ready for Internal Legal review in the Legal department.`;
    else if (firstIncomplete.name === "Validation" && hasActiveValidationSurvey) nextAction = getValidationFollowUpAction(customerValidationResponses, firstIncomplete.status, {
      runningWorkCount: firstIncomplete.activeWorkCount,
      queuedWorkCount: firstIncomplete.queuedWorkCount,
      queuedWorkTitle: firstIncomplete.activityLabel ?? undefined,
    });
    else if (firstIncomplete.status === "needs_refresh") nextAction = `Open ${firstIncomplete.name}; new information means some work needs updating.`;
    else if (firstIncomplete.status === "failed") nextAction = `Open ${firstIncomplete.name} and retry the step that failed.`;

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
        inventorProvided: evidence.filter((item) => isInventorEvidenceSource(item.metadata, item.excerpt)).length,
        verified: evidence.filter((item) => item.reliability !== "unverified").length,
        // Public responses created before validation metadata was added are still
        // traceable customer-validation evidence and must remain visible here.
        customerValidationResponses,
      },
    };
  },
});
