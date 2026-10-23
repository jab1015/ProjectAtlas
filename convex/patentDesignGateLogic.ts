export interface PatentReviewGateRecord {
  deliverableId: string;
  specialty: string;
  status: string;
}

export const PRODUCT_DESIGN_WORK_KINDS = new Set([
  "design_candidate_generation",
  "design_candidate_scoring",
  "product_design_specification",
  "cad_model_specification",
  "exploded_view_specification",
  "manufacturing_drawing_specification",
  "native_cad_generation",
  "product_render_generation",
]);

export function hasAcceptedPatentDesignReview(
  latestHandoffId: string | undefined,
  reviews: readonly PatentReviewGateRecord[],
) {
  return Boolean(
    latestHandoffId && reviews.some((review) =>
      review.deliverableId === latestHandoffId &&
      review.specialty === "patent" &&
      review.status === "accepted"
    )
  );
}

export function canRunProductDesignWork(kind: string | undefined, legalReviewAccepted: boolean) {
  return legalReviewAccepted || !PRODUCT_DESIGN_WORK_KINDS.has(kind ?? "");
}
