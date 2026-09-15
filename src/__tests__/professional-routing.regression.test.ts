import { describe, expect, it } from "vitest";
import { FULL_JOURNEY_STAGES } from "../../convex/fullJourneyDefinition";
import { POST_CANONICAL_WORK_PLAN } from "../../convex/fullProductWorkPlan";

describe("InventSmith professional routing", () => {
  it("tells the inventor what outside expertise is needed before researching providers", () => {
    const servicePlan = POST_CANONICAL_WORK_PLAN.find((item) => item.kind === "professional_service_plan");
    const providerResearch = POST_CANONICAL_WORK_PLAN.find((item) => item.kind === "professional_provider_research");

    expect(servicePlan).toBeDefined();
    expect(providerResearch).toBeDefined();
    expect(servicePlan?.dependsOnKinds).toEqual(expect.arrayContaining([
      "engineering_handoff",
      "ip_readiness",
      "regulatory_screening",
      "factory_requirements",
    ]));
    expect(providerResearch?.dependsOnKinds).toContain("professional_service_plan");
    expect(providerResearch?.inputSnapshot.research).toBe(true);

    const instructions = String(providerResearch?.inputSnapshot.instructions ?? "").toLowerCase();
    expect(instructions).toContain("source urls");
    expect(instructions).toContain("do not contact");
    expect(instructions).toContain("without inventor approval");
    expect(instructions).toContain("never fabricate");
  });

  it("makes professional routing visible in Legal journey completion", () => {
    const legal = FULL_JOURNEY_STAGES.find((stage) => stage.id === 9);
    expect(legal?.name).toBe("Intellectual Property / Legal");
    expect(legal?.requiredWorkKinds).toEqual(expect.arrayContaining([
      "professional_legal_handoff",
      "professional_service_plan",
      "professional_provider_research",
    ]));
    expect(legal?.dependsOnStageIds).toEqual(expect.arrayContaining([4, 5, 7]));
  });
});
