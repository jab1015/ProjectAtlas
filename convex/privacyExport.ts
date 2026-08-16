import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";

const INVENTION_LIMIT = 25;
const ROW_LIMIT = 500;
const EVENT_LIMIT = 1500;

function requireWithinLimit<T>(rows: T[], limit: number, label: string): T[] {
  if (rows.length > limit) {
    throw new ConvexError(`Your ${label} exceeds the self-service export limit. Submit a formal data-export request for a coordinated complete package.`);
  }
  return rows;
}

async function personalExportScope(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("User profile not found");

  const memberships = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  const personalOrganizationIds = new Set<string>();
  const organizationAffiliations = [];
  for (const membership of memberships) {
    if (membership.status === "removed") continue;
    const organization = await ctx.db.get(membership.organizationId);
    if (!organization) continue;
    if (membership.role === "owner" && organization.kind === "personal") {
      personalOrganizationIds.add(String(organization._id));
    }
    organizationAffiliations.push({
      organizationId: organization._id,
      name: organization.name,
      kind: organization.kind,
      role: membership.role,
      membershipStatus: membership.status,
    });
  }

  const creatorInventions = await ctx.db
    .query("inventions")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  const inventions = creatorInventions.filter((invention) =>
    !invention.organizationId || personalOrganizationIds.has(String(invention.organizationId))
  );

  return { user, inventions, organizationAffiliations };
}

async function buildInventionBundle(ctx: QueryCtx, invention: any) {
  const [records, sources, findings, assumptions, decisions, approvals, workItems, executionEvents, deliverables, dependencies, reviews, stageProgress, conversations, messages, documents, validationResearch] = await Promise.all([
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

  if (records.length > 1) throw new ConvexError("Invention has multiple canonical records; InventSmith must reconcile the data before export.");
  return {
    invention,
    canonicalRecord: records[0] ?? null,
    evidenceSources: requireWithinLimit(sources, ROW_LIMIT, "evidence source count"),
    evidenceFindings: requireWithinLimit(findings, ROW_LIMIT, "evidence finding count"),
    assumptions: requireWithinLimit(assumptions, ROW_LIMIT, "assumption count"),
    decisions: requireWithinLimit(decisions, ROW_LIMIT, "decision count"),
    approvalRequests: requireWithinLimit(approvals, ROW_LIMIT, "approval count"),
    workItems: requireWithinLimit(workItems, ROW_LIMIT, "work-item count"),
    executionEvents: requireWithinLimit(executionEvents, EVENT_LIMIT, "execution-event count"),
    deliverables: requireWithinLimit(deliverables, ROW_LIMIT, "deliverable count"),
    deliverableDependencies: requireWithinLimit(dependencies, EVENT_LIMIT, "dependency count"),
    professionalReviews: requireWithinLimit(reviews, ROW_LIMIT, "professional-review count"),
    stageProgress,
    conversations: requireWithinLimit(conversations, ROW_LIMIT, "conversation count"),
    conversationMessages: requireWithinLimit(messages, EVENT_LIMIT, "conversation-message count"),
    documents: requireWithinLimit(documents, ROW_LIMIT, "document count").map((document) => ({
      _id: document._id,
      _creationTime: document._creationTime,
      inventionId: document.inventionId,
      fileName: document.fileName,
      createdAt: document.createdAt,
      binaryContentIncluded: false,
    })),
    validationResearch: requireWithinLimit(validationResearch, ROW_LIMIT, "validation-research count"),
  };
}

async function buildStructuredExport(ctx: QueryCtx, userId: Id<"users">) {
  const { user, inventions: scopedInventions, organizationAffiliations } = await personalExportScope(ctx, userId);
  const inventions = requireWithinLimit(scopedInventions, INVENTION_LIMIT, "personal invention count");
  const inventionBundles = [];
  for (const invention of inventions) inventionBundles.push(await buildInventionBundle(ctx, invention));

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
    exportVersion: 2,
    generatedAt: Date.now(),
    scope: "InventSmith personal account data. Company/studio invention data is excluded from this personal export even if this user originally created the invention. Organization-authorized exports are handled separately. Uploaded/generated binary file bytes are not embedded in this JSON.",
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
    organizationAffiliations,
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
}

export const getMyStructuredExport = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    return buildStructuredExport(ctx, userId);
  },
});

export const getStructuredExportForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);
    return buildStructuredExport(ctx, userId);
  },
});
