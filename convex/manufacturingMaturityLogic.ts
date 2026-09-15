export interface ManufacturingMaturityDeliverable {
  kind: string;
  version: number;
  trustState: string;
  staleReason?: string;
  artifactMaturity?: string;
}

const REVIEWED_TRUST_STATES = new Set(["professionally_reviewed", "ready_for_authorized_use"]);
const PRODUCTION_CAD_MATURITY = new Set(["engineering_reviewed", "manufacturing_released"]);

function latestDeliverable(
  deliverables: readonly ManufacturingMaturityDeliverable[],
  kind: string
): ManufacturingMaturityDeliverable | undefined {
  return deliverables
    .filter((deliverable) => deliverable.kind === kind)
    .reduce<ManufacturingMaturityDeliverable | undefined>(
      (latest, deliverable) => !latest || deliverable.version > latest.version ? deliverable : latest,
      undefined
    );
}

export function isFreshProfessionallyReviewedDeliverable(
  deliverables: readonly ManufacturingMaturityDeliverable[],
  kind: string
): boolean {
  const latest = latestDeliverable(deliverables, kind);
  return Boolean(
    latest &&
    !latest.staleReason &&
    REVIEWED_TRUST_STATES.has(latest.trustState)
  );
}

export function isProductionMatureCad(
  deliverables: readonly ManufacturingMaturityDeliverable[]
): boolean {
  const latest = latestDeliverable(deliverables, "native_cad_package");
  return Boolean(
    latest &&
    !latest.staleReason &&
    REVIEWED_TRUST_STATES.has(latest.trustState) &&
    latest.artifactMaturity &&
    PRODUCTION_CAD_MATURITY.has(latest.artifactMaturity)
  );
}

/**
 * Consequential manufacturing readiness must fail closed on engineering maturity.
 *
 * Early process research, sourcing, scorecards, and draft RFQ preparation remain
 * useful before prototype completion. The final manufacturing-readiness assessment,
 * however, may run only after the latest prototype-readiness assessment, manufacturer
 * RFQ package, and manufacturing drawing specification have passed engineering review,
 * remain fresh, and the newest native CAD package has reached engineering-reviewed or
 * manufacturing-released maturity. This prevents preliminary CAD, stale drawings, or
 * completed-but-unreviewed artifacts from silently advancing InventSmith toward a
 * production commitment.
 */
export function isManufacturingMaturityEligible(
  workKind: string | undefined,
  deliverables: readonly ManufacturingMaturityDeliverable[]
): boolean {
  if (workKind !== "manufacturing_readiness") return true;

  return (
    isFreshProfessionallyReviewedDeliverable(deliverables, "prototype_readiness_assessment") &&
    isFreshProfessionallyReviewedDeliverable(deliverables, "manufacturer_rfq_package") &&
    isFreshProfessionallyReviewedDeliverable(deliverables, "manufacturing_drawing_specification") &&
    isProductionMatureCad(deliverables)
  );
}
