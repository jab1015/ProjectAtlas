import { describe, expect, it } from "vitest";
import { requiredProfessionalReviews } from "@convex/professionalReviewPolicy";

describe("professional review routing", () => {
  it("routes patent, engineering, and regulatory work to the right specialty", () => {
    expect(requiredProfessionalReviews("ip_readiness_brief").map((item) => item.specialty)).toEqual(["patent"]);
    expect(requiredProfessionalReviews("engineering_handoff_brief").map((item) => item.specialty)).toEqual(["engineering"]);
    expect(requiredProfessionalReviews("regulatory_readiness_screening").map((item) => item.specialty)).toEqual(["regulatory"]);
  });

  it("requires all three reviews for the assembled package", () => {
    expect(requiredProfessionalReviews("invention_feasibility_development_package").map((item) => item.specialty))
      .toEqual(["patent", "engineering", "regulatory"]);
  });

  it("does not pretend ordinary drafts need a specialist signoff", () => {
    expect(requiredProfessionalReviews("competitor_landscape")).toEqual([]);
  });
});
