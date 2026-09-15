import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { isAdmin } from "./authHelpers";
import {
  deriveArtifactMaturityFromProfessionalReviews,
  deriveTrustStateFromProfessionalReviews,
  validateProfessionalReviewRecord,
} from "./professionalReviewLogic";

export type RecordProfessionalReviewArgs = {
  reviewId: Id<"professionalReviews">;
  reviewerName: string;
  reviewerReference?: string;
  notes?: string;
  accepted: boolean;
};

function sameOptionalText(left: string | undefined, right: string | undefined) {
  return (left ?? undefined) === (right ?? undefined);
}

/**
 * Actual handler used by the public recordProfessionalReview mutation.
 * It binds CAD promotion to the newest exact revision, keeps manufacturing release
 * separate, records auditable reviewer evidence, and makes exact replays idempotent.
 */
export async function recordProfessionalReviewHandler(
  ctx: MutationCtx,
  args: RecordProfessionalReviewArgs
) {
  if (!(await isAdmin(ctx))) {
    throw new ConvexError("Administrator authorization is required to record a professional review");
  }

  const review = await ctx.db.get(args.reviewId);
  if (!review) throw new ConvexError("Professional review not found");
  const deliverable = await ctx.db.get(review.deliverableId);
  if (!deliverable || deliverable.inventionId !== review.inventionId) {
    throw new ConvexError("Reviewed deliverable is missing or does not belong to this invention");
  }

  const validatedReview = validateProfessionalReviewRecord(args);
  if (!validatedReview.valid) throw new ConvexError(validatedReview.error);
  const status = args.accepted ? "accepted" as const : "changes_requested" as const;

  const siblingReviews = await ctx.db
    .query("professionalReviews")
    .withIndex("by_deliverableId", (q) => q.eq("deliverableId", review.deliverableId))
    .collect();
  const effectiveReviews = siblingReviews.map((item) => ({
    specialty: item.specialty,
    status: item._id === review._id ? status : item.status,
    deliverableId: String(item.deliverableId),
  }));
  const trustState = deriveTrustStateFromProfessionalReviews(
    effectiveReviews.map((item) => item.status)
  );

  let isCurrentRevision = true;
  if (deliverable.kind === "native_cad_package") {
    const cadRevisions = await ctx.db
      .query("atlasDeliverables")
      .withIndex("by_inventionId_kind", (q) =>
        q.eq("inventionId", review.inventionId).eq("kind", "native_cad_package")
      )
      .collect();
    const maxVersion = cadRevisions.reduce(
      (highest, candidate) => Math.max(highest, candidate.version),
      Number.NEGATIVE_INFINITY
    );
    const latestRevisionIds = cadRevisions
      .filter((candidate) => candidate.version === maxVersion)
      .map((candidate) => String(candidate._id));
    isCurrentRevision =
      latestRevisionIds.length === 1 && latestRevisionIds[0] === String(deliverable._id);
  }

  const artifactMaturity = deriveArtifactMaturityFromProfessionalReviews({
    deliverableId: String(deliverable._id),
    deliverableKind: deliverable.kind,
    currentMaturity: deliverable.artifactMaturity,
    staleReason: deliverable.staleReason,
    isCurrentRevision,
    reviews: effectiveReviews,
  });

  const reviewAlreadyMatches =
    review.status === status &&
    review.reviewerName === validatedReview.reviewerName &&
    review.reviewerReference === validatedReview.reviewerReference &&
    sameOptionalText(review.notes, validatedReview.notes);
  const deliverableAlreadyMatches =
    deliverable.trustState === trustState &&
    deliverable.artifactMaturity === artifactMaturity;

  if (reviewAlreadyMatches && deliverableAlreadyMatches) {
    return { success: true, trustState, artifactMaturity, isCurrentRevision, idempotent: true };
  }

  const now = Date.now();
  if (!reviewAlreadyMatches) {
    await ctx.db.patch(review._id, {
      status,
      reviewerName: validatedReview.reviewerName,
      reviewerReference: validatedReview.reviewerReference,
      notes: validatedReview.notes,
      reviewedAt: now,
      updatedAt: now,
    });
  }
  if (!deliverableAlreadyMatches) {
    await ctx.db.patch(review.deliverableId, {
      trustState,
      artifactMaturity: artifactMaturity as typeof deliverable.artifactMaturity,
      updatedAt: now,
    });
  }

  await ctx.db.insert("atlasExecutionEvents", {
    inventionId: review.inventionId,
    eventType: "professional_review_recorded",
    actorType: "system",
    summary: `${review.specialty} professional review recorded as ${status}.`,
    metadata: {
      reviewId: String(review._id),
      deliverableId: String(review.deliverableId),
      deliverableVersion: deliverable.version,
      specialty: review.specialty,
      status,
      artifactMaturity,
      isCurrentRevision,
    },
    createdAt: now,
  });

  return { success: true, trustState, artifactMaturity, isCurrentRevision, idempotent: false };
}
