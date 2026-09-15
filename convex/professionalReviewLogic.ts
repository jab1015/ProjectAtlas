export type ProfessionalReviewStatus =
  | "required"
  | "requested"
  | "in_review"
  | "changes_requested"
  | "accepted"
  | "declined";

export type ReviewDerivedTrustState = "professional_review_required" | "professionally_reviewed";

export interface ProfessionalReviewRecordInput {
  reviewerName: string;
  reviewerReference?: string;
  notes?: string;
  accepted: boolean;
}

export interface ArtifactMaturityReview {
  specialty: string;
  status: ProfessionalReviewStatus;
  deliverableId: string;
}

export interface ArtifactMaturityInput {
  deliverableId: string;
  deliverableKind: string;
  currentMaturity?: string;
  staleReason?: string;
  reviews: readonly ArtifactMaturityReview[];
}

export type ProfessionalReviewRecordValidation =
  | { valid: true; reviewerName: string; reviewerReference: string; notes?: string }
  | { valid: false; error: string };

export function deriveTrustStateFromProfessionalReviews(statuses: ProfessionalReviewStatus[]): ReviewDerivedTrustState {
  if (statuses.length > 0 && statuses.every((status) => status === "accepted")) return "professionally_reviewed";
  return "professional_review_required";
}

/**
 * Engineering review can promote only the exact fresh native CAD artifact that
 * was reviewed. If the review is later rejected/changed or the artifact becomes
 * stale, engineering maturity is invalidated back to preliminary CAD. A separate
 * manufacturing release is never created or revoked here because it is its own
 * consequential authorization boundary.
 */
export function deriveArtifactMaturityFromProfessionalReviews(input: ArtifactMaturityInput): string | undefined {
  if (input.deliverableKind !== "native_cad_package") return input.currentMaturity;
  if (input.currentMaturity === "manufacturing_released") return input.currentMaturity;

  const acceptedEngineeringReview = !input.staleReason && input.reviews.some(
    (review) => review.deliverableId === input.deliverableId && review.specialty === "engineering" && review.status === "accepted"
  );

  if (acceptedEngineeringReview) return "engineering_reviewed";
  if (input.currentMaturity === "engineering_reviewed") return "preliminary_cad";
  return input.currentMaturity;
}

/** A recorded professional review must remain auditable to a real reviewer. */
export function validateProfessionalReviewRecord(input: ProfessionalReviewRecordInput): ProfessionalReviewRecordValidation {
  const reviewerName = input.reviewerName.trim();
  const reviewerReference = input.reviewerReference?.trim() ?? "";
  const notes = input.notes?.trim() || undefined;
  if (reviewerName.length < 2) return { valid: false, error: "Reviewer name is required" };
  if (reviewerReference.length < 3) return { valid: false, error: "Reviewer reference is required so the professional review remains auditable" };
  if (!input.accepted && (!notes || notes.length < 3)) return { valid: false, error: "Changes-requested reviews must explain what needs to change" };
  return { valid: true, reviewerName, reviewerReference, notes };
}
