import { describe, expect, it } from "vitest";
import { buildConceptImagePrompt, buildProductRenderPrompt, CONCEPT_IMAGE_COST_UNITS, PRODUCT_RENDER_COST_UNITS } from "@convex/conceptImageLogic";

describe("concept visualization generation", () => {
  it("wraps design direction in explicit maturity and safety boundaries", () => {
    const prompt = buildConceptImagePrompt("Show three countertop appliance directions.");
    expect(prompt).toContain("exploratory industrial-design");
    expect(prompt).toContain("Do not imply production CAD");
    expect(prompt).toContain("three countertop appliance directions");
  });

  it("requires a consistent multi-view board for the selected product design", () => {
    const prompt = buildProductRenderPrompt("Render the selected RiseJar revision with its lift mechanism and reusable jar body.");
    expect(prompt).toContain("MULTI-VIEW");
    expect(prompt).toContain("hero three-quarter render");
    expect(prompt).toContain("front view");
    expect(prompt).toContain("side view");
    expect(prompt).toContain("top view");
    expect(prompt).toContain("mechanism/detail close-up");
    expect(prompt).toContain("same product revision");
    expect(prompt).toContain("deterministic CAD exploded-view artifact");
  });

  it("rejects empty image prompts and keeps image generation cost units bounded", () => {
    expect(() => buildConceptImagePrompt("   ")).toThrow("empty");
    expect(() => buildProductRenderPrompt("   ")).toThrow("empty");
    expect(CONCEPT_IMAGE_COST_UNITS).toBeGreaterThan(0);
    expect(CONCEPT_IMAGE_COST_UNITS).toBeLessThan(100);
    expect(PRODUCT_RENDER_COST_UNITS).toBeGreaterThan(0);
    expect(PRODUCT_RENDER_COST_UNITS).toBeLessThan(100);
  });
});
