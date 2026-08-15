import { normalizeAtlasTier, type AtlasTier } from "./usagePolicyLogic";
import { FULL_JOURNEY_PRO_WORK_KINDS } from "./lifecycleWorkKinds";

const FREE_WORK = new Set([
  "idea_capture",
  "brief_analysis",
  "competitor_discovery",
  "assumptions_unknowns",
  "market_feasibility",
  "preliminary_prior_art",
]);

const INVENTOR_WORK = new Set([
  ...FREE_WORK,
  "technical_feasibility",
  "materials_manufacturing",
  "regulatory_screening",
  "ip_readiness",
  "feature_prior_art_comparison",
  "distinguishing_features",
  "product_requirements",
  "preliminary_bom_cost",
  "development_risks",
  "evidence_verification",
  "feasibility_recommendation",
]);

const PRO_WORK = new Set([
  ...INVENTOR_WORK,
  "design_directions",
  "concept_image_generation",
  "engineering_handoff",
  "package_assembly",
  "patent_design_handoff",
  "design_candidate_generation",
  "design_candidate_scoring",
  "product_design_specification",
  "cad_model_specification",
  "exploded_view_specification",
  "manufacturing_drawing_specification",
  "native_cad_generation",
  "product_render_generation",
  "professional_service_plan",
  "professional_provider_research",
  ...FULL_JOURNEY_PRO_WORK_KINDS,
]);

export function canTierRunWorkKind(tier: unknown, kind: string | undefined): boolean {
  if (!kind) return false;
  const normalized = normalizeAtlasTier(tier);
  if (normalized === "enterprise" || normalized === "pro") return PRO_WORK.has(kind);
  if (normalized === "inventor") return INVENTOR_WORK.has(kind);
  return FREE_WORK.has(kind);
}

export function minimumTierForWorkKind(kind: string): AtlasTier | null {
  if (FREE_WORK.has(kind)) return "free";
  if (INVENTOR_WORK.has(kind)) return "inventor";
  if (PRO_WORK.has(kind)) return "pro";
  return null;
}
