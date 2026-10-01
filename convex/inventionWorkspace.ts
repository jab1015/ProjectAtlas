import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { makeFunctionReference } from "convex/server";
import { buildStatusBriefing } from "./statusBriefingLogic";
import { canResolveDecision } from "./reviewLogic";
import { MAX_AUTONOMOUS_RUN_BUDGET, remainingAutonomousCostUnitsAfterReservations, utcDateKey } from "./usagePolicyLogic";
import { evaluatePilotPackage } from "./pilotEvaluationLogic";
import {
  requireInventionEditAccess,
  requireInventionManageAccess,
  requireInventionReadAccess,
} from "./organizations";
import { resolveInventionUsageScope } from "./organizationUsageScope";
import { getOrganizationUsageSnapshot } from "./organizationDailyUsage";
import { respondToBlockedWorkHandler } from "./blockedWorkResponseMutation";
import { recordProfessionalReviewHandler } from "./professionalReviewMutation";
import {
  requestApprovalHandler,
  resolveApprovalRequestHandler,
} from "./consequentialApprovalMutation";

const runAvailableWork = makeFunctionReference<
  "action",
  { inventionId: Id<"inventions">; costBudgetUnits?: number },
  unknown
>("atlasWorkOrchestration:runAvailableWork");

async function getAccessibleInvention(
  ctx: Parameters<typeof requireInventionReadAccess>[0],
  inventionId: Id<"inventions">
) {
  const authorization = await requireInventionReadAccess(ctx, inventionId);
  const invention = await ctx.db.get(inventionId);
  if (!invention) throw new ConvexError("Invention not found");
  return { invention, ...authorization };
}

export const getWorkspaceState = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const { invention, access } = await getAccessibleInvention(ctx, inventionId);
    const usageScope = await resolveInventionUsageScope(ctx, inventionId);

    const [record, assumptions, findings, decisions, approvals, workItems, deliverables, reviews] =
      await Promise.all([
        ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).unique(),
        ctx.db.query("inventionAssumptions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
        ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
        ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
        ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
        ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
        ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
        ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ]);

    return {
      invention,
      access,
      record,
      assumptions,
      findings,
      decisions,
      approvals,
      workItems,
      deliverables,
      reviews,
      briefing: buildStatusBriefing({ workItems, decisions, approvals, findings, subscriptionTier: usageScope?.plan }),
    };
  },
});

export const getStatusBriefing = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    await requireInventionReadAccess(ctx, inventionId);
    const usageScope = await resolveInventionUsageScope(ctx, inventionId);

    const [workItems, decisions, approvals, findings] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);

    return buildStatusBriefing({ workItems, decisions, approvals, findings, subscriptionTier: usageScope?.plan });
  },
});

export const getReviewQueue = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const { invention } = await getAccessibleInvention(ctx, inventionId);
    const [decisions, approvals, blockedWork] = await Promise.all([
      ctx.db
        .query("inventionDecisions")
        .withIndex("by_inventionId_status", (q) =>
          q.eq("inventionId", inventionId).eq("status", "open")
        )
        .collect(),
      ctx.db
        .query("approvalRequests")
        .withIndex("by_inventionId_status", (q) =>
          q.eq("inventionId", inventionId).eq("status", "pending")
        )
        .collect(),
      ctx.db
        .query("atlasWorkItems")
        .withIndex("by_inventionId_status", (q) =>
          q.eq("inventionId", inventionId).eq("status", "blocked")
        )
        .collect(),
    ]);

    return {
      invention: { _id: invention._id, title: invention.title },
      decisions: decisions.sort((a, b) => a.createdAt - b.createdAt),
      approvals: approvals.sort((a, b) => a.requestedAt - b.requestedAt),
      blockedWork: blockedWork.sort((a, b) => a.updatedAt - b.updatedAt),
    };
  },
});

export const getDeliverableLibrary = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const { invention } = await getAccessibleInvention(ctx, inventionId);
    const [deliverables, sources, reviews, executionEvents] = await Promise.all([
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasExecutionEvents").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);

    const deliverablesWithMedia = await Promise.all(
      deliverables
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(async (deliverable) => ({
          ...deliverable,
          mediaUrl: deliverable.storageId ? await ctx.storage.getUrl(deliverable.storageId) : null,
        }))
    );

    return {
      invention: { _id: invention._id, title: invention.title },
      deliverables: deliverablesWithMedia,
      sources,
      reviews,
      executionEvents: executionEvents.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50),
    };
  },
});

export const getPilotEvaluation = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    await requireInventionReadAccess(ctx, inventionId);
    const [deliverables, findings, sources, workItems] = await Promise.all([
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);
    return evaluatePilotPackage({ deliverables, findings, sources, workItems });
  },
});

/** Backfills the canonical record for inventions created before Product Reset v1. */
export const ensureInventionRecord = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    await requireInventionEditAccess(ctx, inventionId);
    const invention = await ctx.db.get(inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    const existing = await ctx.db
      .query("inventionRecords")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .unique();
    if (existing) return existing._id;

    const now = Date.now();
    return ctx.db.insert("inventionRecords", {
      inventionId,
      userId: invention.userId,
      schemaVersion: 1,
      lifecycleStatus: "intake",
      riskClass: "standard",
      structuredBrief: {
        title: invention.title,
        problemStatement: invention.problemStatement,
        targetAudience: invention.targetAudience,
        solutionDescription: invention.solutionDescription,
      },
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Safely nudges the idempotent worker whenever an authorized collaborator opens InventSmith. */
export const kickAutonomousWork = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    await requireInventionEditAccess(ctx, inventionId);
    const usageScope = await resolveInventionUsageScope(ctx, inventionId);
    if (!usageScope) throw new ConvexError("Invention not found");
    const dateKey = utcDateKey(Date.now());
    const usage = usageScope.scope === "organization"
      ? await getOrganizationUsageSnapshot(ctx, usageScope.organizationId, dateKey)
      : await ctx.db
          .query("atlasDailyUsage")
          .withIndex("by_userId_dateKey", (q) => q.eq("userId", usageScope.usageUserId).eq("dateKey", dateKey))
          .unique();
    const remaining = remainingAutonomousCostUnitsAfterReservations(
      usageScope.plan,
      usage?.autonomousCostUnits ?? 0,
      usage?.reservedAutonomousCostUnits ?? 0
    );
    if (remaining === 0) return { scheduled: false, reason: "daily_usage_limit" as const };
    await ctx.scheduler.runAfter(0, runAvailableWork, {
      inventionId,
      costBudgetUnits: Math.min(MAX_AUTONOMOUS_RUN_BUDGET, remaining),
    });
    return { scheduled: true, reason: "scheduled" as const };
  },
});

export const resolveDecision = mutation({
  args: {
    decisionId: v.id("inventionDecisions"),
    selectedOptionKey: v.string(),
    rationale: v.optional(v.string()),
  },
  handler: async (ctx, { decisionId, selectedOptionKey, rationale }) => {
    const decision = await ctx.db.get(decisionId);
    if (!decision) throw new ConvexError("Decision not found");
    const { userId } = await requireInventionManageAccess(ctx, decision.inventionId);
    if (!canResolveDecision(decision.status, selectedOptionKey, decision.options)) {
      throw new ConvexError(
        decision.status === "open"
          ? "Selected option is not valid for this decision"
          : "Decision is not open"
      );
    }

    const now = Date.now();
    await ctx.db.patch(decisionId, {
      selectedOptionKey,
      rationale,
      status: "approved",
      decidedByUserId: userId,
      decidedAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: decision.inventionId,
      eventType: "decision_resolved",
      actorType: "inventor",
      summary: `Authorized invention manager selected decision option ${selectedOptionKey}.`,
      metadata: { decisionId: String(decisionId), selectedOptionKey, resolvedByUserId: String(userId) },
      createdAt: now,
    });
    return { success: true };
  },
});

/** Compatibility route retained for older callers; all behavior is delegated to the guarded exact-artifact handler. */
export const resolveApprovalRequest = mutation({
  args: {
    approvalRequestId: v.id("approvalRequests"),
    approved: v.boolean(),
  },
  handler: resolveApprovalRequestHandler,
});

export const respondToBlockedWork = mutation({
  args: {
    workItemId: v.id("atlasWorkItems"),
    response: v.string(),
  },
  handler: respondToBlockedWorkHandler,
});

/** Records a real professional's review. Inventors cannot self-certify InventSmith drafts. */
export const recordProfessionalReview = mutation({
  args: {
    reviewId: v.id("professionalReviews"),
    reviewerName: v.string(),
    reviewerReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    accepted: v.boolean(),
  },
  handler: recordProfessionalReviewHandler,
});

export const createDecision = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    title: v.string(),
    question: v.string(),
    options: v.array(v.object({ key: v.string(), label: v.string(), description: v.string() })),
    recommendedOptionKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    if (
      args.recommendedOptionKey &&
      !args.options.some((option) => option.key === args.recommendedOptionKey)
    ) {
      throw new ConvexError("Recommended option is not in the option list");
    }

    const now = Date.now();
    return ctx.db.insert("inventionDecisions", {
      inventionId: args.inventionId,
      title: args.title,
      question: args.question,
      options: args.options,
      recommendedOptionKey: args.recommendedOptionKey,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Compatibility route retained for older internal callers; artifact-bound actions now fail closed without exact scope. */
export const requestApproval = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    decisionId: v.optional(v.id("inventionDecisions")),
    deliverableIds: v.optional(v.array(v.id("atlasDeliverables"))),
    actionType: v.union(
      v.literal("share_confidential_information"),
      v.literal("contact_third_party"),
      v.literal("publish_or_disclose"),
      v.literal("purchase_or_fee"),
      v.literal("submit_or_file"),
      v.literal("external_use"),
      v.literal("other")
    ),
    summary: v.string(),
    consequences: v.array(v.string()),
  },
  handler: requestApprovalHandler,
});