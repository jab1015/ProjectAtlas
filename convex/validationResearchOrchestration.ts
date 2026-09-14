/**
 * InventSmith Validation Research — Stage 2 Orchestration Action
 *
 * Each section is generated and persisted independently. Mixed outcomes settle
 * as PARTIAL and failed sections can be retried without regenerating successful
 * sections.
 */
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

import { OpenAIValidationResearchProvider } from "./openaiValidationResearchProvider";
import type {
  InventionContext,
  ValidationResearchProvider,
  ValidationSectionKey,
} from "./validationResearchProvider";
import { VALIDATION_SECTION_KEYS } from "./validationResearchTypes";
import {
  getErrorMessage,
  getFinalValidationResearchStatus,
  runValidationSections,
} from "./validationResearchOrchestrationRunner";

const SECTION_ORDER: ValidationSectionKey[] = [
  VALIDATION_SECTION_KEYS.VALIDATION_PLAN,
  VALIDATION_SECTION_KEYS.CUSTOMER_SEGMENTS,
  VALIDATION_SECTION_KEYS.COMPETITOR_ANALYSIS,
  VALIDATION_SECTION_KEYS.MARKET_SIZING,
  VALIDATION_SECTION_KEYS.VALIDATION_METHODS,
  VALIDATION_SECTION_KEYS.TIMELINE,
  VALIDATION_SECTION_KEYS.SURVEY_QUESTIONS,
  VALIDATION_SECTION_KEYS.LANDING_PAGE_DRAFT,
  VALIDATION_SECTION_KEYS.INTERVIEW_QUESTIONS,
  VALIDATION_SECTION_KEYS.RISK_ASSESSMENT,
  VALIDATION_SECTION_KEYS.RECOMMENDATIONS,
];

function selectProvider(): ValidationResearchProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[ValidationResearch] OPENAI_API_KEY is not set on this Convex deployment. " +
      "Configure it securely in the intended Convex deployment environment."
    );
  }
  return new OpenAIValidationResearchProvider(apiKey);
}

function buildContext(
  inventionId: Id<"inventions">,
  inventionTitle: string,
  problemStatement: string,
  inventionDescription: string
): InventionContext {
  return {
    inventionId: inventionId as string,
    title: inventionTitle,
    problemStatement,
    inventionDescription,
  };
}

async function persistSection(
  ctx: Parameters<Parameters<typeof internalAction>[0]["handler"]>[0],
  researchId: Id<"validationResearch">,
  args: {
    sectionKey: ValidationSectionKey;
    sectionEntry: Record<string, unknown>;
    completedSectionCount: number;
    lastCompletedSection: ValidationSectionKey;
    overallStatus: "IN_PROGRESS";
    updatedAt: number;
  }
) {
  await ctx.runMutation(internal.validationResearchSessionMutations.patchValidationSection, {
    researchId,
    sectionKey: args.sectionKey,
    sectionEntry: args.sectionEntry,
    completedSectionCount: args.completedSectionCount,
    lastCompletedSection: args.lastCompletedSection,
    overallStatus: args.overallStatus,
    updatedAt: args.updatedAt,
  });
}

export const runValidationResearchOrchestration = internalAction({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    let researchId: Id<"validationResearch"> | null = null;

    try {
      const provider = selectProvider();
      const initResult = await ctx.runMutation(
        internal.validationResearchSessionMutations.initValidationResearchSession,
        { inventionId }
      );

      if (initResult.status === "existing") return;

      ({ researchId } = initResult);
      const inventionContext = buildContext(
        inventionId,
        initResult.inventionTitle,
        initResult.problemStatement,
        initResult.inventionDescription
      );

      await ctx.runMutation(
        internal.validationResearchSessionMutations.markValidationResearchInProgress,
        { researchId, updatedAt: Date.now() }
      );

      const sectionSummary = await runValidationSections({
        sectionOrder: SECTION_ORDER,
        provider,
        inventionContext,
        now: Date.now,
        onError: (message, error) => {
          console.error(`[Orchestration] ${message}: researchId=${researchId}`, error);
        },
        persistCompletedSection: async (args) => {
          await persistSection(ctx, researchId as Id<"validationResearch">, args);
        },
        persistFailedSection: async (args) => {
          await persistSection(ctx, researchId as Id<"validationResearch">, args);
        },
      });

      const finalTs = Date.now();
      await ctx.runMutation(internal.validationResearchSessionMutations.finaliseValidationResearch, {
        researchId,
        overallStatus: sectionSummary.finalOverallStatus,
        completedAt: finalTs,
        researchStatus: sectionSummary.finalResearchStatus,
      });
    } catch (err) {
      const error = getErrorMessage(err);
      try {
        await ctx.runMutation(internal.validationResearchSessionMutations.recordValidationResearchFailure, {
          inventionId,
          researchId: researchId ?? undefined,
          error,
          failedAt: Date.now(),
        });
      } catch (recordErr) {
        console.error(`[Orchestration] Failed to record validation failure for inventionId=${inventionId}:`, recordErr);
      }
      throw err;
    }
  },
});

/**
 * Failed-only retry. The public mutation authorizes the caller and schedules
 * this internal action. The action re-reads the canonical row, retries only
 * current FAILED sections, and keeps successful section entries untouched.
 */
export const retryFailedValidationResearchSections = internalAction({
  args: {
    inventionId: v.id("inventions"),
    researchId: v.id("validationResearch"),
  },
  handler: async (ctx, { inventionId, researchId }) => {
    try {
      const provider = selectProvider();
      const prepared = await ctx.runMutation(
        internal.validationResearchSessionMutations.prepareValidationResearchRetry,
        { inventionId, researchId }
      );
      const failedSectionKeys = prepared.failedSectionKeys.filter(
        (key): key is ValidationSectionKey => SECTION_ORDER.includes(key as ValidationSectionKey)
      );

      if (failedSectionKeys.length === 0) {
        const final = getFinalValidationResearchStatus(prepared.completedSectionCount, 0);
        await ctx.runMutation(internal.validationResearchSessionMutations.finaliseValidationResearch, {
          researchId,
          overallStatus: final.finalOverallStatus,
          completedAt: Date.now(),
          researchStatus: final.finalResearchStatus,
        });
        return;
      }

      const inventionContext = buildContext(
        inventionId,
        prepared.inventionTitle,
        prepared.problemStatement,
        prepared.inventionDescription
      );
      const sectionSummary = await runValidationSections({
        sectionOrder: failedSectionKeys,
        provider,
        inventionContext,
        initialCompletedCount: prepared.completedSectionCount,
        now: Date.now,
        onError: (message, error) => {
          console.error(`[ValidationRetry] ${message}: researchId=${researchId}`, error);
        },
        persistCompletedSection: async (args) => {
          await persistSection(ctx, researchId, args);
        },
        persistFailedSection: async (args) => {
          await persistSection(ctx, researchId, args);
        },
      });

      await ctx.runMutation(internal.validationResearchSessionMutations.finaliseValidationResearch, {
        researchId,
        overallStatus: sectionSummary.finalOverallStatus,
        completedAt: Date.now(),
        researchStatus: sectionSummary.finalResearchStatus,
      });
    } catch (err) {
      await ctx.runMutation(internal.validationResearchSessionMutations.recordValidationResearchFailure, {
        inventionId,
        researchId,
        error: getErrorMessage(err),
        failedAt: Date.now(),
      });
      throw err;
    }
  },
});
