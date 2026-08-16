import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { selectNextWorkItem, shouldRetryWork } from "./workOrchestratorLogic";
import { canPromoteDeliverable, EVIDENCE_FRESHNESS_STALE_REASON, isSourceEligibleForPromotion, normalizeFinding, reliabilityFromVerificationStatus } from "./evidenceIntegrityLogic";
import { remainingAutonomousCostUnitsAfterReservations, utcDateKey } from "./usagePolicyLogic";
import { requiredProfessionalReviews } from "./professionalReviewPolicy";
import { canTierRunWorkKind } from "./entitlementPolicyLogic";
import { resolveInventionUsageScope } from "./organizationUsageScope";

async function settleUsageReservation(
  ctx: MutationCtx,
  item: { reservedCostUnits?: number; reservationDateKey?: string },
  inventionId: Id<"inventions">,
  actualCostUnits: number,
  completedWorkItems: number,
  now: number
) {
  const usageScope = await resolveInventionUsageScope(ctx, inventionId);
  if (!usageScope) throw new ConvexError("Invention not found while settling usage");
  const dateKey = item.reservationDateKey ?? utcDateKey(now);
  const usage = await ctx.db
    .query("atlasDailyUsage")
    .withIndex("by_userId_dateKey", (q) => q.eq("userId", usageScope.usageUserId).eq("dateKey", dateKey))
    .unique();
  if (usage) {
    await ctx.db.patch(usage._id, {
      autonomousCostUnits: usage.autonomousCostUnits + actualCostUnits,
      reservedAutonomousCostUnits: Math.max(0, (usage.reservedAutonomousCostUnits ?? 0) - (item.reservedCostUnits ?? 0)),
      completedWorkItems: usage.completedWorkItems + completedWorkItems,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("atlasDailyUsage", {
      userId: usageScope.usageUserId,
      dateKey,
      autonomousCostUnits: actualCostUnits,
      reservedAutonomousCostUnits: 0,
      completedWorkItems,
      chatQuestions: 0,
      updatedAt: now,
    });
  }
}

export const claimNextWork = internalMutation({
  args: { inventionId: v.id("inventions"), availableCostUnits: v.number(), now: v.number() },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect();
    const usageScope = await resolveInventionUsageScope(ctx, args.inventionId);
    if (!usageScope) throw new ConvexError("Invention not found");
    const dateKey = utcDateKey(args.now);
    const usage = await ctx.db
      .query("atlasDailyUsage")
      .withIndex("by_userId_dateKey", (q) => q.eq("userId", usageScope.usageUserId).eq("dateKey", dateKey))
      .unique();
    const serverAvailableUnits = remainingAutonomousCostUnitsAfterReservations(
      usageScope.plan,
      usage?.autonomousCostUnits ?? 0,
      usage?.reservedAutonomousCostUnits ?? 0
    );
    const selection = selectNextWorkItem(
      items.map((item) => ({ ...item, _id: String(item._id) })),
      Math.min(args.availableCostUnits, serverAvailableUnits),
      args.now,
      (kind) => canTierRunWorkKind(usageScope.plan, kind)
    );
    if (!selection.selected) return { workItemId: null, reason: selection.reason };
    const workItemId = selection.selected._id as typeof items[number]["_id"];
    const reservation = selection.selected.reservedCostUnits ?? selection.selected.estimatedCostUnits ?? 0;
    if (!selection.selected.reservedCostUnits && reservation > 0) {
      if (usage) {
        await ctx.db.patch(usage._id, {
          reservedAutonomousCostUnits: (usage.reservedAutonomousCostUnits ?? 0) + reservation,
          updatedAt: args.now,
        });
      } else {
        await ctx.db.insert("atlasDailyUsage", {
          userId: usageScope.usageUserId,
          dateKey,
          autonomousCostUnits: 0,
          reservedAutonomousCostUnits: reservation,
          completedWorkItems: 0,
          chatQuestions: 0,
          updatedAt: args.now,
        });
      }
    }
    await ctx.db.patch(workItemId, {
      status: "running",
      claimedAt: args.now,
      leaseExpiresAt: args.now + 10 * 60 * 1000,
      startedAt: args.now,
      attemptCount: selection.selected.attemptCount + 1,
      lastError: undefined,
      reservedCostUnits: reservation || undefined,
      reservationDateKey: reservation ? selection.selected.reservationDateKey ?? dateKey : undefined,
      updatedAt: args.now,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: selection.selected.inventionId,
      workItemId,
      eventType: "work_claimed",
      actorType: "atlas",
      summary: `InventSmith claimed ${selection.selected.kind}.`,
      attemptNumber: selection.selected.attemptCount + 1,
      metadata: { usageScope: usageScope.scope, usageUserId: String(usageScope.usageUserId) },
      createdAt: args.now,
    });
    return { workItemId, reason: "selected" as const };
  },
});

export const getWorkContext = internalQuery({
  args: { workItemId: v.id("atlasWorkItems") },
  handler: async (ctx, { workItemId }) => {
    const workItem = await ctx.db.get(workItemId);
    if (!workItem) throw new ConvexError("Work item not found");
    const invention = await ctx.db.get(workItem.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    const [record, sources, findings, deliverables] = await Promise.all([
      ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).unique(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect(),
    ]);
    return { workItem, invention, record, sources, findings, deliverables };
  },
});

const findingValidator = v.object({
  statement: v.string(),
  kind: v.union(v.literal("sourced_fact"), v.literal("inventor_statement"), v.literal("estimate"), v.literal("ai_inference")),
  confidence: v.number(),
  sourceUrls: v.array(v.string()),
  assumptions: v.array(v.string()),
  limitations: v.array(v.string()),
});

const sourceVerificationValidator = v.object({
  sourceUrl: v.string(),
  status: v.union(v.literal("verified_primary"), v.literal("verified_authoritative_secondary"), v.literal("verified_secondary"), v.literal("unverified"), v.literal("disputed")),
  notes: v.string(),
});

export const completeWork = internalMutation({
  args: {
    workItemId: v.id("atlasWorkItems"),
    summary: v.string(),
    deliverableTitle: v.string(),
    markdown: v.string(),
    findings: v.array(findingValidator),
    assumptions: v.array(v.string()),
    limitations: v.array(v.string()),
    verifiedSources: v.array(sourceVerificationValidator),
    storageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.string()),
    artifactMaturity: v.optional(v.union(v.literal("concept_visualization"), v.literal("preliminary_cad"), v.literal("prototype_candidate"), v.literal("engineering_reviewed"), v.literal("manufacturing_released"))),
    generationPrompt: v.optional(v.string()),
    actualCostUnits: v.number(),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const workItem = await ctx.db.get(args.workItemId);
    if (!workItem || workItem.status !== "running") throw new ConvexError("Work item is not running");
    const currentInvention = await ctx.db.get(workItem.inventionId);
    if (currentInvention && workItem.claimedAt && currentInvention.updatedAt > workItem.claimedAt) {
      await ctx.db.patch(workItem._id, {
        status: "queued",
        leaseExpiresAt: undefined,
        reservedCostUnits: undefined,
        reservationDateKey: undefined,
        lastError: "Invention inputs changed while this work was running; the stale output was discarded.",
        updatedAt: args.completedAt,
      });
      await ctx.db.insert("atlasExecutionEvents", {
        inventionId: workItem.inventionId,
        workItemId: workItem._id,
        eventType: "work_failed",
        actorType: "system",
        summary: "InventSmith discarded an output because the invention changed during generation.",
        attemptNumber: workItem.attemptCount,
        costUnits: args.actualCostUnits,
        metadata: { retryScheduled: true, staleInputDiscarded: true },
        createdAt: args.completedAt,
      });
      await settleUsageReservation(ctx, workItem, workItem.inventionId, args.actualCostUnits, 0, args.completedAt);
      return;
    }

    const findings = args.findings.map(normalizeFinding);

    if (workItem.kind === "evidence_verification") {
      const existingSources = await ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect();
      const verificationByUrl = new Map(args.verifiedSources.map((verification) => [verification.sourceUrl, verification]));
      for (const source of existingSources) {
        if (!source.locator) continue;
        const verification = verificationByUrl.get(source.locator);
        if (!verification) continue;
        const reliability = reliabilityFromVerificationStatus(verification.status);
        await ctx.db.patch(source._id, {
          reliability,
          metadata: { ...(source.metadata ?? {}), verificationStatus: verification.status, verificationNotes: verification.notes, verifiedAt: args.completedAt },
        });
      }

      const refreshedSources = await ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect();
      const reliableSourceIds = new Set(refreshedSources.filter((source) => isSourceEligibleForPromotion(source, args.completedAt)).map((source) => String(source._id)));
      const disputedSourceIds = new Set(existingSources.filter((source) => source.locator && verificationByUrl.get(source.locator)?.status === "disputed").map((source) => String(source._id)));
      const existingFindings = await ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect();
      for (const finding of existingFindings) {
        if (finding.kind !== "sourced_fact" || finding.sourceIds.length === 0) continue;
        const disputed = finding.sourceIds.some((sourceId) => disputedSourceIds.has(String(sourceId)));
        const checked = finding.sourceIds.every((sourceId) => reliableSourceIds.has(String(sourceId)));
        await ctx.db.patch(finding._id, { status: disputed ? "disputed" : checked ? "evidence_checked" : finding.status, updatedAt: args.completedAt });
      }
      const existingDeliverables = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect();
      for (const deliverable of existingDeliverables) {
        const checked = canPromoteDeliverable(deliverable.sourceIds.map(String), reliableSourceIds, deliverable.sourceCoverage);
        if (checked && (deliverable.trustState === "atlas_draft" || deliverable.staleReason === EVIDENCE_FRESHNESS_STALE_REASON)) {
          await ctx.db.patch(deliverable._id, {
            trustState: deliverable.trustState === "atlas_draft" ? "evidence_checked" : deliverable.trustState,
            staleReason: deliverable.staleReason === EVIDENCE_FRESHNESS_STALE_REASON ? undefined : deliverable.staleReason,
            updatedAt: args.completedAt,
          });
        }
      }
    }
    const sourcedFindings = findings.filter((finding) => finding.kind === "sourced_fact");
    const sourceCoverage = findings.length === 0
      ? 0
      : sourcedFindings.filter((finding) => finding.sourceUrls.length > 0).length / findings.length;
    const confidence = findings.length === 0
      ? 0
      : findings.reduce((sum, finding) => sum + finding.confidence, 0) / findings.length;

    const sourceIds: Id<"evidenceSources">[] = [];
    const sourceByUrl = new Map<string, typeof sourceIds[number]>();
    for (const url of [...new Set(findings.flatMap((finding) => finding.sourceUrls))]) {
      const sourceId = await ctx.db.insert("evidenceSources", {
        inventionId: workItem.inventionId,
        sourceType: "other",
        title: url,
        locator: url,
        accessedAt: args.completedAt,
        reliability: "unverified",
        createdAt: args.completedAt,
      });
      sourceIds.push(sourceId);
      sourceByUrl.set(url, sourceId);
    }

    const findingIds: Id<"evidenceFindings">[] = [];
    for (const finding of findings) {
      const findingId = await ctx.db.insert("evidenceFindings", {
        inventionId: workItem.inventionId,
        statement: finding.statement,
        kind: finding.kind,
        confidence: Math.max(0, Math.min(1, finding.confidence)),
        sourceIds: finding.sourceUrls.flatMap((url) => sourceByUrl.get(url) ?? []),
        assumptions: finding.assumptions,
        limitations: finding.limitations,
        status: "draft",
        createdAt: args.completedAt,
        updatedAt: args.completedAt,
      });
      findingIds.push(findingId);
    }

    const existingAssumptions = await ctx.db.query("inventionAssumptions").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect();
    const knownAssumptions = new Set(existingAssumptions.map((item) => item.statement.trim().toLocaleLowerCase()));
    for (const statement of args.assumptions.map((item) => item.trim()).filter(Boolean)) {
      const key = statement.toLocaleLowerCase();
      if (knownAssumptions.has(key)) continue;
      await ctx.db.insert("inventionAssumptions", {
        inventionId: workItem.inventionId,
        statement,
        impact: "medium",
        status: "untested",
        evidenceFindingIds: [],
        createdAt: args.completedAt,
        updatedAt: args.completedAt,
      });
      knownAssumptions.add(key);
    }

    const deliverableKind = workItem.deliverableKind ?? workItem.kind;
    const requiredReviews = requiredProfessionalReviews(deliverableKind);
    const priorVersions = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId_kind", (q) => q.eq("inventionId", workItem.inventionId).eq("kind", deliverableKind)).collect();
    const version = priorVersions.reduce((highest, deliverable) => Math.max(highest, deliverable.version), 0) + 1;
    const deliverableId = await ctx.db.insert("atlasDeliverables", {
      inventionId: workItem.inventionId,
      workItemId: workItem._id,
      kind: deliverableKind,
      title: args.deliverableTitle,
      version,
      trustState: requiredReviews.length ? "professional_review_required" : "atlas_draft",
      content: args.markdown,
      storageId: args.storageId,
      mediaType: args.mediaType,
      artifactMaturity: args.artifactMaturity,
      generationPrompt: args.generationPrompt,
      sourceIds,
      assumptions: args.assumptions,
      limitations: args.limitations,
      sourceCoverage,
      confidence,
      searchDate: args.completedAt,
      missingInformation: [...new Set(findings.flatMap((finding) => finding.limitations))],
      createdAt: args.completedAt,
      updatedAt: args.completedAt,
    });
    for (const review of requiredReviews) {
      await ctx.db.insert("professionalReviews", {
        inventionId: workItem.inventionId,
        deliverableId,
        specialty: review.specialty,
        requiredCredentials: review.requiredCredentials,
        scope: review.scope,
        status: "required",
        createdAt: args.completedAt,
        updatedAt: args.completedAt,
      });
    }
    for (const findingId of findingIds) {
      await ctx.db.insert("deliverableDependencies", {
        inventionId: workItem.inventionId,
        deliverableId,
        dependencyType: "finding",
        dependencyId: String(findingId),
        createdAt: args.completedAt,
      });
    }
    if (workItem.dependsOnKinds?.length) {
      const [allWorkItems, allDeliverables] = await Promise.all([
        ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect(),
        ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", workItem.inventionId)).collect(),
      ]);
      const dependencyWorkIds = new Set(allWorkItems.filter((item) => item.status === "completed" && workItem.dependsOnKinds?.includes(item.kind)).map((item) => String(item._id)));
      for (const dependency of allDeliverables.filter((item) => item.workItemId && dependencyWorkIds.has(String(item.workItemId)))) {
        await ctx.db.insert("deliverableDependencies", {
          inventionId: workItem.inventionId,
          deliverableId,
          dependencyType: "deliverable",
          dependencyId: String(dependency._id),
          createdAt: args.completedAt,
        });
      }
    }
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: workItem.inventionId,
      workItemId: workItem._id,
      eventType: "work_completed",
      actorType: "atlas",
      summary: args.summary.slice(0, 500),
      attemptNumber: workItem.attemptCount,
      costUnits: args.actualCostUnits,
      metadata: { findingCount: findings.length, sourceCount: sourceIds.length, sourceCoverage },
      createdAt: args.completedAt,
    });
    await settleUsageReservation(ctx, workItem, workItem.inventionId, args.actualCostUnits, 1, args.completedAt);

    await ctx.db.patch(workItem._id, {
      status: "completed",
      outputSummary: args.summary,
      actualCostUnits: args.actualCostUnits,
      completedAt: args.completedAt,
      leaseExpiresAt: undefined,
      reservedCostUnits: undefined,
      reservationDateKey: undefined,
      updatedAt: args.completedAt,
    });
  },
});

export const failWork = internalMutation({
  args: { workItemId: v.id("atlasWorkItems"), error: v.string(), failedAt: v.number() },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.workItemId);
    if (!item) return { willRetry: false };
    const willRetry = shouldRetryWork(item.attemptCount, item.maxAttempts ?? 3);
    await settleUsageReservation(ctx, item, item.inventionId, 0, 0, args.failedAt);
    await ctx.db.patch(item._id, {
      status: willRetry ? "queued" : "failed",
      lastError: args.error.slice(0, 1000),
      leaseExpiresAt: undefined,
      reservedCostUnits: undefined,
      reservationDateKey: undefined,
      updatedAt: args.failedAt,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: item.inventionId,
      workItemId: item._id,
      eventType: "work_failed",
      actorType: "atlas",
      summary: "Autonomous work attempt failed.",
      attemptNumber: item.attemptCount,
      metadata: { retryScheduled: willRetry },
      createdAt: args.failedAt,
    });
    return { willRetry };
  },
});

export const blockWorkForHuman = internalMutation({
  args: {
    workItemId: v.id("atlasWorkItems"),
    reason: v.string(),
    gateType: v.union(v.literal("decision"), v.literal("authorization"), v.literal("private_information"), v.literal("professional_review"), v.literal("payment"), v.literal("physical_work")),
    blockedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.workItemId);
    if (!item) throw new ConvexError("Work item not found");
    await settleUsageReservation(ctx, item, item.inventionId, 0, 0, args.blockedAt);
    await ctx.db.patch(args.workItemId, {
      status: "blocked",
      blockedReason: args.reason,
      humanGateType: args.gateType,
      leaseExpiresAt: undefined,
      reservedCostUnits: undefined,
      reservationDateKey: undefined,
      updatedAt: args.blockedAt,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: item.inventionId,
      workItemId: item._id,
      eventType: "work_blocked",
      actorType: "atlas",
      summary: args.reason.slice(0, 500),
      attemptNumber: item.attemptCount,
      metadata: { gateType: args.gateType },
      createdAt: args.blockedAt,
    });
  },
});
