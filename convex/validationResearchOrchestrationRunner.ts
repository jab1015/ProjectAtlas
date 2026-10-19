import type {
  InventionContext,
  SectionGenerationResult,
  ValidationResearchProvider,
  ValidationSectionKey,
} from "./validationResearchProvider";

export type ValidationSectionEntry = Record<string, unknown>;

export interface PersistValidationSectionArgs {
  sectionKey: ValidationSectionKey;
  sectionEntry: ValidationSectionEntry;
  completedSectionCount: number;
  lastCompletedSection: ValidationSectionKey;
  overallStatus: "IN_PROGRESS";
  updatedAt: number;
}

export interface ValidationSectionRunSummary {
  completedCount: number;
  failedCount: number;
  finalOverallStatus: "COMPLETED" | "PARTIAL" | "FAILED";
  finalResearchStatus: "completed" | "partial" | "failed";
}

interface RunValidationSectionsArgs {
  sectionOrder: ValidationSectionKey[];
  provider: Pick<ValidationResearchProvider, "generateSection">;
  inventionContext: InventionContext;
  persistCompletedSection: (args: PersistValidationSectionArgs) => Promise<void>;
  persistFailedSection: (args: PersistValidationSectionArgs) => Promise<void>;
  now: () => number;
  initialCompletedCount?: number;
  onError?: (message: string, error: unknown) => void;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Validation research failed";
}

function toSerializable(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(toSerializable);
  if (typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    output[key] = toSerializable(nestedValue);
  }
  return output;
}

export function buildCompletedSectionEntry(
  result: SectionGenerationResult,
  sectionKey: ValidationSectionKey
): ValidationSectionEntry {
  return toSerializable({
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
  }) as ValidationSectionEntry;
}

export function buildFailedSectionEntry(
  sectionKey: ValidationSectionKey,
  error: unknown,
  generatedAt: number
): ValidationSectionEntry {
  const message = getErrorMessage(error);
  const safeMessage = /\b401\b|incorrect api key|invalid api key|unauthorized/i.test(message)
    ? "The AI provider rejected its configured credentials. Ask an administrator to check the OpenAI API key for this environment, then retry. No key is displayed here."
    : "The AI provider could not generate this section. Check the operations status for this environment, then retry.";

  return {
    sectionKey,
    title: sectionKey,
    generatedContent: `Section generation failed: ${safeMessage}`,
    confidence: {
      score: 0,
      level: "very_low",
      evidenceSummary: "Section generation failed.",
      assumptions: [],
      missingInformation: [safeMessage],
    },
    evidenceSummary: "Section generation failed.",
    assumptions: [],
    missingInformation: [safeMessage],
    approvalStatus: "pending",
    sectionStatus: "FAILED",
    lastGeneratedAt: generatedAt,
    error: safeMessage,
  };
}

export function getFinalValidationResearchStatus(
  completedCount: number,
  failedCount: number
): Pick<ValidationSectionRunSummary, "finalOverallStatus" | "finalResearchStatus"> {
  if (completedCount > 0 && failedCount > 0) {
    return { finalOverallStatus: "PARTIAL", finalResearchStatus: "partial" };
  }

  if (completedCount > 0) {
    return { finalOverallStatus: "COMPLETED", finalResearchStatus: "completed" };
  }

  return { finalOverallStatus: "FAILED", finalResearchStatus: "failed" };
}

export async function runValidationSections({
  sectionOrder,
  provider,
  inventionContext,
  persistCompletedSection,
  persistFailedSection,
  now,
  initialCompletedCount = 0,
  onError,
}: RunValidationSectionsArgs): Promise<ValidationSectionRunSummary> {
  let completedCount = Math.max(0, initialCompletedCount);
  let failedCount = 0;

  // Generate independent sections in small batches, then persist each batch
  // serially so progress counters cannot race or overwrite one another.
  const concurrency = 3;
  for (let offset = 0; offset < sectionOrder.length; offset += concurrency) {
    const batch = sectionOrder.slice(offset, offset + concurrency);
    const outcomes = await Promise.all(batch.map(async (sectionKey) => {
      try {
        return { sectionKey, ok: true as const, result: await provider.generateSection(inventionContext, sectionKey) };
      } catch (error) {
        return { sectionKey, ok: false as const, error };
      }
    }));

    for (const outcome of outcomes) {
      const updatedAt = now();
      if (outcome.ok) {
        const nextCompletedCount = completedCount + 1;
        try {
          await persistCompletedSection({
            sectionKey: outcome.sectionKey,
            sectionEntry: buildCompletedSectionEntry(outcome.result, outcome.sectionKey),
            completedSectionCount: nextCompletedCount,
            lastCompletedSection: outcome.sectionKey,
            overallStatus: "IN_PROGRESS",
            updatedAt,
          });
          completedCount = nextCompletedCount;
        } catch (persistError) {
          failedCount += 1;
          onError?.(`Failed to persist completed section "${outcome.sectionKey}"`, persistError);
          try {
            await persistFailedSection({
              sectionKey: outcome.sectionKey,
              sectionEntry: buildFailedSectionEntry(outcome.sectionKey, persistError, updatedAt),
              completedSectionCount: completedCount,
              lastCompletedSection: outcome.sectionKey,
              overallStatus: "IN_PROGRESS",
              updatedAt,
            });
          } catch (failurePersistError) {
            onError?.(`Failed to persist failed section "${outcome.sectionKey}"`, failurePersistError);
            throw failurePersistError;
          }
        }
        continue;
      }

      failedCount += 1;
      onError?.(`Section "${outcome.sectionKey}" failed`, outcome.error);
      try {
        await persistFailedSection({
          sectionKey: outcome.sectionKey,
          sectionEntry: buildFailedSectionEntry(outcome.sectionKey, outcome.error, updatedAt),
          completedSectionCount: completedCount,
          lastCompletedSection: outcome.sectionKey,
          overallStatus: "IN_PROGRESS",
          updatedAt,
        });
      } catch (persistError) {
        onError?.(`Failed to persist failed section "${outcome.sectionKey}"`, persistError);
        throw persistError;
      }
    }
  }

  return {
    completedCount,
    failedCount,
    ...getFinalValidationResearchStatus(completedCount, failedCount),
  };
}
