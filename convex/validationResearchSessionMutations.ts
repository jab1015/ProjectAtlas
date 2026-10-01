/**
 * InventSmith Validation Research — Session Mutations
 *
 * Internal mutations manage the validation research session lifecycle while
 * public mutations enforce invention edit access before scheduling work.
 */

import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireInventionEditAccess } from "./organizations";

// Must match OpenAIValidationResearchProvider.VERSION. A version change prevents
// older confidence/research semantics from being silently reused by the 24h cache.
const PROVIDER_VERSION = "openai-gpt4o-context-only-1.3.0";

const VALIDATION_SECTION_KEYS = new Set([
  "validationPlan",
  "customerSegments",
  "competitorAnalysis",
  "marketSizing",
  "validationMethods",
  "timeline",
  "surveyQuestions",
  "landingPageDraft",
  "interviewQuestions",
  "riskAssessment",
  "recommendations",
]);

function sectionStatus(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const status = (value as Record<string, unknown>).sectionStatus;
  return typeof status === "string" ? status : undefined;
}

export const forceRegenerateValidation = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    await requireInventionEditAccess(ctx, inventionId);
    const now = Date.now();
    const existingRows = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .collect();

    for (const row of existingRows) {
      await ctx.db.patch(row._id, {
        researchStatus: "stale",
        overallStatus: "STALE",
        updatedAt: now,
      });
    }

    await ctx.scheduler.runAfter(
      0,
      internal.validationResearchOrchestration.runValidationResearchOrchestration,
      { inventionId }
    );

    return { queued: true };
  },
});

/**
 * Retry only failed sections in the latest validation row. Successful sections
 * are kept in place and remain the source of truth for the retry run.
 */
export const retryFailedValidationSections = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    await requireInventionEditAccess(ctx, inventionId);
    const latest = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();
    if (!latest) throw new Error("No validation research exists to retry");

    const sections = (latest.sections as Record<string, unknown> | undefined) ?? {};
    const failedSectionKeys = Object.entries(sections)
      .filter(([key, value]) => VALIDATION_SECTION_KEYS.has(key) && sectionStatus(value) === "FAILED")
      .map(([key]) => key);

    if (failedSectionKeys.length === 0) {
      return { queued: false, failedSectionCount: 0 };
    }

    const now = Date.now();
    await ctx.db.patch(latest._id, {
      researchStatus: "running",
      overallStatus: "IN_PROGRESS",
      error: undefined,
      completedAt: undefined,
      updatedAt: now,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.validationResearchOrchestration.retryFailedValidationResearchSections,
      { inventionId, researchId: latest._id }
    );

    return { queued: true, failedSectionCount: failedSectionKeys.length };
  },
});

export const initValidationResearchSession = internalMutation({
  args: { inventionId: v.id("inventions") },
  returns: v.union(
    v.object({ status: v.literal("existing"), researchId: v.id("validationResearch") }),
    v.object({
      status: v.literal("created"),
      researchId: v.id("validationResearch"),
      inventionTitle: v.string(),
      problemStatement: v.string(),
      inventionDescription: v.string(),
    })
  ),
  handler: async (ctx, { inventionId }) => {
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const invention = await ctx.db.get(inventionId);
    if (!invention) throw new Error("Invention not found");

    const existing = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId_status", (q) =>
        q.eq("inventionId", inventionId).eq("researchStatus", "completed")
      )
      .order("desc")
      .first();

    if (
      existing &&
      existing.completedAt !== undefined &&
      existing.completedAt >= now - TWENTY_FOUR_HOURS_MS &&
      existing.providerVersion === PROVIDER_VERSION
    ) {
      console.log(`[Stage2] Cached record reused: researchId=${existing._id} inventionId=${inventionId} completedAt=${existing.completedAt}`);
      return { status: "existing" as const, researchId: existing._id };
    }

    const researchId = await ctx.db.insert("validationResearch", {
      inventionId,
      stageId: "2",
      researchStatus: "pending",
      overallStatus: "PENDING",
      sections: {} as Record<string, unknown>,
      totalSectionCount: 11,
      completedSectionCount: 0,
      startedAt: now,
      updatedAt: now,
      providerVersion: PROVIDER_VERSION,
      researchVersion: 1,
    });

    return {
      status: "created" as const,
      researchId,
      inventionTitle: invention.title,
      problemStatement: invention.problemStatement ?? "",
      inventionDescription: invention.solutionDescription ?? "",
    };
  },
});

/** Prepare a failed-only retry and return the canonical context/counts. */
export const prepareValidationResearchRetry = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    researchId: v.id("validationResearch"),
  },
  handler: async (ctx, { inventionId, researchId }) => {
    const [invention, research] = await Promise.all([
      ctx.db.get(inventionId),
      ctx.db.get(researchId),
    ]);
    if (!invention) throw new Error("Invention not found");
    if (!research || research.inventionId !== inventionId) {
      throw new Error("Validation research not found for invention");
    }

    const sections = (research.sections as Record<string, unknown> | undefined) ?? {};
    const failedSectionKeys = Object.entries(sections)
      .filter(([key, value]) => VALIDATION_SECTION_KEYS.has(key) && sectionStatus(value) === "FAILED")
      .map(([key]) => key);
    const completedSectionCount = Object.entries(sections)
      .filter(([key, value]) => VALIDATION_SECTION_KEYS.has(key) && sectionStatus(value) === "COMPLETED")
      .length;

    await ctx.db.patch(researchId, {
      researchStatus: "running",
      overallStatus: "IN_PROGRESS",
      completedSectionCount,
      updatedAt: Date.now(),
    });

    return {
      failedSectionKeys,
      completedSectionCount,
      inventionTitle: invention.title,
      problemStatement: invention.problemStatement ?? "",
      inventionDescription: invention.solutionDescription ?? "",
    };
  },
});

export const patchValidationSection = internalMutation({
  args: {
    researchId: v.id("validationResearch"),
    sectionKey: v.string(),
    sectionEntry: v.any(),
    completedSectionCount: v.number(),
    lastCompletedSection: v.string(),
    overallStatus: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.researchId);
    if (!record) throw new Error(`Validation research row not found: ${args.researchId}`);
    const currentSections = (record.sections as Record<string, unknown>) ?? {};
    await ctx.db.patch(args.researchId, {
      sections: { ...currentSections, [args.sectionKey]: args.sectionEntry },
      completedSectionCount: args.completedSectionCount,
      lastCompletedSection: args.lastCompletedSection,
      overallStatus: args.overallStatus,
      updatedAt: args.updatedAt,
    });
  },
});

export const markValidationResearchInProgress = internalMutation({
  args: { researchId: v.id("validationResearch"), updatedAt: v.number() },
  handler: async (ctx, { researchId, updatedAt }) => {
    await ctx.db.patch(researchId, {
      overallStatus: "IN_PROGRESS",
      researchStatus: "running",
      updatedAt,
    });
  },
});

export const finaliseValidationResearch = internalMutation({
  args: {
    researchId: v.id("validationResearch"),
    overallStatus: v.string(),
    completedAt: v.number(),
    researchStatus: v.string(),
  },
  handler: async (ctx, { researchId, overallStatus, completedAt, researchStatus }) => {
    await ctx.db.patch(researchId, {
      overallStatus,
      researchStatus,
      completedAt,
      updatedAt: completedAt,
    });
  },
});

export const recordValidationResearchFailure = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    researchId: v.optional(v.id("validationResearch")),
    error: v.string(),
    failedAt: v.number(),
  },
  handler: async (ctx, { inventionId, researchId, error, failedAt }) => {
    if (researchId) {
      await ctx.db.patch(researchId, {
        researchStatus: "failed",
        overallStatus: "FAILED",
        error,
        completedAt: failedAt,
        updatedAt: failedAt,
      });
      return researchId;
    }

    const invention = await ctx.db.get(inventionId);
    if (!invention) throw new Error(`Invention not found while recording validation failure: ${inventionId}`);

    return await ctx.db.insert("validationResearch", {
      inventionId,
      stageId: "2",
      researchStatus: "failed",
      overallStatus: "FAILED",
      sections: {} as Record<string, unknown>,
      totalSectionCount: 11,
      completedSectionCount: 0,
      startedAt: failedAt,
      completedAt: failedAt,
      updatedAt: failedAt,
      providerVersion: PROVIDER_VERSION,
      researchVersion: 1,
      error,
    });
  },
});
