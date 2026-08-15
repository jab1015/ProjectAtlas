import { describe, expect, it } from "vitest";
import { restrictedPilotReason, triageInventionRisk } from "@convex/riskTriageLogic";

describe("controlled-pilot risk triage", () => {
  it("allows ordinary non-safety-critical consumer products", () => {
    expect(triageInventionRisk({
      title: "Adjustable countertop produce rinsing rack",
      problemStatement: "Produce sits in standing sink water while being rinsed.",
      targetAudience: "Home cooks",
      solutionDescription: "A height-adjustable rack suspends produce above the sink basin.",
    })).toEqual({ restricted: false, categories: [] });
  });

  it("flags explicitly restricted product categories", () => {
    const medical = triageInventionRisk({ title: "Portable medical device for patient diagnostics" });
    expect(medical.restricted).toBe(true);
    expect(medical.categories).toContain("medical or diagnostic product");

    const weapon = triageInventionRisk({ solutionDescription: "A firearm accessory for ammunition handling" });
    expect(weapon.restricted).toBe(true);
    expect(weapon.categories).toContain("weapon or explosive");

    const childSafety = triageInventionRisk({ title: "Convertible infant car seat" });
    expect(childSafety.restricted).toBe(true);
    expect(childSafety.categories).toContain("children's safety product");
  });

  it("produces a professional-review gate explanation without claiming a legal conclusion", () => {
    const reason = restrictedPilotReason(["life-safety or protective equipment"]);
    expect(reason).toMatch(/controlled Atlas pilot/i);
    expect(reason).toMatch(/qualified professional/i);
    expect(reason).not.toMatch(/illegal|prohibited by law/i);
  });
});
