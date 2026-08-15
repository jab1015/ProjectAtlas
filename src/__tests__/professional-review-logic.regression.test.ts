import { describe, expect, it } from "vitest";
import { deriveTrustStateFromProfessionalReviews } from "@convex/professionalReviewLogic";

describe("professional review trust promotion", () => {
  it("requires every assigned professional review to be accepted", () => {
    expect(deriveTrustStateFromProfessionalReviews(["accepted", "accepted"])).toBe("professionally_reviewed");
    expect(deriveTrustStateFromProfessionalReviews(["accepted", "in_review"])).toBe("professional_review_required");
    expect(deriveTrustStateFromProfessionalReviews(["accepted", "changes_requested"])).toBe("professional_review_required");
    expect(deriveTrustStateFromProfessionalReviews([])).toBe("professional_review_required");
  });
});
