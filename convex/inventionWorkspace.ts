import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { makeFunctionReference } from "convex/server";
import { AUTONOMOUS_RESEARCH_KINDS, buildStatusBriefing, isAutonomousDecision } from "./statusBriefingLogic";
import { canResolveDecision } from "./reviewLogic";
import { MAX_AUTONOMOUS_RUN_BUDGET, remainingAutonomousCostUnitsAfterReservations, utcDateKey } from "./usagePolicyLogic";
import { evaluatePilotPackage } from "./pilotEvaluationLogic";
import { safeWorkFailureSummary } from "./workFailureSummary";
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
import { canRecoverAgentAssignment, departmentAgentAuditMetadata, resolveDepartmentAgent } from "./departmentAgentLogic";
import { shouldAutomaticallyRecoverFailedWork } from "./workOrchestratorLogic";
import { latestWorkByKind } from "./workLedgerProgressLogic";

const runAvailableWork = makeFunctionReference<
  "action",
  { inventionId: Id<"inventions">; costBudgetUnits?: number; departmentStageId?: number },
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
      decisions: decisions.filter((decision) => !isAutonomousDecision(decision)),
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
    const [decisions, approvals, blockedWork, professionalReviews] = await Promise.all([
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
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);

    return {
      invention: { _id: invention._id, title: invention.title },
      access: (await getAccessibleInvention(ctx, inventionId)).access,
      decisions: decisions.filter((decision) => !isAutonomousDecision(decision)).sort((a, b) => a.createdAt - b.createdAt),
      approvals: approvals.sort((a, b) => a.requestedAt - b.requestedAt),
      blockedWork: blockedWork
        .filter((item) => !AUTONOMOUS_RESEARCH_KINDS.has(item.kind))
        .sort((a, b) => a.updatedAt - b.updatedAt),
      professionalReviews: professionalReviews.filter((review) => review.status !== "accepted").sort((a, b) => a.createdAt - b.createdAt),
    };
  },
});

export const getDeliverableLibrary = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const { invention, access } = await getAccessibleInvention(ctx, inventionId);
    const [deliverables, sources, reviews, executionEvents, workItems] = await Promise.all([
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasExecutionEvents").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
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
      access,
      deliverables: deliverablesWithMedia,
      sources,
      reviews,
      executionEvents: executionEvents.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50),
      workItems: latestWorkByKind(workItems)
        .sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt)
        .map((item) => ({
          workItemId: item._id,
          kind: item.kind,
          title: item.title,
          status: item.status,
          attemptCount: item.attemptCount,
          updatedAt: item.updatedAt,
          blockedReason: item.blockedReason,
          outputSummary: item.outputSummary,
        })),
      failedWork: workItems
        .filter((item) => item.status === "failed")
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((item) => ({
          workItemId: item._id,
          kind: item.kind,
          title: item.title,
          attemptCount: item.attemptCount,
          updatedAt: item.updatedAt,
          summary: safeWorkFailureSummary(item.lastError),
        })),
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
  args: { inventionId: v.id("inventions"), departmentStageId: v.optional(v.number()) },
  handler: async (ctx, { inventionId, departmentStageId }) => {
    await requireInventionEditAccess(ctx, inventionId);
    if (departmentStageId !== undefined && (!Number.isInteger(departmentStageId) || departmentStageId < 1 || departmentStageId > 15)) {
      throw new ConvexError("Invalid lifecycle department stage");
    }
    const usageScope = await resolveInventionUsageScope(ctx, inventionId);
    if (!usageScope) throw new ConvexError("Invention not found");
    const dateKey = utcDateKey(Date.now());
    const usage = usageScope.scope === "organization"
      ? await getOrganizationUsageSnapshot(ctx, usageScope.organizationId, dateKey)
      : await ctx.db
          .query("atlasDailyUsage")
          .withIndex("by_userId_dateKey", (q) => q.eq("userId", usageScope.usageUserId).eq("dateKey", dateKey))
          .unique();
    const remaining = usageScope.isAdmin
      ? Number.MAX_SAFE_INTEGER
      : remainingAutonomousCostUnitsAfterReservations(
          usageScope.plan,
          usage?.autonomousCostUnits ?? 0,
          usage?.reservedAutonomousCostUnits ?? 0
        );
    if (remaining === 0) return { scheduled: false, reason: "daily_usage_limit" as const };
    const now = Date.now();
    const [workItems, deliverables, professionalReviews] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);
    for (const item of workItems) {
      // These assignments are InventSmith's preparation work. Recover stale
      // records regardless of the old gate type so a prior prototype or
      // professional-review response cannot strand autonomous work.
      const recoverableResearchGate = item.status === "blocked" && AUTONOMOUS_RESEARCH_KINDS.has(item.kind);
      const assignmentRecovery = item.status === "failed" && canRecoverAgentAssignment(item.inputSnapshot, item.kind, item.lastError);
      const recoverableFailure = item.status === "failed" && (
        assignmentRecovery ||
        item.attemptCount < (item.maxAttempts ?? 3) ||
        shouldAutomaticallyRecoverFailedWork(item.kind, item.inputSnapshot, item.attemptCount, item.maxAttempts ?? 3)
      );
      if (!recoverableResearchGate && !recoverableFailure) continue;
      try {
        const agent = resolveDepartmentAgent(item.inputSnapshot, item.kind);
        await ctx.db.patch(item._id, {
          status: "queued",
          lastError: undefined,
          blockedReason: undefined,
          humanGateType: undefined,
          maxAttempts: item.attemptCount >= (item.maxAttempts ?? 3) ? item.attemptCount + 2 : item.maxAttempts,
          inputSnapshot: {
            ...(item.inputSnapshot ?? {}),
            department: agent.department,
            ...(assignmentRecovery ? { departmentAgentRecoveryVersion: 1, lastDepartmentAgentRecoveryAt: now } : {}),
            ...(!assignmentRecovery && item.attemptCount >= (item.maxAttempts ?? 3)
              ? { automaticRecoveryCount: Number(item.inputSnapshot?.automaticRecoveryCount ?? 0) + 1, lastAutomaticRecoveryAt: now }
              : {}),
          },
          updatedAt: now,
        });
        await ctx.db.insert("atlasExecutionEvents", {
          inventionId,
          workItemId: item._id,
          eventType: "work_queued",
          actorType: "system",
          summary: recoverableResearchGate
            ? `InventSmith resumed ${item.title}; preliminary research can run autonomously before professional review.`
            : `InventSmith automatically recovered ${item.title} and returned it to the worker queue.`,
          attemptNumber: item.attemptCount,
          metadata: { changeType: recoverableResearchGate ? "autonomous_research_gate_recovery" : assignmentRecovery ? "department_agent_recovery" : "automatic_failure_recovery", ...departmentAgentAuditMetadata({ ...(item.inputSnapshot ?? {}), department: agent.department }, item.kind) },
          createdAt: now,
        });
      } catch {
        // Leave genuinely unmapped or exhausted failures visible for repair.
      }
    }
    // Migrate legacy patent handoffs into the current internal Legal model.
    // Older packets were correctly held for professional review but predate
    // structured legalDisposition output. Give each such invention one
    // bounded automated Legal re-check; never keep re-queuing a packet that
    // remains outside Internal Legal's authority.
    const latestPatentHandoff = deliverables
      .filter((item) => item.kind === "patent_design_handoff")
      .sort((a, b) => b.version - a.version)[0];
    const legacyPatentReview = latestPatentHandoff
      ? professionalReviews.find((review) => String(review.deliverableId) === String(latestPatentHandoff._id) && review.specialty === "patent")
      : undefined;
    const hasAutomatedLegalRecheck = workItems.some((item) => item.kind === "patent_design_handoff" && Boolean((item.inputSnapshot as any)?.automaticInternalLegalReview));
    const hasActiveAutomatedLegalRecheck = workItems.some((item) => item.kind === "patent_design_handoff" && Boolean((item.inputSnapshot as any)?.automaticInternalLegalReview) && (item.status === "queued" || item.status === "running"));
    if (latestPatentHandoff && legacyPatentReview?.status === "required" && !hasAutomatedLegalRecheck && !hasActiveAutomatedLegalRecheck) {
      await ctx.db.insert("atlasWorkItems", {
        inventionId,
        kind: "patent_design_handoff",
        title: "Automatically re-check Patent Readiness through Internal Legal",
        status: "queued",
        priority: 58,
        inputSnapshot: {
          department: "patent_readiness",
          stageId: 4,
          legalIteration: 0,
          automaticInternalLegalReview: true,
          instructions: "Re-check the current Patent Readiness packet through InventSmith's Internal Legal department. Return the required structured legalDisposition. This is an automated operational routing decision for the Product Design handoff only; do not claim patentability, freedom to operate, legal clearance, validity, enforceability, or filing approval.",
        },
        attemptCount: 0,
        maxAttempts: 3,
        estimatedCostUnits: 10,
        deliverableKind: "patent_design_handoff",
        dependsOnKinds: ["distinguishing_features"],
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert("atlasExecutionEvents", {
        inventionId,
        eventType: "work_queued",
        actorType: "system",
        summary: "InventSmith automatically re-queued the legacy Patent Readiness packet for an Internal Legal department re-check.",
        metadata: { automated: true, migration: "legacy_internal_legal_review", triggeringDeliverableId: String(latestPatentHandoff._id) },
        createdAt: now,
      });
    }
    await ctx.scheduler.runAfter(0, runAvailableWork, {
      inventionId,
      costBudgetUnits: Math.min(MAX_AUTONOMOUS_RUN_BUDGET, remaining),
      departmentStageId,
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
