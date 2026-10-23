import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { contentToReadableText } from "./deliverableLogic";
import { requireInventionReadAccess } from "./organizations";
import {
  csvDataUrl,
  financialModelMarkdownToCsv,
  financialModelMarkdownToSpreadsheetXml,
  competitorResearchMarkdownToSpreadsheetXml,
  spreadsheetXmlDataUrl,
} from "./tabularExportLogic";

export const getCompetitiveResearchExport = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionReadAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    const deliverables = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId)).collect();
    const competitor = deliverables.filter((item) => item.kind === "competitor_landscape").sort((a, b) => b.version - a.version)[0];
    if (!competitor) return null;
    // This is Excel's XML 2003 workbook format, not an OOXML .xlsx package.
    // Keep the extension honest so Excel and browser download handlers select
    // the correct parser.
    return { title: `${invention.title} competitive research.xls`, version: competitor.version, staleReason: competitor.staleReason ?? null, downloadUrl: spreadsheetXmlDataUrl(competitorResearchMarkdownToSpreadsheetXml(contentToReadableText(competitor.content), invention.title)) };
  },
});

export const getInventionArtifactDownloads = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionReadAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");

    const deliverables = await ctx.db
      .query("atlasDeliverables")
      .withIndex("by_inventionId", (q) => q.eq("inventionId", args.inventionId))
      .collect();

    const downloadable = deliverables.filter((item) => Boolean(item.storageId) || item.kind === "financial_model");
    const groups = await Promise.all(
      downloadable.map(async (item) => {
        if (item.kind === "financial_model" && !item.storageId) {
          const markdown = contentToReadableText(item.content);
          const csv = financialModelMarkdownToCsv(markdown, invention.title);
          const workbook = financialModelMarkdownToSpreadsheetXml(markdown, invention.title);
          const common = {
            deliverableId: item._id,
            kind: item.kind,
            artifactMaturity: item.artifactMaturity ?? null,
            version: item.version,
            staleReason: item.staleReason ?? null,
          };
          return [
            {
              ...common,
              title: `${item.title} — CSV`,
              mediaType: "text/csv",
              downloadUrl: csvDataUrl(csv),
            },
            {
              ...common,
              title: `${item.title} — Excel workbook`,
              mediaType: "application/vnd.ms-excel",
              downloadUrl: spreadsheetXmlDataUrl(workbook),
            },
          ];
        }

        return [{
          deliverableId: item._id,
          kind: item.kind,
          title: item.title,
          mediaType: item.mediaType ?? "application/octet-stream",
          artifactMaturity: item.artifactMaturity ?? null,
          version: item.version,
          staleReason: item.staleReason ?? null,
          downloadUrl: item.storageId ? await ctx.storage.getUrl(item.storageId) : null,
        }];
      })
    );
    return groups.flat();
  },
});
