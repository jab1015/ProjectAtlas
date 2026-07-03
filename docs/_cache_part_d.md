# Context Cache — Part D (Executive Strategy Document)
## FOUNDER REFERENCE PROJECT — RISE JARS
### Prepared for: FOUNDER_REFERENCE_PROJECT_RISE_JARS_PART_D.md

---

## 1. RISE JARS — PRODUCT SUMMARY

Premium borosilicate glass food storage jar system. Core innovation: (1) borosilicate glass (thermal shock resistant, no chemical leaching, oven-safe; unlike soda-lime Pyrex), (2) modular stackable architecture (jars stack stably via engineered lid/base geometry — a system, not just a product), (3) premium visual language (Le Creuset shelf-worthy aesthetics, not hospital-grade utility).

**Target Customer:** Health-conscious women 25–45, meal preppers who treat their kitchen as identity expression. Secondary: sustainability-focused plastic eliminators (30–50). Adjacent: gift buyers.

**Price Point:** $80–$150/set (3–5× OXO/Pyrex at $15–$40). DTC primary Year 1, specialty retail (Williams-Sonoma) Year 2, Amazon supplemental.

**Competitive Gap:** No current product occupies the intersection of material safety + modular design + premium aesthetics. Pyrex reformulated to soda-lime glass in 1998 (most consumers don't know). OXO is utility-functional, not lifestyle. Weck is beautiful but canning-designed, not meal-prep.

**Current Status:** Concept stage. No prototype, no manufacturer, no patent filed, brand in development. Ideal Atlas benchmark: physical CPG hardware product with real IP complexity, defined target market, manufacturing requirements.

**Long-term Vision:** Full premium modular kitchen storage brand. Possible licensing of modular design system.

---

## 2. ATLAS TECH STACK & ARCHITECTURE

**Frontend:** Next.js 15.1.6, React 19, Tailwind CSS, TypeScript, App Router (src/app/)
**Backend:** Convex (real-time database, actions, queries, mutations)
**Auth:** @convex-dev/auth (NOT Clerk)
**Payments:** MadeThis platform proxy (no Stripe in repo)
**Analytics:** Thin wrapper in src/lib/analytics.ts → PostHog

**Key Architecture Decisions:**
- ADR-001: Engine Owns Progress — journeyEngine.ts is single source of truth; UI only renders, never computes
- ADR-002: Three-state readiness (Not Ready / Getting There / Ready to Move Forward), 0–100 internal score never exposed
- ADR-003: Configuration-driven journey — stageConfig array, enabled flag per stage
- ADR-006: UI contains zero business logic — all readiness, tier checks, field validation in backend
- ADR-009: Explorer free tier = 1 active invention, limited to live stages
- ADR-010: stageProgress stored as separate Convex table with (inventionId, stageId) index

**Key Backend Files:**
- convex/journeyEngine.ts — progress computation, stage config, readiness scoring
- convex/schema.ts — invention, stageProgress, users, products tables (+ stubbed conversations, documents, notifications)

**Routes Live:** /invention/[id], /inventions, /onboarding, /pricing, /dashboard, /sign-in, /sign-up, /about

**Subscription Tiers:**
- Explorer Free: 1 active invention, Stages 1–4 only
- Inventor Pro: unlimited inventions, all stages as they unlock
- Enterprise: (implied — team/org features, advanced reporting)

---

## 3. ATLAS AUTOMATION CONSTITUTION — CORE PRINCIPLES (CONDENSED)

**Operating Principle: Atlas Owns Execution.** If Atlas can research it, write it, generate it, calculate it, compare it, track it, organize it, monitor it, or automate it — Atlas does it before asking the inventor. No exceptions without explicit documented justification.

**Principle 1 — Never Ask What Atlas Can Answer.** Research → present → ask for confirmation. Not ask → wait → receive → proceed.

**Principle 2 — Conversation Before Forms.** Free-form input first; structured extraction automatic. Forms only when conversation is insufficient. Never re-collect what was already said.

**Principle 3 — Generate Before Requesting.** Atlas produces a first draft of every document. Founder reviews and approves. Atlas revises. Never hand the founder a blank page.

**Principle 4 — Research Before Asking.** Competitors, market size, pricing benchmarks, manufacturers, patent landscape, retail channels, regulatory requirements — Atlas researches these proactively, not on request.

**Principle 5 — Recommend Before Deciding.** Atlas provides "I recommend X because Y. Do you want to proceed?" Every decision comes with Atlas's recommendation, reasoning, and trade-offs.

**Principle 6 — Reduce Cognitive Load.** Can this step disappear? Can Atlas complete it automatically? Every remaining step must earn its place.

**Principle 7 — Every Stage Produces Finished Deliverables.** Not templates, guides, or worksheets. Completed pitch decks, written NDAs, finished market research reports, signed-ready documents.

**Principle 8 — Atlas Remembers Everything.** Never asks the same question twice. All data from every stage automatically populates all future stages.

**Principle 9 — The Founder's Job.** Judgment, creativity, vision, relationships, negotiation, physical testing, decision approval. Everything else: Atlas.

---

## 4. ATLAS AUTOMATION MATURITY MODEL (4 LEVELS)

**Level 1 — Guided:** Atlas asks questions, organizes answers, explains next steps. Founder does all the work but with direction. Value: structure and clarity.

**Level 2 — Assisted:** Atlas generates drafts, populates templates from conversation, tracks progress. Founder reviews and approves rather than building from scratch. Value: dramatically reduced time-to-output.

**Current Atlas State (June 2026): Between Level 1 and Level 2.** Stages 1–4 live, exhibiting Level 2 behavior in some areas. Primary gap: Atlas still asks founders for information it should be finding itself.

**Level 3 — Autonomous:** Atlas researches, generates, and delivers finished work without waiting for founder to provide raw material. Founder opens Atlas and finds work already done. Target: Level 3 across all live stages within 12 months.

**Level 4 — Operating System:** Atlas manages the full inventor journey end-to-end. Monitors progress, identifies what needs to happen next, surfaces work ready for approval. Founder runs the company; Atlas runs the operation. Long-term vision.

---

## 5. STAGE-BY-STAGE ATLAS ASSESSMENT (All 15 Stages)

### Stage 1 — Idea Capture [LIVE]
**What Atlas Does:** Open-ended prompt → parses free-form input → extracts problem/solution/audience → scores completeness (5 dimensions) → drafts Idea Brief → identifies top 2–3 open questions
**Gaps Found:** No physical product specification module (material grade, dimensions, components); no competitive product research prompt; no lifestyle/positioning capture; software-centric "mechanism" framework doesn't fit CPG
**Documents Generated:** Idea Brief, Idea Completeness Assessment, Atlas Assessment, Recommended Focus Areas
**Readiness System:** 3-state + 5-dimension completeness score
**Key Gaps:** GAP-A01 (Physical Product Spec), GAP-A02 (Competitive Research Prompt), GAP-A03 (Lifestyle/Positioning Capture)

### Stage 2 — Validation [LIVE]
**What Atlas Does:** Converts Idea Brief → validation research plan → identifies top 5 assumptions → generates interview questions → detects validation theater → analyzes findings → produces go/no-go recommendation
**Gaps Found:** No price point testing framework (Van Westendorp or equivalent); no physical prototype test protocol for hardware products; no channel validation prompt
**Documents Generated:** Validation Report, Assumption Risk Map, Competitive Landscape, Go/No-Go Decision Record
**Key Gaps:** GAP-A04 (Price Sensitivity Testing), GAP-A05 (Physical Prototype Validation), GAP-A06 (Channel Validation)

### Stage 3 — Market Research [LIVE]
**What Atlas Does:** Guides TAM/SAM/SOM methodology → structures customer segment profiles → assesses market trends → analyzes competitive market share → generates Market Research Summary
**Gaps Found:** No CPG-specific "build from components" market sizing methodology; no retail channel economics module; no competitive positioning map output; assumes findable category data (premium glass food storage has none)
**Documents Generated:** Market Research Summary, Market Size Model, Customer Segment Profiles, Market Opportunity Assessment
**Key Gaps:** GAP-A07 (CPG Market Sizing Methodology), GAP-A08 (Retail Channel Economics), GAP-A09 (Competitive Positioning Map)

### Stage 4 — Patent Readiness [LIVE]
**What Atlas Does:** Explains patentability → generates prior art search queries → guides prior art evaluation → drafts novel element statements → produces Patent Readiness Report → generates IP Strategy Recommendation
**Gaps Found:** No automated prior art search (manual still required); design patent coverage thin vs. utility patents; no NDA generator; no competitive IP landscape visualization; no manufacturer NDA checkpoint
**Documents Generated:** Patent Readiness Report, Prior Art Summary, Novel Element Statements, Strongest Claim Draft, IP Strategy Recommendation, Trademark Clearance Brief
**Key Gaps:** GAP-A10 (Automated Prior Art Search), GAP-A11 (Design Patent Guidance), GAP-A12 (NDA Generator)

### Stage 5 — Product Design [QUEUED]
**What Atlas Does (Blueprint):** Three-layer design (Functional/Physical/UX) → surfaces manufacturing implications → flags specialist needs → scores completeness → tracks Design Decision Log
**Gaps Found:** No glass-specific product design module; no SKU architecture decision framework; no physical tolerance documentation; no tooling cost preview; no food contact compliance workflow; all guidance is generic, not material-specific
**Key Gaps:** GAP-B01 (Glass Product Design Module), GAP-B02 (SKU Architecture Framework), GAP-B03 (Tolerance Documentation), GAP-B04 (Tooling Cost Preview), GAP-B05 (Food Contact Compliance Workflow)

### Stage 6 — Prototype [QUEUED]
**What Atlas Does (Blueprint):** Helps select prototype type → defines test protocols → generates Prototype Plan → guides documentation → produces Prototype-to-Spec Gap Analysis
**Gaps Found:** No glass-specific prototyping path (3D form → proxy mechanism → glass manufacturer sample = 3-phase, $8K–$25K, 13–26 weeks); no cost/timeline estimator; no glass prototype supplier guidance; no IP pre-engagement checkpoint before manufacturer sharing; no user testing recruitment guidance
**Key Gaps:** GAP-B06 (Glass Prototyping Path), GAP-B07 (Prototype Cost/Timeline Estimator), GAP-B08 (IP Pre-Engagement Checkpoint), GAP-B09 (User Testing Recruitment)

### Stage 7 — Manufacturing [QUEUED]
**What Atlas Does (Blueprint):** Explains manufacturing decision framework → builds RFQ → guides manufacturer evaluation → calculates Unit Economics Model → guides contract review
**Gaps Found:** No glass/ceramics manufacturing guidance module; no multi-component supply chain model; no tooling ownership documentation protocol; no MOQ impact modeler; no retail compliance pre-qualification checklist; assumes single manufacturer (Rise Jars has 3+ component suppliers)
**Key Gaps:** GAP-B10 (Glass Manufacturing Guidance), GAP-B11 (Multi-Component Supply Chain), GAP-B12 (Tooling Ownership Protocol), GAP-B13 (MOQ Impact Modeler), GAP-B14 (Retail Compliance Checklist)

### Stage 8 — Branding [QUEUED]
**What Atlas Does (Blueprint):** Brand positioning workshop → archetype selection → name evaluation → generates Brand Identity System (Positioning Statement, Voice Guide, Visual Direction Brief) → trademark search
**Gaps Found:** No brand name generator; no visual reference library builder; no competitive brand archetype mapping; no brand consistency checker; no social handle availability checker; no tagline generator
**Key Gaps:** GAP-B15 (Brand Name Generator), GAP-B16 (Visual Reference Library), GAP-B17 (Brand Consistency Checker), GAP-B18 (Trademark Deadline Monitoring)

### Stage 9 — Intellectual Property [QUEUED]
**What Atlas Does (Blueprint):** Assembles IP Brief → generates NDA templates → produces IP Filing Checklist → initializes IP Status Tracker → guides trademark preparation
**Gaps Found:** No IP Brief auto-assembly from prior stages; no NDA status monitoring from Stage 7 contacts; no provisional patent deadline tracker with alerts; no public disclosure tracker; no patent claim language generator; no IP attorney matching
**Key Gaps:** GAP-B19 (IP Brief Auto-Assembly), GAP-B20 (Patent Deadline Tracker), GAP-B21 (Public Disclosure Tracker), GAP-B22 (Attorney Matching Engine)

### Stage 10 — Pricing [QUEUED]
**What Atlas Does (Blueprint):** Three frameworks (cost-plus / competitive / value-based) → unit economics cascade → break-even analysis → pricing scenario analysis → Pricing Strategy Document
**Gaps Found:** No automated unit economics builder from Stage 7 inputs; no value-based pricing calculator; no competitive pricing monitor; no channel margin benchmarks library; no break-even timeline visualizer; price compression risk from Asian DTC competitors not modeled
**Key Gaps:** GAP-B23 (Automated Unit Economics Builder), GAP-B24 (Value-Based Pricing Calculator), GAP-B25 (Channel Margin Benchmarks), GAP-B26 (Break-Even Timeline)

### Stage 11 — Marketing [QUEUED]
**What Atlas Does (Blueprint):** Channel evaluation → messaging architecture → content strategy → pre-launch calendar → core marketing asset copy
**Gaps Found:** No automated landing page draft generation (HTML-ready); no Meta Ad Library integration; no editorial calendar intelligence database; no influencer engagement rate verification; no A/B test framework at asset generation
**Key Gaps:** GAP-C01 (Landing Page Auto-Generation), GAP-C02 (Ad Library Integration), GAP-C03 (Editorial Calendar Intelligence), GAP-C04 (Influencer Verification)

### Stage 12 — Sales [QUEUED]
**What Atlas Does (Blueprint):** Channel evaluation → sales funnel model → sales toolkit (one-pager, FAQ, objection guide, competitor comparison) → three-scenario projections → post-purchase experience design
**Gaps Found:** No CRM setup for B2B/wholesale; no Amazon listing optimization; no retail buyer database integration; no review management automation; no MAP enforcement monitoring
**Key Gaps:** GAP-C05 (CRM Integration), GAP-C06 (Amazon Listing Automation), GAP-C07 (Retail Buyer Database)

### Stage 13 — Funding [QUEUED]
**What Atlas Does (Blueprint):** Funding strategy matching → pitch deck construction (Sequoia framework) → financial model population from prior stages → investor FAQ (20 questions) → grant program identification → pitch practice simulation
**Gaps Found:** No SBIR/STTR database integration; no investor pipeline management; no DocSend-style deck analytics; no cap table management; pitch deck is 80%+ auto-assembled but Team and Ask slides require founder input
**Key Gaps:** GAP-C08 (Grant Database Integration), GAP-C09 (Investor Pipeline Management), GAP-C10 (Deck Analytics)

### Stage 14 — Launch [QUEUED]
**What Atlas Does (Blueprint):** Complete Launch Readiness Checklist → sequences launch activities → monitors pre-launch task completion → designs Day 1 execution → first-week feedback loop → Launch Performance Report
**Gaps Found:** No real-time Shopify/sales integration; no Google Analytics integration; no Amazon launch monitoring; launch day playbook is static (no live data feeds); analytics integration is Stage 15 critical dependency
**Key Gaps:** GAP-C11 (Real-Time Sales Integration), GAP-C12 (Launch Dashboard)

### Stage 15 — Growth [QUEUED]
**What Atlas Does (Blueprint):** 90-Day Growth Audit → Growth Roadmap → Growth Levers Analysis → Monthly Growth Performance Reports → retention system → channel expansion guidance → updated Unit Economics Model
**Gaps Found:** Analytics integration is the single highest-priority infrastructure gap; without it Atlas generates templates but cannot populate them with real data; competitive intelligence monitoring not continuous
**Key Gaps:** GAP-C13 (Analytics Integration — CRITICAL), GAP-C14 (Competitive Intelligence Feed), GAP-C15 (New SKU Planning from Growth Data)

---

## 6. COMPLETE GAP REGISTER (All Gaps from Parts A–C)

### Severity: CRITICAL
| ID | Stage | Description |
|---|---|---|
| GAP-A01 | Stage 1 | No physical product specification workflow (material grade, dimensions, components) |
| GAP-A04 | Stage 2 | No price sensitivity testing framework (Van Westendorp or equivalent) |
| GAP-A07 | Stage 3 | No CPG "build from components" market sizing methodology for niche categories |
| GAP-A10 | Stage 4 | Automated prior art search missing — founder conducts manual searches only |
| GAP-B01 | Stage 5 | No glass/ceramics CPG product design guidance module |
| GAP-B02 | Stage 5 | No SKU architecture decision framework for product line design |
| GAP-B06 | Stage 6 | No glass-specific prototyping path (3-phase: form → proxy → glass sample) |
| GAP-B10 | Stage 7 | No glass/ceramics manufacturing guidance module |
| GAP-B19 | Stage 9 | No IP Brief auto-assembly from prior stage outputs |
| GAP-B20 | Stage 9 | No provisional patent deadline tracker with automated alerts |
| GAP-B21 | Stage 9 | No public disclosure tracker (12-month statutory bar risk) |
| GAP-B23 | Stage 10 | No automated unit economics builder from Stage 7 COGS inputs |
| GAP-B24 | Stage 10 | No value-based pricing calculator for physical consumer goods |
| GAP-C13 | Stage 15 | No analytics integration — Atlas cannot populate performance reports with real data |

### Severity: HIGH
| ID | Stage | Description |
|---|---|---|
| GAP-A02 | Stage 1 | No competitive product research prompt at idea capture |
| GAP-A05 | Stage 2 | No physical prototype test protocol for hardware product validation |
| GAP-A06 | Stage 2 | No channel validation prompt in Validation stage |
| GAP-A08 | Stage 3 | No retail channel economics module in market sizing |
| GAP-A09 | Stage 3 | No competitive positioning map output |
| GAP-A11 | Stage 4 | Design patent guidance thin vs. utility patent coverage |
| GAP-A12 | Stage 4 | No NDA generator — Atlas identifies need but cannot fulfill it |
| GAP-B03 | Stage 5 | No physical tolerance documentation for glass/ceramic products |
| GAP-B04 | Stage 5 | No tooling cost preview during design specification (glass molds $8K–$25K each) |
| GAP-B05 | Stage 5 | No food contact compliance workflow for food-contact products |
| GAP-B07 | Stage 6 | No prototype cost/timeline estimator ($8K–$25K, 13–26 weeks for glass) |
| GAP-B08 | Stage 6 | No IP pre-engagement checkpoint before manufacturer design sharing |
| GAP-B11 | Stage 7 | No multi-component supply chain model (glass body + lid + gasket = 3+ suppliers) |
| GAP-B12 | Stage 7 | No tooling ownership documentation protocol |
| GAP-B13 | Stage 7 | No MOQ impact modeler (5K units/SKU × 5 SKUs = $200K–$375K inventory) |
| GAP-B14 | Stage 7 | No retail compliance pre-qualification checklist (FDA, Prop 65, GS1, EDI) |
| GAP-B15 | Stage 8 | No brand name generator |
| GAP-B16 | Stage 8 | No visual reference library builder for brand direction conversation |
| GAP-B17 | Stage 8 | No brand consistency checker across voice/visual/positioning/archetype |
| GAP-B18 | Stage 8/9 | No trademark/social handle availability checker integration |
| GAP-B22 | Stage 9 | No IP attorney matching engine (consumer goods specialty) |
| GAP-B25 | Stage 10 | No channel margin benchmarks library (Williams-Sonoma 50%, Amazon FBA rates) |
| GAP-B26 | Stage 10 | No break-even timeline visualizer (units needed vs. months projection) |
| GAP-C01 | Stage 11 | No automated HTML-ready landing page generation |
| GAP-C05 | Stage 12 | No CRM integration for B2B/wholesale sales pipeline |
| GAP-C06 | Stage 12 | No Amazon listing optimization from Messaging Architecture |
| GAP-C11 | Stage 14 | No real-time sales/analytics integration for launch monitoring |

### Severity: MEDIUM
| ID | Stage | Description |
|---|---|---|
| GAP-A03 | Stage 1 | No lifestyle/positioning capture in Idea Brief |
| GAP-B09 | Stage 6 | No structured user testing recruitment guidance for prototype feedback |
| GAP-B27 | Stage 10 | No price compression risk analysis (Asian DTC copycat timeline modeling) |
| GAP-C02 | Stage 11 | No Meta Ad Library integration for competitor ad research |
| GAP-C03 | Stage 11 | No editorial calendar intelligence database for press pitch timing |
| GAP-C04 | Stage 11 | No influencer engagement rate authenticity verification |
| GAP-C07 | Stage 12 | No retail buyer database integration (RangeMe, Faire) |
| GAP-C08 | Stage 13 | No SBIR/STTR grant database integration |
| GAP-C12 | Stage 14 | No launch day real-time monitoring dashboard |
| GAP-C14 | Stage 15 | No continuous competitive intelligence monitoring feed |

---

## 7. AUTOMATION OPPORTUNITIES RANKED (All Parts A–C)

### CRITICAL Automation Opportunities (Highest ROI)
1. **Analytics Integration (Stage 15)** — Shopify + GA4 + email platform + ad platforms → automated KPI monitoring and monthly reports. Without this, commercial stages are planning-only.
2. **Automated Prior Art Search (Stage 4)** — USPTO/Google Patents API → eliminates multi-hour manual founder search; improves report quality.
3. **IP Brief Auto-Assembly (Stage 9)** — Pulls from Stages 4, 5, 8 → 80%+ complete document before attorney meeting; saves hours and attorney fees.
4. **RFQ Auto-Generation from Design Specification (Stage 7)** — Transforms written spec into manufacturer-ready technical document automatically.
5. **Unit Economics Auto-Builder from Stage 7 Quotes (Stage 10)** — Ingests manufacturer quotes → populates complete landed cost model → calculates margin at all channels.
6. **Pitch Deck Auto-Assembly (Stage 13)** — 80%+ of a real, data-populated pitch deck from prior stage outputs. Saves 40–75 founder hours.

### HIGH Automation Opportunities
7. **Landing Page Copy + HTML Generation (Stage 11)** — Voice Guide + Messaging Architecture → finished, publish-ready landing page
8. **Sales Toolkit Auto-Build (Stage 12)** — Messaging Architecture → one-pager + FAQ + objection guide + competitor comparison sheet automatically
9. **90-Day Content Calendar (Stage 11)** — 30+ posts with topic/format/CTA/channel mapped; most founders simply don't build one without Atlas
10. **Provisional Patent Deadline Tracker with Alerts (Stage 9)** — Auto-calculate 12-month conversion deadline; alert at 9/11/11.5 months
11. **Channel Evaluation Matrix Auto-Scoring (Stage 11)** — All 8 channels scored against product profile before founder makes any budget commitment
12. **Investor FAQ with Pre-Answered Questions (Stage 13)** — 20 hardest questions with answers drawn from invention record
13. **Tooling Cost Calculator (Stage 5/7)** — Number of unique molds × manufacturing geography → realistic tooling investment range
14. **Brand Consistency Checker (Stage 8)** — Auto-verification that voice/visual/archetype/positioning all express same character
15. **NDA Generator (Stages 7/9)** — Finished manufacturing NDA document, not a template

### MEDIUM Automation Opportunities
16. **Competitive Pricing Monitor (Stage 10)** — Live competitor pricing refresh when Stage 10 opens
17. **Break-Even Timeline Visualizer (Stage 10)** — "At projected monthly volume X, break even occurs in month Y"
18. **Influencer Research + Profiling (Stage 11)** — 15 accounts profiled with follower count, engagement rate, audience match, estimated cost
19. **MOQ Impact Modeler (Stage 7)** — MOQ × COGS × working capital requirement vs. unit cost improvement tradeoff
20. **Manufacturing Timeline Builder (Stage 7)** — Design finalization → tooling → production → freight → delivery with realistic lead times
21. **Trademark/Social Handle Checker (Stage 8)** — Integrated USPTO TESS + domain + Instagram/TikTok/Pinterest availability
22. **Retail Compliance Checklist (Stage 7)** — FDA food contact, Prop 65, GS1, EDI requirements surfaced before Stage 12
23. **Multi-Channel Monthly Growth Reports (Stage 15)** — Actual vs. target with trend analysis and priority recommendations (requires analytics integration)

---

## 8. FOUNDER DECISION MAP PATTERNS (All Stages)

**What ALWAYS belongs to Atlas:**
- Research (competitors, market size, patent landscape, pricing benchmarks, manufacturers, channels, investors)
- Generation (all first drafts of all documents — briefs, decks, reports, copy, models, analyses)
- Calculation (unit economics, break-even, market sizing, pricing scenarios, LTV:CAC)
- Comparison (competitor analysis, channel economics, manufacturer evaluation)
- Monitoring (KPIs, inventory, pricing, reviews, patent status, competitive filings)
- Recommendation (specific recommendation + reasoning before every decision point)
- Automation (pre-launch calendar population, content calendar, RFQ generation, report generation)

**What ALWAYS belongs to the founder:**
- Decision approval (final yes/no on all strategic and spending decisions)
- Physical testing (prototype testing, market testing, product use verification)
- Physical build (constructing prototypes, manufacturing oversight)
- Relationship formation (investor meetings, retail buyer conversations, influencer relationships, manufacturer negotiations)
- Legal decisions and signatures (IP filings, manufacturing agreements, investment terms)
- Creative judgment (final aesthetic decisions, brand voice fine-tuning, visual direction)
- Vision setting (long-term direction, brand identity, product philosophy)

---

## 9. "IMPROVE ATLAS" / "I WISH ATLAS COULD DO THIS" — COMPLETE LIST

**From Part A (Stages 1–4):**
Physical product spec fields, price sensitivity testing structure, CPG market sizing from components, IP landscape visualization, design patent flowchart, NDA generator, trademark monitoring integration, material science guidance module, premium consumer goods positioning guidance, CPG launch channel strategy guidance, prior art claim gap analysis guidance

**From Part B1 (Stages 5–7) — MUST HAVES:**
CAD preparation assistant, engineering specification builder, BOM generator, RFQ builder and comparison tool, factory and supplier comparison tool, manufacturing timeline builder, supplier evaluation framework, NDA generation, cost estimator, tooling cost calculator, MOQ impact modeler, unit economics calculator at scale, quality control checklist generator, glass material certification tracker

**From Part B1 (Stages 5–7) — SHOULD HAVES:**
Sample and prototype tracking, prototype revision history, freight and landed cost calculator, borosilicate glass manufacturer database

**From Part B2 (Stages 8–10) — MUST HAVES:**
Brand name generator, IP brief auto-assembler, NDA generator, cost-plus pricing calculator, unit economics dashboard, provisional patent deadline tracker with automated alerts

**From Part B2 (Stages 8–10) — SHOULD HAVES:**
Visual reference library builder, competitive pricing analyzer, retail margin calculator, pricing scenario modeler, patent filing checklist with progress tracking, brand voice guide builder, value-based pricing calculator

**From Part C (Stages 11–15):**
Landing page auto-generation, Meta Ad Library integration, editorial calendar intelligence, influencer verification, A/B test framework, CRM integration, Amazon listing automation, review management, SBIR database, investor pipeline, DocSend integration, analytics integration (CRITICAL), competitive intelligence monitoring, international expansion tools, new SKU planning tool

---

## 10. COMMERCIAL READINESS FINDINGS (From Part C)

**What would prevent Rise Jars from reaching market:**
- No brand photography (premium $80–$150 product with no visual assets will not convert)
- Analytics integration absent (Atlas cannot close the loop between plan and reality)
- Inventory underfunding (glass manufacturing 10–16 week lead times = no room for error)
- Price acceptance uncertainty at $80–$150 without A/B testing capability
- Relationship activities (retail buyer, investor, influencer) require founder presence with no Atlas proxy

**Documents expected by commercial partners — Atlas generates automatically:**
- Retail buyers: Buyer one-pager (MSRP, wholesale, margin %, MOQ, lead time), Product fact sheet, Brand story
- Distributors: Channel economics, Product specification sheet, Brand style guide reference
- Investors: Pitch deck (80%+ auto-assembled), 3-year financial model, Investor FAQ, IP status, Market research summary, Comparable raise analysis
- Manufacturers: Updated unit economics model, Design specification, Quality requirements, Reorder specs
- Licensing partners: IP brief, Product performance summary, Licensing pitch narrative, Financial model

**Founder decisions required (cannot be automated):**
- Wholesale pricing terms and negotiations
- Equity terms and valuation
- Team slide and founder story
- Distribution territory agreements
- Scale production purchase order commitment

---

## 11. KPI LIST — ATLAS AUTOMATIC MONITORING (30+ KPIs from Part C)

**Financial Performance:** Revenue, Gross Margin, Net Margin, Cash Flow, Break-Even Status, MSRP Integrity, Wholesale Margin, MAP Compliance

**Customer Economics:** CAC, LTV, LTV:CAC Ratio (target 3:1+), Repeat Purchase Rate, AOV, Return Rate, ROAS, Email Conversion Rate, Website Conversion Rate, Cart Abandonment Rate

**Growth & Market:** Inventory Level, Inventory Sell-Through Rate, Days-to-Stockout, Retail Accounts, Review Count & Rating, Email List Size, Social Followers, Organic Traffic Growth, Press Mentions, Advertising ROI

**Unit Economics (Actual):** COGS per Unit (Actual), Fulfillment Cost per Order, DTC Gross Margin (Actual), Wholesale Gross Margin (Actual), Amazon Net Margin (Actual)

---

## 12. PART C SUMMARY FINDINGS

**Major Strengths:**
1. Atlas arrives at Stage 11 with extraordinary prior-stage data assembled — most CPG brands enter commercial stages with none of this documented
2. "Assemble, don't regenerate" efficiency — pitch deck from 8 prior stage documents, sales toolkit from messaging architecture
3. Borosilicate education story is a durable, compounding marketing asset (real differentiation, education-driven, justifies premium, compounds as SEO content)
4. Three-layer differentiation (Patent Pending + borosilicate + lifestyle brand) is genuinely investor-defensible
5. Constitution-compliant work distribution across all commercial stages

**Major Weaknesses:**
1. Analytics integration is the single highest-priority infrastructure gap — without it, commercial stages are planning-only
2. Physical deliverables (brand photography) outside Atlas scope — must manage as critical-path dependency
3. Relationship-intensive activities have no Atlas proxy — retail buyers, investors, influencer negotiations require founder presence
4. Launch day real-time capability requires integrations not natively present
5. Stage 13 optional for bootstrap but critical for scaled growth

**Top Commercial Risks:**
1. Inventory mismanagement (glass 10–16 week lead time, no correction window)
2. Price acceptance at $80–$150 (entire model rests on this holding)
3. LTV:CAC below 3:1 (no growth investment fixes bad underlying economics)
4. Retail channel entered at wrong time (wholesale margin only viable at scale COGS)
5. No defensible moat at scale if patent not granted

---

## 13. PRODUCT ROADMAP STATUS

| Stage | Name | Status |
|---|---|---|
| 1 | Idea Capture | LIVE |
| 2 | Validation | LIVE |
| 3 | Market Research | LIVE |
| 4 | Patent Readiness | LIVE |
| 5 | Product Design | QUEUED |
| 6 | Prototype | QUEUED |
| 7 | Manufacturing | QUEUED |
| 8 | Branding | QUEUED |
| 9 | Intellectual Property | QUEUED |
| 10 | Pricing | QUEUED |
| 11 | Marketing | QUEUED |
| 12 | Sales | QUEUED |
| 13 | Funding | QUEUED |
| 14 | Launch | QUEUED |
| 15 | Growth | QUEUED |

Architecture: enabled flag in stageConfig array; enabling Stage 5 = one flag change + STAGE_FIELDS addition. No new routes, no schema changes needed per ADR-003.

---

## 14. SUBSCRIPTION TIERS

- **Explorer Free:** 1 active invention; Stages 1–4 only; full stage functionality within those 4 stages
- **Inventor Pro:** Unlimited inventions; all 15 stages as they unlock; full automation features
- **Enterprise:** Team/org features, advanced reporting, priority support (implied in business model)

---

*End of _cache_part_d.md — All context needed to write Part D is contained in this document.*
*Source documents: ATLAS_PRODUCT_ROADMAP.md, ATLAS_AUTOMATION_CONSTITUTION.md, PARTS A/B1/B2/C, architecture-decisions.md*
