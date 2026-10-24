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
- InventSmith guides the inventor through manufacturer evaluation: what certifications to require, how to read a factory audit report, and what red flags indicate a manufacturer to avoid.
- InventSmith calculates a Unit Economics Model: for the inventor's product specification, InventSmith estimates cost-per-unit at three production volumes (500, 2,000, and 10,000 units) with a breakdown of materials, labor, overhead, tooling amortization, and logistics.
- InventSmith guides contract review: what a manufacturing agreement must include (IP ownership, quality standards, delivery terms, payment terms, defect remediation).
- InventSmith produces a Manufacturing Readiness Assessment.

### Outputs
- **Request for Quote (RFQ) Document** — manufacturer-ready specification for soliciting competitive quotes
- **Unit Economics Model** — cost-per-unit estimates at multiple production volumes with methodology
- **Manufacturer Evaluation Scorecard** — a structured scoring framework for comparing manufacturer bids
- **Manufacturing Plan** — the selected manufacturer, production timeline, initial order quantity, and payment schedule
- **Manufacturing Readiness Assessment** — InventSmith's assessment of readiness to place a production order

### Documents Created
- `Request for Quote (RFQ)` — the manufacturer-facing document
- `Unit Economics Model` — the cost analysis, persisted as a reference for Stage 10 (Pricing)
- `Manufacturing Plan` — the selected path forward

### Completion Criteria
- [ ] RFQ document is complete and manufacturer-ready
- [ ] At least 3 manufacturers have been contacted and at least 2 quotes received
- [ ] Unit Economics Model is complete for at least two production volumes
- [ ] A manufacturing partner has been selected and documented
- [ ] Manufacturing agreement terms have been reviewed against InventSmith's checklist
- [ ] Initial production order quantity is defined
- [ ] Manufacturing Readiness Assessment is complete

### Handoff to Next Stage
The Unit Economics Model from this stage feeds directly into Stage 10 (Pricing) as the primary cost input. The selected manufacturing partner and production timeline feed into Stage 14 (Launch) for logistics planning. The manufacturing agreement review is the first real IP exposure point — findings here are flagged for Stage 9 (IP) to ensure manufacturing IP clauses are appropriate.

### Future Integrations
- **Thomasnet / Maker's Row API**: search domestic manufacturer databases from within InventSmith
- **Alibaba supplier verification API**: cross-reference overseas manufacturers against verified supplier data
- **Xometry / Protolabs API**: instant quoting for CNC, injection molding, and sheet metal within InventSmith
- **Trade show and manufacturer event calendar**: surface relevant manufacturing expos based on product category
- **Freight forwarder integration** (Flexport): generate shipping cost estimates for international manufacturing scenarios

---

## Stage 8: Branding

### Purpose
Define the invention's brand identity — name, voice, visual language, and positioning — so every customer-facing element tells a coherent story.

### Why This Stage Matters
Branding is not a logo exercise. It is the inventor's answer to the question "why should someone trust you and choose your product over everything else available?" A strong brand commands premium pricing, earns word-of-mouth, and survives competitive pressure. A weak brand — or no brand at all — leaves the product competing purely on price against anyone willing to undercut. InventSmith makes branding rigorous: it connects the Customer Segment Profiles from Stage 3 to brand decisions, ensuring every branding choice serves the actual customer rather than the inventor's aesthetic preferences.

### Primary Goal
Produce a Brand Identity System that defines the product's name, positioning statement, voice, visual direction, and core messaging — ready to apply to packaging, marketing, and the sales process.

### Inputs
- Customer Segment Profiles from Stage 3 (who the brand must speak to)
- Competitive Landscape from Stage 2 (what existing brands look and sound like — and the whitespace)
- Product Design Specification from Stage 5 (the product's physical character informs brand aesthetics)
- Inventor's own sense of the brand's personality, values, and the feeling it should create
- Any name candidates the inventor already has in mind

### InventSmith Guidance
- InventSmith leads a brand positioning workshop: structured questions about the target customer's identity, values, and aspirations — and how the product serves those.
- InventSmith guides the inventor through brand archetype selection (Hero, Explorer, Sage, Creator, etc.) and explains what each implies for voice, visual language, and messaging.
- InventSmith evaluates name candidates: syllable count, memorability, trademark search guidance, domain availability check, and connotation analysis.
- InventSmith generates a Brand Positioning Statement using the Geoffrey Moore template: "For [target customer] who [has the problem], [Product Name] is a [category] that [key benefit] unlike [competitor] which [differentiating mechanism]."
- InventSmith builds the Brand Voice Guide: 3–4 defining voice attributes with "sounds like / doesn't sound like" examples.
- InventSmith identifies visual direction keywords and reference aesthetic categories to brief a designer.
- InventSmith verifies brand consistency: does the brand positioning align with the customer segments, competitive landscape, and product design character?

### Outputs
- **Brand Identity System** — the complete brand definition document
- **Brand Positioning Statement** — the primary brand artifact
- **Brand Voice Guide** — defining attributes with examples
- **Name Evaluation Report** — analysis of name candidates with recommendation
- **Visual Direction Brief** — aesthetic keywords and reference categories ready for a designer or design tool
- **Brand Consistency Score** — InventSmith's assessment of how well the brand aligns with the customer and competitive context

### Documents Created
- `Brand Identity System` — the master brand document, referenced by Stage 11 (Marketing) and Stage 12 (Sales)
- `Brand Positioning Statement` — persisted as a standalone reference document
- `Brand Voice Guide` — referenced by all customer-facing content creation

### Completion Criteria
- [ ] Product name is finalized (or finalist shortlist with a defined decision timeline)
- [ ] Trademark search has been conducted on finalist name(s)
- [ ] Brand Positioning Statement is complete and reviewed
- [ ] Brand Voice Guide is defined with at least 3 voice attributes and examples
- [ ] Visual Direction Brief is ready for a designer
- [ ] Brand Identity System is reviewed and confirmed by the inventor
- [ ] Brand Consistency Score is calculated

### Handoff to Next Stage
The Brand Identity System becomes the creative brief for all marketing and sales materials in Stages 11 and 12. The brand name feeds into Stage 9 (IP) for trademark registration. The Visual Direction Brief is the designer briefing document for packaging, website, and collateral. The Brand Positioning Statement becomes the headline for the Stage 11 marketing strategy.

### Future Integrations
- **Trademark search API** (USPTO TESS, TrademarkNow): automated preliminary trademark search for name candidates
- **Domain availability API** (Namecheap, GoDaddy): real-time domain availability check during name evaluation
- **AI visual generation** (Midjourney, DALL-E): generate mood board images from the Visual Direction Brief keywords
- **Brand name generation AI**: suggest name candidates based on positioning attributes, category keywords, and availability constraints
- **Color system tools** (Coolors, Adobe Color): generate brand palette options from the visual direction keywords

---

## Stage 9: Intellectual Property

### Purpose
Secure the intellectual property rights that protect the invention — filing patents, registering trademarks, and structuring trade secrets — with professional legal guidance.

### Why This Stage Matters
The Patent Readiness stage assessed whether the invention *could* be protected. The IP stage is where that protection is actually secured. This is one of the highest-stakes and highest-cost activities in the inventor's journey — a poorly filed patent, or a patent filed too late, can mean the difference between owning a defensible market position and watching a competitor copy your invention legally. InventSmith prepares the inventor to be an informed client, not a passive recipient, when working with IP counsel.

### Primary Goal
File the appropriate IP protections for the invention — provisional or utility patent, trademark, and/or trade secret documentation — with professional legal counsel engaged and InventSmith managing the preparation work.

### Inputs
- Patent Readiness Report from Stage 4 (prior art summary, novel elements, IP strategy recommendation)
- Brand Identity System from Stage 8 (brand name and logo, for trademark registration)
- Product Design Specification (for design patent consideration)
- IP attorney engagement (InventSmith cannot file on behalf of the inventor — attorney engagement is required)
- The inventor's IP budget and timeline

### InventSmith Guidance
- InventSmith builds a structured IP Brief: a document organized specifically for an IP attorney engagement, summarizing the invention, the Prior Art Summary, the novel elements, and the inventor's IP strategy intentions.
- InventSmith explains the differences between provisional patent applications, utility patents, and design patents in plain language — including cost, timeline, and strategic implications of each.
- InventSmith produces an IP Filing Checklist: every task that must be completed before filing, in order, with responsible party (inventor vs. attorney).
- InventSmith guides trademark registration preparation: searches the USPTO TESS database, identifies the appropriate International Classes, and prepares the trademark application information for attorney review.
- InventSmith helps the inventor document trade secrets: what information must remain confidential, how it should be handled, and what NDA templates to use with manufacturers, partners, and employees.
- InventSmith tracks IP filing status and reminds the inventor of key deadlines (provisional → utility conversion window: 12 months).

### Outputs
- **IP Brief** — attorney-ready summary of the invention and IP strategy
- **IP Filing Checklist** — all pre-filing tasks with responsible parties and deadlines
- **Trade Secret Documentation Template** — structured format for documenting confidential information
- **NDA Template** — standard non-disclosure agreement customized to the inventor's situation
- **IP Status Tracker** — a living document tracking all filed and pending IP assets

### Documents Created
- `IP Brief` — the attorney briefing document
- `IP Status Tracker` — the living record of all IP assets, updated as filings progress
- `Trade Secret Log` — documentation of what constitutes protectable confidential information
- `NDA Template` — the standard agreement for use with third parties

### Completion Criteria
- [ ] IP attorney has been engaged
- [ ] IP Brief has been delivered to the attorney
- [ ] At least one IP protection action has been initiated (provisional filed, utility filed, trademark application submitted, or trade secret formally documented)
- [ ] IP Status Tracker reflects current filing status
- [ ] All relevant parties (manufacturers, collaborators) have signed NDAs
- [ ] IP Filing Checklist is complete

### Handoff to Next Stage
The IP Status Tracker becomes a standing reference document for all subsequent stages — every marketing material, packaging, and sales collateral must represent IP status accurately (e.g., "Patent Pending"). The trademark registration status feeds Stage 11 (Marketing) for brand protection guidance. The completed IP Brief and attorney relationship are live assets the inventor will rely on through fundraising (Stage 13) and growth (Stage 15).

### Future Integrations
- **USPTO TESS API**: automated trademark clearance search within InventSmith
- **USPTO Patent Center integration**: track patent application status via official USPTO API
- **IP attorney marketplace**: connect inventors with vetted IP attorneys who have been briefed on the InventSmith IP Brief format
- **Patent monitoring alerts**: automated competitive patent filing alerts for the inventor's technology area
- **International IP filing guidance** (PCT, EPO): guidance on when and whether to pursue international protection

---

## Stage 10: Pricing

### Purpose
Establish a pricing strategy that reflects the product's value, fits the target customer's willingness to pay, and supports a viable business model.

### Why This Stage Matters
Pricing is simultaneously one of the highest-leverage and most underinvested decisions an inventor makes. Most first-time inventors default to cost-plus pricing: add up the unit cost and add a margin. This approach systematically underprices innovative products because it ignores value. A product that saves a customer $500/year in labor costs can command a premium far above its $12 unit manufacturing cost — but only if the inventor has the framework to see and claim that value. InventSmith guides inventors through value-based pricing while keeping the business model viable.

### Primary Goal
Produce a Pricing Strategy with a recommended retail price, unit economics at target volume, gross margin analysis, and a pricing rationale grounded in customer value — not just cost.

### Inputs
- Unit Economics Model from Stage 7 (manufacturing cost per unit at various volumes)
- Customer Segment Profiles from Stage 3 (willingness to pay signals from validation interviews)
- Competitive Landscape from Stage 2 (competitor pricing as market context)
- Market Research Summary from Stage 3 (market positioning context)
- Brand Identity System from Stage 8 (premium vs. accessible positioning)

### InventSmith Guidance
- InventSmith explains three pricing frameworks and helps the inventor apply each: Cost-Plus (floor), Competitive Benchmarking (context), and Value-Based (ceiling).
- InventSmith calculates the value delivered by the invention: in dollars, time, or quality of life — and converts that to a defensible price ceiling.
- InventSmith builds a unit economics cascade: revenue per unit → COGS → gross margin → distributor/retailer margin (if applicable) → net margin.
- InventSmith calculates the break-even point at the proposed price and minimum viable production volume.
- InventSmith models the impact of different price points on revenue, margin, and market penetration speed — presenting the trade-offs visually.
- InventSmith recommends a pricing architecture: single price, tiered pricing, subscription, or freemium — depending on the product category and customer behavior.
- InventSmith produces a Pricing Strategy Document with its recommendation and the reasoning.

### Outputs
- **Pricing Strategy Document** — the complete pricing analysis and recommendation
- **Unit Economics Model (Revenue)** — extending the Stage 7 cost model with revenue and margin
- **Break-Even Analysis** — minimum viable volume and revenue to reach profitability
- **Pricing Scenario Analysis** — sensitivity analysis across 3 price points
- **Pricing Recommendation** — InventSmith's recommended price with rationale

### Documents Created
- `Pricing Strategy Document` — the master pricing document, referenced by Stage 11 (Marketing) and Stage 12 (Sales)
- `Unit Economics Model (Complete)` — the full cost + revenue model; updated as manufacturing quotes sharpen

### Completion Criteria
- [ ] Cost-plus floor price is calculated using Stage 7 unit economics
- [ ] Competitive benchmarking analysis is complete
- [ ] Value-based ceiling is defined with a documented rationale
- [ ] Gross margin at recommended price meets the inventor's stated minimum margin target
- [ ] Break-even analysis is complete
- [ ] Pricing strategy (single price, tiered, subscription) is decided and documented
- [ ] Pricing Strategy Document is reviewed and confirmed by inventor

### Handoff to Next Stage
The Pricing Strategy Document feeds directly into Stage 11 (Marketing) as the foundation for messaging — the value proposition in marketing is directly tied to the value-based pricing rationale. The retail price feeds into Stage 12 (Sales) for channel margin calculations. The complete Unit Economics Model feeds into Stage 13 (Funding) as the financial model foundation.

### Future Integrations
- **Amazon pricing data API**: real-time competitive pricing data for the product category
- **Conjoint analysis tool integration**: allow inventors to run quantitative willingness-to-pay surveys with target customers
- **Financial modeling templates** (Excel/Sheets export): export the unit economics model in a format compatible with investor pitch decks
- **Shopify / e-commerce pricing data**: benchmark pricing for direct-to-consumer categories
- **Price intelligence platforms** (Prisync, Wiser): ongoing competitive price monitoring post-launch

---

## Stage 11: Marketing

### Purpose
Build the go-to-market strategy and core marketing assets that will create awareness, generate demand, and drive trial for the invention.

### Why This Stage Matters
A brilliant invention with no marketing is a secret. Marketing is not about spending money on ads — it is about understanding exactly who the customer is, where they spend their attention, and what message will make them stop and take notice. InventSmith helps inventors build a marketing strategy that is disciplined and specific: not "we'll use social media" but "we will reach [specific segment] through [specific channels] with [specific message] and drive them to [specific action]." This specificity is what separates marketing that works from marketing that exhausts the inventor's budget without results.

### Primary Goal
Produce a Go-to-Market Marketing Plan with defined target segments, channel strategy, core messaging, content strategy, and launch marketing assets — ready to execute at Stage 14 (Launch).

### Inputs
- Customer Segment Profiles from Stage 3 (who to reach)
- Brand Identity System from Stage 8 (how to speak and what to look like)
- Pricing Strategy from Stage 10 (what value to communicate and at what price)
- Competitive Landscape from Stage 2 (what competitors are saying and where they are)
- The inventor's marketing budget and team resources

### InventSmith Guidance
- InventSmith guides channel selection: for each customer segment, it evaluates organic social, paid social, SEO/content, email, influencer, retail placement, PR, and trade shows — and recommends the highest-leverage 2–3 channels given the inventor's budget and audience.
- InventSmith develops the messaging architecture: a master messaging hierarchy with the headline value proposition, 3 supporting proof points, and objection handling for the top 3 customer hesitations.
- InventSmith builds a content strategy: what types of content to create, at what cadence, for which channels, and with what call to action.
- InventSmith creates a pre-launch marketing calendar: working backwards from the launch date, all marketing activities with owners and deadlines.
- InventSmith produces the core marketing asset brief: landing page copy, product description, social media bio, one-line elevator pitch, and email subject line options.
- InventSmith estimates marketing performance benchmarks: expected conversion rates, cost-per-acquisition, and what "good" looks like for each channel.

### Outputs
- **Go-to-Market Marketing Plan** — the complete marketing strategy document
- **Messaging Architecture** — the full messaging hierarchy
- **Channel Strategy** — recommended channels with rationale and budget allocation
- **Content Strategy** — content types, cadence, and calendar
- **Core Marketing Assets Brief** — copy and creative direction for all primary marketing assets
- **Pre-Launch Marketing Calendar** — all activities with owners and dates

### Documents Created
- `Go-to-Market Marketing Plan` — the master marketing document
- `Messaging Architecture` — persisted as the reference for all content creation and agency briefings
- `Pre-Launch Marketing Calendar` — the execution checklist for Stage 14

### Completion Criteria
- [ ] Target segments are confirmed (carried from Stage 3, refined by Stages 8–10)
- [ ] Primary and secondary marketing channels are selected with rationale
- [ ] Messaging Architecture is complete with headline value proposition, 3 proof points, and objection handling
- [ ] Content strategy is defined for at least the first 90 days post-launch
- [ ] Pre-Launch Marketing Calendar is complete with all activities, owners, and dates
- [ ] Core marketing assets have been briefed and at least one (landing page copy) is drafted

### Handoff to Next Stage
The Marketing Plan's pre-launch calendar feeds directly into Stage 14 (Launch) as the launch execution checklist. The Messaging Architecture becomes the sales toolkit brief for Stage 12 (Sales). Channel selections inform Stage 14's launch sequencing. The Core Marketing Assets Brief is the creative brief for designers and copywriters during the lead-up to launch.

### Future Integrations
- **Semrush / Ahrefs API**: keyword research and SEO opportunity analysis integrated into the content strategy
- **Meta Ads Manager / Google Ads API**: audience size estimates and cost-per-click benchmarks for paid channels
- **Mailchimp / Klaviyo integration**: email list building infrastructure set up directly from InventSmith
- **Social listening tools** (Brandwatch, Mention): pre-launch monitoring for the invention's category keywords
- **AI ad creative generation**: draft social media ad variants from the Messaging Architecture for A/B testing

---

## Stage 12: Sales

### Purpose
Define the sales strategy, build the sales toolkit, and establish the channels and processes through which the invention will be sold.

### Why This Stage Matters
Marketing creates awareness and intent. Sales converts intent into revenue. These are distinct disciplines, and most inventors conflate them — they think that if they "get the word out," sales will follow. Sales requires deliberate process: who is responsible for converting customers, through what channel, with what tools, at what conversion rate, and with what follow-up cadence. InventSmith builds the inventor's sales infrastructure before launch so the first week of sales is executed, not improvised.

### Primary Goal
Produce a Sales Strategy with defined distribution channels, a sales process, a complete sales toolkit, and realistic first-year sales projections.

### Inputs
- Pricing Strategy from Stage 10 (retail price, margin, and channel economics)
- Marketing Plan from Stage 11 (channels, messaging, and the leads those channels will generate)
- Customer Segment Profiles from Stage 3 (who is buying and how they make purchase decisions)
- Manufacturing Plan from Stage 7 (available inventory and lead times)
- The inventor's preferred sales channels (D2C, Amazon, retail, B2B direct, distributor)

### InventSmith Guidance
- InventSmith evaluates sales channel options: direct-to-consumer (owned website), marketplace (Amazon, Etsy, specialty), wholesale/retail, B2B direct, and distributor — presenting the margin, control, and effort trade-offs of each.
- InventSmith builds the sales funnel model: from marketing lead to purchase, with conversion rate estimates at each stage and what drives each conversion.
- InventSmith creates the Sales Toolkit: product one-pager, FAQ document, objection handling guide, and comparison sheet vs. top competitors.
- InventSmith calculates first-year sales projections under three scenarios (conservative, base, optimistic) using the sales funnel model, marketing channel reach estimates, and the unit economics model.
- InventSmith designs the post-purchase experience: order confirmation, delivery tracking, onboarding/instructions, and review request sequence — because first customers are the marketing asset for all future customers.
- InventSmith produces a Sales Readiness Assessment.

### Outputs
- **Sales Strategy Document** — channel selection, sales process, and distribution plan
- **Sales Funnel Model** — conversion rate assumptions and revenue projections
- **Sales Toolkit** — product one-pager, FAQ, objection handling guide, competitor comparison sheet
- **First-Year Sales Projections** — three scenarios with assumptions
- **Post-Purchase Experience Plan** — the sequence from order confirmation to review request
- **Sales Readiness Assessment** — InventSmith's evaluation of readiness to launch sales

### Documents Created
- `Sales Strategy Document` — the master sales document
- `Sales Toolkit` — all sales-facing assets collected as a named deliverable
- `First-Year Sales Projections` — the financial forecast, inputs to Stage 13 (Funding)

### Completion Criteria
- [ ] Primary and secondary sales channels are selected with rationale
- [ ] Sales funnel model is built with conversion rate assumptions documented
- [ ] Sales Toolkit is complete: product one-pager, FAQ, and objection handling guide
- [ ] First-Year Sales Projections are complete across three scenarios
- [ ] Post-purchase experience is designed and ready to implement
- [ ] Sales infrastructure (Shopify store, Amazon listing, or equivalent) is set up or has a defined setup timeline
- [ ] Sales Readiness Assessment is complete

### Handoff to Next Stage
The First-Year Sales Projections become the revenue model in Stage 13 (Funding). The Sales Funnel Model's conversion rate assumptions, combined with the Marketing Plan's channel reach estimates, become the financial model inputs for the investor pitch. The Sales Toolkit is a living document — it gets refined in Stage 15 (Growth) as real customer objections emerge.

### Future Integrations
- **Shopify API**: set up a storefront directly from InventSmith with product listing pre-populated from the design specification and messaging architecture
- **Amazon Seller Central integration**: generate an optimized Amazon listing from the messaging architecture and product specification
- **CRM integration** (HubSpot, Pipedrive): set up the sales pipeline structure for B2B or wholesale channel sales
- **Retail buyer database** (RangeMe, Faire): for wholesale distribution, identify and contact retail buyers in the target category
- **Review management platform** (Yotpo, Okendo): set up automated review request sequences at point of sale

---

## Stage 13: Funding

### Purpose
Prepare the inventor to seek external funding — from angels, VCs, crowdfunding, grants, or strategic partners — with a compelling pitch and a defensible financial model.

### Why This Stage Matters
Most inventions require capital to reach commercial scale. The investor pitch is the highest-stakes communication moment in the inventor's journey — it must compress months of work into a 10-slide deck that answers every material question an investor will have. InventSmith prepares the inventor not just with a slide template, but with the underlying analysis that makes each slide defensible: market sizing, financial model, IP status, manufacturing economics, and validated demand. Inventors who reach this stage with InventSmith have already done the work — InventSmith turns it into a pitch.

### Primary Goal
Produce a complete Investor-Ready Package: a pitch deck, a financial model, and a funding strategy that identifies the right sources of capital for this invention at this stage.

### Inputs
- All prior stage documents: Idea Brief, Validation Report, Market Research Summary, Patent Readiness Report, Unit Economics Model, Sales Projections
- The inventor's funding target: how much they need to raise, and what it will be used for
- The inventor's current business structure (sole inventor, LLC, C-corp, or unformed)
- Any existing investors, commitments, or prior rounds
- The inventor's preference for funding type (equity, debt, grant, crowdfunding, strategic)

### InventSmith Guidance
- InventSmith builds the funding strategy: matching the invention's stage, capital needs, and inventor's equity preferences to the appropriate funding sources (grants → angels → seed VCs → crowdfunding → strategic corporate partnerships).
- InventSmith constructs the pitch deck narrative using the Sequoia Capital pitch framework: Company Purpose → Problem → Solution → Why Now → Market → Product → Business Model → Team → Financials → Ask.
- InventSmith populates the financial model from prior stage outputs: revenue projections (Stage 12), unit economics (Stage 7 + 10), market size (Stage 3), and funding use of proceeds.
- InventSmith builds the investor FAQ: the top 20 questions investors ask in a pitch, with InventSmith-drafted answers based on the invention record.
- InventSmith identifies specific grant programs relevant to the invention: SBIR/STTR (if applicable), state and local innovation grants, and industry-specific programs.
- InventSmith produces a Funding Readiness Assessment with a checklist of what is investor-ready and what needs more work.

### Outputs
- **Pitch Deck** — 10–12 slide investor presentation
- **Financial Model** — 3-year projection with revenue, COGS, gross margin, operating expenses, and cash flow
- **Funding Strategy Document** — recommended funding sources, amounts, and sequencing
- **Investor FAQ** — 20 most common investor questions with drafted answers
- **Funding Readiness Assessment** — what is ready and what needs work before investor meetings

### Documents Created
- `Pitch Deck` — the primary investor artifact
- `Financial Model` — the 3-year financial projection
- `Funding Strategy Document` — the fundraising roadmap
- `Investor FAQ` — the due diligence preparation document

### Completion Criteria
- [ ] Pitch deck is complete: all 10–12 slides populated with real data, not placeholders
- [ ] Financial model covers 3 years with revenue, COGS, and cash flow projections
- [ ] Funding target and use of proceeds are defined and defensible
- [ ] At least 5 specific funding sources (investors, grants, or programs) are identified
- [ ] Funding Readiness Assessment is complete
- [ ] Business entity is formed (or decision to form before close is documented)
- [ ] Inventor has conducted at least one pitch practice session with InventSmith feedback

### Handoff to Next Stage
The Funding Strategy and Pitch Deck are live documents — they are refined continuously as the inventor engages investors and receives feedback. Successful funding from this stage provides the capital that activates Stage 14 (Launch) at commercial scale. The financial model feeds Stage 14 as the launch budget framework. The investor FAQ becomes the competitive intelligence document for Stage 14 — what investors asked is what the market is skeptical about.

### Future Integrations
- **SBIR/STTR database API**: automated search for applicable government grant programs based on product category and technology
- **AngelList / Crunchbase API**: identify angels and seed funds active in the invention's category
- **DocSend integration**: track investor pitch deck opens and engagement analytics
- **Cap table management** (Carta, Pulley): set up equity structure and cap table during fundraising preparation
- **Pitch coaching AI**: an AI-powered pitch practice session where the inventor presents and InventSmith plays the skeptical investor

---

## Stage 14: Launch

### Purpose
Execute the commercial launch of the invention — activating all marketing, sales, and operational systems simultaneously and converting pre-launch preparation into initial revenue.

### Why This Stage Matters
Launch is the day the invention meets the market. Every prior stage has been preparation; this stage is execution. A well-executed launch generates initial revenue, captures early reviews, creates momentum, and proves the market thesis. A poorly executed launch squanders the pre-launch investment, burns the marketing budget without results, and leaves the inventor demoralized. InventSmith coordinates the launch: it tracks every pre-launch task, sequences activities correctly, and helps the inventor make real-time decisions when the launch deviates from the plan (because it always does).

### Primary Goal
Execute a coordinated commercial launch that achieves the first-month revenue target, captures the first customer reviews, and establishes the sales and operational baseline for ongoing growth.

### Inputs
- Pre-Launch Marketing Calendar from Stage 11 (all pre-launch tasks and deadlines)
- Sales infrastructure from Stage 12 (storefront, listings, and sales process)
- Manufacturing Plan from Stage 7 (available inventory and reorder lead times)
- Funding from Stage 13 (launch capital)
- All marketing assets (landing page, social profiles, email list, ad creative)
- The launch date

### InventSmith Guidance
- InventSmith builds a Launch Readiness Checklist: every task that must be complete before the launch date, organized by domain (operations, marketing, sales, legal, customer support) with owners and dates.
- InventSmith sequences the launch activities: what happens 30 days out, 14 days out, 7 days out, launch day, and week 1 post-launch.
- InventSmith monitors pre-launch task completion and flags critical path items at risk.
- InventSmith guides the Day 1 launch execution: the specific posts, emails, and outreach to execute on launch day, and in what order.
- InventSmith designs the first-week customer feedback loop: how to collect, organize, and act on early customer feedback in real time.
- InventSmith provides a post-launch review framework: at the end of week 1 and month 1, InventSmith prompts the inventor to review performance against the plan and document what to change.
- InventSmith generates a Launch Performance Report at the end of the launch period.

### Outputs
- **Launch Readiness Checklist** — all pre-launch tasks with owners and dates
- **Launch Day Playbook** — the hour-by-hour execution plan for launch day
- **Week 1 Customer Feedback Summary** — structured synthesis of early customer feedback
- **Launch Performance Report** — actual vs. plan across revenue, traffic, conversion, and customer satisfaction
- **Post-Launch Priority List** — the top 5 things to fix or double down on based on launch data

### Documents Created
- `Launch Readiness Checklist` — the pre-launch task tracker
- `Launch Day Playbook` — the Day 1 execution guide
- `Launch Performance Report` — the documented launch outcome
- `Post-Launch Priority List` — the bridge document that feeds Stage 15 (Growth)

### Completion Criteria
- [ ] Launch Readiness Checklist is 100% complete or all incomplete items have been formally deferred with documented rationale
- [ ] Commercial sales have begun (at least one unit sold)
- [ ] First customer review or feedback has been received and documented
- [ ] Launch Performance Report is complete
- [ ] Post-Launch Priority List is generated
- [ ] Week 1 inventory and reorder status is confirmed against the Manufacturing Plan

### Handoff to Next Stage
The Launch Performance Report's actual vs. plan data becomes the baseline for Stage 15 (Growth). The Post-Launch Priority List is the opening agenda for the first Growth planning session. The Week 1 Customer Feedback Summary becomes the product roadmap input for Stage 15 — what customers are saying about the product in real use is the most valuable signal for what to build, fix, or emphasize next.

### Future Integrations
- **Shopify / WooCommerce webhook integration**: real-time sales data flowing into InventSmith's launch dashboard
- **Google Analytics 4 integration**: traffic and conversion data alongside sales data in the launch view
- **Amazon Seller Central API**: for Amazon-channel launches, sales rank and review monitoring
- **Launch PR distribution** (PR Newswire, Cision): distribute a press release on launch day from within InventSmith
- **Customer review monitoring** (Trustpilot, Yotpo API): aggregate early reviews across platforms into the Customer Feedback Summary

---

## Stage 15: Growth

### Purpose
Optimize the business post-launch — expanding revenue, improving unit economics, retaining customers, and building the systems to scale.

### Why This Stage Matters
Getting to market is the beginning, not the end. The first 90 days of sales produce the most valuable data the inventor has ever had: real customers, real usage, real feedback, and real unit economics. Growth is the stage where that data becomes strategy. Most inventors treat the period after launch as "keep doing what you're doing" — InventSmith treats it as a new planning cycle, with real data replacing assumptions, and growth levers prioritized by evidence rather than instinct.

### Primary Goal
Establish a data-driven growth engine that systematically improves the business across revenue, retention, and operations — turning the first launch into a sustainable, growing business.

### Inputs
- Launch Performance Report from Stage 14 (actual revenue, traffic, conversion, and customer feedback)
- Post-Launch Priority List from Stage 14 (the top 5 things to address)
- Unit Economics Model (updated with real manufacturing costs and actual margins)
- Customer reviews and feedback (from all channels)
- The inventor's growth goals: revenue target, customer count, geographic expansion, new SKUs

### InventSmith Guidance
- InventSmith runs a 90-Day Growth Audit: reviewing actual performance vs. the plan across revenue, COGS, gross margin, customer acquisition cost, lifetime value, churn rate, and NPS.
- InventSmith identifies the top 3 growth levers with the highest expected return on effort — prioritizing retention, conversion improvement, or acquisition based on where the biggest gaps are.
- InventSmith builds a Growth Roadmap: a 90-day plan with specific initiatives, owners, success metrics, and review dates.
- InventSmith guides product iteration decisions: customer feedback synthesis, feature/fix prioritization, and how to decide between "keep selling this product" vs. "iterate the product before scaling."
- InventSmith builds a retention system: post-purchase email sequences, loyalty or referral programs, and review-to-repeat-purchase pathways.
- InventSmith guides channel expansion: when to add a second marketing channel, when to move into retail, when to pursue international markets.
- InventSmith produces a monthly Growth Performance Report: actual vs. targets, trend analysis, and the updated priority list for the next month.

### Outputs
- **90-Day Growth Audit** — the deep diagnostic of actual business performance
- **Growth Roadmap** — the 90-day plan with initiatives, metrics, and review dates
- **Growth Levers Analysis** — the top 3 prioritized growth opportunities with expected impact
- **Monthly Growth Performance Report** — the ongoing performance tracking artifact
- **Updated Unit Economics Model** — reflecting real margins, CAC, and LTV from actual data

### Documents Created
- `90-Day Growth Audit` — the post-launch baseline
- `Growth Roadmap` — the iterative growth plan; updated each month
- `Monthly Growth Performance Report` — a living document series; one report per month

### Completion Criteria
Growth is the final stage — and the only stage without a terminal completion event. Growth is an ongoing practice. InventSmith marks this stage as "Active" once the 90-Day Growth Audit is complete and the first Growth Roadmap is established. The stage remains active as long as the invention is in the market. Milestones within Growth are:
- [ ] 90-Day Growth Audit complete
- [ ] Growth Roadmap established for the first 90 days
- [ ] At least one growth initiative implemented and measured
- [ ] Monthly reporting cadence established
- [ ] Customer LTV:CAC ratio is calculated and tracked

### Handoff to Next Stage
Growth is the final stage of the InventSmith journey. There is no handoff — there is iteration. The Monthly Growth Performance Reports become the operating cadence for the business. When an inventor reaches this stage with a growing business, InventSmith has fulfilled its mission: the inventor went from an idea to a market-validated, revenue-generating product with the documentation, IP, and systems to sustain and grow it.

### Future Integrations
- **Google Analytics 4 + Shopify**: unified revenue and traffic dashboard with automated anomaly detection
- **Email platform integration** (Klaviyo, Mailchimp): retention email performance data flowing into the Growth Performance Report
- **Review aggregation** (Trustpilot, Bazaarvoice): multi-channel review sentiment analysis
- **Financial accounting integration** (QuickBooks, Xero): actual P&L data replacing model projections in the unit economics model
- **International market expansion tools** (Stripe InventSmith, AWS regions): guidance and setup for geographic expansion
- **New SKU planning**: InventSmith's Stage 1–5 workflow applied to product line extensions, seeded with the learnings from the original invention's Growth stage data

---

## Product Principles

- One clear next action.
- Reduce uncertainty.
- Reduce cognitive load.
- Engine Owns Progress.
- Backend is the source of truth.
- Every stage produces tangible value.
- Every stage leaves the inventor better prepared than before.
- InventSmith should always answer one question:
  "What should I do next?"

### October 20, 2026 — authenticated PR #24 Preview acceptance

Netlify Deploy Preview `6ad6c9cbe5ef4c10168cd3e8` for head `9d4a5c2` built successfully (`npx next build`, 36/36 pages; no Convex CLI) and was checked in the inventor’s signed-in session. Validation now shows **complete, 11/11 sections, current evidence, 45% evidence-support confidence**, credits the uploaded `Data_All_260313` survey and its extracted findings, and clearly labels it inventor-provided/unverified with limits on demand, market size, and performance claims. Because confidence is at or below 50%, the page prepared an active follow-up survey link and a plain next step to share it with five people. The public respondent page loaded all five questions and the provenance/privacy note; no response was submitted.

Journey Center and the Validation page had conflicting next-step copy: Journey Center said “Continue Validation” while Validation offered the prepared survey. A local change now detects the active `[Validation follow-up]` survey and changes Journey Center’s next action to “Share your prepared survey with five people who may have this problem, then add their answers as evidence.” Focused regression tests (4), web and Convex TypeScript checks, and `git diff --check` pass. This small alignment change is not yet in the tested Preview; its PR update and Preview acceptance remain pending.

The journey view also shows 1/15 stages done, Validation 0/2 tasks, Market Research needing a retry, and no saved results in the later stages. Agent profiles and routing are implemented and covered by tests, but live successful work/save/handoff has not been verified in each department. Treat full department deployment as incomplete until controlled acceptance proves outputs and evidence links per department. The survey is prepared but not distributed; no external messages, respondent data, AI generation, production publish, or PR merge occurred.

### October 20, 2026 — Journey Center Preview compatibility correction

Authenticated retest of Preview `6ad6cb3025118d39094ac8cf` confirmed the survey link remains available, but Journey Center still displayed “Continue Validation.” The deployment builds the website only; it does not deploy Convex functions, so the server-side wording adjustment was not live. The correction now reads the existing, already-working `evidenceRequests:list` query in the Journey Center page and displays the survey-sharing instruction when an active `[Validation follow-up]` exists. The unsupported Convex query change was removed. Focused regression coverage must be rerun, and this UI-only fix still needs a pushed commit and its own authenticated Preview check. No Convex or production deployment was made.

### October 20, 2026 — final authenticated Preview result

Netlify Preview `6ad6cc30d1357a83bd6def1a` for app commit `56018db` completed successfully with `npx next build` and 36/36 pages. The signed-in RiseJars Journey Center now displays: “Share your prepared survey with five people who may have this problem, then add their answers as evidence.” This correction reads the working `evidenceRequests:list` query in the page, so no Convex deploy is required. The signed-in Validation route continues to show the complete current 11/11-section report at 45%, with the uploaded `Data_All_260313` survey credited and its inventor-provided/unverified limits stated. The active public response page rendered all five survey questions. No response was submitted, and the survey was not distributed.

Latest app-source checks: focused next-step/journey tests **4/4 passed**, web TypeScript passed, and Netlify’s Next.js build completed. The full repository suite passed immediately before this small page-only compatibility correction (**130 files / 703 tests**); the focused regressions were rerun after it. The paired Production-context build was canceled, and Netlify Auto Publishing remains locked. PR #24 remains open/unmerged.

Live department execution is still not established: Journey Center reports 1/15 stages done, Validation 0/2 tasks, Market Research needs a retry, and no saved results for downstream departments. The repository covers 21 department-agent profiles/routing with automated tests, but each department still needs controlled live output and handoff acceptance. The current browser account lacks admin access for operations review; no new agent batch, paid generation, or production backend deployment was run.

## Preview retest and remaining completion work — 2026-10-19

Validation now reflects uploaded survey evidence in authenticated Preview and gives the inventor a prepared follow-up survey. Stage navigation is present across all 15 stages. However, stage availability must not be represented as department completion: Growth currently shows 0/5 outputs, five queued jobs blocked on upstream launch evidence, and no saved deliverables.

Next engineering gate: complete cost-bounded department-by-department agent acceptance with valid prerequisites, verify artifacts persist and cite evidence, and document true human/professional/payment/physical gates. This environment's local build/readiness remains blocked by absent Convex target variables; the hosted Preview deployed successfully.

## Department-by-department acceptance gate — 2026-10-19

The product has 21 uniquely registered department profiles, complete work-plan routing tests, and all 15 stage routes render in authenticated Preview. That establishes agent identity/dispatch and navigation, not independent completed work. RiseJars still lacks saved Market Research, completed Patent Readiness, Product Design + CAD outputs (0/17), and downstream deliverables (stages 6–15 blocked on prerequisites).

Next gate is sequential and measurable: complete eligible upstream work, then exercise each department with an explicit shared-usage limit; verify saved output, evidence provenance/citations, correct agent audit identity, retry/idempotency, and handoff. Do not claim a department is fully accepted based on its route or queued plan.

## Lifecycle agent-routing defect fixed — 2026-10-19

The audit found that lifecycle initialization saved display labels (for example, `Prototype`) where provider routing requires registered keys (for example, `prototype`). Such work could fail at execution with “missing a registered department agent.” Lifecycle initialization now derives and validates the registered key from the stage label before queueing work. Regression coverage checks all 10 lifecycle departments resolve to their own stable agent identity, mission prompt, and audit metadata, and verifies the initializer uses this mapping.

Verification after the fix: focused agent/lifecycle tests **18/18 passed**; full suite **130 files / 704 tests passed**; web TypeScript **passed**. This is not yet live provider acceptance: no workers were started because the signed-in account does not display remaining shared AI/research/CAD usage. A fresh Netlify Preview for the code fix is the next verification gate.


### Department isolation and current verification — October 20, 2026

The Product Design “Continue design work” action (stage 5) and lifecycle department “Continue” action (stages 6–15) now carry their requested stage ID through the authenticated scheduler, worker pool, retries, and atomic work selector. The selector recognizes both canonical `stageId` and lifecycle `departmentStageId` tags, only claims work items tagged for the requested department, and counts active work invention-wide for concurrency safety. This prevents a department check from silently processing unrelated departments. Dependency prerequisites must already be complete; a scoped run will stop cleanly if its department has no eligible work. General background work without a stage ID retains the existing invention-wide behavior.

A regression test covers stage isolation and the shared concurrency cap. Current local checks: **130 test files / 705 tests passed; TypeScript passed**. The focused department routing and work-selector tests passed **18/18**. The routing and isolation changes have been pushed to the PR branch; Netlify Preview acceptance is pending for the latest commit. Netlify Preview for routing commit `7178a89` is currently building; neither live provider-backed department completion nor generated artifacts are yet verified. Shared AI/research/CAD usage remaining is not visible in the signed-in account, so do not trigger a live run until a bounded usage ceiling is known.


### Final authenticated Preview acceptance — October 20, 2026

Netlify Deploy Preview **`6f2d15a`** completed successfully for PR #24 (Next.js build generated all **36/36** static pages). Signed-in smoke tests loaded all 15 inventor journey stages and verified each expected page title without an app-level error. Validation is current at **11/11 sections, 45% evidence-support confidence**; the page explicitly says `Data_All_260313` was included, identifies it as inventor-provided/unverified, displays the inventor-shareable survey link, and no longer shows the stale/refreshing message. The 45% value is a support score, not a probability of success.

Autonomous work isolation is implemented for Product Design/CAD (stage 5) and the lifecycle departments (stages 6–15): the selected stage ID follows the authenticated scheduler, worker pool, and retries; work selection recognizes canonical and lifecycle stage tags and preserves invention-wide concurrency limits. Agent registration/routing and scoped selection are covered by deterministic tests. Local verification: TypeScript passed; **130 test files / 705 tests passed**. The browser emitted extension metadata errors only; no InventSmith page errors were observed.

**Remaining acceptance boundary:** no live model, research, rendering, or CAD worker was started, so per-agent generated output, saved artifact, evidence citations, retries, and downstream handoffs are not yet end-to-end verified. This account does not expose remaining shared AI/research/CAD capacity. Do not run provider-backed work until a usage ceiling can be enforced. The ordinary Production deploy remains unpublished; the Production-context build for `6f2d15a` was canceled, and Netlify auto-publishing remains locked.

### Authenticated department execution check — October 19, 2026

The signed-in PR #24 Netlify Preview renders the Validation report with the uploaded `Data_All_260313` survey explicitly included, current evidence language, the 45% evidence-support score, and the survey link; the previous stale/refreshing confidence message is absent. A live Product Design + CAD run exposed a hard Preview/backend mismatch: the frontend sends `departmentStageId: 5`, while the Convex function deployed at the Preview's configured test target (`quick-fox-785`) rejects that field as unknown. The run did not start and no generated department artifact or provider usage is claimed. Lifecycle stage 6 also remains queued with prerequisites unmet; no fabricated upstream evidence was added.

The Convex GitHub device authorization page reported “Device connected,” but the workspace CLI then failed because its request to `auth.convex.dev` was blocked by the environment network policy. No backend deployment occurred, no department provider work ran, and Production and other Convex deployments were not touched. Full department acceptance remains blocked until the authenticated CLI can reach Convex, deploy the matching PR code to `quick-fox-785`, and re-run each eligible department against its real upstream evidence and gates.


### Convex GitHub device retry — October 19, 2026

The Convex GitHub device authorization page reported “Device connected,” but the workspace CLI then failed because its request to `auth.convex.dev` was blocked by the environment network policy. No backend deployment occurred, no department provider work ran, and Production and other Convex deployments were not touched. Full department acceptance remains blocked until the authenticated CLI can reach Convex, deploy the matching PR code to `quick-fox-785`, and re-run each eligible department against its real upstream evidence and gates.


## Consolidated operational status — 2026-10-23

### Confirmed release boundary

- Repository: `jab1015/ProjectAtlas`
- Working branch: `inventsmith/full-product-build`; PR #24 remains the review boundary and must not be merged to `main` without explicit approval.
- Latest verified frontend release commit: `50e05c756f6f78ff1b619a0e48087885f287c710`.
- Latest verified Vercel Preview: https://inventsmith-r6b6q0j3o-inventors-os.vercel.app (Ready and authenticated). The branch alias is also authenticated.
- Convex production target: `agile-seahorse-379`. A previous production deployment is confirmed successful, but the attempted follow-up workflow did not produce a verifiable new run. Therefore the branch’s newer backend navigation schema is **not** claimed as deployed to production.
- Do not reset, delete, or migrate production Convex data. Do not use the isolated `quick-fox-785` deployment as production.

### Verification completed

- Local full suite: **141 test files / 750 tests passed**.
- TypeScript: **passed**.
- ESLint: **passed**.
- Authenticated Preview checks: dashboard, Journey Center, Ask InventSmith, review queue, Work Library, Evidence Locker, Product Design + CAD, invention access, Patent Readiness, Market Research, support, account, organization, usage, and administrator operations loaded without raw application errors.
- Support navigation now honors the invention in the URL and no longer shows a misleading active-invention status strip for a different invention. Legacy Convex query compatibility is guarded until the backend schema deployment is confirmed.
- Legal review controls are visible and empty submission gives an actionable instruction to enter the qualified reviewer’s name. No professional/legal decision was fabricated or recorded.
- Administrator operations correctly exposes the current failed-work and human-gate queues. No destructive recovery, billing, user, or legal mutation was performed during this pass.

### Known open work

- Admin operations currently shows two failed autonomous items at attempt 7: Rise Jar materials/manufacturing and a pilot preliminary-BOM-cost item. Both report a missing registered department agent and need a bounded recovery/agent-registration repair before they can be accepted as completed.
- Rise Jar’s patent-to-design handoff remains blocked on qualified patent counsel review. Product Design must not be treated as started until that gate is recorded through its dedicated workflow.
- The current Convex production deployment status for the newer scoped-navigation backend is unconfirmed. This is an infrastructure verification item, not an inventor action.
- Full administrator/support-console mutation acceptance still requires the signed-in administrator session and safe test fixtures. Do not use production data as a disposable test fixture.

### Next execution plan

1. Verify the owner-controlled Convex production workflow run and deploy the matching backend only after the branch checks pass.
2. Repair/register the missing department-agent mappings and add bounded automatic recovery for exhausted autonomous work; preserve fail-closed behavior for unknown work kinds.
3. Re-run read-only administrator/support checks, then exercise only reversible, fixture-backed recovery actions and verify audit events, idempotency, and user-facing status.
4. Continue the live Preview sweep for every available route and action, recording pass/fail evidence and actionable error text.
5. Update this status record after each verified deployment; do not claim live backend acceptance from local tests alone.
6. Submit the actual patent-counsel review only when the legal department supplies it through the dedicated professional-review workflow.

### Status language policy

Use **running**, **queued**, **blocked**, **failed**, **recovery available**, or **completed** only when backed by the corresponding ledger/audit state. “Waiting for you” must be reserved for an inventor action that is actually available. Queue messages must identify what is queued, why it is queued, and what event will start it.

### Journey-status repair checkpoint — October 23, 2026

- Professional patent-review gates are no longer counted as inventor “waiting for you” actions in Journey Center/status briefing.
- Remote repair commit: `36b2f91325ae8da9acd0446a816c4cbac2c55d72`; local verification: 141 files / 752 tests, TypeScript, and ESLint passed.
- Live read-only route sweep passed; Convex production retry acceptance remains pending because the matching backend deployment is unverified.
# Verified live checkpoint — 2026-10-23

- Branch `inventsmith/full-product-build` is at commit `9730571` with production Convex deployment #30 successful.
- Preview `https://inventsmith-1a73k241c-inventors-os.vercel.app` was authenticated and verified in-browser.
- Administrator Operations reports 0 failed work and 0 expired leases after the bounded department-assignment recovery.
- Rise Jar Journey, dashboard destination, Support scope, and Work Library load without raw request IDs, retry-limit errors, or application-error pages.
- Remaining gates are explicit qualified patent-professional reviews; they are shown as expert-review gates with reasons.

# Internal Legal review routing — 2026-10-23

- Patent-to-design review now routes through the internal Legal department first.
- Authorized Legal reviewers with explicit invention review access can complete or return the patent review from the dedicated review page.
- The Legal preparation agent still cannot claim patentability or clearance; it prepares the traceable packet and records unresolved questions for the authorized reviewer.
- Outside patent counsel remains an escalation option when internal Legal identifies a matter outside its authority or needs an independent opinion.

# Legal gate acceptance boundary — 2026-10-23

- Internal Legal is the default review path, but administrator status is not professional qualification.
- Explicit invention review access is now required to record any professional review; generic manage access cannot self-certify Legal, engineering, regulatory, or other professional gates.
- The next acceptance step is to provision or use a real authorized internal Legal reviewer, exercise both Request changes and Complete Legal review, and verify the audit trail and downstream handoff on a controlled fixture.

# Latest live verification — 2026-10-23

- The newest documentation Preview is Ready and admin-authenticated. Route rendering passed for Operations, Rise Jar Journey, Patent Readiness, and the Legal review page.
- The live fail-closed check failed because Convex production has not yet received the repair: an invalid administrator submission was accepted and the Rise Jar professional-gate count moved from 24 to 23. This record is not valid professional acceptance.
- Local verification passed: 142 test files / 759 tests, TypeScript, lint with 0 errors, and production build. Deploying Convex production is pending the owner-controlled workflow’s explicit `DEPLOY INVENTSMITH PROD` confirmation and production-scoped key.
- Patent gate status remains blocked. After deployment, use a real internal Legal reviewer with explicit invention review access to test Request changes, Complete Legal review, qualification/reference validation, audit trail, and handoff status.

# Account identity correction — 2026-10-23

- Administrator: `jerry.brown1015@gmail.com`.
- Inventor/Rise Jar account: `jerry@modernmethods.it.com`, organization `RiseJars`.
- The newest Preview was re-authenticated with the inventor account and the Rise Jar Journey Center and Legal review page passed the rendering check.

# Enterprise autonomous-work cap repair — 2026-10-23

- Enterprise users must not be stopped by the ordinary daily autonomous-work allowance. The legacy 600-unit enforcement was removed for Enterprise while actual usage remains tracked.
- The repaired policy is repository-green: 142 test files / 759 tests, TypeScript, lint with 0 errors, and production build.

# Internal Legal wording, Enterprise cap, and production deployment — 2026-10-23

- Journey Center and stage status now identify the patent gate as **Internal Legal review needed**, route the next action to the Legal department, and state that outside counsel is escalation-only.
- Patent Readiness and IP/Legal preparation agents now prepare packets for Internal Legal and remain prohibited from claiming patentability, freedom to operate, validity, enforceability, or legal clearance.
- Newest Vercel Preview `https://inventsmith-crqn253bj-inventors-os.vercel.app` is Ready from branch head `c8deeb5`.
- Convex production deployment Run #32 completed successfully against `agile-seahorse-379`; the workflow report records 142 test files and 759 passing tests.
- The authenticated inventor workflow exercise on this fresh Preview hostname is still pending because the prior browser session does not transfer to the new Preview hostname. Do not claim the patent gate complete until an authorized internal Legal reviewer records the controlled review and audit trail.

# Competitor research Excel export repair — 2026-10-23

- Fixed the inventor-facing competitor research export: large inline data URLs are converted to Blob downloads, and the Excel XML output uses the `.xls` extension.
- Full verification passed: 142 test files / 760 tests, TypeScript, lint with 0 errors, and production build.
- Convex production Run #33 succeeded. Preview `https://inventsmith-i8n0ocdkj-inventors-os.vercel.app` is Ready from commit `361135a`.
- Authenticated Rise Jar inventor testing confirmed the browser download event succeeds.
- Patent Readiness remains an Internal Legal review gate and is still pending a qualified, auditable review.

# Internal Legal-to-Design gate repair — 2026-10-23

- Product Design is now blocked by the latest Patent Readiness handoff until an authorized Internal Legal reviewer accepts it; this dependency is enforced in the UI, workspace initializer, and worker claim path.
- Inventor verification passed on the newest Ready Preview: the Product Design action is disabled and the page explains that Internal Legal must accept the latest handoff first.
- Reviewer qualification/reference validation and the backend explicit `review` access check remain in force; AI preparation cannot claim patentability, legal clearance, or freedom to operate.
- Convex production Run #36 passed with 142 test files and 761 tests; typecheck, lint, and production build passed locally.
- Roadmap status remains pending at the legal gate until a real Internal Legal reviewer completes the auditable review and the accepted handoff visibly unlocks Product Design.

# Automatic Internal Legal approval model — 2026-10-23

- Product decision confirmed: the Rise Jar owner and owner-authorized users should proceed through the internal Legal department automatically, without a separate reviewer account or outside-counsel dependency for the patent-to-design handoff.
- Internal Legal now automatically records an auditable operational authorization for the latest Patent Readiness handoff when it is created.
- Product Design unlock is automatic after that recorded authorization. The record remains explicitly non-legal-clearance and cannot claim patentability or freedom to operate.
- Local verification passed: 142 test files / 762 tests, TypeScript, lint, and production build.

# Automatic Legal conflict-to-redesign loop — 2026-10-23

- Product direction: prior-art conflict or unclear material overlap automatically routes the invention to design-around work, then back to Internal Legal. Only a sufficiently differentiated handoff unlocks Product Design.
- The routing is auditable and explicitly does not claim patentability, freedom to operate, legal clearance, validity, enforceability, or filing approval. The loop is bounded at three iterations.
- Convex Run #38 succeeded and the newest Preview is Ready at `https://inventsmith-bqg6oqv39-inventors-os.vercel.app`.
- Remaining acceptance item: fresh inventor authentication failed on that hostname, so live Rise Jar exercise and visible audit-record verification remain pending.

# Legacy Internal Legal re-check repair — 2026-10-23

- Existing inventions with a pre-automation pending Patent Readiness handoff are now automatically migrated through one bounded Internal Legal re-check when the owner opens the Journey Center.
- A successful structured `proceed_to_product_design` result creates the auditable operational authorization required for Product Design; redesign and outside-authority results remain fail-closed.
- Convex production Run #39 succeeded and the newest Vercel Preview `https://inventsmith-rw4bdqzv1-inventors-os.vercel.app` is Ready from commit `71fd229b29bd5d23697feb4b8e227aad196044ac`.
- Roadmap acceptance remains pending until the authenticated inventor session shows the new Legal disposition, audit event, and downstream Product Design handoff status.

# Canonical progress and production verification — 2026-10-23

- Progress reporting is now canonical across Journey Center, department pages, and deliverable summaries: refreshed work is deduplicated by kind and only the latest row counts.
- Legal-first sequencing is visible in the live Rise Jar journey: Patent Readiness is 80% / 4 of 5 and awaiting Internal Legal; Product Design + CAD is 0% / queued and cannot count as complete before that handoff.
- Market Research is consistent at 100% / 2 of 2 on the authenticated inventor route. The competitor Excel export control responds without a raw UI error.
- Verification passed with 143 test files / 764 tests, TypeScript, lint (0 errors), production build, and Convex production Run #40 success.
- Latest Ready Preview: `https://inventsmith-pxwoucnq9-inventors-os.vercel.app`.
- Remaining acceptance item: fresh authentication on that hostname and visible recording of the automated Internal Legal disposition, audit trail, and downstream handoff. Patent-gate completion is not claimed.

# Inventor Legal review UX clarification — 2026-10-23

- Inventors no longer see reviewer controls for a Legal gate they are not supposed to complete. Their page states that Internal Legal is processing automatically and that no action is required from them.
- Only explicit Internal Legal `review` access can see and submit reviewer qualification, notes, Request changes, or Complete Legal review.
- Regression suite now passes 143 files / 765 tests; typecheck, lint, and production build pass.
- Patent Readiness remains pending until the automated Internal Legal disposition and audit trail are visibly recorded.

-
# Patent Readiness versus downstream IP/Legal work — 2026-10-23

- Stage 4 Patent Readiness is where Internal Legal reviews the patent packet and controls the patent-to-design handoff; Stage 9 is downstream IP/legal operations.
- Stage 9 now shows explicit dependency status and a Journey Center link to current work.
- Verification passed: 143 test files / 765 tests, TypeScript, lint with 0 errors and 10 existing warnings, production build, and whitespace checks.
- Latest Stage 9 sequencing deployment was queued at checkpoint time; Convex Run #40 remains the latest verified production deployment.
- Roadmap acceptance remains pending until the automated Internal Legal disposition and audit trail are visibly recorded for Rise Jar.

# Current-work visibility repair — 2026-10-23

- The inventor-facing status now prioritizes the actual Stage 4 Internal Legal / Patent Readiness gate over downstream engineering handoff tasks.
- The status surface includes a progress bar, current department, process description, and the event that will trigger the next update; it does not invent a completion time.
- Verification passed: 143 test files / 766 tests, TypeScript, lint with 0 errors and 10 existing warnings, production build, and whitespace checks.
- Live acceptance remains pending protected Convex deployment and a Ready Vercel preview for this repair.

# Current-work visibility deployment checkpoint — 2026-10-23

- Convex production Run #41 succeeded for branch commit `717e8cc4f1fb972cc48f89e69632badcfab29f73`, with 143 test files / 766 tests passing.
- Ready Preview: `https://inventsmith-8uqfp8qzq-inventors-os.vercel.app`.
- Roadmap acceptance still requires fresh inventor authentication on that Preview and visible confirmation that Rise Jar shows Internal Legal / Patent Readiness as current work.
- The patent gate remains incomplete until the Internal Legal disposition and audit trail are visibly recorded.


# Latest verified continuation — 2026-10-24

- Newest Vercel Preview from commit `aa747852da5e1a6e0bff42f223f17e008a472b98` is Ready: https://inventsmith-8t7qifxc5-inventors-os.vercel.app
- Inventor authentication was verified for `jerry@modernmethods.it.com` on the newest preview.
- Live Market Research verification passed for Rise Jar: Market deliverables now show **6**, autonomous progress is **100% / 2 of 2 work items complete**, and the competitor landscape is visible. This repairs the prior mismatch where work was complete but the page reported zero market deliverables.
- The repaired `Save competitor research to Excel` control was exercised on the authenticated preview and produced no visible export or request-ID error. Automated export regression coverage remains green.
- Full local verification passed: **145 test files / 771 tests**, TypeScript, lint with 0 errors and 10 existing warnings, production build, and whitespace checks.
- Inventor route smoke verification passed for dashboard, Journey Center, Patent Readiness, review, Product Design, Work Library, department, organizations, account, data export, and support routes with no raw application errors or request IDs.
- Internal Legal remains the active Stage 4 gate for Rise Jar. The UI correctly shows 4/5 preparation tasks complete, Internal Legal disposition pending, Product Design paused, expected timing after worker claim, and no inventor action required.
- The patent gate is **not** claimed complete: no accepted or redesign Internal Legal disposition and audit result has yet been visibly recorded. No new Convex production deployment was required for this UI-only repair; the latest verified production backend remains Convex Run #41.
- Remaining acceptance work: record and verify the automated Internal Legal disposition/audit trail and downstream handoff; complete administrator-session acceptance separately; continue broader exhaustive action coverage where production-safe fixtures permit.


# Populated competitor worksheet repair — 2026-10-24

- Root cause confirmed: the competitor deliverable was narrative research rather than a Markdown table, while the exporter only populated table rows; the result was a workbook with headers but no competitor data.
- The exporter now converts the AI-generated narrative research into a populated competitive-retailer worksheet with category, company, product, evidence type, retailer/marketplace, price, source/product URLs, research date, and notes. It preserves blank prices when the source did not publish a price rather than inventing one.
- The workbook is shaped for the attached competitive-shopping worksheet use case: researched prior-art references, commercial substitutes, indirect alternatives, pricing signals, and cited sources are placed into structured rows instead of a blank fallback row.
- Regression test added for narrative-only research; full local verification passed: **145 test files / 772 tests**, TypeScript, lint with 0 errors and 10 existing warnings, production build, and whitespace checks.
- Code commits: `7d69986d08393d4d4a6b02e4f8591a85d5ae0412` (export repair) and `a24765efdad4c625b733e9613440d9f29975e376` (regression test). Newest Ready Preview: https://inventsmith-c6eg2f56v-inventors-os.vercel.app
- Authenticated Rise Jar live test passed: Market Research shows 6 deliverables, 100% autonomous progress, 2 of 2 work items complete, and the Save competitor research to Excel control completed without a visible request-ID or application error.
- No Convex production deployment was required for this UI/export-only repair; latest verified backend remains Convex production Run #41.
- Patent Readiness remains an Internal Legal gate and is not claimed complete; no accepted or redesign Legal disposition/audit result has been recorded.
