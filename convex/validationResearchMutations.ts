/**
 * InventSmith Validation Research — Phase 1B Mutations
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
 *   editValidationSection       — save founder edits without overwriting InventSmith content
 *   refreshValidationSection    — mark a section for re-generation (no content generation)
 */

import { mutation, type MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireInventionEditAccess } from "./organizations";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Kept under the legacy helper name for API/test compatibility, but access is
 * now organization-aware: authorized editors/managers may work on Validation.
 */
async function requireOwnedInvention(ctx: MutationCtx, inventionId: Id<"inventions">) {
  const { userId } = await requireInventionEditAccess(ctx, inventionId);
  return userId;
}

async function requireOwnedResearch(ctx: MutationCtx, researchId: Id<"validationResearch">) {
  const record = await ctx.db.get(researchId);
  if (!record) throw new ConvexError("RESEARCH_NOT_FOUND");
  const userId = await requireOwnedInvention(ctx, record.inventionId);
  return { record, userId };
}

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

export const triggerValidationResearch = mutation({
  args: {
    inventionId: v.id("inventions"),
    stageId: v.string(),
  },
  handler: async (
    ctx,
    { inventionId, stageId }
  ): Promise<{ status: "existing" | "created"; researchId: Id<"validationResearch"> }> => {
    await requireOwnedInvention(ctx, inventionId);
    const now = Date.now();

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

export const approveValidationSection = mutation({
  args: {
    researchId: v.id("validationResearch"),
    sectionKey: v.string(),
  },
  handler: async (ctx, { researchId, sectionKey }): Promise<SectionEntry> => {
    const { record, userId } = await requireOwnedResearch(ctx, researchId);

    const sections: SectionsMap = (record.sections as SectionsMap) ?? {};
    const section = sections[sectionKey];
    if (!section) throw new ConvexError("SECTION_NOT_FOUND");

    const updatedSection: SectionEntry = {
      ...section,
      approvalStatus: "approved",
      approvedAt: Date.now(),
      approvedBy: String(userId),
    };

    await ctx.db.patch(researchId, {
      sections: { ...sections, [sectionKey]: updatedSection },
    });
    return updatedSection;
  },
});

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
    const { record, userId } = await requireOwnedResearch(ctx, researchId);

    const sections: SectionsMap = (record.sections as SectionsMap) ?? {};
    const section = sections[sectionKey];
    if (!section) throw new ConvexError("SECTION_NOT_FOUND");

    const originalGeneratedContent =
      section.originalGeneratedContent !== undefined
        ? section.originalGeneratedContent
        : section.generatedContent;

    const updatedSection: SectionEntry = {
      ...section,
      originalGeneratedContent,
      currentFounderVersion: editedContent,
      lastEditedAt: Date.now(),
      lastEditedBy: String(userId),
      approvalStatus: "edited",
    };

    await ctx.db.patch(researchId, {
      sections: { ...sections, [sectionKey]: updatedSection },
    });
    return updatedSection;
  },
});

export const refreshValidationSection = mutation({
  args: {
    researchId: v.id("validationResearch"),
    sectionKey: v.string(),
  },
  handler: async (ctx, { researchId, sectionKey }): Promise<SectionEntry> => {
    const { record } = await requireOwnedResearch(ctx, researchId);

    const sections: SectionsMap = (record.sections as SectionsMap) ?? {};
    const section = sections[sectionKey];
    if (!section) throw new ConvexError("SECTION_NOT_FOUND");

    const now = Date.now();
    const updatedSection: SectionEntry = {
      ...section,
      sectionStatus: "REFRESH_REQUESTED",
      refreshRequestedAt: now,
    };

    await ctx.db.patch(researchId, {
      sections: { ...sections, [sectionKey]: updatedSection },
      researchStatus: "REFRESH_REQUESTED",
    });
    return updatedSection;
  },
});
