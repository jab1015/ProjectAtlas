import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { extractEvidenceFromFile } from "@/lib/evidenceIngestion";

describe("inventor evidence ingestion", () => {
  it("structures SurveyMonkey-style CSV evidence without claiming verification", async () => {
    const csv = [
      "Respondent,Problem occurs weekly?,Would buy at $29?,Comments",
      "1,Yes,Yes,This would save time",
      "2,Yes,No,Price is high",
      "3,No,Yes,Useful for my parents",
      "4,Yes,Yes,Would use it",
    ].join("\n");
    const file = new File([csv], "surveymonkey-results.csv", { type: "text/csv" });

    const result = await extractEvidenceFromFile(file, "survey");

    expect(result.mode).toBe("csv_survey");
    expect(result.survey?.rowCount).toBe(4);
    expect(result.survey?.columnCount).toBe(4);
    expect(result.survey?.questions[1].topResponses).toEqual(
      expect.arrayContaining([
        { value: "Yes", count: 3 },
        { value: "No", count: 1 },
      ])
    );
    expect(result.limitations.join(" ").toLowerCase()).toContain("not independently verified");
  });

  it("extracts interview text with provenance limitations", async () => {
    const file = new File([
      "Interview with target customer. They currently use a colander and dislike losing counter space.",
    ], "interview.txt", { type: "text/plain" });

    const result = await extractEvidenceFromFile(file, "interview");

    expect(result.mode).toBe("text");
    expect(result.textPreview).toContain("target customer");
    expect(result.limitations.join(" ").toLowerCase()).toContain("inventor-provided");
  });

  it("queues server-side AI extraction for binary evidence and reapplies downstream evidence impact", () => {
    const filesSource = readFileSync(join(process.cwd(), "convex/files.ts"), "utf8");
    const extractionSource = readFileSync(join(process.cwd(), "convex/evidenceFileExtraction.ts"), "utf8");
    const internalSource = readFileSync(join(process.cwd(), "convex/filesInternal.ts"), "utf8");

    expect(filesSource).toContain('extractionMode === "metadata_only"');
    expect(filesSource).toContain("extractInventorEvidenceFile");
    expect(filesSource).toContain("ctx.scheduler.runAfter(0, extractInventorEvidenceFile");
    expect(extractionSource).toContain('type: "input_file"');
    expect(extractionSource).toContain('type: "input_image"');
    expect(extractionSource).toContain("methodology");
    expect(extractionSource).toContain("sampleSize");
    expect(extractionSource).toContain("relevantWorkKinds");
    expect(internalSource).toContain("recordEvidenceExtraction");
    expect(internalSource).toContain("applyInventorEvidenceChange");
    expect(internalSource).toContain('extractionStatus: "completed"');
  });
});
