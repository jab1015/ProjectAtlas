import { describe, expect, it } from "vitest";
import { FULL_JOURNEY_STAGES } from "@convex/fullJourneyDefinition";
import { CANONICAL_WORK_PLAN } from "@convex/canonicalWorkPlan";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";

const allKinds = new Set([
  ...CANONICAL_WORK_PLAN.map((item) => item.kind),
  ...POST_CANONICAL_WORK_PLAN.map((item) => item.kind),
]);

describe("InventSmith autonomous full-product work plan", () => {
  it("contains every required work kind for all 15 stages without requiring page discovery", () => {
    for (const stage of FULL_JOURNEY_STAGES) {
      for (const kind of stage.requiredWorkKinds) {
        expect(allKinds.has(kind), `${stage.name} missing autonomous work ${kind}`).toBe(true);
      }
    }
  });

  it("includes native CAD as engine-owned queued work", () => {
    const cad = POST_CANONICAL_WORK_PLAN.find((item) => item.kind === "native_cad_generation");
    expect(cad).toBeDefined();
    expect(cad?.inputSnapshot.executionMode).toBe("native_cad");
    expect(cad?.dependsOnKinds).toEqual(expect.arrayContaining([
      "product_design_specification",
      "cad_model_specification",
      "manufacturing_drawing_specification",
    ]));
  });

  it("keeps downstream factory, legal, pitch, launch and growth work in the autonomous plan", () => {
    for (const kind of [
      "manufacturer_sourcing",
      "manufacturer_rfq_package",
      "nda_draft_package",
      "contracting_package",
      "professional_legal_handoff",
      "pitch_deck_content",
      "funding_readiness",
      "launch_playbook",
      "growth_roadmap",
    ]) {
      expect(allKinds.has(kind), `missing ${kind}`).toBe(true);
    }
  });
});
