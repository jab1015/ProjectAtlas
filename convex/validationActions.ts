/**
 * Atlas Validation Research — Convex Actions
 *
 * Actions run in Node.js context and can perform async operations like
 * simulating research latency. They call internal mutations to write results.
 *
 * "use node" is required for actions that use Node.js APIs (setTimeout via
 * MockValidationResearchProvider's Promise delay).
 */
"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import {
  MockValidationResearchProvider,
  type InventionContext,
} from "./validation/researchProvider";

const provider = new MockValidationResearchProvider();

// ── triggerValidationResearchAction ─────────────────────────────────────────

/**
 * Internal action: runs the mock research provider and writes results.
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
    const context: InventionContext = {
      title: args.title,
      problemStatement: args.problemStatement,
      description: args.description,
    };

    try {
      const result = await provider.runResearch(
        context,
        args.inventionId,
        args.researchRunId,
        args.triggeredAt
      );

      await ctx.runMutation(internal.validationMutations.markResearchComplete, {
        researchRunDocId: args.researchRunDocId,
        completedAt: result.completedAt ?? Date.now(),
        sectionsJson: JSON.stringify(result.sections),
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
    const context: InventionContext = {
      title: args.title,
      problemStatement: args.problemStatement,
      description: args.description,
    };

    try {
      const updatedSection = await provider.runSingleSection(context, args.sectionId);

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
