# ATLAS AUTOMATION IMPLEMENTATION PLAN

> **Version 1.0 | July 2026**
> **Classification: Internal Engineering Reference**
> **Source of Truth: `.agent/architecture-decisions.md` · `docs/ATLAS_AUTOMATION_CONSTITUTION.md` · `docs/FOUNDER_REFERENCE_PROJECT_RISE_JARS_PART_D.md`**

---

## Purpose

This document converts the Atlas Automation Constitution into a concrete engineering implementation plan. It answers a single engineering question: **what must be built, in what order, to move Atlas from a guided workflow to an autonomous AI operating system?**

The Automation Constitution defines the principle: Atlas owns execution. This document defines the implementation.

**The goal:** Atlas performs every task it reasonably can before asking the founder to do anything.

---

## SECTION 1 — CURRENT STATE ASSESSMENT

### 1.1 How Atlas Currently Operates

As of July 2026, Atlas operates between Level 1 (Guided) and Level 2 (Assisted) on the Automation Maturity Model defined in the Constitution. The following describes the actual system behavior.

**Architecture Reference:** ADR-001 (Engine Owns Progress), ADR-002 (Three-State Readiness), ADR-003 (Configuration-Driven Journey), ADR-006 (UI Contains No Business Logic), ADR-010 (stageProgress as Separate Table).

---

#### Stages Live (1–4): Form and Questionnaire-Driven

Each live stage operates on the following interaction pattern:

1. Founder opens a stage
2. Atlas presents a structured set of fields and questions via the IntelliQ system
3. Founder manually fills fields or responds to AI-prompted questions in conversation
4. `journeyEngine.ts` evaluates completeness against `stageConfig` field definitions
5. Atlas generates a readiness score (0–100 internal, three-state external per ADR-002)
6. When sufficient fields are complete, Atlas generates the stage deliverable from founder-supplied input
7. Founder reviews and advances

**What Atlas does today:**
- Structures the questions the founder should answer
- Explains what each field means and why it matters
- Scores completeness against defined field thresholds (`stageConfig`)
- Generates stage reports and deliverables from completed fields
- Provides AI commentary, recommendations, and assessment within each stage
- Tracks `stageProgress` per stage in Convex (`inventionId × stageId` index — ADR-010)

**What the founder must do today:**
- Research competitors manually (Atlas does not pre-populate competitive data)
- Conduct prior art searches in USPTO/Google Patents manually (Stage 4)
- Supply market size data from external sources (Stage 3)
- Write or describe everything from scratch before Atlas can generate output
- Manually answer all stage questions — no pre-population from external research
- Re-enter information that overlaps with prior stages if not explicitly threaded through

---

#### Stages Not Yet Live (5–15): Blueprint-Only

Stages 5–15 are defined in `stageConfig` with `enabled: false` (ADR-003). The blueprints exist in `docs/STAGE_BLUEPRINTS/`. These stages are planning documents, not implemented features. Enabling one requires:

1. Set `enabled: true` in `stageConfig`
2. Add field definitions to `STAGE_FIELDS`
3. Implement any stage-specific AI generation logic in `journeyEngine.ts`

None of stages 5–15 have:
- Active AI research capabilities
- Document auto-assembly from prior stages
- Analytics integrations
- Automated background processing

---

#### Key Architecture Patterns (from ADR files)

| Pattern | File | What It Enables |
|---|---|---|
| Engine Owns Progress | `convex/journeyEngine.ts` | All progress computation backend-only; UI reads state, never computes it |
| Three-State Readiness | `journeyEngine.ts` → `ReadinessBadge` | Not Ready / Getting There / Ready to Move Forward (0–39 / 40–74 / 75–100) |
| Configuration-Driven Journey | `stageConfig[]` in `journeyEngine.ts` | One flag (`enabled: true`) activates a stage with no new routes or schema |
| Stage Progress Table | `stageProgress` Convex table | Stores per-stage field completion data; indexed by `(inventionId, stageId)` |
| Extension Point Schema Stubs | `conversations`, `documents`, `notifications` tables | Schema is ready; implementation is zero |
| UI Contains No Business Logic | All React components | Components render backend output only; no threshold or tier logic in component files |

---

#### The Founder-to-Atlas Work Ratio Today

| Task Category | Founder Does | Atlas Does |
|---|---|---|
| Research (competitive, market, patent, pricing) | 100% | 0% |
| Data entry and field population | 100% | 0% |
| Document drafting | 0–20% (Atlas generates from completed fields) | 80–100% (post-input) |
| Progress evaluation | 0% (Atlas scores) | 100% |
| Recommendations and assessments | 0% (Atlas generates) | 100% |
| Stage sequencing and unlocking | 0% (Atlas gates) | 100% |
| Background research before stage opens | 0% | 0% (not implemented) |
| Cross-stage data population | ~50% (manual re-entry common) | ~50% (some fields auto-threaded) |

**Summary:** Today Atlas guides and generates from what the founder provides. It does not research, pre-populate, or act autonomously before the founder interacts. The Constitution defines where the system must go. This plan defines how to get there.

---

#### Gap Register Reference

The Founder Reference Project (Part D, Section 3) identified **52 specific gaps** across all 15 stages. The 14 Critical (P0) gaps are:

- GAP-A01: No physical product spec module
- GAP-A04: No price sensitivity testing (Van Westendorp)
- GAP-A07: No CPG "build from components" market sizing
- GAP-A10: No automated prior art search
- GAP-B01: No glass/CPG product design guidance module
- GAP-B02: No SKU architecture decision framework
- GAP-B06: No glass-specific prototyping path
- GAP-B10: No glass/ceramics manufacturing guidance
- GAP-B19: No IP Brief auto-assembly from Stages 4+5+8
- GAP-B20: No provisional patent deadline tracker
- GAP-B21: No public disclosure tracker
- GAP-B23: No automated unit economics builder from Stage 7
- GAP-B24: No value-based pricing calculator
- GAP-C13: No analytics integration (Stages 11–15 are planning-only)

These gaps define the implementation backlog. This plan prioritizes and sequences them.

---

### 1.2 The Automation Maturity Gap

The Automation Constitution defines four maturity levels:

| Level | Name | What It Means | Current Status |
|---|---|---|---|
| Level 1 | Guided | Atlas structures the process; founder does the work | ✓ Achieved (Stages 1–4) |
| Level 2 | Assisted | Atlas generates drafts from founder input | ~Partial (Stages 1–4 only) |
| Level 3 | Autonomous | Atlas researches and generates before founder arrives | ✗ Not yet |
| Level 4 | Operating System | Atlas manages the journey end-to-end; founder approves | ✗ Long-term vision |

**12-month target:** Level 3 across all live stages.

---

## SECTION 2 — TARGET STATE

### 2.1 The Future Atlas Experience

The target experience: **the founder feels like they hired an experienced startup team.**

When a founder opens a stage in the target state:
- Research has already been completed (competitors found, prior art searched, pricing benchmarked)
- Documents are already drafted (not blank templates — populated drafts)
- Data from prior stages has already flowed into the current stage automatically
- Risks have already been surfaced with specific action items
- Atlas has already provided a recommendation — the founder confirms, adjusts, or redirects

The founder's job becomes: **review, approve, and decide** — not research, write, and calculate.

---

### 2.2 Atlas Owns These Responsibilities in the Target State

| Atlas Owns | Implementation Mechanism |
|---|---|
| **Research** before every stage opens | Stage `onOpen` lifecycle hook → web search API + structured extraction |
| **Document drafts** ready at stage open | Document auto-assembly pipeline from prior stage `stageProgress` data |
| **Calculations** (unit economics, break-even, TAM/SAM/SOM, margins) | Automated from prior stage field data — no founder spreadsheet work |
| **Competitive analysis** | Background research job → competitive landscape populated before founder sees the stage |
| **Prior art search** | USPTO + Google Patents API → results surfaced at Stage 4 open |
| **Recommendations** | Every stage surfaces Atlas's specific recommendation with reasoning and trade-offs |
| **Risk monitoring** | Patent deadlines, public disclosure bars, inventory levels, KPI variances |
| **Cross-stage data propagation** | All fields flow downstream automatically; nothing asked twice |
| **Document assembly** | Pitch deck, IP brief, sales toolkit, unit economics, landing page — all assembled from prior stage data |

---

### 2.3 The Founder's Job in the Target State

The Automation Constitution (Principle 9) defines the founder's irreducible role:

| Founder's Domain | Examples |
|---|---|
| **Strategic judgment** | Which market segment to target, which manufacturer to trust, whether evidence is sufficient |
| **Creative vision** | Brand aesthetic, product positioning, messaging voice |
| **Legal decisions** | All signatures, patent filing decisions, contract terms |
| **Physical world tasks** | Prototype testing, factory visits, investor meetings, trade shows |
| **Relationship formation** | Investors, retail buyers, manufacturers, influencers, media |
| **Negotiation** | Price, terms, equity, exclusivity |
| **Final approval** | Review and approve every Atlas output before it is committed |

**Everything else is Atlas's job.**

---

### 2.4 Required Infrastructure for the Target State

Reaching Level 3 (Autonomous) requires these infrastructure components that do not yet exist:

1. **Stage Lifecycle Hook System** — `stageConfig[n].onOpen` hook that triggers research and document generation before the founder sees the stage. Implementation location: `convex/journeyEngine.ts`.

2. **Research Engine** — Background research pipeline using web search API. Triggered by stage open events. Extracts structured data (competitors, pricing, prior art results) and stores in `stageProgress` or a new `stageResearch` table.

3. **Document Auto-Assembly Pipeline** — Maps prior stage `stageProgress` fields to destination document sections. Runs at stage open/close checkpoints. Produces drafted documents in the extension point `documents` table (ADR-007 schema stub already exists).

4. **Analytics Integration Layer** — OAuth-connected data ingestion from Shopify, GA4, email platforms, and ad platforms. Normalized KPI data model. Triggers automated performance reports in commercial stages (11–15).

5. **Risk Tracking Subsystem** — Persistent tracking of IP deadlines, public disclosures, and compliance requirements. Surfaces warnings across all stages, not just the one where the risk originates.

6. **Physical Product Vertical Configuration** — Product type field in Stage 1 that activates material-specific guidance modules throughout the journey.

---

## SECTION 3 — STAGE-BY-STAGE AUTOMATION PLAN

*For each stage: what the founder does today, what Atlas should own in the target state, implementation details, and impact estimates.*

---

### Stage 1 — Idea Capture

**Current Founder Tasks:**
- Describes idea in conversation (relatively low friction — this stage is mostly conversational)
- Names the invention
- Answers completeness-scoring questions
- Resolves contradictions Atlas surfaces

**Tasks Atlas Should Automate:**
- Run competitive product search the moment the product description is submitted
- Pre-populate industry category and problem domain from description analysis
- Surface top 3–5 existing solutions before the founder completes the Idea Brief
- Identify whether the problem statement is broadly shared (community signal check)

**Tasks Atlas Should Research (on-trigger, before Stage 1 completes):**
- Similar products on Amazon, Google Shopping, and D2C brands
- Community discussion volume for the problem (Reddit, forums, app stores)
- Patent filings in the technology area (preview — full search at Stage 4)
- Relevant industry category and SIC/NAICS code for downstream market sizing

**Tasks Atlas Should Generate:**
- Idea Brief (already generated — maintain and improve)
- Completeness Assessment (already generated)
- Initial competitive context summary (new — from research)
- Recommended Stage 2 validation priorities from research findings

**Tasks Atlas Should Monitor:**
- Competitive product launches in the category (after stage completion, weekly)

**Tasks Requiring Founder Approval:**
- Final Idea Brief content
- Problem statement wording
- Differentiation claims

**Tasks Requiring Physical Founder Involvement:**
- None at this stage

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium |
| Founder Hours Saved | 2–4 hrs (competitive research no longer manual) |
| Business Impact | Medium — better Stage 2 validation plan; reduces wasted validation paths |

**Gap Closed:** GAP-A01 (physical product spec module), GAP-A02 (competitive research at capture)

---

### Stage 2 — Validation

**Current Founder Tasks:**
- Manually identifies assumptions to test
- Finds interview subjects independently
- Conducts customer interviews (irreducible)
- Writes up findings
- Makes Go/No-Go decision

**Tasks Atlas Should Automate:**
- Auto-generate interview question set from Idea Brief (already partially done; improve specificity)
- Rank top 5 assumptions by risk without requiring founder input
- Surface publicly available problem evidence (Reddit threads, Amazon reviews, app store complaints) before founder conducts interviews
- Analyze interview findings the founder provides and extract patterns
- Van Westendorp 4-question price sensitivity module (triggered when price point > $40)

**Tasks Atlas Should Research (on-trigger):**
- Existing validation evidence for the problem in public forums, reviews, and Q&A platforms
- Similar product review sentiment on Amazon and Trustpilot
- Funding history of known competitors as proxy for market activity
- Channel validation data: which distribution model works for comparable products

**Tasks Atlas Should Generate:**
- Assumption Risk Map (5 assumptions ranked by risk + validation method)
- Customer Interview Guide (tailored to audience and problem)
- Competitive Landscape (preliminary — 3–5 competitors with notes)
- Go/No-Go Recommendation with explicit reasoning
- Validation Report

**Tasks Atlas Should Monitor:**
- Community sentiment for the problem space (monthly, after stage completion)

**Tasks Requiring Founder Approval:**
- Go/No-Go decision (constitutionally founder's call)
- Confirmation of which assumptions were validated

**Tasks Requiring Physical Founder Involvement:**
- All customer interviews — this is genuinely irreducible human work
- Physical product testing where applicable (GAP-A05)

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium |
| Founder Hours Saved | 4–8 hrs (research automation + pre-populated competitive analysis) |
| Business Impact | High — better validation quality reduces stage 5+ rework |

**Gaps Closed:** GAP-A04 (Van Westendorp), GAP-A05 (physical prototype test protocol), GAP-A06 (channel validation)

---

### Stage 3 — Market Research

**Current Founder Tasks:**
- Manually researches industry market size data
- Builds TAM/SAM/SOM model from scratch
- Identifies competitors
- Profiles customer segments

**Tasks Atlas Should Automate:**
- Pull comparable category sizes from public datasets before stage opens
- Auto-calculate preliminary TAM from demographic data and search volume
- Build first-draft competitive landscape from Stage 1+2 research
- Pre-populate Customer Segment Profile templates from Stage 2 interview data

**Tasks Atlas Should Research (on-trigger at stage open):**
- Comparable category market sizes (premium cookware, premium drinkware, adjacent categories)
- Industry growth rate and CAGR from published reports
- Demographic data for target segment (age, income, geography from public sources)
- Competitive market share distribution (revenue proxies: Alexa rank, Shopify spy tools, social following as indicators)
- Search trend volume for the product category and related keywords

**Tasks Atlas Should Generate:**
- Draft Market Research Summary (populated with research data)
- TAM/SAM/SOM Model (calculator pre-seeded with researched figures)
- Competitive Market Share Analysis
- Customer Segment Profiles (2–3 segments, pre-populated from demographic research)
- Market Opportunity Assessment

**Tasks Atlas Should Monitor:**
- Monthly search trend updates for category keywords
- New competitor launches (using competitive research trigger)

**Tasks Requiring Founder Approval:**
- Market sizing methodology selection
- Target segment prioritization
- Confirmation of data source quality

**Tasks Requiring Physical Founder Involvement:**
- None

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Hard (requires data API integrations) |
| Founder Hours Saved | 8–16 hrs (eliminating manual market research data collection) |
| Business Impact | High — accurate market sizing affects all downstream fundraising and pricing |

**Gaps Closed:** GAP-A07 (CPG "build from components" sizing), GAP-A08 (retail channel economics), GAP-A09 (competitive positioning map)

---

### Stage 4 — Patent Readiness

**Current Founder Tasks:**
- Manually searches USPTO, Google Patents, Espacenet (4–10 hours)
- Evaluates whether found patents anticipate their claims
- Documents prior art findings
- Makes IP strategy decision

**Tasks Atlas Should Automate:**
- Execute automated prior art search using USPTO API + Google Patents API at stage open
- Generate search query set from invention description (mechanism-based, domain-based, and claim-based queries)
- Rank prior art results by relevance to the inventor's novel element claims
- Draft novel element statements from invention description
- Auto-generate NDA document for manufacturer sharing

**Tasks Atlas Should Research (on-trigger):**
- Top 50 most relevant patents by search query
- Recent patent activity in the technology area (last 24 months)
- Competitor patent filings as IP landscape context
- IP attorney networks appropriate for the invention category

**Tasks Atlas Should Generate:**
- Prior Art Search Query Set (already done; automate the actual search execution)
- Prior Art Summary (from automated search results)
- Novel Element Statements (3 claim-like articulations)
- IP Strategy Recommendation
- Patent Readiness Report
- IP Brief (attorney-ready)
- NDA Template (unilateral for manufacturing sharing)

**Tasks Atlas Should Monitor:**
- Ongoing patent filings in the technology area (monthly alert)
- Provisional patent deadline countdown (from filing date — alert at 9, 11, 11.5 months)
- Public disclosure log with statutory bar date calculation

**Tasks Requiring Founder Approval:**
- IP strategy decision (provisional vs. utility vs. trade secret vs. design)
- Final claim language review
- Attorney engagement decision

**Tasks Requiring Physical Founder Involvement:**
- Sign and execute all IP filings
- Provide inventor declaration
- Interview and retain IP attorney

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Hard (USPTO/Google Patents API integration) |
| Founder Hours Saved | 6–12 hrs (prior art search automation alone) |
| Business Impact | Critical — eliminates most-hated manual task; improves patent quality |

**Gaps Closed:** GAP-A10 (automated prior art search), GAP-A11 (design patent depth), GAP-A12 (NDA generator), GAP-B19 (IP brief auto-assembly), GAP-B20 (deadline tracker), GAP-B21 (public disclosure tracker)

---

### Stage 5 — Product Design

**Current Founder Tasks:**
- Describes design decisions in conversation
- Must provide all material, dimensional, and functional details from personal knowledge
- No tooling cost guidance — must research independently
- No compliance pathway — must research independently

**Tasks Atlas Should Automate:**
- Activate physical product vertical configuration from Stage 1 product type field
- Surface material-specific design implications in real time (glass CPG: food contact, thermal shock, weight, breakage, lid compatibility)
- Calculate tooling cost range from mold count × manufacturing geography
- Surface applicable regulatory requirements (FDA 21 CFR, CE, Prop 65) by product category
- Pre-populate design spec template from Stage 1 product description

**Tasks Atlas Should Research (on-trigger):**
- Regulatory requirements by product category and target market
- Material specifications standard for the product type
- Manufacturing implications of material choices (MOQ, tooling, lead times)
- Industrial design firms and freelancers specializing in the product category

**Tasks Atlas Should Generate:**
- Product Design Specification (populated draft)
- Design Decision Log
- Tooling Cost Estimate (mold count × geography → $ range)
- Specialist Recommendations (industrial designer, materials engineer types)
- Designer/Engineer Brief for professional handoff
- Open Design Questions (prioritized list)

**Tasks Atlas Should Monitor:**
- None at stage-level (point-in-time document)

**Tasks Requiring Founder Approval:**
- All aesthetic and form decisions
- Material selections and design trade-offs
- Final Product Design Specification

**Tasks Requiring Physical Founder Involvement:**
- Creative vision and aesthetic direction
- Physical material samples review (tactile judgment Atlas cannot replicate)

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium-Hard (vertical configuration system) |
| Founder Hours Saved | 4–8 hrs (compliance research, tooling cost estimation, spec template) |
| Business Impact | Critical — prevents underfunding (tooling cost surprise) and compliance failures |

**Gaps Closed:** GAP-B01 (CPG design guidance), GAP-B02 (SKU architecture), GAP-B03 (tolerance documentation), GAP-B04 (tooling cost preview), GAP-B05 (food contact compliance)

---

### Stage 6 — Prototype

**Current Founder Tasks:**
- Selects prototype approach independently
- Finds prototype vendors independently
- Designs test protocols independently
- Manages IP risk independently (no Atlas checkpoint)

**Tasks Atlas Should Automate:**
- **IP pre-engagement checkpoint**: gating question before stage advances — "Have you filed a provisional patent or signed a mutual NDA before sharing detailed designs?" Cannot bypass without explicit confirmation.
- Present material-specific prototype path (Glass: 3D form mock → proxy mechanism → glass manufacturer sample)
- Generate prototype cost and timeline estimate by product type and phase
- Build prototype plan with specific questions to answer and pass/fail criteria

**Tasks Atlas Should Research (on-trigger):**
- Prototype services and fabricators relevant to the product type and geography
- Cost and lead time benchmarks for each prototype phase
- User testing recruitment criteria for the product category
- Common failure modes in the product design's mechanism type

**Tasks Atlas Should Generate:**
- Prototype Plan (phase breakdown, questions, pass/fail criteria)
- Prototype Sourcing Guide (specific vendors with cost/timeline range)
- IP Pre-Engagement Checklist
- User Testing Protocol (recruitment screener, test script, feedback template)
- Prototype Test Report template (for founder to complete after testing)
- Prototype Readiness Assessment

**Tasks Atlas Should Monitor:**
- None (point-in-time stage)

**Tasks Requiring Founder Approval:**
- Prototype type selection
- Iteration vs. advance decision
- Test protocol results interpretation

**Tasks Requiring Physical Founder Involvement:**
- All physical prototype building and testing (irreducible)
- Tactile and functional evaluation of the physical prototype

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium |
| Founder Hours Saved | 4–8 hrs (vendor research, timeline planning, IP checkpoint saves potentially catastrophic loss) |
| Business Impact | Critical — IP pre-engagement checkpoint prevents the most common irreversible mistake |

**Gaps Closed:** GAP-B06 (glass-specific prototype path), GAP-B07 (cost/timeline estimate), GAP-B08 (IP pre-engagement checkpoint), GAP-B09 (user testing protocol)

---

### Stage 7 — Manufacturing

**Current Founder Tasks:**
- Researches manufacturers independently
- Writes RFQ from scratch
- Evaluates bids without a structured scorecard
- Calculates unit economics manually
- Discovers total inventory commitment only after committing to MOQ

**Tasks Atlas Should Automate:**
- Generate RFQ document directly from Product Design Specification (no founder rewrite needed)
- Research manufacturer shortlist by product type and geography
- Calculate unit economics cascade from entered manufacturer quotes
- Calculate total minimum inventory commitment (MOQ × COGS × SKU count) and display prominently before commitment
- Generate retail compliance pre-qualification checklist by product category and target channel
- Build manufacturer evaluation scorecard (quality, certifications, IP risk, communication score)

**Tasks Atlas Should Research (on-trigger):**
- Manufacturers in the product category (domestic and overseas)
- Typical MOQ and tooling cost benchmarks for the product type
- Freight cost estimates for international manufacturing scenarios
- Factory certification requirements (ISO, FDA registration, food contact certifications)
- Common IP risks in manufacturing agreements for this product type

**Tasks Atlas Should Generate:**
- RFQ Document (manufacturer-ready, from design spec)
- Manufacturer Shortlist with evaluation notes
- Manufacturer Evaluation Scorecard
- Unit Economics Model (from entered quotes)
- MOQ Impact Summary ("Your minimum commitment is $X–$Y")
- Manufacturing Timeline (tooling → production → freight → delivery with realistic estimates)
- Multi-Component Supply Chain Tracker (for products with multiple component suppliers)
- Contract Review Checklist (terms that must appear in any manufacturing agreement)
- Retail Compliance Pre-Qualification Checklist (FDA, Prop 65, GS1, EDI)

**Tasks Atlas Should Monitor:**
- None (point-in-time stage; monitoring resumes at Stage 15 with analytics)

**Tasks Requiring Founder Approval:**
- Manufacturer selection
- Geographic manufacturing decision
- Final MOQ commitment
- Contract terms and signing

**Tasks Requiring Physical Founder Involvement:**
- Factory negotiations (Atlas can script them but cannot conduct them)
- Factory visits (where warranted)
- Contract execution and signature

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Hard (manufacturer database, multi-component model) |
| Founder Hours Saved | 8–16 hrs (RFQ drafting, manufacturer research, unit economics calculation) |
| Business Impact | Critical — MOQ impact model prevents underfunding; RFQ auto-generation saves significant time |

**Gaps Closed:** GAP-B10 (glass/ceramics manufacturing), GAP-B11 (multi-component supply chain), GAP-B12 (tooling ownership), GAP-B13 (MOQ impact), GAP-B14 (retail compliance pre-qualification), GAP-B23 (unit economics auto-builder)

---

### Stage 8 — Branding

**Current Founder Tasks:**
- Generates brand name candidates independently (10–20 hours typical)
- Manually checks trademark and domain availability
- Describes brand vision without structured framework
- Produces brand brief manually

**Tasks Atlas Should Automate:**
- Generate 20+ brand name candidates using constraints-based algorithm (phonetics, trademark risk, category conventions, .com availability)
- Run trademark availability check (USPTO TESS API) for all candidates simultaneously
- Run domain and social handle availability check (Instagram, TikTok, Pinterest) for all candidates
- Score each candidate across: memorability, trademark risk, category fit, handle availability
- Build brand positioning framework from Customer Segment Profiles (Stage 3) and competitive landscape
- Generate Brand Identity System draft from completed positioning conversation

**Tasks Atlas Should Research (on-trigger):**
- Competitive brand landscape (what existing brands look/sound like and the whitespace)
- Brand name connotations and linguistic analysis for target market
- Visual aesthetic references for the product category
- Trademark filing history in relevant classes for shortlisted names

**Tasks Atlas Should Generate:**
- Brand Name Candidates (20+ with constraint scoring)
- Name Evaluation Report (trademark risk, availability, recommendation)
- Brand Identity System (positioning statement, voice guide, visual direction brief)
- Brand Consistency Score
- Visual Direction Brief (ready for a designer or AI visual tool)
- Brand Voice Guide ("sounds like / doesn't sound like" examples)

**Tasks Atlas Should Monitor:**
- Trademark application status (after filing)
- Competitor brand landscape changes (quarterly)

**Tasks Requiring Founder Approval:**
- Final brand name selection
- Brand positioning approval (must reflect founder's authentic vision)
- Final aesthetic direction

**Tasks Requiring Physical Founder Involvement:**
- Creative vision input
- Founder story and personal brand elements
- Final aesthetic judgment

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium (name generator + API integrations for availability checks) |
| Founder Hours Saved | 12–24 hrs (brand naming research and availability checking) |
| Business Impact | High — eliminates the worst-case branding outcome (name chosen, then handles unavailable) |

**Gaps Closed:** GAP-B15 (brand name generator), GAP-B16 (visual reference library), GAP-B17 (brand consistency checker), GAP-B18 (trademark/social handle checker)

---

### Stage 9 — IP Protection

**Current Founder Tasks:**
- Assembles IP Brief manually from scratch (4–8 hours)
- Manually tracks provisional patent deadline
- No systematic tracking of public disclosure risk
- Finds IP attorney independently

**Tasks Atlas Should Automate:**
- **Auto-assemble IP Brief** from Stages 4 (patent claims) + 5 (product spec) + 8 (brand identity) — 80%+ complete without founder work
- **Provisional patent deadline tracker**: when filing date is entered, auto-calculate 12-month conversion window; alert at 9, 11, and 11.5 months (never-miss-this rule)
- **Public disclosure tracker**: log each public disclosure event with date and audience type; auto-calculate US statutory bar date; alert prominently when within 90 days
- Generate NDA variants (unilateral for manufacturer sharing; mutual for investor conversations)
- Generate IP Filing Checklist (all pre-filing tasks with deadlines)
- Build IP attorney shortlist filtered by specialty (consumer goods, relevant material type)

**Tasks Atlas Should Research (on-trigger):**
- IP attorneys with consumer goods / relevant product category specialty
- Recent patent filings in the technology area
- Applicable International Classes for trademark registration
- Competitive patent monitoring (ongoing)

**Tasks Atlas Should Generate:**
- IP Brief (80%+ auto-assembled from prior stages)
- IP Filing Checklist
- NDA Templates (unilateral + mutual, from invention record)
- Trademark Application Information Package
- IP Status Tracker (living document updated as filings progress)
- IP Attorney Shortlist with approach email template

**Tasks Atlas Should Monitor:**
- **Provisional patent deadline** (persistent across all stages — not just Stage 9)
- **Public disclosure statutory bar countdown** (persistent)
- New patent filings in technology area (monthly)

**Tasks Requiring Founder Approval:**
- Patent strategy decision (utility, design, provisional, trade secret)
- IP attorney selection and engagement
- All document signatures

**Tasks Requiring Physical Founder Involvement:**
- Attorney interviews and relationship
- Inventor declarations
- Execution of all legal filings

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium (IP Brief assembly pipeline; deadline tracker is Low) |
| Founder Hours Saved | 6–12 hrs (IP Brief assembly) + critical risk prevention (deadline tracking) |
| Business Impact | Critical — missed provisional deadline = permanent loss of priority date (unrecoverable) |

**Gaps Closed:** GAP-B19 (IP brief auto-assembly), GAP-B20 (deadline tracker), GAP-B21 (public disclosure tracker), GAP-B22 (IP attorney matching)

---

### Stage 10 — Pricing

**Current Founder Tasks:**
- Builds unit economics spreadsheet manually from Stage 7 quotes
- Researches competitor pricing independently
- Calculates break-even manually
- Applies pricing frameworks without automated support

**Tasks Atlas Should Automate:**
- **Unit economics auto-builder**: ingest Stage 7 manufacturer quote fields → auto-populate complete landed cost model → calculate DTC, wholesale, and Amazon FBA margins automatically
- Apply three pricing frameworks (cost-plus, competitive, value-based) using research data
- Generate break-even timeline at three volume scenarios automatically ("At conservative/base/optimistic monthly volume, break even in month X")
- Calculate value delivered vs. reference product for value-based pricing

**Tasks Atlas Should Research (on-trigger):**
- Current competitor pricing for the product category (web search)
- Retail margin requirements for applicable channels (keystone, Amazon FBA, distributor)
- Consumer willingness-to-pay signals from Stage 2 validation interview notes
- Pricing benchmarks for comparable products at similar quality and positioning

**Tasks Atlas Should Generate:**
- Unit Economics Model (auto-populated from Stage 7 COGS data)
- Pricing Strategy Document
- Break-Even Analysis (three scenarios)
- Pricing Scenario Analysis (sensitivity: conservative/base/optimistic price points)
- Channel Margin Analysis (DTC vs. wholesale vs. Amazon vs. distributor)
- Pricing Recommendation (specific price with reasoning)

**Tasks Atlas Should Monitor:**
- Competitor pricing changes (monthly refresh)
- Price compression risk signals (new entrants, Asian DTC launches in category)

**Tasks Requiring Founder Approval:**
- Final pricing decision
- Channel strategy and margin allocation decision
- Minimum price floor acceptance

**Tasks Requiring Physical Founder Involvement:**
- None

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium (unit economics auto-builder from Stage 7 data) |
| Founder Hours Saved | 6–10 hrs (unit economics spreadsheet eliminated; competitive research automated) |
| Business Impact | High — accurate unit economics prevents fatal pricing errors before market entry |

**Gaps Closed:** GAP-B23 (unit economics auto-builder), GAP-B24 (value-based pricing), GAP-B25 (channel margin benchmarks), GAP-B26 (break-even visualizer), GAP-B27 (price compression risk)

---

### Stage 11 — Marketing

**Current Founder Tasks:**
- Evaluates marketing channels manually
- Writes landing page copy from scratch (8–20 hours)
- Builds content calendar manually (or doesn't build one)
- Researches influencers independently
- Creates all marketing assets from blank

**Tasks Atlas Should Automate:**
- Score all 8 channels against product profile (price point, margin, founder resources, audience) before any budget commitment
- Generate landing page copy + HTML structure from Voice Guide + Messaging Architecture + brand inputs
- Build 90-day content calendar (30+ posts with topic, format, CTA, channel, publish date)
- Pre-populate Messaging Architecture first draft from prior stage brand and customer data
- Research and profile 15+ relevant influencer accounts (follower count, engagement rate, audience match, estimated cost)

**Tasks Atlas Should Research (on-trigger):**
- Channel performance benchmarks for the product category
- Keyword and SEO opportunity for content strategy topics
- Competitor marketing positioning and channel presence
- Influencer accounts in the product category with engagement rate verification
- Editorial calendar windows for relevant publications (food, lifestyle, home)
- Audience size estimates and CPC benchmarks for recommended paid channels

**Tasks Atlas Should Generate:**
- Go-to-Market Marketing Plan
- Messaging Architecture (first draft from prior stage data)
- Channel Strategy (scored + recommended)
- Landing Page Copy + HTML structure (publish-ready)
- Pre-Launch Marketing Calendar
- 90-Day Content Calendar
- Core Marketing Assets Copy (product description, social bio, elevator pitch)
- Ad Creative Briefs (based on messaging architecture)
- Influencer Research List (15+ profiled accounts)

**Tasks Atlas Should Monitor:**
- Landing page conversion rate (after analytics integration)
- Content engagement metrics (after analytics integration)
- Influencer engagement rate changes
- Competitor marketing channel changes

**Tasks Requiring Founder Approval:**
- Channel budget allocation decisions
- Final messaging and brand voice approval
- Influencer partnership decisions

**Tasks Requiring Physical Founder Involvement:**
- Influencer relationship building and negotiation
- Press outreach and relationship formation
- Personal story content creation

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Hard (landing page generation, content calendar automation) |
| Founder Hours Saved | 20–40 hrs (landing page + content calendar + influencer research) |
| Business Impact | High — landing page quality directly affects launch conversion rate |

**Gaps Closed:** GAP-C01 (landing page auto-generation), GAP-C02 (Meta Ad Library integration), GAP-C03 (editorial calendar intelligence), GAP-C04 (influencer verification)

---

### Stage 12 — Sales

**Current Founder Tasks:**
- Builds sales toolkit from scratch (one-pager, FAQ, objection guide)
- Researches retail buyers independently
- Creates Amazon listing manually
- Makes channel decisions without structured trade-off analysis

**Tasks Atlas Should Automate:**
- **Sales toolkit auto-build**: Messaging Architecture → one-pager + buyer FAQ + objection guide + competitor comparison sheet → all four documents generated before Stage 12 opens
- Generate Amazon listing (title, bullet points, A+ content draft) from product data and messaging architecture
- Build wholesale buyer contact list from retail buyer database integration (RangeMe/Faire)
- Generate post-purchase email sequence (order confirmation → tracking → arrival → review request)
- Produce three-scenario sales projections (conservative, base, optimistic) from channel and pricing data

**Tasks Atlas Should Research (on-trigger):**
- Margin structure and requirements for each applicable sales channel
- Comparable product performance on relevant marketplace platforms
- Retail buyer and distributor contacts for the product category
- Conversion rate benchmarks for DTC, Amazon, and retail categories

**Tasks Atlas Should Generate:**
- Sales Strategy Document
- Sales Toolkit (one-pager, FAQ, objection guide, competitor comparison)
- Sales Funnel Model (conversion assumptions with documented basis)
- First-Year Sales Projections (three scenarios)
- Post-Purchase Experience Plan (complete email sequence)
- Retail Buyer Pitch Deck (if wholesale/retail channel selected)
- Amazon Listing Draft
- Sales Readiness Assessment

**Tasks Atlas Should Monitor:**
- Amazon listing performance (after analytics integration)
- Wholesale pipeline status (CRM-style tracking)

**Tasks Requiring Founder Approval:**
- Channel selection decision
- Sales conversation scripts (voice must be authentic)
- Conversion rate assumption overrides

**Tasks Requiring Physical Founder Involvement:**
- All sales conversations
- Retail buyer relationship building
- Trade show attendance and networking

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium-Hard (sales toolkit pipeline + retail buyer DB integration) |
| Founder Hours Saved | 12–24 hrs (sales toolkit + Amazon listing + buyer research) |
| Business Impact | High — complete sales toolkit ready before first customer conversation |

**Gaps Closed:** GAP-C05 (wholesale CRM), GAP-C06 (Amazon listing automation), GAP-C07 (retail buyer database)

---

### Stage 13 — Funding

**Current Founder Tasks:**
- Builds pitch deck from scratch (40–75 hours is common)
- Builds financial model manually
- Prepares investor Q&A without structured support
- Researches comparable raises independently
- Finds grant programs independently

**Tasks Atlas Should Automate:**
- **Pitch deck auto-assembly**: market research (S3) + product spec (S5) + brand (S8) + pricing (S10) + unit economics (S10) + team stub → 80%+ complete pitch deck delivered before Stage 13 opens
- Populate 3-year financial model from unit economics and sales projection data
- Generate Investor FAQ with 20 questions + Atlas-drafted answers from invention record
- Research comparable raises (what similar companies at this stage raised at what valuation)
- Surface applicable grant programs (SBIR, STTR, state programs) by product category

**Tasks Atlas Should Research (on-trigger):**
- Angel investors and seed funds active in the product category
- Applicable government grant programs (SBIR, STTR, sector-specific)
- Comparable raises — stage, sector, and geography matched
- Strategic corporate investors in the category
- Crowdfunding platform performance benchmarks for the product type

**Tasks Atlas Should Generate:**
- Pitch Deck (80%+ pre-populated, complete 10–12 slides)
- Financial Model (3-year projection)
- Funding Strategy Document
- Investor FAQ (20 questions with Atlas-drafted answers)
- Use of Proceeds Summary
- Funding Readiness Assessment
- Pitch Feedback Report (from simulated investor Q&A)
- Grant Program Shortlist with application summaries

**Tasks Atlas Should Monitor:**
- Pitch deck view analytics (via DocSend/Pitch.com integration)
- Investor pipeline status (after CRM integration)

**Tasks Requiring Founder Approval:**
- Team narrative and founder story (Atlas cannot write this)
- Valuation and equity terms
- Investor selection

**Tasks Requiring Physical Founder Involvement:**
- All investor meetings (presence, relationships, persuasion)
- Investment negotiations
- Term sheet decisions

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Medium-Hard (pitch deck pipeline is the complexity) |
| Founder Hours Saved | 40–75 hrs (pitch deck alone) + 6–10 hrs investor prep |
| Business Impact | Critical — pitch deck is the single highest hours-saved feature in Atlas |

**Gaps Closed:** GAP-C08 (SBIR/STTR grant database), GAP-C09 (investor pipeline), GAP-C10 (deck analytics)

---

### Stage 14 — Launch

**Current Founder Tasks:**
- Assembles launch checklist manually across all domains
- Sequences launch activities independently
- Monitors launch day without real-time data
- Synthesizes first-week feedback without structured Atlas support

**Tasks Atlas Should Automate:**
- **Cross-domain launch readiness checklist** auto-built from all prior stage completion records (what was done, what wasn't)
- Sequence launch activities with specific dates (30 days out → 14 → 7 → launch day → week 1)
- Monitor pre-launch task completion and flag critical path items at risk
- Build launch day hour-by-hour playbook
- Display real-time sales and conversion data during launch week (requires analytics integration)
- Synthesize first-week customer feedback with pattern extraction

**Tasks Atlas Should Research (on-trigger):**
- Launch timing benchmarks for the product category
- PR coverage opportunities (journalists, outlets, communities)
- Customer review platform setup requirements for applicable channels

**Tasks Atlas Should Generate:**
- Launch Readiness Checklist (all pre-launch tasks with owners, deadlines, status)
- Launch Day Playbook (hour-by-hour)
- Week 1 Customer Feedback Summary (after feedback is submitted)
- Launch Performance Report (actual vs. plan)
- Post-Launch Priority List (top 5 actions from launch data)

**Tasks Atlas Should Monitor:**
- Real-time order volume during launch week (requires Shopify integration)
- Real-time conversion rate vs. benchmark
- Traffic source breakdown (requires GA4 integration)
- Inventory level warnings during launch

**Tasks Requiring Founder Approval:**
- Launch date decision
- Launch-day real-time decisions when deviating from plan

**Tasks Requiring Physical Founder Involvement:**
- All social media posting and press outreach (presence and voice)
- Direct customer relationship responses
- Live community engagement on launch day

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Hard (real-time analytics integration required for full value) |
| Founder Hours Saved | 6–10 hrs (checklist and playbook auto-assembly) |
| Business Impact | High — launch day visibility enables real-time problem detection |

**Gaps Closed:** GAP-C11 (real-time sales integration), GAP-C12 (launch day dashboard)

---

### Stage 15 — Growth

**Current Founder Tasks:**
- Manually collects performance data from disparate platforms
- Builds growth analysis from scratch
- Identifies growth opportunities without data support
- Builds monthly reports manually

**Tasks Atlas Should Automate:**
- **Full KPI monitoring** from connected platforms (Shopify, GA4, email, ads)
- **90-Day Growth Audit** auto-populated with real performance data vs. plan
- Identify top 3 growth levers with expected return on effort from actual data
- Update unit economics model with real CAC, LTV, margin, and churn from actual operations
- Auto-generate monthly Growth Performance Reports with actual vs. target variance
- Surface new SKU candidates from repeat purchase patterns and customer feedback themes
- Monitor competitive activity (pricing changes, new product launches)

**Tasks Atlas Should Research (on-trigger / monthly):**
- Competitor product evolution and pricing changes
- Channel expansion benchmarks for comparable businesses
- International expansion readiness criteria for the product type
- New SKU opportunity based on growth data

**Tasks Atlas Should Generate:**
- 90-Day Growth Audit (with real data)
- Growth Roadmap (90-day plan with initiatives, metrics, review dates)
- Growth Levers Analysis (top 3 with expected impact)
- Monthly Growth Performance Report
- Updated Unit Economics Model (real data replacing estimates)
- Retention Playbook (post-purchase sequences, referral programs)
- New SKU Opportunity Analysis (from repeat purchase patterns)

**Tasks Atlas Should Monitor (continuous, all ongoing):**
- Revenue and revenue growth rate
- Customer acquisition cost (CAC) vs. LTV
- Conversion rate by channel
- Inventory levels and reorder triggers
- Competitive pricing and product landscape
- Review sentiment and NPS trends

**Tasks Requiring Founder Approval:**
- Growth initiative prioritization and investment decisions
- New SKU development approval
- Strategic direction for years 2 and 3

**Tasks Requiring Physical Founder Involvement:**
- New retail account negotiations
- Investor relationships for growth financing
- Key customer relationship management

| Metric | Estimate |
|---|---|
| Implementation Difficulty | Very Hard (full analytics integration required) |
| Founder Hours Saved | 80–120 hrs/year (continuous monitoring automation + monthly reports) |
| Business Impact | Critical — without this, Atlas cannot close the loop between plan and reality |

**Gaps Closed:** GAP-C13 (analytics integration), GAP-C14 (competitive intelligence monitoring), GAP-C15 (new SKU planning)

---

## SECTION 4 — QUESTION ELIMINATION AUDIT

### 4.1 Audit Methodology

Each question category in Atlas is evaluated on three criteria:
1. **Can Atlas determine this automatically?** → Replace with research (AUTO)
2. **Can Atlas partially determine it?** → Pre-fill and allow founder edits (PREFILL)
3. **Is founder input truly required?** → Document why (REQUIRED)

**Target: 80% reduction in manual data entry questions.**

---

### 4.2 Question Audit by Stage

| # | Question Category | Stage(s) | Type | Determination | Action |
|---|---|---|---|---|---|
| 1 | Who are your competitors? | 1, 2, 3 | Research | AUTO | Atlas searches before the founder is asked; presents findings for confirmation |
| 2 | What market category does this product fall into? | 1 | Inference | AUTO | Atlas infers from product description using classification model |
| 3 | What problem does your product solve? | 1 | Founder Knowledge | REQUIRED | Only the founder knows this from personal experience; cannot be researched |
| 4 | What makes your product different? | 1, 2 | Founder Knowledge | REQUIRED | Differentiation is founder's vision; Atlas can challenge it but not determine it |
| 5 | What is your target price range? | 1, 10 | Research+Judgment | PREFILL | Atlas pre-fills from competitive pricing research; founder confirms or adjusts |
| 6 | What is the typical price range for products like mine? | 3, 10 | Research | AUTO | Atlas researches and presents; founder should never be asked this directly |
| 7 | What is the market size for your category? | 3 | Research | AUTO | Atlas builds TAM model from public data; founder confirms methodology |
| 8 | Who are your target customers? | 2, 3 | Founder Knowledge + Research | PREFILL | Atlas pre-populates demographic research; founder refines with personal knowledge |
| 9 | What is your customer willing to pay? | 2, 10 | Research | AUTO | Van Westendorp protocol (2–4 interview questions) + competitive pricing research |
| 10 | What prior art exists in your category? | 4 | Research | AUTO | Atlas runs USPTO/Google Patents search; presents results for founder review |
| 11 | What is novel about your invention? | 4 | Founder Knowledge | REQUIRED | Only the inventor knows their unique insight; Atlas extracts from description |
| 12 | What patents did you find? | 4 | Research | AUTO | Atlas conducts the search; founder should not be asked to supply results |
| 13 | What materials will your product use? | 5 | Founder Vision | REQUIRED | Material decisions involve vision and feel; Atlas surfaces implications not choices |
| 14 | What are the dimensions of your product? | 5 | Founder Decision | REQUIRED | Dimensional decisions are design choices; Atlas provides category benchmarks |
| 15 | What tooling costs should I expect? | 5, 7 | Research | AUTO | Atlas calculates from mold count × geography; never asks the founder |
| 16 | What compliance requirements apply? | 5, 7 | Research | AUTO | Atlas surfaces applicable regulations by product category and target market |
| 17 | Who should I use to prototype? | 6 | Research | AUTO | Atlas researches and recommends fabricators; founder should not be asked to find them |
| 18 | How much will prototyping cost? | 6 | Research | AUTO | Atlas presents benchmarks; founder confirms whether within budget |
| 19 | Who manufactures products like mine? | 7 | Research | AUTO | Atlas researches shortlist by product type and geography |
| 20 | What should I include in my RFQ? | 7 | Research + Assembly | AUTO | Atlas generates RFQ from product spec; founder should not write this |
| 21 | What is the typical MOQ for my product type? | 7 | Research | AUTO | Atlas presents benchmarks from category research |
| 22 | What is my COGS? | 7, 10 | Calculation | PREFILL | Atlas calculates from entered quote data; founder enters quotes, Atlas calculates everything else |
| 23 | What is my brand name? | 8 | Founder Decision | REQUIRED | Final name decision belongs to the founder; Atlas generates candidates |
| 24 | What names are available? | 8 | Research | AUTO | Atlas runs trademark, domain, and handle checks on all candidates |
| 25 | What is my brand positioning? | 8 | Founder Vision + Framework | PREFILL | Atlas drafts from customer segment data; founder refines to authentic vision |
| 26 | What should be in my IP brief? | 9 | Assembly | AUTO | Atlas assembles from prior stages; founder should not build this from scratch |
| 27 | When is my patent deadline? | 9 | Calculation | AUTO | Atlas calculates from entered filing date; no question needed |
| 28 | What are my margins? | 10 | Calculation | AUTO | Atlas calculates from COGS and competitive pricing data |
| 29 | When do I break even? | 10 | Calculation | AUTO | Atlas calculates from unit economics model; no input needed |
| 30 | What are the right marketing channels for my product? | 11 | Research + Analysis | AUTO | Atlas scores all 8 channels against product profile; presents recommendation |
| 31 | What should my landing page say? | 11 | Generation | AUTO | Atlas generates from Voice Guide and Messaging Architecture |
| 32 | Who are the right influencers? | 11 | Research | AUTO | Atlas researches and profiles 15+ accounts |
| 33 | What should my sales one-pager say? | 12 | Generation | AUTO | Atlas generates from product data and messaging architecture |
| 34 | Who are the relevant retail buyers? | 12 | Research | AUTO | Atlas integrates with buyer database or researches by category |
| 35 | What should my pitch deck say? | 13 | Assembly | AUTO | Atlas assembles 80%+ from prior stages; founder provides Team and Ask |
| 36 | What are my 3-year projections? | 13 | Calculation | AUTO | Atlas calculates from unit economics and sales model |
| 37 | What grants apply to my product? | 13 | Research | AUTO | Atlas searches SBIR, STTR, state programs by product category |
| 38 | What does my launch checklist need? | 14 | Assembly | AUTO | Atlas assembles from all prior stage completion records |
| 39 | How is my business performing? | 15 | Analytics | AUTO | Atlas connects to platforms; no founder data collection needed |
| 40 | What should I focus on next? | 15 | Analysis | AUTO | Atlas analyzes KPIs and surfaces top 3 growth levers |

---

### 4.3 Question Elimination Summary

| Category | Count | Percentage |
|---|---|---|
| **AUTO** — Atlas replaces with research, calculation, or assembly | 27 | 67.5% |
| **PREFILL** — Atlas pre-fills; founder confirms or adjusts | 6 | 15.0% |
| **REQUIRED** — Irreducible founder input | 7 | 17.5% |
| **Total question categories audited** | **40** | 100% |

**Projected data entry reduction: 82.5%** (AUTO + PREFILL — founder only edits pre-filled answers, not starts from blank)

**The 7 irreducible founder questions:**
1. What problem does your product solve? (personal experience, cannot be researched)
2. What makes your product different? (founder vision, Atlas challenges but cannot determine)
3. What is novel about your invention? (inventor's insight, cannot be researched)
4. What materials will your product use? (vision + tactile judgment)
5. What are the dimensions of your product? (design decision)
6. What is your brand name? (final decision belongs to founder)
7. Team narrative and founder story (only the founder knows their story)

**All other questions either disappear (AUTO) or become confirmations of pre-researched answers (PREFILL).**

---

## SECTION 5 — DELIVERABLE AUTOMATION

*Every document Atlas should generate automatically across all 15 stages.*

| Deliverable | Stage | Inputs Required | Automation Level | Human Review |
|---|---|---|---|---|
| **Idea Brief** | 1 | Free-form conversation input | High | Optional |
| **Idea Completeness Assessment** | 1 | Idea Brief | Full | No |
| **Initial Competitive Context Summary** | 1 | Product description → web search | Full | Optional |
| **Assumption Risk Map** | 2 | Idea Brief | Full | Optional |
| **Customer Interview Guide** | 2 | Idea Brief + target audience | Full | Optional |
| **Validation Research Plan** | 2 | Assumption Risk Map | Full | Optional |
| **Competitive Landscape Report** | 2, 3 | Product description → web search | High | Required |
| **Validation Report** | 2 | Founder-submitted interview notes | High | Required |
| **Go/No-Go Recommendation** | 2 | Validation Report | Full | Required |
| **TAM/SAM/SOM Model** | 3 | Category research + demographic data | High | Required |
| **Customer Segment Profiles** | 3 | Stage 2 interview data + demographic research | High | Required |
| **Market Opportunity Assessment** | 3 | TAM model + competitive landscape | Full | Optional |
| **Market Research Summary** | 3 | All Stage 3 outputs | High | Required |
| **Competitive Positioning Map** | 3 | Competitive landscape data | Full | Optional |
| **Prior Art Search Query Set** | 4 | Invention description | Full | No |
| **Prior Art Summary** | 4 | USPTO/Google Patents API results | High | Required |
| **Novel Element Statements** | 4 | Invention description + prior art summary | High | Required |
| **IP Strategy Recommendation** | 4 | Prior art summary + novel elements | Full | Required |
| **Patent Readiness Report** | 4 | All Stage 4 outputs | High | Required |
| **NDA (Unilateral — Manufacturing)** | 4, 9 | Invention name + owner + jurisdiction | Full | Optional |
| **NDA (Mutual — Investor)** | 9 | Invention name + both party names | Full | Optional |
| **IP Brief (Attorney-Ready)** | 9 | Stages 4 + 5 + 8 outputs auto-assembled | High | Required |
| **Product Design Specification** | 5 | Structured design conversation | High | Required |
| **Tooling Cost Estimate** | 5 | Mold count + geography | Full | No |
| **Food Contact Compliance Checklist** | 5 | Product category + target market | Full | No |
| **Retail Compliance Pre-Qualification Checklist** | 7 | Product category + target channel | Full | No |
| **Prototype Plan** | 6 | Product Design Spec + open design questions | High | Required |
| **Prototype Sourcing Guide** | 6 | Product type + geography | Full | Optional |
| **IP Pre-Engagement Checklist** | 6 | Stage 4 IP status | Full | No |
| **Prototype Test Report Template** | 6 | Prototype Plan | Full | No |
| **RFQ Document** | 7 | Product Design Specification | Full | Optional |
| **Manufacturer Shortlist** | 7 | Product type + geography | High | Required |
| **Manufacturer Evaluation Scorecard** | 7 | Manufacturer bids + criteria | Full | No |
| **Unit Economics Model** | 7, 10 | Manufacturer quotes + pricing data | Full | Required |
| **MOQ Impact Summary** | 7 | MOQ + COGS + SKU count | Full | No |
| **Manufacturing Timeline** | 7 | Product type + geography + stage dates | Full | Optional |
| **Multi-Component Supply Chain Tracker** | 7 | Component list + suppliers | High | Required |
| **Contract Review Checklist** | 7 | Product type + manufacturing geography | Full | No |
| **Brand Name Candidates** | 8 | Product description + competitive landscape | Full | Optional |
| **Name Evaluation Report** | 8 | Brand name candidates + availability checks | Full | Required |
| **Brand Identity System** | 8 | Positioned brand conversation | High | Required |
| **Brand Positioning Statement** | 8 | Brand conversation + customer profiles | High | Required |
| **Brand Voice Guide** | 8 | Brand Identity System | Full | Optional |
| **Visual Direction Brief** | 8 | Brand Identity System + aesthetic direction | High | Required |
| **IP Filing Checklist** | 9 | IP strategy decision + filing dates | Full | No |
| **IP Deadline Tracker** | 9 | Provisional filing date | Full | No |
| **IP Status Tracker** | 9 | All IP filing events | Full | No |
| **Pricing Strategy Document** | 10 | Unit economics + competitive pricing + value analysis | High | Required |
| **Break-Even Analysis** | 10 | Unit economics + volume projections | Full | No |
| **Pricing Scenario Analysis** | 10 | Unit economics + three price points | Full | Optional |
| **Go-to-Market Marketing Plan** | 11 | All prior stage outputs | High | Required |
| **Messaging Architecture** | 11 | Customer profiles + brand identity + competitive landscape | High | Required |
| **Landing Page Copy + HTML** | 11 | Voice Guide + Messaging Architecture + brand inputs | High | Required |
| **Pre-Launch Marketing Calendar** | 11 | Launch date + channels + content strategy | Full | Optional |
| **90-Day Content Calendar** | 11 | Content strategy + channel selection | Full | Optional |
| **Ad Creative Briefs** | 11 | Messaging Architecture + channel strategy | High | Optional |
| **Influencer Research List** | 11 | Product category + target audience | Full | Required |
| **Press Kit** | 11 | Brand identity + product story + key facts | High | Optional |
| **Sales Strategy Document** | 12 | Channel analysis + pricing + customer profiles | High | Required |
| **Sales Toolkit** | 12 | Messaging Architecture + competitive landscape | Full | Optional |
| **Sales Funnel Model** | 12 | Channel benchmarks + pricing data | Full | Required |
| **First-Year Sales Projections** | 12 | Sales funnel model + market sizing | Full | Required |
| **Retail Buyer Pitch Deck** | 12 | Brand identity + product spec + pricing + compliance | High | Required |
| **Amazon Listing Draft** | 12 | Product data + Messaging Architecture | Full | Optional |
| **Post-Purchase Email Sequence** | 12 | Brand voice + customer profile | Full | Optional |
| **Investor Pitch Deck** | 13 | Stages 3+5+8+10+12 auto-assembled | High | Required |
| **Financial Model (3-year)** | 13 | Unit economics + sales projections | Full | Required |
| **Funding Strategy Document** | 13 | Stage + capital needs + comparable raises | High | Required |
| **Investor FAQ** | 13 | Invention record + financial model | Full | Optional |
| **Use of Proceeds Summary** | 13 | Financial model + funding amount | Full | Optional |
| **Funding Readiness Assessment** | 13 | All Stages 1–12 completion status | Full | No |
| **Grant Program Shortlist** | 13 | Product category + business stage | Full | Optional |
| **Launch Readiness Checklist** | 14 | All prior stage completion records | Full | Optional |
| **Launch Day Playbook** | 14 | Launch date + channels + assets | Full | Optional |
| **Launch Performance Report** | 14 | Analytics integration data | Full | Required |
| **Post-Launch Priority List** | 14 | Launch performance data | Full | Required |
| **90-Day Growth Audit** | 15 | Analytics data vs. plan | Full | Required |
| **Growth Roadmap** | 15 | 90-Day audit + growth lever analysis | High | Required |
| **Monthly Growth Performance Report** | 15 | Analytics integration data | Full | Required |
| **Updated Unit Economics (actuals)** | 15 | Real CAC + LTV + margins from platforms | Full | Optional |
| **Retention Playbook** | 15 | Customer data + repeat purchase patterns | High | Optional |
| **New SKU Opportunity Analysis** | 15 | Repeat purchase + feedback + margin data | Full | Required |

**Total deliverables: 76 documents across 15 stages**
**Full Automation: 42 (55%) — Atlas generates entirely from prior data or research**
**High Automation: 34 (45%) — Atlas generates draft from prior data; founder reviews and refines**
**Human Review Required: 42 (55%) — founder must review before committing**
**Human Review Optional: 34 (45%) — founder can review or approve without changes**
**Human Review Not Required: 0 — every document benefits from at least optional founder review**

---

## SECTION 6 — RESEARCH ENGINE

*All research Atlas should perform automatically across the journey.*

| Research Item | Description | Frequency | Trigger Event | Output Format | Stages |
|---|---|---|---|---|---|
| **Competitive Product Landscape** | Top 5–10 competing products with pricing, features, distribution, positioning | On-trigger + monthly | Stage 1 open; Stage 2 open; Stage 3 open; monthly after launch | Competitive landscape table surfaced in relevant stage; monthly update in Stage 15 dashboard | 1, 2, 3, 15 |
| **Prior Art Search** | USPTO + Google Patents search using invention description → top 20 most relevant patents with relevance scores | On-trigger | Stage 4 open | Prior Art Summary document + ranked patent list in Stage 4 view | 4 |
| **Patent Landscape Monitoring** | New filings in the technology area since last check | Monthly | After Stage 4 completion | Alert digest in Stage 9/IP Status Tracker | 4, 9 |
| **Market Size & Category Data** | TAM/SAM/SOM data from public sources, comparable category sizes, growth rates | On-trigger | Stage 3 open | Pre-populated TAM model in Stage 3 | 3 |
| **Search Trend Volume** | Google Trends + keyword search volume for product category and related terms | On-trigger + monthly | Stage 3 open; monthly after Stage 11 | Chart embedded in Market Research; monthly in Stage 15 | 3, 11, 15 |
| **Competitive Pricing** | Current retail prices for comparable products across DTC, Amazon, and retail channels | On-trigger + monthly | Stage 10 open; monthly after launch | Pre-populated competitive pricing table in Stage 10; monthly update in Stage 15 | 10, 15 |
| **Customer Reviews & Sentiment** | Amazon reviews and forum posts about competing products — what customers love and hate | On-trigger | Stage 2 open; Stage 3 open | Sentiment summary embedded in Validation and Market Research stages | 2, 3 |
| **Manufacturer Research** | Manufacturers in the product category, domestic and international, with minimum credentials | On-trigger | Stage 7 open | Manufacturer shortlist (5–8 candidates) with evaluation notes | 7 |
| **Retail Buyer Contacts** | Relevant retail buyer contacts in target channels (RangeMe/Faire integration or research) | On-trigger | Stage 12 open | Buyer contact list with channel and category notes | 12 |
| **Industry Trends & Tailwinds** | Published reports on market trends, headwinds, category growth, and consumer shifts | On-trigger | Stage 3 open | Trend summary embedded in Market Research | 3 |
| **Regulatory Requirements** | Applicable regulations by product category and target market (FDA, CE, Prop 65, etc.) | On-trigger | Stage 5 open | Compliance checklist pre-populated by product type | 5, 7 |
| **IP Attorney Directory** | IP attorneys with relevant specialization (consumer goods, materials, product type) | On-trigger | Stage 9 open | Shortlist of 3–5 attorneys with approach email template | 9 |
| **Trademark Availability** | USPTO TESS search for brand name candidates | On-trigger | Stage 8 (on each name candidate) | Pass/fail with risk score per candidate | 8 |
| **Domain + Handle Availability** | Domain (.com, .co) + Instagram + TikTok + Pinterest handles for name candidates | On-trigger | Stage 8 (on each name candidate) | Availability matrix per candidate | 8 |
| **Grant Programs** | SBIR, STTR, state programs applicable to the product category and business stage | On-trigger | Stage 13 open | Grant shortlist with application summaries | 13 |
| **Comparable Raises** | What similar companies at similar stage raised at what valuation | On-trigger | Stage 13 open | Comparable raise data table embedded in Funding Strategy | 13 |
| **Influencer Accounts** | Relevant influencer accounts in the product category with engagement metrics | On-trigger | Stage 11 open | Profiled influencer list (15+ accounts) in Stage 11 | 11 |
| **Editorial Calendar Intelligence** | Publication editorial calendars and pitching windows for target press outlets | On-trigger | Stage 11 open | Press timing recommendations embedded in Pre-Launch Calendar | 11 |
| **Prototype Fabricators** | Relevant prototyping services by product type and prototype phase | On-trigger | Stage 6 open | Prototype Sourcing Guide in Stage 6 | 6 |
| **Competitor Marketing Intelligence** | Competitor ad creative, channel presence, messaging patterns (Meta Ad Library + web) | On-trigger + monthly | Stage 11 open; monthly after launch | Competitive marketing summary in Stage 11; monthly update in Stage 15 | 11, 15 |
| **Channel Performance Benchmarks** | DTC, Amazon, wholesale, and retail conversion rate and margin benchmarks | On-trigger | Stage 11 open; Stage 12 open | Channel scoring matrix pre-seeded with benchmarks | 11, 12 |
| **Freight & Logistics Costs** | Shipping cost estimates from manufacturing geography to warehouse and to customer | On-trigger | Stage 7 open | Logistics cost estimate embedded in Unit Economics | 7, 10 |
| **Launch Timing Benchmarks** | Best launch timing for product category (seasonality, competitive windows) | On-trigger | Stage 14 open | Launch date recommendation with reasoning | 14 |
| **Continuous KPI Monitoring** | Shopify revenue, GA4 traffic, email platform metrics, ad platform ROAS, Amazon rankings | Continuous (daily) | After analytics integration (Stage 14/15) | Stage 15 KPI dashboard; monthly performance report auto-generated | 15 |
| **Competitive Intelligence Feed** | Competitor price changes, new product launches, review sentiment shifts, press coverage | Weekly | After Stage 14 launch | Weekly digest in Stage 15 growth view | 15 |
| **New SKU Opportunities** | Repeat purchase patterns, product review theme clustering, margin analysis for expansion | Monthly | After 90 days of launch data | New SKU Opportunity Analysis surfaced in Stage 15 | 15 |

---

### 6.1 Research Engine Architecture

**Implementation Location:** `convex/researchEngine.ts` (new file)

**Trigger Mechanism:**
```
stageConfig[n].onOpen = async (ctx, inventionId) => {
  await triggerStageResearch(ctx, inventionId, stageConfig[n].researchTasks)
}
```

**Research Task Queue:** Convex action queue with research tasks per stage. Tasks run in background (30–120 seconds). Results stored in `stageResearch` table (new, keyed by `inventionId × stageId × researchType`).

**Output Routing:** Each research task defines its output route:
- `stage_view` — surfaces in the stage's data view for the founder to see
- `document_input` — feeds into document auto-assembly pipeline
- `risk_tracker` — surfaces in persistent risk sidebar
- `monitoring_feed` — added to continuous monitoring queue (post-launch)

**Data Sources Required:**

| Source | Integration Type | Stages |
|---|---|---|
| Web Search API (Perplexity / Brave Search / SerpAPI) | API key | 1, 2, 3, 7, 11, 12, 13, 15 |
| USPTO Patent Full-Text API | API key | 4, 9 |
| Google Patents (via SerpAPI or direct) | API key | 4 |
| Trademark Electronic Search System (TESS) | USPTO API | 8 |
| Domain availability API (Namecheap / GoDaddy) | API key | 8 |
| Instagram / TikTok / Pinterest handle check | Public scrape or API | 8 |
| Shopify Admin API | OAuth + per-founder | 14, 15 |
| Google Analytics 4 Data API | OAuth + per-founder | 14, 15 |
| Klaviyo / Mailchimp API | OAuth + per-founder | 15 |
| Meta Ads API / Google Ads API | OAuth + per-founder | 15 |
| RangeMe or Faire buyer database | API partnership | 12 |
| SBIR.gov / Grants.gov API | Public API | 13 |

---

## SECTION 7 — AUTOMATION ROADMAP

### MUST HAVE — Ship Q3 2026 (Months 1–3)

*Core automations that directly remove founder pain. Without these, Atlas is still a guided form tool.*

| Feature | What It Does | Effort | Founder Value | Dependencies |
|---|---|---|---|---|
| **IP Deadline Tracker** | Auto-calculate 12-month provisional→utility window; alert at 9/11/11.5 months | S | Critical | None |
| **Public Disclosure Tracker** | Log public disclosures; auto-calculate statutory bar date; alert at 90 days | S | Critical | None |
| **IP Pre-Engagement Checkpoint** | Gating question before Stage 6 advances: "Have you filed provisional or signed NDA?" | S | Critical | None |
| **MOQ Impact Summary** | When MOQ + COGS + SKU count entered in Stage 7: auto-calculate total minimum inventory commitment | S | High | Stage 7 must be enabled |
| **Break-Even Timeline Output** | Auto-calculate break-even at 3 volume scenarios from Stage 10 unit economics | S | High | Stage 10 must be enabled |
| **Tooling Cost Preview** | Mold count × geography → realistic cost range displayed at SKU architecture decision | S | High | Stage 5 must be enabled |
| **Retail Compliance Checklist** | Static configurable checklist by product type + target channel; triggers at Stage 7 | S | High | Stage 7 must be enabled |
| **NDA Generator** | Unilateral manufacturing NDA + mutual investor NDA from invention record | M | High | Stage 4 NDA fields |
| **Unit Economics Auto-Builder** | Ingest Stage 7 manufacturer quote fields → auto-populate complete unit economics model | M | Critical | Stage 7 manufacturer quote fields |
| **Stage 5 Physical Product Spec Module** | Product type dropdown activates material-specific spec fields | M | Critical | Stage 5 enablement |

**Q3 Rationale:** These items require zero new infrastructure and have maximum gap closure per development day. Eight of ten are simple calculations or configuration changes. Two (Unit Economics, Physical Product Spec) require medium effort but are blocking for all downstream stages.

---

### SHOULD HAVE — Ship Q4 2026 (Months 4–6)

*High-value automations that elevate Atlas toward autonomous assistant status.*

| Feature | What It Does | Effort | Founder Value | Dependencies |
|---|---|---|---|---|
| **Document Auto-Assembly Pipeline — Phase 1** | IP Brief (S4+S5+S8) and Pitch Deck (S3+S5+S8+S10+S13) auto-populated at stage open | L | Critical | Stages 3,4,5,8,10 must be enabled |
| **Landing Page Auto-Generation** | Voice Guide + Messaging Architecture → HTML-ready landing page copy | M | High | Stage 11 + brand fields |
| **Sales Toolkit Auto-Build** | Messaging Architecture → one-pager + FAQ + objection guide + competitor comparison | M | High | Stages 8, 11, 12 data |
| **Prior Art Search Automation — Phase 1** | Atlas generates USPTO search queries and surfaces results; founder still confirms | L | Critical | USPTO API key |
| **Brand Name Generator** | Constraints-based name generation → 20 candidates with scoring | M | High | Stage 8 enablement |
| **Trademark + Social Handle Checker** | USPTO TESS + domain + IG/TikTok/Pinterest in one workflow | M | High | API keys; Brand Name Generator |
| **Competitive Research at Stage 1 Open** | Web search → top 5 competitors presented before founder describes theirs | M | High | Web Search API |
| **CPG Market Sizing Module** | Build-from-components methodology for niche categories; resolves Stage 3 block | M | High | Stage 3 enablement |
| **Channel Evaluation Matrix Auto-Scoring** | All 8 marketing channels auto-scored against product profile | S | High | Stage 11 + product profile data |
| **Investor FAQ with Pre-Populated Answers** | 20 investor questions with Atlas-drafted answers from invention record | M | High | Stages 4+5+8+10+12 data |
| **90-Day Content Calendar Auto-Generation** | 30+ posts with topic/format/CTA/channel/date | M | High | Stage 11 channel strategy |

**Q4 Rationale:** These features implement the Constitution's "Generate Before Requesting" and "Research Before Asking" principles at scale. They require some API integrations but no new infrastructure.

---

### NICE TO HAVE — Ship Q1 2027 (Months 7–9)

*Valuable features that add significant polish without being blocking for the core promise.*

| Feature | What It Does | Effort | Founder Value | Dependencies |
|---|---|---|---|---|
| **Prior Art Search — Full Automation** | Atlas executes full search, ranks results, produces prior art summary entirely automatically | XL | Critical | USPTO + Google Patents APIs; Phase 1 |
| **Competitive Pricing Monitor** | Live competitor pricing refresh at Stage 10 open + monthly monitoring | M | Medium | Web search API |
| **Influencer Research + Profiling** | 15+ accounts profiled with follower count, engagement rate, estimated cost | L | High | Stage 11; scraping/API |
| **Retail Buyer Database Integration** | RangeMe/Faire integration → curated buyer contact list in Stage 12 | L | High | RangeMe/Faire partnership |
| **Amazon Listing Auto-Generation** | Product data + Messaging Architecture → complete Amazon listing draft | M | High | Stage 12 enablement |
| **Grant Database Integration** | SBIR.gov + Grants.gov → relevant programs surfaced in Stage 13 | M | Medium | Public APIs |
| **Break-Even Visualizer with Chart** | Visual chart for break-even scenarios rather than text output | S | Medium | Break-Even Output (Must Have) |
| **Manufacturer Shortlist Research** | Web research → shortlist 5–8 manufacturers by product type and geography | L | High | Web search API |
| **Post-Purchase Email Sequence Auto-Draft** | Brand voice → 5-email post-purchase sequence draft | M | Medium | Stage 12 + brand voice |
| **Press Kit Auto-Assembly** | Brand identity + product story + key facts → press kit document | M | Medium | Stage 8 + Stage 11 data |

---

### FUTURE VISION — Q2 2027+ (Months 10+)

*Ambitious features requiring significant infrastructure or data foundations.*

| Feature | What It Does | Effort | Founder Value | Dependencies |
|---|---|---|---|---|
| **Analytics Integration Platform** | Shopify + GA4 + email + ads → real-time KPI dashboards + automated reports | XL | Critical | Must Have Q3 + Should Have Q4 |
| **Stage Self-Evaluation Hook (All Stages)** | 7-question pre-stage engine runs for all 15 stages at open | XL | Critical | Research Engine + Document Pipeline |
| **Glass/CPG Manufacturing Guidance Module** | Full glass/ceramics manufacturing guidance, database, and prototyping path | XL | High | Physical Product Module (Must Have) |
| **Launch Day Real-Time Dashboard** | Live Shopify orders, conversion rate, traffic sources during launch | L | High | Analytics Integration |
| **Founder-to-Professional Matching Engine** | IP attorneys, industrial designers, manufacturing brokers directory with approach emails | L | High | IP Directory research + categorization |
| **Investor Pipeline CRM** | Contact tracking, deck analytics, follow-up scheduling within Atlas | L | Medium | Deck Analytics integration |
| **Deck Analytics Integration** | DocSend/Pitch.com integration → page-level deck view data | M | Medium | Pitch deck auto-assembly |
| **Multi-Component Supply Chain Model** | Full multi-supplier tracker with lead times, MOQs, and relationship tracking | L | High | Manufacturing module |
| **Competitive Intelligence Monitoring Feed** | Continuous competitor price, product, and press monitoring | L | Medium | Analytics integration |
| **New SKU Planning Module** | Repeat purchase patterns + feedback + margin → "recommend next SKU" | M | Medium | Analytics Integration + Growth stage |
| **Physical CPG Vertical — Full** | Complete material-type configuration for Glass, Soft Goods, Electronics, Injection Molded | XL | Critical | Physical Product Module (Must Have) |

---

## SECTION 8 — SUCCESS METRICS

*Measurable KPIs for the Atlas automation system. Baselines reflect current state (July 2026). Targets reflect the Q3 2026 (6-month) and Q1 2027 (12-month) roadmap completion states.*

| Metric | Definition | Baseline (July 2026) | 6-Month Target (Q1 2027) | 12-Month Target (Q3 2027) | Measurement |
|---|---|---|---|---|---|
| **Average Founder Time Saved Per Stage** | Estimated hours saved vs. without Atlas, per stage completion | ~2–4 hrs (Stages 1–4 only) | ~6–10 hrs across all live stages | ~12–20 hrs across all 15 stages | User session data + stage completion surveys |
| **Question Elimination Rate** | % of question categories that are AUTO or PREFILL vs. REQUIRED | ~0% (all manual today) | 60% eliminated | 82%+ eliminated | Questions presented vs. questions auto-answered ratio in `stageProgress` |
| **Documents Generated Automatically** | Count of documents auto-generated per completed journey | ~4–6 (Stages 1–4 reports) | ~20–30 per journey | ~50–60 per journey | `documents` table count per `inventionId` |
| **Research Tasks Completed Without Founder Input** | % of research tasks completed by Atlas vs. manually supplied by founder | ~0% (all manual) | ~30% | ~70% | `stageResearch` records auto-generated vs. founder-submitted |
| **Stage Completion Rate** | % of users who complete each stage once started | Baseline TBD from analytics | Improve by 15% vs. baseline | Improve by 30% vs. baseline | `stageProgress.completedAt` vs. `stageProgress.startedAt` in Convex |
| **Journey Completion Rate** | % of users who reach Stage 15 completion from Stage 1 start | TBD (Stages 5–15 not yet live) | 10% baseline (first cohort through all stages) | 20% | `stageProgress` completion events across all 15 stages |
| **Commercial Readiness Score at Journey Completion** | Atlas's internal readiness score average across all 15 stages at journey completion | N/A (stages 5–15 not live) | 70+ average score | 80+ average score | `stageProgress.readinessScore` average across all stages at completion |
| **Time to First Deliverable** | Minutes from stage entry to first auto-generated document appearing | ~15–30 min (after founder inputs) | <5 min (Atlas pre-generates at stage open) | <2 min (pre-generated before stage opens) | `stageProgress.openedAt` → `documents.createdAt` for first document |
| **Founder-Initiated vs. Atlas-Initiated Actions** | Ratio of actions Atlas takes automatically vs. actions triggered by founder clicking | ~1:10 (founder does almost everything) | ~1:3 | ~1:1 | `stageProgress` event log: `source: "atlas_auto"` vs. `source: "founder"` |
| **Founder Satisfaction Score** | Post-stage survey: "How much did Atlas reduce your workload this stage?" (1–5) | Baseline TBD | 4.0+ average | 4.5+ average | In-product NPS-style micro-survey triggered at stage completion |
| **Data Re-Entry Incidents** | Count of times founder is asked for data Atlas already collected in a prior stage | Not measured today | <2 per journey | 0 per journey | Field-level tracking: source = "prior_stage_carry" vs. source = "new_founder_input" |
| **IP Deadline Miss Rate** | % of founders who miss the provisional→utility conversion window | Not tracked (tracker doesn't exist) | 0% (tracker ships in Q3 2026) | 0% | IP deadline tracker alert log + conversion event |
| **Document Review Rate** | % of auto-generated documents that founders review and approve vs. skip | Baseline TBD | 80%+ review rate | 85%+ review rate | `documents.reviewedAt` present vs. null |

---

### 8.1 Metric Instrumentation Plan

**Required Convex Schema Additions:**

The following fields must be added to support metric measurement:

```
// Add to stageProgress table
source: v.union(v.literal("atlas_auto"), v.literal("founder_input")),
// Per-field tracking of where each value came from

// Add to documents table
reviewedAt: v.optional(v.number()),
source: v.union(v.literal("atlas_generated"), v.literal("founder_created")),
generatedAtMs: v.number(), // time from stage open to generation

// New stageEvents table
stageId: v.number(),
inventionId: v.id("inventions"),
eventType: v.string(), // "stage_open" | "atlas_research_complete" | "document_generated" | "founder_reviewed"
source: v.union(v.literal("atlas_auto"), v.literal("founder")),
timestamp: v.number(),
```

---

## SECTION 9 — IMPLEMENTATION PRINCIPLES

*Permanent engineering rules for every future Atlas feature. These are not aspirational values — they are concrete filters applied in code review, sprint planning, and feature design.*

---

### Principle 1: Atlas Performs More Work

**The Rule:** If a proposed feature increases the work the founder must do — adds a form, adds questions, adds a step, adds a decision without first doing the research — it is not ready to ship.

**How to Apply in Code Review:**
- Review the founder interaction flow for the feature. Count the number of distinct inputs required from the founder.
- Ask: "Could Atlas have pre-computed or pre-filled any of these inputs from prior stage data or web research?"
- If yes, the PR is incomplete. Return for revision with a note: "Pre-populate [field] from [source] before presenting to founder."

**When Exceptions Are Acceptable:**
- The feature is a one-time founder input that is genuinely unknowable by Atlas (see the 7 irreducible questions in Section 4)
- The feature is a confirmation step for data Atlas researched — confirmation is acceptable; blank-form entry is not

**Passes This Test:**
- Unit Economics Auto-Builder: Atlas ingests Stage 7 quotes and calculates all margins automatically. Founder reviews a pre-populated model, not a blank spreadsheet.

**Fails This Test:**
- A "Market Research" feature that opens Stage 3 with a blank form asking "What is the market size for your product category?" — Atlas should be researching this, not asking.

---

### Principle 2: Atlas Reduces Founder Effort

**The Rule:** Every shipped feature must measurably reduce the time or decisions required from the founder relative to the pre-feature state.

**How to Apply in Code Review:**
- Estimate: "How many founder-minutes does this feature save?" If the answer is zero or negative, the feature is not compliant.
- Measure time saved in: data entry minutes eliminated, research hours eliminated, decision points removed, steps removed from the workflow.

**When Exceptions Are Acceptable:**
- Features that increase short-term effort in service of dramatically reduced long-term effort (e.g., connecting analytics integration requires OAuth setup once, saves 120 hours/year)
- One-time setup steps that eliminate all future repetition

**Passes This Test:**
- IP Deadline Tracker: founder enters one date (provisional filing date). Atlas automatically calculates all deadlines and sends all alerts. All future monitoring effort: zero.

**Fails This Test:**
- A "Launch Calendar" feature that gives the founder a blank calendar template to fill in. Atlas should generate the calendar from the launch date and prior stage data — not hand the founder a template.

---

### Principle 3: Atlas Generates More Finished Work

**The Rule:** Every document, report, analysis, or plan Atlas is aware needs to exist must arrive as a populated draft — not a template, not a guide, not an outline. The Draft-First Policy applies without exception.

**The Draft-First Policy:**
> Before any stage presents a blank field or empty document to the founder, Atlas must attempt to generate a populated draft. Even if the draft is 40% complete, a 40%-complete draft is better than a blank page.

**How to Apply in Code Review:**
- Review every document the feature produces. Is it populated with data from prior stages?
- If the document has any fields that could be pre-populated from prior stage `stageProgress` data, they must be pre-populated.
- "The founder can always edit it" is not a reason to leave it blank — it is the reason to pre-populate it.

**When Exceptions Are Acceptable:**
- Fields that are truly unknowable (founder story, personal vision, aesthetic judgment)
- Fields that require the current stage's output as input (cannot be pre-populated until this stage runs)

**Passes This Test:**
- Pitch Deck Auto-Assembly: Atlas pulls market research (Stage 3), product spec (Stage 5), brand identity (Stage 8), pricing (Stage 10), and financial projections (Stage 13) into the deck automatically. 80%+ populated before the founder sees it.

**Fails This Test:**
- An "Investor Deck" feature that gives the founder a 12-slide PowerPoint template with blank slides and instructions for each slide.

---

### Principle 4: Atlas Reduces Manual Typing

**The Rule:** The Research-First Policy requires Atlas to research before asking the founder to supply information. The Approval-Gate Policy requires Atlas to interrupt the founder only for irreducible decisions. Every other touchpoint should be pre-populated.

**The Research-First Policy:**
> Before generating any question that asks the founder to supply information Atlas could research, Atlas must first conduct the research and present findings for confirmation.

**The Approval-Gate Policy:**
> The founder should be interrupted only when a decision genuinely requires their judgment, vision, or physical presence. All other gates should be automatic.

**How to Apply in Code Review:**
- Review every input field and question in the feature.
- For each, ask: "Is this information that Atlas could find via web search, API, or prior stage data?"
- If yes, Atlas finds it first. The field becomes a "confirm or adjust" interaction, not a blank entry.

**When Exceptions Are Acceptable:**
- Information that is personal and private (founder financial situation, team equity)
- Information that is subjective and vision-dependent (aesthetic preferences, strategic priorities)

**Passes This Test:**
- Competitive Pricing Research in Stage 10: Atlas runs a web search for competitor pricing before Stage 10 opens. Founder sees a pre-populated "Competitive Pricing Context" table. No manual research needed.

**Fails This Test:**
- Any question that asks: "Who are your competitors?" — Atlas must answer this before asking. If the founder needs to confirm or add to the list Atlas found, that is acceptable. Asking from a blank slate is not.

---

### Principle 5: Atlas Increases the Probability of Inventor Success

**The Rule:** Every feature must connect to a commercial outcome. Features that improve internal metrics (faster load time, prettier UI, additional settings) are only valuable if they correlate to improved inventor success rates.

**Definition of Inventor Success:**
- Completing the 15-stage journey
- Achieving Commercial Readiness Score ≥ 80
- Reaching market (product available for purchase)
- Achieving a commercial metric milestone (first revenue, first retail account, first investor meeting, first unit economics model with positive margin)

**How to Apply in Feature Design:**
- Every proposed feature must answer: "Which of these success metrics does this feature improve, and by how much?"
- Features that cannot answer this question are deprioritized until they can.

**When Exceptions Are Acceptable:**
- Infrastructure features (analytics instrumentation, schema migrations) that enable future success-correlating features
- Trust and transparency features (honest disclaimers, ToS updates) that improve founder confidence in Atlas

**Passes This Test:**
- IP Pre-Engagement Checkpoint: prevents the loss of patent rights (irreversible commercial failure) before prototype sharing. Directly increases probability of commercial success by eliminating the most catastrophic early mistake.

**Fails This Test (needs reconsideration):**
- A "visual redesign" of the Stage 3 market research view that changes layout without improving completion rate or data quality.
- An "admin dashboard" for the Atlas team that has no founder-facing impact.

---

### 9.1 The Transparency Policy

**Rule:** Atlas must always show what it researched, what it assumed, and what it does not know.

**Implementation Pattern:**
Every Atlas-generated document, analysis, or recommendation must include one of three metadata annotations:

| Annotation | Meaning | When Used |
|---|---|---|
| `Atlas researched` | Data sourced from web search or API with source reference | Competitive pricing, prior art, market size data |
| `Atlas inferred` | Data derived from prior stage inputs or logical calculation | Unit economics calculated from Stage 7 quotes, break-even from projections |
| `Atlas assumed` | Data Atlas used without research or input — should be confirmed | Default market geography, assumed retail margin if not researched |

Every `Atlas assumed` annotation triggers a confirmation prompt. Every `Atlas researched` annotation includes the source. Every `Atlas inferred` annotation shows the calculation.

**Founder sees:**
- What Atlas knows and how it knows it
- What Atlas is guessing and why
- Where founder judgment is needed to override

This policy is required to maintain founder trust as Atlas becomes more autonomous.

---

### 9.2 Feature Evaluation Checklist (Engineering Use)

Before any PR that adds a new feature or modifies founder-facing behavior is merged, run this checklist:

```
□ Does this feature reduce the number of blank fields the founder must fill?
□ Does this feature pre-populate any field from prior stage data?
□ Does this feature conduct research before presenting a question?
□ Does this feature generate a draft document before the founder sees a blank?
□ Does this feature interrupt the founder only when a decision requires their judgment?
□ Does this feature include a transparency annotation (researched / inferred / assumed)?
□ Does this feature connect to at least one inventor success metric?
□ Does this feature comply with all 9 principles of the Automation Constitution?

If any box is unchecked: explain why in the PR description, or revise the feature.
```

---

### 9.3 When a Feature Fails One or More Principles

**If a feature fails Principle 1 (increases founder work):**
Reject the PR. Return for revision. The feature is incomplete. Atlas must do the work before the founder sees the interface.

**If a feature fails Principle 2 (does not reduce effort):**
Deprioritize. Document the decision. Revisit in the next release cycle when the feature can be redesigned to reduce founder effort.

**If a feature fails Principle 3 (produces a template, not a draft):**
Reject the PR. Templates are not finished deliverables. Atlas must generate the draft. Return for revision with populated content.

**If a feature fails Principle 4 (asks for information Atlas could research):**
Reject the PR for any question that Atlas could answer. Return for revision. Connect to the Research Engine for the missing data type.

**If a feature fails Principle 5 (cannot connect to a success metric):**
Formally defer to the backlog with a note: "Revisit when commercial impact can be demonstrated." Do not build features whose value cannot be articulated.

---

*End of ATLAS_AUTOMATION_IMPLEMENTATION_PLAN.md*
*Version 1.0 — July 2026*
*Source Documents: `.agent/architecture-decisions.md` · `docs/ATLAS_AUTOMATION_CONSTITUTION.md` · `docs/FOUNDER_REFERENCE_PROJECT_RISE_JARS_PART_D.md`*
*This document converts the Automation Constitution into an engineering implementation plan. It does not modify any existing code, configuration, or documentation.*
