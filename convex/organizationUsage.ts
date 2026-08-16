import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getOrganizationMembership } from "./organizations";
import { getOrganizationPlanPolicy } from "./organizationPolicyLogic";
import { getAuthUserId } from "@convex-dev/auth/server";
import { addCostClassUsage, emptyCostClassSummary } from "./costEconomicsLogic";

function utcDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/**
 * Organization-scoped usage reporting for pricing/cost-to-serve analysis.
 *
 * Enforcement usage comes from organizationDailyUsage. Cost attribution comes
 * from the immutable invention execution ledger, where every cost-bearing work
 * completion/failure already carries inventionId, workItemId and costUnits.
 * Keeping these views reconciled avoids inventing a second source of truth.
 *
 * Cost units are deliberately not converted to dollars until provider-specific
 * model/search/image/CAD/storage pricing is captured from real runtime usage.
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
    const now = Date.now();
    const since = now - days * 24 * 60 * 60 * 1000;
    const sinceDateKey = utcDateKey(since);
    const inventions = await ctx.db
      .query("inventions")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    const dailyUsageRows = (await ctx.db
      .query("organizationDailyUsage")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect())
      .filter((row) => row.dateKey >= sinceDateKey);

    const sharedUsage = dailyUsageRows.reduce(
      (summary, row) => {
        summary.autonomousCostUnits += Math.max(0, row.autonomousCostUnits);
        summary.reservedAutonomousCostUnits += Math.max(0, row.reservedAutonomousCostUnits ?? 0);
        summary.completedWorkItems += Math.max(0, row.completedWorkItems);
        summary.chatQuestions += Math.max(0, row.chatQuestions);
        return summary;
      },
      { autonomousCostUnits: 0, reservedAutonomousCostUnits: 0, completedWorkItems: 0, chatQuestions: 0 },
    );

    let totalCostUnits = 0;
    let completedWorkEvents = 0;
    let costBearingEvents = 0;
    let attributedCostEvents = 0;
    let unattributedCostUnits = 0;
    const byWorkKind = new Map<string, { costUnits: number; completions: number }>();
    const byOperationClass = emptyCostClassSummary();
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
      const inventionClasses = emptyCostClassSummary();
      let inventionCostBearingEvents = 0;
      let inventionAttributedEvents = 0;
      let inventionUnattributedCostUnits = 0;
      totalCostUnits += inventionCostUnits;
      completedWorkEvents += inventionCompletions;

      for (const event of periodEvents) {
        if (!event.costUnits || event.costUnits <= 0) continue;
        costBearingEvents += 1;
        inventionCostBearingEvents += 1;
        const resolvedKind = event.workItemId ? workKindById.get(String(event.workItemId)) : undefined;
        const kind = resolvedKind ?? "unattributed";
        const completed = event.eventType === "work_completed";
        if (resolvedKind) {
          attributedCostEvents += 1;
          inventionAttributedEvents += 1;
        } else {
          unattributedCostUnits += event.costUnits;
          inventionUnattributedCostUnits += event.costUnits;
        }
        const current = byWorkKind.get(kind) ?? { costUnits: 0, completions: 0 };
        current.costUnits += event.costUnits;
        if (completed) current.completions += 1;
        byWorkKind.set(kind, current);
        addCostClassUsage(byOperationClass, kind, event.costUnits, completed);
        addCostClassUsage(inventionClasses, kind, event.costUnits, completed);
      }

      inventionUsage.push({
        inventionId: invention._id,
        title: invention.title,
        status: invention.status,
        costUnits: inventionCostUnits,
        completedWorkEvents: inventionCompletions,
        byOperationClass: inventionClasses,
        attribution: {
          costBearingEvents: inventionCostBearingEvents,
          attributedEvents: inventionAttributedEvents,
          unattributedEvents: inventionCostBearingEvents - inventionAttributedEvents,
          unattributedCostUnits: inventionUnattributedCostUnits,
          coverage: inventionCostBearingEvents === 0 ? 1 : inventionAttributedEvents / inventionCostBearingEvents,
        },
      });
    }

    const policy = getOrganizationPlanPolicy(organization.planKey);
    const ledgerVsEventDelta = sharedUsage.autonomousCostUnits - totalCostUnits;
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
      period: { days, since, sinceDateKey, throughDateKey: utcDateKey(now) },
      inventions: {
        active: inventions.filter((invention) => invention.status === "active").length,
        archived: inventions.filter((invention) => invention.status === "archived").length,
        usage: inventionUsage.sort((a, b) => b.costUnits - a.costUnits),
      },
      sharedAllowanceUsage: {
        ...sharedUsage,
        dailyRows: dailyUsageRows.length,
      },
      autonomousUsage: {
        totalCostUnits,
        completedWorkEvents,
        byOperationClass,
        byWorkKind: [...byWorkKind.entries()]
          .map(([kind, value]) => ({ kind, ...value }))
          .sort((a, b) => b.costUnits - a.costUnits),
      },
      attribution: {
        costBearingEvents,
        attributedCostEvents,
        unattributedCostEvents: costBearingEvents - attributedCostEvents,
        unattributedCostUnits,
        coverage: costBearingEvents === 0 ? 1 : attributedCostEvents / costBearingEvents,
        ledgerVsEventCostUnitDelta: ledgerVsEventDelta,
        fullyReconciled: ledgerVsEventDelta === 0 && unattributedCostUnits === 0,
        notes: [
          "A non-zero ledger/event delta can include same-day migration baseline usage or metered operations that do not yet emit cost-bearing execution events.",
          "Ask InventSmith questions are enforced through the shared organization ledger by question count, but provider token/search cost is not yet persisted as a cost-bearing execution event.",
        ],
      },
      economics: {
        estimatedVariableCostUsd: null,
        grossMarginEstimate: null,
        calibrationReady: totalCostUnits > 0,
        providerPricingCaptured: false,
        note: "Measured autonomous work is attributable by organization, invention, work kind and light/standard/expensive/premium class. Dollar conversion remains unset until model, search, image, CAD, extraction, storage and artifact costs are calibrated from real production usage; Ask InventSmith provider usage is the next attribution gap.",
      },
    };
  },
});
