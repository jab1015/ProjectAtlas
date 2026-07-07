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
import { OpenAIValidationResearchProvider } from "./openaiValidationResearchProvider";
import type { InventionContext, ValidationSectionKey } from "./validationResearchProvider";
import { VALIDATION_SECTION_KEYS } from "./validationResearchTypes";

// Provider selection at call time so process.env is read after Convex injects env vars.
// Throws loudly if OPENAI_API_KEY is missing so failures are never silent.
function selectProvider(): OpenAIValidationResearchProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[validationActions] OPENAI_API_KEY is not set on this Convex deployment. " +
      "Set it with: npx convex env set OPENAI_API_KEY <key> --deployment first-lion-585"
    );
  }
  return new OpenAIValidationResearchProvider(apiKey);
}

const ALL_SECTION_KEYS = Object.values(VALIDATION_SECTION_KEYS) as ValidationSectionKey[];

// ── runValidationResearchAction ──────────────────────────────────────────────

/**
 * Internal action: runs the OpenAI research provider section-by-section and writes results.
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
    // Select provider at call time (not module-load time) so env vars are available
    const provider = selectProvider();
    console.log(`[runValidationResearchAction] provider=${provider.getProviderName()} inventionId=${args.inventionId}`);

    const context: InventionContext = {
      inventionId: args.inventionId,
      title: args.title,
      problemStatement: args.problemStatement,
      inventionDescription: args.description,
    };

    try {
      const now = Date.now();
      const sectionsMap: Record<string, unknown> = {};

      for (const sectionKey of ALL_SECTION_KEYS) {
        try {
          const result = await provider.generateSection(context, sectionKey);
          sectionsMap[sectionKey] = {
            sectionKey: result.sectionKey,
            title: sectionKey,
            generatedContent: result.generatedContent,
            confidence: result.confidence,
            evidenceSummary: result.evidenceSummary,
            assumptions: result.assumptions,
            missingInformation: result.missingInformation,
            approvalStatus: "pending",
            sectionStatus: "COMPLETED",
            lastGeneratedAt: result.generatedAt,
            providerVersion: result.providerVersion,
          };
        } catch (sectionErr) {
          // Section failures are isolated — continue with remaining sections
          console.error(`[runValidationResearchAction] Section "${sectionKey}" failed:`, sectionErr);
          sectionsMap[sectionKey] = {
            sectionKey,
            approvalStatus: "pending",
            sectionStatus: "FAILED",
            lastGeneratedAt: now,
            error: sectionErr instanceof Error ? sectionErr.message : "Section generation failed",
          };
        }
      }

      await ctx.runMutation(internal.validationMutations.markResearchComplete, {
        researchRunDocId: args.researchRunDocId,
        completedAt: Date.now(),
        sectionsJson: JSON.stringify(sectionsMap),
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
    // Select provider at call time (not module-load time) so env vars are available
    const provider = selectProvider();

    const context: InventionContext = {
      inventionId: args.inventionId,
      title: args.title,
      problemStatement: args.problemStatement,
      inventionDescription: args.description,
    };

    try {
      const sectionKey = args.sectionId as ValidationSectionKey;
      const result = await provider.generateSection(context, sectionKey);

      const sectionEntry = {
        sectionKey: result.sectionKey,
        title: args.sectionId,
        generatedContent: result.generatedContent,
        confidence: result.confidence,
        evidenceSummary: result.evidenceSummary,
        assumptions: result.assumptions,
        missingInformation: result.missingInformation,
        approvalStatus: "pending",
        sectionStatus: "COMPLETED",
        lastGeneratedAt: result.generatedAt,
        providerVersion: result.providerVersion,
      };

      await ctx.runMutation(internal.validationMutations.patchResearchSection, {
        researchRunDocId: args.researchRunDocId,
        sectionId: args.sectionId,
        sectionJson: JSON.stringify(sectionEntry),
      });
    } catch (err) {
      // Refresh failures are non-fatal — log but don't fail the row
      console.error("refreshValidationSectionAction failed:", err);
    }
  },
});
