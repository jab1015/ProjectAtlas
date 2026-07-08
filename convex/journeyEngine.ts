/**
 * Atlas Inventor Journey Engine
 *
 * The Engine owns progress. The UI is purely presentational.
 * All 15 stages are defined here. Enabling stage 5+ = one config change.
 */

import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// ── Stage Configuration (single source of truth) ────────────────────────────

export const stageConfig = [
  {
    id: 1,
    name: "Idea Capture",
    enabled: true,
    requiredTier: "free",
    completionCriteria: ["title", "problemStatement", "targetAudience", "solutionDescription"],
    nextAction: "Describe your invention — what problem does it solve and who is it for?",
    comingSoon: false,
  },
  {
    id: 2,
    name: "Validation",
    enabled: true,
    requiredTier: "free",
    completionCriteria: ["validationMethod", "targetMarketSize", "competitorAnalysis"],
    nextAction: "Validate your idea — confirm there's a real market and real demand.",
    comingSoon: false,
  },
  {
    id: 3,
    name: "Market Research",
    enabled: true,
    requiredTier: "free",
    completionCriteria: ["marketSegment", "customerPersona", "pricePoint"],
    nextAction: "Define your market — who will buy this, and at what price?",
    comingSoon: false,
  },
  {
    id: 4,
    name: "Patent Research",
    enabled: true,
    requiredTier: "free",
    completionCriteria: ["priorArtSearch", "patentabilityAssessment", "inventionDisclosure"],
    nextAction: "Research patents — ensure your invention is novel and protectable.",
    comingSoon: false,
  },
  { id: 5, name: "Product Design", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 6, name: "Engineering", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 7, name: "Prototype", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 8, name: "Testing", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 9, name: "IP Protection", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 10, name: "Manufacturing", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 11, name: "Funding", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 12, name: "Branding", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 13, name: "Marketing", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 14, name: "Sales", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 15, name: "Growth", enabled: false, requiredTier: "pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
];

// ── Readiness Helpers ────────────────────────────────────────────────────────

function computeReadinessScore(completedFields: string[], criteria: string[]): number {
  if (criteria.length === 0) return 0;
  const completed = criteria.filter((c) => completedFields.includes(c)).length;
  return Math.round((completed / criteria.length) * 100);
}

type ReadinessState = "Not Ready" | "Getting There" | "Ready to Move Forward";

function scoreToReadinessState(score: number): ReadinessState {
  if (score >= 75) return "Ready to Move Forward";
  if (score >= 40) return "Getting There";
  return "Not Ready";
}

// ── Public Queries ───────────────────────────────────────────────────────────

/**
 * The primary UI query. Returns everything the dashboard and stage workspace
 * need to render. The UI does NOT compute anything from this — it's purely
 * presentational.
 */
export const getInventionState = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) return null;

    const currentStageConfig = stageConfig.find((s) => s.id === invention.currentStageId);
    if (!currentStageConfig) return null;

    // Fetch stage progress for current stage
    const progress = await ctx.db
      .query("stageProgress")
      .withIndex("by_inventionId_stageId", (q) =>
        q.eq("inventionId", inventionId).eq("stageId", invention.currentStageId)
      )
      .first();

    const completedFields = progress?.completedFields ?? [];
    const readinessScore = computeReadinessScore(completedFields, currentStageConfig.completionCriteria);
    const readinessState = scoreToReadinessState(readinessScore);

    return {
      invention,
      currentStage: currentStageConfig,
      stageConfig,
      readinessState,
      readinessScore, // internal — UI must not render this number
      nextAction: currentStageConfig.nextAction,
      completedFields,
    };
  },
});

/**
 * Returns a user's inventions list for /inventions page.
 */
export const getUserInventions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const inventions = await ctx.db
      .query("inventions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // For each invention, get its current stage progress
    const result = await Promise.all(
      inventions.map(async (invention) => {
        const progress = await ctx.db
          .query("stageProgress")
          .withIndex("by_inventionId_stageId", (q) =>
            q.eq("inventionId", invention._id).eq("stageId", invention.currentStageId)
          )
          .first();

        const stage = stageConfig.find((s) => s.id === invention.currentStageId);
        const completedFields = progress?.completedFields ?? [];
        const readinessScore = stage
          ? computeReadinessScore(completedFields, stage.completionCriteria)
          : 0;
        const readinessState = scoreToReadinessState(readinessScore);

        return {
          ...invention,
          stageName: stage?.name ?? "Unknown",
          readinessState,
        };
      })
    );

    return result;
  },
});

/**
 * Returns the user's active invention (first one), if any.
 * Used after sign-in to determine onboarding vs dashboard redirect.
 */
export const getActiveInvention = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const invention = await ctx.db
      .query("inventions")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    return invention ?? null;
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates a new invention from onboarding answers.
 * Stage 1 is automatically completed when all 4 fields are set.
 */
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

    // Stage 1 is complete: all 4 criteria fulfilled from onboarding
    const stage1Criteria = stageConfig[0].completionCriteria;
    await ctx.db.insert("stageProgress", {
      inventionId,
      stageId: 1,
      readinessScore: 100,
      completedFields: stage1Criteria,
      completedAt: now,
      updatedAt: now,
    });

    return inventionId;
  },
});

/**
 * Records a completed field in stage progress and recomputes readiness.
 * Called on blur from stage workspace fields.
 */
export const updateStageProgress = mutation({
  args: {
    inventionId: v.id("inventions"),
    stageId: v.number(),
    field: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { inventionId, stageId, field, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new Error("Not found");

    const stage = stageConfig.find((s) => s.id === stageId);
    if (!stage) throw new Error("Invalid stage");

    const now = Date.now();

    // Get or create progress record
    const existing = await ctx.db
      .query("stageProgress")
      .withIndex("by_inventionId_stageId", (q) =>
        q.eq("inventionId", inventionId).eq("stageId", stageId)
      )
      .first();

    // Only record field if value is non-empty
    const shouldMark = value.trim().length > 0;

    let completedFields: string[];

    if (existing) {
      completedFields = [...existing.completedFields];
      if (shouldMark && !completedFields.includes(field)) {
        completedFields.push(field);
      } else if (!shouldMark && completedFields.includes(field)) {
        completedFields = completedFields.filter((f) => f !== field);
      }

      const readinessScore = computeReadinessScore(completedFields, stage.completionCriteria);
      const isComplete = readinessScore === 100;

      await ctx.db.patch(existing._id, {
        completedFields,
        readinessScore,
        completedAt: isComplete ? (existing.completedAt ?? now) : undefined,
        updatedAt: now,
      });
    } else {
      completedFields = shouldMark ? [field] : [];
      const readinessScore = computeReadinessScore(completedFields, stage.completionCriteria);

      await ctx.db.insert("stageProgress", {
        inventionId,
        stageId,
        readinessScore,
        completedFields,
        completedAt: readinessScore === 100 ? now : undefined,
        updatedAt: now,
      });
    }

    // Update invention's updatedAt
    await ctx.db.patch(inventionId, { updatedAt: now });
  },
});

/**
 * Updates an invention field directly (used by Stage 1 inline edit).
 */
export const updateInventionField = mutation({
  args: {
    inventionId: v.id("inventions"),
    field: v.union(
      v.literal("title"),
      v.literal("problemStatement"),
      v.literal("targetAudience"),
      v.literal("solutionDescription")
    ),
    value: v.string(),
  },
  handler: async (ctx, { inventionId, field, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(inventionId, {
      [field]: value,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Advances the invention to the next enabled stage if current stage is complete.
 */
export const advanceStage = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new Error("Not found");

    const currentStage = stageConfig.find((s) => s.id === invention.currentStageId);
    if (!currentStage) throw new Error("Invalid stage");

    // Check if current stage is complete
    const progress = await ctx.db
      .query("stageProgress")
      .withIndex("by_inventionId_stageId", (q) =>
        q.eq("inventionId", inventionId).eq("stageId", invention.currentStageId)
      )
      .first();

    const completedFields = progress?.completedFields ?? [];
    const score = computeReadinessScore(completedFields, currentStage.completionCriteria);

    if (score < 75) throw new Error("Stage not complete enough to advance");

    // Find next enabled stage
    const nextStage = stageConfig.find(
      (s) => s.id > invention.currentStageId && s.enabled
    );

    if (!nextStage) return null; // Already at last enabled stage

    const now = Date.now();
    await ctx.db.patch(inventionId, {
      currentStageId: nextStage.id,
      updatedAt: now,
    });

    // ── onStageEnter hook ────────────────────────────────────────────────────
    // Stage 2 (Validation): automatically trigger research so the founder
    // arrives at the stage with generated content ready to review.
    // This is non-blocking — research runs in the background via an action.
    // Each section is generated and persisted independently (not batched).
    // Section failures are isolated; remaining sections continue.
    if (nextStage.id === 2) {
      console.log(`[Stage2] Stage 2 entered: inventionId=${inventionId}`);
      console.log(`[Stage2] onStageEnter executing: scheduling triggerValidationResearch for inventionId=${inventionId}`);
      await ctx.scheduler.runAfter(
        0,
        internal.validationResearchOrchestration.runValidationResearchOrchestration,
        { inventionId }
      );
      console.log(`[Stage2] onStageEnter executed: triggerValidationResearch scheduled for inventionId=${inventionId}`);
    }
    // Future stages: add additional onStageEnter hooks here.

    return nextStage.id;
  },
});

/**
 * Deletes an invention and all owned child records.
 * Only the owning user may call this mutation.
 * Cleans up: stageProgress, conversations, documents, validationResearch, notifications.
 */
export const deleteInvention = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    if (invention.userId !== userId) throw new ConvexError("Not authorized to delete this invention");

    // ── Delete owned child records ───────────────────────────────────────────

    // 1. stageProgress rows
    const stageProgressRows = await ctx.db
      .query("stageProgress")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .collect();
    for (const row of stageProgressRows) {
      await ctx.db.delete(row._id);
    }

    // 2. conversations rows
    const conversationRows = await ctx.db
      .query("conversations")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .collect();
    for (const row of conversationRows) {
      await ctx.db.delete(row._id);
    }

    // 3. documents rows
    const documentRows = await ctx.db
      .query("documents")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .collect();
    for (const row of documentRows) {
      await ctx.db.delete(row._id);
    }

    // 4. validationResearch rows
    const validationResearchRows = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .collect();
    for (const row of validationResearchRows) {
      await ctx.db.delete(row._id);
    }

    // 5. notifications referencing this invention
    const notificationRows = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const row of notificationRows) {
      if (row.inventionId === inventionId) {
        await ctx.db.delete(row._id);
      }
    }

    // ── Delete the invention itself ──────────────────────────────────────────
    await ctx.db.delete(inventionId);

    return { success: true };
  },
});

// ── Internal queries used by seed ───────────────────────────────────────────

export const getStageProgressForInvention = internalQuery({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    return ctx.db
      .query("stageProgress")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .collect();
  },
});
