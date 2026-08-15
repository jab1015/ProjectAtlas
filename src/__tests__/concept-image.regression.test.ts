import { describe, expect, it } from "vitest";
import { buildConceptImagePrompt, CONCEPT_IMAGE_COST_UNITS } from "@convex/conceptImageLogic";

describe("concept visualization generation", () => {
  it("wraps design direction in explicit maturity and safety boundaries", () => {
    const prompt = buildConceptImagePrompt("Show three countertop appliance directions.");
    expect(prompt).toContain("exploratory industrial-design");
    expect(prompt).toContain("Do not imply production CAD");
    expect(prompt).toContain("three countertop appliance directions");
  });

  it("rejects an empty image prompt and uses a bounded cost unit estimate", () => {
    expect(() => buildConceptImagePrompt("   ")).toThrow("empty");
    expect(CONCEPT_IMAGE_COST_UNITS).toBeGreaterThan(0);
    expect(CONCEPT_IMAGE_COST_UNITS).toBeLessThan(100);
  });
});
