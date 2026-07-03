/**
 * Atlas Validation Research — Convex Mutations & Queries
 *
 * Mutations:
 *   triggerValidationResearch  — create a research run (idempotent within 24h)
 *   approveValidationSection   — mark a section approved
 *   editValidationSection      — save founder edits to a section
 *   refreshValidationSection   — re-run a single section
 *
 * Internal mutations (called by validationActions.ts):
 *   markResearchComplete
 *   markResearchFailed
 *   patchResearchSection
 *
 * Query:
 *   getValidationResearch      — fetch most recent research row for an invention
 */

import {
  mutation,
  query,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { ValidationSection } from "./validation/researchProvider";

// ── Helper: 24h window check ─────────────────────────────────────────────────

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// ── triggerValidationResearch ────────────────────────────────────────────────

export const triggerValidationResearch = mutation({
  args: {
    inventionId: v.id("inventions"),
  },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Ownership check
    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) {
      throw new Error("Invention not found or access denied");
    }

    const now = Date.now();

    // Idempotency: if a complete run exists within the last 24 hours, return it
    const existingRun = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();

    if (
      existingRun &&
      existingRun.status === "complete" &&
      (existingRun.triggeredAt ?? 0) >= now - TWENTY_FOUR_HOURS_MS
    ) {
      return { researchRunDocId: existingRun._id, alreadyComplete: true };
    }

    // Build InventionContext from Stage 1 fields
    const title = invention.title;
    const problemStatement = invention.problemStatement ?? "";
    const description = invention.solutionDescription ?? "";

    // Generate a unique run ID
    const researchRunId = `run_${now}_${Math.random().toString(36).slice(2, 10)}`;

    // Create the "running" row
    const researchRunDocId = await ctx.db.insert("validationResearch", {
      inventionId,
      researchRunId,
      triggeredAt: now,
      status: "running",
    });

    // Kick off the async research action (non-blocking)
    await ctx.scheduler.runAfter(0, internal.validationActions.runValidationResearchAction, {
      inventionId,
      researchRunDocId,
      researchRunId,
      triggeredAt: now,
      title,
      problemStatement,
      description,
    });

    return { researchRunDocId, alreadyComplete: false };
  },
});

// ── approveValidationSection ─────────────────────────────────────────────────

export const approveValidationSection = mutation({
  args: {
    inventionId: v.id("inventions"),
    sectionId: v.string(),
  },
  handler: async (ctx, { inventionId, sectionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) {
      throw new Error("Invention not found or access denied");
    }

    const researchRow = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();

    if (!researchRow || !researchRow.sectionsJson) {
      throw new Error("No completed research found for this invention");
    }

    const sections: ValidationSection[] = JSON.parse(researchRow.sectionsJson);
    const now = Date.now();

    const updated = sections.map((s) =>
      s.sectionId === sectionId
        ? { ...s, status: "approved" as const, approvedAt: now }
        : s
    );

    const targetSection = sections.find((s) => s.sectionId === sectionId);
    if (!targetSection) {
      throw new Error(`Section "${sectionId}" not found`);
    }

    await ctx.db.patch(researchRow._id, {
      sectionsJson: JSON.stringify(updated),
    });

    return { approved: true, sectionId, approvedAt: now };
  },
});

// ── editValidationSection ─────────────────────────────────────────────────────

export const editValidationSection = mutation({
  args: {
    inventionId: v.id("inventions"),
    sectionId: v.string(),
    editedContent: v.string(),
  },
  handler: async (ctx, { inventionId, sectionId, editedContent }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) {
      throw new Error("Invention not found or access denied");
    }

    const researchRow = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();

    if (!researchRow || !researchRow.sectionsJson) {
      throw new Error("No completed research found for this invention");
    }

    const sections: ValidationSection[] = JSON.parse(researchRow.sectionsJson);
    const now = Date.now();

    const targetSection = sections.find((s) => s.sectionId === sectionId);
    if (!targetSection) {
      throw new Error(`Section "${sectionId}" not found`);
    }

    const updated = sections.map((s) =>
      s.sectionId === sectionId
        ? {
            ...s,
            editedContent,
            editedAt: now,
            status: "edited" as const,
          }
        : s
    );

    await ctx.db.patch(researchRow._id, {
      sectionsJson: JSON.stringify(updated),
    });

    return { edited: true, sectionId, editedAt: now };
  },
});

// ── refreshValidationSection ─────────────────────────────────────────────────

export const refreshValidationSection = mutation({
  args: {
    inventionId: v.id("inventions"),
    sectionId: v.string(),
  },
  handler: async (ctx, { inventionId, sectionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) {
      throw new Error("Invention not found or access denied");
    }

    const researchRow = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();

    if (!researchRow || !researchRow.sectionsJson) {
      throw new Error("No completed research found for this invention");
    }

    const title = invention.title;
    const problemStatement = invention.problemStatement ?? "";
    const description = invention.solutionDescription ?? "";

    // Kick off single-section refresh (non-blocking)
    await ctx.scheduler.runAfter(0, internal.validationActions.refreshValidationSectionAction, {
      inventionId,
      researchRunDocId: researchRow._id,
      sectionId,
      title,
      problemStatement,
      description,
    });

    return { refreshQueued: true, sectionId };
  },
});

// ── getValidationResearch ─────────────────────────────────────────────────────

export const getValidationResearch = query({
  args: {
    inventionId: v.id("inventions"),
  },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) return null;

    const row = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();

    if (!row) return null;

    // ── Normalise status ──────────────────────────────────────────────────────
    // The orchestration path (runValidationResearchOrchestration) writes to
    // `researchStatus` ("pending"|"running"|"completed"|"failed") and the new
    // `sections` object map.
    // The legacy path (triggerValidationResearch → runValidationResearchAction)
    // writes to `status` ("running"|"complete"|"failed") and `sectionsJson`.
    // Map both to a single normalised status the UI can consume.

    type NormalisedStatus = "running" | "complete" | "failed" | undefined;

    let normalisedStatus: NormalisedStatus;

    if (row.researchStatus) {
      // New orchestration path
      if (row.researchStatus === "completed") {
        normalisedStatus = "complete";
      } else if (row.researchStatus === "running" || row.researchStatus === "pending") {
        normalisedStatus = "running";
      } else if (row.researchStatus === "failed") {
        normalisedStatus = "failed";
      }
    } else if (row.status) {
      // Legacy path — pass through unchanged
      normalisedStatus = row.status as NormalisedStatus;
    }

    // ── Normalise sections ────────────────────────────────────────────────────
    // The new path stores sections as a keyed object map in `row.sections`.
    // The legacy path stores an array as JSON in `row.sectionsJson`.
    // Convert either to the ValidationSection[] array the UI expects.

    let sections: ValidationSection[] = [];

    if (row.sectionsJson) {
      // Legacy path: JSON string of ValidationSection[]
      try {
        sections = JSON.parse(row.sectionsJson) as ValidationSection[];
      } catch (e) {
        console.error("getValidationResearch: failed to parse sectionsJson", e);
      }
    } else if (row.sections && typeof row.sections === "object" && !Array.isArray(row.sections)) {
      // New orchestration path: keyed object map — convert to array
      const sectionsMap = row.sections as Record<string, unknown>;
      sections = Object.values(sectionsMap)
        .filter(Boolean)
        .map((entry) => {
          // entry shape from patchValidationSection / validationResearchOrchestration:
          // { sectionKey, title, generatedContent, confidence, evidenceSummary,
          //   assumptions, missingInformation, approvalStatus, sectionStatus,
          //   lastGeneratedAt, providerVersion }
          const s = entry as Record<string, unknown>;
          return {
            sectionId: (s.sectionKey as string) ?? "",
            title: (s.title as string) ?? (s.sectionKey as string) ?? "",
            content: typeof s.generatedContent === "string"
              ? s.generatedContent
              : JSON.stringify(s.generatedContent ?? ""),
            status: s.sectionStatus === "COMPLETED"
              ? "generated"
              : s.sectionStatus === "FAILED"
              ? "generated" // still show what we have; failed sections have no content
              : "pending",
            confidence: s.confidence
              ? {
                  score: (s.confidence as { score: number }).score ?? 0,
                  level: (s.confidence as { level: string }).level ?? "low",
                  evidenceSummary: (s.evidenceSummary as string) ?? (s.confidence as { evidenceSummary?: string }).evidenceSummary ?? "",
                  assumptions: (s.assumptions as string[]) ?? [],
                  missingInformation: (s.missingInformation as string[]) ?? [],
                }
              : undefined,
            generatedAt: (s.lastGeneratedAt as number) ?? Date.now(),
          } as ValidationSection;
        });
    }

    return {
      _id: row._id,
      inventionId: row.inventionId,
      researchRunId: row.researchRunId,
      triggeredAt: row.triggeredAt ?? row.startedAt,
      completedAt: row.completedAt,
      status: normalisedStatus,
      sections,
      error: row.error,
    };
  },
});

// ── triggerValidationResearchInternal ───────────────────────────────────────
// Called by the Journey Engine's onStageEnter hook (no auth — trusted internal)

export const triggerValidationResearchInternal = internalMutation({
  args: {
    inventionId: v.id("inventions"),
  },
  handler: async (ctx, { inventionId }) => {
    const invention = await ctx.db.get(inventionId);
    if (!invention) return; // Silently skip if invention is gone

    const now = Date.now();

    // Idempotency: skip if a complete run exists within the last 24 hours
    const existingRun = await ctx.db
      .query("validationResearch")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .order("desc")
      .first();

    if (
      existingRun &&
      existingRun.status === "complete" &&
      (existingRun.triggeredAt ?? 0) >= now - TWENTY_FOUR_HOURS_MS
    ) {
      return; // Already have fresh results — don't re-run
    }

    const title = invention.title;
    const problemStatement = invention.problemStatement ?? "";
    const description = invention.solutionDescription ?? "";

    const researchRunId = `run_${now}_${Math.random().toString(36).slice(2, 10)}`;

    const researchRunDocId = await ctx.db.insert("validationResearch", {
      inventionId,
      researchRunId,
      triggeredAt: now,
      status: "running",
    });

    await ctx.scheduler.runAfter(0, internal.validationActions.runValidationResearchAction, {
      inventionId,
      researchRunDocId,
      researchRunId,
      triggeredAt: now,
      title,
      problemStatement,
      description,
    });
  },
});

// ── Internal mutations (called by validationActions.ts) ─────────────────────

export const markResearchComplete = internalMutation({
  args: {
    researchRunDocId: v.id("validationResearch"),
    completedAt: v.number(),
    sectionsJson: v.string(),
  },
  handler: async (ctx, { researchRunDocId, completedAt, sectionsJson }) => {
    await ctx.db.patch(researchRunDocId, {
      status: "complete",
      completedAt,
      sectionsJson,
    });
  },
});

export const markResearchFailed = internalMutation({
  args: {
    researchRunDocId: v.id("validationResearch"),
    error: v.string(),
  },
  handler: async (ctx, { researchRunDocId, error }) => {
    await ctx.db.patch(researchRunDocId, {
      status: "failed",
      error,
    });
  },
});

export const patchResearchSection = internalMutation({
  args: {
    researchRunDocId: v.id("validationResearch"),
    sectionId: v.string(),
    sectionJson: v.string(),
  },
  handler: async (ctx, { researchRunDocId, sectionId, sectionJson }) => {
    const row = await ctx.db.get(researchRunDocId);
    if (!row || !row.sectionsJson) return;

    const sections: ValidationSection[] = JSON.parse(row.sectionsJson);
    const updatedSection: ValidationSection = JSON.parse(sectionJson);

    // Reset status to "generated" for refreshed section
    updatedSection.status = "generated";

    const updated = sections.map((s) =>
      s.sectionId === sectionId ? updatedSection : s
    );

    await ctx.db.patch(researchRunDocId, {
      sectionsJson: JSON.stringify(updated),
    });
  },
});
