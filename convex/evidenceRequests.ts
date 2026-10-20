import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireInventionEditAccess, requireInventionReadAccess } from "./organizations";
import { applyInventorEvidenceChange } from "./evidenceImpact";
import { readValidationEvidence } from "./validationEvidence";

const DEFAULT_SURVEY = [
  "How often do you use products like this?",
  "What problem or frustration do you experience today?",
  "How valuable would a solution be to you?",
  "What concerns would you have before trying it?",
  "What would make you likely to buy or recommend it?",
];
const DEFAULT_INTERVIEW = [
  "Tell us about the last time you experienced this problem.",
  "How do you solve it today?",
  "What is hardest or most frustrating about your current solution?",
  "What would you change about a possible solution?",
  "Is there anything else we should understand?",
];

function token() {
  return crypto.randomUUID().replaceAll("-", "");
}

export const create = mutation({
  args: { inventionId: v.id("inventions"), kind: v.union(v.literal("survey"), v.literal("interview")), title: v.optional(v.string()), introduction: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { userId } = await requireInventionEditAccess(ctx, args.inventionId);
    const invention = await ctx.db.get(args.inventionId);
    if (!invention) throw new ConvexError("Invention not found");
    const prompts = args.kind === "survey" ? DEFAULT_SURVEY : DEFAULT_INTERVIEW;
    const now = Date.now();
    const id = await ctx.db.insert("evidenceRequests", {
      inventionId: args.inventionId,
      createdByUserId: userId,
      token: token(),
      kind: args.kind,
      title: args.title?.trim() || `${invention.title} ${args.kind}`,
      introduction: args.introduction?.trim() || `Help improve ${invention.title} by sharing your experience. Responses are used as inventor-provided customer evidence and are not independently verified.`,
      questions: prompts.map((prompt, index) => ({ id: `q${index + 1}`, prompt })),
      status: "active",
      responseCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    const request = await ctx.db.get(id);
    return { requestId: id, token: request!.token };
  },
});

/** Create one inventor-shareable survey when a current validation report is at or below 50%. */
export const ensureValidationSurvey = mutation({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, { inventionId }) => {
    const { userId } = await requireInventionEditAccess(ctx, inventionId);
    const invention = await ctx.db.get(inventionId);
    if (!invention) throw new ConvexError("Invention not found");

    const report = await ctx.db.query("validationResearch")
      .withIndex("by_inventionId", q => q.eq("inventionId", inventionId))
      .order("desc")
      .first();
    if (!report || (report.researchStatus !== "completed" && report.status !== "complete")) {
      return { created: false, reason: "validation_not_complete" as const };
    }
    const evidence = await readValidationEvidence(ctx, inventionId);
    if (!report.evidenceFingerprint || report.evidenceFingerprint !== evidence.fingerprint) {
      return { created: false, reason: "validation_needs_refresh" as const };
    }

    let sections: unknown[] = [];
    if (Array.isArray(report.sections)) sections = report.sections;
    else if (report.sections && typeof report.sections === "object") sections = Object.values(report.sections as Record<string, unknown>);
    else if (report.sectionsJson) {
      try {
        const parsed: unknown = JSON.parse(report.sectionsJson);
        sections = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? Object.values(parsed as Record<string, unknown>) : [];
      } catch { sections = []; }
    }
    const complete = sections.filter((section) => {
      if (!section || typeof section !== "object") return false;
      const value = section as Record<string, unknown>;
      return value.sectionStatus === "COMPLETED" || value.status === "generated" || value.status === "completed";
    });
    const scores = complete.map((section) => {
      const value = section as Record<string, unknown>;
      const confidence = value.confidence && typeof value.confidence === "object" ? value.confidence as Record<string, unknown> : {};
      const score = confidence.score;
      return typeof score === "number" && Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : null;
    }).filter((score): score is number => score !== null);
    if (!complete.length || scores.length !== complete.length || scores.reduce((sum, score) => sum + score, 0) / scores.length > 0.5) {
      return { created: false, reason: "confidence_above_threshold" as const };
    }

    const requests = await ctx.db.query("evidenceRequests")
      .withIndex("by_inventionId", q => q.eq("inventionId", inventionId))
      .collect();
    const existing = requests.find(request => request.purpose === "validation_follow_up" && request.status === "active");
    if (existing) return { created: false, requestId: existing._id, token: existing.token };

    const problem = invention.problemStatement?.trim();
    const solution = invention.solutionDescription?.trim();
    const questions = [
      `How often do you experience this problem${problem ? `: ${problem.slice(0, 180)}` : ""}?`,
      "Tell us about the last time this happened. What did you do?",
      "What is frustrating or costly about the way you handle it today?",
      `How useful would a solution like this be${solution ? `: ${solution.slice(0, 180)}` : ""}? What concerns would you have?`,
      "What would make you try, buy, or recommend a solution?",
    ];
    const now = Date.now();
    const id = await ctx.db.insert("evidenceRequests", {
      inventionId,
      createdByUserId: userId,
      token: token(),
      kind: "survey",
      purpose: "validation_follow_up",
      title: `${invention.title} customer follow-up survey`,
      introduction: `InventSmith prepared this short survey because the current validation report needs more customer evidence. Please answer from your own experience. Responses become inventor-provided evidence and are not independently verified.`,
      questions: questions.map((prompt, index) => ({ id: `q${index + 1}`, prompt })),
      status: "active",
      responseCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    const request = await ctx.db.get(id);
    return { created: true, requestId: id, token: request!.token };
  },
});

export const list = query({
  args: { inventionId: v.id("inventions") },
  handler: async (ctx, args) => {
    await requireInventionReadAccess(ctx, args.inventionId);
    return await ctx.db.query("evidenceRequests").withIndex("by_inventionId", q => q.eq("inventionId", args.inventionId)).order("desc").collect();
  },
});

export const getPublic = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const request = await ctx.db.query("evidenceRequests").withIndex("by_token", q => q.eq("token", token)).unique();
    if (!request || request.status !== "active") return null;
    const invention = await ctx.db.get(request.inventionId);
    return { title: request.title, introduction: request.introduction, kind: request.kind, questions: request.questions, inventionTitle: invention?.title ?? "InventSmith project" };
  },
});

export const submit = mutation({
  args: { token: v.string(), answers: v.array(v.object({ questionId: v.string(), answer: v.string() })), respondentName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const request = await ctx.db.query("evidenceRequests").withIndex("by_token", q => q.eq("token", args.token)).unique();
    if (!request || request.status !== "active") throw new ConvexError("This evidence request is closed or unavailable");
    const answers = args.answers.map(answer => ({ questionId: answer.questionId, answer: answer.answer.trim().slice(0, 4000) })).filter(answer => answer.answer);
    if (!answers.length) throw new ConvexError("Please answer at least one question");
    const now = Date.now();
    await ctx.db.insert("evidenceResponses", { requestId: request._id, inventionId: request.inventionId, answers, respondentName: args.respondentName?.trim().slice(0, 120) || undefined, submittedAt: now });
    const sourceId = await ctx.db.insert("evidenceSources", {
      inventionId: request.inventionId,
      sourceType: "inventor_statement",
      title: `${request.title} response`,
      locator: `inventsmith-evidence-request:${request._id}`,
      accessedAt: now,
      excerpt: answers.map(answer => answer.answer).join("\n"),
      reliability: "unverified",
      metadata: { provenance: "inventor_upload", evidenceOrigin: "public_response", evidenceKind: request.kind === "survey" ? "survey" : "interview", requestId: String(request._id), extractionStatus: "completed", extraction: { mode: "public_response", requestId: String(request._id), questions: request.questions, answers, respondentName: args.respondentName?.trim() || undefined }, uploadedAt: now, extractedAt: now },
      createdAt: now,
    });
    await ctx.db.patch(request._id, { responseCount: request.responseCount + 1, updatedAt: now });
    await applyInventorEvidenceChange(ctx, request.inventionId, {
      action: "uploaded", sourceId, label: `${request.title} response`, evidenceKind: request.kind === "survey" ? "survey" : "interview",
      extraction: { mode: "public_response", requestId: String(request._id), answers, respondentName: args.respondentName?.trim() || undefined }, now,
    });
    return { submitted: true };
  },
});
