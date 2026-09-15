import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { missingCanonicalWorkKinds } from "./canonicalWorkPlan";
import { POST_CANONICAL_WORK_PLAN } from "./fullProductWorkPlan";

export const backfillWorkspace = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found");

    const now = Date.now();
    let recordCreated = false;
    const existingRecord = await ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).unique();

    if (!existingRecord) {
      await ctx.db.insert("inventionRecords", {
        inventionId,
        userId,
        schemaVersion: 1,
        lifecycleStatus: "intake",
        riskClass: "standard",
        structuredBrief: {
          title: invention.title,
          problemStatement: invention.problemStatement,
          targetAudience: invention.targetAudience,
          solutionDescription: invention.solutionDescription,
        },
        createdAt: now,
        updatedAt: now,
      });
      recordCreated = true;
    }

    const existingWork = await ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect();
    const existingKinds = new Set(existingWork.map((item) => item.kind));
    const missingCanonical = missingCanonicalWorkKinds(existingKinds);
    const missingPostCanonical = POST_CANONICAL_WORK_PLAN.filter((item) => !existingKinds.has(item.kind));

    for (const item of missingCanonical) {
      const completed = item.initiallyCompleted === true;
      await ctx.db.insert("atlasWorkItems", {
        inventionId,
        kind: item.kind,
        title: item.title,
        status: completed ? "completed" : "queued",
        priority: item.priority,
        inputSnapshot: item.instructions ? {
          department: item.kind === "patent_design_handoff" ? "patent_readiness" : "canonical",
          instructions: item.instructions,
        } : undefined,
        attemptCount: completed ? 1 : 0,
        maxAttempts: completed ? undefined : 3,
        estimatedCostUnits: item.estimatedCostUnits,
        deliverableKind: item.deliverableKind,
        dependsOnKinds: item.dependsOnKinds,
        outputSummary: completed ? "InventSmith confirmed the invention brief already exists and can be used as the canonical intake source." : undefined,
        createdAt: now,
        startedAt: completed ? now : undefined,
        completedAt: completed ? now : undefined,
        updatedAt: now,
      });
    }

    for (const item of missingPostCanonical) {
      await ctx.db.insert("atlasWorkItems", {
        inventionId,
        kind: item.kind,
        title: item.title,
        status: "queued",
        priority: item.priority,
        inputSnapshot: item.inputSnapshot,
        attemptCount: 0,
        maxAttempts: 3,
        estimatedCostUnits: item.estimatedCostUnits,
        deliverableKind: item.deliverableKind,
        dependsOnKinds: item.dependsOnKinds,
        createdAt: now,
        updatedAt: now,
      });
    }

    const addedKinds = [...missingCanonical.map((item) => item.kind), ...missingPostCanonical.map((item) => item.kind)];
    if (recordCreated || addedKinds.length > 0) {
      await ctx.db.insert("atlasExecutionEvents", {
        inventionId,
        eventType: "work_queued",
        actorType: "system",
        summary: "InventSmith upgraded the existing invention to the complete autonomous idea-to-market workspace.",
        metadata: {
          recordCreated,
          addedWorkKinds: addedKinds,
          canonicalAdded: missingCanonical.length,
          postCanonicalAdded: missingPostCanonical.length,
          resultingWorkCount: existingWork.length + addedKinds.length,
          includesPatentDesignHandoff: addedKinds.includes("patent_design_handoff") || existingKinds.has("patent_design_handoff"),
          includesNativeCad: addedKinds.includes("native_cad_generation") || existingKinds.has("native_cad_generation"),
        },
        createdAt: now,
      });
    }

    return {
      recordCreated,
      addedWorkCount: addedKinds.length,
      addedWorkKinds: addedKinds,
      canonicalAdded: missingCanonical.length,
      postCanonicalAdded: missingPostCanonical.length,
      alreadyCurrent: !recordCreated && addedKinds.length === 0,
    };
  },
});
