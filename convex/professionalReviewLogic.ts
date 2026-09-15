import { isNativeCadDeliverableKind } from "./cadArtifactKinds";

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
  isCurrentRevision?: boolean;
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
 * Engineering review can promote only the exact fresh current concrete native CAD
 * artifact that was reviewed, and only after every review required for that artifact
 * is accepted. Historical revisions may retain already-earned engineering maturity,
 * but accepting an old revision after a newer same-kind artifact exists cannot newly
 * promote it. If a required review is later rejected/changed or the artifact becomes
 * stale, engineering maturity is invalidated back to preliminary CAD. Manufacturing
 * release remains a separate consequential authorization boundary and is revoked when
 * its professional-review basis becomes invalid or the released revision is superseded.
 */
export function deriveArtifactMaturityFromProfessionalReviews(input: ArtifactMaturityInput): string | undefined {
  if (!isNativeCadDeliverableKind(input.deliverableKind)) return input.currentMaturity;

  const exactReviews = input.reviews.filter((review) => review.deliverableId === input.deliverableId);
  const allRequiredReviewsAccepted = exactReviews.length > 0 && exactReviews.every((review) => review.status === "accepted");
  const acceptedEngineeringReview = exactReviews.some((review) => review.specialty === "engineering" && review.status === "accepted");
  const reviewSetQualifies = !input.staleReason && allRequiredReviewsAccepted && acceptedEngineeringReview;
  const isCurrentRevision = input.isCurrentRevision !== false;

  if (input.currentMaturity === "manufacturing_released") {
    if (!reviewSetQualifies) return "preliminary_cad";
    if (!isCurrentRevision) return "engineering_reviewed";
    return "manufacturing_released";
  }

  if (reviewSetQualifies && isCurrentRevision) return "engineering_reviewed";
  if (input.currentMaturity === "engineering_reviewed" && !reviewSetQualifies) return "preliminary_cad";
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
