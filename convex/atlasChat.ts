import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { internalMutation, internalQuery, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { canAskChatQuestion, isValidChatContent } from "./chatPolicyLogic";
import { canAskWithinDailyAllowance, utcDateKey } from "./usagePolicyLogic";

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
      throw new ConvexError("Atlas chat's daily allowance has been reached. It resets at 00:00 UTC.");
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
    const recentQuestionTimes = recentMessages
      .filter((message) => message.role === "user")
      .map((message) => message.createdAt);
    if (!canAskChatQuestion(recentQuestionTimes, now)) {
      throw new ConvexError("Atlas chat is limited to five questions per minute. Please wait briefly.");
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
      content: "Atlas is reviewing the invention record…",
      status: "pending",
      createdAt: now + 1,
      updatedAt: now + 1,
    });
    await ctx.db.insert("atlasExecutionEvents", {
      inventionId,
      eventType: "chat_requested",
      actorType: "inventor",
      summary: "The inventor asked Atlas a question.",
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

export const getAnswerContext = internalQuery({
  args: { userMessageId: v.id("conversationMessages") },
  handler: async (ctx, { userMessageId }) => {
    const userMessage = await ctx.db.get(userMessageId);
    if (!userMessage || userMessage.role !== "user") throw new ConvexError("User message not found");
    const [invention, record, deliverables, findings, messages] = await Promise.all([
      ctx.db.get(userMessage.inventionId),
      ctx.db.query("inventionRecords").withIndex("by_inventionId", (q) => q.eq("inventionId", userMessage.inventionId)).unique(),
      ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", userMessage.inventionId)).collect(),
      ctx.db.query("evidenceFindings").withIndex("by_inventionId", (q) => q.eq("inventionId", userMessage.inventionId)).collect(),
      ctx.db.query("conversationMessages").withIndex("by_conversationId", (q) => q.eq("conversationId", userMessage.conversationId)).order("desc").take(30),
    ]);
    if (!invention) throw new ConvexError("Invention not found");
    return {
      userMessage,
      invention,
      record,
      deliverables: deliverables.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8),
      findings: findings.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 30),
      messages: messages.filter((message) => message.status === "complete").sort((a, b) => a.createdAt - b.createdAt).slice(-12),
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
      summary: args.error ? "Atlas chat could not complete." : "Atlas answered from the invention record.",
      createdAt: args.completedAt,
    });
    return assistantMessage._id;
  },
});
