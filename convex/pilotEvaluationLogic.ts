import { isSourceEligibleForPromotion } from "./evidenceIntegrityLogic";

export const REQUIRED_PILOT_DELIVERABLE_KINDS = [
  "invention_brief_analysis",
  "assumptions_unknowns_register",
  "competitor_landscape",
  "market_feasibility_report",
  "preliminary_prior_art_landscape",
  "feature_prior_art_comparison",
  "distinguishing_features_alternative_embodiments",
  "technical_feasibility_assessment",
  "initial_product_requirements",
  "product_design_directions",
  "concept_visualization_board",
  "materials_manufacturing_assessment",
  "preliminary_bom_cost_range",
  "regulatory_readiness_screening",
  "development_risks_costs_dependencies",
  "ip_readiness_brief",
  "engineering_handoff_brief",
  "feasibility_recommendation",
  "invention_feasibility_development_package",
] as const;

interface EvaluationDeliverable {
  kind: string;
  version?: number;
  trustState: string;
  sourceIds: unknown[];
  sourceCoverage?: number;
  staleReason?: string;
  storageId?: unknown;
}

interface EvaluationFinding {
  kind: string;
  status: string;
  sourceIds: unknown[];
}

interface EvaluationSource {
  _id: unknown;
  reliability: string;
  locator?: string;
  metadata?: unknown;
}

interface EvaluationWorkItem {
  status: string;
  humanGateType?: string;
}

export interface PilotEvaluationInput {
  deliverables: EvaluationDeliverable[];
  findings: EvaluationFinding[];
  sources: EvaluationSource[];
  workItems: EvaluationWorkItem[];
}

export function evaluatePilotPackage(input: PilotEvaluationInput, evaluatedAt = Date.now()) {
  const latestByKind = new Map<string, EvaluationDeliverable>();
  for (const deliverable of input.deliverables) {
    const existing = latestByKind.get(deliverable.kind);
    if (!existing || (deliverable.version ?? 0) >= (existing.version ?? 0)) {
      latestByKind.set(deliverable.kind, deliverable);
    }
  }
  const latestDeliverables = [...latestByKind.values()];
  const missingDeliverableKinds = REQUIRED_PILOT_DELIVERABLE_KINDS.filter((kind) => !latestByKind.has(kind));
  const completeness = (REQUIRED_PILOT_DELIVERABLE_KINDS.length - missingDeliverableKinds.length) / REQUIRED_PILOT_DELIVERABLE_KINDS.length;

  const unsupportedSourcedFacts = input.findings.filter((finding) => finding.kind === "sourced_fact" && finding.sourceIds.length === 0).length;
  const sourcedFacts = input.findings.filter((finding) => finding.kind === "sourced_fact");
  const evidenceCheckedFacts = sourcedFacts.filter((finding) => finding.status === "evidence_checked").length;
  const evidenceCheckedRatio = sourcedFacts.length ? evidenceCheckedFacts / sourcedFacts.length : 0;

  const trustedSourceIds = new Set(input.sources.filter((source) => isSourceEligibleForPromotion(source, evaluatedAt)).map((source) => String(source._id)));
  const staleOrUnusableTrustedSources = input.sources.filter((source) => source.reliability !== "unverified" && !trustedSourceIds.has(String(source._id))).length;
  const promotedTrustStates = new Set([
    "evidence_checked",
    "inventor_approved",
    "professionally_reviewed",
    "ready_for_authorized_use",
  ]);
  const trustViolations = latestDeliverables.filter((deliverable) => {
    if (!promotedTrustStates.has(deliverable.trustState)) return false;
    const sourcesTrusted = deliverable.sourceIds.length > 0 && deliverable.sourceIds.every((sourceId) => trustedSourceIds.has(String(sourceId)));
    const coverageSufficient = (deliverable.sourceCoverage ?? 0) >= 0.5;
    return Boolean(deliverable.staleReason) || !sourcesTrusted || !coverageSufficient;
  }).length;

  const staleDeliverables = latestDeliverables.filter((deliverable) => Boolean(deliverable.staleReason)).length;
  const conceptVisualizationPresent = latestDeliverables.some((deliverable) => deliverable.kind === "concept_visualization_board" && Boolean(deliverable.storageId));
  const failedWorkItems = input.workItems.filter((item) => item.status === "failed").length;
  const blockedWithoutGate = input.workItems.filter((item) => item.status === "blocked" && !item.humanGateType).length;

  const score = Math.round(100 * (
    completeness * 0.4 +
    evidenceCheckedRatio * 0.3 +
    (trustViolations === 0 ? 1 : 0) * 0.15 +
    (unsupportedSourcedFacts === 0 ? 1 : 0) * 0.1 +
    (conceptVisualizationPresent ? 1 : 0) * 0.05
  ));

  const blockers = [
    ...(missingDeliverableKinds.length ? [`${missingDeliverableKinds.length} required deliverable(s) missing`] : []),
    ...(unsupportedSourcedFacts ? [`${unsupportedSourcedFacts} sourced fact(s) have no source`] : []),
    ...(trustViolations ? [`${trustViolations} deliverable trust-state violation(s)`] : []),
    ...(staleOrUnusableTrustedSources ? [`${staleOrUnusableTrustedSources} trusted source(s) require fresh verification`] : []),
    ...(staleDeliverables ? [`${staleDeliverables} deliverable(s) are stale`] : []),
    ...(!conceptVisualizationPresent ? ["Concept visualization media is missing"] : []),
    ...(failedWorkItems ? [`${failedWorkItems} autonomous work item(s) failed`] : []),
    ...(blockedWithoutGate ? [`${blockedWithoutGate} blocked work item(s) lack a human gate type`] : []),
  ];

  return {
    score,
    passed: blockers.length === 0 && evidenceCheckedRatio >= 0.8,
    blockers,
    metrics: {
      requiredDeliverables: REQUIRED_PILOT_DELIVERABLE_KINDS.length,
      missingDeliverables: missingDeliverableKinds.length,
      unsupportedSourcedFacts,
      evidenceCheckedRatio,
      trustViolations,
      staleOrUnusableTrustedSources,
      staleDeliverables,
      conceptVisualizationPresent,
      failedWorkItems,
      blockedWithoutGate,
    },
    missingDeliverableKinds,
  };
}
