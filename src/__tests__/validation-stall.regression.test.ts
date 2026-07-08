import { describe, expect, it } from "vitest";

import {
  runValidationSections,
  type PersistValidationSectionArgs,
} from "../../convex/validationResearchOrchestrationRunner";
import type {
  InventionContext,
  ValidationSectionKey,
} from "../../convex/validationResearchProvider";
import { getValidationResearchViewState } from "@/lib/validationResearchView";

const context: InventionContext = {
  inventionId: "inv_test_validation_stall",
  title: "Validation Stall Test",
  problemStatement: "Validation results disappear after research starts.",
  inventionDescription: "A regression fixture for Atlas validation orchestration.",
};

const sectionOrder = ["validationPlan", "customerSegments"] as ValidationSectionKey[];

describe("validation orchestration stall regression", () => {
  it("completes only after generated sections are persisted", async () => {
    const persisted: PersistValidationSectionArgs[] = [];

    const summary = await runValidationSections({
      sectionOrder,
      inventionContext: context,
      now: () => 123,
      provider: {
        generateSection: async (_ctx, sectionKey) => ({
          sectionKey,
          generatedContent: `Generated ${sectionKey}`,
          confidence: {
            score: 0.8,
            level: "high",
            evidenceSummary: "Mocked OpenAI response.",
            assumptions: [],
            missingInformation: [],
          },
          evidenceSummary: "Mocked OpenAI response.",
          assumptions: [],
          missingInformation: [],
          generatedAt: 123,
          providerVersion: "test",
        }),
      },
      persistCompletedSection: async (args) => {
        persisted.push(args);
      },
      persistFailedSection: async (args) => {
        persisted.push(args);
      },
    });

    expect(summary.finalResearchStatus).toBe("completed");
    expect(summary.completedCount).toBe(2);
    expect(summary.failedCount).toBe(0);
    expect(persisted.map((entry) => entry.completedSectionCount)).toEqual([1, 2]);
  });

  it("does not count a section as complete when its DB write fails", async () => {
    const persistedFailures: PersistValidationSectionArgs[] = [];

    const summary = await runValidationSections({
      sectionOrder: [sectionOrder[0]],
      inventionContext: context,
      now: () => 456,
      provider: {
        generateSection: async (_ctx, sectionKey) => ({
          sectionKey,
          generatedContent: `Generated ${sectionKey}`,
          confidence: {
            score: 0.8,
            level: "high",
            evidenceSummary: "Mocked OpenAI response.",
            assumptions: [],
            missingInformation: [],
          },
          evidenceSummary: "Mocked OpenAI response.",
          assumptions: [],
          missingInformation: [],
          generatedAt: 456,
          providerVersion: "test",
        }),
      },
      persistCompletedSection: async () => {
        throw new Error("Convex patch failed");
      },
      persistFailedSection: async (args) => {
        persistedFailures.push(args);
      },
    });

    expect(summary.finalResearchStatus).toBe("failed");
    expect(summary.completedCount).toBe(0);
    expect(summary.failedCount).toBe(1);
    expect(persistedFailures).toHaveLength(1);
    expect(persistedFailures[0].sectionEntry.sectionStatus).toBe("FAILED");
    expect(persistedFailures[0].completedSectionCount).toBe(0);
  });

  it("surfaces a failed research row instead of falling back to waiting", () => {
    const state = getValidationResearchViewState(
      {
        status: "failed",
        sections: [],
      },
      false,
      11
    );

    expect(state.isGenerating).toBe(false);
    expect(state.statusLabel).toBe("Validation failed");
    expect(state.allSectionsError).toBe(true);
  });
});
