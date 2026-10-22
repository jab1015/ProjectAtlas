import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/atlas/status-briefing.tsx", "utf8");

describe("status briefing queue copy", () => {
  it("does not imply queued tasks are already continuing", () => {
    expect(source).toContain('"Work is queued"');
    expect(source).toContain("Queued tasks will start when their prerequisites and worker capacity are ready.");
  });
});
