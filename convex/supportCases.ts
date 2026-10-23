import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";
import { requireInventionReadAccess } from "./organizations";

const statusValidator = v.union(v.literal("open"), v.literal("investigating"), v.literal("waiting_on_user"), v.literal("resolved"));
const categoryValidator = v.union(v.literal("account"), v.literal("billing"), v.literal("invention"), v.literal("bug"), v.literal("other"));

export const create = mutation({
  args: {
    category: categoryValidator,
    subject: v.string(),
    description: v.string(),
    inventionId: v.optional(v.id("inventions")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in to contact support");
    const user = await ctx.db.get(userId);
    if (!user?.email) throw new ConvexError("A verified account email is required to open a support case");
    const subject = args.subject.trim();
    const description = args.description.trim();
    if (subject.length < 4 || subject.length > 140) throw new ConvexError("Subject must be 4–140 characters");
    if (description.length < 10 || description.length > 5000) throw new ConvexError("Description must be 10–5,000 characters");
    if (args.inventionId) await requireInventionReadAccess(ctx, args.inventionId);
    const now = Date.now();
    return await ctx.db.insert("supportCases", {
      userId,
      email: user.email,
      category: args.category,
      subject,
      description,
      inventionId: args.inventionId,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db.query("supportCases").withIndex("by_userId_createdAt", q => q.eq("userId", userId)).order("desc").take(50);
    return rows.map(({ adminNotes: _private, ...row }) => row);
  },
});

export const listForAdmin = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cases = args.status
      ? await ctx.db.query("supportCases").withIndex("by_status_updatedAt", q => q.eq("status", args.status!)).order("desc").take(200)
      : await ctx.db.query("supportCases").withIndex("by_createdAt").order("desc").take(200);
    const rows = [];
    for (const supportCase of cases) {
      const user = await ctx.db.get(supportCase.userId);
      const invention = supportCase.inventionId ? await ctx.db.get(supportCase.inventionId) : null;
      rows.push({
        ...supportCase,
        reporter: { email: supportCase.email, name: user?.name ?? "" },
        linkedInvention: invention ? { id: invention._id, title: invention.title, currentStageId: invention.currentStageId } : null,
      });
    }
    return rows;
  },
});

export const updateByAdmin = mutation({
  args: { caseId: v.id("supportCases"), status: statusValidator, adminNotes: v.string(), publicMessage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    await requireAdmin(ctx);
    const supportCase = await ctx.db.get(args.caseId);
    if (!supportCase) throw new ConvexError("Support case not found");
    const adminNotes = args.adminNotes.trim();
    if (adminNotes.length > 5000) throw new ConvexError("Internal notes must not exceed 5,000 characters");
    const publicMessage = (args.publicMessage ?? supportCase.publicMessage ?? "").trim();
    if (publicMessage.length > 5000) throw new ConvexError("The message to the inventor must not exceed 5,000 characters");
    if ((args.status === "waiting_on_user" || args.status === "resolved") && !publicMessage) {
      throw new ConvexError("Add a message explaining what the inventor needs to do or how the issue was resolved.");
    }
    const now = Date.now();
    await ctx.db.patch(args.caseId, {
      status: args.status,
      adminNotes,
      publicMessage: publicMessage || undefined,
      updatedAt: now,
      updatedByAdminId: adminUserId as Id<"users">,
      resolvedAt: args.status === "resolved" ? (supportCase.resolvedAt ?? now) : undefined,
    });
    return { updated: true };
  },
});

export async function replyToCaseHandler(ctx: MutationCtx, args: { caseId: Id<"supportCases">; message: string }) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Sign in to reply to support");
  const supportCase = await ctx.db.get(args.caseId);
  if (!supportCase || supportCase.userId !== userId) throw new ConvexError("Support case not found");
  if (supportCase.status !== "waiting_on_user") throw new ConvexError("This case is not waiting for a reply. Check its current status.");
  const message = args.message.trim();
  if (message.length < 1 || message.length > 5000) throw new ConvexError("Enter a reply of up to 5,000 characters");
  const replies = supportCase.customerReplies ?? [];
  if (replies.length >= 20) throw new ConvexError("This case has reached its reply limit. Open a follow-up report so support can continue.");
  const now = Date.now();
  await ctx.db.patch(args.caseId, { status: "investigating", updatedAt: now,
    customerReplies: [...replies, { message, createdAt: now }] });
  return { updated: true };
}

export const replyToCase = mutation({
  args: { caseId: v.id("supportCases"), message: v.string() },
  handler: replyToCaseHandler,
});
