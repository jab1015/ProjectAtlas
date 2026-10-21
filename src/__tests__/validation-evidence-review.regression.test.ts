import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getValidationCompletionLabel,
  getValidationResearchViewState,
} from "@/lib/validationResearchView";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("visible validation evidence review", () => {
  it("labels a completed snapshot as previous when newer evidence is not included", () => {
    expect(getValidationCompletionLabel(false, 11, 11)).toBe(
      "Update needed — previous report has 11 of 11 sections; it does not match current evidence"
    );
    expect(getValidationCompletionLabel(true, 11, 11)).toBe(
      "Validation complete — 11 of 11 sections"
    );
    expect(getValidationCompletionLabel(undefined, 9, 11)).toBe(
      "Validation partially complete — 9 of 11 sections"
    );
  });

  it("does not report validation complete when the report fingerprint is stale", () => {
    const staleCompleted = getValidationResearchViewState(
      {
        status: "complete",
        sections: Array.from({ length: 11 }, () => ({ status: "generated" as const })),
        evidenceReview: { currentEvidenceMatchesRun: false },
      },
      false,
      11
    );
    const staleRunning = getValidationResearchViewState(
      {
        status: "running",
        sections: [{ status: "generated" }],
        evidenceReview: { currentEvidenceMatchesRun: false },
      },
      false,
      11
    );

    expect(staleCompleted.statusLabel).toBe(
      "Update needed — previous report has 11 of 11 sections; it does not match current evidence"
    );
    expect(staleRunning.statusLabel).toBe(
      "Refresh in progress — current evidence not reflected yet"
    );
  });

  it("returns current survey source details and marks reports stale against changed evidence", () => {
    const query = read("convex/validationMutations.ts");
    expect(query).toContain("readValidationEvidence(ctx, inventionId)");
    expect(query).toContain("currentEvidenceMatchesRun");
    expect(query).toContain("sampleSize,");
    expect(query).toContain("findings,");
    expect(query).toContain("Inventor-uploaded; not independently verified");
    expect(query).toContain("pendingSurveys: evidenceSnapshot.pendingSurveys");
    expect(query).toContain('row.researchStatus === "stale"');
  });

  it("shows the cited survey and provenance in the short validation summary", () => {
    const page = read("src/app/(app)/invention/[id]/page.tsx");
    expect(page).toContain("Survey evidence and refresh status");
    expect(page).toContain("uploadedSurveys");
    expect(page).toContain("This report matches the current evidence.");
    expect(page).toContain("survey.provenance");
    expect(page).toContain("Select Refresh validation to regenerate its sections and confidence using the current evidence.");
    expect(page).toContain("This completed report does not match the latest evidence.");
    expect(page).toContain("Survey results support customer-validation sections");
    expect(page).not.toContain("Its confidence score is hidden until the automatic refresh finishes.");
  });

  it("keeps the session cache version aligned with the provider implementation", () => {
    const session = read("convex/validationResearchSessionMutations.ts");
    const provider = read("convex/openaiValidationResearchProvider.ts");
    expect(session).toContain('const PROVIDER_VERSION = "2.2.0"');
    expect(provider).toContain('private static readonly VERSION = "2.1.0"');
  });
});
