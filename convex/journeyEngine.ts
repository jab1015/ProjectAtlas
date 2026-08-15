/**
 * InventSmith Inventor Journey Engine
 *
 * The journey engine exposes the complete idea-to-market product journey.
 * The legacy stageProgress records remain supported for compatibility, while
 * operational readiness is derived from the canonical work ledger whenever a
 * stage has real work initialized.
 */

import { mutation, query, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { materiallyChanged, shouldRequeueWorkKind, staleReasonForField } from "./stalenessLogic";
import { CANONICAL_WORK_PLAN } from "./canonicalWorkPlan";
import { FULL_JOURNEY_STAGES } from "./fullJourneyDefinition";
import { POST_CANONICAL_WORK_PLAN } from "./fullProductWorkPlan";

interface StageConfigEntry {
  id: number;
  name: string;
  enabled: boolean;
  requiredTier: "free" | "pro";
  completionCriteria: string[];
  nextAction: string;
  comingSoon: boolean;
}

const legacyCriteria: Record<number, string[]> = {
  1: ["title", "problemStatement", "targetAudience", "solutionDescription"],
  2: ["validationMethod", "targetMarketSize", "competitorAnalysis"],
  3: ["marketSegment", "customerPersona", "pricePoint"],
  4: ["priorArtSearch", "patentabilityAssessment", "inventionDisclosure"],
};

const stageNextActions: Record<number, string> = {
  1: "Describe the invention, problem, intended user, and proposed solution.",
  2: "Let InventSmith validate assumptions, demand, evidence quality, and feasibility.",
  3: "Let InventSmith research customers, competitors, alternatives, and market evidence.",
  4: "Let Patent Readiness research prior art and hand differentiation constraints to Product Design.",
  5: "Let Product Design turn the evidence into candidate designs, selected architecture, CAD, drawings, and engineering review artifacts.",
  6: "Build and test the smallest useful prototype; upload physical-test evidence when InventSmith asks for it.",
  7: "Prepare factory requirements, source manufacturers, assemble RFQs, compare quotes, and verify production readiness.",
  8: "Develop the product name, positioning, identity, messaging, and brand-production brief.",
  9: "Prepare IP strategy, invention disclosure, NDAs, contracts, status tracking, and qualified legal handoffs.",
  10: "Build pricing evidence, unit economics, margin, break-even, and price-validation plans.",
  11: "Build the go-to-market strategy, messaging, channels, assets, and pre-launch calendar.",
  12: "Build the sales channels, toolkit, funnel, projections, and post-purchase experience.",
  13: "Build the financial model, funding strategy, pitch deck, investor FAQ, and investor-ready package.",
  14: "Run launch readiness, launch playbook, feedback loops, and launch-performance analysis.",
  15: "Measure post-launch evidence and run the growth, retention, and optimization system.",
};

export const stageConfig: StageConfigEntry[] = FULL_JOURNEY_STAGES.map((stage) => ({
  id: stage.id,
  name: stage.name,
  enabled: true,
  requiredTier: stage.id <= 4 ? "free" : "pro",
  completionCriteria: legacyCriteria[stage.id] ?? [],
  nextAction: stageNextActions[stage.id] ?? `Continue ${stage.name}.`,
  comingSoon: false,
}));

function computeReadinessScore(completedFields: string[], criteria: string[]): number {
  if (criteria.length === 0) return 0;
  const completed = criteria.filter((criterion) => completedFields.includes(criterion)).length;
  return Math.round((completed / criteria.length) * 100);
}

type ReadinessState = "Not Ready" | "Getting There" | "Ready to Move Forward";

function scoreToReadinessState(score: number): ReadinessState {
  if (score >= 75) return "Ready to Move Forward";
  if (score >= 40) return "Getting There";
  return "Not Ready";
}

function workReadinessForStage(stageId: number, workItems: Array<{ kind: string; status: string }>) {
  const definition = FULL_JOURNEY_STAGES.find((stage) => stage.id === stageId);
  if (!definition || definition.requiredWorkKinds.length === 0) return null;
  const relevant = definition.requiredWorkKinds
    .map((kind) => workItems.find((item) => item.kind === kind))
    .filter(Boolean) as Array<{ kind: string; status: string }>;
  if (relevant.length === 0) return null;
  const complete = relevant.filter((item) => item.status === "completed").length;
  return {
    initialized: relevant.length,
    required: definition.requiredWorkKinds.length,
    completed: complete,
    score: Math.round((complete / definition.requiredWorkKinds.length) * 100),
    allComplete: relevant.length === definition.requiredWorkKinds.length && complete === definition.requiredWorkKinds.length,
  };
}

export const getInventionState = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) return null;

    const currentStageConfig = stageConfig.find((stage) => stage.id === invention.currentStageId);
    if (!currentStageConfig) return null;
    const [progress, workItems] = await Promise.all([
      ctx.db.query("stageProgress").withIndex("by_inventionId_stageId", (q) => q.eq("inventionId", inventionId).eq("stageId", invention.currentStageId)).first(),
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);

    const completedFields = progress?.completedFields ?? [];
    const ledgerReadiness = workReadinessForStage(invention.currentStageId, workItems);
    const legacyReadiness = computeReadinessScore(completedFields, currentStageConfig.completionCriteria);
    const readinessScore = ledgerReadiness?.score ?? legacyReadiness;

    return {
      invention,
      currentStage: currentStageConfig,
      stageConfig,
      readinessState: scoreToReadinessState(readinessScore),
      readinessScore,
      nextAction: currentStageConfig.nextAction,
      completedFields,
      operationalReadiness: ledgerReadiness,
    };
  },
});

export const getUserInventions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const inventions = await ctx.db.query("inventions").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    return await Promise.all(inventions.map(async (invention) => {
      const [progress, workItems] = await Promise.all([
        ctx.db.query("stageProgress").withIndex("by_inventionId_stageId", (q) => q.eq("inventionId", invention._id).eq("stageId", invention.currentStageId)).first(),
        ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect(),
      ]);
      const stage = stageConfig.find((item) => item.id === invention.currentStageId);
      const ledgerReadiness = workReadinessForStage(invention.currentStageId, workItems);
      const legacyReadiness = stage ? computeReadinessScore(progress?.completedFields ?? [], stage.completionCriteria) : 0;
      const readinessScore = ledgerReadiness?.score ?? legacyReadiness;
      return { ...invention, stageName: stage?.name ?? "Unknown", readinessState: scoreToReadinessState(readinessScore) };
    }));
  },
});

export const getActiveInvention = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("inventions").withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "active")).first() ?? null;
  },
});

export const createInvention = mutation({
  args: {
    title: v.string(),
    problemStatement: v.string(),
    targetAudience: v.string(),
    solutionDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();

    const inventionId = await ctx.db.insert("inventions", {
      userId,
      title: args.title,
      problemStatement: args.problemStatement,
      targetAudience: args.targetAudience,
      solutionDescription: args.solutionDescription,
      currentStageId: 1,
      createdAt: now,
      updatedAt: now,
      status: "active",
    });

    await ctx.db.insert("inventionRecords", {
      inventionId,
      userId,
      schemaVersion: 1,
      lifecycleStatus: "intake",
      riskClass: "standard",
      structuredBrief: {
        title: args.title,
        problemStatement: args.problemStatement,
        targetAudience: args.targetAudience,
        solutionDescription: args.solutionDescription,
      },
      createdAt: now,
      updatedAt: now,
    });

    for (const item of CANONICAL_WORK_PLAN) {
      const completed = item.initiallyCompleted === true;
      await ctx.db.insert("atlasWorkItems", {
        inventionId,
        kind: item.kind,
        title: item.title,
        status: completed ? "completed" : "queued",
        priority: item.priority,
        inputSnapshot: item.instructions ? { department: item.kind === "patent_design_handoff" ? "patent_readiness" : "canonical", instructions: item.instructions } : undefined,
        outputSummary: completed ? "InventSmith created the first structured record of the invention." : undefined,
        attemptCount: completed ? 1 : 0,
        maxAttempts: completed ? undefined : 3,
        estimatedCostUnits: item.estimatedCostUnits,
        deliverableKind: item.deliverableKind,
        dependsOnKinds: item.dependsOnKinds,
        createdAt: now,
        startedAt: completed ? now : undefined,
        completedAt: completed ? now : undefined,
        updatedAt: now,
      });
    }

    for (const item of POST_CANONICAL_WORK_PLAN) {
      await ctx.db.insert("atlasWorkItems", {
        inventionId,
        kind: item.kind,
        title: item.title,
        status: "queued",
        priority: item.priority,
        inputSnapshot: item.inputSnapshot,
        attemptCount: 0,
        maxAttempts: 3,
        estimatedCostUnits: item.estimatedCostUnits,
        deliverableKind: item.deliverableKind,
        dependsOnKinds: item.dependsOnKinds,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("atlasExecutionEvents", {
      inventionId,
      eventType: "work_queued",
      actorType: "system",
      summary: "InventSmith created the complete autonomous idea-to-market work plan, including Product Design/CAD and every downstream department.",
      metadata: {
        canonicalWorkCount: CANONICAL_WORK_PLAN.length,
        postCanonicalWorkCount: POST_CANONICAL_WORK_PLAN.length,
        totalWorkCount: CANONICAL_WORK_PLAN.length + POST_CANONICAL_WORK_PLAN.length,
        includesPatentDesignHandoff: true,
        includesNativeCad: POST_CANONICAL_WORK_PLAN.some((item) => item.kind === "native_cad_generation"),
      },
      createdAt: now,
    });

    await ctx.db.insert("stageProgress", {
      inventionId,
      stageId: 1,
      readinessScore: 100,
      completedFields: stageConfig[0].completionCriteria,
      completedAt: now,
      updatedAt: now,
    });

    return inventionId;
  },
});

export const updateStageProgress = mutation({
  args: { inventionId: v.id("inventions"), stageId: v.number(), field: v.string(), value: v.string() },
  handler: async (ctx, { inventionId, stageId, field, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new Error("Not found");
    const stage = stageConfig.find((item) => item.id === stageId);
    if (!stage) throw new Error("Invalid stage");
    const now = Date.now();
    const existing = await ctx.db.query("stageProgress").withIndex("by_inventionId_stageId", (q) => q.eq("inventionId", inventionId).eq("stageId", stageId)).first();
    const shouldMark = value.trim().length > 0;
    let completedFields = existing?.completedFields ? [...existing.completedFields] : [];
    if (shouldMark && !completedFields.includes(field)) completedFields.push(field);
    if (!shouldMark) completedFields = completedFields.filter((item) => item !== field);
    const readinessScore = computeReadinessScore(completedFields, stage.completionCriteria);
    if (existing) {
      await ctx.db.patch(existing._id, { completedFields, readinessScore, completedAt: readinessScore === 100 ? existing.completedAt ?? now : undefined, updatedAt: now });
    } else {
      await ctx.db.insert("stageProgress", { inventionId, stageId, readinessScore, completedFields, completedAt: readinessScore === 100 ? now : undefined, updatedAt: now });
    }
    await ctx.db.patch(inventionId, { updatedAt: now });
  },
});

export const updateInventionField = mutation({
  args: {
    inventionId: v.id("inventions"),
    field: v.union(v.literal("title"), v.literal("problemStatement"), v.literal("targetAudience"), v.literal("solutionDescription")),
    value: v.string(),
  },
  handler: async (ctx, { inventionId, field, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new Error("Not found");
    const previous = invention[field];
    const now = Date.now();
    await ctx.db.patch(inventionId, { [field]: value, updatedAt: now });
    if (!materiallyChanged(previous, value)) return;

    const record = await ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).unique();
    if (record) {
      const structuredBrief = record.structuredBrief && typeof record.structuredBrief === "object" ? record.structuredBrief as Record<string, unknown> : {};
      await ctx.db.patch(record._id, { structuredBrief: { ...structuredBrief, [field]: value }, updatedAt: now });
    }

    const reason = staleReasonForField(field);
    const [deliverables, findings, workItems] = await Promise.all([
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);
    for (const deliverable of deliverables) await ctx.db.patch(deliverable._id, { staleReason: reason, updatedAt: now });
    for (const finding of findings) if (finding.status !== "stale") await ctx.db.patch(finding._id, { status: "stale", updatedAt: now });
    for (const item of workItems) {
      if (!shouldRequeueWorkKind(item.kind) || item.status === "running") continue;
      await ctx.db.patch(item._id, { status: "queued", attemptCount: 0, completedAt: undefined, blockedReason: undefined, humanGateType: undefined, lastError: undefined, updatedAt: now });
    }
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId,
      eventType: "invention_changed",
      actorType: "inventor",
      summary: `${field} changed; downstream work was marked stale and queued for refresh.`,
      metadata: { field, staleDeliverables: deliverables.length, staleFindings: findings.length },
      createdAt: now,
    });
  },
});

export const advanceStage = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new Error("Not found");
    const currentStage = stageConfig.find((stage) => stage.id === invention.currentStageId);
    if (!currentStage) throw new Error("Invalid stage");

    const [progress, workItems] = await Promise.all([
      ctx.db.query("stageProgress").withIndex("by_inventionId_stageId", (q) => q.eq("inventionId", inventionId).eq("stageId", invention.currentStageId)).first(),
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);
    const ledgerReadiness = workReadinessForStage(invention.currentStageId, workItems);
    const legacyScore = computeReadinessScore(progress?.completedFields ?? [], currentStage.completionCriteria);
    const ready = ledgerReadiness ? ledgerReadiness.allComplete : legacyScore >= 75;
    if (!ready) throw new Error("Stage not complete enough to advance");

    const nextStage = stageConfig.find((stage) => stage.id > invention.currentStageId && stage.enabled);
    if (!nextStage) return null;
    const now = Date.now();
    await ctx.db.patch(inventionId, { currentStageId: nextStage.id, updatedAt: now });

    if (nextStage.id === 2) {
      await ctx.scheduler.runAfter(0, internal.validationResearchOrchestration.runValidationResearchOrchestration, { inventionId });
    }
    return nextStage.id;
  },
});

export const deleteInvention = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const invention = await ctx.db.get(inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    if (invention.userId !== userId) throw new ConvexError("Not authorized to delete this invention");

    const stageProgressRows = await ctx.db.query("stageProgress").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    for (const row of stageProgressRows) await ctx.db.delete(row._id);
    const conversationMessageRows = await ctx.db.query("conversationMessages").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    for (const row of conversationMessageRows) await ctx.db.delete(row._id);
    const conversationRows = await ctx.db.query("conversations").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    for (const row of conversationRows) await ctx.db.delete(row._id);
    const documentRows = await ctx.db.query("documents").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    for (const row of documentRows) await ctx.db.delete(row._id);
    const validationResearchRows = await ctx.db.query("validationResearch").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    for (const row of validationResearchRows) await ctx.db.delete(row._id);
    const notificationRows = await ctx.db.query("notifications").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
    for (const row of notificationRows) if (row.inventionId === inventionId) await ctx.db.delete(row._id);

    const generatedMediaRows = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    for (const row of generatedMediaRows) if (row.storageId) await ctx.storage.delete(row.storageId);
    const evidenceSourceRows = await ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    for (const row of evidenceSourceRows) {
      const storageId = row.metadata?.storageId;
      if (typeof storageId === "string") {
        try { await ctx.storage.delete(storageId as any); } catch { /* storage may already be absent */ }
      }
    }

    const canonicalRowGroups = await Promise.all([
      ctx.db.query("deliverableDependencies").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasExecutionEvents").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("inventionAssumptions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      Promise.resolve(evidenceSourceRows),
      ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
    ]);

    const reservedByDate = new Map<string, number>();
    for (const row of canonicalRowGroups[4]) {
      if (row.reservedCostUnits && row.reservationDateKey) reservedByDate.set(row.reservationDateKey, (reservedByDate.get(row.reservationDateKey) ?? 0) + row.reservedCostUnits);
    }
    for (const [dateKey, reservedUnits] of reservedByDate) {
      const usage = await ctx.db.query("atlasDailyUsage").withIndex("by_userId_dateKey", (q) => q.eq("userId", userId).eq("dateKey", dateKey)).unique();
      if (usage) await ctx.db.patch(usage._id, { reservedAutonomousCostUnits: Math.max(0, (usage.reservedAutonomousCostUnits ?? 0) - reservedUnits), updatedAt: Date.now() });
    }
    for (const rows of canonicalRowGroups) for (const row of rows) await ctx.db.delete(row._id);
    await ctx.db.delete(inventionId);
    return { success: true };
  },
});

export const getStageProgressForInvention = internalQuery({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => await ctx.db.query("stageProgress").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
});
