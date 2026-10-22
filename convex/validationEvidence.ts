import { internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { isInventorEvidenceSource } from "./chatEvidenceLogic";

const refresh = makeFunctionReference<"mutation", { inventionId: Id<"inventions"> }>("validationEvidence:refreshAfterEvidence");
const run = makeFunctionReference<"action", { inventionId: Id<"inventions"> }>("validationResearchOrchestration:runValidationResearchOrchestration");
const departments = makeFunctionReference<"action", { inventionId: Id<"inventions"> }>("atlasWorkOrchestration:runAvailableWork");

export async function scheduleAffectedDepartments(ctx: MutationCtx, inventionId: Id<"inventions">) {
  // Worker claims enforce dependencies, leases, plan/budget and human gates.
  if (ctx.scheduler) {
    await ctx.scheduler.runAfter(2000, departments, { inventionId });
    await scheduleValidationEvidenceRefresh(ctx, inventionId);
  }
}

export async function readValidationEvidence(ctx: QueryCtx | MutationCtx, inventionId: Id<"inventions">) {
  const [sources, progress] = await Promise.all([
    ctx.db.query("evidenceSources").withIndex("by_inventionId", q => q.eq("inventionId", inventionId)).collect(),
    ctx.db.query("stageProgress").withIndex("by_inventionId", q => q.eq("inventionId", inventionId)).collect(),
  ]);
  const ready = sources.filter(s => isInventorEvidenceSource(s.metadata, s.excerpt) && (s.metadata?.extractionStatus === "completed" || (s.metadata?.evidenceOrigin === "chat" && isInventorEvidenceSource(s.metadata, s.excerpt))));
  const invention = await ctx.db.get(inventionId);
  ready.sort((a, b) => String(a._id).localeCompare(String(b._id)));
  return {
    fingerprint: JSON.stringify({
      inputs: [invention?.title, invention?.problemStatement, invention?.targetAudience, invention?.solutionDescription],
      stageInputs: progress.map(row => [row.stageId, row.completedFields, row.readinessScore, row.updatedAt]),
      sources: ready.map(s => [s._id, s.metadata?.extractedAt ?? s.metadata?.uploadedAt ?? s.createdAt]),
    }),
    evidence: ready.map(s => ({ sourceId: String(s._id), title: s.title, evidenceKind: s.metadata?.evidenceKind ?? "other", provenance: "inventor_upload", extraction: s.metadata?.extraction ?? { text: s.excerpt } })),
    pendingSurveys: sources
      .filter(s => isInventorEvidenceSource(s.metadata, s.excerpt) && s.metadata?.evidenceKind === "survey" && s.metadata?.extractionStatus !== "completed")
      .map(s => ({
        title: s.title,
        status: s.metadata?.extractionStatus === "failed" ? "failed" as const : "processing" as const,
      })),
  };
}

export async function scheduleValidationEvidenceRefresh(ctx: MutationCtx, inventionId: Id<"inventions">) {
  // Small delay coalesces closely-spaced document extractions. The session mutation
  // atomically deduplicates scheduled actions and snapshots all ready evidence.
  await ctx.scheduler.runAfter(2000, refresh, { inventionId });
}

export const refreshAfterEvidence = internalMutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const latest = await ctx.db.query("validationResearch").withIndex("by_inventionId", q => q.eq("inventionId", inventionId)).order("desc").first();
    if (!latest) return { queued: false, reason: "validation_not_started" };
    // Completion/failure schedules another check, so uploads during a run are
    // included in one follow-up run, never a parallel or lost refresh.
    if (["pending", "running"].includes(latest.researchStatus ?? "")) return { queued: false, reason: "running" };
    const snapshot = await readValidationEvidence(ctx, inventionId);
    if ((latest.evidenceFingerprint ?? "[]") === snapshot.fingerprint) return { queued: false, reason: "current" };
    await ctx.db.patch(latest._id, { researchStatus: "stale", overallStatus: "STALE", updatedAt: Date.now() });
    await ctx.scheduler.runAfter(0, run, { inventionId });
    return { queued: true, reason: "evidence_changed" };
  },
});
