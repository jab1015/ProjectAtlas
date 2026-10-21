import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { hasRecoverableAutonomousWork, shouldQueueEvidenceRefresh } from "./autonomyMaintenanceLogic";
import { MAX_AUTONOMOUS_RUN_BUDGET } from "./usagePolicyLogic";
import { EVIDENCE_FRESHNESS_STALE_REASON, isSourceEligibleForPromotion } from "./evidenceIntegrityLogic";
import { departmentAgentAuditMetadata, resolveDepartmentAgent } from "./departmentAgentLogic";
import { shouldAutomaticallyRecoverFailedWork } from "./workOrchestratorLogic";

const findCandidates = makeFunctionReference<"query", Record<string, never>, Id<"inventions">[]>("autonomyMaintenance:findResumeCandidates");
const runAvailableWork = makeFunctionReference<"action", { inventionId: Id<"inventions">; costBudgetUnits?: number }, unknown>("atlasWorkOrchestration:runAvailableWork");
const refreshExpiredEvidenceRef = makeFunctionReference<"mutation", Record<string, never>, { inventionsRefreshed: number }>("autonomyMaintenance:refreshExpiredEvidence");

export const refreshExpiredEvidence = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const inventions = await ctx.db.query("inventions").withIndex("by_status", (q) => q.eq("status", "active")).take(100);
    let inventionsRefreshed = 0;
    for (const invention of inventions) {
      const sources = await ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect();
      const expiredSourceIds = new Set(sources
        .filter((source) => source.reliability !== "unverified" && !isSourceEligibleForPromotion(source, now))
        .map((source) => String(source._id)));
      if (expiredSourceIds.size === 0) continue;
      const [findings, deliverables, workItems] = await Promise.all([
        ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect(),
        ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect(),
        ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect(),
      ]);
      for (const finding of findings) {
        if (finding.sourceIds.some((sourceId) => expiredSourceIds.has(String(sourceId))) && finding.status !== "stale") {
          await ctx.db.patch(finding._id, { status: "stale", updatedAt: now });
        }
      }
      for (const deliverable of deliverables) {
        if (deliverable.sourceIds.some((sourceId) => expiredSourceIds.has(String(sourceId))) && !deliverable.staleReason) {
          await ctx.db.patch(deliverable._id, { staleReason: EVIDENCE_FRESHNESS_STALE_REASON, updatedAt: now });
        }
      }
      const verification = workItems.find((item) => item.kind === "evidence_verification");
      if (verification && shouldQueueEvidenceRefresh(verification.status)) {
        await ctx.db.patch(verification._id, {
          status: "queued", attemptCount: 0, completedAt: undefined, blockedReason: undefined,
          humanGateType: undefined, lastError: undefined, updatedAt: now,
        });
        await ctx.db.insert("atlasExecutionEvents", {
          inventionId: invention._id,
          workItemId: verification._id,
          eventType: "work_queued",
          actorType: "system",
          summary: `InventSmith queued evidence refresh because ${expiredSourceIds.size} trusted source(s) require re-verification.`,
          metadata: { expiredSourceCount: expiredSourceIds.size },
          createdAt: now,
        });
        inventionsRefreshed += 1;
      }
    }
    return { inventionsRefreshed };
  },
});

export const findResumeCandidates = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const inventions = await ctx.db.query("inventions").withIndex("by_status", (q) => q.eq("status", "active")).take(100);
    const candidates: Id<"inventions">[] = [];
    for (const invention of inventions) {
      const items = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect();
      if (hasRecoverableAutonomousWork(items, now)) candidates.push(invention._id);
    }
    return candidates;
  },
});

/** Requeue failed work whose department assignment is now resolvable. */
export const recoverFailedWork = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const inventions = await ctx.db.query("inventions").withIndex("by_status", (q) => q.eq("status", "active")).take(100);
    let requeued = 0;
    for (const invention of inventions) {
      const workItems = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect();
      for (const item of workItems) {
        if (item.status !== "failed") continue;
        const maxAttempts = item.maxAttempts ?? 3;
        const withinRetryBudget = item.attemptCount < maxAttempts;
        const boundedAutomaticRecovery = shouldAutomaticallyRecoverFailedWork(item.kind, item.inputSnapshot, item.attemptCount, maxAttempts);
        if (!withinRetryBudget && !boundedAutomaticRecovery) continue;
        let agent;
        try { agent = resolveDepartmentAgent(item.inputSnapshot, item.kind); } catch { continue; }
        await ctx.db.patch(item._id, {
          status: "queued",
          lastError: undefined,
          maxAttempts: boundedAutomaticRecovery ? item.attemptCount + 2 : item.maxAttempts,
          inputSnapshot: {
            ...(item.inputSnapshot ?? {}),
            department: agent.department,
            ...(boundedAutomaticRecovery
              ? { automaticRecoveryCount: Number(item.inputSnapshot?.automaticRecoveryCount ?? 0) + 1, lastAutomaticRecoveryAt: now }
              : {}),
          },
          updatedAt: now,
        });
        await ctx.db.insert("atlasExecutionEvents", {
          inventionId: invention._id,
          workItemId: item._id,
          eventType: "work_queued",
          actorType: "system",
          summary: `InventSmith automatically recovered ${item.title} and returned it to the worker queue.`,
          attemptNumber: item.attemptCount,
          metadata: { changeType: "automatic_failure_recovery", ...departmentAgentAuditMetadata({ ...(item.inputSnapshot ?? {}), department: agent.department }, item.kind) },
          createdAt: now,
        });
        requeued += 1;
      }
    }
    return { requeued };
  },
});

export const resumeEligibleInventions = internalAction({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(refreshExpiredEvidenceRef, {});
    const recovery = await ctx.runMutation(makeFunctionReference<"mutation", Record<string, never>, { requeued: number }>("autonomyMaintenance:recoverFailedWork"), {});
    if (!process.env.OPENAI_API_KEY) return { scheduled: 0, requeued: recovery.requeued, reason: "openai_not_configured" };
    const inventionIds = await ctx.runQuery(findCandidates, {});
    for (let index = 0; index < inventionIds.length; index += 1) {
      await ctx.scheduler.runAfter(index * 250, runAvailableWork, {
        inventionId: inventionIds[index],
        costBudgetUnits: MAX_AUTONOMOUS_RUN_BUDGET,
      });
    }
    return { scheduled: inventionIds.length, requeued: recovery.requeued, reason: "scheduled" };
  },
});
