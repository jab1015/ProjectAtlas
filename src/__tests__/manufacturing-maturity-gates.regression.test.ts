import { describe, expect, it } from "vitest";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";
import { isManufacturingMaturityEligible, isProductionMatureCad } from "@convex/manufacturingMaturityLogic";
import { requiredProfessionalReviews } from "@convex/professionalReviewPolicy";
import { selectNextWorkItem } from "@convex/workOrchestratorLogic";

const workByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

const reviewed = (kind: string, version = 1, artifactMaturity?: string) => ({
  kind,
  version,
  trustState: "professionally_reviewed",
  artifactMaturity,
});

const matureManufacturingArtifacts = () => [
  reviewed("prototype_readiness_assessment"),
  reviewed("manufacturer_rfq_package"),
  reviewed("manufacturing_drawing_specification"),
  reviewed("native_cad_package", 1, "engineering_reviewed"),
];

describe("InventSmith manufacturing maturity enforcement", () => {
  it("requires prototype readiness in the final manufacturing-readiness dependency graph", () => {
    const readiness = workByKind.get("manufacturing_readiness");
    expect(readiness?.dependsOnKinds).toEqual(expect.arrayContaining([
      "manufacturer_quote_comparison",
      "manufacturing_agreement_checklist",
      "prototype_readiness",
    ]));
  });

  it("requires qualified engineering review for native CAD packages", () => {
    expect(requiredProfessionalReviews("native_cad_package").map((review) => review.specialty)).toContain("engineering");
  });

  it("fails closed until the latest prototype, RFQ, drawings and native CAD are fresh and professionally reviewed", () => {
    expect(isManufacturingMaturityEligible("manufacturing_readiness", [])).toBe(false);

    expect(isManufacturingMaturityEligible("manufacturing_readiness", [
      ...matureManufacturingArtifacts().filter((item) => item.kind !== "manufacturer_rfq_package"),
      { kind: "manufacturer_rfq_package", version: 1, trustState: "professional_review_required" },
    ])).toBe(false);

    expect(isManufacturingMaturityEligible("manufacturing_readiness", [
      ...matureManufacturingArtifacts(),
      { kind: "manufacturer_rfq_package", version: 2, trustState: "professionally_reviewed", staleReason: "Design evidence changed" },
    ])).toBe(false);

    expect(isManufacturingMaturityEligible("manufacturing_readiness", matureManufacturingArtifacts())).toBe(true);
  });

  it("rejects preliminary, stale, or unreviewed CAD at the production-readiness boundary", () => {
    expect(isProductionMatureCad([reviewed("native_cad_package", 1, "preliminary_cad")])).toBe(false);
    expect(isProductionMatureCad([{ kind: "native_cad_package", version: 1, trustState: "professional_review_required", artifactMaturity: "engineering_reviewed" }])).toBe(false);
    expect(isProductionMatureCad([{ ...reviewed("native_cad_package", 1, "engineering_reviewed"), staleReason: "Prototype changed" }])).toBe(false);
    expect(isProductionMatureCad([reviewed("native_cad_package", 1, "engineering_reviewed")])).toBe(true);
    expect(isProductionMatureCad([reviewed("native_cad_package", 1, "manufacturing_released")])).toBe(true);
  });

  it("uses the newest CAD revision so an older reviewed package cannot mask a newer preliminary revision", () => {
    expect(isProductionMatureCad([
      reviewed("native_cad_package", 1, "engineering_reviewed"),
      { kind: "native_cad_package", version: 2, trustState: "professional_review_required", artifactMaturity: "preliminary_cad" },
    ])).toBe(false);
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
