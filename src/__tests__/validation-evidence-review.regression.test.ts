import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("visible validation evidence review", () => {
  it("returns current survey source details and marks reports stale against changed evidence", () => {
    const query = read("convex/validationMutations.ts");
    expect(query).toContain("readValidationEvidence(ctx, inventionId)");
    expect(query).toContain("currentEvidenceMatchesRun");
    expect(query).toContain("sampleSize,");
    expect(query).toContain("findings,");
    expect(query).toContain("Inventor-uploaded; not independently verified");
    expect(query).toContain('row.researchStatus === "stale"');
  });

  it("shows the cited survey and provenance in the short validation summary", () => {
    const page = read("src/app/(app)/invention/[id]/page.tsx");
    expect(page).toContain("Survey evidence considered");
    expect(page).toContain("uploadedSurveys");
    expect(page).toContain("This report matches the current evidence.");
    expect(page).toContain("survey.provenance");
  });

  it("keeps the session cache version aligned with the provider implementation", () => {
    const session = read("convex/validationResearchSessionMutations.ts");
    const provider = read("convex/openaiValidationResearchProvider.ts");
    expect(session).toContain('const PROVIDER_VERSION = "2.0.0"');
    expect(provider).toContain('private static readonly VERSION = "2.0.0"');
  });
});
