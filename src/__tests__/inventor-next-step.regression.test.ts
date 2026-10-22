import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getValidationFollowUpAction } from "../../convex/journeyNextActionLogic";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("inventor next steps", () => {
  it("prepares a survey only for a completed, current report at or below 50%", () => {
    const page = read("src/app/(app)/invention/[id]/page.tsx");

    expect(page).toContain('validationResearch?.status === "complete"');
    expect(page).toContain('validationResearch.evidenceReview?.currentEvidenceMatchesRun === true');
    expect(page).toContain('reportConfidenceAverage <= 0.5');
    expect(page).toContain("!Array.isArray(evidenceRequests)");
    expect(page).toContain('request.title === fallbackTitle');
    expect(page).toContain("responses are recorded. Add a few direct customer conversations");
    expect(page).toContain("Collect ${Math.max(1, 5 - (evidenceReview?.surveyResponseCount ?? 0))} more survey response");
    expect(page).not.toContain("Share it with five people who might have this problem.");
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
    expect(journey).toContain('return "Refresh queued"');
    expect(journey).toContain("Qualified reviewers must complete these gates. They are not decisions for you to submit.");
    expect(journey).not.toContain("Tap to see what the reviewer must check");
    expect(backend).toContain("Open ${firstIncomplete.name} and follow the first step.");
    expect(backend).toContain('request.title.startsWith("[Validation follow-up]")');
    expect(backend).toContain("getValidationFollowUpAction(customerValidationResponses, firstIncomplete.status, {");
    expect(journey).not.toContain("Share your prepared survey with five people who may have this problem");
  });

  it("reports only the remaining survey responses and switches to interviews after five", () => {
    expect(getValidationFollowUpAction(0, "working")).toContain("5 more people");
    expect(getValidationFollowUpAction(4, "working")).toContain("1 more person");
    expect(getValidationFollowUpAction(5, "working")).toContain("Talk with a few people who use thick foods in jars");
    expect(getValidationFollowUpAction(5, "needs_refresh", { runningWorkCount: 1, queuedWorkCount: 0 })).toContain("refreshing now");
    expect(getValidationFollowUpAction(5, "needs_refresh", { runningWorkCount: 0, queuedWorkCount: 2 })).toContain("refresh is queued");
    expect(getValidationFollowUpAction(5, "needs_refresh")).toContain("review the new evidence");
  });
});
