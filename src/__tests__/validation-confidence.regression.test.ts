import { describe, expect, it } from "vitest";

import { assessContextOnlyValidationConfidence } from "../../convex/validationConfidenceLogic";
import type { InventionContext } from "../../convex/validationResearchProvider";

const context: InventionContext = {
  inventionId: "inv_confidence_test",
  title: "Evidence-aware test invention",
  problemStatement: "A stated inventor problem that has not yet been independently validated.",
  inventionDescription: "An inventor-supplied description used only as context.",
  founderNotes: "Founder believes customers will pay more, but has not supplied interview evidence.",
};

describe("context-only validation confidence", () => {
  it("never reports high confidence without independent retrieval evidence", () => {
    const assessment = assessContextOnlyValidationConfidence(context, "validationPlan");

    expect(assessment.score).toBeLessThan(0.5);
    expect(["low", "very_low"]).toContain(assessment.level);
    expect(assessment.evidenceSummary).toContain("inventor-provided");
    expect(assessment.evidenceSummary).toContain("AI inferences");
  });

  it("is more conservative for sections that require current external evidence", () => {
    const plan = assessContextOnlyValidationConfidence(context, "validationPlan");
    const market = assessContextOnlyValidationConfidence(context, "marketSizing");

    expect(market.score).toBeLessThan(plan.score);
    expect(market.missingInformation.join(" ")).toContain("current external sources");
  });

  it("keeps missing evidence visible instead of treating absent evidence as zero risk", () => {
    const assessment = assessContextOnlyValidationConfidence(context, "competitorAnalysis");

    expect(assessment.missingInformation).toContain(
      "Independent retrieval/source records have not been collected by this provider."
    );
    expect(assessment.assumptions.join(" ")).toContain("hypotheses pending evidence");
  });
});
