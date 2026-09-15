import { describe, expect, it } from "vitest";
import { requiredProfessionalReviews } from "@convex/professionalReviewPolicy";

describe("professional review routing", () => {
  it("routes patent, engineering, regulatory, contracts, and finance work to the right specialty", () => {
    expect(requiredProfessionalReviews("ip_readiness_brief").map((item) => item.specialty)).toEqual(["patent"]);
    expect(requiredProfessionalReviews("engineering_handoff_brief").map((item) => item.specialty)).toEqual(["engineering"]);
    expect(requiredProfessionalReviews("regulatory_readiness_screening").map((item) => item.specialty)).toEqual(["regulatory"]);
    expect(requiredProfessionalReviews("nda_draft_package").map((item) => item.specialty)).toEqual(["contracts"]);
    expect(requiredProfessionalReviews("financial_model").map((item) => item.specialty)).toEqual(["finance"]);
  });

  it("keeps preliminary product/CAD/manufacturing release work engineering-gated", () => {
    expect(requiredProfessionalReviews("product_design_specification").map((item) => item.specialty)).toEqual(["engineering"]);
    expect(requiredProfessionalReviews("manufacturing_drawing_specification").map((item) => item.specialty)).toEqual(["engineering"]);
    expect(requiredProfessionalReviews("manufacturing_readiness_assessment").map((item) => item.specialty)).toEqual(["engineering"]);
  });

  it("requires all three reviews for the assembled feasibility package", () => {
    expect(requiredProfessionalReviews("invention_feasibility_development_package").map((item) => item.specialty))
      .toEqual(["patent", "engineering", "regulatory"]);
  });

  it("does not pretend ordinary drafts need a specialist signoff", () => {
    expect(requiredProfessionalReviews("competitor_landscape")).toEqual([]);
    expect(requiredProfessionalReviews("marketing_messaging_architecture")).toEqual([]);
  });
});
