import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { requireOrganizationRole } from "./organizations";
import { getOrganizationPlanPolicy } from "./organizationPolicyLogic";
import { addCostClassUsage, buildObservedCostProfile, emptyCostClassSummary } from "./costEconomicsLogic";

function utcDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/**
 * Organization-scoped internal usage reporting for pricing/cost-to-serve analysis.
 *
 * This endpoint exposes provider and operation-class economics, so it is limited
 * to organization Owner/Admin roles. Ordinary members can use the separate
 * current-usage endpoint without receiving internal provider/cost attribution.
 *
 * Enforcement usage comes from organizationDailyUsage. Cost attribution comes
 * from the immutable invention execution ledger, where cost-bearing work and
 * Ask InventSmith answers carry invention identity and measured cost units.
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
    await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);

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
    let autonomousEventCostUnits = 0;
    let chatCostUnits = 0;
    let completedWorkEvents = 0;
    let costBearingEvents = 0;
    let attributedCostEvents = 0;
    let unattributedCostUnits = 0;
    let providerAttributedCostUnits = 0;
    const byWorkKind = new Map<string, { costUnits: number; completions: number }>();
    const byOperationClass = emptyCostClassSummary();
    const byProvider = new Map<string, { costUnits: number; operations: number }>();
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
        const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata as Record<string, unknown> : {};
        const metadataKind = typeof metadata.operationKind === "string" ? metadata.operationKind : undefined;
        const workKind = event.workItemId ? workKindById.get(String(event.workItemId)) : undefined;
        const resolvedKind = workKind ?? metadataKind;
        const kind = resolvedKind ?? "unattributed";
        const completed = event.eventType === "work_completed" || event.eventType === "chat_answered";
        if (resolvedKind) {
          attributedCostEvents += 1;
          inventionAttributedEvents += 1;
        } else {
          unattributedCostUnits += event.costUnits;
          inventionUnattributedCostUnits += event.costUnits;
        }

        if (event.eventType === "chat_answered") chatCostUnits += event.costUnits;
        else autonomousEventCostUnits += event.costUnits;

        const provider = typeof metadata.provider === "string" ? metadata.provider : undefined;
        if (provider) {
          providerAttributedCostUnits += event.costUnits;
          const currentProvider = byProvider.get(provider) ?? { costUnits: 0, operations: 0 };
          currentProvider.costUnits += event.costUnits;
          currentProvider.operations += 1;
          byProvider.set(provider, currentProvider);
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
    const autonomousLedgerVsEventDelta = sharedUsage.autonomousCostUnits - autonomousEventCostUnits;
    const observedCostProfile = buildObservedCostProfile(inventionUsage.map((item) => item.costUnits));
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
      measuredCostUsage: {
        totalCostUnits,
        autonomousCostUnits: autonomousEventCostUnits,
        askInventSmithCostUnits: chatCostUnits,
        completedWorkEvents,
        byOperationClass,
        byOperationKind: [...byWorkKind.entries()]
          .map(([kind, value]) => ({ kind, ...value }))
          .sort((a, b) => b.costUnits - a.costUnits),
        byProvider: [...byProvider.entries()]
          .map(([provider, value]) => ({ provider, ...value }))
          .sort((a, b) => b.costUnits - a.costUnits),
      },
      // Keep the former key while downstream reporting migrates to measuredCostUsage.
      autonomousUsage: {
        totalCostUnits: autonomousEventCostUnits,
        completedWorkEvents,
        byOperationClass,
        byWorkKind: [...byWorkKind.entries()]
          .filter(([kind]) => !kind.startsWith("ask_inventsmith"))
          .map(([kind, value]) => ({ kind, ...value }))
          .sort((a, b) => b.costUnits - a.costUnits),
      },
      attribution: {
        costBearingEvents,
        attributedCostEvents,
        unattributedCostEvents: costBearingEvents - attributedCostEvents,
        unattributedCostUnits,
        coverage: costBearingEvents === 0 ? 1 : attributedCostEvents / costBearingEvents,
        providerAttributedCostUnits,
        providerCoverageByCostUnits: totalCostUnits === 0 ? 1 : providerAttributedCostUnits / totalCostUnits,
        autonomousLedgerVsEventCostUnitDelta: autonomousLedgerVsEventDelta,
        fullyReconciled: autonomousLedgerVsEventDelta === 0 && unattributedCostUnits === 0,
        notes: [
          "A non-zero autonomous ledger/event delta can include same-day migration baseline usage or older cost events created before full attribution metadata existed.",
          "Ask InventSmith model usage is now recorded separately from autonomous allowance units so chat question entitlements and provider cost measurement remain distinct controls.",
        ],
      },
      economics: {
        estimatedVariableCostUsd: null,
        grossMarginEstimate: null,
        calibrationReady: observedCostProfile.sampleSize > 0,
        providerPricingCaptured: false,
        observedCostProfile,
        note: "Observed normal/heavy/max and Studio-overlap scenarios are measured in InventSmith cost units only. Dollar conversion remains unset until model, web-search, image, CAD, extraction, storage and artifact unit prices are calibrated from real production usage.",
      },
    };
  },
});
