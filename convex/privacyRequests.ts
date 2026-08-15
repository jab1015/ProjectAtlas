import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./authHelpers";

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
    await ctx.db.patch(request._id, {
      status: args.status,
      resolutionNotes: notes || undefined,
      completedAt: args.status === "completed" || args.status === "declined" ? Date.now() : undefined,
    });
    return { success: true };
  },
});
