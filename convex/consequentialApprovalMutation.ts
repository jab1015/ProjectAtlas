import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation, type MutationCtx } from "./_generated/server";
import { requireInventionManageAccess } from "./organizations";
import { canResolveApproval } from "./reviewLogic";

export type ApprovalActionType =
  | "share_confidential_information"
  | "contact_third_party"
  | "publish_or_disclose"
  | "purchase_or_fee"
  | "submit_or_file"
  | "external_use"
  | "other";

const ARTIFACT_BOUND_EXTERNAL_ACTIONS = new Set<ApprovalActionType>([
  "share_confidential_information",
  "contact_third_party",
  "publish_or_disclose",
  "submit_or_file",
  "external_use",
]);

export function approvalActionRequiresAuthorizedArtifacts(actionType: ApprovalActionType) {
  return ARTIFACT_BOUND_EXTERNAL_ACTIONS.has(actionType);
}

async function validateExactAuthorizedArtifacts(
  ctx: MutationCtx,
  inventionId: Id<"inventions">,
  actionType: ApprovalActionType,
  deliverableIds?: Id<"atlasDeliverables">[],
) {
  const ids = deliverableIds ?? [];
  if (approvalActionRequiresAuthorizedArtifacts(actionType) && ids.length === 0) {
    throw new ConvexError(`The ${actionType} action must be bound to at least one exact authorized artifact revision`);
  }

  const uniqueIds = [...new Set(ids.map(String))];
  if (uniqueIds.length !== ids.length) {
    throw new ConvexError("Approval artifact scope contains duplicate deliverable revisions");
  }

  for (const deliverableId of ids) {
    const deliverable = await ctx.db.get(deliverableId);
    if (!deliverable || deliverable.inventionId !== inventionId) {
      throw new ConvexError("Approval artifact does not belong to this invention");
    }
    if (deliverable.staleReason) {
      throw new ConvexError(`Artifact ${deliverable.kind} version ${deliverable.version} is stale and cannot authorize external action`);
    }
    if (deliverable.trustState !== "ready_for_authorized_use") {
      throw new ConvexError(`Artifact ${deliverable.kind} version ${deliverable.version} is not authorized for external use`);
    }

    const sameKind = await ctx.db
      .query("atlasDeliverables")
      .withIndex("by_inventionId_kind", (q) =>
        q.eq("inventionId", inventionId).eq("kind", deliverable.kind)
      )
      .collect();
    const highestVersion = sameKind.reduce(
      (highest, candidate) => Math.max(highest, candidate.version),
      Number.NEGATIVE_INFINITY,
    );
    const latestIds = sameKind
      .filter((candidate) => candidate.version === highestVersion)
      .map((candidate) => String(candidate._id));

    if (
      deliverable.version !== highestVersion ||
      latestIds.length !== 1 ||
      latestIds[0] !== String(deliverable._id)
    ) {
      throw new ConvexError(`Artifact ${deliverable.kind} is not the one unambiguous latest revision`);
    }
  }

  return ids;
}

async function loadApprovalArtifactScope(
  ctx: MutationCtx,
  inventionId: Id<"inventions">,
  approvalRequestId: Id<"approvalRequests">,
  actionType: ApprovalActionType,
) {
  const events = await ctx.db
    .query("atlasExecutionEvents")
    .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
    .collect();
  const matches = events.filter((event) =>
    event.metadata?.changeType === "approval_artifact_scope" &&
    event.metadata?.approvalRequestId === String(approvalRequestId)
  );

  if (matches.length > 1) {
    throw new ConvexError("Approval has an ambiguous artifact authorization scope");
  }
  if (matches.length === 0) {
    if (approvalActionRequiresAuthorizedArtifacts(actionType)) {
      throw new ConvexError("Approval is missing its exact authorized artifact scope");
    }
    return [] as Id<"atlasDeliverables">[];
  }

  const metadata = matches[0].metadata;
  if (metadata?.actionType !== actionType || !Array.isArray(metadata?.deliverableIds)) {
    throw new ConvexError("Approval artifact authorization scope is malformed");
  }
  return metadata.deliverableIds.map((id: unknown) => String(id) as Id<"atlasDeliverables">);
}

export type RequestApprovalArgs = {
  inventionId: Id<"inventions">;
  decisionId?: Id<"inventionDecisions">;
  deliverableIds?: Id<"atlasDeliverables">[];
  actionType: ApprovalActionType;
  summary: string;
  consequences: string[];
};

/**
 * Internal creation path for consequential approvals. External disclosure/contact/
 * filing/use requests are revision-bound before they can even enter the queue. The
 * immutable binding is stored as a separate audit event so legacy approval rows stay
 * schema-compatible while external-action executors can fail closed on missing scope.
 */
export async function requestApprovalHandler(ctx: MutationCtx, args: RequestApprovalArgs) {
  const invention = await ctx.db.get(args.inventionId);
  if (!invention) throw new ConvexError("Invention not found");

  if (args.decisionId) {
    const decision = await ctx.db.get(args.decisionId);
    if (!decision || decision.inventionId !== args.inventionId) {
      throw new ConvexError("Approval decision does not belong to this invention");
    }
  }

  const deliverableIds = await validateExactAuthorizedArtifacts(
    ctx,
    args.inventionId,
    args.actionType,
    args.deliverableIds,
  );

  const requestedAt = Date.now();
  const approvalRequestId = await ctx.db.insert("approvalRequests", {
    inventionId: args.inventionId,
    decisionId: args.decisionId,
    actionType: args.actionType,
    summary: args.summary,
    consequences: args.consequences,
    status: "pending",
    requestedAt,
  });

  if (deliverableIds.length > 0) {
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      eventType: "invention_changed",
      actorType: "system",
      summary: "Bound consequential approval to exact authorized artifact revisions.",
      metadata: {
        changeType: "approval_artifact_scope",
        approvalRequestId: String(approvalRequestId),
        actionType: args.actionType,
        deliverableIds: deliverableIds.map(String),
      },
      createdAt: requestedAt,
    });
  }

  return approvalRequestId;
}

export async function resolveApprovalRequestHandler(
  ctx: MutationCtx,
  args: { approvalRequestId: Id<"approvalRequests">; approved: boolean },
) {
  const request = await ctx.db.get(args.approvalRequestId);
  if (!request) throw new ConvexError("Approval request not found");

  const { userId } = await requireInventionManageAccess(ctx, request.inventionId);
  if (!canResolveApproval(request.status)) {
    throw new ConvexError("Approval request is not pending");
  }

  const scopedDeliverableIds = await loadApprovalArtifactScope(
    ctx,
    request.inventionId,
    args.approvalRequestId,
    request.actionType,
  );

  // Denial is always allowed for an authorized manager. Approval is fail-closed:
  // re-check the exact artifact scope at decision time because evidence/revisions may
  // have changed since the request was created.
  if (args.approved) {
    await validateExactAuthorizedArtifacts(
      ctx,
      request.inventionId,
      request.actionType,
      scopedDeliverableIds,
    );
  }

  const now = Date.now();
  await ctx.db.patch(args.approvalRequestId, {
    status: args.approved ? "approved" : "denied",
    resolvedAt: now,
    resolvedByUserId: userId,
  });
  await ctx.db.insert("atlasExecutionEvents", {
    inventionId: request.inventionId,
    eventType: "approval_resolved",
    actorType: "inventor",
    summary: args.approved
      ? "Authorized invention manager approved the requested action."
      : "Authorized invention manager denied the requested action.",
    metadata: {
      approvalRequestId: String(args.approvalRequestId),
      actionType: request.actionType,
      deliverableIds: scopedDeliverableIds.map(String),
      approved: args.approved,
      resolvedByUserId: String(userId),
    },
    createdAt: now,
  });

  return { success: true };
}

/**
 * Guard for any future executor that actually contacts a supplier, discloses a
 * confidential artifact, publishes, files, or otherwise acts externally. Approval
 * alone is insufficient: the bound artifacts must still be current and authorized
 * at the moment of execution.
 */
export async function requireCurrentApprovedExternalAction(
  ctx: MutationCtx,
  approvalRequestId: Id<"approvalRequests">,
  expectedActionType?: ApprovalActionType,
) {
  const request = await ctx.db.get(approvalRequestId);
  if (!request || request.status !== "approved") {
    throw new ConvexError("A current approved external-action request is required");
  }
  if (expectedActionType && request.actionType !== expectedActionType) {
    throw new ConvexError("Approved action type does not match the requested external operation");
  }

  const scopedDeliverableIds = await loadApprovalArtifactScope(
    ctx,
    request.inventionId,
    approvalRequestId,
    request.actionType,
  );
  await validateExactAuthorizedArtifacts(
    ctx,
    request.inventionId,
    request.actionType,
    scopedDeliverableIds,
  );
  return request;
}

export const requestConsequentialApproval = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    decisionId: v.optional(v.id("inventionDecisions")),
    deliverableIds: v.optional(v.array(v.id("atlasDeliverables"))),
    actionType: v.union(
      v.literal("share_confidential_information"),
      v.literal("contact_third_party"),
      v.literal("publish_or_disclose"),
      v.literal("purchase_or_fee"),
      v.literal("submit_or_file"),
      v.literal("external_use"),
      v.literal("other"),
    ),
    summary: v.string(),
    consequences: v.array(v.string()),
  },
  handler: requestApprovalHandler,
});

export const resolveConsequentialApproval = mutation({
  args: {
    approvalRequestId: v.id("approvalRequests"),
    approved: v.boolean(),
  },
  handler: resolveApprovalRequestHandler,
});
