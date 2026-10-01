import { requiredProfessionalReviews, type RequiredProfessionalReview } from "./professionalReviewPolicy";

export type PersistedDeliverableTrustState = "atlas_draft" | "professional_review_required";

export interface DeliverableVersionLike {
  version: number;
}

export interface DeliverablePersistencePlan {
  version: number;
  trustState: PersistedDeliverableTrustState;
  requiredReviews: RequiredProfessionalReview[];
}

/**
 * Calculates the immutable version/review state for a newly completed work artifact.
 *
 * This intentionally does not promote generated output beyond an InventSmith draft or
 * professional-review-required state. Evidence verification and qualified review are
 * separate later transitions.
 */
export function buildDeliverablePersistencePlan(
  deliverableKind: string,
  priorVersions: readonly DeliverableVersionLike[]
): DeliverablePersistencePlan {
  const version = priorVersions.reduce((highest, deliverable) => Math.max(highest, deliverable.version), 0) + 1;
  const requiredReviews = requiredProfessionalReviews(deliverableKind);

  return {
    version,
    requiredReviews,
    trustState: requiredReviews.length > 0 ? "professional_review_required" : "atlas_draft",
  };
}
