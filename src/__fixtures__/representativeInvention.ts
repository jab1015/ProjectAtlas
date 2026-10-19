import { REQUIRED_PILOT_DELIVERABLE_KINDS, type PilotEvaluationInput } from "@convex/pilotEvaluationLogic";
import { REPRESENTATIVE_PILOT_INTAKE } from "@/lib/representativePilot";

/**
 * Controlled-pilot fixture: a simple household product with no medical, food-contact,
 * child-safety, electrical, pressure, or other elevated-risk intended use.
 */
export const representativeInvention = {
  ...REPRESENTATIVE_PILOT_INTAKE,
  riskClass: "standard" as const,
};

export const representativeEvaluationTime = Date.UTC(2026, 7, 14);

export function makeRepresentativePilotEvaluationInput(): PilotEvaluationInput {
  const sourceId = "representative-primary-source";
  const sourceUrl = "https://www.uspto.gov/patents/search";
  return {
    deliverables: REQUIRED_PILOT_DELIVERABLE_KINDS.map((kind) => ({
      kind,
      version: 1,
      trustState: "evidence_checked",
      sourceIds: [sourceId],
      sourceCoverage: 0.85,
      storageId: kind === "concept_visualization_board" ? "representative-concept-media" : undefined,
    })),
    findings: [
      { kind: "sourced_fact", status: "evidence_checked", sourceIds: [sourceId] },
      { kind: "inventor_statement", status: "draft", sourceIds: [] },
    ],
    sources: [{
      _id: sourceId,
      reliability: "primary",
      locator: sourceUrl,
      metadata: {
        verifiedAt: representativeEvaluationTime,
        retrievalRecordedAt: representativeEvaluationTime,
        retrievalSourceUrl: sourceUrl,
        claimSupportExcerpt: "Controlled fixture records a real retrieval event and claim-level support rather than trusting a model-supplied verification label.",
      },
    }],
    workItems: [{ status: "completed" }],
  };
}
