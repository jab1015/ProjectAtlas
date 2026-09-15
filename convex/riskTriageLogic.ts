import {
  classifyInvention,
  type InventionClassificationInput,
} from "./inventionClassificationLogic";

export interface InventionRiskInput extends InventionClassificationInput {}

export interface InventionRiskTriage {
  restricted: boolean;
  professionalReviewRequired: boolean;
  categories: string[];
  professionalReviewAreas: string[];
  reason?: string;
}

/**
 * Runtime safety triage now distinguishes unsupported concepts from regulated
 * concepts. Regulated inventions remain supported, but they carry explicit
 * professional-review requirements. Only unsupported harmful/abusive concepts
 * stop autonomous execution entirely.
 */
export function triageInventionRisk(input: InventionRiskInput): InventionRiskTriage {
  const classification = classifyInvention(input);
  return {
    restricted: classification.supportClass === "unsupported",
    professionalReviewRequired: classification.supportClass === "regulated_review",
    categories: classification.categories,
    professionalReviewAreas: classification.professionalReviewAreas,
    reason: classification.unsupportedReason,
  };
}

export function restrictedPilotReason(categories: string[], reason?: string) {
  const scope = categories.length > 0 ? categories.join(", ") : "an unsupported product category";
  return reason ?? `This invention appears to involve ${scope}. InventSmith does not autonomously develop this category.`;
}
