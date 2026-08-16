import { describe, expect, it } from "vitest";
import { restrictedPilotReason, triageInventionRisk } from "@convex/riskTriageLogic";

describe("InventSmith runtime risk triage", () => {
  it("allows ordinary non-safety-critical consumer products", () => {
    expect(triageInventionRisk({
      title: "Adjustable countertop produce rinsing rack",
      problemStatement: "Produce sits in standing sink water while being rinsed.",
      targetAudience: "Home cooks",
      solutionDescription: "A height-adjustable rack suspends produce above the sink basin.",
    })).toMatchObject({ restricted: false, professionalReviewRequired: false, categories: [] });
  });

  it("distinguishes regulated professional-review products from unsupported harmful products", () => {
    const medical = triageInventionRisk({ title: "Portable medical device for patient diagnostics" });
    expect(medical.restricted).toBe(false);
    expect(medical.professionalReviewRequired).toBe(true);
    expect(medical.categories).toContain("medical or diagnostic product");

    const childSafety = triageInventionRisk({ title: "Convertible infant car seat for child safety" });
    expect(childSafety.restricted).toBe(false);
    expect(childSafety.professionalReviewRequired).toBe(true);
    expect(childSafety.categories).toContain("children's safety product");

    const weapon = triageInventionRisk({ solutionDescription: "An explosive device designed as a weapon system." });
    expect(weapon.restricted).toBe(true);
    expect(weapon.professionalReviewRequired).toBe(false);
    expect(weapon.categories).toContain("weapon or destructive device");
  });

  it("produces an unsupported-category explanation without pretending it is a legal conclusion", () => {
    const reason = restrictedPilotReason(["weapon or destructive device"]);
    expect(reason).toMatch(/InventSmith does not autonomously develop/i);
    expect(reason).not.toMatch(/illegal|prohibited by law/i);
  });
});
