import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getValidationResearchViewState } from "@/lib/validationResearchView";

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

    expect(state.isPartial).toBe(false);
  });

  it("wires failed-only retry into the Stage 2 route boundary", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(app)/invention/[id]/layout.tsx"),
      "utf8"
    );

    expect(source).toContain("validationResearchSessionMutations:retryFailedValidationSections");
    expect(source).toContain("validationView.isPartial");
    expect(source).toContain("Successful research is preserved");
    expect(source).toContain("Retry ${validationView.failedSections.length} failed section");
  });
});
