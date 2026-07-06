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
 * "use node" required because MockValidationResearchProvider uses setTimeout.
 * Only the action is defined here; mutations live in validationResearchSessionMutations.ts
 * (Convex constraint: mutations cannot be defined in "use node" files).
 */
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

import { OpenAIValidationResearchProvider } from "./openaiValidationResearchProvider";
import type {
  InventionContext,
  ValidationResearchProvider,
  ValidationSectionKey,
} from "./validationResearchProvider";
import { VALIDATION_SECTION_KEYS } from "./validationResearchTypes";

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
    console.log(`[Stage2] triggerValidationResearch invoked: inventionId=${inventionId}`);
    console.log(`[Orchestration] Starting validation research for inventionId=${inventionId}`);

    // Select provider at runtime so OPENAI_API_KEY is read from live env
    const provider = selectProvider();
    console.log(`[Orchestration] Provider selected: ${provider.getProviderName()}`);

    // Step 1: initialise session (idempotent 24h cache)
    const initResult = await ctx.runMutation(
      internal.validationResearchSessionMutations.initValidationResearchSession,
      { inventionId }
    ).catch((err: unknown) => {
      console.error(`[Orchestration] initValidationResearchSession failed for inventionId=${inventionId}:`, err);
      return null;
    });

    if (!initResult) {
      console.error(`[Orchestration] Aborting — session init returned null for inventionId=${inventionId}`);
      return;
    }

    // Step 2: cache hit — reuse existing research
    if (initResult.status === "existing") {
      console.log(`[Orchestration] Cache hit — reusing existing research for inventionId=${inventionId}`);
      return;
    }

    const { researchId, inventionTitle, problemStatement, inventionDescription } =
      initResult;

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
    ).catch((err: unknown) => {
      console.error(`[Orchestration] markValidationResearchInProgress failed: researchId=${researchId}`, err);
    });
    console.log(`[Orchestration] researchStatus → IN_PROGRESS: researchId=${researchId}`);

    let completedCount = 0;
    let failedCount = 0;

    // Step 4: generate + persist each section independently
    for (let i = 0; i < SECTION_ORDER.length; i++) {
      const sectionKey = SECTION_ORDER[i];

      try {
        // Generate via provider
        console.log(`[Orchestration] Provider invoked: sectionKey=${sectionKey} researchId=${researchId}`);
        const result = await provider.generateSection(
          inventionContext,
          sectionKey
        );
        console.log(`[Orchestration] Section generated: sectionKey=${sectionKey} researchId=${researchId}`);

        completedCount += 1;
        const now = Date.now();

        // Build the section entry to persist
        const sectionEntry = {
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

        // Persist immediately
        await ctx.runMutation(
          internal.validationResearchSessionMutations.patchValidationSection,
          {
            researchId,
            sectionKey,
            sectionEntry,
            completedSectionCount: completedCount,
            lastCompletedSection: sectionKey,
            overallStatus: "IN_PROGRESS",
            updatedAt: now,
          }
        );
        console.log(`[Orchestration] Section persisted: sectionKey=${sectionKey} completedCount=${completedCount} researchId=${researchId}`);
      } catch (err) {
        // Section failure is isolated — mark FAILED, continue
        failedCount += 1;
        const now = Date.now();
        console.error(`[Orchestration] Section "${sectionKey}" failed for researchId=${researchId}:`, err);

        const failedEntry = {
          sectionKey,
          approvalStatus: "pending",
          sectionStatus: "FAILED",
          lastGeneratedAt: now,
          error:
            err instanceof Error ? err.message : "Section generation failed",
        };

        // Best-effort patch for the failed section
        try {
          await ctx.runMutation(
            internal.validationResearchSessionMutations.patchValidationSection,
            {
              researchId,
              sectionKey,
              sectionEntry: failedEntry,
              completedSectionCount: completedCount,
              lastCompletedSection: sectionKey,
              overallStatus: "IN_PROGRESS",
              updatedAt: now,
            }
          );
        } catch (patchErr) {
          console.error(`[Orchestration] Failed to patch failed section "${sectionKey}":`, patchErr);
        }
      }
    }

    // Step 5: finalise
    const finalTs = Date.now();
    const allFailed = failedCount === SECTION_ORDER.length;
    const finalOverallStatus = allFailed ? "FAILED" : "COMPLETED";
    const finalResearchStatus = allFailed ? "failed" : "completed";

    console.log(`[Orchestration] Finalising: researchId=${researchId} status=${finalResearchStatus} completed=${completedCount} failed=${failedCount}`);

    await ctx.runMutation(
      internal.validationResearchSessionMutations.finaliseValidationResearch,
      {
        researchId,
        overallStatus: finalOverallStatus,
        completedAt: finalTs,
        researchStatus: finalResearchStatus,
      }
    ).catch((err: unknown) => {
      console.error(`[Orchestration] finaliseValidationResearch failed: researchId=${researchId}`, err);
    });
  },
});
