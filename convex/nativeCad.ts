import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { canTierRunWorkKind } from "./entitlementPolicyLogic";

const generateNativeCad = makeFunctionReference<"action", { inventionId: Id<"inventions">; workItemId: Id<"atlasWorkItems"> }, unknown>("nativeCadGeneration:generateNativeCad");

async function requireOwnedInvention(ctx: Parameters<typeof getAuthUserId>[0] & { db: any }, inventionId: Id<"inventions">) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Authentication required");
  const invention = await ctx.db.get(inventionId);
  if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found or access denied");
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("Inventor profile not found");
  return { userId, invention, user };
}

export const requestNativeCadGeneration = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    const { user } = await requireOwnedInvention(ctx, args.inventionId);
    if (!canTierRunWorkKind(user.subscriptionTier, "cad_model_specification")) {
      throw new ConvexError("Native CAD generation requires a Pro or Enterprise entitlement");
    }

    const designSpecs = await ctx.db
      .query("atlasDeliverables")
      .withIndex("by_inventionId_kind", (q: any) => q.eq("inventionId", args.inventionId).eq("kind", "product_design_specification"))
      .collect();
    const currentDesign = designSpecs.filter((item: any) => !item.staleReason).sort((a: any, b: any) => b.version - a.version)[0];
    if (!currentDesign) {
      throw new ConvexError("Complete the Product Design Specification before generating native CAD");
    }

    const existing = await ctx.db
      .query("atlasWorkItems")
      .withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId))
      .collect();
    const current = existing.find((item: any) => item.kind === "native_cad_generation");
    if (current?.status === "running") return { scheduled: false, reason: "already_running" as const, workItemId: current._id };

    const now = Date.now();
    let workItemId: Id<"atlasWorkItems">;
    if (current) {
      workItemId = current._id;
      await ctx.db.patch(current._id, {
        status: "running",
        attemptCount: current.attemptCount + 1,
        inputSnapshot: { productDesignDeliverableId: String(currentDesign._id), productDesignVersion: currentDesign.version },
        startedAt: now,
        claimedAt: now,
        completedAt: undefined,
        blockedReason: undefined,
        humanGateType: undefined,
        lastError: undefined,
        outputSummary: undefined,
        updatedAt: now,
      });
    } else {
      workItemId = await ctx.db.insert("atlasWorkItems", {
        inventionId: args.inventionId,
        kind: "native_cad_generation",
        title: "Generate native STEP, STL, DXF and editable CAD source",
        status: "running",
        priority: 63,
        inputSnapshot: { productDesignDeliverableId: String(currentDesign._id), productDesignVersion: currentDesign.version },
        attemptCount: 1,
        maxAttempts: 3,
        estimatedCostUnits: 18,
        deliverableKind: "native_cad_package",
        dependsOnKinds: ["product_design_specification", "cad_model_specification"],
        startedAt: now,
        claimedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      workItemId,
      eventType: "work_claimed",
      actorType: "inventor",
      summary: "Inventor authorized generation of the next preliminary native CAD package.",
      metadata: { maturity: "preliminary_cad", productDesignVersion: currentDesign.version },
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, generateNativeCad, { inventionId: args.inventionId, workItemId });
    return { scheduled: true, reason: "scheduled" as const, workItemId };
  },
});

export const getNativeCadContext = internalQuery({
  args: { inventionId: v.id("inventions"), workItemId: v.id("atlasWorkItems") },
  handler: async (ctx, args) => {
    const invention = await ctx.db.get(args.inventionId);
    const workItem = await ctx.db.get(args.workItemId);
    if (!invention || !workItem || workItem.inventionId !== args.inventionId || workItem.kind !== "native_cad_generation") {
      throw new ConvexError("Native CAD work context not found");
    }
    const [record, deliverables, findings] = await Promise.all([
      ctx.db.query("inventionRecords").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).unique(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect(),
    ]);
    const relevantKinds = new Set([
      "product_design_specification",
      "cad_model_specification",
      "design_candidate_scorecard",
      "product_design_candidates",
      "initial_product_requirements",
      "materials_manufacturing_assessment",
      "preliminary_bom_cost_range",
      "feature_prior_art_comparison",
    ]);
    return {
      invention,
      workItem,
      structuredBrief: record?.structuredBrief ?? null,
      deliverables: deliverables
        .filter((item: any) => relevantKinds.has(item.kind) && !item.staleReason)
        .sort((a: any, b: any) => b.updatedAt - a.updatedAt)
        .map((item: any) => ({ id: String(item._id), kind: item.kind, title: item.title, version: item.version, content: item.content, sourceIds: item.sourceIds.map(String), assumptions: item.assumptions, limitations: item.limitations })),
      findings: findings.filter((item: any) => item.status !== "stale").slice(0, 60).map((item: any) => ({ statement: item.statement, kind: item.kind, confidence: item.confidence, limitations: item.limitations })),
    };
  },
});

const cadArtifactValidator = v.object({
  kind: v.string(),
  title: v.string(),
  storageId: v.id("_storage"),
  mediaType: v.string(),
});

export const recordNativeCadSuccess = internalMutation({
  args: {
    inventionId: v.id("inventions"),
    workItemId: v.id("atlasWorkItems"),
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
    if (!workItem || workItem.inventionId !== args.inventionId || workItem.status !== "running") throw new ConvexError("Native CAD work is not running");
    const currentInvention = await ctx.db.get(args.inventionId);
    if (!currentInvention) throw new ConvexError("Invention not found");
    if (workItem.claimedAt && currentInvention.updatedAt > workItem.claimedAt) {
      for (const artifact of args.artifacts) await ctx.storage.delete(artifact.storageId);
      await ctx.db.patch(workItem._id, { status: "queued", lastError: "Invention inputs changed while CAD was generating; generated artifacts were discarded.", updatedAt: args.completedAt });
      return { discarded: true };
    }

    const contextDeliverables = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect();
    const sourceIds = [...new Map(contextDeliverables.flatMap((item: any) => item.sourceIds).map((id: any) => [String(id), id])).values()];
    const limitations = [
      ...args.unresolvedEngineering,
      "Generated geometry is Preliminary CAD produced from an AI-authored constrained parametric specification and deterministic geometry kernel.",
      "Manufacturing Released maturity requires the applicable qualified engineering review, dimensional/tolerance review, and physical prototype validation.",
    ];

    for (const artifact of args.artifacts) {
      const priorVersions = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId_kind", (q: any) => q.eq("inventionId", args.inventionId).eq("kind", artifact.kind)).collect();
      const version = priorVersions.reduce((highest: number, item: any) => Math.max(highest, item.version), 0) + 1;
      const deliverableId = await ctx.db.insert("atlasDeliverables", {
        inventionId: args.inventionId,
        workItemId: args.workItemId,
        kind: artifact.kind,
        title: artifact.title,
        version,
        trustState: "professional_review_required",
        content: artifact.kind === "native_cad_source" ? args.sourceSpec : { triangleCount: args.triangleCount, partCount: args.partCount },
        storageId: artifact.storageId,
        mediaType: artifact.mediaType,
        artifactMaturity: "preliminary_cad",
        sourceIds,
        assumptions: args.assumptions,
        limitations,
        missingInformation: args.unresolvedEngineering,
        createdAt: args.completedAt,
        updatedAt: args.completedAt,
      });
      await ctx.db.insert("professionalReviews", {
        inventionId: args.inventionId,
        deliverableId,
        specialty: "engineering",
        requiredCredentials: "Qualified engineer or product-design professional appropriate to the product and manufacturing process",
        scope: "Review geometry, dimensions, interfaces, material/process assumptions, tolerances, safety considerations, manufacturability, and prototype-test requirements before production release.",
        status: "required",
        createdAt: args.completedAt,
        updatedAt: args.completedAt,
      });
    }

    await ctx.db.patch(args.workItemId, {
      status: "completed",
      outputSummary: `Generated a ${args.partCount}-part preliminary native CAD package with STEP, STL, DXF, and editable source geometry.`,
      actualCostUnits: args.actualCostUnits,
      completedAt: args.completedAt,
      leaseExpiresAt: undefined,
      updatedAt: args.completedAt,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      workItemId: args.workItemId,
      eventType: "work_completed",
      actorType: "atlas",
      summary: `InventSmith generated native preliminary CAD: ${args.partCount} parts, ${args.triangleCount} mesh facets, STEP/STL/DXF/source artifacts.`,
      costUnits: args.actualCostUnits,
      metadata: { artifactKinds: args.artifacts.map((item) => item.kind), maturity: "preliminary_cad" },
      createdAt: args.completedAt,
    });
    return { discarded: false };
  },
});

export const recordNativeCadFailure = internalMutation({
  args: { inventionId: v.id("inventions"), workItemId: v.id("atlasWorkItems"), error: v.string(), failedAt: v.number() },
  handler: async (ctx, args) => {
    const workItem = await ctx.db.get(args.workItemId);
    if (!workItem || workItem.inventionId !== args.inventionId) return;
    const willRetry = workItem.attemptCount < (workItem.maxAttempts ?? 3);
    await ctx.db.patch(workItem._id, {
      status: willRetry ? "queued" : "failed",
      lastError: args.error.slice(0, 2000),
      startedAt: undefined,
      claimedAt: undefined,
      updatedAt: args.failedAt,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      workItemId: args.workItemId,
      eventType: "work_failed",
      actorType: "system",
      summary: willRetry ? "Native CAD generation failed and may be retried." : "Native CAD generation exhausted its retry limit.",
      metadata: { error: args.error.slice(0, 1000), willRetry },
      createdAt: args.failedAt,
    });
  },
});

export const getNativeCadArtifacts = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireOwnedInvention(ctx, args.inventionId);
    const deliverables = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q: any) => q.eq("inventionId", args.inventionId)).collect();
    const cadKinds = new Set(["native_cad_step", "native_cad_stl", "native_cad_dxf", "native_cad_source"]);
    return await Promise.all(deliverables.filter((item: any) => cadKinds.has(item.kind)).sort((a: any, b: any) => b.updatedAt - a.updatedAt).map(async (item: any) => ({
      _id: item._id,
      kind: item.kind,
      title: item.title,
      version: item.version,
      trustState: item.trustState,
      artifactMaturity: item.artifactMaturity,
      staleReason: item.staleReason,
      mediaType: item.mediaType,
      downloadUrl: item.storageId ? await ctx.storage.getUrl(item.storageId) : null,
      updatedAt: item.updatedAt,
    })));
  },
});
