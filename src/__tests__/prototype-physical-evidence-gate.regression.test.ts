import { describe, expect, it } from "vitest";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";
import { FULL_JOURNEY_STAGES } from "@convex/fullJourneyDefinition";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

describe("InventSmith physical prototype evidence gate", () => {
  it("requires an explicit physical-evidence gate before prototype assessment", () => {
    const gate = workByKind.get("prototype_physical_evidence");
    const assessment = workByKind.get("prototype_evidence_assessment");
    const prototypeStage = FULL_JOURNEY_STAGES.find((stage) => stage.id === 6);

    expect(gate).toBeDefined();
    expect(gate?.dependsOnKinds).toContain("prototype_test_plan");
    expect(gate?.inputSnapshot.physicalEvidenceGate).toBe(true);
    expect(String(gate?.inputSnapshot.instructions)).toContain("needsHuman=true");
    expect(String(gate?.inputSnapshot.instructions)).toContain("humanGateType=physical_work");
    expect(assessment?.dependsOnKinds).toContain("prototype_physical_evidence");
    expect(prototypeStage?.requiredWorkKinds).toContain("prototype_physical_evidence");
  });

  it("never tells the model to invent unperformed prototype results", () => {
    const gate = workByKind.get("prototype_physical_evidence");
    const instructions = String(gate?.inputSnapshot.instructions ?? "").toLowerCase();
    expect(instructions).toContain("do not synthesize");
    expect(instructions).toContain("never represent an unbuilt or untested prototype as tested");
  });

  it("releases a blocked physical gate when prototype-test evidence is uploaded", () => {
    const source = readFileSync(join(process.cwd(), "convex/evidenceImpact.ts"), "utf8");
    expect(source).toContain('input.evidenceKind === "prototype_test"');
    expect(source).toContain('item.kind === "prototype_physical_evidence"');
    expect(source).toContain('item.status !== "blocked"');
    expect(source).toContain('status: "queued"');
    expect(source).toContain("released the physical prototype-evidence gate");
  });
});
