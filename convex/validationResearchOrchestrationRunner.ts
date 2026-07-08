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
  finalOverallStatus: "COMPLETED" | "FAILED";
  finalResearchStatus: "completed" | "failed";
}

interface RunValidationSectionsArgs {
  sectionOrder: ValidationSectionKey[];
  provider: Pick<ValidationResearchProvider, "generateSection">;
  inventionContext: InventionContext;
  persistCompletedSection: (args: PersistValidationSectionArgs) => Promise<void>;
  persistFailedSection: (args: PersistValidationSectionArgs) => Promise<void>;
  now: () => number;
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

  return {
    sectionKey,
    title: sectionKey,
    generatedContent: `Section generation failed: ${message}`,
    confidence: {
      score: 0,
      level: "very_low",
      evidenceSummary: "Section generation failed.",
      assumptions: [],
      missingInformation: [message],
    },
    evidenceSummary: "Section generation failed.",
    assumptions: [],
    missingInformation: [message],
    approvalStatus: "pending",
    sectionStatus: "FAILED",
    lastGeneratedAt: generatedAt,
    error: message,
  };
}

export function getFinalValidationResearchStatus(
  completedCount: number
): Pick<ValidationSectionRunSummary, "finalOverallStatus" | "finalResearchStatus"> {
  return completedCount > 0
    ? { finalOverallStatus: "COMPLETED", finalResearchStatus: "completed" }
    : { finalOverallStatus: "FAILED", finalResearchStatus: "failed" };
}

export async function runValidationSections({
  sectionOrder,
  provider,
  inventionContext,
  persistCompletedSection,
  persistFailedSection,
  now,
  onError,
}: RunValidationSectionsArgs): Promise<ValidationSectionRunSummary> {
  let completedCount = 0;
  let failedCount = 0;

  for (const sectionKey of sectionOrder) {
    try {
      const result = await provider.generateSection(inventionContext, sectionKey);
      const nextCompletedCount = completedCount + 1;
      const updatedAt = now();

      await persistCompletedSection({
        sectionKey,
        sectionEntry: buildCompletedSectionEntry(result, sectionKey),
        completedSectionCount: nextCompletedCount,
        lastCompletedSection: sectionKey,
        overallStatus: "IN_PROGRESS",
        updatedAt,
      });

      completedCount = nextCompletedCount;
    } catch (error) {
      failedCount += 1;
      const updatedAt = now();
      onError?.(`Section "${sectionKey}" failed`, error);

      try {
        await persistFailedSection({
          sectionKey,
          sectionEntry: buildFailedSectionEntry(sectionKey, error, updatedAt),
          completedSectionCount: completedCount,
          lastCompletedSection: sectionKey,
          overallStatus: "IN_PROGRESS",
          updatedAt,
        });
      } catch (persistError) {
        onError?.(`Failed to persist failed section "${sectionKey}"`, persistError);
        throw persistError;
      }
    }
  }

  return {
    completedCount,
    failedCount,
    ...getFinalValidationResearchStatus(completedCount),
  };
}
