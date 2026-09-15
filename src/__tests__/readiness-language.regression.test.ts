import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("InventSmith inventor-facing readiness language", () => {
  it("replaces vague readiness states with actionable labels while preserving backend values", () => {
    const source = readFileSync(join(process.cwd(), "src/components/atlas/readiness-badge.tsx"), "utf8");
    expect(source).toContain('type ReadinessState = "Not Ready" | "Getting There" | "Ready to Move Forward"');
    expect(source).toContain('"Not Ready": "Needs more evidence"');
    expect(source).toContain('"Getting There": "Evidence building"');
    expect(source).toContain('"Ready to Move Forward": "Ready for next stage"');
    expect(source).toContain("{stateLabels[state]}");
  });
});
