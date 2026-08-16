import { describe, expect, it } from "vitest";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";
import { FULL_JOURNEY_STAGES } from "@convex/fullJourneyDefinition";
import { FULL_JOURNEY_PRO_WORK_KINDS } from "@convex/lifecycleWorkKinds";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

describe("InventSmith manufacturer quote evidence gate", () => {
  it("requires real manufacturer evidence before quote comparison", () => {
    const gate = workByKind.get("manufacturer_quote_evidence");
    const comparison = workByKind.get("manufacturer_quote_comparison");
    const manufacturing = FULL_JOURNEY_STAGES.find((stage) => stage.id === 7);

    expect(gate).toBeDefined();
    expect(gate?.dependsOnKinds).toEqual(expect.arrayContaining(["manufacturer_rfq_package", "manufacturer_sourcing"]));
    expect(gate?.inputSnapshot.externalEvidenceGate).toBe(true);
    expect(String(gate?.inputSnapshot.instructions)).toContain("needsHuman=true");
    expect(String(gate?.inputSnapshot.instructions)).toContain("Do not invent prices, MOQs, lead times, tooling");
    expect(comparison?.dependsOnKinds).toContain("manufacturer_quote_evidence");
    expect(manufacturing?.requiredWorkKinds).toContain("manufacturer_quote_evidence");
    expect(FULL_JOURNEY_PRO_WORK_KINDS).toContain("manufacturer_quote_evidence");
  });

  it("automatically releases the gate when a real quote/RFQ is uploaded", () => {
    const source = readFileSync(join(process.cwd(), "convex/evidenceImpact.ts"), "utf8");
    expect(source).toContain('input.evidenceKind === "manufacturer_quote"');
    expect(source).toContain('item.kind === "manufacturer_quote_evidence"');
    expect(source).toContain("released the manufacturer quote-evidence gate");
  });
});
