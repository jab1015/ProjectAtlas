import { ConvexError, v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireInventionManageAccess } from "./organizations";
import { requiredProfessionalReviews } from "./professionalReviewPolicy";

export type ExternalUseAuthorizationResult = {
  success: true;
  idempotent: boolean;
  deliverableId: Id<"atlasDeliverables">;
  version: number;
};

/**
 * Explicitly authorizes one exact, current deliverable revision for external use.
 *
 * This is intentionally separate from professional review. Professional review may
 * establish qualified trust for an artifact, but it never grants permission to
 * disclose, publish, file, manufacture, order, or otherwise use the artifact
 * outside InventSmith. Only an authorized invention manager can perform this
 * transition.
 */
export async function authorizeDeliverableExternalUseHandler(
  ctx: MutationCtx,
  args: { deliverableId: Id<"atlasDeliverables"> }
): Promise<ExternalUseAuthorizationResult> {
  const deliverable = await ctx.db.get(args.deliverableId);
  if (!deliverable) throw new ConvexError("Deliverable not found");

  const { userId } = await requireInventionManageAccess(ctx, deliverable.inventionId);

  const sameKind = await ctx.db
    .query("atlasDeliverables")
    .withIndex("by_inventionId_kind", (q) =>
      q.eq("inventionId", deliverable.inventionId).eq("kind", deliverable.kind)
    )
    .collect();
  const latestVersion = sameKind.reduce(
    (highest, item) => Math.max(highest, item.version),
    deliverable.version
  );

  if (deliverable.version !== latestVersion) {
    throw new ConvexError("Only the latest deliverable revision can be authorized for external use");
  }
  if (deliverable.staleReason) {
    throw new ConvexError("Stale deliverables must be refreshed before external-use authorization");
  }

  const professionalReviewRequired = requiredProfessionalReviews(deliverable.kind).length > 0;
  if (professionalReviewRequired && deliverable.trustState !== "professionally_reviewed" && deliverable.trustState !== "ready_for_authorized_use") {
    throw new ConvexError("Required professional review must be completed before external-use authorization");
  }

  if (deliverable.trustState === "ready_for_authorized_use") {
    return {
      success: true,
      idempotent: true,
      deliverableId: deliverable._id,
      version: deliverable.version,
    };
  }

  const now = Date.now();
  await ctx.db.patch(deliverable._id, {
    trustState: "ready_for_authorized_use",
    updatedAt: now,
  });
  await ctx.db.insert("atlasExecutionEvents", {
    inventionId: deliverable.inventionId,
    eventType: "invention_changed",
    actorType: "inventor",
    summary: `Authorized exact ${deliverable.kind} revision ${deliverable.version} for external use.`,
    metadata: {
      changeType: "external_use_authorization",
      deliverableId: String(deliverable._id),
      deliverableKind: deliverable.kind,
      deliverableVersion: deliverable.version,
      authorizedByUserId: String(userId),
    },
    createdAt: now,
  });

  return {
    success: true,
    idempotent: false,
    deliverableId: deliverable._id,
    version: deliverable.version,
  };
}

export const authorizeDeliverableExternalUse = mutation({
  args: { deliverableId: v.id("atlasDeliverables") },
  handler: authorizeDeliverableExternalUseHandler,
});
