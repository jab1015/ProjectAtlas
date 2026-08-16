"use node";

import OpenAI from "openai";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";

const getEvidenceExtractionContext = makeFunctionReference<"query", { evidenceSourceId: Id<"evidenceSources"> }, any>("filesInternal:getEvidenceExtractionContext");
const recordEvidenceExtraction = makeFunctionReference<"mutation", { evidenceSourceId: Id<"evidenceSources">; extraction: any; extractedAt: number }, void>("filesInternal:recordEvidenceExtraction");
const recordEvidenceExtractionFailure = makeFunctionReference<"mutation", { evidenceSourceId: Id<"evidenceSources">; error: string; failedAt: number }, void>("filesInternal:recordEvidenceExtractionFailure");

const MAX_AUTOMATED_EXTRACTION_BYTES = 20 * 1024 * 1024;

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    extractionVersion: { type: "integer", enum: [2] },
    mode: { type: "string", enum: ["ai_file"] },
    summary: { type: "string" },
    documentType: { type: "string" },
    methodology: { type: "string" },
    sampleSize: { type: "string" },
    keyFindings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          statement: { type: "string" },
          confidence: { type: "number" },
          basis: { type: "string", enum: ["document_observation", "inventor_statement", "calculation_or_estimate"] },
        },
        required: ["statement", "confidence", "basis"],
      },
    },
    limitations: { type: "array", items: { type: "string" } },
    relevantWorkKinds: { type: "array", items: { type: "string" } },
  },
  required: ["extractionVersion", "mode", "summary", "documentType", "methodology", "sampleSize", "keyFindings", "limitations", "relevantWorkKinds"],
} as const;

function isImageMime(mimeType: string) {
  return /^image\/(png|jpeg|jpg|webp|gif)$/i.test(mimeType);
}

export const extractInventorEvidenceFile = internalAction({
  args: { evidenceSourceId: v.id("evidenceSources") },
  handler: async (ctx, args) => {
    try {
      const context = await ctx.runQuery(getEvidenceExtractionContext, args);
      if (context.fileSize > MAX_AUTOMATED_EXTRACTION_BYTES) {
        throw new Error(`File is larger than the ${MAX_AUTOMATED_EXTRACTION_BYTES / 1024 / 1024} MB automated evidence-extraction limit`);
      }
      const blob = await ctx.storage.get(context.storageId);
      if (!blob) throw new Error("Stored evidence file could not be read");
      const bytes = Buffer.from(await blob.arrayBuffer());
      if (bytes.byteLength > MAX_AUTOMATED_EXTRACTION_BYTES) throw new Error("Stored evidence file exceeds the automated extraction limit");

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not configured for evidence extraction");
      const client = new OpenAI({ apiKey });
      const base64 = bytes.toString("base64");
      const instruction = [
        `Analyze this inventor-provided evidence file for invention project use. Evidence category: ${context.evidenceKind}.`,
        "Extract only information actually supported by the file. Preserve provenance: this remains inventor-provided evidence and is not independently verified merely because you extracted it.",
        "For a survey, capture methodology/sample size when present and summarize meaningful response patterns without inventing representativeness.",
        "For interview notes/transcripts, separate participant statements from the inventor's interpretation.",
        "For prototype evidence, capture observed measurements/failures/results and flag missing test conditions.",
        "For manufacturer quotes, capture supplier, quantities, unit/tooling costs, lead times, assumptions, exclusions, and terms when present.",
        "For patent/legal/professional material, summarize what the document says but do not convert it into a legal conclusion.",
        "Identify which InventSmith work should reconsider this evidence, using work-kind names when possible (for example market_feasibility, preliminary_prior_art, product_requirements, prototype_evidence_assessment, manufacturer_quote_comparison, pricing_evidence, funding_readiness).",
      ].join(" ");

      const content: any[] = [{ type: "input_text", text: instruction }];
      if (isImageMime(context.mimeType)) {
        content.push({ type: "input_image", image_url: `data:${context.mimeType};base64,${base64}`, detail: "high" });
      } else {
        content.push({ type: "input_file", filename: context.fileName, file_data: base64 });
      }

      const response = await client.responses.create({
        model: process.env.ATLAS_OPENAI_MODEL ?? "gpt-5.4-mini",
        max_output_tokens: 5000,
        reasoning: { effort: "low" },
        input: [{ role: "user", content }],
        text: { format: { type: "json_schema", name: "inventsmith_evidence_extraction", strict: true, schema: extractionSchema } },
      });
      const extraction = JSON.parse(response.output_text);
      await ctx.runMutation(recordEvidenceExtraction, { evidenceSourceId: args.evidenceSourceId, extraction, extractedAt: Date.now() });
      return { extracted: true, mode: "ai_file" as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Automated evidence extraction failed";
      await ctx.runMutation(recordEvidenceExtractionFailure, { evidenceSourceId: args.evidenceSourceId, error: message, failedAt: Date.now() });
      return { extracted: false, error: message };
    }
  },
});
