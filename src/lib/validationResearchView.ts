export type ValidationResearchStatus =
  | "running"
  | "complete"
  | "partial"
  | "failed"
  | undefined;

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
  evidenceReview?: {
    currentEvidenceMatchesRun?: boolean;
  };
}

const VALIDATION_SECTION_TITLES: Record<string, string> = {
  validationPlan: "Validation plan",
  customerSegments: "Customer segments",
  competitorAnalysis: "Competitor analysis",
  marketSizing: "Market sizing",
  validationMethods: "Validation methods",
  timeline: "Validation timeline",
  surveyQuestions: "Survey questions",
  landingPageDraft: "Landing page draft",
  interviewQuestions: "Interview questions",
  riskAssessment: "Risk assessment",
  recommendations: "Recommendations",
};

export function getValidationSectionTitle(sectionId?: string, title?: string): string {
  if (title?.trim() && title.trim() !== sectionId) return title.trim();
  if (!sectionId) return "Validation section";
  return VALIDATION_SECTION_TITLES[sectionId] ?? sectionId.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase());
}

/** Hide internal Convex record identifiers that can leak into older generated reports. */
export function cleanValidationResearchContent(content: string): string {
  return content
    .replace(/cite(?:[a-z0-9_-]+)*/gi, "")
    .replace(/\s*\(sourceId:\s*m[a-z0-9]{20,}\)/gi, "")
    .replace(/\bsourceId:\s*m[a-z0-9]{20,}\b/gi, "")
    .replace(/\bm[a-z0-9]{24,}\b/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface ValidationResearchViewState {
  finishedSections: ValidationResearchSectionView[];
  failedSections: ValidationResearchSectionView[];
  isGenerating: boolean;
  isFailed: boolean;
  isPartial: boolean;
  allSectionsError: boolean;
  progressCount: number;
  progressPct: number;
  statusLabel: string;
}

export function getSafeValidationFailureMessage(rawMessage: string): string {
  if (/\b401\b|incorrect api key|invalid api key|unauthorized/i.test(rawMessage)) {
    return "The AI provider rejected its configured credentials. Ask an administrator to check the OpenAI API key for this environment, then retry. No key is displayed here.";
  }
  return "The AI provider could not generate this section. Check the operations status for this environment, then retry.";
}

/**
 * Explain when a completed snapshot is still being replaced because evidence
 * changed. The previous section count remains useful, but must not imply that
 * the current evidence has already been included.
 */
export function getValidationCompletionLabel(
  currentEvidenceMatchesRun: boolean | undefined,
  completedSections: number,
  totalSections: number
): string {
  if (currentEvidenceMatchesRun === false) {
    return `Update needed — previous report has ${completedSections} of ${totalSections} sections; it does not match current evidence`;
  }
  if (completedSections < totalSections) {
    return `Validation partially complete — ${completedSections} of ${totalSections} sections`;
  }
  return `Validation complete — ${completedSections} of ${totalSections} sections`;
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
  const evidenceIsStale = validationResearch?.evidenceReview?.currentEvidenceMatchesRun === false;

  // The orchestration layer can persist a true partial result while older query
  // normalization paths may omit that status. Infer partial from observable
  // section outcomes so a mixed success/failure run can never be presented as
  // fully complete merely because the status field was lost in translation.
  const isPartial =
    validationResearch?.status === "partial" ||
    (!isGenerating &&
      !isFailed &&
      failedSections.length > 0 &&
      finishedSections.some((section) => section.status !== "failed"));

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
    statusLabel = evidenceIsStale
      ? "Refresh in progress — current evidence not reflected yet"
      : "Research in progress";
  } else if (evidenceIsStale) {
    statusLabel = getValidationCompletionLabel(false, progressCount, totalSections);
  } else if (isPartial) {
    statusLabel = "Validation partially complete";
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
    isPartial,
    allSectionsError,
    progressCount,
    progressPct,
    statusLabel,
  };
}

export function getValidationPageHeading(
  validationResearch: ValidationResearchViewInput | null | undefined,
  viewState: ValidationResearchViewState,
  totalSections: number,
): string {
  if (viewState.isGenerating) return "InventSmith is validating your invention.";
  if (viewState.allSectionsError) return "Validation could not be completed.";
  if (viewState.failedSections.length > 0) return "Some validation sections need another try.";
  if (validationResearch?.evidenceReview?.currentEvidenceMatchesRun === false) {
    return "Validation update needed.";
  }
  if (validationResearch?.status === "complete" && viewState.progressCount >= totalSections) {
    return "Validation is complete.";
  }
  return "Validation overview.";
}
