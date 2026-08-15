import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { missingCanonicalWorkKinds } from "./canonicalWorkPlan";

export const backfillWorkspace = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const invention = await ctx.db.get(inventionId);
    if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found");

    const now = Date.now();
    let recordCreated = false;
    const existingRecord = await ctx.db
      .query("inventionRecords")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .unique();

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

    const existingWork = await ctx.db
      .query("atlasWorkItems")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .collect();
    const missing = missingCanonicalWorkKinds(existingWork.map((item) => item.kind));

    for (const item of missing) {
      const completed = item.initiallyCompleted === true;
      await ctx.db.insert("atlasWorkItems", {
        inventionId,
        kind: item.kind,
        title: item.title,
        status: completed ? "completed" : "queued",
        priority: item.priority,
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

    if (recordCreated || missing.length > 0) {
      await ctx.db.insert("atlasExecutionEvents", {
        inventionId,
        eventType: "work_queued",
        actorType: "system",
        summary: "InventSmith upgraded an existing invention to the canonical autonomous workspace.",
        metadata: {
          recordCreated,
          addedWorkKinds: missing.map((item) => item.kind),
          canonicalWorkCount: existingWork.length + missing.length,
        },
        createdAt: now,
      });
    }

    return {
      recordCreated,
      addedWorkCount: missing.length,
      addedWorkKinds: missing.map((item) => item.kind),
      alreadyCurrent: !recordCreated && missing.length === 0,
    };
  },
});
