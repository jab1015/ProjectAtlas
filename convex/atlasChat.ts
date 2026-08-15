import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalMutation, internalQuery, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { canAskChatQuestion, isValidChatContent } from "./chatPolicyLogic";
import { canAskWithinDailyAllowance, utcDateKey } from "./usagePolicyLogic";
import { FULL_JOURNEY_STAGES } from "./fullJourneyDefinition";

const answerQuestion = makeFunctionReference<
  "action",
  { userMessageId: Id<"conversationMessages">; assistantMessageId: Id<"conversationMessages"> },
  unknown
>("atlasChatAction:answerQuestion");

async function requireOwnedInvention(ctx: QueryCtx | MutationCtx, inventionId: Id<"inventions">) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Not authenticated");
  const invention = await ctx.db.get(inventionId);
  if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found");
  return { invention, userId };
}

export const getConversation = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const { invention } = await requireOwnedInvention(ctx, inventionId);
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .first();
    const messages = conversation
      ? await ctx.db
          .query("conversationMessages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
          .order("desc")
          .take(200)
      : [];
    return {
      invention: { _id: invention._id, title: invention.title },
      messages: messages.sort((a, b) => a.createdAt - b.createdAt),
    };
  },
});

export const ask = mutation({
  args: { inventionId: v.id("inventions"), content: v.string() },
  handler: async (ctx, { inventionId, content }) => {
    const cleaned = content.trim();
    if (!isValidChatContent(cleaned)) throw new ConvexError("Message must be between 1 and 4,000 characters");
    const { userId } = await requireOwnedInvention(ctx, inventionId);
    const now = Date.now();
    const user = await ctx.db.get(userId);
    const dateKey = utcDateKey(now);
    const dailyUsage = await ctx.db.query("atlasDailyUsage").withIndex("by_userId_dateKey", (q) => q.eq("userId", userId).eq("dateKey", dateKey)).unique();
    if (!canAskWithinDailyAllowance(user?.subscriptionTier, dailyUsage?.chatQuestions ?? 0)) {
      throw new ConvexError("InventSmith chat's daily allowance has been reached. It resets at 00:00 UTC.");
    }
    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId))
      .first();
    if (!conversation) {
      const conversationId = await ctx.db.insert("conversations", { inventionId, userId, createdAt: now, updatedAt: now });
      conversation = await ctx.db.get(conversationId);
    }
    if (!conversation) throw new ConvexError("Could not create conversation");

    const recentMessages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
      .order("desc")
      .take(20);
    const recentQuestionTimes = recentMessages.filter((message) => message.role === "user").map((message) => message.createdAt);
    if (!canAskChatQuestion(recentQuestionTimes, now)) {
      throw new ConvexError("InventSmith chat is limited to five questions per minute. Please wait briefly.");
    }

    const userMessageId = await ctx.db.insert("conversationMessages", {
      conversationId: conversation._id,
      inventionId,
      role: "user",
      content: cleaned,
      status: "complete",
      createdAt: now,
      updatedAt: now,
    });
    const assistantMessageId = await ctx.db.insert("conversationMessages", {
      conversationId: conversation._id,
      inventionId,
      role: "assistant",
      content: "InventSmith is reviewing the complete project state…",
      status: "pending",
      createdAt: now + 1,
      updatedAt: now + 1,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId,
      eventType: "chat_requested",
      actorType: "inventor",
      summary: "The inventor asked InventSmith a project question.",
      metadata: { characterCount: cleaned.length },
      createdAt: now,
    });
    if (dailyUsage) {
      await ctx.db.patch(dailyUsage._id, { chatQuestions: dailyUsage.chatQuestions + 1, updatedAt: now });
    } else {
      await ctx.db.insert("atlasDailyUsage", { userId, dateKey, autonomousCostUnits: 0, completedWorkItems: 0, chatQuestions: 1, updatedAt: now });
    }
    await ctx.db.patch(conversation._id, { updatedAt: now });
    await ctx.scheduler.runAfter(0, answerQuestion, { userMessageId, assistantMessageId });
    return assistantMessageId;
  },
});

/**
 * Project-wide, invention-scoped context for Ask InventSmith.
 *
 * The chat model must be able to verify operational questions such as
 * "did Patent Readiness hand off to Product Design?" from the same canonical
 * ledgers used by the rest of the app. It must not be restricted to a handful
 * of deliverables and chat messages.
 */
export const getAnswerContext = internalQuery({
  args: { userMessageId: v.id("conversationMessages") },
  handler: async (ctx, { userMessageId }) => {
    const userMessage = await ctx.db.get(userMessageId);
    if (!userMessage || userMessage.role !== "user") throw new ConvexError("User message not found");
    const inventionId = userMessage.inventionId;

    const [
      invention,
      record,
      sources,
      findings,
      assumptions,
      decisions,
      approvals,
      workItems,
      deliverables,
      dependencies,
      reviews,
      executionEvents,
      stageProgress,
      validationResearch,
      messages,
    ] = await Promise.all([
      ctx.db.get(inventionId),
      ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).unique(),
      ctx.db.query("evidenceSources").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("inventionAssumptions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("inventionDecisions").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("approvalRequests").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasWorkItems").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("deliverableDependencies").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("professionalReviews").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("atlasExecutionEvents").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("stageProgress").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("validationResearch").withIndex("by_inventionId", (q) => q.eq("inventionId", inventionId)).collect(),
      ctx.db.query("conversationMessages").withIndex("by_conversationId", (q) => q.eq("conversationId", userMessage.conversationId)).order("desc").take(60),
    ]);
    if (!invention) throw new ConvexError("Invention not found");

    const workByKind = new Map(workItems.map((item) => [item.kind, item]));
    const journey = FULL_JOURNEY_STAGES.map((stage) => {
      const stageWork = stage.requiredWorkKinds.map((kind) => workByKind.get(kind)).filter(Boolean);
      const counts = {
        completed: stageWork.filter((item) => item?.status === "completed").length,
        running: stageWork.filter((item) => item?.status === "running").length,
        queued: stageWork.filter((item) => item?.status === "queued").length,
        blocked: stageWork.filter((item) => item?.status === "blocked" || item?.status === "awaiting_approval").length,
        stale: stageWork.filter((item) => item?.status === "stale").length,
        failed: stageWork.filter((item) => item?.status === "failed").length,
      };
      return {
        id: stage.id,
        name: stage.name,
        requiredWorkKinds: stage.requiredWorkKinds,
        initializedWorkCount: stageWork.length,
        counts,
        active: counts.running > 0 || counts.queued > 0,
        complete: stageWork.length > 0 && counts.completed === stageWork.length,
      };
    });

    return {
      userMessage,
      invention,
      record,
      projectScope: {
        sourceOfTruth: "InventSmith canonical invention record and operational ledgers",
        contextIncludes: [
          "evidence sources and findings",
          "assumptions",
          "decisions and approvals",
          "all work items and their dependencies/status",
          "all deliverables and dependency links",
          "professional reviews",
          "execution history",
          "stage progress",
          "validation research",
          "recent conversation",
        ],
      },
      journey,
      sources: sources.sort((a, b) => b.createdAt - a.createdAt).slice(0, 120),
      findings: findings.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 120),
      assumptions: assumptions.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 100),
      decisions: decisions.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 100),
      approvals: approvals.sort((a, b) => b.requestedAt - a.requestedAt).slice(0, 100),
      workItems: workItems.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 250),
      deliverables: deliverables.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 150),
      dependencies: dependencies.slice(0, 300),
      reviews: reviews.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 100),
      executionEvents: executionEvents.sort((a, b) => b.createdAt - a.createdAt).slice(0, 150),
      stageProgress: stageProgress.sort((a, b) => a.stageId - b.stageId),
      validationResearch: validationResearch.sort((a, b) => (b.updatedAt ?? b.triggeredAt ?? 0) - (a.updatedAt ?? a.triggeredAt ?? 0)).slice(0, 10),
      messages: messages.filter((message) => message.status === "complete").sort((a, b) => a.createdAt - b.createdAt).slice(-24),
    };
  },
});

export const saveAnswer = internalMutation({
  args: {
    userMessageId: v.id("conversationMessages"),
    assistantMessageId: v.id("conversationMessages"),
    content: v.string(),
    error: v.optional(v.string()),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userMessage = await ctx.db.get(args.userMessageId);
    if (!userMessage) throw new ConvexError("User message not found");
    const assistantMessage = await ctx.db.get(args.assistantMessageId);
    if (!assistantMessage || assistantMessage.conversationId !== userMessage.conversationId || assistantMessage.role !== "assistant") {
      throw new ConvexError("Assistant message not found");
    }
    if (assistantMessage.status !== "pending") return assistantMessage._id;
    await ctx.db.patch(assistantMessage._id, {
      content: args.content,
      status: args.error ? "failed" : "complete",
      error: args.error,
      updatedAt: args.completedAt,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: userMessage.inventionId,
      eventType: args.error ? "chat_failed" : "chat_answered",
      actorType: "atlas",
      summary: args.error ? "InventSmith chat could not complete." : "InventSmith answered from the complete invention project state.",
      createdAt: args.completedAt,
    });
    return assistantMessage._id;
  },
});
