/**
 * Atlas Validation Research — Stage 2 Orchestration Action
 *
 * Phase 1C-3: Journey Hook + Research Orchestration
 *
 * Architecture rules:
 *  - Provider independent: accepts any ValidationResearchProvider
 *  - UI independent: no React/Next.js imports
 *  - Journey Engine independent: called via scheduler from journeyEngine.ts
 *  - Each section is generated and persisted immediately — never batched
 *  - Section failures are isolated; remaining sections continue
 *  - Status flow: PENDING → IN_PROGRESS → COMPLETED (or FAILED if all fail)
 *
 * "use node" required because OpenAIValidationResearchProvider uses the OpenAI SDK.
 * Only the action is defined here; mutations live in validationResearchSessionMutations.ts
 * (Convex constraint: mutations cannot be defined in "use node" files).
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
  runValidationSections,
} from "./validationResearchOrchestrationRunner";

// ── Section order (canonical) ─────────────────────────────────────────────────

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

// ── Provider selection ────────────────────────────────────────────────────────
// Always use OpenAI — OPENAI_API_KEY is confirmed set on the Convex deployment.
// Provider is selected INSIDE the handler (not at module load time) so that
// process.env.OPENAI_API_KEY is read at call time — not at cold-start when the
// env var may not yet be visible to the module initialiser.
// Throws at runtime if the key is missing so failures are loud, not silent.

function selectProvider(): ValidationResearchProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[ValidationResearch] OPENAI_API_KEY is not set on this Convex deployment. " +
      "Set it with: npx convex env set OPENAI_API_KEY <key> --deployment first-lion-585"
    );
  }
  const provider = new OpenAIValidationResearchProvider(apiKey);
  console.log("[ValidationResearch] OpenAIValidationResearchProvider selected");
  return provider;
}

// ── Main orchestration action ─────────────────────────────────────────────────

/**
 * runValidationResearchOrchestration
 *
 * Called by the Stage 2 onStageEnter hook (via ctx.scheduler.runAfter(0, ...)).
 *
 * Steps:
 *  1. Call initValidationResearchSession to create / retrieve the research row.
 *  2. If existing (24h cache): no-op — valid research already present.
 *  3. If created: iterate through SECTION_ORDER, generate + immediately persist each section.
 *  4. Section failures are isolated — mark section FAILED, continue.
 *  5. Finalise: COMPLETED if any section succeeded, FAILED if all failed.
 */
export const runValidationResearchOrchestration = internalAction({
  args: {
    inventionId: v.id("inventions"),
  },
  handler: async (ctx, { inventionId }) => {
    let researchId: Id<"validationResearch"> | null = null;

    try {
      // Select provider at call time (not module-load time) so env vars are available
      const provider = selectProvider();

      console.log(`[Stage2] triggerValidationResearch invoked: inventionId=${inventionId}`);
      console.log(`[Orchestration] Starting validation research for inventionId=${inventionId} provider=${provider.getProviderName()}`);

      // Step 1: initialise session (idempotent 24h cache)
      const initResult = await ctx.runMutation(
        internal.validationResearchSessionMutations.initValidationResearchSession,
        { inventionId }
      );

      // Step 2: cache hit — reuse existing research
      if (initResult.status === "existing") {
        console.log(`[Orchestration] Cache hit — reusing existing research for inventionId=${inventionId}`);
        return;
      }

      ({ researchId } = initResult);
      const { inventionTitle, problemStatement, inventionDescription } = initResult;

      console.log(`[Orchestration] New research session created: researchId=${researchId}`);

      // Build InventionContext for the provider
      const inventionContext: InventionContext = {
        inventionId: inventionId as string,
        title: inventionTitle,
        problemStatement,
        inventionDescription,
      };

      // Step 3: transition to IN_PROGRESS
      const startTs = Date.now();
      await ctx.runMutation(
        internal.validationResearchSessionMutations.markValidationResearchInProgress,
        { researchId, updatedAt: startTs }
      );
      console.log(`[Orchestration] researchStatus -> IN_PROGRESS: researchId=${researchId}`);

      // Step 4: generate + persist each section independently
      const sectionSummary = await runValidationSections({
        sectionOrder: SECTION_ORDER,
        provider,
        inventionContext,
        now: Date.now,
        onError: (message, error) => {
          console.error(`[Orchestration] ${message}: researchId=${researchId}`, error);
        },
        persistCompletedSection: async ({
          sectionKey,
          sectionEntry,
          completedSectionCount,
          lastCompletedSection,
          overallStatus,
          updatedAt,
        }) => {
          await ctx.runMutation(
            internal.validationResearchSessionMutations.patchValidationSection,
            {
              researchId: researchId as Id<"validationResearch">,
              sectionKey,
              sectionEntry,
              completedSectionCount,
              lastCompletedSection,
              overallStatus,
              updatedAt,
            }
          );
          console.log(`[Orchestration] Section persisted: sectionKey=${sectionKey} completedCount=${completedSectionCount} researchId=${researchId}`);
        },
        persistFailedSection: async ({
          sectionKey,
          sectionEntry,
          completedSectionCount,
          lastCompletedSection,
          overallStatus,
          updatedAt,
        }) => {
          await ctx.runMutation(
            internal.validationResearchSessionMutations.patchValidationSection,
            {
              researchId: researchId as Id<"validationResearch">,
              sectionKey,
              sectionEntry,
              completedSectionCount,
              lastCompletedSection,
              overallStatus,
              updatedAt,
            }
          );
        },
      });

      // Step 5: finalise
      const finalTs = Date.now();

      console.log(
        `[Orchestration] Finalising: researchId=${researchId} status=${sectionSummary.finalResearchStatus} completed=${sectionSummary.completedCount} failed=${sectionSummary.failedCount}`
      );

      await ctx.runMutation(
        internal.validationResearchSessionMutations.finaliseValidationResearch,
        {
          researchId,
          overallStatus: sectionSummary.finalOverallStatus,
          completedAt: finalTs,
          researchStatus: sectionSummary.finalResearchStatus,
        }
      );
    } catch (err) {
      const error = getErrorMessage(err);
      console.error(`[Orchestration] Validation research failed for inventionId=${inventionId}:`, err);
      try {
        await ctx.runMutation(
          internal.validationResearchSessionMutations.recordValidationResearchFailure,
          {
            inventionId,
            researchId: researchId ?? undefined,
            error,
            failedAt: Date.now(),
          }
        );
      } catch (recordErr) {
        console.error(`[Orchestration] Failed to record validation failure for inventionId=${inventionId}:`, recordErr);
      }
      throw err;
    }
  },
});
