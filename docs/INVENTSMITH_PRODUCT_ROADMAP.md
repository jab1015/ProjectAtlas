## Verified production deployment and live-test checkpoint — October 23, 2026

- Repository: `jab1015/ProjectAtlas`; active branch: `inventsmith/full-product-build`; current pushed commit: `d3c280ad6bcfc78be4c3f39881a8611671be85bd`.
- Vercel Preview is Ready for that commit: `https://inventsmith-5i0fcjbf1-inventors-os.vercel.app/` (deployment `2tfHe29B8dWKBo5mipN6gbtkr91D`).
- Convex production workflow #29 succeeded for the same commit. Run: `https://github.com/jab1015/ProjectAtlas/actions/runs/39968775894`; job log confirms deployment to `https://agile-seahorse-379.convex.cloud` at 10:21 AM EDT.
- Deployment verification: Convex TypeScript passed; full suite passed 141 files / 752 tests; production function deployment passed. Prior local web TypeScript and ESLint passed.
- Backend health returned HTTP 200 with ready=true, databaseReachable=true, AI configured, and authentication configured. PLATFORM_FULFILLMENT_SECRET and ATLAS_SUBSCRIPTION_WEBHOOK_SECRET are not reported configured; billing/fulfillment acceptance remains open.
- The professional-review status fix is included: a blocked patent-review handoff is excluded from inventor-action counts. The qualified review itself must still be recorded through its dedicated workflow.
- The newest Preview landing and sign-in pages rendered in the interactive browser. This hostname needs a fresh login. Command-line frontend verification timed out on the landing route and did not see app sign-in text in its response, so it is not accepted as authenticated frontend proof.
- Remaining live work: authenticate the newest Preview as administrator; retry the exhausted Rise Jar materials/manufacturing step once and verify bounded recovery, agent identity, saved result and audit history; continue support-agent, department, evidence, survey and export acceptance. App completion has not been declared.
- The current frontend and backend now share a verified deployed commit. No new Vercel deployment was requested during this continuation; documentation changes will be included in the next consolidated GitHub batch.


# InventSmith Product Roadmap

## Cross-stage infrastructure workstream — secure storage for CAD and 3-D artifacts

This is an open platform task that must be completed before Product Design, Prototype, Manufacturing, or the export/package workflow can claim production-ready native CAD. Store large binary artifacts privately; keep metadata, permissions, versions, processing status, checksums, and audit history in the InventSmith data layer.

The planned design is provider-neutral: begin with private Vercel Blob for the Vercel deployment, using client/multipart uploads for large files, while preserving an adapter path to Cloudflare R2 or Amazon S3. Use encryption in transit and at rest, short-lived scoped URLs, strict organization/invention authorization, versioning, retention/lifecycle rules, backup/restore, revocation, and audit logs. Never expose public object URLs or provider credentials.

**Reminder / task:** complete the storage decision, threat model, cost and retention plan, implementation, and large-file security tests soon. The task is complete only when a large CAD package can upload, resume, process, download, version, and be revoked safely.

> **Delivery note (October 21, 2026):** This is the long-range 15-stage product roadmap. InventSmith now has a working Product Design surface and a verified Vercel Preview for the autonomous design-candidate workflow. Authenticated provider-backed execution across every department is still being accepted incrementally. Current verified status lives in `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`, `docs/INVENTSMITH_BUILD_PROGRESS.md`, and `docs/INVENTSMITH_CAPABILITY_MATRIX.md`. Do not treat a visible queue as proof of a saved AI result.

## Current inventor experience checkpoint — October 21, 2026

InventSmith’s Journey Center and Product Design surface now lead with plain-language status and a clear division of responsibility. Stage 5+ inventors arriving from the legacy invention page are sent to the department journey instead of a “coming soon” screen. Patent Readiness hands constraints to Product Design, and Product Design is instructed to generate at least three materially different candidates automatically before asking the inventor to choose. The verified Preview is `inventsmith-badyyve5a-inventors-os.vercel.app`; production promotion is waiting for Vercel’s Hobby deployment quota to reset. Local verification is 131 test files / 712 tests plus TypeScript and diff checks. Live execution of every downstream department still requires saved-output acceptance.
## From Idea to Market — The Complete Inventor Journey

---

## Overview

InventSmith is an operating system for inventors.

Most inventors fail not because their ideas are bad — they fail because the path from idea to market is opaque, nonlinear, and full of decisions that require expertise they don't have. They get stuck. They skip steps. They spend thousands on a patent before they've validated whether anyone wants the product. They design a prototype before they understand who's going to manufacture it. They launch before they've built a market.

InventSmith changes that.

InventSmith provides inventors with a structured, AI-guided journey across 15 stages — from the first spark of an idea to a product growing in the market. Each stage is a defined unit of work with clear inputs, AI-powered guidance, concrete outputs, and a handoff to the next stage. The inventor always knows what to do next. InventSmith always knows where they are.

**The 15-stage journey is defined.** Repository code includes department workspaces, agent identities, routing, and prerequisite gates across the idea-to-market path. A visible route or queued task confirms availability, not successful live execution. Each department still needs provider-backed acceptance and a saved useful result before its operational readiness is claimed.

**Every stage is independently valuable.** A first-time inventor completing Stage 2 (Validation) leaves with a structured analysis of their market opportunity — regardless of whether Stage 5 (Product Design) exists yet. Each stage delivers something real and usable. Each stage also prepares the inventor for what comes next, so the handoff is seamless when the next stage unlocks.

**The engine owns progress.** The inventor focuses on their invention. InventSmith tracks readiness, flags gaps, and drives the journey forward. The backend is the source of truth. Documents accumulate into a living record of the invention — one that grows richer and more valuable with every completed stage.

This document is the master roadmap. It defines what each stage does, why it matters, how InventSmith helps, and what gets produced. It is the north star for product development, engineering prioritization, and the investor narrative.

---

## Stage 1: Idea

### Purpose
Capture the inventor's core concept in a structured, retrievable form that InventSmith can reason about.

### Why This Stage Matters
An idea that lives only in the inventor's head cannot be acted on, evaluated, or refined. The first stage transforms a raw concept — often unformed, sometimes just a frustration or a "what if" — into a structured artifact that InventSmith can use as the foundation for everything that follows. This stage is also the inventor's first experience with InventSmith: it must feel like a conversation with a brilliant collaborator, not a form to fill out. The quality of the Idea Brief directly determines the quality of all downstream guidance.

### Primary Goal
Produce a clear, structured description of the invention that captures the problem it solves, the proposed solution, and the inventor's initial intuition about who it's for.

### Inputs
- The inventor's raw idea (any format: a sentence, a paragraph, a list of notes, a voice memo transcript)
- The problem the inventor has personally experienced or observed
- An initial sense of who has this problem
- Any prior art or competing products the inventor is already aware of
- The inventor's name and any existing invention name or working title

### InventSmith Guidance
- InventSmith opens with an open-ended prompt: "Tell me about your idea." It accepts free-form input without structure requirements.
- AI analysis identifies the core problem statement, the proposed mechanism of the solution, and the target user from the inventor's free-form input.
- InventSmith asks structured follow-up questions to fill gaps: "Who has this problem most acutely?", "What does the current solution look like — and why is it failing?", "What makes your approach different?"
- InventSmith flags internal contradictions (e.g., claiming a mass-market product that requires expert installation) and asks the inventor to resolve them.
- InventSmith scores idea completeness across five dimensions: Problem Clarity, Solution Specificity, Target Audience Definition, Differentiation, and Inventor Conviction. Each dimension gets a 1–5 score with a brief explanation.
- InventSmith will not let an inventor move forward with a vague problem statement — it asks clarifying questions until the problem is grounded in a real scenario.

### Outputs
- **Idea Brief** — a structured 1–2 page document summarizing the invention
- **Idea Completeness Score** — a 0–100 score with dimension breakdowns
- **InventSmith Assessment** — a short qualitative summary of the idea's initial strengths and the biggest open questions going into Validation
- **Recommended Focus Areas** — the top 2–3 questions the inventor should think about before Validation

### Documents Created
- `Idea Brief` — the primary invention record, created at stage completion; all subsequent stages attach to this document
- `Idea Completeness Score` — scored rubric committed to the invention record

### Completion Criteria
- [ ] Problem statement is specific: describes who has the problem, when they have it, and what they currently do about it
- [ ] Proposed solution is described at a mechanism level (not just "an app" but what the app does)
- [ ] At least one target user segment is named
- [ ] Differentiation from the current solution is articulated
- [ ] Idea Completeness Score ≥ 60
- [ ] Inventor has reviewed and confirmed the Idea Brief

### Handoff to Next Stage
The Idea Brief is the primary input to Stage 2 (Validation). The problem statement, proposed solution, and target audience seed the market research questions InventSmith asks during Validation. The InventSmith Assessment's open questions become Validation's research agenda. The Idea Completeness Score baseline is recorded so the inventor can see how their clarity improves across stages.

### Future Integrations
- **Voice input + transcription** (OpenAI Whisper or similar): allow inventors to speak their idea rather than type it
- **Sketch/image upload**: let inventors attach hand-drawn diagrams or reference photos that InventSmith stores with the Idea Brief
- **Semantic similarity search** against existing InventSmith inventions (anonymized): surface whether similar ideas have been worked on and what their Validation outcomes were
- **Inventor mood/confidence calibration**: a brief affective check-in that adjusts InventSmith's tone (more encouraging vs. more challenging) based on where the inventor is

---

## Stage 2: Validation

### Purpose
Determine whether the problem the inventor identified is real, widespread, and worth solving before any further investment.

### Why This Stage Matters
Most failed inventions are solutions to problems that either don't exist at scale or that the target market has already solved satisfactorily. Validation is the cheapest stage in the journey — it costs time and intellectual honesty, not money. Inventors who skip Validation waste months on Patent Readiness, Product Design, and Prototype work only to discover at launch that no one wants their product. InventSmith makes Validation rigorous without making it bureaucratic: the goal is a defensible answer to "is this worth pursuing?" before a dollar is spent on development.

### Primary Goal
Confirm that the problem is real, that the target market experiences it acutely enough to seek a solution, and that the proposed solution concept resonates with that market.

### Inputs
- The Idea Brief from Stage 1 (problem statement, proposed solution, target audience)
- Any customer research the inventor has already done (interviews, surveys, online community observations)
- Competitor products or alternatives the inventor has identified
- Inventor's assumptions about the market (who, how many, how often)

### InventSmith Guidance
- InventSmith converts the Idea Brief into a structured validation research plan: the top 5 assumptions that must be true for the idea to succeed, ranked by risk.
- For each assumption, InventSmith suggests a validation method: customer interview, survey question, market size estimate, competitor analysis, or proxy data lookup.
- InventSmith provides inventor-ready interview question templates tailored to the specific target audience and problem.
- InventSmith guides competitive analysis: prompts the inventor to evaluate 3–5 existing alternatives across dimensions of price, capability, accessibility, and user satisfaction.
- InventSmith calculates a Problem-Market Fit Score based on the validation data the inventor provides: how many people were interviewed, what percentage confirmed the problem, how they currently solve it, and what they'd pay for a better solution.
- InventSmith flags validation theater (e.g., "I asked my friends and they liked it") and requires the inventor to conduct at minimum 5 interviews with strangers who match the target profile.
- InventSmith produces a Validation Summary with a go/no-go recommendation and the reasoning behind it.

### Outputs
- **Validation Report** — structured analysis of all validation activities and findings
- **Problem-Market Fit Score** — 0–100 score assessing the strength of evidence for the problem
- **Assumption Risk Map** — ranked list of validated vs. unvalidated assumptions
- **Competitive Landscape** — a side-by-side analysis of 3–5 existing alternatives
- **Go/No-Go Recommendation** — InventSmith's recommendation on whether to proceed, with reasoning

### Documents Created
- `Validation Report` — the primary deliverable for this stage; includes methodology, findings, and InventSmith's assessment
- `Competitive Landscape` — a structured competitor comparison committed to the invention record
- `Problem-Market Fit Score` — scored rubric with dimension breakdown

### Completion Criteria
- [ ] At least 5 customer interviews completed with people who match the target audience profile (not friends or family without the relevant experience)
- [ ] Problem-Market Fit Score ≥ 55 (or inventor has documented and accepted the risk of proceeding below this threshold)
- [ ] At least 3 competing alternatives have been analyzed
- [ ] Top 3 assumptions have been addressed with evidence
- [ ] Validation Report is finalized and reviewed by the inventor
- [ ] Inventor has made a documented go/no-go decision

### Handoff to Next Stage
The Validation Report's confirmed problem statement and target audience definition become the foundation of Stage 3 (Market Research). The Competitive Landscape carries forward directly — Stage 3 expands it with quantitative market sizing. The Assumption Risk Map's unvalidated assumptions become research questions in Stage 3. The go/no-go decision and its reasoning are committed to the invention record as a milestone.

### Future Integrations
- **Typeform / Tally integration**: generate and deploy a validation survey directly from InventSmith, with results flowing back automatically
- **Interview scheduling via Cal.com**: let inventors schedule validation interviews through InventSmith
- **Reddit/community listening** (Reddit API, Quora scraping): InventSmith surfaces real posts where people describe the problem to corroborate interview findings
- **AI interviewer**: an InventSmith-powered AI that conducts structured validation interviews on the inventor's behalf and summarizes findings
- **Startup databases** (Crunchbase, PitchBook): cross-reference the competitive landscape with funded competitors

---

## Stage 3: Market Research

### Purpose
Quantify the market opportunity: who the customers are, how many of them exist, how much they spend, and how the invention can capture meaningful share.

### Why This Stage Matters
Validation confirms that the problem is real. Market Research answers whether the opportunity is large enough to build a business around. It's the difference between "yes, people have this problem" and "yes, people have this problem, there are 12 million of them in the US alone, they currently spend $800/year on inadequate solutions, and the market is growing at 14% annually." This data becomes essential for patent decisions, pricing strategy, fundraising conversations, and marketing positioning — every downstream stage draws on it.

### Primary Goal
Produce a defensible market sizing analysis with a defined TAM, SAM, and SOM, and a clear customer segment profile.

### Inputs
- Validation Report from Stage 2 (confirmed problem, target audience, competitive landscape)
- Any market research the inventor has already gathered (industry reports, articles, data)
- The inventor's geographic target (US only, North America, global)
- The inventor's initial sense of distribution channel (direct-to-consumer, retail, B2B, etc.)

### InventSmith Guidance
- InventSmith breaks down the market sizing methodology step by step: TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market).
- InventSmith guides the inventor through both top-down sizing (industry reports → drill down) and bottom-up sizing (unit economics → scale up) and reconciles the two estimates.
- InventSmith prompts the inventor to define 2–3 customer segments with profiles: demographic, behavioral, pain intensity, and willingness to pay.
- InventSmith runs a competitive market share analysis: what share do the top 3 competitors hold, and what does that imply about achievable share for a new entrant in years 1–3?
- InventSmith assesses market trends: growing, flat, or declining, and why — prompting the inventor to research and document the tailwinds or headwinds.
- InventSmith generates a Market Research Summary with InventSmith's own assessment of the opportunity quality, rated on size, growth, accessibility, and competitive intensity.

### Outputs
- **Market Research Summary** — comprehensive market analysis document
- **Market Size Model** — TAM/SAM/SOM breakdown with methodology and sources
- **Customer Segment Profiles** — 2–3 detailed segment descriptions with size and willingness-to-pay estimates
- **Market Opportunity Score** — 0–100 score assessing opportunity quality
- **Competitive Intensity Assessment** — how crowded the market is and what that means for entry strategy

### Documents Created
- `Market Research Summary` — the primary deliverable; covers sizing, segments, trends, and InventSmith assessment
- `Market Size Model` — the TAM/SAM/SOM breakdown, preserved as a named document
- `Customer Segment Profiles` — persisted as a reference for Branding, Marketing, and Sales stages

### Completion Criteria
- [ ] TAM is defined with at least one supporting data source
- [ ] SAM and SOM are calculated with documented assumptions
- [ ] At least 2 customer segments are defined with demographic and behavioral profiles
- [ ] Market growth trend is documented (source required)
- [ ] Competitive market share is estimated for top 3 competitors
- [ ] Market Opportunity Score is calculated
- [ ] Market Research Summary is reviewed and confirmed by the inventor

### Handoff to Next Stage
The Market Research Summary's customer profiles and competitive landscape feed directly into Stage 4 (Patent Readiness) as prior art context — the competitive analysis helps identify what's already patented and what whitespace exists. The market sizing data carries forward to Stage 10 (Pricing) and Stage 13 (Funding). Customer Segment Profiles become the foundation for Stage 8 (Branding) and Stage 11 (Marketing).

### Future Integrations
- **IBISWorld / Statista API**: pull live industry report data directly into the market sizing model
- **Google Trends API**: visualize search trend data for the problem or product category
- **US Census Bureau API**: pull demographic data for TAM calculation
- **SimilarWeb**: estimate competitor traffic and digital market share
- **Perplexity/deep research AI**: run an AI-powered market research sweep that synthesizes multiple sources into a draft report for the inventor to review

---

## Stage 4: Patent Readiness

### Purpose
Assess whether the invention has patentable elements, identify prior art, and prepare the inventor for an informed decision about intellectual property protection.

### Why This Stage Matters
Filing a patent prematurely — before understanding the prior art landscape — wastes thousands of dollars and can result in a patent that offers no meaningful protection. Filing too late risks losing priority to a competitor. Most inventors have no framework for making this decision. InventSmith gives them one: a structured prior art search, a patentability assessment, and a clear recommendation on whether and when to engage a patent attorney. This stage does not replace a patent attorney — it makes the inventor's first meeting with one dramatically more productive and efficient.

### Primary Goal
Produce a Patent Readiness Report that tells the inventor whether their invention likely has patentable elements, what the strongest claims would be, and what prior art they need to understand before filing.

### Inputs
- Idea Brief from Stage 1 (the invention's mechanism)
- Market Research from Stage 3 (competitive products — which may represent prior art)
- Any patents or published applications the inventor is already aware of
- The inventor's description of the novel elements they believe differentiate their invention
- The inventor's IP strategy intentions (utility patent, design patent, trade secret, provisional, or none)

### InventSmith Guidance
- InventSmith explains the four requirements for patentability in plain language: novel, non-obvious, useful, and sufficiently described.
- InventSmith guides the inventor through a structured prior art self-search: what keywords to use, how to read a patent abstract, how to evaluate whether a cited patent actually anticipates their claims.
- InventSmith prompts the inventor to articulate their invention's novel elements as claim-like statements: "The invention is a [type] that [does X] by [mechanism Y]."
- InventSmith scores patentability likelihood across three dimensions: Novelty Evidence (based on prior art search results), Non-obviousness Indicators, and Claim Specificity.
- InventSmith produces a prioritized list of prior art references the inventor should review before engaging a patent attorney.
- InventSmith generates a "strongest claim" summary — the most defensible aspect of the invention based on what the inventor has described.
- InventSmith recommends a next action: file provisional immediately, conduct deeper search first, consult attorney, or consider trade secret / first-mover strategy instead.

### Outputs
- **Patent Readiness Report** — comprehensive IP assessment with prior art findings and patentability analysis
- **Patent Readiness Score** — 0–100 score across novelty, non-obviousness, and claim specificity dimensions
- **Prior Art Summary** — list of most relevant patents found during the guided search
- **Strongest Claim Draft** — a plain-language articulation of the most defensible novel elements
- **IP Strategy Recommendation** — InventSmith's recommended next action with reasoning

### Documents Created
- `Patent Readiness Report` — the primary deliverable for this stage
- `Prior Art Summary` — persisted as a reference document for the IP attorney and Stage 9 (Intellectual Property)
- `IP Strategy Recommendation` — documented decision point committed to the invention record

### Completion Criteria
- [ ] At least 5 patent searches conducted using USPTO, Google Patents, or Espacenet
- [ ] Top 3 most relevant prior art references reviewed and summarized
- [ ] Novel elements articulated as at least 3 claim-like statements
- [ ] Patent Readiness Score calculated
- [ ] IP strategy decision documented (proceed to patent, file provisional, defer, or pursue trade secret)
- [ ] Patent Readiness Report reviewed and confirmed by inventor

### Handoff to Next Stage
The Patent Readiness Report's novel elements description feeds directly into Stage 5 (Product Design) as design constraints — the inventor knows which mechanisms to protect and can design around prior art. The IP Strategy Recommendation establishes the timing framework: if a provisional is recommended before design finalization, Stage 9 (IP) becomes a near-term priority. The Prior Art Summary becomes a reference document that Stage 9 builds on with a patent attorney.

### Future Integrations
- **USPTO Patent Full-Text Database API**: automated prior art search directly within InventSmith using structured claim language
- **Google Patents API**: parallel search with semantic similarity matching
- **Espacenet (EPO) API**: international prior art coverage
- **AI patent analysis** (e.g., PatSnap, Lens.org): automated claim mapping to identify how close prior art is to the inventor's claims
- **Patent attorney marketplace integration**: allow inventors to book a consultation directly from the report, with the Patent Readiness Report pre-shared

---

## Stage 5: Product Design

### Purpose
Transform the validated concept into a defined product specification — form, function, materials, and user experience — ready for prototyping.

### Why This Stage Matters
The gap between "I have an idea" and "I have a product" is bridged at this stage. Product Design is where the invention stops being abstract and becomes concrete: what does it look like, how does a user interact with it, what are its physical or digital specifications, and how does every design decision serve the target customer? Inventors who skip structured design work end up with prototypes that need to be rebuilt from scratch, because they discover in physical form that their mental model was wrong. InventSmith guides the inventor through design decisions systematically, surfacing trade-offs before they become expensive mistakes.

### Primary Goal
Produce a Product Design Specification that is detailed enough for a prototyper, industrial designer, or engineering firm to begin work without needing to ask foundational questions.

### Inputs
- Idea Brief (the core mechanism and function)
- Customer Segment Profiles from Stage 3 (who is using this, in what context)
- Patent Readiness Report (novel elements to protect, constraints from prior art)
- The inventor's own sketches, reference images, or inspiration products
- Any constraints the inventor already knows: target price point, materials preferences, size requirements, regulatory environment (FDA, CE, etc.)

### InventSmith Guidance
- InventSmith structures design work into three layers: Functional Specification (what it does), Physical Specification (what it is — dimensions, materials, weight, form factor), and User Experience Specification (how a user interacts with it from first encounter to last use).
- For each layer, InventSmith asks structured questions and presents options rather than open-ended prompts: "Should this product prioritize durability or portability? You can optimize for one, but likely not both at this price point."
- InventSmith surfaces manufacturing implications of design decisions in real time: "Choosing injection-molded ABS plastic implies a minimum order quantity of 1,000 units and tooling costs of $3,000–$8,000. Is this consistent with your scale expectations?"
- InventSmith identifies design decisions that require professional expertise (materials engineering, electrical design, regulatory compliance) and flags them for specialist engagement.
- InventSmith scores design completeness: how much of the specification is defined vs. still open questions.
- InventSmith produces a Design Decision Log — every major design choice and the trade-off it resolved.

### Outputs
- **Product Design Specification** — the primary design document covering function, form, materials, and UX
- **Design Decision Log** — every key decision, the alternatives considered, and why the chosen path was selected
- **Design Completeness Score** — 0–100 score identifying specification gaps
- **Open Design Questions** — a prioritized list of decisions that must be resolved before prototyping
- **Specialist Recommendations** — specific professional roles or firms the inventor should engage based on the design's complexity

### Documents Created
- `Product Design Specification` — the master design document; all subsequent engineering work references this
- `Design Decision Log` — the audit trail of design reasoning
- `Open Design Questions` — the handoff checklist for the prototyper

### Completion Criteria
- [ ] Functional specification is complete: all core functions described with success criteria
- [ ] Physical specification defines form factor, materials, dimensions, and weight target
- [ ] User experience specification covers primary user interactions end-to-end
- [ ] At least one visual reference (sketch, reference photo, or wireframe) is attached
- [ ] Design Completeness Score ≥ 70
- [ ] Open Design Questions list has been reviewed and inventor has decided which to resolve before prototyping vs. during
- [ ] No critical design decisions remain undocumented

### Handoff to Next Stage
The Product Design Specification is the primary input to Stage 6 (Prototype). The prototyper receives a complete specification document without needing to interpret the inventor's intent. The Open Design Questions list becomes the prototyper's discovery agenda — questions to answer in physical form. The materials and manufacturing decisions from this stage feed directly into Stage 7 (Manufacturing) for supplier selection.

### Future Integrations
- **CAD tools integration** (Onshape, Fusion 360 API): allow inventors to attach CAD files directly to the design specification
- **Thingiverse / GrabCAD search**: surface existing open-source component designs that could accelerate prototyping
- **Materials database** (MatWeb, Matweb): query material properties to support informed materials decisions
- **Industrial design firm marketplace**: allow inventors to post their specification and receive quotes from partner design firms
- **AI rendering**: generate visual mockups from the design specification for the inventor to review before prototyping

---

## Stage 6: Prototype

### Purpose
Build and test a physical or digital representation of the product to validate the design before committing to manufacturing tooling and investment.

### Why This Stage Matters
A prototype is the first time the invention exists in the physical world. It exposes design flaws that no amount of specification review can catch: ergonomics that don't work, mechanisms that fail under real use, dimensions that feel wrong in hand. Prototyping is expensive — but it is far cheaper than discovering these problems after $50,000 of tooling has been cut. InventSmith helps inventors plan prototyping efficiently: what type of prototype to build, what to test, how to document findings, and how to decide whether the prototype is good enough to move forward.

### Primary Goal
Produce a tested prototype with documented learnings that either confirms the Product Design Specification or produces a revised specification incorporating what was learned.

### Inputs
- Product Design Specification from Stage 5 (the complete design to prototype)
- Open Design Questions from Stage 5 (the specific questions the prototype must answer)
- The inventor's prototyping resources: skills, equipment access, budget, and timeline
- Any previous prototype attempts and their documented shortcomings

### InventSmith Guidance
- InventSmith helps the inventor choose the right prototype type for this moment: concept prototype (communicates the idea), functional prototype (tests the mechanism), looks-like prototype (tests form and aesthetics), or works-like prototype (tests core engineering).
- InventSmith guides prototype test design: for each Open Design Question from Stage 5, InventSmith defines a test protocol — what to measure, how to measure it, and what result would constitute a pass.
- InventSmith prompts the inventor to identify the single most important thing the prototype must prove, and structures testing around that.
- InventSmith provides a prototype sourcing guide: for each component in the design specification, it suggests prototyping methods (3D printing, laser cutting, CNC, off-the-shelf components, Arduino/Raspberry Pi for electronics).
- After testing, InventSmith guides structured documentation of findings: what worked, what failed, what surprised, and what must change.
- InventSmith produces a Prototype Assessment and a Prototype-to-Spec Gap Analysis.

### Outputs
- **Prototype Plan** — the testing agenda, with specific questions to answer and pass/fail criteria for each
- **Prototype Test Report** — documented results of prototype testing
- **Prototype-to-Spec Gap Analysis** — delta between what the design specified and what the prototype revealed
- **Revised Design Specification** — if the prototype requires design changes, InventSmith helps the inventor update the spec
- **Prototype Readiness Assessment** — InventSmith's judgment on whether the prototype is ready to move to manufacturing scale

### Documents Created
- `Prototype Plan` — the testing plan committed before prototyping begins
- `Prototype Test Report` — the documented findings from testing
- `Revised Product Design Specification` — if applicable; versioned against the original

### Completion Criteria
- [ ] At least one physical or digital prototype has been built
- [ ] All Open Design Questions from Stage 5 have been addressed (answered or formally deferred)
- [ ] Prototype test results are documented with pass/fail outcomes for each test
- [ ] Any design changes required by prototype findings are documented and incorporated
- [ ] Prototype Readiness Assessment is complete
- [ ] Inventor has made a documented decision to proceed to manufacturing

### Handoff to Next Stage
The finalized (post-prototype) Product Design Specification becomes the primary input to Stage 7 (Manufacturing). Manufacturers need a complete, prototype-validated specification to provide accurate quotes. The Prototype Test Report documents the proof of concept — this is the evidence a manufacturer needs to understand what the product must do, not just what it looks like. The materials and component sourcing research from this stage feeds the supplier selection process in Stage 7.

### Future Integrations
- **3D printing services API** (Hubs, Xometry, Shapeways): request quotes for prototype components directly from InventSmith
- **PCB prototyping integration** (PCBWay, OSH Park): for electronic products, design and order prototype boards in-platform
- **Prototype video upload**: allow inventors to attach prototype demonstration videos to the test report
- **Rapid-iteration AI analysis**: upload photos of prototype issues and get AI analysis of likely root cause and design remediation options
- **User testing panel**: recruit target-audience users to test prototypes and submit structured feedback through InventSmith

---

## Stage 7: Manufacturing

### Purpose
Identify and qualify a manufacturing partner, understand production economics, and establish a viable path from prototype to manufactured product.

### Why This Stage Matters
Manufacturing is where most hardware inventors hit a wall. They have a prototype. They know they need to "get it made." But they don't know how to evaluate a manufacturer, what questions to ask, what a realistic cost-per-unit looks like at 500 vs. 5,000 units, or how to structure a manufacturing agreement that protects them. InventSmith demystifies this stage: it gives inventors the vocabulary, the framework, and the documentation to engage manufacturers as informed buyers rather than naive first-timers.

### Primary Goal
Select a qualified manufacturing partner, establish unit economics across at least two production volumes, and have a documented manufacturing plan ready to execute.

### Inputs
- Finalized Product Design Specification (post-prototype)
- Materials and components list from the design specification
- Target unit cost (derived from Stage 10 pricing work, if done in parallel, or inventor's estimate)
- Target production volumes for initial run and scale
- Geographic preferences (domestic vs. overseas manufacturing)
- Any existing manufacturer relationships the inventor has

### InventSmith Guidance
- InventSmith explains the manufacturing decision framework: domestic vs. overseas, contract manufacturer vs. original equipment manufacturer vs. ODM, and the trade-offs across cost, quality control, lead time, IP risk, and minimum order quantities.
- InventSmith builds a Request for Quote (RFQ) document from the design specification — a manufacturer-ready document that includes technical requirements, materials, tolerances, and testing standards.
