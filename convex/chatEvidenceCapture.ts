import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { applyInventorEvidenceChange } from "./evidenceImpact";
import { chatEvidenceKind, extractChatEvidenceUrls, shouldCaptureChatAsInventorEvidence } from "./chatEvidenceLogic";

export const captureInventorChatEvidence = mutation({
  args: { inventionId: v.id("inventions"), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const invention = await ctx.db.get(args.inventionId);
    if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found or access denied");

    const content = args.content.trim().slice(0, 4000);
    if (!shouldCaptureChatAsInventorEvidence(content)) return { captured: false, reason: "not_material" as const };

    const existing = await ctx.db
      .query("evidenceSources")
      .withIndex("by_inventionId_sourceType", (q) => q.eq("inventionId", args.inventionId).eq("sourceType", "inventor_statement"))
      .order("desc")
      .take(40);
    const duplicate = existing.find((source) => source.metadata?.capturedFrom === "ask_inventsmith" && source.excerpt === content);
    if (duplicate) return { captured: false, reason: "duplicate" as const, sourceId: duplicate._id };

    const now = Date.now();
    const urls = extractChatEvidenceUrls(content);
    const evidenceKind = chatEvidenceKind(content);
    const sourceId = await ctx.db.insert("evidenceSources", {
      inventionId: args.inventionId,
      sourceType: "inventor_statement",
      title: `Ask InventSmith — inventor ${evidenceKind.replaceAll("_", " ")} input`,
      locator: urls[0],
      accessedAt: now,
      excerpt: content,
      reliability: "unverified",
      metadata: {
        provenance: "inventor_upload",
        evidenceOrigin: "chat",
        evidenceKind,
        suppliedUrls: urls,
        independentlyVerified: false,
        capturedFrom: "ask_inventsmith",
      },
      createdAt: now,
    });

    await ctx.db.insert("evidenceFindings", {
      inventionId: args.inventionId,
      statement: content,
      kind: "inventor_statement",
      confidence: 1,
      sourceIds: [sourceId],
      assumptions: [],
      limitations: ["This records what the inventor supplied through Ask InventSmith. The underlying factual or legal/technical claim has not been independently verified."],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("atlasExecutionEvents", {
      inventionId: args.inventionId,
      eventType: "inventor_input_received",
      actorType: "inventor",
      summary: `InventSmith recorded material inventor input from chat as unverified project evidence (${evidenceKind.replaceAll("_", " ")}).`,
      metadata: { sourceId: String(sourceId), evidenceKind, urlCount: urls.length, provenance: "inventor_upload", evidenceOrigin: "chat", capturedFrom: "ask_inventsmith" },
      createdAt: now,
    });

    await applyInventorEvidenceChange(ctx, args.inventionId, {
      action: "uploaded",
      sourceId,
      label: `Ask InventSmith inventor input — ${evidenceKind.replaceAll("_", " ")}`,
      evidenceKind,
      extraction: { mode: "inventor_chat", text: content, urls },
      now,
    });

    return { captured: true, reason: "captured" as const, sourceId };
  },
});
