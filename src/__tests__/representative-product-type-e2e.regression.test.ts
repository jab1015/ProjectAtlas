import { describe, expect, it } from "vitest";
import { classifyInvention } from "@convex/inventionClassificationLogic";
import { buildInventionWorkPlan } from "@convex/inventionWorkPlanLogic";
import { journeyStagesForProductType } from "@convex/fullJourneyDefinition";

type PlannedItem = {
  kind: string;
  dependsOnKinds?: readonly string[];
  inputSnapshot?: Record<string, unknown>;
};

function planFor(input: { title: string; problemStatement?: string; solutionDescription?: string }) {
  const classification = classifyInvention(input);
  const plan = buildInventionWorkPlan(classification);
  const items = [...plan.canonical, ...plan.postCanonical] as PlannedItem[];
  const byKind = new Map(items.map((item) => [item.kind, item]));
  return { classification, plan, items, byKind };
}

function expectDependencyClosure(items: PlannedItem[]) {
  const kinds = new Set(items.map((item) => item.kind));
  for (const item of items) {
    for (const dependency of item.dependsOnKinds ?? []) {
      expect(kinds.has(dependency), `${item.kind} depends on absent ${dependency}`).toBe(true);
    }
  }
}

function expectJourneyWorkCovered(productType: "physical" | "software" | "hybrid", items: PlannedItem[]) {
  const kinds = new Set(items.map((item) => item.kind));
  for (const stage of journeyStagesForProductType(productType)) {
    for (const required of stage.requiredWorkKinds) {
      expect(kinds.has(required), `${productType} stage ${stage.id} missing ${required}`).toBe(true);
    }
  }
}

describe("InventSmith representative product-type end-to-end acceptance", () => {
  it("carries a physical invention from intake routing through real-world prototype, supplier, launch and growth gates", () => {
    const { classification, items, byKind } = planFor({
      title: "Accessible adjustable jar opener",
      problemStatement: "People with limited grip strength struggle with sealed jars.",
      solutionDescription: "A mechanical handheld adjustable gripping tool manufactured from molded and metal components.",
    });

    expect(classification.productType).toBe("physical");
    expect(classification.supportClass).toBe("standard");
    expectDependencyClosure(items);
    expectJourneyWorkCovered("physical", items);

    for (const kind of [
      "preliminary_prior_art",
      "patent_design_handoff",
      "product_design_specification",
      "native_cad_generation",
      "prototype_test_plan",
      "prototype_physical_evidence",
      "prototype_evidence_assessment",
      "manufacturer_rfq_package",
      "manufacturer_quote_evidence",
      "manufacturer_quote_comparison",
      "launch_actual_evidence",
      "launch_performance",
      "growth_roadmap",
      "growth_performance_reporting",
    ]) expect(byKind.has(kind), `physical plan missing ${kind}`).toBe(true);

    expect(byKind.get("prototype_evidence_assessment")?.dependsOnKinds).toContain("prototype_physical_evidence");
    expect(byKind.get("manufacturer_quote_comparison")?.dependsOnKinds).toContain("manufacturer_quote_evidence");
    expect(byKind.get("launch_performance")?.dependsOnKinds).toContain("launch_actual_evidence");
    expect(byKind.has("software_architecture")).toBe(false);
  });

  it("carries a software invention through product design, security, QA, release and actual-market evidence without physical manufacturing fiction", () => {
    const { classification, items, byKind } = planFor({
      title: "Family care coordination app",
      problemStatement: "Families struggle to coordinate care tasks and schedules.",
      solutionDescription: "A secure iOS, Android and web application with shared schedules, alerts, tasks and family messaging.",
    });

    expect(classification.productType).toBe("software");
    expect(classification.supportClass).toBe("standard");
    expectDependencyClosure(items);
    expectJourneyWorkCovered("software", items);

    for (const kind of [
      "preliminary_prior_art",
      "patent_design_handoff",
      "software_product_specification",
      "software_ux_flow_design",
      "software_architecture",
      "software_data_model",
      "software_security_privacy_review",
      "software_prototype_plan",
      "software_implementation_plan",
      "software_qa_test_plan",
      "software_beta_release_readiness",
      "software_distribution_release_plan",
      "launch_actual_evidence",
      "launch_performance",
      "growth_roadmap",
    ]) expect(byKind.has(kind), `software plan missing ${kind}`).toBe(true);

    expect(String(byKind.get("software_qa_test_plan")?.inputSnapshot?.instructions ?? "")).toMatch(/Never report tests as passed without real execution evidence/i);
    expect(String(byKind.get("software_beta_release_readiness")?.inputSnapshot?.instructions ?? "")).toMatch(/without real deployment\/test evidence/i);
    expect(byKind.has("native_cad_generation")).toBe(false);
    expect(byKind.has("prototype_physical_evidence")).toBe(false);
    expect(byKind.has("manufacturer_quote_evidence")).toBe(false);
  });

  it("requires both physical and software reality paths for a hybrid invention without dropping shared downstream commercialization", () => {
    const { classification, items, byKind } = planFor({
      title: "Connected household leak sensor",
      problemStatement: "Small plumbing leaks often go unnoticed until damage occurs.",
      solutionDescription: "A physical wireless water sensor with embedded electronics and a companion mobile/cloud application that reports leak alerts.",
    });

    expect(classification.productType).toBe("hybrid");
    expectDependencyClosure(items);
    expectJourneyWorkCovered("hybrid", items);

    for (const kind of [
      "native_cad_generation",
      "prototype_physical_evidence",
      "manufacturer_quote_evidence",
      "software_architecture",
      "software_security_privacy_review",
      "software_qa_test_plan",
      "software_distribution_release_plan",
      "pricing_strategy",
      "marketing_plan",
      "funding_readiness",
      "launch_actual_evidence",
      "launch_performance",
      "growth_performance_reporting",
    ]) expect(byKind.has(kind), `hybrid plan missing ${kind}`).toBe(true);
  });

  it("keeps regulated products in the supported journey while preserving professional-review requirements", () => {
    const { classification, items, byKind } = planFor({
      title: "Rehabilitation tracking medical device",
      solutionDescription: "A connected medical rehabilitation device and patient application used by clinics to track prescribed exercise activity.",
    });

    expect(classification.supportClass).toBe("regulated_review");
    expect(classification.professionalReviewAreas.length).toBeGreaterThan(0);
    expectDependencyClosure(items);
    expect(byKind.has("professional_service_plan")).toBe(true);
    expect(byKind.has("professional_provider_research")).toBe(true);
    expect(byKind.has("regulatory_screening")).toBe(true);
    expect(byKind.has("software_security_privacy_review")).toBe(true);
  });
});
