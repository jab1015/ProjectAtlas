import { REQUIRED_PILOT_DELIVERABLE_KINDS, type PilotEvaluationInput } from "@convex/pilotEvaluationLogic";

/**
 * Controlled-pilot fixture: a simple household product with no medical, food-contact,
 * child-safety, electrical, pressure, or other elevated-risk intended use.
 */
export const representativeInvention = {
  title: "Adjustable countertop produce-rinsing rack",
  problemStatement: "Small kitchens lack a compact way to rinse and drain produce over differently sized sinks.",
  targetAudience: "Adults in apartments and other small kitchens",
  solutionDescription: "A manually adjustable rack that spans a household sink and supports a removable perforated basket.",
  riskClass: "standard" as const,
};

export const representativeEvaluationTime = Date.UTC(2026, 7, 14);

export function makeRepresentativePilotEvaluationInput(): PilotEvaluationInput {
  const sourceId = "representative-primary-source";
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
      locator: "https://www.uspto.gov/patents/search",
      metadata: { verifiedAt: representativeEvaluationTime },
    }],
    workItems: [{ status: "completed" }],
  };
}
