import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";

export const getInventionArtifactDownloads = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Authentication required");
    const invention = await ctx.db.get(args.inventionId);
    if (!invention || invention.userId !== userId) throw new ConvexError("Invention not found or access denied");

    const deliverables = await ctx.db
      .query("atlasDeliverables")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId))
      .collect();

    return await Promise.all(
      deliverables
        .filter((item) => Boolean(item.storageId))
        .map(async (item) => ({
          deliverableId: item._id,
          kind: item.kind,
          title: item.title,
          mediaType: item.mediaType ?? "application/octet-stream",
          artifactMaturity: item.artifactMaturity ?? null,
          version: item.version,
          staleReason: item.staleReason ?? null,
          downloadUrl: item.storageId ? await ctx.storage.getUrl(item.storageId) : null,
        }))
    );
  },
});
