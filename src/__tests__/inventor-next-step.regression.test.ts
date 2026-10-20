import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("inventor next steps", () => {
  it("prepares a survey only for a completed, current report at or below 50%", () => {
    const page = read("src/app/(app)/invention/[id]/page.tsx");

    expect(page).toContain('validationResearch?.status === "complete"');
    expect(page).toContain('validationResearch.evidenceReview?.currentEvidenceMatchesRun === true');
    expect(page).toContain('reportConfidenceAverage <= 0.5');
    expect(page).toContain("!Array.isArray(evidenceRequests)");
    expect(page).toContain('request.title === fallbackTitle');
    expect(page).toContain("Share it with five people who might have this problem.");
    expect(page).toContain("Copy survey link");
    expect(page).toContain("createEvidenceRequest({");
    expect(page).toContain("[Validation follow-up]");
  });

  it("routes later-stage inventors into the journey and uses plain-language actions", () => {
    const workspace = read("src/app/(app)/invention/[id]/page.tsx");
    const journey = read("src/app/(app)/invention/[id]/journey/page.tsx");
    const backend = read("convex/journeyCenter.ts");

    expect(workspace).toContain('router.replace(`/invention/${inventionId}/journey`)');
    expect(workspace).not.toContain("Stages 5–15 — product design");
    expect(journey).toContain("Do the next step");
    expect(journey).toContain("tasks done");
    expect(backend).toContain("Open ${firstIncomplete.name} and follow the first step.");
    expect(journey).toContain('request.title.startsWith("[Validation follow-up]")');
    expect(journey).toContain("Share your prepared survey with five people who may have this problem");
  });
});
