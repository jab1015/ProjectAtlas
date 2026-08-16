import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CANONICAL_WORK_PLAN } from "../../convex/canonicalWorkPlan";
import { POST_CANONICAL_WORK_PLAN } from "../../convex/fullProductWorkPlan";
import { FULL_JOURNEY_STAGES } from "../../convex/fullJourneyDefinition";
import { buildBrandIdentityPrompt } from "../../convex/conceptImageLogic";
import { financialModelMarkdownToSpreadsheetXml } from "../../convex/tabularExportLogic";

const allWork = [...CANONICAL_WORK_PLAN, ...POST_CANONICAL_WORK_PLAN];
const allKinds = new Set(allWork.map((item) => item.kind));
const byKind = new Map(allWork.map((item) => [item.kind, item]));
const postByKind = new Map(POST_CANONICAL_WORK_PLAN.map((item) => [item.kind, item]));

const EXPECTED_STAGES = [
  "Idea",
  "Validation",
  "Market Research",
  "Patent Readiness",
  "Product Design + CAD",
  "Prototype",
  "Manufacturing",
  "Branding",
  "Intellectual Property / Legal",
  "Pricing",
  "Marketing",
  "Sales",
  "Funding",
  "Launch",
  "Growth",
];

describe("InventSmith complete idea-to-market repository acceptance contract", () => {
  it("keeps the authoritative 15-stage inventor journey intact", () => {
    expect(FULL_JOURNEY_STAGES).toHaveLength(15);
    expect(FULL_JOURNEY_STAGES.map((stage) => stage.id)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
    expect(FULL_JOURNEY_STAGES.map((stage) => stage.name)).toEqual(EXPECTED_STAGES);
    for (const stage of FULL_JOURNEY_STAGES) {
      expect(stage.requiredWorkKinds.length, `Stage ${stage.id} ${stage.name} has no required work`).toBeGreaterThan(0);
      for (const kind of stage.requiredWorkKinds) {
        expect(allKinds.has(kind), `Stage ${stage.id} references missing work ${kind}`).toBe(true);
      }
    }
  });

  it("keeps real-world evidence gates between generated plans and observed reality", () => {
    expect(byKind.get("prototype_evidence_assessment")?.dependsOnKinds).toContain("prototype_physical_evidence");
    expect(byKind.get("manufacturer_quote_comparison")?.dependsOnKinds).toContain("manufacturer_quote_evidence");
    expect(byKind.get("launch_performance")?.dependsOnKinds).toContain("launch_actual_evidence");

    const prototype = postByKind.get("prototype_physical_evidence");
    const quote = postByKind.get("manufacturer_quote_evidence");
    const launch = postByKind.get("launch_actual_evidence");
    expect(String(prototype?.inputSnapshot.instructions)).toContain("do not synthesize");
    expect(String(quote?.inputSnapshot.instructions)).toContain("Do not invent prices");
    expect(String(launch?.inputSnapshot.instructions)).toContain("Forecasts, sales projections, modeled funnels");
  });

  it("keeps native product-design outputs beyond concept imagery", () => {
    const cadPlan = byKind.get("native_cad_generation");
    expect(cadPlan?.dependsOnKinds).toEqual(expect.arrayContaining([
      "product_design_specification",
      "cad_model_specification",
      "manufacturing_drawing_specification",
    ]));

    const cadSource = readFileSync(join(process.cwd(), "convex/nativeCadGeneration.ts"), "utf8");
    for (const artifactKind of ["native_cad_step", "native_cad_stl", "native_cad_dxf", "native_cad_source", "cad_orthographic_views", "cad_exploded_view"]) {
      expect(cadSource, `native CAD missing ${artifactKind}`).toContain(artifactKind);
    }
    expect(cadSource).toContain('"threadedTube"');
    expect(cadSource).toContain('"revolvedProfile"');
    expect(cadSource).toContain("Preliminary CAD requiring engineering/prototype review before manufacturing release");
  });

  it("keeps commercial artifact generation as produced outputs rather than briefs only", () => {
    const brandWork = postByKind.get("brand_asset_brief");
    expect(String(brandWork?.inputSnapshot.instructions)).toContain("conceptImagePrompt");
    const brandPrompt = buildBrandIdentityPrompt("Use the selected evidence-backed name and brand direction.");
    expect(brandPrompt).toContain("PRODUCT BRAND CONCEPT BOARD");

    const orchestration = readFileSync(join(process.cwd(), "convex/atlasWorkOrchestration.ts"), "utf8");
    expect(orchestration).toContain('workItem.kind === "brand_asset_brief"');
    expect(orchestration).toContain('workItem.kind === "pitch_deck_content"');
    expect(orchestration).toContain("buildPitchDeckArtifact");

    const workbook = financialModelMarkdownToSpreadsheetXml("## Revenue\n| Metric | Y1 |\n| --- | ---: |\n| Revenue | $100 |", "Representative invention");
    expect(workbook).toContain("Excel.Sheet");
    expect(workbook).toContain('ss:Name="Revenue"');
  });

  it("keeps downstream departments inventor-visible instead of ending at Stage 4", () => {
    const dashboard = readFileSync(join(process.cwd(), "src/app/(app)/dashboard/page.tsx"), "utf8");
    const journey = readFileSync(join(process.cwd(), "src/app/(app)/invention/[id]/journey/page.tsx"), "utf8");
    const department = readFileSync(join(process.cwd(), "src/app/(app)/invention/[id]/department/[stageId]/page.tsx"), "utf8");
    const legacyGuard = readFileSync(join(process.cwd(), "src/app/(app)/invention/[id]/layout.tsx"), "utf8");

    expect(dashboard).toContain("Complete InventSmith journey");
    expect(dashboard).toContain("Open Journey Center");
    expect(journey).toContain("Complete inventor journey");
    expect(journey).toContain("journey.stages.map");
    expect(journey).toContain("journey.totalStages");
    expect(department).toContain("Department deliverables");
    expect(department).toContain("Evidence Locker");
    expect(legacyGuard).toContain("state.currentStageId >= 5");
    expect(legacyGuard).toContain("router.replace(`${rootPath}/journey`)");
  });

  it("keeps repository auth wiring present while leaving deployed session persistence to live acceptance", () => {
    const auth = readFileSync(join(process.cwd(), "convex/auth.ts"), "utf8");
    const authConfig = readFileSync(join(process.cwd(), "convex/auth.config.ts"), "utf8");
    const journey = readFileSync(join(process.cwd(), "src/app/(app)/invention/[id]/journey/page.tsx"), "utf8");

    expect(auth).toContain("convexAuth");
    expect(auth).toContain("Password");
    expect(auth).toContain("isAuthenticated");
    expect(authConfig).toContain("process.env.CONVEX_SITE_URL");
    expect(authConfig).toContain('applicationID: "convex"');
    expect(journey).toContain("useConvexAuth");
    expect(journey).toContain('router.push("/sign-in")');
  });

  it("keeps subscription entitlement and privacy/export/deletion behavior inside the full-product contract", () => {
    const entitlement = readFileSync(join(process.cwd(), "convex/entitlementPolicyLogic.ts"), "utf8");
    const subscription = readFileSync(join(process.cwd(), "convex/subscriptionPolicyLogic.ts"), "utf8");
    const privacyExport = readFileSync(join(process.cwd(), "convex/privacyExport.ts"), "utf8");
    const accountDeletion = readFileSync(join(process.cwd(), "convex/accountDeletion.ts"), "utf8");
    const exportPage = readFileSync(join(process.cwd(), "src/app/(app)/account/data-export/page.tsx"), "utf8");

    expect(entitlement).toContain("canTierRunWorkKind");
    expect(subscription).toContain("effectiveTierForSubscription");
    expect(subscription).toContain('status === "canceled"');
    expect(privacyExport).toContain("getAuthUserId(ctx)");
    expect(privacyExport).toContain("binaryContentIncluded: false");
    expect(privacyExport).not.toContain('ctx.db.query("authSessions")');
    expect(exportPage).toContain("Download JSON export");
    expect(accountDeletion).toContain("ctx.storage.delete");
    expect(accountDeletion).toContain('query("authRefreshTokens")');
    expect(accountDeletion).toContain("purchasesAnonymized");
    expect(accountDeletion).toContain("subscriptionEventsAnonymized");
  });

  it("keeps the product promise tied to the complete destination rather than the retired pilot", () => {
    const spec = readFileSync(join(process.cwd(), "docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md"), "utf8");
    const progress = readFileSync(join(process.cwd(), "docs/ATLAS_BUILD_PROGRESS.md"), "utf8");
    expect(spec).toContain("Idea → Evidence → Validation");
    expect(spec).toContain("Launch → Growth");
    expect(spec).toContain("InventSmith is not complete until the complete idea-to-market operating system");
    expect(progress).toContain("The retired controlled-pilot 80% figure must never be used as overall InventSmith completion");
  });
});
