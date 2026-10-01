import { describe, expect, it } from "vitest";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";
import { NATIVE_CAD_DELIVERABLE_KINDS } from "@convex/cadArtifactKinds";
import {
  isManufacturingMaturityEligible,
  isProductionMatureCad,
  type ManufacturingMaturityDeliverable,
} from "@convex/manufacturingMaturityLogic";
import { requiredProfessionalReviews } from "@convex/professionalReviewPolicy";
import { selectNextWorkItem } from "@convex/workOrchestratorLogic";

const workByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

const reviewed = (kind: string, version = 1, artifactMaturity?: string): ManufacturingMaturityDeliverable => ({
  kind,
  version,
  trustState: "professionally_reviewed",
  artifactMaturity,
});

const matureCadSet = (version = 1, maturity = "engineering_reviewed"): ManufacturingMaturityDeliverable[] =>
  NATIVE_CAD_DELIVERABLE_KINDS.map((kind) => reviewed(kind, version, maturity));

const matureManufacturingArtifacts = (): ManufacturingMaturityDeliverable[] => [
  reviewed("prototype_readiness_assessment"),
  reviewed("manufacturer_rfq_package"),
  reviewed("manufacturing_drawing_specification"),
  ...matureCadSet(),
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

  it.each(NATIVE_CAD_DELIVERABLE_KINDS)("requires qualified engineering review for generated CAD kind %s", (kind) => {
    expect(requiredProfessionalReviews(kind).map((review) => review.specialty)).toContain("engineering");
  });

  it("fails closed until the latest prototype, RFQ, drawings and full concrete CAD set are fresh and professionally reviewed", () => {
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

  it("rejects a missing, preliminary, stale, or unreviewed member of the concrete CAD set", () => {
    expect(isProductionMatureCad(matureCadSet().slice(1))).toBe(false);

    const preliminary = matureCadSet();
    preliminary[0] = reviewed(preliminary[0].kind, 1, "preliminary_cad");
    expect(isProductionMatureCad(preliminary)).toBe(false);

    const unreviewed = matureCadSet();
    unreviewed[1] = { ...unreviewed[1], trustState: "professional_review_required" };
    expect(isProductionMatureCad(unreviewed)).toBe(false);

    const stale = matureCadSet();
    stale[2] = { ...stale[2], staleReason: "Prototype changed" };
    expect(isProductionMatureCad(stale)).toBe(false);

    expect(isProductionMatureCad(matureCadSet())).toBe(true);
    expect(isProductionMatureCad(matureCadSet(1, "manufacturing_released"))).toBe(true);
  });

  it("uses each newest concrete CAD revision so an older reviewed artifact cannot mask a newer preliminary revision", () => {
    expect(isProductionMatureCad([
      ...matureCadSet(1),
      { kind: "native_cad_step", version: 2, trustState: "professional_review_required", artifactMaturity: "preliminary_cad" },
    ])).toBe(false);
  });

  it("fails closed on mixed generation versions or duplicate latest versions", () => {
    const mixed = matureCadSet(2);
    mixed[0] = reviewed(mixed[0].kind, 1, "engineering_reviewed");
    expect(isProductionMatureCad(mixed)).toBe(false);

    expect(isProductionMatureCad([
      ...matureCadSet(2),
      reviewed("native_cad_step", 2, "engineering_reviewed"),
    ])).toBe(false);
  });

  it("does not allow the retired synthetic native_cad_package kind to satisfy production CAD maturity", () => {
    expect(isProductionMatureCad([reviewed("native_cad_package", 1, "engineering_reviewed")])).toBe(false);
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
