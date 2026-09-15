import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  NATIVE_CAD_RELEASE_KINDS,
  selectCurrentSynchronizedCadGeneration,
  type ManufacturingReleaseCadArtifact,
} from "@/lib/manufacturing-release-ui-logic";

const actionSource = readFileSync(
  join(process.cwd(), "src", "components", "atlas", "manufacturing-release-action.tsx"),
  "utf8",
);
const designSource = readFileSync(
  join(process.cwd(), "src", "app", "(app)", "invention", "[id]", "design", "page.tsx"),
  "utf8",
);

function generation(version: number): ManufacturingReleaseCadArtifact[] {
  return NATIVE_CAD_RELEASE_KINDS.map((kind) => ({
    _id: `${kind}-${version}`,
    kind,
    version,
    artifactMaturity: "engineering_reviewed",
  }));
}

describe("manufacturing release UI", () => {
  it("selects the exact synchronized newest native CAD generation", () => {
    const selected = selectCurrentSynchronizedCadGeneration([
      ...generation(1),
      ...generation(2),
    ]);

    expect(selected).not.toBeNull();
    expect(selected).toHaveLength(6);
    expect(new Set(selected?.map((artifact) => artifact.version))).toEqual(new Set([2]));
  });

  it("fails closed for missing, duplicate-latest, or mixed newest CAD generations", () => {
    const missing = generation(2).slice(0, -1);
    expect(selectCurrentSynchronizedCadGeneration(missing)).toBeNull();

    const duplicateLatest = generation(2);
    duplicateLatest.push({ ...duplicateLatest[0], _id: "duplicate-latest" });
    expect(selectCurrentSynchronizedCadGeneration(duplicateLatest)).toBeNull();

    const mixed = generation(2);
    mixed[mixed.length - 1] = { ...mixed[mixed.length - 1], version: 3, _id: "newer-exploded" };
    expect(selectCurrentSynchronizedCadGeneration(mixed)).toBeNull();
  });

  it("wires Design Studio to the guarded exact-generation release mutation", () => {
    expect(designSource).toContain("ManufacturingReleaseAction");
    expect(actionSource).toContain("manufacturingReleaseMutation:releaseCadGenerationForManufacturing");
    expect(actionSource).toContain('access !== "manage"');
    expect(actionSource).toContain('artifact.artifactMaturity === "engineering_reviewed"');
    expect(actionSource).toContain('artifact.artifactMaturity === "manufacturing_released"');
    expect(actionSource).toContain("selectCurrentSynchronizedCadGeneration");
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

  it("shows actual newest-generation CAD maturity and never falls back to older clean artifacts", () => {
    expect(designSource).toContain("const latestCadGeneration = selectCurrentSynchronizedCadGeneration(cadArtifacts) ?? [];");
    expect(designSource).not.toContain("cadArtifacts.filter((artifact) => !artifact.staleReason)");
    expect(designSource).toContain('artifact.staleReason ? "Refresh needed" : maturityLabel(artifact.artifactMaturity)');
    expect(designSource).toContain("a newer stale or incomplete revision cannot fall back to older clean CAD");
    expect(designSource).toContain("maturityLabel(artifact.artifactMaturity)");
    expect(designSource).toContain('maturity === "engineering_reviewed"');
    expect(designSource).toContain('maturity === "manufacturing_released"');
    expect(designSource).not.toContain("v{artifact.version} · Preliminary CAD");
    expect(designSource).toContain('completed: "Work complete"');
  });
});
