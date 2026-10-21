import { describe, expect, it } from "vitest";
import { CANONICAL_WORK_PLAN } from "../../convex/canonicalWorkPlan";
import { POST_CANONICAL_WORK_PLAN } from "../../convex/fullProductWorkPlan";

interface WorkNode {
  kind: string;
  dependsOnKinds?: readonly string[];
}

const allWork: WorkNode[] = [...CANONICAL_WORK_PLAN, ...POST_CANONICAL_WORK_PLAN];
const byKind = new Map(allWork.map((item) => [item.kind, item]));

function expectDepends(kind: string, dependencies: string[]) {
  const item = byKind.get(kind);
  expect(item, `missing work item ${kind}`).toBeDefined();
  expect(item?.dependsOnKinds ?? [], `${kind} dependencies`).toEqual(expect.arrayContaining(dependencies));
}

function reaches(start: string, target: string): boolean {
  const visited = new Set<string>();
  const visit = (kind: string): boolean => {
    if (kind === target) return true;
    if (visited.has(kind)) return false;
    visited.add(kind);
    const node = byKind.get(kind);
    return (node?.dependsOnKinds ?? []).some((dependency) => visit(dependency));
  };
  return visit(start);
}

describe("InventSmith representative idea-to-market wiring", () => {
  it("does not reference missing work dependencies or introduce dependency cycles", () => {
    for (const item of allWork) {
      for (const dependency of item.dependsOnKinds ?? []) {
        expect(byKind.has(dependency), `${item.kind} depends on missing ${dependency}`).toBe(true);
        expect(dependency, `${item.kind} must not depend on itself`).not.toBe(item.kind);
      }
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (kind: string) => {
      if (visited.has(kind)) return;
      expect(visiting.has(kind), `dependency cycle detected at ${kind}`).toBe(false);
      visiting.add(kind);
      for (const dependency of byKind.get(kind)?.dependsOnKinds ?? []) visit(dependency);
      visiting.delete(kind);
      visited.add(kind);
    };
    for (const kind of byKind.keys()) visit(kind);
  });

  it("connects patent intelligence directly into strategic Product Design", () => {
    expectDepends("patent_design_handoff", [
      "preliminary_prior_art",
      "feature_prior_art_comparison",
      "distinguishing_features",
      "ip_readiness",
    ]);
    expectDepends("design_candidate_generation", ["patent_design_handoff", "design_directions", "product_requirements"]);
    expect(reaches("design_candidate_generation", "preliminary_prior_art")).toBe(true);
  });

  it("connects selected design and drawing requirements into native CAD and physical prototyping", () => {
    expectDepends("native_cad_generation", [
      "product_design_specification",
      "cad_model_specification",
      "manufacturing_drawing_specification",
    ]);
    expectDepends("prototype_strategy", ["product_design_specification"]);
    expectDepends("prototype_sourcing_plan", ["prototype_strategy", "native_cad_generation"]);
    expectDepends("prototype_evidence_assessment", ["prototype_test_plan"]);
    expectDepends("prototype_design_gap_analysis", ["prototype_evidence_assessment"]);
  });

  it("connects CAD and engineering preparation into factory RFQ and manufacturing readiness", () => {
    expectDepends("manufacturer_rfq_package", [
      "factory_requirements",
      "native_cad_generation",
      "manufacturing_drawing_specification",
    ]);
    expectDepends("manufacturer_quote_comparison", ["manufacturer_scorecard", "manufacturing_unit_economics"]);
    expectDepends("manufacturing_readiness", ["manufacturer_quote_comparison", "manufacturing_agreement_checklist"]);
    expect(reaches("manufacturing_readiness", "native_cad_generation")).toBe(true);
  });

  it("connects manufacturing economics and commercial planning into the funding package", () => {
    expectDepends("financial_model", ["sales_projection", "manufacturing_unit_economics", "marketing_plan"]);
    expectDepends("pitch_deck_content", ["funding_strategy", "financial_model", "product_design_specification"]);
    expectDepends("funding_readiness", ["pitch_deck_content", "investor_faq", "funding_source_research"]);
    expect(reaches("funding_readiness", "manufacturing_unit_economics")).toBe(true);
    expect(reaches("funding_readiness", "product_design_specification")).toBe(true);
  });

  it("connects launch readiness to manufacturing and commercial work and growth to actual launch evidence", () => {
    expectDepends("launch_readiness", ["manufacturing_readiness", "marketing_plan", "sales_projection"]);
    expectDepends("launch_performance", ["customer_feedback_loop"]);
    expectDepends("post_launch_priorities", ["launch_performance"]);
    expectDepends("growth_audit", ["launch_performance", "post_launch_priorities"]);
    expectDepends("growth_roadmap", ["growth_levers"]);
    expectDepends("growth_performance_reporting", ["growth_roadmap"]);
    expect(reaches("growth_performance_reporting", "launch_performance")).toBe(true);
    expect(reaches("launch_readiness", "native_cad_generation")).toBe(true);
  });
});
