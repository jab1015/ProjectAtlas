import type { InventionContext, ValidationSectionKey } from "./validationResearchProvider";

export interface ValidationConfidenceAssessment {
  score: number;
  level: "moderate" | "low" | "very_low";
  evidenceSummary: string;
  assumptions: string[];
  missingInformation: string[];
}

const EXTERNAL_EVIDENCE_SECTIONS = new Set<ValidationSectionKey>([
  "customerSegments",
  "competitorAnalysis",
  "marketSizing",
  "recommendations",
]);

/**
 * Confidence for the context-only validation provider.
 *
 * This provider does not retrieve independent sources. Its confidence therefore
 * measures only how complete the inventor-supplied context is for generating a
 * hypothesis; it must never imply that market facts or competitor claims were
 * independently verified.
 */
export function assessContextOnlyValidationConfidence(
  context: InventionContext,
  sectionKey: ValidationSectionKey
): ValidationConfidenceAssessment {
  const suppliedFields = [
    context.title,
    context.problemStatement,
    context.inventionDescription,
    context.founderNotes,
  ].filter((value) => typeof value === "string" && value.trim().length > 0).length;

  const requiresExternalEvidence = EXTERNAL_EVIDENCE_SECTIONS.has(sectionKey);
  let score = requiresExternalEvidence
    ? suppliedFields >= 3
      ? 0.3
      : 0.2
    : suppliedFields >= 3
      ? 0.4
      : 0.25;

  // Transparent evidence-support rubric, NOT purchase probability or statistical
  // certainty. Survey observations support customer validation, not competitor
  // facts, market size, engineering, or legal conclusions. No bonus per upload
  // or respondent, so duplicates and inflated sample counts cannot inflate it.
  const surveySections = new Set<ValidationSectionKey>(["customerSegments", "validationPlan", "validationMethods", "surveyQuestions", "interviewQuestions", "riskAssessment", "recommendations"]);
  const hasSurveyFindings = context.inventorEvidence?.some(source => {
    if (source.evidenceKind !== "survey" || !source.extraction || typeof source.extraction !== "object") return false;
    const extraction = source.extraction as Record<string, any>;
    return (Array.isArray(extraction.keyFindings) && extraction.keyFindings.some((finding: any) => finding.basis === "document_observation" && typeof finding.statement === "string" && finding.statement.trim()))
      || (extraction.mode === "csv_survey" && extraction.survey?.rowCount > 0 && extraction.survey?.questions?.length > 0);
  }) ?? false;
  const surveySupported = hasSurveyFindings && surveySections.has(sectionKey);
  if (surveySupported) score = Math.min(0.5, score + 0.2);

  const missingInformation = [
    "Independent retrieval/source records have not been collected by this provider.",
    context.inventorEvidence?.length
      ? "Uploaded evidence has been included but its methodology and representativeness have not been independently verified."
      : "Primary customer validation data has not been supplied as verified evidence.",
  ];

  if (requiresExternalEvidence) {
    missingInformation.push(
      "Market, competitor, pricing, and demand claims require current external sources before they can be treated as facts."
    );
  }

  return {
    score,
    level: score >= 0.5 ? "moderate" : score >= 0.35 ? "low" : "very_low",
    evidenceSummary:
      context.inventorEvidence?.length
        ? `Grounded in invention context and extracted inventor-uploaded evidence. ${surveySupported ? "Survey observations strengthen customer-validation evidence support. " : ""}The score is a heuristic evidence-support rating, not a statistical confidence level or probability of commercial success. Document observations and AI inferences are not independent verification.`
        : "Grounded only in inventor-provided invention context. Generated conclusions are AI inferences/hypotheses, not independently sourced facts.",
    assumptions: [
      "Inventor-provided problem and invention descriptions are accurate statements of the intended concept.",
      "Any market, customer, competitor, pricing, or demand statements generated without retrieval are hypotheses pending evidence.",
    ],
    missingInformation,
  };
}
