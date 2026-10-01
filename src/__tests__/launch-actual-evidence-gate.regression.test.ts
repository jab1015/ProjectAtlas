import { describe, expect, it } from "vitest";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";
import { FULL_JOURNEY_STAGES } from "@convex/fullJourneyDefinition";
import { FULL_JOURNEY_PRO_WORK_KINDS } from "@convex/lifecycleWorkKinds";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

describe("InventSmith actual launch evidence gate", () => {
  it("requires real post-launch evidence before launch-performance analysis", () => {
    const gate = workByKind.get("launch_actual_evidence");
    const performance = workByKind.get("launch_performance");
    const launch = FULL_JOURNEY_STAGES.find((stage) => stage.id === 14);

    expect(gate).toBeDefined();
    expect(gate?.dependsOnKinds).toEqual(expect.arrayContaining(["customer_feedback_loop", "launch_playbook"]));
    expect(gate?.inputSnapshot.externalEvidenceGate).toBe(true);
    expect(String(gate?.inputSnapshot.instructions)).toContain("Forecasts, sales projections, modeled funnels, and pre-launch plans do not satisfy this gate");
    expect(String(gate?.inputSnapshot.instructions)).toContain("needsHuman=true");
    expect(String(gate?.inputSnapshot.instructions)).toContain("humanGateType=private_information");
    expect(performance?.dependsOnKinds).toContain("launch_actual_evidence");
    expect(launch?.requiredWorkKinds).toContain("launch_actual_evidence");
    expect(FULL_JOURNEY_PRO_WORK_KINDS).toContain("launch_actual_evidence");
  });

  it("exposes a first-class sales/launch evidence type and releases the gate when it arrives", () => {
    const evidencePage = readFileSync(join(process.cwd(), "src/app/(app)/invention/[id]/evidence/page.tsx"), "utf8");
    const evidenceImpact = readFileSync(join(process.cwd(), "convex/evidenceImpact.ts"), "utf8");
    const chatEvidence = readFileSync(join(process.cwd(), "convex/chatEvidenceLogic.ts"), "utf8");

    expect(evidencePage).toContain('["sales_evidence", "Sales / launch analytics"]');
    expect(evidenceImpact).toContain('input.evidenceKind === "sales_evidence"');
    expect(evidenceImpact).toContain('item.kind === "launch_actual_evidence"');
    expect(evidenceImpact).toContain("released the launch evidence gate");
    expect(chatEvidence).toContain('return "sales_evidence"');
  });
});
