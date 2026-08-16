import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getOrganizationMembership } from "./organizations";
import { getOrganizationPlanPolicy } from "./organizationPolicyLogic";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Organization-scoped usage reporting for pricing/cost-to-serve analysis.
 *
 * Cost units are deliberately reported as measured InventSmith units rather
 * than converted to dollars here. Dollar calibration belongs in a separate
 * economics layer because model/image/research prices can change and one
 * token-derived unit is not equivalent to every image/CAD operation.
 */
export const getOrganizationUsageOverview = query({
  args: {
    organizationId: v.id("organizations"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const membership = await getOrganizationMembership(ctx, args.organizationId, userId);
    if (!membership || membership.status !== "active") throw new ConvexError("Organization access required");

    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.status !== "active") throw new ConvexError("Organization not found");

    const days = Math.max(1, Math.min(365, Math.floor(args.days ?? 30)));
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const inventions = await ctx.db
      .query("inventions")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    let totalCostUnits = 0;
    let completedWorkEvents = 0;
    const byWorkKind = new Map<string, { costUnits: number; completions: number }>();
    const inventionUsage = [];

    for (const invention of inventions) {
      const [events, workItems] = await Promise.all([
        ctx.db.query("atlasExecutionEvents").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect(),
        ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).collect(),
      ]);
      const workKindById = new Map(workItems.map((item) => [String(item._id), item.kind]));
      const periodEvents = events.filter((event) => event.createdAt >= since);
      const inventionCostUnits = periodEvents.reduce((sum, event) => sum + Math.max(0, event.costUnits ?? 0), 0);
      const inventionCompletions = periodEvents.filter((event) => event.eventType === "work_completed").length;
      totalCostUnits += inventionCostUnits;
      completedWorkEvents += inventionCompletions;

      for (const event of periodEvents) {
        if (!event.costUnits || event.costUnits <= 0) continue;
        const kind = event.workItemId ? workKindById.get(String(event.workItemId)) ?? "unknown_work" : "unattributed";
        const current = byWorkKind.get(kind) ?? { costUnits: 0, completions: 0 };
        current.costUnits += event.costUnits;
        if (event.eventType === "work_completed") current.completions += 1;
        byWorkKind.set(kind, current);
      }

      inventionUsage.push({
        inventionId: invention._id,
        title: invention.title,
        status: invention.status,
        costUnits: inventionCostUnits,
        completedWorkEvents: inventionCompletions,
      });
    }

    const policy = getOrganizationPlanPolicy(organization.planKey);
    return {
      organization: {
        organizationId: organization._id,
        name: organization.name,
        kind: organization.kind,
        planKey: organization.planKey,
        monthlyPriceUsd: policy.monthlyPriceUsd,
        activeInventionLimit: policy.activeInventionLimit,
        includedSeatLimit: policy.includedSeatLimit,
      },
      period: { days, since },
      inventions: {
        active: inventions.filter((invention) => invention.status === "active").length,
        archived: inventions.filter((invention) => invention.status === "archived").length,
        usage: inventionUsage.sort((a, b) => b.costUnits - a.costUnits),
      },
      autonomousUsage: {
        totalCostUnits,
        completedWorkEvents,
        byWorkKind: [...byWorkKind.entries()]
          .map(([kind, value]) => ({ kind, ...value }))
          .sort((a, b) => b.costUnits - a.costUnits),
      },
      economics: {
        estimatedVariableCostUsd: null,
        note: "Cost units are measured. Dollar conversion remains unset until model, search, image, CAD, extraction and artifact costs are calibrated independently.",
      },
    };
  },
});
