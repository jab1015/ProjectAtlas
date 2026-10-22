import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildFailedSectionEntry } from "@convex/validationResearchOrchestrationRunner";
import { cleanValidationResearchContent, getSafeValidationFailureMessage, getValidationSectionTitle } from "@/lib/validationResearchView";

describe("validation failure safety", () => {
  it("does not persist raw provider credential errors in failed sections", () => {
    const entry = buildFailedSectionEntry(
      "competitorAnalysis",
      new Error("401 Incorrect API key provided: sk-proj-secret-value"),
      1
    );

    expect(JSON.stringify(entry)).not.toContain("sk-proj-secret-value");
    expect(entry.generatedContent).toContain("No key is displayed here");
  });

  it("sanitizes already-persisted credential failures before rendering", () => {
    const safeMessage = getSafeValidationFailureMessage(
      "401 Incorrect API key provided: sk-proj-secret-value"
    );

    expect(safeMessage).not.toContain("sk-proj-secret-value");
    expect(safeMessage).toContain("Ask an administrator");
  });

  it("uses human section headings and hides internal evidence record IDs in older reports", () => {
    expect(getValidationSectionTitle("competitorAnalysis", "competitorAnalysis")).toBe("Competitor analysis");
    expect(getValidationSectionTitle("customerSegments", "Customer segments")).toBe("Customer segments");
    const clean = cleanValidationResearchContent(
      "Data_All_260313 (`m972gg8jr7r4bcj1fpw08kdymx8gq6t1`) and sourceId: m972gg8jr7r4bcj1fpw08kdymx8gq6t1"
    );
    expect(clean).toContain("Data_All_260313");
    expect(clean).not.toContain("m972gg8jr7r4bcj1fpw08kdymx8gq6t1");
    expect(clean).not.toContain("sourceId");
  });

  it("keeps the validation page summary-first and makes failed-only retry the primary action", () => {
    const page = fs.readFileSync(path.join(process.cwd(), "src/app/(app)/invention/[id]/page.tsx"), "utf8");
    expect(page).toContain("The short version");
    expect(page).toContain("What to do next");
    expect(page).toContain("View full research");
    expect(page).toContain("retryFailedValidation({ inventionId })");
    expect(page).toContain("Retry failed sections");
  });
});
