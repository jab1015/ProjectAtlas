import { describe, expect, it } from "vitest";
import { buildLiveStatusAnswer, isLiveStatusQuestion } from "../../convex/chatStatusAnswerLogic";

describe("live Ask InventSmith status answers", () => {
  it("recognizes direct status questions", () => {
    expect(isLiveStatusQuestion("What is the current status of my invention?")) .toBe(true);
    expect(isLiveStatusQuestion("How should I price this?")) .toBe(false);
  });

  it("uses the supplied live ledger instead of stale narrative", () => {
    const answer = buildLiveStatusAnswer(
      "What is InventSmith working on now?",
      "Rise Jar",
      5,
      [{ id: 5, name: "Product Design + CAD" }],
      [
        { kind: "design_candidate_generation", title: "Generate design candidates", status: "queued" },
        { kind: "materials_manufacturing", title: "Research materials", status: "failed" },
        { kind: "feature_prior_art_comparison", title: "Compare prior art", status: "completed" },
      ],
    );
    expect(answer).toContain("Current stage: Stage 5 — Product Design + CAD.");
    expect(answer).toContain("Generate design candidates");
    expect(answer).toContain("Research materials");
    expect(answer).not.toContain("ip_readiness");
  });
});
