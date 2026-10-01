import { describe, expect, it } from "vitest";
import { impactedWorkKindsForEvidence } from "@convex/evidenceImpactScopeLogic";

const items = [
  { kind: "manufacturer_quote_evidence", dependsOnKinds: ["manufacturer_rfq_package"] },
  { kind: "manufacturing_unit_economics", dependsOnKinds: ["manufacturer_rfq_package"] },
  { kind: "manufacturer_quote_comparison", dependsOnKinds: ["manufacturer_quote_evidence", "manufacturing_unit_economics"] },
  { kind: "manufacturing_agreement_checklist", dependsOnKinds: ["manufacturer_quote_comparison"] },
  { kind: "manufacturing_readiness", dependsOnKinds: ["manufacturer_quote_comparison", "manufacturing_agreement_checklist", "prototype_readiness"] },
  { kind: "market_analysis", dependsOnKinds: ["validation_research"] },
];

describe("InventSmith scoped real-world evidence impact", () => {
  it("refreshes quote-dependent costing and downstream manufacturing readiness only", () => {
    const impacted = impactedWorkKindsForEvidence(items, "manufacturer_quote");
    expect(impacted).not.toBeNull();
    expect([...impacted!]).toEqual(expect.arrayContaining([
      "manufacturer_quote_evidence",
      "manufacturing_unit_economics",
      "manufacturer_quote_comparison",
      "manufacturing_agreement_checklist",
      "manufacturing_readiness",
    ]));
    expect(impacted!.has("market_analysis")).toBe(false);
  });

  it("retains conservative broad invalidation for unclassified general evidence", () => {
    expect(impactedWorkKindsForEvidence(items, "interview")).toBeNull();
    expect(impactedWorkKindsForEvidence(items, undefined)).toBeNull();
  });
});
