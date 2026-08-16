import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireInventionReadAccess } from "./organizations";

/**
 * Returns full-product work assigned to a lifecycle stage but defined outside
 * the legacy lifecycleStages array. This keeps the inventor-facing department
 * synchronized with the canonical autonomous plan without duplicating work.
 */
export const getDepartmentExtensions = query({
  args: { inventionId: v.id("inventions"), stageId: v.number() },
  handler: async (ctx, args) => {
    await requireInventionReadAccess(ctx, args.inventionId);

    const [workItems, deliverables] = await Promise.all([
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect(),
    ]);

    const extensions = workItems.filter((item) => {
      const snapshot = item.inputSnapshot && typeof item.inputSnapshot === "object"
        ? item.inputSnapshot as Record<string, unknown>
        : null;
      const assignedStage = typeof snapshot?.stageId === "number"
        ? snapshot.stageId
        : typeof snapshot?.departmentStageId === "number"
          ? snapshot.departmentStageId
          : null;
      return assignedStage === args.stageId;
    });

    const extensionIds = new Set(extensions.map((item) => String(item._id)));
    const extensionDeliverables = deliverables.filter((item) => item.workItemId && extensionIds.has(String(item.workItemId)));

    return {
      workItems: extensions,
      deliverables: extensionDeliverables,
    };
  },
});