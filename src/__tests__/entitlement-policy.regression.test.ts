import { describe, expect, it } from "vitest";
import { canTierRunWorkKind, minimumTierForWorkKind } from "@convex/entitlementPolicyLogic";
import { selectNextWorkItem } from "@convex/workOrchestratorLogic";

const item = (kind: string, priority = 1) => ({
  _id: kind,
  kind,
  status: "queued",
  priority,
  createdAt: 1,
  attemptCount: 0,
  estimatedCostUnits: 1,
});

describe("autonomous work entitlements", () => {
  it("keeps free work to research preview and reserves design/handoff for Pro", () => {
    expect(canTierRunWorkKind("free", "preliminary_prior_art")).toBe(true);
    expect(canTierRunWorkKind("free", "technical_feasibility")).toBe(false);
    expect(canTierRunWorkKind("inventor", "feasibility_recommendation")).toBe(true);
    expect(canTierRunWorkKind("inventor", "concept_image_generation")).toBe(false);
    expect(canTierRunWorkKind("pro", "concept_image_generation")).toBe(true);
    expect(minimumTierForWorkKind("engineering_handoff")).toBe("pro");
  });

  it("cannot select a higher-tier job even when it has higher priority and budget", () => {
    const result = selectNextWorkItem(
      [item("concept_image_generation", 100), item("preliminary_prior_art", 10)],
      100,
      Date.now(),
      (kind) => canTierRunWorkKind("free", kind)
    );
    expect(result.selected?.kind).toBe("preliminary_prior_art");
  });

  it("reports an entitlement stop when only paid work is dependency-eligible", () => {
    const result = selectNextWorkItem(
      [item("concept_image_generation")],
      100,
      Date.now(),
      (kind) => canTierRunWorkKind("free", kind)
    );
    expect(result).toMatchObject({ selected: null, reason: "entitlement_required" });
  });
});
