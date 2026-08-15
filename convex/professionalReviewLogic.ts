export type ProfessionalReviewStatus =
  | "required"
  | "requested"
  | "in_review"
  | "changes_requested"
  | "accepted"
  | "declined";

export type ReviewDerivedTrustState = "professional_review_required" | "professionally_reviewed";

export function deriveTrustStateFromProfessionalReviews(
  statuses: ProfessionalReviewStatus[]
): ReviewDerivedTrustState {
  if (statuses.length > 0 && statuses.every((status) => status === "accepted")) {
    return "professionally_reviewed";
  }
  return "professional_review_required";
}
