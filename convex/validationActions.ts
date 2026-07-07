/**
 * Atlas Validation Research — Convex Actions
 *
 * Actions run in Node.js context and can perform async operations like
 * calling OpenAI. They call internal mutations to write results.
 *
 * "use node" is required for actions that use Node.js APIs (OpenAI SDK,
 * process.env).
 */
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { OpenAIValidationResearchProvider } from "./providers/OpenAIValidationResearchProvider";
import type { InventionContext as NewInventionContext, ValidationSectionKey } from "./validationResearchProvider";
import type { ValidationSection } from "./validation/researchProvider";
import { VALIDATION_SECTION_KEYS } from "./validationResearchTypes";

const openaiProvider = new OpenAIValidationResearchProvider();

const ALL_SECTION_KEYS = Object.values(VALIDATION_SECTION_KEYS) as ValidationSectionKey[];

// ── runValidationResearchAction ──────────────────────────────────────────────

/**
 * Internal action: runs the OpenAI research provider and writes results.
 * Called by the triggerValidationResearch mutation after creating the "running" row.
 */
export const runValidationResearchAction = internalAction({
  args: {
    inventionId: v.id("inventions"),
    researchRunDocId: v.id("validationResearch"),
    researchRunId: v.string(),
    triggeredAt: v.number(),
    title: v.string(),
    problemStatement: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const context: NewInventionContext = {
      inventionId: args.inventionId,
      title: args.title,
      problemStatement: args.problemStatement,
      inventionDescription: args.description,
    };

    try {
      const sections: ValidationSection[] = [];

      for (const sectionKey of ALL_SECTION_KEYS) {
        try {
          const result = await openaiProvider.generateSection(context, sectionKey);
          sections.push({
            sectionId: result.sectionKey,
            title: result.sectionKey,
            content: result.generatedContent,
            confidence: result.confidence,
            generatedAt: result.generatedAt,
            status: "generated",
          });
        } catch (sectionErr) {
          // Section failures are isolated — continue with remaining sections
          console.error(`[runValidationResearchAction] Section "${sectionKey}" failed:`, sectionErr);
          sections.push({
            sectionId: sectionKey,
            title: sectionKey,
            content: `Section generation failed: ${sectionErr instanceof Error ? sectionErr.message : String(sectionErr)}`,
            confidence: {
              score: 0,
              level: "very_low",
              evidenceSummary: "Section generation failed — no content available.",
              assumptions: [],
              missingInformation: ["Retry to generate content."],
            },
            generatedAt: Date.now(),
            status: "generated",
          });
        }
      }

      await ctx.runMutation(internal.validationMutations.markResearchComplete, {
        researchRunDocId: args.researchRunDocId,
        completedAt: Date.now(),
        sectionsJson: JSON.stringify(sections),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown research error";
      await ctx.runMutation(internal.validationMutations.markResearchFailed, {
        researchRunDocId: args.researchRunDocId,
        error: errorMessage,
      });
    }
  },
});

// ── refreshValidationSectionAction ──────────────────────────────────────────

/**
 * Internal action: re-runs research for a single section and patches the row.
 */
export const refreshValidationSectionAction = internalAction({
  args: {
    inventionId: v.id("inventions"),
    researchRunDocId: v.id("validationResearch"),
    sectionId: v.string(),
    title: v.string(),
    problemStatement: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const context: NewInventionContext = {
      inventionId: args.inventionId,
      title: args.title,
      problemStatement: args.problemStatement,
      inventionDescription: args.description,
    };

    try {
      const sectionKey = args.sectionId as ValidationSectionKey;
      const result = await openaiProvider.generateSection(context, sectionKey);

      const updatedSection: ValidationSection = {
        sectionId: result.sectionKey,
        title: result.sectionKey,
        content: result.generatedContent,
        confidence: result.confidence,
        generatedAt: result.generatedAt,
        status: "generated",
      };

      await ctx.runMutation(internal.validationMutations.patchResearchSection, {
        researchRunDocId: args.researchRunDocId,
        sectionId: args.sectionId,
        sectionJson: JSON.stringify(updatedSection),
      });
    } catch (err) {
      // Refresh failures are non-fatal — log but don't fail the row
      console.error("refreshValidationSectionAction failed:", err);
    }
  },
});
