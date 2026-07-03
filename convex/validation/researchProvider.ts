/**
 * Atlas Validation Research Provider
 *
 * Defines the clean interface all research providers must implement.
 * The MockValidationResearchProvider is the Phase 1 implementation.
 * A future AI-backed provider will implement the same interface with no
 * UI or mutation changes required.
 *
 * Constitutional compliance:
 *  - Atlas Owns Execution (Principle 1 / Atlas Automation Constitution)
 *  - Generate Before Requesting (Principle 3)
 *  - Research Before Asking (Principle 4)
 *  - NO hardcoded invention content — all content is derived from InventionContext
 *
 * "use node" is required because MockValidationResearchProvider uses setTimeout,
 * which is not available in Convex's default V8 runtime.
 */
"use node";

// ── Shared types ─────────────────────────────────────────────────────────────

export interface InventionContext {
  /** Title of the invention (from Stage 1) */
  title: string;
  /** Problem the invention solves (from Stage 1) */
  problemStatement: string;
  /** Solution description (from Stage 1 solutionDescription) */
  description: string;
}

export interface ValidationSectionConfidence {
  /** 0.0 – 1.0 */
  score: number;
  level: "very_high" | "high" | "moderate" | "low" | "very_low";
  evidenceSummary: string;
  assumptions: string[];
  missingInformation: string[];
}

export interface ValidationSection {
  /** e.g. "validationPlan", "competitorAnalysis", "marketSizing" */
  sectionId: string;
  title: string;
  /** Generated content (markdown) */
  content: string;
  confidence: ValidationSectionConfidence;
  /** Unix ms */
  generatedAt: number;
  status: "pending" | "generated" | "approved" | "edited";
  /** Founder override */
  editedContent?: string;
  /** Unix ms */
  editedAt?: number;
  /** Unix ms */
  approvedAt?: number;
}

export interface ValidationResearchResult {
  inventionId: string;
  researchRunId: string;
  /** Unix ms */
  triggeredAt: number;
  /** Unix ms */
  completedAt?: number;
  status: "running" | "complete" | "failed";
  sections: ValidationSection[];
  error?: string;
}

// ── Provider interface ───────────────────────────────────────────────────────

export interface ValidationResearchProvider {
  /**
   * Run full validation research for the given invention context.
   * Returns a ValidationResearchResult with all 11 required sections.
   * The inventionId field in the result will be filled by the caller.
   */
  runResearch(
    context: InventionContext,
    inventionId: string,
    researchRunId: string,
    triggeredAt: number
  ): Promise<ValidationResearchResult>;

  /**
   * Re-run research for a single section only.
   * Returns the updated ValidationSection.
   */
  runSingleSection(
    context: InventionContext,
    sectionId: string
  ): Promise<ValidationSection>;
}

// ── Mock confidence helper ───────────────────────────────────────────────────

function moderateConfidence(
  evidenceSummary: string,
  assumptions: string[],
  missingInformation: string[]
): ValidationSectionConfidence {
  return {
    score: 0.55,
    level: "moderate",
    evidenceSummary,
    assumptions,
    missingInformation,
  };
}

// ── Section generators ───────────────────────────────────────────────────────

function buildSection(
  sectionId: string,
  title: string,
  content: string,
  confidence: ValidationSectionConfidence,
  generatedAt: number
): ValidationSection {
  return {
    sectionId,
    title,
    content,
    confidence,
    generatedAt,
    status: "generated",
  };
}

function buildValidationPlan(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Validation Plan — ${ctx.title}

**Objective:** Confirm that a real, monetisable problem exists and that ${ctx.title} is the right solution.

### Background
The core problem being addressed: *"${ctx.problemStatement}"*

Proposed solution summary: *"${ctx.description}"*

### Validation Goals
1. Confirm the problem is felt acutely by the intended audience.
2. Confirm that existing alternatives are insufficient.
3. Measure willingness to pay for ${ctx.title}.
4. Identify the highest-risk assumptions and test them first.

### Top 5 Risk Assumptions (ranked by impact)
1. The target customer experiences this problem frequently enough to seek a solution.
2. Existing solutions do not adequately address the problem.
3. The proposed solution mechanism works as intended.
4. Customers are willing to pay a meaningful price for ${ctx.title}.
5. The market is large enough to support a viable business.

### Recommended Validation Sequence
1. **Discovery interviews** (5–10 subjects) — confirm problem severity.
2. **Competitor audit** — verify no existing solution fully addresses the problem.
3. **Demand test** — landing page or pre-order to measure purchase intent.
4. **Price sensitivity** — 4-question Van Westendorp protocol.

### Minimum Evidence Bar to Advance
- ≥ 7 of 10 interviewees confirm the problem is real and significant.
- No existing solution scores above 6/10 on addressing the problem as stated.
- ≥ 1 pre-order or letter of intent obtained.
`;
  return buildSection(
    "validationPlan",
    "Validation Plan",
    content,
    moderateConfidence(
      "Generated from Stage 1 Idea Brief. Problem context, solution mechanism, and target audience are sourced directly from the invention record.",
      [
        "Target audience is willing to participate in discovery interviews.",
        "Problem frequency is high enough to warrant a commercial product.",
      ],
      [
        "Specific interview subject demographics not yet confirmed.",
        "Competitive pricing benchmarks not yet researched.",
      ]
    ),
    ts
  );
}

function buildCustomerSegments(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Proposed Customer Segments — ${ctx.title}

> **Atlas note:** These are proposed segments derived from the invention context. They should be confirmed or revised by the founder after customer interviews.

### Problem Context
*"${ctx.problemStatement}"*

### Proposed Segment A — Primary Early Adopters
**Profile:** Individuals who experience "${ctx.problemStatement}" most acutely and are motivated to find a better solution.

- Likely behaviour: Active searchers — they have already tried alternatives.
- Motivation: Solve the problem reliably; willing to pay a premium for a working solution.
- Estimated willingness to pay: Medium–high (to be validated via Van Westendorp).
- Channel fit: Direct-to-consumer (DTC), community groups, word of mouth.

### Proposed Segment B — Mainstream Adopters
**Profile:** Broader population who experience the problem but have not yet actively sought a solution.

- Likely behaviour: Passive — will switch when presented with a compelling offer.
- Motivation: Convenience and value; price-sensitive compared to Segment A.
- Channel fit: Retail, Amazon, referral from Segment A buyers.

### Proposed Segment C — Institutional / B2B (if applicable)
**Profile:** Organisations that face the same problem at scale.

- Likely behaviour: Procurement-driven; require proof of efficacy and volume pricing.
- Channel fit: Direct sales, trade shows, distributor relationships.

### Founder Input Required
- Which segment should be targeted first?
- Are there personal relationships with members of any segment?
- Are there budget or geographic constraints that favour one segment?
`;
  return buildSection(
    "customerSegments",
    "Customer Segments (Proposed)",
    content,
    moderateConfidence(
      "Segments inferred from the invention's problem statement and solution description. No primary customer research conducted yet.",
      [
        "Target audience behaves as described in the problem statement.",
        "Institutional demand exists if problem affects organisations.",
      ],
      [
        "Demographic data for each segment not yet sourced.",
        "Willingness-to-pay research not yet conducted.",
        "Segment size estimates require market research (Stage 3).",
      ]
    ),
    ts
  );
}

function buildCompetitorAnalysis(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Competitor Analysis — ${ctx.title}

> **Atlas note:** This is a preliminary competitor framework. A live competitive research sweep (future Research Engine) will populate this with real competitor data. Until then, this section provides the framework for founders to complete manually.

### Problem Being Solved
*"${ctx.problemStatement}"*

### Competitor Research Queries (recommended)
Atlas recommends searching the following to populate this section:
- Google: "${ctx.title} alternative"
- Amazon: keywords from the problem statement
- Google Patents: invention mechanism keywords
- App Store / Play Store (if digital component)

### Competitor Evaluation Framework
For each competitor found, rate on:
| Dimension | Weight |
|---|---|
| How well it solves the problem | 30% |
| Price relative to value delivered | 20% |
| Ease of use / convenience | 20% |
| Distribution / availability | 15% |
| Brand strength | 15% |

### Whitespace Hypothesis
Based on the invention description, ${ctx.title} appears to differentiate by: *"${ctx.description}"*

This implies the primary competitive gap is solving *"${ctx.problemStatement}"* in a way that existing alternatives do not.

### Action Required
Founder should conduct competitor research and return here to document findings before the Go/No-Go decision.
`;
  return buildSection(
    "competitorAnalysis",
    "Competitor Analysis",
    content,
    {
      score: 0.3,
      level: "low",
      evidenceSummary: "Framework generated from invention context. No live competitive research conducted yet. Confidence will increase substantially once competitor research is completed.",
      assumptions: [
        "At least one existing alternative exists in the market.",
        "The competitive differentiation described in the solution holds under scrutiny.",
      ],
      missingInformation: [
        "Specific competitor names and products not yet researched.",
        "Competitor pricing not yet confirmed.",
        "Competitor distribution channels not yet mapped.",
      ],
    },
    ts
  );
}

function buildMarketSizing(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Market Sizing — ${ctx.title}

> **Atlas note:** This is a preliminary market sizing framework. A full market research sweep requires Stage 3. All figures below are illustrative placeholders — the methodology is correct, the numbers must be replaced with researched data.

### Problem Context
*"${ctx.problemStatement}"*

### Market Sizing Methodology: Build from Problem Frequency

**Step 1 — Total Addressable Market (TAM)**
Estimate the total population who experience the problem described in the problem statement.
- TAM = [population experiencing the problem] × [annual spend per person on related solutions]
- Atlas estimated TAM: *Requires Stage 3 market research to populate.*

**Step 2 — Serviceable Addressable Market (SAM)**
Narrow by geography, channel access, and price point fit.
- SAM = TAM × [accessible geography %] × [channel fit %]

**Step 3 — Serviceable Obtainable Market (SOM)**
Realistic 3-year penetration target.
- SOM = SAM × [realistic capture rate — typically 0.5–2% for new products]

### Stated Assumptions
1. Problem frequency is sufficient to represent a commercially viable market.
2. Price point for ${ctx.title} is within reach of the primary customer segment.
3. Geographic focus is the domestic market initially.

### Research Required to Populate
- Industry market size reports for the relevant category.
- Population data for the problem domain.
- Comparable product pricing and sales volume data.
`;
  return buildSection(
    "marketSizing",
    "Market Sizing (Framework + Assumptions)",
    content,
    {
      score: 0.25,
      level: "very_low",
      evidenceSummary: "Methodology framework only. No market data has been researched. Confidence will increase to High once Stage 3 market research is completed.",
      assumptions: [
        "Market size is sufficient to support a viable business.",
        "Domestic market is the initial target.",
      ],
      missingInformation: [
        "Industry TAM figures not yet sourced.",
        "Population data for the problem domain not yet researched.",
        "Comparable product sales data not yet obtained.",
      ],
    },
    ts
  );
}

function buildValidationMethods(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Suggested Validation Methods — ${ctx.title}

Based on the problem *"${ctx.problemStatement}"* and solution *"${ctx.description}"*, Atlas recommends the following validation methods ranked by signal quality and implementation speed.

### Tier 1 — Highest Signal (recommended for ${ctx.title})

**1. Customer Discovery Interviews**
- Signal: Direct evidence of problem severity and solution fit.
- Target: 8–12 subjects from proposed Segment A.
- Duration: 30–45 minutes per interview.
- Key questions: See Interview Questions section.
- Pass criterion: ≥ 70% confirm problem is real and would consider the solution.

**2. Demand Test (Landing Page + Email Capture)**
- Signal: Behavioural intent — stronger than stated intent.
- Implementation: Build a simple landing page describing ${ctx.title}. Drive traffic via personal network and targeted social ads.
- Pass criterion: ≥ 5% email capture rate on ad traffic, or ≥ 20 sign-ups from personal network.

**3. Pre-Order or Letter of Intent**
- Signal: Financial commitment — the strongest validation signal available.
- Implementation: Offer pre-order (even refundable) or collect signed letters of intent from 3+ prospective customers.
- Pass criterion: ≥ 1 confirmed pre-order or signed LOI.

### Tier 2 — Supporting Evidence

**4. Competitor Review Mining**
- Signal: Indirect evidence of market pain points.
- Method: Read 1-star and 2-star reviews of competing products on Amazon, Google, Trustpilot.
- Pass criterion: Problem from ${ctx.title}'s problem statement appears ≥ 3 times in competitor reviews.

**5. Community Forum Research**
- Signal: Organic, unsolicited problem evidence.
- Method: Search Reddit, Quora, niche forums for the problem keywords.
- Pass criterion: ≥ 5 threads discussing the problem with no adequate solution suggested.

### Validation Theater to Avoid
- Surveys with leading questions.
- Interviews with friends and family who have not experienced the problem.
- Positive feedback without a purchase commitment.
`;
  return buildSection(
    "validationMethods",
    "Suggested Validation Methods",
    content,
    moderateConfidence(
      "Validation methods selected based on problem type and solution mechanism described in the invention context.",
      [
        "Founder has access to at least 8–12 members of the target audience for interviews.",
        "Budget available for a minimal landing page and test ad spend.",
      ],
      [
        "Specific audience access channels not yet confirmed.",
        "Ad cost benchmarks for the relevant audience not yet researched.",
      ]
    ),
    ts
  );
}

function buildValidationTimeline(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Validation Timeline — ${ctx.title}

**Total estimated time:** 4–6 weeks for a rigorous validation pass.

### Week 1 — Setup and Preparation
- [ ] Review and approve Atlas's Validation Plan and Interview Question set.
- [ ] Identify 15–20 interview candidates from personal network and target communities.
- [ ] Set up demand-test landing page (can use Carrd, Notion, or simple HTML).
- [ ] Configure email capture (Mailchimp free tier or equivalent).

### Week 2 — Discovery Interviews (Batch 1)
- [ ] Conduct first 5 interviews.
- [ ] Document key findings immediately after each interview.
- [ ] Identify patterns emerging from early interviews.
- [ ] Adjust remaining interview questions if new hypotheses emerge.

### Week 3 — Discovery Interviews (Batch 2) + Competitor Research
- [ ] Conduct final 5–7 interviews.
- [ ] Complete competitor analysis (update the Competitor Analysis section).
- [ ] Run community forum search (Reddit, Quora, niche forums).
- [ ] Compile review mining from competitor products.

### Week 4 — Demand Test + Price Sensitivity
- [ ] Launch demand-test landing page.
- [ ] Share with personal network and 1–2 targeted communities.
- [ ] Run Van Westendorp 4-question price sensitivity survey with 10+ respondents.
- [ ] Monitor email capture rate.

### Week 5 — Analysis and Go/No-Go Preparation
- [ ] Compile interview findings into pattern summary.
- [ ] Evaluate evidence against each of the 5 risk assumptions.
- [ ] Run Atlas's Go/No-Go analysis (complete Validation Report).

### Week 6 — Decision and Stage Advance
- [ ] Review Validation Report with Atlas.
- [ ] Make Go/No-Go decision.
- [ ] If Go: advance to Stage 3 (Market Research).
- [ ] If No-Go: document pivot direction and re-enter Stage 2 with revised concept.
`;
  return buildSection(
    "validationTimeline",
    "Validation Timeline",
    content,
    moderateConfidence(
      "Timeline derived from standard validation best practices applied to the specific invention context.",
      [
        "Founder can dedicate 5–10 hours per week to validation activities.",
        "Interview candidates are accessible within 2 weeks of starting.",
      ],
      [
        "Founder's available time per week not known.",
        "Interview subject availability not confirmed.",
      ]
    ),
    ts
  );
}

function buildSurveyQuestions(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Survey Questions — ${ctx.title}

> These survey questions are designed to test the core assumptions in the Validation Plan. Use for email or in-person surveys with the target audience.

### Section 1 — Problem Confirmation (5 questions)

1. **"In the past 6 months, how often have you experienced [problem from: ${ctx.problemStatement}]?"**
   - Never / Rarely (1–2×) / Sometimes (3–5×) / Frequently (6–10×) / Very frequently (10×+)

2. **"On a scale of 1–10, how significant is this problem in your day-to-day life?"**
   - 1 (minor inconvenience) → 10 (major, recurring problem I actively try to solve)

3. **"What do you currently do to address this problem?"**
   - Open text — captures existing workarounds and competitor usage.

4. **"How satisfied are you with your current solution?"**
   - Very satisfied / Somewhat satisfied / Neutral / Somewhat dissatisfied / Very dissatisfied

5. **"Have you ever searched for a better solution? If yes, what did you find?"**
   - Yes / No — followed by open text.

### Section 2 — Solution Fit (3 questions)

6. **"Describe a product or service that would fully solve this problem for you."**
   - Open text — reveals unaided solution expectations.

7. **"Here is a brief description of ${ctx.title}: *'${ctx.description}'* — Does this sound like it would solve the problem you described?"**
   - Definitely / Probably / Maybe / Probably not / Definitely not

8. **"What, if anything, would make you hesitate to try ${ctx.title}?"**
   - Open text — surfaces objections and barriers.

### Section 3 — Price Sensitivity (Van Westendorp, 4 questions)

9. **"At what price would ${ctx.title} be so inexpensive that you would question its quality?"**
10. **"At what price would ${ctx.title} be a bargain — great value for money?"**
11. **"At what price would ${ctx.title} start to feel expensive, but you would still consider buying?"**
12. **"At what price would ${ctx.title} be so expensive that you would not consider buying it regardless of quality?"**
`;
  return buildSection(
    "surveyQuestions",
    "Survey Questions",
    content,
    moderateConfidence(
      "Survey questions derived from the invention's problem statement, solution description, and standard customer discovery methodology (Van Westendorp).",
      [
        "Survey respondents have personally experienced the problem described.",
        "Questions are comprehensible to the target audience without further explanation.",
      ],
      [
        "Optimal survey distribution channel not yet determined.",
        "Target respondent count for statistical significance not yet set.",
      ]
    ),
    ts
  );
}

function buildLandingPageDraft(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Landing Page Draft — ${ctx.title}

> This is a demand-test landing page. Its purpose is to capture email addresses and measure purchase intent — not to make a final sale. Conversion rate is the validation signal.

---

### HEADLINE (above the fold)
**Finally, a solution to [core problem from: ${ctx.problemStatement}].**

*Subheadline:* Introducing ${ctx.title} — ${ctx.description}.

**[CTA Button]: Join the Waitlist / Get Early Access**

---

### THE PROBLEM (section 2)
**You've experienced this. So have thousands of others.**

[Write 2–3 sentences expanding on: ${ctx.problemStatement}]

Existing solutions haven't fixed this. They [describe gap — to be completed after competitor research].

---

### THE SOLUTION (section 3)
**${ctx.title} changes that.**

[Description of how ${ctx.title} works — derived from: ${ctx.description}]

**Key benefits:**
- [Benefit 1 — derived from the solution mechanism]
- [Benefit 2 — derived from the solution mechanism]
- [Benefit 3 — unique to ${ctx.title}]

---

### SOCIAL PROOF (section 4 — to be added after interviews)
*"[Quote from early interview subject — placeholder]"*
— [Name, Role/Context]

---

### THE ASK (section 5)
**Be among the first to experience ${ctx.title}.**

We're validating demand before production. Join the waitlist and:
- Be notified the moment ${ctx.title} launches.
- Get early-adopter pricing.
- Help shape the product.

**[CTA Button]: Join the Waitlist →**

*No spam. No commitment. Unsubscribe any time.*

---

### FOOTER
© ${ctx.title} | [Contact Email] | [Social Links]

---

### Implementation Notes
- Build using: Carrd (carrd.co), Notion + Super, or plain HTML.
- Embed email capture: Mailchimp or ConvertKit free tier.
- Drive traffic: personal network share + 1 targeted Facebook/Instagram ad ($50–100 test budget).
- Track: email capture rate (goal: ≥ 5% of unique visitors).
`;
  return buildSection(
    "landingPageDraft",
    "Landing Page Draft",
    content,
    moderateConfidence(
      "Draft generated from the invention title, problem statement, and solution description. Headlines and copy angles derived from core invention context.",
      [
        "Problem statement resonates with the target audience when read cold.",
        "Solution mechanism is compelling enough to convert problem-aware visitors.",
      ],
      [
        "Brand voice and visual identity not yet defined (Stage 8).",
        "Social proof quotes not available until interviews are conducted.",
        "Final pricing not yet determined (Stage 10).",
      ]
    ),
    ts
  );
}

function buildInterviewQuestions(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Customer Interview Questions — ${ctx.title}

> These questions are for semi-structured discovery interviews. They are open-ended by design — let the interviewee talk. Your job is to listen, probe, and document.

**Interview duration:** 30–45 minutes
**Target subjects:** 8–12 people who match the primary customer segment

---

### Opening (5 minutes)
*Do NOT mention ${ctx.title} yet. Build context first.*

1. **"Tell me a bit about yourself — what do you do day to day, and what does [relevant context from problem domain] look like for you?"**

2. **"In your daily life, what are the most frustrating recurring problems you deal with?"** *(Listen for the problem to emerge organically — don't lead.)*

---

### Problem Exploration (10–15 minutes)

3. **"Have you ever experienced [problem from: ${ctx.problemStatement}]?"**
   - If yes: "Can you tell me about a specific time that happened? Walk me through it."
   - If no: Thank them and note this as a data point. Do not push.

4. **"How often does this happen?"**

5. **"On a scale of 1–10, how frustrated does this make you? Why that number and not lower?"**

6. **"What have you done to try to fix it?"**

7. **"How well did that work?"**

8. **"How much time or money have you spent trying to solve this?"**

---

### Existing Alternatives (10 minutes)

9. **"What products or services have you tried for this? What did you like about them? What frustrated you?"**

10. **"If a perfect solution existed tomorrow, what would it do differently from what's available today?"**

---

### Solution Fit (10 minutes — introduce ${ctx.title})
*Now describe the concept briefly.*

> "We're developing ${ctx.title} — ${ctx.description}. I'd love your honest reaction."

11. **"What's your first reaction to this?"**

12. **"Does this address the problem you described? Why or why not?"**

13. **"What concerns would you have about using something like this?"**

14. **"Would you use this? Why or why not?"**

15. **"If this existed today and was priced at [test price], would you buy it?"**

---

### Closing (5 minutes)

16. **"Is there anything about this problem that I haven't asked about that you think is important?"**

17. **"Do you know anyone else who experiences this problem who I could speak with?"**

---

### Interviewer Notes (post-interview)
- Problem confirmed? Y / N
- Severity (1–10):
- Current solution satisfaction (1–10):
- Solution fit ("Would use"): Y / N / Maybe
- Purchase intent at test price: Y / N / Maybe
- Key quotes:
- Referrals:
`;
  return buildSection(
    "interviewQuestions",
    "Customer Interview Questions",
    content,
    moderateConfidence(
      "Interview guide derived from the invention context using standard Jobs-to-be-Done and problem discovery interview methodology.",
      [
        "Interviewees have experienced the problem firsthand.",
        "30–45 minutes is sufficient time for a productive interview session.",
      ],
      [
        "Specific audience recruiting channels not yet confirmed.",
        "Compensation approach for interviewees (paid vs. unpaid) not yet decided.",
      ]
    ),
    ts
  );
}

function buildRiskAssessment(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Risk Assessment — ${ctx.title}

### Risk Framework
Each risk is assessed on two dimensions:
- **Likelihood** (1–5): How probable is this risk materialising?
- **Impact** (1–5): How severely would it affect the project if it did?
- **Risk Score** = Likelihood × Impact (max 25)

---

### Risk 1 — Problem is not widespread enough (Score: estimate pending)
**Description:** The problem *"${ctx.problemStatement}"* may affect a small enough segment that the total addressable market is insufficient to support a viable business.
**Mitigation:** Validate problem frequency in discovery interviews. Run market sizing in Stage 3.
**Evidence needed:** ≥ 7 of 10 interviewees confirm frequent problem occurrence.

---

### Risk 2 — Adequate solution already exists (Score: estimate pending)
**Description:** A competing product may already solve this problem well enough that ${ctx.title} cannot differentiate effectively.
**Mitigation:** Complete the Competitor Analysis section with live competitive research.
**Evidence needed:** No existing solution scores above 6/10 on solving the specific problem.

---

### Risk 3 — Solution mechanism does not work as intended (Score: estimate pending)
**Description:** The solution described — *"${ctx.description}"* — may face technical or practical barriers that prevent it from delivering on the problem statement.
**Mitigation:** Prototype and test in Stage 6. IP review in Stage 4.
**Evidence needed:** At least one functional prototype validates the core mechanism.

---

### Risk 4 — Willingness to pay is insufficient (Score: estimate pending)
**Description:** Customers may acknowledge the problem without being willing to pay enough for a solution to build a viable business.
**Mitigation:** Van Westendorp price sensitivity survey. Demand-test landing page.
**Evidence needed:** Acceptable price point (as defined by Van Westendorp) exceeds projected COGS + margin.

---

### Risk 5 — Regulatory or compliance barriers (Score: estimate pending)
**Description:** Depending on the product category, ${ctx.title} may face regulatory requirements that extend time-to-market or increase development costs.
**Mitigation:** Identify applicable regulations in Stage 5. Engage compliance specialist if required.
**Evidence needed:** Stage 5 compliance checklist completed.

---

### Overall Validation-Stage Risk Profile
At this stage, Risks 1 and 2 are the highest priority to address. Both can be substantially mitigated by completing the discovery interviews and competitor analysis before advancing.
`;
  return buildSection(
    "riskAssessment",
    "Risk Assessment",
    content,
    moderateConfidence(
      "Risk framework generated from invention context using standard early-stage startup risk taxonomy.",
      [
        "Primary risks identified are typical for the problem domain described.",
        "No undisclosed constraints (legal, regulatory, health) affect the risk profile.",
      ],
      [
        "Specific likelihood and impact scores require founder input and research findings.",
        "Regulatory environment for the product category not yet assessed.",
        "Technical feasibility of the solution mechanism not yet validated.",
      ]
    ),
    ts
  );
}

function buildRecommendations(ctx: InventionContext, ts: number): ValidationSection {
  const content = `## Atlas Recommendations — ${ctx.title}

### Atlas Assessment (Pre-Interview)
Based on the information collected in Stage 1, ${ctx.title} presents as a concept with a clearly articulated problem and a specific proposed solution mechanism. The following recommendations are designed to maximise the quality of the validation evidence collected before the Go/No-Go decision.

---

### Recommendation 1 — Complete discovery interviews before any other validation activity
**Priority: Critical**

The highest-quality signal available at this stage is direct customer feedback. Before investing time or money in a landing page, prototype, or competitor analysis, conduct 8–12 structured interviews with people who genuinely experience the problem described.

*Why:* Everything else can be built on false premises if the core problem hypothesis is wrong. Interviews are the fastest way to confirm or invalidate it.

---

### Recommendation 2 — Do not mention ${ctx.title} in the first two-thirds of each interview
**Priority: High**

Follow the interview script: explore the problem freely before introducing the solution. Interviewees who are told about the solution first will rationalise their answers to fit it.

*Why:* You want to hear the problem described in the customer's own words. That language is invaluable for positioning, marketing copy, and further development.

---

### Recommendation 3 — Complete the Competitor Analysis before concluding Stage 2
**Priority: High**

The Competitor Analysis section currently has low confidence because no live competitive research has been conducted. Atlas recommends spending 2–3 hours researching competitors before completing the Go/No-Go decision.

*Why:* If a strong existing solution exists, you need to know that now — not after investing further in development.

---

### Recommendation 4 — Use the Van Westendorp 4-question format for price testing
**Priority: Medium**

Rather than asking "How much would you pay for this?", use the Van Westendorp price sensitivity protocol (included in the Survey Questions section). It produces a defensible acceptable price range rather than a single, biased number.

*Why:* Direct price questions produce anchoring bias. Van Westendorp reveals the full range of acceptable prices and the optimal price point.

---

### Recommendation 5 — Set a specific Go/No-Go evidence bar before starting interviews
**Priority: Medium**

Define in advance what constitutes sufficient evidence to advance. Recommended minimum:
- ≥ 7 of 10 interviewees confirm the problem is real and significant (7+ out of 10).
- ≥ 1 confirmed letter of intent or pre-order.
- No existing solution scores above 6/10 on solving the problem as stated.

*Why:* Setting the bar before seeing data prevents motivated reasoning ("this interview went great, let's proceed") from distorting the Go/No-Go decision.

---

### Atlas Go/No-Go Recommendation (preliminary)
**Status: Pending validation evidence**

Atlas cannot make a preliminary Go recommendation without interview and demand-test data. This section will be updated with a specific recommendation once the validation activities are complete and the founder submits findings.
`;
  return buildSection(
    "recommendations",
    "Recommendations",
    content,
    moderateConfidence(
      "Recommendations derived from standard validation best practices applied to the specific invention context. No empirical validation data exists yet.",
      [
        "Founder will conduct the discovery interviews personally (or with a trusted proxy).",
        "Recommendations are prioritised correctly for this type of product.",
      ],
      [
        "Industry-specific validation norms not yet factored in.",
        "Founder's existing network size and access to target audience not known.",
      ]
    ),
    ts
  );
}

// ── Section dispatch ─────────────────────────────────────────────────────────

export function buildSectionById(
  sectionId: string,
  ctx: InventionContext,
  ts: number
): ValidationSection {
  switch (sectionId) {
    case "validationPlan":
      return buildValidationPlan(ctx, ts);
    case "customerSegments":
      return buildCustomerSegments(ctx, ts);
    case "competitorAnalysis":
      return buildCompetitorAnalysis(ctx, ts);
    case "marketSizing":
      return buildMarketSizing(ctx, ts);
    case "validationMethods":
      return buildValidationMethods(ctx, ts);
    case "validationTimeline":
      return buildValidationTimeline(ctx, ts);
    case "surveyQuestions":
      return buildSurveyQuestions(ctx, ts);
    case "landingPageDraft":
      return buildLandingPageDraft(ctx, ts);
    case "interviewQuestions":
      return buildInterviewQuestions(ctx, ts);
    case "riskAssessment":
      return buildRiskAssessment(ctx, ts);
    case "recommendations":
      return buildRecommendations(ctx, ts);
    default:
      throw new Error(`Unknown sectionId: ${sectionId}`);
  }
}

export const ALL_SECTION_IDS = [
  "validationPlan",
  "customerSegments",
  "competitorAnalysis",
  "marketSizing",
  "validationMethods",
  "validationTimeline",
  "surveyQuestions",
  "landingPageDraft",
  "interviewQuestions",
  "riskAssessment",
  "recommendations",
] as const;

// ── Mock provider implementation ─────────────────────────────────────────────

export class MockValidationResearchProvider implements ValidationResearchProvider {
  /**
   * Simulates async research latency, then returns all 11 sections.
   * ALL content is derived from the InventionContext — no hardcoded invention data.
   */
  async runResearch(
    context: InventionContext,
    inventionId: string,
    researchRunId: string,
    triggeredAt: number
  ): Promise<ValidationResearchResult> {
    // Simulate network/research latency (500–1000ms)
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    const now = Date.now();

    const sections: ValidationSection[] = ALL_SECTION_IDS.map((id) =>
      buildSectionById(id, context, now)
    );

    return {
      inventionId,
      researchRunId,
      triggeredAt,
      completedAt: now,
      status: "complete",
      sections,
    };
  }

  /**
   * Re-runs research for a single section.
   */
  async runSingleSection(
    context: InventionContext,
    sectionId: string
  ): Promise<ValidationSection> {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));
    return buildSectionById(sectionId, context, Date.now());
  }
}
