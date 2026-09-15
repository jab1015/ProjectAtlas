import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const actionSource = readFileSync(
  join(process.cwd(), "src", "components", "atlas", "manufacturing-release-action.tsx"),
  "utf8",
);
const designSource = readFileSync(
  join(process.cwd(), "src", "app", "(app)", "invention", "[id]", "design", "page.tsx"),
  "utf8",
);

describe("manufacturing release UI", () => {
  it("wires Design Studio to the guarded exact-generation release mutation", () => {
    expect(designSource).toContain("ManufacturingReleaseAction");
    expect(actionSource).toContain("manufacturingReleaseMutation:releaseCadGenerationForManufacturing");
    expect(actionSource).toContain('access !== "manage"');
    expect(actionSource).toContain('artifact.artifactMaturity === "engineering_reviewed"');
    expect(actionSource).toContain('artifact.artifactMaturity === "manufacturing_released"');
    expect(actionSource).toContain("currentSynchronizedGeneration");
    expect(actionSource).toContain("latest.length !== 1");
    expect(actionSource).toContain("versions.size !== 1");
  });

  it("makes manufacturing release explicitly non-executing", () => {
    expect(actionSource).toContain("It does NOT contact a supplier");
    expect(actionSource).toContain("disclose files");
    expect(actionSource).toContain("make a payment");
    expect(actionSource).toContain("place a production order");
    expect(actionSource).toContain("submit a filing");
    expect(actionSource).toContain("publish anything");
    expect(actionSource).toContain("start production");
    expect(actionSource).toContain("No external action was performed");
  });

  it("shows actual CAD maturity instead of hard-coding every native artifact as preliminary", () => {
    expect(designSource).toContain("maturityLabel(artifact.artifactMaturity)");
    expect(designSource).toContain('maturity === "engineering_reviewed"');
    expect(designSource).toContain('maturity === "manufacturing_released"');
    expect(designSource).not.toContain("v{artifact.version} · Preliminary CAD");
    expect(designSource).toContain('completed: "Work complete"');
  });
});
