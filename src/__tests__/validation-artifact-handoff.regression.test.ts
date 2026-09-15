import { describe, expect, it } from "vitest";
import { classifyInvention } from "@convex/inventionClassificationLogic";
import { buildInventionWorkPlan } from "@convex/inventionWorkPlanLogic";
import { requiredProfessionalReviews } from "@convex/professionalReviewPolicy";
import { isDeliverableReadyForExternalUse } from "@convex/deliverableLogic";
import { selectLatestDeliverables } from "@/lib/packageExportLogic";

type PlannedItem = {
  kind: string;
  deliverableKind?: string;
  dependsOnKinds?: readonly string[];
};

type Artifact = {
  kind: string;
  version: number;
  trustState: string;
  staleReason?: string;
  content: string;
};

function representativePlan(input: { title: string; problemStatement?: string; solutionDescription: string }) {
  const classification = classifyInvention(input);
  const plan = buildInventionWorkPlan(classification);
  const items = [...plan.canonical, ...plan.postCanonical] as PlannedItem[];
  return { classification, items, byKind: new Map(items.map((item) => [item.kind, item])) };
}

function artifactFor(item: PlannedItem, version: number, content: string): Artifact {
  const kind = item.deliverableKind ?? item.kind;
  const reviews = requiredProfessionalReviews(kind);
  return {
    kind,
    version,
    trustState: reviews.length ? "professional_review_required" : "atlas_draft",
    content,
  };
}

describe("validation/decision to versioned artifact handoff", () => {
  it("keeps a physical invention on an evidence-backed chain into versioned design/CAD artifacts", () => {
    const { classification, byKind } = representativePlan({
      title: "Accessible adjustable jar opener",
      problemStatement: "People with limited grip strength struggle with sealed jars.",
      solutionDescription: "A mechanical adjustable gripping tool manufactured from molded and metal components.",
    });

    expect(classification.productType).toBe("physical");
    const patent = byKind.get("patent_design_handoff")!;
    const candidateGeneration = byKind.get("design_candidate_generation")!;
    const candidateScoring = byKind.get("design_candidate_scoring")!;
    const design = byKind.get("product_design_specification")!;
    const cad = byKind.get("native_cad_generation")!;

    // The patent handoff is intentionally transitive: it constrains candidate generation,
    // which feeds scoring, the selected design specification, and finally native CAD.
    expect(candidateGeneration.dependsOnKinds).toContain("patent_design_handoff");
    expect(candidateScoring.dependsOnKinds).toContain("design_candidate_generation");
    expect(design.dependsOnKinds).toContain("design_candidate_scoring");
    expect(cad.dependsOnKinds).toContain("product_design_specification");

    const oldDesign = artifactFor(design, 1, "Earlier design package");
    const revisedDesign = artifactFor(design, 2, "Revised design after validation evidence");
    const latest = selectLatestDeliverables([oldDesign, revisedDesign, artifactFor(patent, 1, "Patent/design handoff")]);
    expect(latest.find((item) => item.kind === revisedDesign.kind)?.version).toBe(2);
    expect(latest.find((item) => item.kind === revisedDesign.kind)?.content).toMatch(/Revised design/);
  });

  it("routes software validation into software artifacts without manufacturing/CAD fiction", () => {
    const { classification, byKind } = representativePlan({
      title: "Family care coordination app",
      solutionDescription: "A secure iOS, Android and web application with shared schedules, alerts and family messaging.",
    });

    expect(classification.productType).toBe("software");
    expect(byKind.has("software_product_specification")).toBe(true);
    expect(byKind.has("software_architecture")).toBe(true);
    expect(byKind.has("software_security_privacy_review")).toBe(true);
    expect(byKind.has("native_cad_generation")).toBe(false);
    expect(byKind.has("manufacturer_rfq_package")).toBe(false);

    const spec = artifactFor(byKind.get("software_product_specification")!, 1, "Software product specification");
    expect(spec.kind).toBe("software_product_specification");
    expect(isDeliverableReadyForExternalUse(spec.trustState, spec.staleReason)).toBe(false);
  });

  it("keeps hybrid inventions on both physical and software artifact paths from the same validated handoff", () => {
    const { classification, byKind } = representativePlan({
      title: "Connected medication organizer",
      problemStatement: "Families need a clearer way to track whether scheduled medication compartments were opened.",
      solutionDescription: "A physical sensor-equipped medication organizer with a companion mobile application and cloud alerts for caregivers.",
    });

    expect(classification.productType).toBe("hybrid");
    const patent = byKind.get("patent_design_handoff")!;
    const physicalDesign = byKind.get("design_candidate_generation")!;
    const softwareSpec = byKind.get("software_product_specification")!;
    const nativeCad = byKind.get("native_cad_generation")!;
    const securityReview = byKind.get("software_security_privacy_review")!;

    expect(physicalDesign.dependsOnKinds).toContain("patent_design_handoff");
    expect(softwareSpec.dependsOnKinds).toContain("patent_design_handoff");
    expect(byKind.has("product_design_specification")).toBe(true);
    expect(nativeCad.dependsOnKinds).toContain("product_design_specification");
    expect(byKind.has("software_architecture")).toBe(true);
    expect(securityReview.dependsOnKinds).toContain("software_architecture");

    const artifacts = [
      artifactFor(patent, 1, "Shared patent/design handoff"),
      artifactFor(byKind.get("product_design_specification")!, 1, "Physical design specification"),
      artifactFor(softwareSpec, 1, "Companion software specification"),
    ];
    expect(selectLatestDeliverables(artifacts).map((artifact) => artifact.kind)).toEqual(expect.arrayContaining([
      "patent_design_handoff",
      "product_design_specification",
      "software_product_specification",
    ]));
  });

  it("preserves professional review gates for consequential artifacts instead of treating generated output as authorized", () => {
    const { classification, byKind } = representativePlan({
      title: "Rehabilitation tracking medical device",
      solutionDescription: "A connected medical rehabilitation device and patient application used by clinics to track prescribed exercise activity.",
    });

    expect(classification.supportClass).toBe("regulated_review");
    const regulatory = byKind.get("regulatory_screening")!;
    const regulatoryArtifact = artifactFor(regulatory, 1, "Preliminary regulatory screening");
    const reviews = requiredProfessionalReviews(regulatoryArtifact.kind);

    expect(reviews.length).toBeGreaterThan(0);
    expect(regulatoryArtifact.trustState).toBe("professional_review_required");
    expect(isDeliverableReadyForExternalUse(regulatoryArtifact.trustState)).toBe(false);
    expect(isDeliverableReadyForExternalUse("professionally_reviewed")).toBe(false);
    expect(isDeliverableReadyForExternalUse("ready_for_authorized_use")).toBe(true);
  });

  it("never lets an older clean artifact hide a newer stale revision in package selection", () => {
    const artifacts: Artifact[] = [
      { kind: "market_analysis", version: 1, trustState: "ready_for_authorized_use", content: "Old market analysis" },
      { kind: "market_analysis", version: 2, trustState: "evidence_checked", staleReason: "Inventor evidence changed.", content: "Newer analysis awaiting refresh" },
    ];

    const [selected] = selectLatestDeliverables(artifacts);
    expect(selected.version).toBe(2);
    expect(selected.staleReason).toMatch(/evidence changed/i);
    expect(isDeliverableReadyForExternalUse(selected.trustState, selected.staleReason)).toBe(false);
  });
});
