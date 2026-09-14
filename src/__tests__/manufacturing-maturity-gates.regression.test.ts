import { describe, expect, it } from "vitest";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";
import { isManufacturingMaturityEligible } from "@convex/manufacturingMaturityLogic";
import { selectNextWorkItem } from "@convex/workOrchestratorLogic";

const workByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

const reviewed = (kind: string, version = 1) => ({
  kind,
  version,
  trustState: "professionally_reviewed",
});

describe("InventSmith manufacturing maturity enforcement", () => {
  it("requires prototype readiness in the final manufacturing-readiness dependency graph", () => {
    const readiness = workByKind.get("manufacturing_readiness");
    expect(readiness?.dependsOnKinds).toEqual(expect.arrayContaining([
      "manufacturer_quote_comparison",
      "manufacturing_agreement_checklist",
      "prototype_readiness",
    ]));
  });

  it("fails closed until the latest prototype readiness and RFQ package are fresh and professionally reviewed", () => {
    expect(isManufacturingMaturityEligible("manufacturing_readiness", [])).toBe(false);

    expect(isManufacturingMaturityEligible("manufacturing_readiness", [
      reviewed("prototype_readiness_assessment"),
      { kind: "manufacturer_rfq_package", version: 1, trustState: "professional_review_required" },
    ])).toBe(false);

    expect(isManufacturingMaturityEligible("manufacturing_readiness", [
      reviewed("prototype_readiness_assessment"),
      reviewed("manufacturer_rfq_package", 1),
      { kind: "manufacturer_rfq_package", version: 2, trustState: "professionally_reviewed", staleReason: "Design evidence changed" },
    ])).toBe(false);

    expect(isManufacturingMaturityEligible("manufacturing_readiness", [
      reviewed("prototype_readiness_assessment"),
      reviewed("manufacturer_rfq_package"),
    ])).toBe(true);
  });

  it("does not over-block early manufacturing preparation", () => {
    expect(isManufacturingMaturityEligible("manufacturer_sourcing", [])).toBe(true);
    expect(isManufacturingMaturityEligible("manufacturer_rfq_package", [])).toBe(true);
    expect(isManufacturingMaturityEligible("manufacturer_quote_evidence", [])).toBe(true);
  });

  it("keeps a dependency-complete manufacturing-readiness item unschedulable until maturity is satisfied", () => {
    const base = [
      { _id: "quote", kind: "manufacturer_quote_comparison", status: "completed", priority: 50, createdAt: 1, attemptCount: 1 },
      { _id: "agreement", kind: "manufacturing_agreement_checklist", status: "completed", priority: 49, createdAt: 2, attemptCount: 1 },
      { _id: "prototype", kind: "prototype_readiness", status: "completed", priority: 57, createdAt: 3, attemptCount: 1 },
      {
        _id: "readiness",
        kind: "manufacturing_readiness",
        status: "queued",
        priority: 48,
        createdAt: 4,
        attemptCount: 0,
        estimatedCostUnits: 1,
        dependsOnKinds: ["manufacturer_quote_comparison", "manufacturing_agreement_checklist", "prototype_readiness"],
      },
    ];

    const blocked = selectNextWorkItem(base, 10, 100, () => true, (kind) => kind !== "manufacturing_readiness");
    expect(blocked.selected).toBeNull();
    expect(blocked.reason).toBe("no_eligible_work");

    const allowed = selectNextWorkItem(base, 10, 100, () => true, () => true);
    expect(allowed.selected?._id).toBe("readiness");
  });
});
