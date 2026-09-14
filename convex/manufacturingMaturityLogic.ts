export interface ManufacturingMaturityDeliverable {
  kind: string;
  version: number;
  trustState: string;
  staleReason?: string;
}

const REVIEWED_TRUST_STATES = new Set(["professionally_reviewed", "ready_for_authorized_use"]);

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

/**
 * Consequential manufacturing readiness must fail closed on engineering maturity.
 *
 * Early process research, sourcing, scorecards, and draft RFQ preparation remain
 * useful before prototype completion. The final manufacturing-readiness assessment,
 * however, may run only after the latest prototype-readiness assessment and latest
 * manufacturer RFQ package have both passed their required engineering review and
 * remain fresh. This prevents a completed-but-unreviewed or superseded preliminary
 * artifact from silently advancing InventSmith toward production readiness.
 */
export function isManufacturingMaturityEligible(
  workKind: string | undefined,
  deliverables: readonly ManufacturingMaturityDeliverable[]
): boolean {
  if (workKind !== "manufacturing_readiness") return true;

  return (
    isFreshProfessionallyReviewedDeliverable(deliverables, "prototype_readiness_assessment") &&
    isFreshProfessionallyReviewedDeliverable(deliverables, "manufacturer_rfq_package")
  );
}
