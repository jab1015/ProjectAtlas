import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authHelpers";
import { deleteAccountData } from "./accountDeletion";
import { requiresExternalBillingResolution } from "./accountDeletionPolicy";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    return ctx.db.query("privacyRequests").withIndex("by_userId", (q) => q.eq("userId", userId)).order("desc").collect();
  },
});

export const request = mutation({
  args: { requestType: v.union(v.literal("data_export"), v.literal("account_deletion")) },
  handler: async (ctx, { requestType }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const existing = await ctx.db.query("privacyRequests").withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "pending")).collect();
    const duplicate = existing.find((item) => item.requestType === requestType);
    if (duplicate) return { requestId: duplicate._id, duplicate: true };
    const requestId = await ctx.db.insert("privacyRequests", { userId, requestType, status: "pending", requestedAt: Date.now() });
    return { requestId, duplicate: false };
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [pending, inProgress] = await Promise.all([
      ctx.db.query("privacyRequests").withIndex("by_status", (q) => q.eq("status", "pending")).collect(),
      ctx.db.query("privacyRequests").withIndex("by_status", (q) => q.eq("status", "in_progress")).collect(),
    ]);
    return [...pending, ...inProgress].sort((a, b) => a.requestedAt - b.requestedAt);
  },
});

export const resolve = mutation({
  args: {
    requestId: v.id("privacyRequests"),
    status: v.union(v.literal("in_progress"), v.literal("completed"), v.literal("declined")),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new ConvexError("Privacy request not found");
    const notes = args.resolutionNotes?.trim();
    if ((args.status === "completed" || args.status === "declined") && (!notes || notes.length < 10)) {
      throw new ConvexError("Completion or decline requires auditable resolution notes");
    }
    if (request.requestType === "account_deletion" && args.status === "completed") {
      throw new ConvexError("Account deletion requests must be completed through executeAccountDeletion");
    }
    await ctx.db.patch(request._id, {
      status: args.status,
      resolutionNotes: notes || undefined,
      completedAt: args.status === "completed" || args.status === "declined" ? Date.now() : undefined,
    });
    return { success: true };
  },
});

export const executeAccountDeletion = mutation({
  args: {
    requestId: v.id("privacyRequests"),
    externalBillingResolved: v.boolean(),
    resolutionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new ConvexError("Privacy request not found");
    if (request.requestType !== "account_deletion") throw new ConvexError("Request is not an account deletion request");
    if (request.status === "completed" || request.status === "declined") throw new ConvexError("Privacy request is already terminal");

    const notes = args.resolutionNotes.trim();
    if (notes.length < 10) throw new ConvexError("Deletion requires auditable resolution notes");

    const user = await ctx.db.get(request.userId);
    if (!user) throw new ConvexError("Target user record is missing; investigate before closing the request");
    if (user.role === "admin") throw new ConvexError("Administrator accounts cannot be deleted through the privacy queue");

    const hasPotentialExternalBilling = requiresExternalBillingResolution(
      user.subscriptionTier,
      user.subscriptionStatus,
      user.subscriptionCurrentPeriodEnd,
      Date.now(),
    );

    if (hasPotentialExternalBilling && !args.externalBillingResolved) {
      throw new ConvexError("External billing must be cancelled or otherwise resolved before account deletion");
    }

    await ctx.db.patch(request._id, {
      status: "in_progress",
      resolutionNotes: notes,
      completedAt: undefined,
    });

    const summary = await deleteAccountData(ctx, request.userId);

    await ctx.db.patch(request._id, {
      status: "completed",
      completedAt: Date.now(),
      resolutionNotes: `${notes}\nDeletion summary: ${JSON.stringify(summary)}`,
    });

    return { success: true, summary };
  },
});
