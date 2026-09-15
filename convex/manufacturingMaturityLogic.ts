import { NATIVE_CAD_DELIVERABLE_KINDS } from "./cadArtifactKinds";

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
  const candidates = deliverables.filter((deliverable) => deliverable.kind === kind);
  if (candidates.length === 0) return undefined;
  const maxVersion = candidates.reduce((highest, deliverable) => Math.max(highest, deliverable.version), Number.NEGATIVE_INFINITY);
  const latest = candidates.filter((deliverable) => deliverable.version === maxVersion);
  return latest.length === 1 ? latest[0] : undefined;
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
  const latestCad = NATIVE_CAD_DELIVERABLE_KINDS.map((kind) => latestDeliverable(deliverables, kind));
  if (latestCad.some((deliverable) => !deliverable)) return false;

  const concreteCad = latestCad as ManufacturingMaturityDeliverable[];
  const revisionVersions = new Set(concreteCad.map((deliverable) => deliverable.version));
  if (revisionVersions.size !== 1) return false;

  return concreteCad.every((deliverable) =>
    !deliverable.staleReason &&
    REVIEWED_TRUST_STATES.has(deliverable.trustState) &&
    Boolean(deliverable.artifactMaturity && PRODUCTION_CAD_MATURITY.has(deliverable.artifactMaturity))
  );
}

/**
 * Consequential manufacturing readiness must fail closed on engineering maturity.
 *
 * Early process research, sourcing, scorecards, and draft RFQ preparation remain
 * useful before prototype completion. The final manufacturing-readiness assessment,
 * however, may run only after the latest prototype-readiness assessment, manufacturer
 * RFQ package, and manufacturing drawing specification have passed engineering review,
 * remain fresh, and every artifact in the newest concrete native-CAD generation pass
 * (STEP, STL, DXF, editable source, orthographic views, and exploded view) has reached
 * engineering-reviewed or manufacturing-released maturity. This prevents preliminary,
 * stale, partially reviewed, duplicate-version, or mixed-generation CAD from silently
 * advancing InventSmith toward a production commitment.
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
