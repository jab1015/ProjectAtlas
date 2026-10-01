import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getValidationResearchViewState } from "@/lib/validationResearchView";
import { summarizeValidationRecovery } from "@convex/validationResearchRecoveryLogic";

describe("partial validation recovery", () => {
  it("infers partial from mixed outcomes when a legacy normalizer omits the status", () => {
    const state = getValidationResearchViewState(
      {
        status: undefined,
        sections: [
          { sectionId: "validationPlan", status: "generated" },
          { sectionId: "customerSegments", status: "failed" },
        ],
      },
      false,
      11
    );

    expect(state.isGenerating).toBe(false);
    expect(state.isFailed).toBe(false);
    expect(state.isPartial).toBe(true);
    expect(state.statusLabel).toBe("Validation partially complete");
    expect(state.failedSections).toHaveLength(1);
  });

  it("summarizes new orchestration section maps without trusting the top-level status", () => {
    const recovery = summarizeValidationRecovery({
      researchStatus: undefined,
      sections: {
        validationPlan: { sectionStatus: "COMPLETED" },
        customerSegments: { sectionStatus: "FAILED" },
        competitorAnalysis: { sectionStatus: "PENDING" },
      },
    });

    expect(recovery.state).toBe("partial");
    expect(recovery.successfulSectionCount).toBe(1);
    expect(recovery.failedSectionCount).toBe(1);
    expect(recovery.pendingSectionCount).toBe(1);
    expect(recovery.canRetryFailed).toBe(true);
  });

  it("does not infer partial when every finished section failed", () => {
    const state = getValidationResearchViewState(
      {
        status: undefined,
        sections: [
          { sectionId: "validationPlan", status: "failed" },
          { sectionId: "customerSegments", status: "failed" },
        ],
      },
      false,
      11
    );
    const recovery = summarizeValidationRecovery({
      sections: {
        validationPlan: { sectionStatus: "FAILED" },
        customerSegments: { sectionStatus: "FAILED" },
      },
    });

    expect(state.isPartial).toBe(false);
    expect(recovery.state).toBe("failed");
    expect(recovery.canRetryFailed).toBe(true);
  });

  it("wires organization-aware failed-only retry into the Stage 2 route boundary", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(app)/invention/[id]/layout.tsx"),
      "utf8"
    );

    expect(source).toContain("validationResearchRecovery:getValidationRecoveryState");
    expect(source).toContain("validationResearchSessionMutations:retryFailedValidationSections");
    expect(source).toContain("recovery?.canRetryFailed");
    expect(source).toContain("Successful research is preserved");
    expect(source).toContain("An editor or manager can retry the failed sections");
  });
});
