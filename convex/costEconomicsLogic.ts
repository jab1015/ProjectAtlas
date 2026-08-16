export type CostOperationClass = "light" | "standard" | "expensive" | "premium";

const PREMIUM_WORK_KINDS = new Set([
  "concept_image_generation",
  "product_render_generation",
  "brand_asset_brief",
  "native_cad_generation",
]);

const EXPENSIVE_WORK_KINDS = new Set([
  "preliminary_prior_art",
  "evidence_verification",
  "manufacturer_sourcing",
  "professional_provider_research",
  "funding_source_research",
  "grant_program_research",
  "pitch_deck_content",
  "financial_model",
  "design_candidate_generation",
  "design_candidate_scoring",
  "product_design_specification",
  "cad_model_specification",
  "ask_inventsmith_research",
]);

const LIGHT_WORK_KINDS = new Set([
  "brief_analysis",
  "assumptions_unknowns",
  "launch_readiness",
  "post_launch_priorities",
  "growth_performance_reporting",
]);

/**
 * Cost classes are an operational budgeting aid, not a claim about vendor price.
 * They let Modern Methods measure which workflows consume the most InventSmith
 * capacity before exact model/search/image/CAD dollar calibration is locked.
 */
export function classifyCostOperation(kind: string | undefined): CostOperationClass {
  const normalized = kind?.trim() ?? "";
  if (PREMIUM_WORK_KINDS.has(normalized)) return "premium";
  if (EXPENSIVE_WORK_KINDS.has(normalized)) return "expensive";
  if (LIGHT_WORK_KINDS.has(normalized)) return "light";
  return "standard";
}

export interface CostClassAccumulator {
  costUnits: number;
  completions: number;
}

export function emptyCostClassSummary(): Record<CostOperationClass, CostClassAccumulator> {
  return {
    light: { costUnits: 0, completions: 0 },
    standard: { costUnits: 0, completions: 0 },
    expensive: { costUnits: 0, completions: 0 },
    premium: { costUnits: 0, completions: 0 },
  };
}

export function addCostClassUsage(
  summary: Record<CostOperationClass, CostClassAccumulator>,
  kind: string | undefined,
  costUnits: number,
  completed: boolean
) {
  const operationClass = classifyCostOperation(kind);
  summary[operationClass].costUnits += Math.max(0, costUnits);
  if (completed) summary[operationClass].completions += 1;
  return operationClass;
}
