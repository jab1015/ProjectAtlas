import { describe, expect, it } from "vitest";
import {
  deriveTrustStateFromProfessionalReviews,
  validateProfessionalReviewRecord,
} from "@convex/professionalReviewLogic";

describe("professional review trust promotion", () => {
  it("requires every assigned professional review to be accepted", () => {
    expect(deriveTrustStateFromProfessionalReviews(["accepted", "accepted"])).toBe("professionally_reviewed");
    expect(deriveTrustStateFromProfessionalReviews(["accepted", "in_review"])).toBe("professional_review_required");
    expect(deriveTrustStateFromProfessionalReviews(["accepted", "changes_requested"])).toBe("professional_review_required");
    expect(deriveTrustStateFromProfessionalReviews([])).toBe("professional_review_required");
  });

  it("requires an auditable reviewer identity/reference before a review can be recorded", () => {
    expect(validateProfessionalReviewRecord({
      reviewerName: "Dr. Avery Chen",
      accepted: true,
    })).toEqual({
      valid: false,
      error: "Reviewer reference is required so the professional review remains auditable",
    });

    expect(validateProfessionalReviewRecord({
      reviewerName: "  Dr. Avery Chen  ",
      reviewerReference: "  PE-12345 / Example Engineering  ",
      accepted: true,
    })).toEqual({
      valid: true,
      reviewerName: "Dr. Avery Chen",
      reviewerReference: "PE-12345 / Example Engineering",
      notes: undefined,
    });
  });

  it("requires actionable notes when a professional requests changes", () => {
    expect(validateProfessionalReviewRecord({
      reviewerName: "Avery Chen",
      reviewerReference: "PE-12345",
      accepted: false,
      notes: " ",
    })).toEqual({
      valid: false,
      error: "Changes-requested reviews must explain what needs to change",
    });

    expect(validateProfessionalReviewRecord({
      reviewerName: "Avery Chen",
      reviewerReference: "PE-12345",
      accepted: false,
      notes: "Increase the wall thickness around the load-bearing boss.",
    })).toMatchObject({
      valid: true,
      notes: "Increase the wall thickness around the load-bearing boss.",
    });
  });
});
