/**
 * Atlas Validation Research — Phase 1B Mutations
 *
 * Mutation layer for Stage 2 Validation Automation.
 *
 * Architecture rules (see ATLAS_AUTOMATION_CONSTITUTION.md):
 *   - Provider independent: no research generation, no mock data
 *   - UI independent: no React/Next.js imports
 *   - Journey Engine independent: do not touch journeyEngine.ts
 *   - Sections map is Record<sectionKey, SectionEntry> — any VALIDATION_SECTION_KEYS key
 *     is accepted without future mutation changes
 *
 * Mutations:
 *   triggerValidationResearch   — create or retrieve a research session (idempotent 24h)
 *   approveValidationSection    — mark a section APPROVED
 *   editValidationSection       — save founder edits without overwriting Atlas content
 *   refreshValidationSection    — mark a section for re-generation (no content generation)
 */

import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

// ── Constants ────────────────────────────────────────────────────────────────

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// ── Section entry type (in-memory only — not imported from types to keep runtime clean) ──

interface SectionEntry {
  sectionKey: string;
  title?: string;
  generatedContent?: unknown;
  originalGeneratedContent?: unknown;
  currentFounderVersion?: string;
  confidence?: unknown;
  approvalStatus: string;
  sectionStatus?: string;
  founderEdits?: unknown;
  lastGeneratedAt?: number;
  approvedAt?: number;
  approvedBy?: string;
  lastEditedAt?: number;
  lastEditedBy?: string;
  refreshRequestedAt?: number;
}

interface SectionsMap {
  [sectionKey: string]: SectionEntry;
}

// ── MUTATION 1: triggerValidationResearch ────────────────────────────────────

/**
 * Create or retrieve a validation research session.
 *
 * Idempotent: if a COMPLETED record exists within the last 24 hours, return it.
 * Otherwise insert a new PENDING row with empty sections map.
 *
 * Does NOT call any research provider. Does NOT generate content.
 */
export const triggerValidationResearch = mutation({
  args: {
    inventionId: v.id("inventions"),
    stageId: v.string(),
  },
  handler: async (
    ctx,
    { inventionId, stageId }
  ): Promise<{ status: "existing" | "created"; researchId: Id<"validationResearch"> }> => {
    const now = Date.now();

    // Check for a completed record within the last 24 hours
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
      existing.completedAt >= now - TWENTY_FOUR_HOURS_MS
    ) {
      return { status: "existing", researchId: existing._id };
    }

    // Insert a new PENDING research row
    const researchId = await ctx.db.insert("validationResearch", {
      inventionId,
      stageId,
      researchStatus: "pending",
      sections: {} satisfies SectionsMap,
      startedAt: now,
      providerVersion: "1.0",
      researchVersion: 1,
    });

    return { status: "created", researchId };
  },
});

// ── MUTATION 2: approveValidationSection ─────────────────────────────────────

/**
 * Mark a generated validation section as APPROVED.
 * Records approvedAt timestamp and approvedBy (user ID or "system").
 */
export const approveValidationSection = mutation({
  args: {
    researchId: v.id("validationResearch"),
    sectionKey: v.string(),
  },
  handler: async (ctx, { researchId, sectionKey }): Promise<SectionEntry> => {
    const record = await ctx.db.get(researchId);
    if (!record) {
      throw new ConvexError("RESEARCH_NOT_FOUND");
    }

    const sections: SectionsMap = (record.sections as SectionsMap) ?? {};
    const section = sections[sectionKey];
    if (!section) {
      throw new ConvexError("SECTION_NOT_FOUND");
    }

    const userId = await getAuthUserId(ctx);
    const approvedBy: string = userId ?? "system";
    const now = Date.now();

    const updatedSection: SectionEntry = {
      ...section,
      approvalStatus: "approved",
      approvedAt: now,
      approvedBy,
    };

    const updatedSections: SectionsMap = {
      ...sections,
      [sectionKey]: updatedSection,
    };

    await ctx.db.patch(researchId, { sections: updatedSections });

    return updatedSection;
  },
});

// ── MUTATION 3: editValidationSection ────────────────────────────────────────

/**
 * Save founder edits to a validation section.
 *
 * NEVER overwrites Atlas-generated content (generatedContent is immutable).
 * On first edit: copies generatedContent → originalGeneratedContent.
 * Sets currentFounderVersion to the edited content.
 */
export const editValidationSection = mutation({
  args: {
    researchId: v.id("validationResearch"),
    sectionKey: v.string(),
    editedContent: v.string(),
  },
  handler: async (
    ctx,
    { researchId, sectionKey, editedContent }
  ): Promise<SectionEntry> => {
    const record = await ctx.db.get(researchId);
    if (!record) {
      throw new ConvexError("RESEARCH_NOT_FOUND");
    }

    const sections: SectionsMap = (record.sections as SectionsMap) ?? {};
    const section = sections[sectionKey];
    if (!section) {
      throw new ConvexError("SECTION_NOT_FOUND");
    }

    const userId = await getAuthUserId(ctx);
    const lastEditedBy: string = userId ?? "system";
    const now = Date.now();

    // Preserve Atlas-generated content on first edit
    const originalGeneratedContent =
      section.originalGeneratedContent !== undefined
        ? section.originalGeneratedContent
        : section.generatedContent;

    const updatedSection: SectionEntry = {
      ...section,
      // generatedContent is intentionally NOT changed
      originalGeneratedContent,
      currentFounderVersion: editedContent,
      lastEditedAt: now,
      lastEditedBy,
      approvalStatus: "edited",
    };

    const updatedSections: SectionsMap = {
      ...sections,
      [sectionKey]: updatedSection,
    };

    await ctx.db.patch(researchId, { sections: updatedSections });

    return updatedSection;
  },
});

// ── MUTATION 4: refreshValidationSection ────────────────────────────────────

/**
 * Request regeneration of a single validation section.
 *
 * Marks the section sectionStatus = "REFRESH_REQUESTED" and sets the
 * top-level researchStatus = "REFRESH_REQUESTED" so a future provider
 * action can pick it up. Does NOT regenerate content.
 */
export const refreshValidationSection = mutation({
  args: {
    researchId: v.id("validationResearch"),
    sectionKey: v.string(),
  },
  handler: async (ctx, { researchId, sectionKey }): Promise<SectionEntry> => {
    const record = await ctx.db.get(researchId);
    if (!record) {
      throw new ConvexError("RESEARCH_NOT_FOUND");
    }

    const sections: SectionsMap = (record.sections as SectionsMap) ?? {};
    const section = sections[sectionKey];
    if (!section) {
      throw new ConvexError("SECTION_NOT_FOUND");
    }

    const now = Date.now();

    const updatedSection: SectionEntry = {
      ...section,
      sectionStatus: "REFRESH_REQUESTED",
      refreshRequestedAt: now,
    };

    const updatedSections: SectionsMap = {
      ...sections,
      [sectionKey]: updatedSection,
    };

    await ctx.db.patch(researchId, {
      sections: updatedSections,
      researchStatus: "REFRESH_REQUESTED",
    });

    return updatedSection;
  },
});
