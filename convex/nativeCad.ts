import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { canTierRunWorkKind } from "./entitlementPolicyLogic";
import { requireInventionEditAccess, requireInventionReadAccess } from "./organizations";
import { ensureOrganizationDailyUsage } from "./organizationDailyUsage";
import { resolveInventionUsageScope } from "./organizationUsageScope";

const runAvailableWork = makeFunctionReference<"action", { inventionId: Id<"inventions">; costBudgetUnits?: number }, unknown>("atlasWorkOrchestration:runAvailableWork");

function dateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

async function settleCadUsage(ctx: any, workItem: any, inventionId: Id<"inventions">, actualCostUnits: number, completedWorkItems: number, now: number) {
  const usageScope = await resolveInventionUsageScope(ctx, inventionId);
  if (!usageScope) throw new ConvexError("Invention not found while settling CAD usage");
  const key = workItem.reservationDateKey ?? dateKey(now);

  if (usageScope.scope === "organization" && usageScope.organizationId) {
    const usage = await ensureOrganizationDailyUsage(ctx, usageScope.organizationId, key, now);
    await ctx.db.patch(usage._id, {
      autonomousCostUnits: usage.autonomousCostUnits + actualCostUnits,
      reservedAutonomousCostUnits: Math.max(0, (usage.reservedAutonomousCostUnits ?? 0) - (workItem.reservedCostUnits ?? 0)),
      completedWorkItems: usage.completedWorkItems + completedWorkItems,
      updatedAt: now,
    });
    return;
  }

  const usage = await ctx.db.query("atlasDailyUsage").withIndex("by_userId_dateKey", (q: any) => q.eq("userId", usageScope.usageUserId).eq("dateKey", key)).unique();
  if (usage) {
    await ctx.db.patch(usage._id, {
      autonomousCostUnits: usage.autonomousCostUnits + actualCostUnits,
      reservedAutonomousCostUnits: Math.max(0, (usage.reservedAutonomousCostUnits ?? 0) - (workItem.reservedCostUnits ?? 0)),
      completedWorkItems: usage.completedWorkItems + completedWorkItems,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("atlasDailyUsage", { userId: usageScope.usageUserId, dateKey: key, autonomousCostUnits: actualCostUnits, reservedAutonomousCostUnits: 0, completedWorkItems, chatQuestions: 0, updatedAt: now });
  }
}

async function cadAttemptAlreadySettled(ctx: any, workItemId: Id<"atlasWorkItems">, attemptNumber: number) {
  const events = await ctx.db.query("atlasExecutionEvents").withIndex("by_workItemId", (q: any) => q.eq("workItemId", workItemId)).collect();
  return events.some((event: any) =>
    event.attemptNumber === attemptNumber &&
    (event.eventType === "work_completed" || event.eventType === "work_failed" || event.eventType === "work_blocked")
  );
}

async function settleLateCadAttemptCostOnce(
  ctx: any,
  workItem: any,
  attemptNumber: number,
  actualCostUnits: number,
  usageKnown: boolean,
  now: number,
  summary: string
) {
  if (await cadAttemptAlreadySettled(ctx, workItem._id, attemptNumber)) return;
  if (actualCostUnits > 0) {
    await settleCadUsage(ctx, { reservationDateKey: workItem.reservationDateKey, reservedCostUnits: undefined }, workItem.inventionId, actualCostUnits, 0, now);
  }
  await ctx.db.insert("atlasExecutionEvents", {
    inventionId: workItem.inventionId,
    workItemId: workItem._id,
    eventType: "work_failed",
    actorType: "system",
    summary,
    attemptNumber,
    costUnits: usageKnown ? actualCostUnits : undefined,
    metadata: { staleAttempt: true, usageKnown },
    createdAt: now,
  });
}

export const requestNativeCadGeneration = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionEditAccess(ctx, args.inventionId);
    const usageScope = await resolveInventionUsageScope(ctx, args.inventionId);
    if (!usageScope) throw new ConvexError("Invention not found");
    if (!canTierRunWorkKind(usageScope.plan, "cad_model_specification")) throw new ConvexError("Native CAD generation requires a Pro or higher entitlement");

    const designSpecs = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId_kind", (q: any) => q.eq("inventionId", args.inventionId).eq("kind", "product_design_specification")).collect();
    const currentDesign = designSpecs.filter((item: any) => !item.staleReason).sort((a: any, b: any) => b.version - a.version)[0];
    if (!currentDesign) throw new ConvexError("Complete the Product Design Specification before generating native CAD");

    const existing = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect();
    let current: (typeof existing)[number] | null | undefined = existing.find((item: any) => item.kind === "native_cad_generation");
    const now = Date.now();
    if (!current) {
      const workItemId = await ctx.db.insert("atlasWorkItems", {
        inventionId: args.inventionId,
        kind: "native_cad_generation",
        title: "Generate native STEP, STL, DXF and editable CAD source",
        status: "queued",
        priority: 63,
        inputSnapshot: { department: "product_design", executionMode: "native_cad", productDesignDeliverableId: String(currentDesign._id), productDesignVersion: currentDesign.version },
        attemptCount: 0,
        maxAttempts: 3,
        estimatedCostUnits: 18,
        deliverableKind: "native_cad_package",
        dependsOnKinds: ["product_design_specification", "cad_model_specification", "manufacturing_drawing_specification"],
        createdAt: now,
        updatedAt: now,
      });
      current = await ctx.db.get(workItemId);
    } else if (current.status !== "running") {
      await ctx.db.patch(current._id, {
        status: "queued",
        inputSnapshot: { ...(current.inputSnapshot && typeof current.inputSnapshot === "object" ? current.inputSnapshot : {}), department: "product_design", executionMode: "native_cad", productDesignDeliverableId: String(currentDesign._id), productDesignVersion: currentDesign.version },
        completedAt: undefined,
        lastError: undefined,
        updatedAt: now,
      });
    }

    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      workItemId: current?._id,
      eventType: "work_queued",
      actorType: "inventor",
      summary: "An authorized collaborator requested an additional preliminary CAD generation pass; InventSmith routed it through the guarded organization work budget.",
      metadata: { maturity: "preliminary_cad", productDesignVersion: currentDesign.version, usageScope: usageScope.scope, usageUserId: String(usageScope.usageUserId) },
      createdAt: now,
    });
    await ctx.scheduler.runAfter(0, runAvailableWork, { inventionId: args.inventionId });
    return { scheduled: true, reason: "queued_through_autonomy" as const, workItemId: current?._id ?? null };
  },
});

export const getNativeCadContext = internalQuery({
  args: { inventionId: v.id("inventions"), workItemId: v.id("atlasWorkItems"), attemptNumber: v.number(), now: v.number() },
  handler: async (ctx, args) => {
    const invention = await ctx.db.get(args.inventionId);
    const workItem = await ctx.db.get(args.workItemId);
    if (!invention || !workItem || workItem.inventionId !== args.inventionId || workItem.kind !== "native_cad_generation") throw new ConvexError("Native CAD work context not found");
    if (workItem.status !== "running" || workItem.attemptCount !== args.attemptNumber) throw new ConvexError("Native CAD work attempt is no longer current");
    if (workItem.leaseExpiresAt && workItem.leaseExpiresAt <= args.now) throw new ConvexError("Native CAD work attempt lease expired before provider execution");
    const [record, deliverables, findings] = await Promise.all([
      ctx.db.query("inventionRecords").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).unique(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
    ]);
    const relevantKinds = new Set(["product_design_specification", "cad_model_specification", "manufacturing_drawing_specification", "exploded_view_specification", "design_candidate_scorecard", "product_design_candidates", "initial_product_requirements", "materials_manufacturing_assessment", "preliminary_bom_cost_range", "feature_prior_art_comparison", "distinguishing_features_alternative_embodiments", "patent_design_handoff"]);
    return {
      invention,
      workItem,
      structuredBrief: record?.structuredBrief ?? null,
      deliverables: deliverables.filter((item: any) => relevantKinds.has(item.kind) && !item.staleReason).sort((a: any, b: any) => b.updatedAt - a.updatedAt).map((item: any) => ({ id: String(item._id), kind: item.kind, title: item.title, version: item.version, content: item.content, sourceIds: item.sourceIds.map(String), assumptions: item.assumptions, limitations: item.limitations })),
      findings: findings.filter((item: any) => item.status !== "stale").slice(0, 80).map((item: any) => ({ statement: item.statement, kind: item.kind, confidence: item.confidence, limitations: item.limitations })),
    };
  },
});

const cadArtifactValidator = v.object({ kind: v.string(), title: v.string(), storageId: v.id("_storage"), mediaType: v.string() });

export const recordNativeCadSuccess = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    workItemId: v.id("atlasWorkItems"),
    attemptNumber: v.number(),
    artifacts: v.array(cadArtifactValidator),
    sourceSpec: v.any(),
    triangleCount: v.number(),
    partCount: v.number(),
    assumptions: v.array(v.string()),
    unresolvedEngineering: v.array(v.string()),
    actualCostUnits: v.number(),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const workItem = await ctx.db.get(args.workItemId);
    if (!workItem || workItem.inventionId !== args.inventionId) throw new ConvexError("Native CAD work item not found");

    const attemptIsCurrent = workItem.status === "running" && workItem.attemptCount === args.attemptNumber;
    const leaseIsCurrent = !workItem.leaseExpiresAt || workItem.leaseExpiresAt > args.completedAt;
    if (!attemptIsCurrent || !leaseIsCurrent) {
      for (const artifact of args.artifacts) await ctx.storage.delete(artifact.storageId);
      await settleLateCadAttemptCostOnce(
        ctx,
        workItem,
        args.attemptNumber,
        args.actualCostUnits,
        true,
        args.completedAt,
        "A late native CAD result was discarded because its work attempt no longer owns the item."
      );
      return { discarded: true, actualCostUnits: args.actualCostUnits };
    }

    const currentInvention = await ctx.db.get(args.inventionId);
    if (!currentInvention) throw new ConvexError("Invention not found");

    if (workItem.claimedAt && currentInvention.updatedAt > workItem.claimedAt) {
      for (const artifact of args.artifacts) await ctx.storage.delete(artifact.storageId);
      await settleCadUsage(ctx, workItem, args.inventionId, args.actualCostUnits, 0, args.completedAt);
      await ctx.db.patch(workItem._id, { status: "queued", reservedCostUnits: undefined, reservationDateKey: undefined, claimedAt: undefined, startedAt: undefined, leaseExpiresAt: undefined, lastError: "Invention inputs changed while CAD was generating; generated artifacts were discarded.", updatedAt: args.completedAt });
      await ctx.db.insert("atlasExecutionEvents", { inventionId: args.inventionId, workItemId: args.workItemId, eventType: "work_failed", actorType: "system", summary: "InventSmith discarded native CAD because the invention changed during generation.", attemptNumber: args.attemptNumber, costUnits: args.actualCostUnits, metadata: { staleInputDiscarded: true, retryScheduled: true, usageKnown: true }, createdAt: args.completedAt });
      return { discarded: true, actualCostUnits: args.actualCostUnits };
    }

    const contextDeliverables = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect();
    const sourceIds = [...new Map(contextDeliverables.flatMap((item: any) => item.sourceIds).map((id: any) => [String(id), id])).values()];
    const limitations = [...args.unresolvedEngineering, "Generated geometry is Preliminary CAD produced from an AI-authored constrained parametric specification and deterministic geometry kernel.", "Manufacturing Released maturity requires the applicable qualified engineering review, dimensional/tolerance review, and physical prototype validation."];

    for (const artifact of args.artifacts) {
      const priorVersions = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId_kind", (q: any) => q.eq("inventionId", args.inventionId).eq("kind", artifact.kind)).collect();
      const version = priorVersions.reduce((highest: number, item: any) => Math.max(highest, item.version), 0) + 1;
      const deliverableId = await ctx.db.insert("atlasDeliverables", {
        inventionId: args.inventionId, workItemId: args.workItemId, kind: artifact.kind, title: artifact.title, version, trustState: "professional_review_required", content: artifact.kind === "native_cad_source" ? args.sourceSpec : { triangleCount: args.triangleCount, partCount: args.partCount }, storageId: artifact.storageId, mediaType: artifact.mediaType, artifactMaturity: "preliminary_cad", sourceIds, assumptions: args.assumptions, limitations, missingInformation: args.unresolvedEngineering, createdAt: args.completedAt, updatedAt: args.completedAt,
      });
      await ctx.db.insert("professionalReviews", {
        inventionId: args.inventionId, deliverableId, specialty: "engineering", requiredCredentials: "Qualified engineer or product-design professional appropriate to the product and manufacturing process", scope: "Review geometry, dimensions, interfaces, material/process assumptions, tolerances, safety considerations, manufacturability, and prototype-test requirements before production release.", status: "required", createdAt: args.completedAt, updatedAt: args.completedAt,
      });
    }

    await settleCadUsage(ctx, workItem, args.inventionId, args.actualCostUnits, 1, args.completedAt);
    await ctx.db.patch(args.workItemId, { status: "completed", outputSummary: `Generated a ${args.partCount}-part preliminary native CAD package with STEP, STL, DXF, editable source, orthographic views, and exploded view.`, actualCostUnits: args.actualCostUnits, completedAt: args.completedAt, claimedAt: undefined, startedAt: undefined, leaseExpiresAt: undefined, reservedCostUnits: undefined, reservationDateKey: undefined, updatedAt: args.completedAt });
    const usageScope = await resolveInventionUsageScope(ctx, args.inventionId);
    await ctx.db.insert("atlasExecutionEvents", { inventionId: args.inventionId, workItemId: args.workItemId, eventType: "work_completed", actorType: "atlas", summary: `InventSmith generated native preliminary CAD: ${args.partCount} parts, ${args.triangleCount} mesh facets, STEP/STL/DXF/source plus orthographic and exploded-view artifacts.`, attemptNumber: args.attemptNumber, costUnits: args.actualCostUnits, metadata: { artifactKinds: args.artifacts.map((item) => item.kind), maturity: "preliminary_cad", usageKnown: true, usageScope: usageScope?.scope, usageUserId: usageScope ? String(usageScope.usageUserId) : undefined }, createdAt: args.completedAt });
    return { discarded: false, actualCostUnits: args.actualCostUnits };
  },
});

export const recordNativeCadFailure = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    workItemId: v.id("atlasWorkItems"),
    attemptNumber: v.number(),
    error: v.string(),
    actualCostUnits: v.number(),
    usageKnown: v.boolean(),
    failedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const workItem = await ctx.db.get(args.workItemId);
    if (!workItem || workItem.inventionId !== args.inventionId) return { willRetry: false, staleAttempt: true };

    if (workItem.status !== "running" || workItem.attemptCount !== args.attemptNumber) {
      await settleLateCadAttemptCostOnce(
        ctx,
        workItem,
        args.attemptNumber,
        args.actualCostUnits,
        args.usageKnown,
        args.failedAt,
        "A late native CAD failure was ignored because a newer attempt owns the work item."
      );
      return { willRetry: false, staleAttempt: true };
    }

    const willRetry = workItem.attemptCount < (workItem.maxAttempts ?? 3);
    await settleCadUsage(ctx, workItem, args.inventionId, args.actualCostUnits, 0, args.failedAt);
    await ctx.db.patch(workItem._id, { status: willRetry ? "queued" : "failed", reservedCostUnits: undefined, reservationDateKey: undefined, lastError: args.error.slice(0, 2000), startedAt: undefined, claimedAt: undefined, leaseExpiresAt: undefined, updatedAt: args.failedAt });
    await ctx.db.insert("atlasExecutionEvents", { inventionId: args.inventionId, workItemId: args.workItemId, eventType: "work_failed", actorType: "system", summary: willRetry ? "Native CAD generation failed and is eligible for autonomous retry." : "Native CAD generation exhausted its retry limit.", attemptNumber: args.attemptNumber, costUnits: args.usageKnown ? args.actualCostUnits : undefined, metadata: { error: args.error.slice(0, 1000), willRetry, usageKnown: args.usageKnown }, createdAt: args.failedAt });
    return { willRetry, staleAttempt: false };
  },
});

export const getNativeCadArtifacts = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionReadAccess(ctx, args.inventionId);
    const deliverables = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect();
    const cadKinds = new Set(["native_cad_step", "native_cad_stl", "native_cad_dxf", "native_cad_source", "cad_orthographic_views", "cad_exploded_view"]);
    return await Promise.all(deliverables.filter((item: any) => cadKinds.has(item.kind)).sort((a: any, b: any) => b.updatedAt - a.updatedAt).map(async (item: any) => ({ _id: item._id, kind: item.kind, title: item.title, version: item.version, trustState: item.trustState, artifactMaturity: item.artifactMaturity, staleReason: item.staleReason, mediaType: item.mediaType, downloadUrl: item.storageId ? await ctx.storage.getUrl(item.storageId) : null, updatedAt: item.updatedAt })));
  },
});
