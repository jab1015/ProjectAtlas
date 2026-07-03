/**
 * Atlas Validation Research — Mock Provider
 *
 * Implements ValidationResearchProvider using placeholder content derived
 * entirely from the InventionContext passed in at call time.
 *
 * Rules:
 *  - No hardcoded invention names, product names, or Rise Jars references.
 *  - Every generated string visibly interpolates context fields.
 *  - No external API calls — this is a pure in-process mock.
 *  - Drop-in replaceable by any future provider (OpenAI, Claude, Research Engine)
 *    without changing business logic.
 */

import {
  type InventionContext,
  type SectionGenerationResult,
  type ValidationResearchProvider,
  type ValidationSectionKey,
} from "./validationResearchProvider";

import { VALIDATION_SECTION_KEYS } from "./validationResearchTypes";

// ── All 11 supported section keys ────────────────────────────────────────────

const ALL_SECTIONS: ValidationSectionKey[] = Object.values(
  VALIDATION_SECTION_KEYS
) as ValidationSectionKey[];

// ── Provider implementation ───────────────────────────────────────────────────

export class MockValidationResearchProvider
  implements ValidationResearchProvider
{
  private static readonly VERSION = "mock-1.0.0";
  private static readonly NAME = "MockValidationResearchProvider";

  getProviderName(): string {
    return MockValidationResearchProvider.NAME;
  }

  getProviderVersion(): string {
    return MockValidationResearchProvider.VERSION;
  }

  getSupportedSections(): ValidationSectionKey[] {
    return [...ALL_SECTIONS];
  }

  async generateSection(
    context: InventionContext,
    sectionKey: ValidationSectionKey
  ): Promise<SectionGenerationResult> {
    const content = this.buildContent(context, sectionKey);

    return {
      sectionKey,
      generatedContent: content.generatedContent,
      confidence: {
        score: 0.4,
        level: "low",
        evidenceSummary:
          "Mock provider — placeholder content only. No real evidence gathered.",
        assumptions: content.assumptions,
        missingInformation: content.missingInformation,
      },
      evidenceSummary:
        "Mock provider — placeholder content only. No real evidence gathered.",
      assumptions: content.assumptions,
      missingInformation: content.missingInformation,
      generatedAt: Date.now(),
      providerVersion: MockValidationResearchProvider.VERSION,
    };
  }

  // ── Section content builders ─────────────────────────────────────────────────

  private buildContent(
    ctx: InventionContext,
    sectionKey: ValidationSectionKey
  ): Pick<
    SectionGenerationResult,
    "generatedContent" | "assumptions" | "missingInformation"
  > {
    const notes = ctx.founderNotes ? ` Founder notes: "${ctx.founderNotes}".` : "";

    switch (sectionKey) {
      case VALIDATION_SECTION_KEYS.VALIDATION_PLAN:
        return {
          generatedContent: `Validation plan for "${ctx.title}": The core problem — "${ctx.problemStatement}" — must be confirmed with real users before resources are committed to full development. This plan outlines a structured sequence of experiments to test whether "${ctx.inventionDescription}" solves the stated problem in a way people will pay for.${notes} A mock research plan has been generated as a starting point; replace this with evidence-backed findings from customer discovery.`,
          assumptions: [
            `The problem "${ctx.problemStatement}" is experienced frequently enough to motivate behavior change.`,
            `"${ctx.title}" addresses the problem in a way that is meaningfully different from current alternatives.`,
            "Potential customers can be reached through accessible, low-cost channels.",
          ],
          missingInformation: [
            "Actual customer interview data to confirm problem severity and frequency.",
            "Competitive landscape research to validate differentiation claims.",
          ],
        };

      case VALIDATION_SECTION_KEYS.CUSTOMER_SEGMENTS:
        return {
          generatedContent: `Customer segmentation for "${ctx.title}": The invention addresses "${ctx.problemStatement}". Likely primary segments are early adopters who feel this problem acutely and are actively seeking solutions. Secondary segments may include adjacent users who encounter a variation of the problem described in "${ctx.inventionDescription}".${notes} These segments are hypothetical — confirm them through interviews and behavioral data before committing to targeting strategy.`,
          assumptions: [
            `People who experience "${ctx.problemStatement}" represent a large enough addressable segment to sustain the business.`,
            "Early adopters exist who would trial an early-stage version of this solution.",
          ],
          missingInformation: [
            "Demographic and psychographic data from real customer interviews.",
            "Segment size estimates from industry research or market data.",
          ],
        };

      case VALIDATION_SECTION_KEYS.COMPETITOR_ANALYSIS:
        return {
          generatedContent: `Competitor analysis for "${ctx.title}": Existing solutions that partially address "${ctx.problemStatement}" likely exist in adjacent categories. The invention — "${ctx.inventionDescription}" — must be benchmarked against both direct competitors and the workarounds customers use today.${notes} This is a placeholder analysis; a real competitive review requires systematic market research, product teardowns, and pricing comparisons.`,
          assumptions: [
            `Current solutions to "${ctx.problemStatement}" are inadequate in at least one meaningful dimension.`,
            `"${ctx.title}" can establish a defensible advantage over existing alternatives.`,
          ],
          missingInformation: [
            "A catalogued list of direct and indirect competitors with feature and pricing data.",
            "Customer perception data comparing this invention to current alternatives.",
          ],
        };

      case VALIDATION_SECTION_KEYS.MARKET_SIZING:
        return {
          generatedContent: `Market sizing for "${ctx.title}": To estimate addressable market, we start with the universe of people who experience "${ctx.problemStatement}" and then narrow to those likely to adopt a solution matching "${ctx.inventionDescription}".${notes} TAM, SAM, and SOM estimates are placeholders here — real sizing requires third-party market reports, census or industry data, and validated conversion assumptions.`,
          assumptions: [
            `The problem described — "${ctx.problemStatement}" — affects a market large enough to support a scalable business.`,
            "A reasonable percentage of the affected population would pay for a solution like this one.",
          ],
          missingInformation: [
            "Third-party market sizing data (industry reports, analyst estimates).",
            "Willingness-to-pay data from potential customers.",
          ],
        };

      case VALIDATION_SECTION_KEYS.VALIDATION_METHODS:
        return {
          generatedContent: `Validation methods for "${ctx.title}": To confirm that "${ctx.inventionDescription}" effectively solves "${ctx.problemStatement}", the following methods are recommended as starting points: problem interviews, a landing page smoke test, a concierge MVP, and pre-order or waitlist experiments.${notes} The priority and sequencing of these methods should be adapted based on what is already known and what assumptions carry the most risk.`,
          assumptions: [
            `Problem interviews will surface whether "${ctx.problemStatement}" is a top-of-mind pain for the target segment.`,
            "A lightweight MVP or prototype is sufficient to test core value before a full build.",
          ],
          missingInformation: [
            "Access to a sufficient sample of target customers for early experiments.",
            "Budget and timeline constraints that affect which validation methods are feasible.",
          ],
        };

      case VALIDATION_SECTION_KEYS.TIMELINE:
        return {
          generatedContent: `Validation timeline for "${ctx.title}": A phased approach is recommended. Phase 1 (weeks 1–2): problem discovery interviews to confirm "${ctx.problemStatement}" is real and frequent. Phase 2 (weeks 3–4): solution concept testing for "${ctx.inventionDescription}". Phase 3 (weeks 5–8): lightweight MVP or landing page test to measure demand signal.${notes} This timeline is a placeholder; adjust based on available resources, team capacity, and findings at each phase gate.`,
          assumptions: [
            "The founding team can dedicate sufficient time to customer discovery in parallel with any ongoing development.",
            "Early phases will generate enough signal to make a go/no-go decision before significant capital is deployed.",
          ],
          missingInformation: [
            "Team capacity and availability for customer discovery sprints.",
            "Pre-existing customer relationships or community access that could accelerate recruiting.",
          ],
        };

      case VALIDATION_SECTION_KEYS.SURVEY_QUESTIONS:
        return {
          generatedContent: `Survey questions for "${ctx.title}": The following placeholder questions are designed to test the core assumptions behind "${ctx.inventionDescription}" as a solution to "${ctx.problemStatement}". 1) How often do you experience [the problem]? 2) How do you currently handle it? 3) How satisfied are you with your current approach? 4) What would an ideal solution look like? 5) How much would you pay for a solution that fully resolved this?${notes} Refine these questions after problem interviews to reduce leading language and improve response quality.`,
          assumptions: [
            "Survey respondents represent the actual target customer segment.",
            "Self-reported answers will correlate with real purchasing behavior.",
          ],
          missingInformation: [
            "A validated survey distribution channel that reaches the target segment.",
            "Baseline data on current behavior to anchor survey comparisons.",
          ],
        };

      case VALIDATION_SECTION_KEYS.LANDING_PAGE_DRAFT:
        return {
          generatedContent: `Landing page draft for "${ctx.title}": Headline: Solve [the problem described as "${ctx.problemStatement}"] — finally. Subheadline: "${ctx.title}" is designed to [core mechanism from "${ctx.inventionDescription}"]. Value props: (1) Addresses the root cause, not just symptoms. (2) Built for people who [target segment behavior]. (3) Simple to adopt, fast to see results. Call to action: Join the waitlist / Pre-order now.${notes} This is a structural placeholder — rewrite with voice-of-customer language gathered during interviews.`,
          assumptions: [
            "A landing page with a waitlist CTA will generate a measurable demand signal within a reasonable advertising budget.",
            "The headline framing accurately captures how the target customer describes the problem.",
          ],
          missingInformation: [
            "Voice-of-customer language from interviews to replace placeholder copy.",
            "Visual assets and branding direction to complete the page design.",
          ],
        };

      case VALIDATION_SECTION_KEYS.INTERVIEW_QUESTIONS:
        return {
          generatedContent: `Interview guide for "${ctx.title}": These placeholder questions explore the problem context behind "${ctx.problemStatement}" and gather feedback on the concept described in "${ctx.inventionDescription}". Opening: Tell me about the last time you experienced [the problem]. Discovery: How did you handle it? What did you try? What fell short? Concept test: Here's an early description of what we're building — [show concept]. What's your initial reaction? Closing: Who else should I talk to about this?${notes} Avoid pitching during interviews; focus on listening and probing.`,
          assumptions: [
            "Target customers are willing to participate in 30–45 minute discovery interviews.",
            "Interview findings will generalize across the broader segment.",
          ],
          missingInformation: [
            "A recruiting strategy to reach 10–15 representative target customers quickly.",
            "A screener to filter for people who genuinely experience the stated problem.",
          ],
        };

      case VALIDATION_SECTION_KEYS.RISK_ASSESSMENT:
        return {
          generatedContent: `Risk assessment for "${ctx.title}": Key risks at this stage are: (1) Market risk — the problem "${ctx.problemStatement}" may not be painful enough to motivate purchase. (2) Solution risk — "${ctx.inventionDescription}" may not solve the problem better than existing alternatives. (3) Timing risk — the market may not be ready for this approach. (4) Execution risk — the team may lack the resources to reach target customers at scale.${notes} Each risk should be ranked by likelihood and impact, then assigned a mitigation experiment in the validation plan.`,
          assumptions: [
            "The stated problem is the primary barrier, not an adjacent issue that would require a different solution.",
            "Market timing is favorable and no dominant new entrants are entering the space imminently.",
          ],
          missingInformation: [
            "Competitive intelligence on whether any well-funded players are targeting the same problem.",
            "Regulatory or legal constraints that could affect go-to-market timing.",
          ],
        };

      case VALIDATION_SECTION_KEYS.RECOMMENDATIONS:
        return {
          generatedContent: `Recommendations for "${ctx.title}": Based on the placeholder analysis of "${ctx.inventionDescription}" as a solution to "${ctx.problemStatement}", the top recommended next steps are: (1) Conduct 10 problem discovery interviews with target customers before building anything further. (2) Define the riskiest assumption — likely whether the problem is painful enough to drive behavior change — and design the smallest possible experiment to test it. (3) Set a 60-day validation checkpoint to decide whether to pivot, persevere, or pause.${notes} These recommendations are based on mock data only — update them after real customer discovery and market research.`,
          assumptions: [
            "The founding team will prioritize customer discovery over feature development in the near term.",
            "Early findings from interviews will be documented and used to update the validation plan.",
          ],
          missingInformation: [
            "Results from problem interviews to ground recommendations in real evidence.",
            "A defined success metric for the validation phase (e.g., X% of interviewees confirm problem severity).",
          ],
        };

      default: {
        // Exhaustiveness guard — TypeScript will flag this if a new key is added
        // to ValidationSectionKey without updating this switch.
        const _exhaustive: never = sectionKey;
        throw new Error(
          `MockValidationResearchProvider: unsupported sectionKey "${String(_exhaustive)}"`
        );
      }
    }
  }
}
