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

const SURVEY_SUPPORTED_SECTIONS = new Set<ValidationSectionKey>([
  "customerSegments",
  "validationPlan",
  "validationMethods",
  "surveyQuestions",
  "interviewQuestions",
  "riskAssessment",
  "recommendations",
]);

function surveyEvidenceDetails(context: InventionContext) {
  const surveys = (context.inventorEvidence ?? []).filter((source) => {
    if (source.evidenceKind !== "survey" || !source.extraction || typeof source.extraction !== "object") return false;
    const extraction = source.extraction as Record<string, any>;
    const hasFindings = Array.isArray(extraction.keyFindings) && extraction.keyFindings.some(
      (finding: any) => finding?.basis === "document_observation" && typeof finding.statement === "string" && finding.statement.trim()
    );
    const hasStructuredRows = extraction.mode === "csv_survey" && Number(extraction.survey?.rowCount) > 0;
    const hasPublicSurveyResponse = extraction.mode === "public_response" && extraction.documentType === "public_survey_response";
    const documentLooksLikeSurvey = /survey|survey monkey|surveymonkey|respondent|response|user/i.test(
      `${extraction.documentType ?? ""} ${extraction.sampleSize ?? ""} ${extraction.summary ?? ""}`
    );
    return hasFindings || hasStructuredRows || hasPublicSurveyResponse || documentLooksLikeSurvey;
  });

  const publicResponseCount = surveys.filter((source) => (source.extraction as Record<string, any>).mode === "public_response").length;
  const sampleSizes = surveys.flatMap((source) => {
    const extraction = source.extraction as Record<string, any>;
    const raw = `${extraction.sampleSize ?? ""} ${extraction.survey?.rowCount ?? ""}`;
    return [...raw.matchAll(/\b(\d{1,6})\b/g)].map((match) => Number(match[1])).filter((value) => value > 0);
  });

  return {
    present: surveys.length > 0,
    // Imported survey files may report their own sample size. Public responses
    // are one completed respondent each, so count them without overstating the
    // size of a separate uploaded survey.
    sampleSize: Math.max(publicResponseCount, sampleSizes.length > 0 ? Math.max(...sampleSizes) : 0) || undefined,
  };
}

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
  const survey = surveyEvidenceDetails(context);
  const surveySupported = survey.present && SURVEY_SUPPORTED_SECTIONS.has(sectionKey);
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
      ? `Grounded in invention context and extracted inventor-uploaded evidence. ${surveySupported ? `Survey observations strengthen customer-validation evidence support${survey.sampleSize ? ` (${survey.sampleSize} reported respondents)` : ""}. ` : ""}The score is a heuristic evidence-support rating, not a statistical confidence level or probability of commercial success. Document observations and AI inferences are not independent verification.`
        : "Grounded only in inventor-provided invention context. Generated conclusions are AI inferences/hypotheses, not independently sourced facts.",
    assumptions: [
      "Inventor-provided problem and invention descriptions are accurate statements of the intended concept.",
      "Any market, customer, competitor, pricing, or demand statements generated without retrieval are hypotheses pending evidence.",
    ],
    missingInformation,
  };
}
