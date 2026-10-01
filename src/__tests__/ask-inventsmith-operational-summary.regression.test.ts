import { describe, expect, it } from "vitest";
import { summarizePatentDesignHandoff } from "@convex/projectStateSummaryLogic";

const patentComplete = [
  { kind: "preliminary_prior_art", status: "completed" },
  { kind: "feature_prior_art_comparison", status: "completed" },
  { kind: "distinguishing_features", status: "completed" },
  { kind: "ip_readiness", status: "completed" },
];

describe("Ask InventSmith operational project summary", () => {
  it("reports exactly which patent prerequisites still block the design handoff", () => {
    const summary = summarizePatentDesignHandoff([
      { kind: "preliminary_prior_art", status: "completed" },
      { kind: "feature_prior_art_comparison", status: "running" },
      { kind: "distinguishing_features", status: "queued" },
      { kind: "ip_readiness", status: "queued" },
      { kind: "patent_design_handoff", status: "queued" },
    ]);

    expect(summary.state).toBe("patent_work_incomplete");
    expect(summary.operationalHandoffOccurred).toBe(false);
    expect(summary.patentPrerequisitesMissing).toEqual([
      "feature_prior_art_comparison",
      "distinguishing_features",
      "ip_readiness",
    ]);
    expect(summary.explanation).toMatch(/cannot complete yet/i);
  });

  it("recognizes a completed patent-to-design handoff without requiring a ceremonial record", () => {
    const summary = summarizePatentDesignHandoff([
      ...patentComplete,
      { kind: "patent_design_handoff", status: "completed" },
      { kind: "design_candidate_generation", status: "queued" },
      { kind: "design_candidate_scoring", status: "queued" },
    ]);

    expect(summary.state).toBe("handed_off");
    expect(summary.operationalHandoffOccurred).toBe(true);
    expect(summary.productDesign.queued).toContain("design_candidate_generation");
  });

  it("answers that the design team is actively working when design work is running", () => {
    const summary = summarizePatentDesignHandoff([
      ...patentComplete,
      { kind: "patent_design_handoff", status: "completed" },
      { kind: "design_candidate_generation", status: "running" },
      { kind: "design_candidate_scoring", status: "queued" },
      { kind: "product_design_specification", status: "queued" },
    ]);

    expect(summary.state).toBe("design_working");
    expect(summary.productDesign.running).toEqual(["design_candidate_generation"]);
    expect(summary.explanation).toMatch(/actively running/i);
  });

  it("surfaces a design blocker after the patent handoff has completed", () => {
    const summary = summarizePatentDesignHandoff([
      ...patentComplete,
      { kind: "patent_design_handoff", status: "completed" },
      { kind: "design_candidate_generation", status: "completed" },
      { kind: "design_candidate_scoring", status: "blocked", blockedReason: "Waiting for inventor prototype dimensions" },
    ]);

    expect(summary.state).toBe("design_blocked");
    expect(summary.operationalHandoffOccurred).toBe(true);
    expect(summary.productDesign.blocked).toEqual(["design_candidate_scoring"]);
  });
});
