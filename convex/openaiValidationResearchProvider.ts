/**
 * Atlas Validation Research — OpenAI Provider
 *
 * Implements ValidationResearchProvider using GPT-4o to generate genuine
 * AI-backed research for each validation section.
 *
 * Rules:
 *  - "use node" is REQUIRED here — process.env is only accessible in Node.js
 *    actions, not in Convex's default V8 runtime. Without this directive,
 *    process.env.OPENAI_API_KEY will always be undefined and the provider
 *    will silently fall back to mock.
 *  - Only instantiated when OPENAI_API_KEY is present and client init succeeds.
 *  - Drop-in replacement for MockValidationResearchProvider — same interface.
 *  - If init fails, the caller falls back to MockValidationResearchProvider.
 */
"use node";

import OpenAI from "openai";
import {
  type InventionContext,
  type SectionGenerationResult,
  type ValidationResearchProvider,
  type ValidationSectionKey,
} from "./validationResearchProvider";
import { VALIDATION_SECTION_KEYS } from "./validationResearchTypes";

// ── All 11 supported section keys ─────────────────────────────────────────────

const ALL_SECTIONS: ValidationSectionKey[] = Object.values(
  VALIDATION_SECTION_KEYS
) as ValidationSectionKey[];

// ── Section-specific prompts ──────────────────────────────────────────────────

function buildSectionPrompt(
  ctx: InventionContext,
  sectionKey: ValidationSectionKey
): string {
  const base = `You are Atlas, an AI-powered operating system for inventors that guides users from idea to market.
You are generating a ${sectionKey} section for the inventor's Stage 2 Validation Report.

INVENTION CONTEXT:
- Title: ${ctx.title}
- Problem Statement: ${ctx.problemStatement}
- Invention Description: ${ctx.inventionDescription}${ctx.founderNotes ? `\n- Founder Notes: ${ctx.founderNotes}` : ""}

Write genuinely useful, specific content for the "${sectionKey}" section.
Base your output entirely on the invention context provided above.
Do NOT use generic filler — every sentence must relate to this specific invention.
Format as clean markdown. Be actionable and mentor-like in tone.
Do NOT include phrases like "Mock provider", "Placeholder", or "API key not configured".`;

  switch (sectionKey) {
    case VALIDATION_SECTION_KEYS.VALIDATION_PLAN:
      return `${base}

Generate a detailed Validation Plan (## Validation Plan — ${ctx.title}).
Include: background on the problem, validation goals, top 5 risk assumptions ranked by impact,
recommended validation sequence (interviews → competitor audit → demand test → price sensitivity),
and a minimum evidence bar to advance. Make it specific to this invention.`;

    case VALIDATION_SECTION_KEYS.CUSTOMER_SEGMENTS:
      return `${base}

Generate Proposed Customer Segments (## Proposed Customer Segments — ${ctx.title}).
Include: 3 distinct segments (Primary Early Adopters, Mainstream Adopters, Institutional/B2B if applicable),
their profiles, behaviors, motivations, WTP estimates, and channel fit.
End with founder input questions specific to this invention.`;

    case VALIDATION_SECTION_KEYS.COMPETITOR_ANALYSIS:
      return `${base}

Generate a Competitor Analysis (## Competitor Analysis — ${ctx.title}).
Include: the competitive landscape for this problem domain, likely direct and indirect competitors,
recommended search queries to find competitors, an evaluation framework,
whitespace hypothesis based on this invention's differentiation, and action steps.
Be specific about the market this invention competes in.`;

    case VALIDATION_SECTION_KEYS.MARKET_SIZING:
      return `${base}

Generate a Market Sizing analysis (## Market Sizing — ${ctx.title}).
Include: TAM/SAM/SOM methodology specific to this problem domain,
stated assumptions, and the research required to populate real numbers.
Ground the framework in the specific market implied by the problem statement.`;

    case VALIDATION_SECTION_KEYS.VALIDATION_METHODS:
      return `${base}

Generate Suggested Validation Methods (## Suggested Validation Methods — ${ctx.title}).
Rank by signal quality and implementation speed. Include Tier 1 (highest signal) and Tier 2 methods.
Tailor methods to the specific type of invention described.
Include concrete pass criteria for each method.`;

    case VALIDATION_SECTION_KEYS.TIMELINE:
      return `${base}

Generate a Validation Timeline (## Validation Timeline — ${ctx.title}).
Provide a week-by-week plan (4–6 weeks total) with specific tasks for each week.
Include setup, discovery interviews in batches, competitor research, demand testing,
analysis, and the go/no-go decision. Make tasks specific to this invention.`;

    case VALIDATION_SECTION_KEYS.SURVEY_QUESTIONS:
      return `${base}

Generate Survey Questions (## Survey Questions — ${ctx.title}).
Include 3 sections: Problem Confirmation (5 questions), Solution Fit (3 questions),
and Price Sensitivity using the Van Westendorp 4-question protocol.
Tailor all questions to the specific problem and solution of this invention.`;

    case VALIDATION_SECTION_KEYS.LANDING_PAGE_DRAFT:
      return `${base}

Generate a Landing Page Draft (## Landing Page Draft — ${ctx.title}).
Provide a complete demand-test landing page structure with:
headline, subheadline, problem section, solution section, key benefits, social proof placeholder,
CTA, and implementation notes. Use voice-of-customer language derived from the problem statement.`;

    case VALIDATION_SECTION_KEYS.INTERVIEW_QUESTIONS:
      return `${base}

Generate Customer Interview Questions (## Customer Interview Questions — ${ctx.title}).
Provide a complete semi-structured interview guide with:
opening questions (don't mention the product yet), problem exploration (10–15 min),
existing alternatives exploration, solution fit test (introduce the invention),
and closing. Include post-interview note-taking template.`;

    case VALIDATION_SECTION_KEYS.RISK_ASSESSMENT:
      return `${base}

Generate a Risk Assessment (## Risk Assessment — ${ctx.title}).
Identify 5 key risks specific to this invention (market risk, solution risk, competitive risk,
willingness-to-pay risk, regulatory/timing risk). For each: description, mitigation strategy,
evidence needed to de-risk. Include an overall risk profile assessment.`;

    case VALIDATION_SECTION_KEYS.RECOMMENDATIONS:
      return `${base}

Generate Atlas Recommendations (## Atlas Recommendations — ${ctx.title}).
Provide 5 prioritized, actionable recommendations specific to this invention.
Include priority level (Critical/High/Medium), rationale, and concrete next steps.
End with a preliminary go/no-go status and what evidence is needed to change it.`;

    default:
      return `${base}\n\nGenerate a comprehensive section for "${sectionKey}" specific to this invention.`;
  }
}

// ── Provider implementation ───────────────────────────────────────────────────

export class OpenAIValidationResearchProvider
  implements ValidationResearchProvider
{
  private static readonly VERSION = "openai-gpt4o-mini-1.2.0";
  private static readonly NAME = "OpenAIValidationResearchProvider";
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  getProviderName(): string {
    return OpenAIValidationResearchProvider.NAME;
  }

  getProviderVersion(): string {
    return OpenAIValidationResearchProvider.VERSION;
  }

  getSupportedSections(): ValidationSectionKey[] {
    return [...ALL_SECTIONS];
  }

  async generateSection(
    context: InventionContext,
    sectionKey: ValidationSectionKey
  ): Promise<SectionGenerationResult> {
    const prompt = buildSectionPrompt(context, sectionKey);

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const generatedContent =
      response.choices[0]?.message?.content ??
      `[OpenAI returned empty content for section: ${sectionKey}]`;

    return {
      sectionKey,
      generatedContent,
      confidence: {
        score: 0.75,
        level: "high",
        evidenceSummary:
          "AI-generated analysis based on the invention context provided in Stage 1. Evidence quality improves as founder completes validation activities.",
        assumptions: [
          "The problem statement accurately represents the target market pain.",
          "The invention description reflects the intended solution mechanism.",
        ],
        missingInformation: [
          "Primary customer interview data not yet collected.",
          "Competitor research not yet confirmed with live market data.",
        ],
      },
      evidenceSummary:
        "AI-generated analysis based on the invention context provided in Stage 1.",
      assumptions: [
        "The problem statement accurately represents the target market pain.",
        "The invention description reflects the intended solution mechanism.",
      ],
      missingInformation: [
        "Primary customer interview data not yet collected.",
        "Competitor research not yet confirmed with live market data.",
      ],
      generatedAt: Date.now(),
      providerVersion: OpenAIValidationResearchProvider.VERSION,
    };
  }
}

// ── Provider factory ──────────────────────────────────────────────────────────

/**
 * Attempt to create an OpenAIValidationResearchProvider.
 * Returns null if OPENAI_API_KEY is not set or if client init throws.
 * Logs the real exception so developers can diagnose fallback triggers.
 */
export function tryCreateOpenAIProvider(): OpenAIValidationResearchProvider | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(
      "[ValidationResearch] OPENAI_API_KEY not set — falling back to MockValidationResearchProvider"
    );
    return null;
  }

  try {
    const provider = new OpenAIValidationResearchProvider(apiKey);
    console.log(
      "[ValidationResearch] OpenAIValidationResearchProvider initialised successfully"
    );
    return provider;
  } catch (err) {
    console.error(
      "[ValidationResearch] OpenAIValidationResearchProvider init failed — falling back to MockValidationResearchProvider. Real error:",
      err
    );
    return null;
  }
}
