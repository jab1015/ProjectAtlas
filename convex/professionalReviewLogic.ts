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

export type ProfessionalReviewRecordValidation =
  | {
      valid: true;
      reviewerName: string;
      reviewerReference: string;
      notes?: string;
    }
  | {
      valid: false;
      error: string;
    };

export function deriveTrustStateFromProfessionalReviews(
  statuses: ProfessionalReviewStatus[]
): ReviewDerivedTrustState {
  if (statuses.length > 0 && statuses.every((status) => status === "accepted")) {
    return "professionally_reviewed";
  }
  return "professional_review_required";
}

/**
 * A professional-review status must remain auditable to a real reviewer.
 * InventSmith does not verify licenses automatically, but it requires a durable
 * reference that an administrator can trace back to the reviewer/engagement.
 */
export function validateProfessionalReviewRecord(
  input: ProfessionalReviewRecordInput
): ProfessionalReviewRecordValidation {
  const reviewerName = input.reviewerName.trim();
  const reviewerReference = input.reviewerReference?.trim() ?? "";
  const notes = input.notes?.trim() || undefined;

  if (reviewerName.length < 2) {
    return { valid: false, error: "Reviewer name is required" };
  }
  if (reviewerReference.length < 3) {
    return {
      valid: false,
      error: "Reviewer reference is required so the professional review remains auditable",
    };
  }
  if (!input.accepted && (!notes || notes.length < 3)) {
    return {
      valid: false,
      error: "Changes-requested reviews must explain what needs to change",
    };
  }

  return {
    valid: true,
    reviewerName,
    reviewerReference,
    notes,
  };
}
