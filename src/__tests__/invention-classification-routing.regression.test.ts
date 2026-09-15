import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  classifyInvention,
  riskClassForClassification,
} from "../../convex/inventionClassificationLogic";
import { buildInventionWorkPlan } from "../../convex/inventionWorkPlanLogic";
import { journeyStagesForProductType } from "../../convex/fullJourneyDefinition";
import { canTierRunWorkKind } from "../../convex/entitlementPolicyLogic";

function convexSource(file: string) {
  return readFileSync(join(process.cwd(), "convex", file), "utf8");
}

describe("InventSmith invention classification and journey routing", () => {
  it("keeps ordinary physical inventions on the physical development path", () => {
    const classification = classifyInvention({
      title: "Adjustable kitchen jar opener",
      problemStatement: "People with limited grip strength struggle to open jars.",
      solutionDescription: "A mechanical handheld tool with an adjustable gripping mechanism.",
    });
    expect(classification.productType).toBe("physical");
    expect(classification.supportClass).toBe("standard");
    const plan = buildInventionWorkPlan(classification);
    const kinds = new Set([...plan.canonical, ...plan.postCanonical].map((item) => item.kind));
    expect(kinds.has("native_cad_generation")).toBe(true);
    expect(kinds.has("manufacturer_rfq_package")).toBe(true);
    expect(kinds.has("software_architecture")).toBe(false);
  });

  it("treats apps and SaaS as first-class software inventions instead of rejecting them", () => {
    const classification = classifyInvention({
      title: "Family care coordination app",
      problemStatement: "Families struggle to coordinate care for elderly parents.",
      solutionDescription: "An iOS and Android app with shared schedules, tasks, alerts, and secure family messaging.",
    });
    expect(classification.productType).toBe("software");
    expect(classification.supportClass).toBe("standard");
    const plan = buildInventionWorkPlan(classification);
    const kinds = new Set([...plan.canonical, ...plan.postCanonical].map((item) => item.kind));
    expect(kinds.has("software_product_specification")).toBe(true);
    expect(kinds.has("software_ux_flow_design")).toBe(true);
    expect(kinds.has("software_architecture")).toBe(true);
    expect(kinds.has("software_security_privacy_review")).toBe(true);
    expect(kinds.has("software_qa_test_plan")).toBe(true);
    expect(kinds.has("software_distribution_release_plan")).toBe(true);
    expect(kinds.has("native_cad_generation")).toBe(false);
    expect(kinds.has("prototype_physical_evidence")).toBe(false);
    expect(kinds.has("manufacturer_quote_evidence")).toBe(false);
  });

  it("runs both branches for hybrid hardware/software inventions", () => {
    const classification = classifyInvention({
      title: "Connected leak sensor",
      solutionDescription: "A physical wireless sensor and mobile app that detect and report household water leaks.",
    });
    expect(classification.productType).toBe("hybrid");
    const plan = buildInventionWorkPlan(classification);
    const kinds = new Set([...plan.canonical, ...plan.postCanonical].map((item) => item.kind));
    expect(kinds.has("native_cad_generation")).toBe(true);
    expect(kinds.has("manufacturer_rfq_package")).toBe(true);
    expect(kinds.has("software_architecture")).toBe(true);
    expect(kinds.has("software_qa_test_plan")).toBe(true);
  });

  it("supports regulated inventions with professional review rather than blanket rejecting them", () => {
    const medical = classifyInvention({
      title: "Home medical device",
      solutionDescription: "A medical device that helps a patient track a rehabilitation exercise.",
    });
    expect(medical.supportClass).toBe("regulated_review");
    expect(riskClassForClassification(medical)).toBe("professional_review_required");
    expect(medical.professionalReviewAreas.length).toBeGreaterThan(0);

    const healthSoftware = classifyInvention({
      title: "Patient portal app",
      solutionDescription: "A SaaS application that stores patient data and is intended for HIPAA-regulated clinics.",
    });
    expect(healthSoftware.productType).toBe("software");
    expect(healthSoftware.supportClass).toBe("regulated_review");
  });

  it("rejects clearly harmful or abusive product concepts", () => {
    const inputs = [
      { title: "Ransomware platform", solutionDescription: "Malware that encrypts victim files for payment." },
      { title: "Covert surveillance tool", solutionDescription: "Spyware designed to secretly record another person's private messages." },
      { title: "Explosive weapon system", solutionDescription: "An explosive device designed as a weapon system." },
      { title: "Identity theft automation", solutionDescription: "Software designed to commit fraud and steal credit card data." },
      { title: "Chemical weapon delivery device", solutionDescription: "A device designed to weaponize a toxic chemical." },
    ];
    for (const input of inputs) {
      const classification = classifyInvention(input);
      expect(classification.supportClass).toBe("unsupported");
      expect(riskClassForClassification(classification)).toBe("restricted");
      expect(classification.unsupportedReason).toBeTruthy();
    }
  });

  it("routes ordinary service-business ideas outside the invention workflow", () => {
    const classification = classifyInvention({
      title: "Start a landscaping company",
      solutionDescription: "I want to open a landscaping service business for local homeowners.",
    });
    expect(classification.supportClass).toBe("unsupported");
    expect(classification.categories).toContain("business-only concept");
    expect(classification.unsupportedReason).toMatch(/inventions and product concepts/i);
  });

  it("does not confuse ordinary security products with covert surveillance abuse", () => {
    const classification = classifyInvention({
      title: "Home security camera app",
      solutionDescription: "A visible home security camera with an app for the property owner to review alerts.",
    });
    expect(classification.supportClass).not.toBe("unsupported");
  });

  it("renames and reroutes software stages 5 through 7 while hybrids require both branches", () => {
    const software = journeyStagesForProductType("software");
    expect(software.find((stage) => stage.id === 5)?.name).toBe("Software Product Design");
    expect(software.find((stage) => stage.id === 6)?.name).toBe("Software Prototype & Build");
    expect(software.find((stage) => stage.id === 7)?.name).toBe("Software Engineering & Release Readiness");
    expect(software.find((stage) => stage.id === 5)?.requiredWorkKinds).toContain("software_architecture");
    expect(software.find((stage) => stage.id === 5)?.requiredWorkKinds).not.toContain("native_cad_generation");

    const hybrid = journeyStagesForProductType("hybrid");
    expect(hybrid.find((stage) => stage.id === 5)?.requiredWorkKinds).toContain("native_cad_generation");
    expect(hybrid.find((stage) => stage.id === 5)?.requiredWorkKinds).toContain("software_architecture");
  });

  it("never leaves a routed work item depending on a work kind absent from its plan", () => {
    for (const input of [
      { title: "Mechanical tool", solutionDescription: "A mechanical handheld device." },
      { title: "Mobile app", solutionDescription: "A SaaS mobile app and cloud service." },
      { title: "Smart wearable app", solutionDescription: "A wearable sensor with electronics and a mobile app." },
    ]) {
      const plan = buildInventionWorkPlan(classifyInvention(input));
      const all = [...plan.canonical, ...plan.postCanonical];
      const kinds = new Set(all.map((item) => item.kind));
      for (const item of all) {
        for (const dependency of item.dependsOnKinds ?? []) expect(kinds.has(dependency), `${item.kind} -> ${dependency}`).toBe(true);
      }
    }
  });

  it("allows Pro and Enterprise organizations to execute every software work kind", () => {
    const software = buildInventionWorkPlan(classifyInvention({ title: "Mobile app", solutionDescription: "An Android and iOS app." }));
    const softwareKinds = software.postCanonical.map((item) => item.kind).filter((kind) => kind.startsWith("software_"));
    expect(softwareKinds.length).toBeGreaterThan(5);
    for (const kind of softwareKinds) {
      expect(canTierRunWorkKind("pro", kind), kind).toBe(true);
      expect(canTierRunWorkKind("enterprise", kind), kind).toBe(true);
    }
  });

  it("classifies organization-native intake before persistence and queues the tailored work plan", () => {
    const source = convexSource("organizationInventions.ts");
    const classificationIndex = source.indexOf("const classification = classifyInvention(brief)");
    const insertIndex = source.indexOf('ctx.db.insert("inventions"');
    expect(classificationIndex).toBeGreaterThan(-1);
    expect(insertIndex).toBeGreaterThan(classificationIndex);
    expect(source).toContain('classification.supportClass === "unsupported"');
    expect(source).toContain("unsupportedInventionMessage(classification)");
    expect(source).toContain("initializeClassifiedInvention");
  });

  it("keeps the live onboarding UI on the organization-native classified creation path", () => {
    const onboarding = readFileSync(join(process.cwd(), "src/app/(app)/onboarding/page.tsx"), "utf8");
    expect(onboarding).toContain('"organizationInventions:create"');
    expect(onboarding).not.toContain('"journeyEngine:createInvention"');
  });

  it("stores classification in the canonical record without requiring a destructive schema migration", () => {
    const initializer = convexSource("inventionInitialization.ts");
    expect(initializer).toContain("riskClassForClassification(classification)");
    expect(initializer).toContain("productType: classification.productType");
    expect(initializer).toContain("supportClass: classification.supportClass");
    expect(initializer).toContain("professionalReviewAreas: classification.professionalReviewAreas");
    const schema = convexSource("schema.ts");
    expect(schema).toContain('v.literal("professional_review_required")');
  });
});
