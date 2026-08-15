import { describe, expect, it } from "vitest";
import { CANONICAL_WORK_PLAN, missingCanonicalWorkKinds } from "@convex/canonicalWorkPlan";

describe("canonical workspace migration", () => {
  it("contains the complete controlled-pilot autonomous chain", () => {
    const kinds = CANONICAL_WORK_PLAN.map((item) => item.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
    expect(kinds).toEqual(expect.arrayContaining([
      "idea_capture",
      "brief_analysis",
      "competitor_discovery",
      "market_feasibility",
      "preliminary_prior_art",
      "technical_feasibility",
      "feature_prior_art_comparison",
      "distinguishing_features",
      "materials_manufacturing",
      "regulatory_screening",
      "product_requirements",
      "design_directions",
      "preliminary_bom_cost",
      "concept_image_generation",
      "ip_readiness",
      "development_risks",
      "engineering_handoff",
      "evidence_verification",
      "feasibility_recommendation",
      "package_assembly",
    ]));
  });

  it("adds only missing work kinds so repeated migrations are idempotent", () => {
    const existing = ["idea_capture", "brief_analysis", "competitor_discovery"];
    const missing = missingCanonicalWorkKinds(existing);
    expect(missing.some((item) => item.kind === "idea_capture")).toBe(false);
    expect(missing.some((item) => item.kind === "package_assembly")).toBe(true);
    expect(missing.length).toBe(CANONICAL_WORK_PLAN.length - existing.length);
    expect(missingCanonicalWorkKinds(CANONICAL_WORK_PLAN.map((item) => item.kind))).toHaveLength(0);
  });

  it("keeps every dependency pointed at a canonical work kind", () => {
    const kinds = new Set(CANONICAL_WORK_PLAN.map((item) => item.kind));
    for (const item of CANONICAL_WORK_PLAN) {
      for (const dependency of item.dependsOnKinds ?? []) expect(kinds.has(dependency)).toBe(true);
    }
  });
});
