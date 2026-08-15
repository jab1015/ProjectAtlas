import { describe, expect, it } from "vitest";
import { FULL_JOURNEY_STAGES } from "@convex/fullJourneyDefinition";
import { lifecycleStages } from "@convex/lifecycleDepartments";

const stageById = new Map(FULL_JOURNEY_STAGES.map((stage) => [stage.id, stage]));
const lifecycleById = new Map(lifecycleStages.map((stage) => [stage.id, stage]));

function expectStageWork(stageId: number, requiredKinds: string[]) {
  const stage = stageById.get(stageId);
  expect(stage, `missing journey stage ${stageId}`).toBeDefined();
  for (const kind of requiredKinds) {
    expect(stage?.requiredWorkKinds, `stage ${stageId} missing ${kind}`).toContain(kind);
  }
}

describe("InventSmith full idea-to-market journey", () => {
  it("keeps all 15 inventor stages in the product destination", () => {
    expect(FULL_JOURNEY_STAGES).toHaveLength(15);
    expect(FULL_JOURNEY_STAGES.map((stage) => stage.id)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
    expect(FULL_JOURNEY_STAGES.map((stage) => stage.name)).toEqual([
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

  it("locks the mandatory product-design and native-CAD destination into stage 5", () => {
    expectStageWork(5, [
      "design_candidate_generation",
      "design_candidate_scoring",
      "product_design_specification",
      "cad_model_specification",
      "exploded_view_specification",
      "manufacturing_drawing_specification",
      "native_cad_generation",
    ]);
  });

  it("locks prototype evidence and design feedback into stage 6", () => {
    expectStageWork(6, [
      "prototype_strategy",
      "prototype_sourcing_plan",
      "prototype_test_plan",
      "prototype_evidence_assessment",
      "prototype_design_gap_analysis",
      "prototype_readiness",
    ]);
  });

  it("locks factory sourcing, RFQs, quote comparison and readiness into manufacturing", () => {
    expectStageWork(7, [
      "manufacturing_process_plan",
      "factory_requirements",
      "manufacturer_sourcing",
      "manufacturer_rfq_package",
      "manufacturer_scorecard",
      "manufacturing_unit_economics",
      "manufacturer_quote_comparison",
      "manufacturing_agreement_checklist",
      "manufacturing_readiness",
    ]);
  });

  it("locks legal, NDA, contract and professional handoff work into the journey", () => {
    expectStageWork(9, [
      "ip_strategy_plan",
      "invention_disclosure_package",
      "nda_draft_package",
      "contracting_package",
      "ip_status_tracker",
      "professional_legal_handoff",
    ]);
  });

  it("locks evidence-backed funding and pitch work into stage 13", () => {
    expectStageWork(13, [
      "funding_strategy",
      "funding_source_research",
      "financial_model",
      "pitch_deck_content",
      "investor_faq",
      "funding_readiness",
    ]);
  });

  it("keeps launch and post-launch growth as real destination departments", () => {
    expectStageWork(14, ["launch_readiness", "launch_playbook", "customer_feedback_loop", "launch_performance", "post_launch_priorities"]);
    expectStageWork(15, ["growth_audit", "growth_levers", "growth_roadmap", "retention_system", "growth_performance_reporting"]);
  });

  it("requires implementation definitions for every post-design department", () => {
    for (let stageId = 6; stageId <= 15; stageId += 1) {
      const journey = stageById.get(stageId);
      const lifecycle = lifecycleById.get(stageId);
      expect(lifecycle, `stage ${stageId} has no executable lifecycle department`).toBeDefined();
      expect(lifecycle?.name).toBe(journey?.name);
      const executableKinds = new Set(lifecycle?.work.map((item) => item.kind));
      for (const kind of journey?.requiredWorkKinds ?? []) {
        expect(executableKinds.has(kind), `${journey?.name} has no executable definition for ${kind}`).toBe(true);
      }
    }
  });
});
