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
  const score = requiresExternalEvidence
    ? suppliedFields >= 3
      ? 0.3
      : 0.2
    : suppliedFields >= 3
      ? 0.4
      : 0.25;

  const missingInformation = [
    "Independent retrieval/source records have not been collected by this provider.",
    "Primary customer validation data has not been supplied as verified evidence.",
  ];

  if (requiresExternalEvidence) {
    missingInformation.push(
      "Market, competitor, pricing, and demand claims require current external sources before they can be treated as facts."
    );
  }

  return {
    score,
    level: score >= 0.35 ? "low" : "very_low",
    evidenceSummary:
      "Grounded only in inventor-provided invention context. Generated conclusions are AI inferences/hypotheses, not independently sourced facts.",
    assumptions: [
      "Inventor-provided problem and invention descriptions are accurate statements of the intended concept.",
      "Any market, customer, competitor, pricing, or demand statements generated without retrieval are hypotheses pending evidence.",
    ],
    missingInformation,
  };
}
