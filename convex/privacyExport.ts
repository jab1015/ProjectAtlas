import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { query } from "./_generated/server";

const INVENTION_LIMIT = 25;
const ROW_LIMIT = 500;
const EVENT_LIMIT = 1500;

function requireWithinLimit<T>(rows: T[], limit: number, label: string): T[] {
  if (rows.length > limit) {
    throw new ConvexError(`Your ${label} exceeds the self-service export limit. Submit a formal data-export request for a coordinated complete package.`);
  }
  return rows;
}

export const getMyStructuredExport = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User profile not found");

    const inventions = requireWithinLimit(
      await ctx.db.query("inventions").withIndex("by_userId", (q) => q.eq("userId", userId)).take(INVENTION_LIMIT + 1),
      INVENTION_LIMIT,
      "invention count",
    );

    const inventionBundles = [];
    for (const invention of inventions) {
      const [
        records,
        sources,
        findings,
        assumptions,
        decisions,
        approvals,
        workItems,
        executionEvents,
        deliverables,
        dependencies,
        reviews,
        stageProgress,
        conversations,
        messages,
        documents,
        validationResearch,
      ] = await Promise.all([
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
      ]);

      if (records.length > 1) throw new ConvexError("Invention has multiple canonical records; Atlas must reconcile the data before export.");
      const bounded = {
        sources: requireWithinLimit(sources, ROW_LIMIT, "evidence source count"),
        findings: requireWithinLimit(findings, ROW_LIMIT, "evidence finding count"),
        assumptions: requireWithinLimit(assumptions, ROW_LIMIT, "assumption count"),
        decisions: requireWithinLimit(decisions, ROW_LIMIT, "decision count"),
        approvals: requireWithinLimit(approvals, ROW_LIMIT, "approval count"),
        workItems: requireWithinLimit(workItems, ROW_LIMIT, "work-item count"),
        executionEvents: requireWithinLimit(executionEvents, EVENT_LIMIT, "execution-event count"),
        deliverables: requireWithinLimit(deliverables, ROW_LIMIT, "deliverable count"),
        dependencies: requireWithinLimit(dependencies, EVENT_LIMIT, "dependency count"),
        reviews: requireWithinLimit(reviews, ROW_LIMIT, "professional-review count"),
        conversations: requireWithinLimit(conversations, ROW_LIMIT, "conversation count"),
        messages: requireWithinLimit(messages, EVENT_LIMIT, "conversation-message count"),
        documents: requireWithinLimit(documents, ROW_LIMIT, "document count"),
        validationResearch: requireWithinLimit(validationResearch, ROW_LIMIT, "validation-research count"),
      };

      inventionBundles.push({
        invention,
        canonicalRecord: records[0] ?? null,
        evidenceSources: bounded.sources,
        evidenceFindings: bounded.findings,
        assumptions: bounded.assumptions,
        decisions: bounded.decisions,
        approvalRequests: bounded.approvals,
        workItems: bounded.workItems,
        executionEvents: bounded.executionEvents,
        deliverables: bounded.deliverables,
        deliverableDependencies: bounded.dependencies,
        professionalReviews: bounded.reviews,
        stageProgress,
        conversations: bounded.conversations,
        conversationMessages: bounded.messages,
        documents: bounded.documents.map((document) => ({
          _id: document._id,
          _creationTime: document._creationTime,
          inventionId: document.inventionId,
          fileName: document.fileName,
          createdAt: document.createdAt,
          binaryContentIncluded: false,
        })),
        validationResearch: bounded.validationResearch,
      });
    }

    const [usage, notifications, privacyRequests, purchases] = await Promise.all([
      ctx.db.query("atlasDailyUsage").withIndex("by_userId", (q) => q.eq("userId", userId)).take(EVENT_LIMIT + 1),
      ctx.db.query("notifications").withIndex("by_userId", (q) => q.eq("userId", userId)).take(EVENT_LIMIT + 1),
      ctx.db.query("privacyRequests").withIndex("by_userId", (q) => q.eq("userId", userId)).take(ROW_LIMIT + 1),
      ctx.db.query("purchases").withIndex("by_userId", (q) => q.eq("userId", userId)).take(ROW_LIMIT + 1),
    ]);

    const subscriptionEvents = user.email
      ? await ctx.db.query("subscriptionEvents").withIndex("by_customerEmail", (q) => q.eq("customerEmail", user.email!)).take(ROW_LIMIT + 1)
      : [];

    return {
      exportVersion: 1,
      generatedAt: Date.now(),
      scope: "Atlas structured account data. Uploaded/generated binary file bytes are not embedded in this JSON; use the invention work library or a formal data-export request for coordinated binary files.",
      profile: {
        _id: user._id,
        _creationTime: user._creationTime,
        name: user.name,
        email: user.email,
        emailVerificationTime: user.emailVerificationTime,
        image: user.image,
        isAnonymous: user.isAnonymous,
        createdAt: user.createdAt,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId: user.subscriptionId,
        billingCustomerId: user.billingCustomerId,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        subscriptionUpdatedAt: user.subscriptionUpdatedAt,
      },
      inventions: inventionBundles,
      dailyUsage: requireWithinLimit(usage, EVENT_LIMIT, "usage-history count"),
      notifications: requireWithinLimit(notifications, EVENT_LIMIT, "notification count"),
      privacyRequests: requireWithinLimit(privacyRequests, ROW_LIMIT, "privacy-request count"),
      purchases: requireWithinLimit(purchases, ROW_LIMIT, "purchase count").map((purchase) => ({
        _id: purchase._id,
        _creationTime: purchase._creationTime,
        productId: purchase.productId,
        customerEmail: purchase.customerEmail,
        customerName: purchase.customerName,
        platformOrderId: purchase.platformOrderId,
        stripeCheckoutSessionId: purchase.stripeCheckoutSessionId,
        amountCents: purchase.amountCents,
        currency: purchase.currency,
        downloadCount: purchase.downloadCount,
        lastDownloadedAt: purchase.lastDownloadedAt,
        fulfillmentStatus: purchase.fulfillmentStatus,
        createdAt: purchase.createdAt,
      })),
      subscriptionEvents: requireWithinLimit(subscriptionEvents, ROW_LIMIT, "subscription-event count"),
      excludedSecrets: ["password hashes", "auth sessions", "refresh tokens", "verification codes", "download bearer tokens", "server/API keys"],
    };
  },
});
