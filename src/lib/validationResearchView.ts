export type ValidationResearchStatus = "running" | "complete" | "failed" | undefined;

export interface ValidationResearchSectionView {
  sectionId?: string;
  title?: string;
  status?: "pending" | "generated" | "approved" | "edited" | "failed";
  content?: string;
  editedContent?: string;
  confidence?: {
    score?: number;
    level?: string;
    evidenceSummary?: string;
    assumptions: string[];
    missingInformation: string[];
  };
}

export interface ValidationResearchViewInput {
  status?: ValidationResearchStatus;
  sections?: ValidationResearchSectionView[];
}

export interface ValidationResearchViewState {
  finishedSections: ValidationResearchSectionView[];
  failedSections: ValidationResearchSectionView[];
  isGenerating: boolean;
  isFailed: boolean;
  allSectionsError: boolean;
  progressCount: number;
  progressPct: number;
  statusLabel: string;
}

export function getValidationResearchViewState(
  validationResearch: ValidationResearchViewInput | null | undefined,
  rebuilding: boolean,
  totalSections: number
): ValidationResearchViewState {
  const sections = validationResearch?.sections ?? [];
  const finishedSections = sections.filter((section) => section.status !== "pending");
  const failedSections = finishedSections.filter((section) => section.status === "failed");
  const isFailed = validationResearch?.status === "failed";
  const isGenerating = rebuilding || validationResearch?.status === "running";
  const progressCount = finishedSections.length;
  const progressPct =
    totalSections > 0
      ? Math.round((Math.min(progressCount, totalSections) / totalSections) * 100)
      : 0;

  const allSectionsError =
    isFailed ||
    (finishedSections.length === totalSections &&
      finishedSections.every((section) =>
        section.status === "failed" ||
        section.content?.includes("OPENAI_API_KEY") ||
        section.content?.includes("Unable to generate") ||
        section.content?.includes("Error:")
      ));

  let statusLabel = "Waiting to begin";
  if (isFailed || allSectionsError) {
    statusLabel = "Validation failed";
  } else if (isGenerating) {
    statusLabel = "Research in progress";
  } else if (validationResearch?.status === "complete") {
    statusLabel =
      failedSections.length > 0
        ? "Validation complete with errors"
        : "Validation complete";
  }

  return {
    finishedSections,
    failedSections,
    isGenerating,
    isFailed,
    allSectionsError,
    progressCount,
    progressPct,
    statusLabel,
  };
}
