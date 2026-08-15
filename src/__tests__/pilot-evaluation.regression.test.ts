import { describe, expect, it } from "vitest";
import { evaluatePilotPackage, REQUIRED_PILOT_DELIVERABLE_KINDS } from "@convex/pilotEvaluationLogic";

const evaluatedAt = Date.UTC(2026, 7, 14);
const trustedSources = [{ _id: "source-1", reliability: "primary", locator: "https://example.com/source", metadata: { verifiedAt: evaluatedAt } }];

function completeDeliverables() {
  return REQUIRED_PILOT_DELIVERABLE_KINDS.map((kind) => ({
    kind,
    trustState: "evidence_checked",
    sourceIds: ["source-1"],
    sourceCoverage: 0.8,
    storageId: kind === "concept_visualization_board" ? "storage-1" : undefined,
  }));
}

describe("controlled-pilot evaluation", () => {
  it("passes only a complete, supported, current package", () => {
    const result = evaluatePilotPackage({
      deliverables: completeDeliverables(),
      findings: [{ kind: "sourced_fact", status: "evidence_checked", sourceIds: ["source-1"] }],
      sources: trustedSources,
      workItems: [{ status: "completed" }],
    }, evaluatedAt);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.blockers).toEqual([]);
  });

  it("blocks missing, unsupported, stale, or falsely trusted work", () => {
    const result = evaluatePilotPackage({
      deliverables: [{ kind: "invention_brief_analysis", trustState: "evidence_checked", sourceIds: [], sourceCoverage: 0, staleReason: "Idea changed" }],
      findings: [{ kind: "sourced_fact", status: "draft", sourceIds: [] }],
      sources: [],
      workItems: [{ status: "blocked" }, { status: "failed" }],
    });
    expect(result.passed).toBe(false);
    expect(result.metrics.unsupportedSourcedFacts).toBe(1);
    expect(result.metrics.trustViolations).toBe(1);
    expect(result.blockers.length).toBeGreaterThan(4);
  });

  it("does not treat a professional-review gate as an evidence promotion", () => {
    const result = evaluatePilotPackage({
      deliverables: [{
        kind: "invention_brief_analysis",
        trustState: "professional_review_required",
        sourceIds: [],
        sourceCoverage: 0,
      }],
      findings: [],
      sources: [],
      workItems: [],
    });
    expect(result.metrics.trustViolations).toBe(0);
  });

  it("blocks a package whose previously trusted evidence is no longer freshly verified", () => {
    const result = evaluatePilotPackage({
      deliverables: completeDeliverables(),
      findings: [{ kind: "sourced_fact", status: "evidence_checked", sourceIds: ["source-1"] }],
      sources: [{ _id: "source-1", reliability: "primary", metadata: { verifiedAt: 1 } }],
      workItems: [{ status: "completed" }],
    }, evaluatedAt);
    expect(result.passed).toBe(false);
    expect(result.metrics.staleOrUnusableTrustedSources).toBe(1);
    expect(result.metrics.trustViolations).toBeGreaterThan(0);
  });
});
