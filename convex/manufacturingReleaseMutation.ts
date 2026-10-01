import { ConvexError, v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { NATIVE_CAD_DELIVERABLE_KINDS, isNativeCadDeliverableKind } from "./cadArtifactKinds";
import { requireInventionManageAccess } from "./organizations";
import { requiredProfessionalReviews } from "./professionalReviewPolicy";

export type ManufacturingReleaseResult = {
  success: true;
  idempotent: boolean;
  version: number;
  deliverableIds: Id<"atlasDeliverables">[];
};

function sortedIds(values: Array<string | Id<"atlasDeliverables">>): string[] {
  return values.map(String).sort();
}

function sameStringSet(left: unknown, right: string[]): boolean {
  return Array.isArray(left) &&
    left.length === right.length &&
    [...left].map(String).sort().every((value, index) => value === right[index]);
}

/**
 * Releases one exact, current native-CAD generation for manufacturing planning.
 *
 * A CAD generation is the complete six-artifact native set emitted at one revision.
 * Release is intentionally separate from professional review, external-use permission,
 * supplier contact, purchasing/payment, a production order, legal filing, and publishing.
 * Those consequential operations keep their own authorization boundaries.
 */
export async function releaseCadGenerationForManufacturingHandler(
  ctx: MutationCtx,
  args: { deliverableId: Id<"atlasDeliverables"> }
): Promise<ManufacturingReleaseResult> {
  const anchor = await ctx.db.get(args.deliverableId);
  if (!anchor) throw new ConvexError("Deliverable not found");
  if (!isNativeCadDeliverableKind(anchor.kind)) {
    throw new ConvexError("Manufacturing release requires a concrete native CAD artifact");
  }

  const { userId } = await requireInventionManageAccess(ctx, anchor.inventionId);
  const [deliverables, reviews, events] = await Promise.all([
    ctx.db
      .query("atlasDeliverables")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", anchor.inventionId))
      .collect(),
    ctx.db
      .query("professionalReviews")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", anchor.inventionId))
      .collect(),
    ctx.db
      .query("atlasExecutionEvents")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", anchor.inventionId))
      .collect(),
  ]);

  const generation = NATIVE_CAD_DELIVERABLE_KINDS.map((kind) => {
    const sameKind = deliverables.filter((deliverable) => deliverable.kind === kind);
    if (sameKind.length === 0) {
      throw new ConvexError(`Manufacturing release requires the complete native CAD generation; missing ${kind}`);
    }
    const latestVersion = Math.max(...sameKind.map((deliverable) => deliverable.version));
    const latest = sameKind.filter((deliverable) => deliverable.version === latestVersion);
    if (latest.length !== 1) {
      throw new ConvexError(`Manufacturing release requires one unambiguous latest ${kind} revision`);
    }
    return latest[0];
  });

  const versions = new Set(generation.map((deliverable) => deliverable.version));
  if (versions.size !== 1 || generation[0].version !== anchor.version) {
    throw new ConvexError("Native CAD artifacts are not one current synchronized generation");
  }
  if (!generation.some((deliverable) => String(deliverable._id) === String(anchor._id))) {
    throw new ConvexError("Only an artifact in the current native CAD generation can anchor manufacturing release");
  }

  for (const deliverable of generation) {
    if (deliverable.staleReason) {
      throw new ConvexError(`Stale CAD artifact ${deliverable.kind} must be refreshed before manufacturing release`);
    }
    if (deliverable.trustState !== "professionally_reviewed" && deliverable.trustState !== "ready_for_authorized_use") {
      throw new ConvexError(`Professional review must be completed for ${deliverable.kind} before manufacturing release`);
    }

    const exactReviews = reviews.filter(
      (review) => String(review.deliverableId) === String(deliverable._id)
    );
    if (exactReviews.length === 0 || exactReviews.some((review) => review.status !== "accepted")) {
      throw new ConvexError(`All exact professional reviews for ${deliverable.kind} must be accepted before manufacturing release`);
    }

    for (const requirement of requiredProfessionalReviews(deliverable.kind)) {
      const accepted = exactReviews.find(
        (review) => review.specialty === requirement.specialty && review.status === "accepted"
      );
      if (
        !accepted ||
        (accepted.reviewerName?.trim().length ?? 0) < 2 ||
        (accepted.reviewerReference?.trim().length ?? 0) < 3 ||
        typeof accepted.reviewedAt !== "number"
      ) {
        throw new ConvexError(`Manufacturing release requires auditable accepted ${requirement.specialty} review for ${deliverable.kind}`);
      }
    }
  }

  const maturityStates = new Set(generation.map((deliverable) => deliverable.artifactMaturity));
  const releaseIds = sortedIds(generation.map((deliverable) => deliverable._id));
  const version = generation[0].version;

  if (maturityStates.size === 1 && maturityStates.has("manufacturing_released")) {
    const exactAudit = events.some((event) =>
      event.metadata?.changeType === "manufacturing_release" &&
      event.metadata?.cadVersion === version &&
      sameStringSet(event.metadata?.deliverableIds, releaseIds)
    );
    if (!exactAudit) {
      throw new ConvexError("Released CAD generation is missing exact manufacturing-release audit evidence");
    }
    return {
      success: true,
      idempotent: true,
      version,
      deliverableIds: generation.map((deliverable) => deliverable._id),
    };
  }

  if (generation.some((deliverable) => deliverable.artifactMaturity === "manufacturing_released")) {
    throw new ConvexError("Native CAD generation has inconsistent manufacturing-release state");
  }
  if (generation.some((deliverable) => deliverable.artifactMaturity !== "engineering_reviewed")) {
    throw new ConvexError("Every native CAD artifact must be engineering reviewed before manufacturing release");
  }

  const now = Date.now();
  for (const deliverable of generation) {
    await ctx.db.patch(deliverable._id, {
      artifactMaturity: "manufacturing_released",
      updatedAt: now,
    });
  }
  await ctx.db.insert("atlasExecutionEvents", {
    inventionId: anchor.inventionId,
    eventType: "invention_changed",
    actorType: "inventor",
    summary: `Released exact native CAD generation ${version} for manufacturing planning; no supplier contact, disclosure, purchase, payment, production order, filing, or publication was performed.`,
    metadata: {
      changeType: "manufacturing_release",
      cadVersion: version,
      deliverableIds: releaseIds,
      externalActionExecuted: false,
      releasedByUserId: String(userId),
    },
    createdAt: now,
  });

  return {
    success: true,
    idempotent: false,
    version,
    deliverableIds: generation.map((deliverable) => deliverable._id),
  };
}

export const releaseCadGenerationForManufacturing = mutation({
  args: { deliverableId: v.id("atlasDeliverables") },
  handler: releaseCadGenerationForManufacturingHandler,
});
