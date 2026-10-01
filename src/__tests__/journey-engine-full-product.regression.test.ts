import { describe, expect, it } from "vitest";
import { stageConfig } from "@convex/journeyEngine";
import { CANONICAL_WORK_PLAN } from "@convex/canonicalWorkPlan";

const canonicalByKind = new Map(CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

describe("InventSmith journey engine full-product baseline", () => {
  it("does not hide stages 5 through 15 behind the old coming-soon pilot state", () => {
    expect(stageConfig).toHaveLength(15);
    for (const stage of stageConfig) {
      expect(stage.enabled, `${stage.name} should be enabled`).toBe(true);
      expect(stage.comingSoon, `${stage.name} must not be labeled coming soon`).toBe(false);
    }
  });

  it("uses the complete current stage identities", () => {
    expect(stageConfig.map((stage) => stage.name)).toEqual([
      "Idea",
      "Validation",
      "Market Research",
      "Patent Readiness",
      "Product Design + CAD",
      "Prototype",
      "Manufacturing",
      "Branding",
      "Intellectual Property / Legal",
      "Pricing",
      "Marketing",
      "Sales",
      "Funding",
      "Launch",
      "Growth",
    ]);
  });

  it("keeps the patent-to-design handoff in the canonical seed plan", () => {
    expect(canonicalByKind.get("patent_design_handoff")?.dependsOnKinds).toEqual(expect.arrayContaining([
      "preliminary_prior_art",
      "feature_prior_art_comparison",
      "distinguishing_features",
      "ip_readiness",
    ]));
    expect(canonicalByKind.get("design_directions")?.dependsOnKinds).toContain("patent_design_handoff");
  });
});
