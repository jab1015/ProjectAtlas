import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("inventor next steps", () => {
  it("prepares one survey only for a completed, current report at or below 50%", () => {
    const backend = read("convex/evidenceRequests.ts");
    const schema = read("convex/schema.ts");
    const page = read("src/app/(app)/invention/[id]/page.tsx");

    expect(backend).toContain('report.researchStatus !== "completed" && report.status !== "complete"');
    expect(backend).toContain('report.evidenceFingerprint !== evidence.fingerprint');
    expect(backend).toContain('sum, score) => sum + score, 0) / scores.length > 0.5');
    expect(backend).toContain('request.purpose === "validation_follow_up" && request.status === "active"');
    expect(schema).toContain('v.literal("validation_follow_up")');
    expect(page).toContain('reportConfidenceAverage <= 0.5');
    expect(page).toContain("Share it with five people who might have this problem.");
    expect(page).toContain("Copy survey link");
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
  });
});
