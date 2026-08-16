import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { requireOrganizationRole } from "./organizations";

const INVENTION_LIMIT = 100;
const ROW_LIMIT = 750;
const EVENT_LIMIT = 2500;

function bounded<T>(rows: T[], limit: number, label: string) {
  if (rows.length > limit) throw new ConvexError(`${label} exceeds the self-service organization export limit. Use a coordinated export.`);
  return rows;
}

/**
 * Export company/studio-owned project data separately from an individual's
 * privacy export. Only organization Owner/Admin roles may request it.
 * Binary file bytes and authentication secrets are intentionally excluded.
 */
export const getOrganizationStructuredExport = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrganizationRole(ctx, args.organizationId, ["owner", "admin"]);
    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.status === "closed") throw new ConvexError("Organization not found");

    const memberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    const members = [];
    for (const membership of memberships) {
      const user = await ctx.db.get(membership.userId);
      members.push({
        userId: membership.userId,
        name: user?.name,
        email: user?.email,
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
      });
    }

    const inventions = bounded(
      await ctx.db
        .query("inventions")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
        .take(INVENTION_LIMIT + 1),
      INVENTION_LIMIT,
      "Invention count",
    );

    const inventionBundles = [];
    for (const invention of inventions) {
      const [records, sources, findings, assumptions, decisions, approvals, workItems, events, deliverables, dependencies, reviews, stages, conversations, messages, documents, validationResearch, grants] = await Promise.all([
        ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(2),
        ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("inventionAssumptions").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("atlasExecutionEvents").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(EVENT_LIMIT + 1),
        ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("deliverableDependencies").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(EVENT_LIMIT + 1),
        ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("stageProgress").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(50),
        ctx.db.query("conversations").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("conversationMessages").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(EVENT_LIMIT + 1),
        ctx.db.query("documents").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("validationResearch").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
        ctx.db.query("inventionAccessGrants").withIndex("by_inventionId", (q) => q.eq("inventionId", invention._id)).take(ROW_LIMIT + 1),
      ]);
      if (records.length > 1) throw new ConvexError("An invention has multiple canonical records; reconcile it before export.");
      inventionBundles.push({
        invention,
        canonicalRecord: records[0] ?? null,
        evidenceSources: bounded(sources, ROW_LIMIT, "Evidence source count"),
        evidenceFindings: bounded(findings, ROW_LIMIT, "Evidence finding count"),
        assumptions: bounded(assumptions, ROW_LIMIT, "Assumption count"),
        decisions: bounded(decisions, ROW_LIMIT, "Decision count"),
        approvalRequests: bounded(approvals, ROW_LIMIT, "Approval count"),
        workItems: bounded(workItems, ROW_LIMIT, "Work-item count"),
        executionEvents: bounded(events, EVENT_LIMIT, "Execution-event count"),
        deliverables: bounded(deliverables, ROW_LIMIT, "Deliverable count"),
        deliverableDependencies: bounded(dependencies, EVENT_LIMIT, "Dependency count"),
        professionalReviews: bounded(reviews, ROW_LIMIT, "Review count"),
        stageProgress: stages,
        conversations: bounded(conversations, ROW_LIMIT, "Conversation count"),
        conversationMessages: bounded(messages, EVENT_LIMIT, "Message count"),
        documents: bounded(documents, ROW_LIMIT, "Document count").map((document) => ({
          _id: document._id,
          inventionId: document.inventionId,
          fileName: document.fileName,
          createdAt: document.createdAt,
          binaryContentIncluded: false,
        })),
        validationResearch: bounded(validationResearch, ROW_LIMIT, "Validation research count"),
        accessGrants: bounded(grants, ROW_LIMIT, "Access-grant count"),
      });
    }

    const dailyUsage = bounded(
      await ctx.db
        .query("organizationDailyUsage")
        .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId))
        .take(EVENT_LIMIT + 1),
      EVENT_LIMIT,
      "Organization usage-history count",
    );

    return {
      exportVersion: 2,
      generatedAt: Date.now(),
      scope: "Organization-owned InventSmith structured project data. Binary bytes and authentication secrets are not embedded.",
      organization: {
        organizationId: organization._id,
        name: organization.name,
        kind: organization.kind,
        planKey: organization.planKey,
        status: organization.status,
        subscriptionStatus: organization.subscriptionStatus,
        subscriptionCurrentPeriodEnd: organization.subscriptionCurrentPeriodEnd,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      members,
      inventions: inventionBundles,
      dailyUsage,
      excludedSecrets: ["password hashes", "auth sessions", "refresh tokens", "verification codes", "server/API keys", "webhook secrets"],
    };
  },
});
