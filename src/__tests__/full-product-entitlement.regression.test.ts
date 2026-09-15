import { describe, expect, it } from "vitest";
import { canTierRunWorkKind, minimumTierForWorkKind } from "../../convex/entitlementPolicyLogic";

const mandatoryProWork = [
  "patent_design_handoff",
  "design_candidate_generation",
  "native_cad_generation",
  "product_render_generation",
  "manufacturer_sourcing",
  "professional_service_plan",
  "professional_provider_research",
  "pitch_deck_content",
  "launch_readiness",
  "growth_audit",
];

describe("InventSmith full-product entitlement coverage", () => {
  it.each(mandatoryProWork)("allows Pro and Enterprise to execute %s", (kind) => {
    expect(canTierRunWorkKind("pro", kind)).toBe(true);
    expect(canTierRunWorkKind("enterprise", kind)).toBe(true);
    expect(minimumTierForWorkKind(kind)).toBe("pro");
  });

  it("does not accidentally expose paid design/CAD/professional work to Free", () => {
    expect(canTierRunWorkKind("free", "native_cad_generation")).toBe(false);
    expect(canTierRunWorkKind("free", "product_render_generation")).toBe(false);
    expect(canTierRunWorkKind("free", "professional_provider_research")).toBe(false);
    expect(canTierRunWorkKind("free", "pitch_deck_content")).toBe(false);
  });
});
