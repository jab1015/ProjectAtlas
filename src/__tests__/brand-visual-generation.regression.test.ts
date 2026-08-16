import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildBrandIdentityPrompt, BRAND_IDENTITY_COST_UNITS } from "@convex/conceptImageLogic";
import { POST_CANONICAL_WORK_PLAN } from "@convex/fullProductWorkPlan";

describe("InventSmith Stage 8 visual brand generation", () => {
  it("builds a constrained commercial brand concept board prompt", () => {
    const prompt = buildBrandIdentityPrompt("Use the selected product name, customer positioning, and restrained packaging direction.");
    expect(prompt).toContain("PRODUCT BRAND CONCEPT BOARD");
    expect(prompt).toContain("primary wordmark/logo concept");
    expect(prompt).toContain("not trademark clearance");
    expect(prompt).toContain("Do not introduce a different product name");
    expect(BRAND_IDENTITY_COST_UNITS).toBeGreaterThan(0);
  });

  it("requires the Stage 8 asset job to return the visual-generation direction", () => {
    const brandWork = POST_CANONICAL_WORK_PLAN.find((item) => item.kind === "brand_asset_brief");
    expect(brandWork).toBeDefined();
    const instructions = String(brandWork?.inputSnapshot.instructions ?? "");
    expect(instructions).toContain("conceptImagePrompt");
    expect(instructions).toContain("selected naming direction");
    expect(instructions).toContain("must not invent a different name");
  });

  it("routes the existing Stage 8 asset brief through image generation and stored PNG delivery", () => {
    const orchestration = readFileSync(join(process.cwd(), "convex/atlasWorkOrchestration.ts"), "utf8");
    expect(orchestration).toContain('workItem.kind === "brand_asset_brief"');
    expect(orchestration).toContain("buildBrandIdentityPrompt(imagePrompt)");
    expect(orchestration).toContain("BRAND_IDENTITY_COST_UNITS");
    expect(orchestration).toContain('mediaType = "image/png"');
    expect(orchestration).toContain('artifactMaturity = "concept_visualization"');
  });
});
