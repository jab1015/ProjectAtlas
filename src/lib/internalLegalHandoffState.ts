export type InternalLegalHandoffReview = {
  deliverableId: string;
  specialty: string;
  status: string;
};

export function hasAcceptedInternalLegalHandoff(
  handoffId: string | undefined,
  reviews: InternalLegalHandoffReview[],
): boolean {
  return Boolean(
    handoffId &&
      reviews.some(
        (review) =>
          review.deliverableId === handoffId &&
          review.specialty === "patent" &&
          review.status === "accepted",
      ),
  );
}
