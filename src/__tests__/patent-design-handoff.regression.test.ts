import { describe, expect, it } from "vitest";
import { CANONICAL_WORK_PLAN } from "@convex/canonicalWorkPlan";
import { FULL_JOURNEY_STAGES } from "@convex/fullJourneyDefinition";

const workByKind = new Map(CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));
const stageById = new Map(FULL_JOURNEY_STAGES.map((stage) => [stage.id, stage]));

describe("InventSmith patent-to-design handoff", () => {
  it("creates an explicit handoff after prior-art comparison, differentiators, and IP readiness", () => {
    const handoff = workByKind.get("patent_design_handoff");
    expect(handoff).toBeDefined();
    expect(handoff?.deliverableKind).toBe("patent_design_handoff");
    expect(handoff?.dependsOnKinds).toEqual(expect.arrayContaining([
      "preliminary_prior_art",
      "feature_prior_art_comparison",
      "distinguishing_features",
      "ip_readiness",
    ]));
  });

  it("does not let preliminary design directions bypass the patent handoff", () => {
    expect(workByKind.get("design_directions")?.dependsOnKinds).toContain("patent_design_handoff");
  });

  it("treats the handoff as required Patent Readiness work before Product Design + CAD", () => {
    expect(stageById.get(4)?.requiredWorkKinds).toContain("patent_design_handoff");
    expect(stageById.get(5)?.dependsOnStageIds).toContain(4);
  });
});
