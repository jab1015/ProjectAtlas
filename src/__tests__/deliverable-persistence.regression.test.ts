import { describe, expect, it } from "vitest";
import { buildDeliverablePersistencePlan } from "@convex/deliverablePersistenceLogic";

describe("deliverable persistence decisions", () => {
  it("starts ordinary generated artifacts as versioned InventSmith drafts", () => {
    const first = buildDeliverablePersistencePlan("market_analysis", []);
    expect(first.version).toBe(1);
    expect(first.trustState).toBe("atlas_draft");
    expect(first.requiredReviews).toHaveLength(0);

    const revised = buildDeliverablePersistencePlan("market_analysis", [{ version: 1 }, { version: 3 }, { version: 2 }]);
    expect(revised.version).toBe(4);
    expect(revised.trustState).toBe("atlas_draft");
  });

  it("never persists consequential engineering output as an ordinary draft", () => {
    const plan = buildDeliverablePersistencePlan("product_design_specification", [{ version: 1 }]);
    expect(plan.version).toBe(2);
    expect(plan.trustState).toBe("professional_review_required");
    expect(plan.requiredReviews.map((review) => review.specialty)).toContain("engineering");
  });

  it("requires the correct professional gate for patent, regulatory, security, and finance artifacts", () => {
    const patent = buildDeliverablePersistencePlan("ip_readiness_brief", []);
    const regulatory = buildDeliverablePersistencePlan("regulatory_readiness_screening", []);
    const security = buildDeliverablePersistencePlan("software_security_privacy_readiness", []);
    const finance = buildDeliverablePersistencePlan("financial_model", []);

    expect(patent.trustState).toBe("professional_review_required");
    expect(patent.requiredReviews.map((review) => review.specialty)).toContain("patent");
    expect(regulatory.requiredReviews.map((review) => review.specialty)).toContain("regulatory");
    expect(security.requiredReviews.map((review) => review.requiredCredentials).join(" ")).toMatch(/security|privacy/i);
    expect(finance.requiredReviews.map((review) => review.specialty)).toContain("finance");
  });

  it("keeps the combined feasibility package behind all required professional reviews", () => {
    const plan = buildDeliverablePersistencePlan("invention_feasibility_development_package", [{ version: 4 }]);
    expect(plan.version).toBe(5);
    expect(plan.trustState).toBe("professional_review_required");
    expect(plan.requiredReviews.map((review) => review.specialty)).toEqual(expect.arrayContaining(["patent", "engineering", "regulatory"]));
  });
});
