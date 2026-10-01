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

function nearestRank(sorted: number[], percentile: number): number {
  if (sorted.length === 0) return 0;
  const bounded = Math.max(0, Math.min(1, percentile));
  const rank = Math.max(1, Math.ceil(bounded * sorted.length));
  return sorted[Math.min(sorted.length - 1, rank - 1)] ?? 0;
}

export interface ObservedCostProfile {
  sampleSize: number;
  totalCostUnits: number;
  averageCostUnitsPerInvention: number;
  medianCostUnitsPerInvention: number;
  heavyUseP90CostUnitsPerInvention: number;
  maxObservedCostUnitsPerInvention: number;
  studioOverlap: {
    top3CostUnits: number;
    top6CostUnits: number;
  };
  calibrationConfidence: "insufficient" | "directional" | "representative";
}

/**
 * Derives cost-to-serve scenarios only from measured invention cost units.
 * This intentionally does not convert units to dollars or extrapolate beyond
 * observed evidence. The result becomes progressively more useful as real
 * production invention samples accumulate.
 */
export function buildObservedCostProfile(inventionCostUnits: number[]): ObservedCostProfile {
  const sorted = inventionCostUnits
    .map((value) => Math.max(0, Number.isFinite(value) ? value : 0))
    .sort((a, b) => a - b);
  const totalCostUnits = sorted.reduce((sum, value) => sum + value, 0);
  const descending = [...sorted].sort((a, b) => b - a);
  const sampleSize = sorted.length;

  return {
    sampleSize,
    totalCostUnits,
    averageCostUnitsPerInvention: sampleSize === 0 ? 0 : totalCostUnits / sampleSize,
    medianCostUnitsPerInvention: nearestRank(sorted, 0.5),
    heavyUseP90CostUnitsPerInvention: nearestRank(sorted, 0.9),
    maxObservedCostUnitsPerInvention: sorted[sorted.length - 1] ?? 0,
    studioOverlap: {
      top3CostUnits: descending.slice(0, 3).reduce((sum, value) => sum + value, 0),
      top6CostUnits: descending.slice(0, 6).reduce((sum, value) => sum + value, 0),
    },
    calibrationConfidence: sampleSize >= 30 ? "representative" : sampleSize >= 10 ? "directional" : "insufficient",
  };
}
