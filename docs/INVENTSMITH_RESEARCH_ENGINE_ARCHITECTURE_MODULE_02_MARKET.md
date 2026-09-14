# ATLAS RESEARCH ENGINE ARCHITECTURE
## Section 11, Module 2: Market Research

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Specification — Not Yet Implemented**
**Module ID:** `market_research`
**Source Documents:**
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_MODULE_01_COMPETITOR.md`
- `docs/STAGE_BLUEPRINTS/STAGE_03_MARKET_RESEARCH.md`
- `docs/STAGE_BLUEPRINTS/STAGE_13_INVESTOR_DECK.md`

---

## Document Purpose

This document specifies the complete architecture for **Research Module 2: Market Research** (`market_research`). It is Section 11, Module 2 of the Atlas Research Engine Architecture series.

This specification covers every aspect of how this module operates: when it fires, what inputs it requires, what research it executes, which providers it uses, what outputs it produces, how confidence is scored, how results are cached and refreshed, how errors are handled, how cost is managed, and what the founder review requirements are.

This document is an architecture specification only. It defines what must be built. No existing files are modified by this document.

All references to "Part 1" refer to `ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md`. All references to "Part 2" refer to `ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md`. All references to "Module 01" refer to `ATLAS_RESEARCH_ENGINE_ARCHITECTURE_MODULE_01_COMPETITOR.md`.

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Trigger Conditions](#2-trigger-conditions)
3. [Input Schema](#3-input-schema)
4. [Research Logic (Step-by-Step)](#4-research-logic-step-by-step)
5. [Output Schema](#5-output-schema)
6. [Documents Affected](#6-documents-affected)
7. [Confidence Scoring](#7-confidence-scoring)
8. [Caching](#8-caching)
9. [Error Handling](#9-error-handling)
10. [Cost Estimate](#10-cost-estimate)
11. [Founder Review Requirements](#11-founder-review-requirements)
12. [Future Expansion](#12-future-expansion)

---

## 1. Purpose

### 1.1 What This Module Does

The Market Research module (`market_research`) is responsible for estimating the size, structure, growth trajectory, and commercial landscape of the market an inventor is entering — automatically, before the inventor is asked to supply this data themselves.

This module executes multi-source research synthesis to produce a market intelligence package: how large the addressable market is (TAM/SAM/SOM), how fast it is growing (CAGR), what the primary consumer segments look like, which geographic markets are most relevant, what the seasonal demand pattern is, what the key demand drivers are, and what macro trends are shaping the category.

The module does not conduct a one-time estimate. It is a living intelligence function that first runs at Stage 3 open (when the inventor begins formal market research), deepens after Stage 3 completion (when the full Idea Brief context is locked in), refreshes at key funding-relevant stages (Stage 12, Stage 13), and updates on a quarterly cadence for the life of the invention.

### 1.2 Why It Matters to an Inventor

Market sizing is one of the most time-consuming and intimidating tasks for first-time inventors. Most founders either skip it (leading to under-informed decisions), perform it superficially (relying on a single Google search), or pay for expensive market research reports (often $1,500–$5,000 per report) that are generic to the category rather than specific to their product.

Atlas has a constitutional obligation (Principle 4 of the Automation Constitution) to conduct this research before asking the inventor to supply it. For an inventor, market research matters for eight specific downstream reasons:

1. **Opportunity validation:** Stage 3's core question is "is there a real market for this?" The answer requires an objective estimate of market size. An inventor's intuition is not evidence. Atlas provides evidence.

2. **TAM/SAM/SOM for the Idea Brief:** The Idea Brief completed at Stage 1 includes a market opportunity section. The Market Research module provides the TAM/SAM/SOM estimates that ground this section in data rather than guesswork.

3. **Investor credibility:** Every investor pitch deck requires a credible market sizing slide. Investors ask "how big is this market?" as a qualification question. A confidently sourced TAM/SAM/SOM with a named methodology signals founder sophistication. Stage 13 (Investor Deck) draws directly from this module's output.

4. **Segment targeting:** Knowing which consumer segment represents the highest-density demand helps the inventor target their product launch. Stage 11 (Marketing) uses consumer segmentation data from this module to inform audience selection and channel prioritization.

5. **Growth rate signal for timing:** A market with 18% CAGR is a different investment than one with 2% CAGR. Growth rate affects how much competitive urgency the founder should feel, how attractive the opportunity is to investors, and whether the timing of a launch is opportunistic or late.

6. **Seasonality planning:** Many product categories have pronounced seasonal demand patterns (e.g., outdoor products peak in Q2, holiday gift products peak in Q4). Understanding seasonality before Stage 7 (Manufacturing) allows the founder to plan production runs correctly and avoid costly inventory mismatches.

7. **Geographic market selection:** Not all markets have equal demand for all products. Atlas's market research identifies which geographic markets represent the highest potential for the specific product category — informing whether a US-first launch, international-first launch, or simultaneous multi-market launch is the right strategy.

8. **Funding readiness signal:** Atlas's Readiness Engine weighs market size as one of its primary signals. An invention with a well-sourced $5B TAM and 14% CAGR is assessed as more fundable than one with an unconfirmed $100M TAM and flat growth. The Market Research module's output directly feeds the Readiness Engine's market opportunity score.

### 1.3 Stages Served

The Market Research module serves the following stages by stage ID:

| Stage ID | Stage Name | How the Module Serves This Stage |
|---|---|---|
| 1 | Idea Capture | Provides preliminary TAM estimate used in the Idea Brief market opportunity section |
| 3 | Market Research | Primary serving stage — delivers the full TAM/SAM/SOM analysis, growth rate, segmentation, and geographic breakdown |
| 5 | Business Model | Supplies market size and segment data used to size the addressable revenue opportunity in the business model |
| 12 | Funding Readiness | Provides the market sizing evidence used in the Funding Readiness Score market opportunity dimension |
| 13 | Investor Deck | Delivers the market data for the Market Opportunity and Market Size slides of the investor pitch deck |
| 14 | Launch | Supplies seasonality and geographic demand data used in launch timing and initial channel selection |
| 15 | Growth (post-launch) | Powers quarterly market intelligence updates that track whether the market is expanding or contracting versus the baseline established at Stage 3 |

### 1.4 Atlas Decisions Informed

The Market Research module directly informs the following Atlas-generated outputs and recommendations:

- **Idea Brief market opportunity section** — Atlas drafts a preliminary market opportunity narrative using TAM and growth rate from the initial market research, providing context before Stage 3 begins
- **Market Research Summary document** — The primary document produced by Stage 3 draws its market size, CAGR, segmentation, geographic breakdown, and key drivers sections directly from this module's output
- **Business Model opportunity sizing** — Stage 5's TAM-to-revenue opportunity mapping uses the market sizing estimates as its denominator
- **Investor Pitch Deck market slide** — Stage 13 assembles the market opportunity slide using TAM/SAM/SOM figures, CAGR, and key market drivers from this module
- **Funding Readiness Score (market dimension)** — The Readiness Engine uses `tam_usd`, `cagr_percent`, and `confidence` as inputs to the market opportunity dimension of the readiness score
- **Launch timing recommendations** — Atlas uses the `seasonalityProfile` from this module to recommend launch quarter timing (e.g., "Consider launching in Q3 to capture the back-to-school demand peak for your category")
- **Geographic market prioritization** — Stage 11 channel planning uses the `geographicBreakdown` from this module to identify which markets represent the best initial distribution targets
- **Quarterly market drift alerts** — The quarterly scheduled refresh detects when CAGR estimates have changed materially versus the baseline, triggering a market conditions update in the founder's monitoring feed

---

## 2. Trigger Conditions

### 2.1 Stage Lifecycle Hooks That Fire This Module

The Market Research module fires at the following lifecycle hooks, as defined in Part 1, Section 4:

| Hook | Stage ID | Trigger Description | Research Depth |
|---|---|---|---|
| `onOpen` | 1 | Stage 1 is first unlocked; preliminary market category available from onboarding | Light sweep only — TAM estimate at category level |
| `onOpen` | 3 | Stage 3 is unlocked; full Idea Brief context available | Full detailed research |
| `onStageComplete` | 3 | Inventor completes Stage 3; market research inputs confirmed | Full re-run with confirmed inputs incorporated |
| `onOpen` | 5 | Stage 5 is unlocked | Segment data and opportunity sizing sub-task |
| `onOpen` | 12 | Stage 12 is unlocked | Full incremental refresh — funding readiness requires current market data |
| `onOpen` | 13 | Stage 13 is unlocked | Pitch deck market data refresh sub-task |
| `onStageEnter` | 3, 12, 13 | Freshness and context-delta check on every visit | Conditional refresh only |
| `scheduledResearch` | 3 | Quarterly cadence beginning 90 days after Stage 3 completion | Full incremental refresh |
| `manualRefresh` | Any | Founder explicitly requests refresh | Full re-run |

**Depth definitions:**

- **Light sweep:** 3–5 web search queries for category-level market size signals. Returns a preliminary TAM range only. No LLM synthesis. No segmentation. Used only for the Stage 1 `onOpen` preliminary estimate.
- **Full detailed research:** Complete multi-step research process (described in Section 4). Produces the full `MarketResearchResult` including TAM/SAM/SOM, CAGR, segmentation, geographic breakdown, seasonality, and key drivers.
- **Supplemental sub-task:** A targeted refresh of specific fields within an existing result — not a full re-run. Examples: refreshing the opportunity sizing estimate for Stage 5 (a more precise SAM calculation), refreshing the investor-facing market narrative for Stage 13 (restructuring the output format for pitch deck assembly).
- **Full incremental refresh:** Queries scoped to market signals published since the last run cursor, then merged with the existing market sizing baseline. Used for quarterly scheduled refreshes — the market does not fundamentally change in 90 days, but growth rate signals and trend data should be updated.

### 2.2 Specific Field Changes That Trigger a Re-Run

Beyond lifecycle hooks, a context-delta check at `onStageEnter` triggers a re-run of this module when any of the following `stageProgress` fields have changed materially since the last research run:

| Field Changed | Stage | Re-Run Scope |
|---|---|---|
| `productDescription` | 1, 3 | Full re-run — product description change may shift the relevant market entirely (e.g., a "kitchen appliance" vs. a "professional culinary tool" occupy different market segments) |
| `productCategory` | 1, 3 | Full re-run — category is the primary market definition axis |
| `targetMarket` | 1, 3 | Full re-run — geography change alters which market reports, data sources, and size estimates are relevant |
| `targetAudience` | 3 | Incremental sub-task — re-run segment analysis only; overall market size is unlikely to change |
| `pricePointIntent` | 3, 5 | SAM re-calculation sub-task — price point change shifts the addressable segment |
| `channelPreference` | 3, 5 | SAM re-calculation sub-task — channel preference constrains the reachable market subset |
| `geographicMarket` | 3 | Full re-run — geographic market change requires pulling new regional data |

**Materiality threshold for `productDescription` changes:** Uses the same context hash normalization as Module 01 (Section 2.2 of Module 01). A change is material if the keyword extraction produces a different keyword set affecting the market category classification.

### 2.3 Cooldown and Deduplication Rules

The following cooldown rules apply to this module specifically, layered on top of the general deduplication rules in Part 1, Section 5.8:

| Trigger Source | Cooldown Window | Rule |
|---|---|---|
| `manualRefresh` | 60 minutes | No more than one manual refresh per invention per 60 minutes for this module |
| `onStageEnter` freshness check | 48 hours | If a run completed within the past 48 hours and the context hash is unchanged, no re-run is triggered. Market data changes more slowly than competitive data — 48 hours vs. 24 hours for Module 01. |
| `scheduledResearch` | 80 days (soft) | The scheduled job interval is 90 days; the 80-day soft floor prevents early triggers from stacking up |
| `onStageComplete` (Stage 3) → re-run | 48 hours (guard) | If a full run was already triggered by `onStageComplete` for Stage 3 within the past 48 hours, a subsequent `onOpen` for Stage 5 does not re-run the full module (only the opportunity sizing sub-task) |
| `onOpen` (Stage 12) → full refresh | 7 days (guard) | If a full refresh was already triggered within 7 days of Stage 12 opening (e.g., the founder recently opened and closed Stage 12), the `onOpen` does not re-trigger a full refresh. Incremental sub-task only. |

**Queue-level deduplication:** If a job for `market_research` is already in `"pending"` or `"in_progress"` status for the same `inventionId`, any new trigger is suppressed at the queue level and returns the existing job ID. This is the general mechanism from Part 1, Section 5.8 applied to this module.

### 2.4 Manual Refresh Eligibility

The Market Research module is eligible for manual refresh at any stage where market research outputs are surfaced. This includes Stages 3, 5, 12, and 13 actively, and all stages in the post-launch monitoring context (Stage 15 and ongoing).

Manual refresh is available to the founder at all times, subject to the 60-minute cooldown rule. When the founder requests a manual refresh, the full detailed research logic (Section 4) is executed — not the light sweep or incremental sub-task paths.

---

## 3. Input Schema

### 3.1 Required Inputs

These inputs must be present before the module's full detailed research logic can execute. The light sweep path (Stage 1 `onOpen` preliminary estimate) can run with only `productCategory` — see Section 3.4 for degraded-input behavior.

| Field | Type | Source | Description |
|---|---|---|---|
| `inventionId` | `Id<"inventions">` | System | The Convex document ID of the invention record |
| `stageId` | `number` | System | The stage ID triggering this research job. Used for result routing and cost accounting. |
| `productDescription` | `string` | Stage 1 or Stage 3 `stageProgress` | The inventor's narrative description of the product. Minimum 20 characters. Used as the primary input for market category identification and search query construction. |
| `productCategory` | `string` | Atlas-inferred from Stage 1 | SIC/NAICS-aligned category label inferred by Atlas. Required for targeting category-level market data sources and market research reports. Examples: `"kitchen_appliances"`, `"personal_care"`, `"outdoor_recreation"`, `"health_supplements"`. |

### 3.2 Optional Inputs

These inputs improve result quality and precision. Their absence does not prevent execution — it reduces the specificity and confidence of the output.

| Field | Type | Source | Description |
|---|---|---|---|
| `targetMarket` | `string` | Stage 1 or Stage 3 `stageProgress` | Primary geographic target market. Examples: `"US"`, `"North America"`, `"Europe"`, `"global"`. Defaults to `"US"` if not supplied. |
| `targetAudience` | `string` | Stage 1, 2, or 3 `stageProgress` | Plain-language description of the intended buyer. Used to narrow segmentation queries (e.g., "millennial parents with children under 5" refines the SAM calculation versus the full category TAM). |
| `pricePointIntent` | `string` | Atlas-inferred or founder-supplied | Pricing tier the inventor intends to occupy: `"value"`, `"mid_market"`, `"premium"`, `"ultra_premium"`. Used to weight the SAM calculation toward the target price segment of the market. |
| `channelPreference` | `string[]` | Stage 1 or Stage 3 `stageProgress` | Channels the inventor is targeting. Examples: `["DTC", "Amazon", "specialty_retail"]`. Used to constrain the SOM calculation to the channels the inventor can realistically reach. |
| `geographicMarket` | `string` | Stage 3 `stageProgress` | Specific geographic market if more granular than `targetMarket`. Supports multi-value: `["US", "Canada", "UK"]`. Defaults to `targetMarket`. |
| `runDepth` | `string` | Queue entry (dispatcher-set) | `"light"` (Stage 1 onOpen preliminary), `"full"` (standard), or `"incremental"` (quarterly scheduled refresh). Defaults to `"full"`. |
| `lastRunCursor` | `string \| null` | Prior `researchResults` record | ISO 8601 date string indicating the end date of the previous run. Used by incremental refresh to scope delta queries. Null for first run. |
| `existingMarketData` | `MarketResearchResult \| null` | Prior `researchResults` record | The result from the most recent completed run. Used by incremental refresh for baseline comparison and update. Null for first run. |
| `founderRejectionContext` | `string \| null` | `ResearchAuditEvent` | If the founder previously rejected a result and provided context (e.g., "the market size seems too large — you're including industrial use cases, I'm only targeting consumer retail"), this string is injected into Step 1 query construction to scope subsequent queries appropriately. |
| `inventorProvidedMarketSize` | `string \| null` | Stage 3 `stageProgress` (manual entry) | If the inventor has manually provided a market size figure ("I read that this market is $8B"), this figure is treated as a reference data point to cross-validate against Atlas's own research. It is NOT used as a primary source — it informs confidence scoring. |

### 3.3 Input Validation Rules

Before the research job executes, the worker validates the input payload:

1. `inventionId` must be a valid Convex document ID. If invalid, the job fails immediately with `"invalid_input"` — no retry.
2. `productDescription` must be present and at least 20 characters for the full or incremental path. If missing, the worker falls back to `runDepth: "light"` using only `productCategory`. If `productCategory` is also absent, the job is held in queue with status `"awaiting_input"`.
3. `productCategory` must be one of the recognized Atlas category values. If absent, the worker runs an LLM category inference step (one Claude Haiku call, ~200 tokens) before proceeding. Inferred categories are recorded as assumptions.
4. `targetMarket` must be a valid geographic market string when supplied. Unrecognized values (e.g., `"new york city"`) are normalized to their parent market (`"US"`) and the normalization is recorded as an assumption.
5. `lastRunCursor` must be a valid ISO 8601 date string when `runDepth` is `"incremental"`. If malformed, the worker falls back to `runDepth: "full"` and logs the reason.
6. `inventorProvidedMarketSize` is accepted as a free-text string (no validation) — it is treated as reference context, not structured input.

### 3.4 What Happens When Required Inputs Are Missing

| Missing Input | Behavior |
|---|---|
| `productDescription` missing AND `productCategory` missing | Job status set to `"awaiting_input"`. The queue entry persists. When either field is populated in `stageProgress`, the dispatcher re-evaluates and dispatches. No error is surfaced to the founder. |
| `productDescription` missing but `productCategory` present | `runDepth` forced to `"light"`. Only category-level market size queries are executed (Steps 1 and 2). Result will be low confidence (REQUIRES_REVIEW). UI surfaces: "Atlas estimated market size for your product category. Add a product description for a more targeted market analysis." |
| `productCategory` missing but `productDescription` present | Atlas infers category from product description using one Claude Haiku LLM classification call (~200 tokens) before proceeding with full research. Category inference is recorded as an assumption in `AssumptionRecord[]`. |
| `targetMarket` missing | Defaults to `"US"`. Recorded as assumption: "Atlas assumed your primary market is the United States." |
| `pricePointIntent` missing | TAM is estimated for the full category. SAM is estimated for the mid-market tier by default (the largest segment by unit volume for most consumer product categories). The assumption is recorded. |
| `inventionId` invalid | Job fails immediately, no retry. Error logged. No founder notification — this indicates a dispatcher bug. |

---

## 4. Research Logic (Step-by-Step)

### 4.1 Overview

The Market Research module executes in three paths depending on `runDepth`:

- **Light path** (`runDepth: "light"`): Steps 1 and 2 only. Produces a preliminary TAM range for the product category. No segmentation, no CAGR, no geographic breakdown.
- **Full path** (`runDepth: "full"`): Steps 1 through 11. Produces the complete `MarketResearchResult` including TAM/SAM/SOM, CAGR, segmentation, geographic breakdown, seasonality, drivers, and trend signals.
- **Incremental path** (`runDepth: "incremental"`): Steps 1, 2 (delta-scoped), 7 (growth signal update), 10 (merge with baseline), and 11 (re-score). Updates growth rate, trend direction, and any newly reported market size figures without re-running the full segmentation and geographic analysis.

All paths are executed by a Convex Action with `"use node"` directive in `convex/research/marketResearch.ts` (new file).

---

### Step 1 — Query Construction and Category Classification (All Paths)

**What happens:** The worker constructs the market research query battery and, if `productCategory` was not supplied, performs an LLM-based category classification. Query construction adapts the structured input fields into targeted search queries designed to surface market size reports, industry analyses, government statistics, and trend data.

**Provider used:** `anthropic_claude_haiku` (LLM — Category 5 from Part 2 Section 7.3)

**LLM prompt strategy:**

The worker calls Claude Haiku with the following structured prompt:

```
System: You are a market research query generator for Atlas, an AI platform for inventors.
Your task is to generate targeted web search queries that will surface credible market size data,
industry growth rates, and market structure information for a specific product category.

Generate queries that will surface:
1. Total market size (TAM) — industry reports, analyst estimates, government trade statistics
2. Market growth rate (CAGR) — at least two independent sources
3. Consumer segmentation data — who buys this type of product and in what proportions
4. Geographic market breakdown — which countries/regions generate the most market revenue
5. Key demand drivers and macro trends shaping this category
6. Seasonality indicators — monthly or quarterly demand patterns if available

Output ONLY a JSON array of strings. No commentary. Each string is one search query.
Max 12 queries total. Each query must be under 90 characters.
Include at least one query with a specific year (2024 OR 2025 OR 2026) to surface recent estimates.
Include at least one query referencing US government trade data (e.g., "census", "ita.doc.gov", "bls.gov") for US-targeted products.

Product description: {productDescription}
Product category: {productCategory}
Target market: {targetMarket | "US"}
Target audience: {targetAudience | "not specified"}
Founder rejection context (adjust queries accordingly): {founderRejectionContext | "none"}
```

**Output:** An array of 8–12 search query strings. Stored internally as `queryBattery: string[]`.

**If `productCategory` is absent (category inference sub-step):** Before constructing the query battery, the worker executes a separate Claude Haiku call to classify the product:

```
System: Classify the following product description into exactly one of Atlas's recognized product categories.
Output ONLY the category identifier as a plain string. No explanation.

Recognized categories: [list of all valid Atlas product categories]

Product description: {productDescription}
```

The inferred category is stored as an assumption in `AssumptionRecord[]` and passed forward to the query construction step.

**Fallback if LLM call fails:** Template-based query battery — no LLM required:
- `"{productCategory} market size {targetMarket} 2025"`
- `"{productCategory} industry report CAGR forecast"`
- `"{productCategory} consumer market research report"`
- `"{productCategory} market growth drivers trends"`
- `"{productCategory} total addressable market estimate"`
- `"US {productCategory} market statistics census.gov OR ita.doc.gov"`

Fallback battery uses 6 queries and is annotated as `"template_fallback"`.

**Cost estimate for Step 1:**
- Category inference (if needed): 1 Haiku call, ~300 input tokens + ~50 output tokens = ~$0.00007
- Query battery: 1 Haiku call, ~500 input tokens + ~250 output tokens = ~$0.0004

---

### Step 2 — Web Search for Market Size Signals (All Paths; Delta-Scoped for Incremental)

**What happens:** The worker executes each query in the battery against the web search provider. Market research queries target industry reports, analyst estimates, trade data, and news-sourced estimates.

**Provider used (primary):** `brave_search` (Web Search — Category 1 from Part 2 Section 7.3)

**Fallback chain:** `brave_search` → `serpapi_google` → `bing_search`

**Execution parameters per query:**
- `maxResults: 10` (10 results per query × 8–12 queries = 80–120 raw results)
- `filters.contentType: ["web", "news"]` — include news (market reports are often announced via press release)
- `filters.geography: targetMarket` — where provider supports geographic filtering
- `timeoutMs: 8000` per query

**Incremental path delta scoping:** For `runDepth: "incremental"`, queries are scoped to content published since `lastRunCursor`. The worker further filters queries to growth rate and trend signals specifically — category TAM estimates do not change enough quarter-over-quarter to justify re-querying.

**Result normalization:** Each `SearchResult` is normalized into a `RawMarketSignal`:

```
RawMarketSignal {
  url: string
  title: string
  snippet: string
  domain: string
  contentType: "industry_report" | "government_data" | "news" | "analyst_estimate" | "web"
  relevanceScore: number
  sourceType: SourceType             // Mapped per Part 2 Section 8.4
  publishedDate: string | null
  queryOrigin: string
  extractedFigures: ExtractedFigure[] // Numbers extracted from snippet (see Step 3)
}
```

**Cost estimate for Step 2:**
- Brave Search: $0.003–$0.005 per query × 8–12 queries = $0.024–$0.060 per full run
- Incremental: $0.010–$0.025 (delta-scoped, fewer relevant results)

---

### Step 3 — Numerical Figure Extraction and Validation (Full Path Only)

**What happens:** The worker performs a deterministic numerical extraction pass over all `RawMarketSignal` snippets to pull out market size figures, growth rates, and percentage values before the LLM synthesis step. This prevents the LLM from having to parse raw text for numbers — reducing hallucination risk significantly.

**No external provider.** In-worker processing only.

**Extraction targets:**
1. **Market size figures:** Patterns matching currency values with magnitude qualifiers — e.g., `"$12.4 billion"`, `"USD 3.2B"`, `"€ 8.5 billion"`. Normalized to USD billions.
2. **Growth rate (CAGR) figures:** Patterns matching percentage values adjacent to growth-indicator words — e.g., `"growing at 14.2% CAGR"`, `"compound annual growth rate of 8.5%"`, `"expected to expand at 11%"`. Stored as decimal (0.142, 0.085).
3. **Year references:** The year associated with each figure is extracted (e.g., `"$12.4 billion by 2028"` → `year: 2028`; `"in 2024, the market was valued at $9.1 billion"` → `year: 2024`). Year context determines whether a figure is historical, current-year, or projected.
4. **Market definition scope:** The snippet context is parsed for scope qualifiers — `"global"`, `"North America"`, `"US"`, `"Europe"` — to prevent mixing regional and global estimates in the same calculation.

**Output:** Each `RawMarketSignal` is augmented with:

```
ExtractedFigure {
  figureType: "tam" | "sam" | "som" | "cagr" | "segment_size" | "geographic_size" | "other"
  value: number                    // Normalized numeric value (USD billions for sizes, decimal for CAGR)
  unit: "usd_billion" | "usd_million" | "percent_cagr" | "other"
  year: number | null              // Year associated with the figure
  geographicScope: "global" | "north_america" | "us" | "europe" | "asia_pacific" | "other" | null
  rawText: string                  // The original text fragment from which this was extracted
  confidence: "high" | "medium" | "low" // Extraction confidence (high = clear format, low = ambiguous context)
}
```

**Validation pass:** After extraction, the worker performs basic plausibility validation:
- Market size figures < $1M or > $10T are flagged as `"implausible"` and excluded from synthesis input
- CAGR figures > 100% or negative are flagged and excluded (except for emerging markets where > 50% CAGR for a new technology is noted but flagged)
- Figures where geographic scope conflicts with `targetMarket` are retained but flagged for scope adjustment during synthesis

**Cost estimate for Step 3:** No API calls. In-worker processing only.

---

### Step 4 — Government and Trade Data Queries (Full Path Only)

**What happens:** The worker executes targeted queries against government and trade databases to obtain authoritative baseline market data. Government data is treated as primary source data (highest authority weight) and anchors the TAM estimation.

**Provider used (primary):** `brave_search` (targeted site: operator queries against high-authority domains)

Specific query targets:
- `site:census.gov "{productCategory}" market OR trade OR import OR export` (US Census data)
- `site:ita.doc.gov "{productCategory}"` (International Trade Administration — US export/import data)
- `site:bls.gov "{productCategory}" consumption OR spending OR expenditure` (Bureau of Labor Statistics — consumer expenditure)
- `site:statista.com "{productCategory}" market size {targetMarket}` (Statista aggregated reports)
- For EU-targeted markets: `site:ec.europa.eu "{productCategory}" market statistics`

**What is extracted:** The same numerical extraction from Step 3 is applied to results from this step. Government data sources receive a higher `sourceType` authority weight (`"government_statistical"` = 0.90 per Part 2 Section 8.4) when computing `sourceAuthority` confidence.

**Rate of execution:** 3–5 targeted government/trade queries per full run, beyond the general query battery from Step 2.

**Fallback:** If all government/trade queries return zero relevant results (e.g., the product category is too new for official trade statistics), this step is completed with `governmentDataAvailable: false` in the result metadata. No confidence penalty applies specifically from this step — the penalty is applied through `sourceAuthority` scoring (fewer high-authority sources = lower authority score).

**Cost estimate for Step 4:**
- Brave Search: $0.003–$0.005 per query × 3–5 queries = $0.009–$0.025

---

### Step 5 — Google Trends Market Momentum Signals (Full Path Only; Optional)

**What happens:** The worker queries Google Trends for the primary product category keywords to establish relative search interest over time, trend direction, and seasonal demand patterns.

This step is **optional** — it runs unless the per-stage cost cap is approaching exhaustion or the category is too niche for Google Trends data to be meaningful.

**Provider used:** `google_trends` (via SerpAPI — Market Data Category 3 from Part 2 Section 7.3)

**Fallback:** If unavailable, step is skipped (`trendDataUnavailable: true`). No result-blocking consequence.

**What is queried:**
- Primary product category keyword (e.g., `"glass food storage containers"`)
- Secondary keyword variant (e.g., `"glass meal prep containers"`) — to capture search query diversity within the category
- Relative interest over the past 5 years (to capture full trend arc, not just recent spike/dip)
- Geographic breakdown by market (US national, top 5 states if US-targeted; global country breakdown if global-targeted)
- Seasonality: month-by-month relative interest over the past 24 months

**Output:**
- `trendDirection`: `"rising"` | `"stable"` | `"declining"` | `"breakout"` | `"volatile"`
- `seasonalityProfile`: Array of 12 monthly relative-interest values (January through December, indexed 0–11), normalized to 0–100 scale
- `peakSeason`: Month(s) where relative interest exceeds 75th percentile of the annual range
- `offSeason`: Month(s) where relative interest falls below 25th percentile
- `geographicInterestMap`: Top 10 regions/states with highest relative interest for the category

**Cost estimate for Step 5:**
- SerpAPI Google Trends: $0.01–$0.02 per query × 4 queries = $0.04–$0.08

---

### Step 6 — Market Segmentation Research (Full Path Only)

**What happens:** The worker executes targeted research to identify the primary consumer segments within the market: who buys this type of product, in what proportions, what their demographic and psychographic characteristics are, and how the market revenue is distributed across segments.

**Provider used (primary):** `brave_search` with targeted queries for segmentation data

**Query strategy:**

The worker constructs 3–4 segmentation-focused queries:
- `"{productCategory} consumer demographics age income United States"`
- `"{productCategory} market segmentation report 2024 OR 2025"`
- `"who buys {productCategory} consumer profile survey"`
- `"{productCategory} buyer persona income household"`

`maxResults: 8` per segmentation query.

**Numerical extraction:** Step 3's extraction logic is applied to segmentation results to pull demographic percentages (e.g., `"53% of buyers are women"`, `"household income above $75K accounts for 61% of category spend"`).

**What segments are identified:**
- **Demographic segments:** Age groups (Gen Z, Millennials, Gen X, Boomers), gender distribution, household income bands, household composition (singles, families with children, empty nesters)
- **Psychographic segments:** Lifestyle-driven segments relevant to the category (e.g., "eco-conscious buyers," "convenience-seekers," "health-focused") — extracted from product category consumer research
- **Behavioral segments:** Purchase frequency, purchase occasion (gift vs. personal use, one-time vs. repeat), brand loyalty vs. price sensitivity

**Output:** `ConsumerSegment[]` — see Section 5.4 for full schema.

**Cost estimate for Step 6:**
- Brave Search: $0.003–$0.005 per query × 3–4 queries = $0.009–$0.020

---

### Step 7 — Market Growth Rate Triangulation (Full Path + Incremental)

**What happens:** The worker triangulates the market CAGR from multiple independent sources to arrive at a defensible growth rate estimate. Single-source CAGR figures are rejected as the primary estimate — the module requires at least two independent CAGR references before a rate is reported with meaningful confidence.

**Provider used:** In-worker processing on the already-collected `ExtractedFigure[]` data from Steps 2–6. No new API calls for this step unless fewer than 2 CAGR figures have been extracted — in which case, 2 additional targeted CAGR queries are executed against `brave_search`.

**Additional CAGR queries (if needed):**
- `"{productCategory} market CAGR forecast 2024 2025 2026"`
- `"{productCategory} compound annual growth rate industry analysis"`

**Triangulation logic:**

1. Collect all `ExtractedFigure` entries with `figureType: "cagr"` from Steps 2–6.
2. Filter to entries with `geographicScope` consistent with `targetMarket`.
3. Filter to entries with `confidence: "high"` or `"medium"`.
4. If fewer than 2 remain after filtering, execute the 2 additional CAGR queries above.
5. Compute `cagrEstimate`:
   - If all collected CAGR values fall within a 5-percentage-point range (e.g., 8%, 9%, 10%): take the median value.
   - If collected CAGR values span more than 5 percentage points (e.g., 6% and 18%): report both the low and high as a range; flag `"cagr_wide_range"` in the result; confidence penalty applied.
   - If only 1 CAGR figure available: use it as the estimate with `cagrConfidence: "single_source"` flag.
   - If 0 CAGR figures available: `cagr` is set to `null`; `cagrUnavailable: true`.

**Output:** `cagrEstimate: number | null`, `cagrRangeLow: number | null`, `cagrRangeHigh: number | null`, `cagrConfidence: "multi_source" | "single_source" | "unavailable"`, `cagrSources: SourceReference[]`.

**Cost estimate for Step 7:**
- No new API calls if ≥ 2 CAGR figures extracted in prior steps: $0.00
- 2 additional Brave Search queries if needed: $0.006–$0.010

---

### Step 8 — TAM/SAM/SOM Synthesis (Full Path Only)

**What happens:** This is the primary quantitative synthesis step. The worker passes all collected market data — extracted figures, segmentation data, geographic data, CAGR estimate — to Claude Sonnet for structured TAM/SAM/SOM synthesis. This is the most analytically intensive step and requires Sonnet-level reasoning.

**Provider used:** `anthropic_claude_sonnet` (primary); `openai_gpt4o_mini` (fallback if Anthropic unavailable)

**Why Sonnet, not Haiku:** TAM/SAM/SOM synthesis is not a classification task or a simple extraction task. It requires the LLM to:
- Reconcile multiple conflicting market size estimates from different sources
- Identify and correct for scope differences (global vs. regional figures, industry-wide vs. addressable-segment figures)
- Apply a coherent market sizing methodology (top-down from TAM, or bottom-up from segment data, or both and compare)
- Reason about which segment of the market is truly addressable given the inventor's channel, price point, and audience
- Produce a defensible SOM estimate based on realistic market capture assumptions

Haiku reliably handles classification and extraction. This multi-step analytical reconciliation task is in Sonnet's core competency.

**LLM prompt strategy:**

```
System: You are a market sizing analyst for Atlas, an AI platform for inventors.
Your task is to synthesize market research data into a structured TAM/SAM/SOM estimate.

Methodology requirements:
- Use TOP-DOWN methodology: start from the total market size, then narrow to the addressable segment, then narrow further to the realistic capturable market.
- Cross-validate against BOTTOM-UP estimates where segment data permits (if segment counts and average spend are available, compute from the bottom up and compare to the top-down result).
- If top-down and bottom-up estimates diverge by more than 30%, report both and explain the divergence.
- NEVER invent a market size figure that does not appear in the provided data. If data is insufficient, say so explicitly in the `dataGaps` field.
- ALL figures you use must be traceable to a specific source in the provided data. Each figure in your output must reference its source URL or data description.
- Report TAM as the full global or national (per targetMarket) market for the product category.
- Report SAM as the portion of TAM addressable by this specific product given the target audience, price point, and channels.
- Report SOM as the realistic first-year and three-year market capture — use comparable product launch benchmarks where available, otherwise use conservative market entry assumptions (0.1%–1% of SAM for a new product).

Output ONLY valid JSON matching the provided schema. No commentary outside the JSON.
Temperature: 0.1

Schema: {MarketSizingEstimate JSON Schema — see Section 5.2}
```

User message includes:
- All collected `ExtractedFigure[]` entries from Steps 2–6 (with source metadata)
- Segmentation data from Step 6
- CAGR estimate from Step 7
- Product description and category
- Target market, target audience, price point intent, channel preference
- Any `inventorProvidedMarketSize` reference figure
- Any `founderRejectionContext`

**Anti-hallucination constraints enforced in prompt:**
- Claude must only reference figure values that appear in the provided `ExtractedFigure[]` data — no invented statistics
- Claude must populate `sourcesUsed: SourceReference[]` for every numeric claim in the output
- If evidence is insufficient to estimate a sub-field, Claude must output `null` and populate `dataGaps` with a description of what data was missing
- Claude must not claim that the inventor's product is a certain percentage of the market — the SOM is an estimate for a hypothetical new entrant, not a forecast for this specific product
- Claude must not extrapolate a figure beyond 5 years from the latest data point in the provided sources

**Cost estimate for Step 8:**
- Claude Sonnet: ~4,000 input tokens + ~1,500 output tokens per run = approximately $0.018 per run

---

### Step 9 — Geographic Market Breakdown (Full Path Only)

**What happens:** The worker constructs the geographic breakdown of the market: what share of TAM is attributable to each major geographic market, and how growth rates differ by region.

**Provider used:** In-worker processing on data already collected in Steps 2–6 (no new API calls for US-focused products). For multi-market (`geographicMarket` includes multiple countries or `"global"`), 2–3 targeted geographic queries are executed.

**Optional additional geographic queries (if `geographicMarket` is multi-market):**
- `"{productCategory} market size Europe {year}"`
- `"{productCategory} Asia Pacific market report"`
- `"{productCategory} UK market consumer research"`

**Geographic breakdown logic:**

1. Collect all `ExtractedFigure` entries where `geographicScope` is defined and `figureType` is `"tam"` or `"geographic_size"`.
2. For each geographic market identified in `geographicMarket`, find or calculate the market share (i.e., regional market size as a percentage of global TAM if a global TAM estimate exists, or as a standalone estimate if no global comparison is available).
3. Where regional market size data is absent, use a proxy calculation: US market as 30–40% of global market for most consumer product categories; Europe as 25–35%; APAC as 20–30%. These proxies are recorded as assumptions with `riskIfWrong: "medium"`.
4. Identify top 5 countries by market size or growth rate for the category.

**Output:** `GeographicBreakdown` — see Section 5.5.

**Cost estimate for Step 9:**
- 0 additional API calls for US-only products: $0.00
- 2–3 Brave Search queries for multi-market: $0.006–$0.015

---

### Step 10 — Key Market Drivers and Trend Synthesis (Full Path Only)

**What happens:** The worker executes a final LLM synthesis pass to identify the key demand drivers, macro trends, headwinds, and tailwinds shaping the market. This is a Haiku task — it does not require multi-source reconciliation (that was done in Step 8); it is a synthesis and categorization task working from an already-collected data set.

**Provider used:** `anthropic_claude_haiku` (primary); `openai_gpt4o_mini` (fallback)

**Why Haiku, not Sonnet:** The key drivers synthesis is a structured categorization task: take the collected text snippets, categorize mentions of market influences into a structured taxonomy (demand drivers, supply factors, regulatory factors, consumer behavior shifts, macroeconomic factors), and output a ranked list. Haiku reliably performs categorization tasks at significantly lower cost than Sonnet.

**LLM prompt strategy:**

```
System: You are a market intelligence analyst. Given market research snippets for a product category,
identify and structure the key factors driving market growth, the primary headwinds against growth,
and the most significant macro trends shaping the category.

Classification taxonomy:
- demand_driver: Something that is causing more consumers to want this type of product
- supply_factor: Something affecting how this product category is produced or distributed
- regulatory: Laws, regulations, or policy changes affecting the category
- consumer_behavior: Changes in how or why consumers are buying in this category
- macroeconomic: Broad economic forces (inflation, income trends, demographic shifts) affecting this market
- technology: Technology changes enabling or disrupting this market

Output ONLY valid JSON matching the provided schema.
Temperature: 0.2
IMPORTANT: Only describe factors that appear in the provided research snippets. Do not invent or hypothesize factors not mentioned in the data.

Schema: {MarketDriversAnalysis JSON Schema — see Section 5.6}
```

User message includes:
- All collected `RawMarketSignal` snippets (excluding numerical extraction already done in prior steps — text context only)
- Product category and target market
- CAGR and trend direction from Steps 7 and 5

**Anti-hallucination constraint:** Claude Haiku must only classify and structure factors explicitly mentioned in the provided snippets. It may not introduce trend narratives (e.g., "the shift toward sustainability") unless those words appear in at least one snippet. The output's `factorSources` field must map each driver to the snippet(s) that evidence it.

**Cost estimate for Step 10:**
- Claude Haiku: ~3,000 input tokens + ~600 output tokens per run = approximately $0.0005 per run

---

### Step 11 — Confidence Scoring and Result Finalization (All Paths)

**What happens:** The worker computes the confidence score for the result (see Section 7 for full methodology), attaches the `ConfidenceRecord`, assembles the final `MarketResearchResult` output document (see Section 5), and writes it to `researchResults`.

**No external provider.** Deterministic computation.

**Result assembly:**

The worker assembles the final result object from:
- `marketSizingEstimate` (from Step 8) or preliminary TAM only (light path)
- `cagrEstimate`, `cagrRangeLow`, `cagrRangeHigh` (from Step 7)
- `trendData` (from Step 5) or `trendDataUnavailable: true`
- `consumerSegments` (from Step 6)
- `geographicBreakdown` (from Step 9)
- `marketDrivers` (from Step 10)
- The `ConfidenceRecord` (see Section 7)
- Metadata: `researchedAt`, `expiresAt`, `providerUsed`, `runDepth`, `queryCount`, `lastRunCursor` (updated to current timestamp)

---

## 5. Output Schema

### 5.1 Top-Level Result Structure

The `processedResult` field in the `researchResults` record stores the following top-level object for this module:

```typescript
MarketResearchResult {
  // Module identification
  moduleId: "market_research"
  runDepth: "light" | "full" | "incremental"

  // Core market sizing output
  marketSizing: MarketSizingEstimate            // TAM/SAM/SOM (see 5.2)
  growth: MarketGrowthEstimate                  // CAGR and trend (see 5.3)
  consumerSegments: ConsumerSegment[]           // Market segmentation (see 5.4)
  geographicBreakdown: GeographicBreakdown      // Regional market data (see 5.5)
  marketDrivers: MarketDriversAnalysis          // Key drivers and trends (see 5.6)
  trendData: MarketTrendData | null             // Google Trends signals (see 5.7)

  // Change tracking (incremental runs only)
  changesSinceLastRun: MarketDataChangeEvent[]  // Empty on first run
  growthRateRevised: boolean                    // Whether CAGR changed from baseline
  tamRevised: boolean                           // Whether TAM estimate changed materially

  // Data quality metadata
  governmentDataAvailable: boolean              // Whether Step 4 found government sources
  cagrConfidence: "multi_source" | "single_source" | "unavailable"
  dataGaps: string[]                            // Specific data gaps the LLM identified
  assumptionsRecord: AssumptionRecord[]         // All assumptions made during research

  // Research metadata
  queryCount: number
  sourcesConsulted: number
  primarySourceCount: number
  secondarySourceCount: number
  lastRunCursor: string                         // ISO 8601 — start point for next incremental run

  // Confidence record
  confidence: ConfidenceRecord                  // Full confidence record — see Section 7
}
```

### 5.2 MarketSizingEstimate Schema

This is the core quantitative output of the module.

```typescript
MarketSizingEstimate {
  // Total Addressable Market
  tam: {
    valueBillionsUsd: number | null             // TAM in USD billions
    valueRangeLow: number | null                // Low end of range (billions)
    valueRangeHigh: number | null               // High end of range (billions)
    geographicScope: "global" | "north_america" | "us" | "europe" | "other"
    year: number | null                         // Year of the estimate
    methodology: "top_down" | "bottom_up" | "analyst_reported" | "government_reported" | "triangulated"
    sourcesUsed: SourceReference[]              // Sources that contributed to this estimate
    notes: string | null                        // Any reconciliation notes (e.g., "Global TAM used; US estimated at 35% of global")
  }

  // Serviceable Addressable Market
  sam: {
    valueBillionsUsd: number | null
    valueRangeLow: number | null
    valueRangeHigh: number | null
    geographicScope: string                     // Same scope as targetMarket
    targetSegmentDescription: string | null     // Which segment of TAM this SAM represents
    segmentingFactors: string[]                 // How TAM was narrowed (price tier, audience, channel)
    tamToSamRatio: number | null                // SAM / TAM (0.0–1.0)
    sourcesUsed: SourceReference[]
    notes: string | null
  }

  // Serviceable Obtainable Market
  som: {
    firstYearValueMillionsUsd: number | null    // Realistic Year 1 capture (millions USD)
    threeYearValueMillionsUsd: number | null    // Realistic Year 3 capture (millions USD)
    samToSomRatio: number | null                // SOM / SAM for Year 1 estimate
    captureAssumptions: string[]                // Assumptions underlying the SOM (e.g., "0.3% SAM capture in Year 1")
    benchmarkReferenceProducts: string[]        // Comparable product launches used as benchmarks (if any)
    notes: string | null
  }

  // Validation
  bottomUpCrossCheck: {
    available: boolean                          // Whether bottom-up cross-check was possible
    estimateBillionsUsd: number | null          // Bottom-up estimate for comparison
    divergenceFromTopDown: number | null        // Percentage difference from TAM top-down
    reconciliationNote: string | null           // Explanation if divergence > 30%
  }
}
```

### 5.3 MarketGrowthEstimate Schema

```typescript
MarketGrowthEstimate {
  cagrPercent: number | null                    // Compound Annual Growth Rate as decimal (e.g., 0.142 = 14.2%)
  cagrRangeLow: number | null                   // Low end of CAGR range
  cagrRangeHigh: number | null                  // High end of CAGR range
  cagrForecastPeriod: string | null             // Time period the CAGR applies to (e.g., "2024–2030")
  cagrConfidence: "multi_source" | "single_source" | "unavailable"
  cagrSources: SourceReference[]
  cagrWideRangeFlag: boolean                    // True if low and high differ by > 5 percentage points

  // Growth phase classification
  marketMaturityStage: "emerging" | "growth" | "maturing" | "mature" | "declining" | "unknown"
  marketMaturityNotes: string | null            // Supporting rationale for maturity classification

  // Projected market size
  projectedTamYear3BillionsUsd: number | null   // TAM projected 3 years forward using CAGR
  projectedTamYear5BillionsUsd: number | null   // TAM projected 5 years forward using CAGR
}
```

### 5.4 ConsumerSegment Schema

```typescript
ConsumerSegment {
  segmentId: string                             // UUID (stable across incremental runs)
  segmentName: string                           // Human-readable segment name (e.g., "Health-Conscious Millennials")
  segmentType: "demographic" | "psychographic" | "behavioral" | "geographic"

  // Demographic attributes (populated for demographic segments)
  demographics: {
    ageRange: string | null                     // e.g., "25–44"
    genderSplit: string | null                  // e.g., "62% female, 38% male"
    householdIncomeBand: string | null          // e.g., "$50K–$100K household income"
    householdComposition: string | null         // e.g., "Families with children under 12"
    geographicConcentration: string | null      // e.g., "Urban and suburban US"
  } | null

  // Segment size and value
  estimatedSizePercent: number | null           // Share of total category buyers (0.0–1.0)
  estimatedSizeMillionsConsumers: number | null // Estimated count of buyers in this segment
  estimatedSpendSharePercent: number | null     // Share of category revenue this segment represents
  growthOutlook: "growing" | "stable" | "declining" | "unknown"

  // Behavioral characteristics
  purchaseFrequency: string | null              // e.g., "Quarterly repurchase" or "One-time purchase"
  purchaseOccasion: string[] | null             // e.g., ["Gift", "Personal use", "Household stock-up"]
  brandLoyaltyLevel: "high" | "moderate" | "low" | "unknown"
  priceSensitivity: "high" | "moderate" | "low" | "unknown"
  primaryPurchaseChannel: string[] | null       // Channels this segment predominantly uses

  // Evidence
  sourcesUsed: SourceReference[]
  notes: string | null
}
```

### 5.5 GeographicBreakdown Schema

```typescript
GeographicBreakdown {
  primaryMarket: string                         // The targetMarket value
  geographicScope: "us_only" | "north_america" | "multi_region" | "global"

  regions: GeographicRegionData[]               // Per-region market data

  // Top markets by size
  topMarketsByRevenue: string[]                 // Top 5 countries/regions by market revenue
  topMarketsByGrowth: string[]                  // Top 5 countries/regions by CAGR

  // Geographic concentration
  usShareOfGlobalPercent: number | null         // US share of global TAM
  notes: string | null
}

GeographicRegionData {
  region: string                                // Region name (e.g., "United States", "European Union")
  marketSizeBillionsUsd: number | null          // Market size in this region
  shareOfGlobalPercent: number | null           // Share of global market
  cagrPercent: number | null                    // Region-specific CAGR (if available)
  cagrForecastPeriod: string | null
  growthOutlook: "strong" | "moderate" | "flat" | "declining" | "unknown"
  keyNotes: string | null                       // Any region-specific context (regulatory, cultural)
  sourcesUsed: SourceReference[]
}
```

### 5.6 MarketDriversAnalysis Schema

```typescript
MarketDriversAnalysis {
  growthDrivers: MarketFactor[]                 // Factors accelerating market growth
  headwinds: MarketFactor[]                     // Factors impeding growth
  macroTrends: MarketFactor[]                   // Broader trends shaping the category
  regulatoryFactors: MarketFactor[]             // Regulatory environment considerations
  technologyFactors: MarketFactor[]             // Technology shifts (enabling or disruptive)

  overallOutlookSummary: string | null          // One paragraph synthesizing the market outlook
}

MarketFactor {
  factorName: string                            // Short name (e.g., "Rising consumer health awareness")
  factorType: "demand_driver" | "headwind" | "macro_trend" | "regulatory" | "technology" | "consumer_behavior" | "supply_factor"
  description: string                           // 1–2 sentence description
  impactLevel: "high" | "moderate" | "low"
  timeHorizon: "near_term" | "medium_term" | "long_term" | "persistent"
  factorSources: SourceReference[]             // Sources evidencing this factor
}
```

### 5.7 MarketTrendData Schema

```typescript
MarketTrendData {
  primaryKeyword: string                        // Product category keyword queried
  secondaryKeyword: string | null              // Secondary variant keyword queried

  // Overall trend
  trendDirection: "rising" | "stable" | "declining" | "breakout" | "volatile"
  relativeInterestCurrent: number              // Current relative interest (0–100)
  period: "last_24_months" | "last_5_years"

  // Seasonality
  seasonalityProfile: number[]                 // 12 values (Jan–Dec), 0–100 scale
  peakMonths: number[]                         // Months (0-indexed) where demand peaks
  offSeasonMonths: number[]                    // Months where demand troughs
  seasonalityStrength: "strong" | "moderate" | "weak" | "none"
                                               // "strong" = peak/trough spread > 40 points

  // Geographic interest
  topInterestRegions: GeographicInterestRecord[]  // Top 10 regions by relative interest

  dataVintage: string                          // How fresh the data is
  trendDataUnavailable: boolean
}

GeographicInterestRecord {
  region: string
  relativeInterest: number                     // 0–100
}
```

### 5.8 Confidence Record

The `ConfidenceRecord` attached to every `MarketResearchResult` is the full schema defined in Part 2 Section 8.2. The module-specific scoring methodology is defined in Section 7 of this document.

The `transparencyLabel` for market research results is `"atlas_researched"` when data is sourced from external APIs and web search. When the result was produced with `runDepth: "light"` using only category-level queries, `transparencyLabel` is `"atlas_inferred"`.

### 5.9 Mapping to Convex Document Fields

| Output Field | Destination Table | Destination Field | Notes |
|---|---|---|---|
| `MarketResearchResult` (full object) | `researchResults` | `processedResult` | Primary storage; full result |
| `marketSizing.tam.valueBillionsUsd` | `stageProgress` | `tamEstimateBillionsUsd` | Written after founder review; used in Idea Brief and pitch deck |
| `marketSizing.sam.valueBillionsUsd` | `stageProgress` | `samEstimateBillionsUsd` | Written after founder review |
| `marketSizing.som.firstYearValueMillionsUsd` | `stageProgress` | `somEstimateFirstYearMillionsUsd` | Written after founder review |
| `growth.cagrPercent` | `stageProgress` | `marketCagrPercent` | Used in Readiness Engine market dimension scoring |
| `growth.marketMaturityStage` | `stageProgress` | `marketMaturityLabel` | Used in business model and investor deck stages |
| `consumerSegments[]` | `stageProgress` | `consumerSegmentList` | Top 5 segments; used in Stage 11 marketing audience selection |
| `geographicBreakdown` | `stageProgress` | `geographicMarketBreakdown` | Used in Stage 14 launch planning |
| `trendData.seasonalityProfile` | `stageProgress` | `seasonalityProfile` | Used in Stage 7 manufacturing timing and Stage 14 launch timing |
| `marketDrivers.growthDrivers[]` | `stageProgress` | `keyMarketDrivers` | Used in Stage 3 Market Research Summary and Stage 13 pitch deck |
| `confidence.score` | `stageProgress` | `marketResearchConfidenceScore` | Fed into Readiness Engine market dimension |

---

## 6. Documents Affected

### 6.1 Convex Tables Written

| Table | Operation | When |
|---|---|---|
| `researchResults` | Insert (new version) | Every time the module completes successfully |
| `researchQueue` | Update (status change) | At job start (`"in_progress"`) and job completion (`"completed"` or `"failed"`) |
| `stageProgress` | Patch (partial update) | After founder review/approval — not on raw research completion |
| `researchExecutionLog` | Insert | Every execution, successful or failed |
| `moduleCalibration` | Patch | On founder approval, rejection, or edit |

### 6.2 Fields Updated

**`researchResults` (new record inserted on each run):**
- All fields as defined in Part 1 Section 2.8
- `moduleId: "market_research"`
- `processedResult: MarketResearchResult`
- `outputRoutes: ["stage_view", "document_input", "readiness_engine", "monitoring_feed"]`

**`stageProgress` (written after founder approval):**
- Fields in Section 5.9 above are patched to the `stageProgress` record for the stage that triggered the research job (`stageId`). Stage 3 is the primary beneficiary. Stage 12 and Stage 13 read the Stage 3 result as their source — they do not have their own separate `stageProgress` market research fields.

### 6.3 Write Rules

| Target | Write Rule |
|---|---|
| `researchResults` | **Insert only** — never overwrite. New version per run. Version number is `max(existingVersions) + 1`. |
| `stageProgress.tamEstimateBillionsUsd` | **Overwrite** — latest estimate replaces prior. TAM estimates are expected to be revised as better data becomes available. |
| `stageProgress.samEstimateBillionsUsd` | **Overwrite** |
| `stageProgress.somEstimateFirstYearMillionsUsd` | **Overwrite** |
| `stageProgress.consumerSegmentList` | **Merge** — new segments are added; existing segments are updated in place by `segmentId`. No segment is removed unless the founder explicitly deletes it. |
| `stageProgress.seasonalityProfile` | **Overwrite** — latest seasonality profile replaces prior. |
| `stageProgress.keyMarketDrivers` | **Overwrite** — latest driver list replaces prior. |
| `stageProgress.marketResearchConfidenceScore` | **Overwrite** — latest confidence score. |

### 6.4 Downstream Documents Updated

The following Atlas documents draw from `market_research` module output:

| Document | When Updated | Fields Consumed |
|---|---|---|
| **Idea Brief** (Stage 1) | After Stage 1 light sweep result is approved | Preliminary TAM range only; no segmentation at this stage |
| **Market Research Summary** (Stage 3) | After Stage 3 full result is approved | Full TAM/SAM/SOM, CAGR, segments, geographic breakdown, drivers |
| **Business Model Canvas** (Stage 5) | After Stage 5 onOpen sub-task completes | SAM and SOM estimates; opportunity sizing narrative |
| **Investor Pitch Deck — Market Slide** (Stage 13) | After Stage 13 market data refresh sub-task completes | TAM/SAM/SOM, CAGR, top market drivers, geographic opportunity |
| **Funding Readiness Report** (Stage 12) | After Stage 12 incremental refresh completes | TAM, CAGR, confidence score — fed to Readiness Engine |
| **Launch Plan** (Stage 14) | After Stage 14 onOpen | Seasonality profile, geographic market prioritization |

### 6.5 Versioning Behavior

As defined in Part 1 Section 2.9, every research run writes a new version record.

**Incremental run versioning:** An incremental run writes a new version whose `processedResult` contains the full current market research picture — the baseline TAM/SAM/SOM from the original full run plus updated CAGR and trend signals. Downstream consumers always read the complete current result.

**Version retention:** All prior versions are retained indefinitely. The Document Pipeline and stage view always read the latest completed version.

**Stale version behavior:** When a new version is written, the prior version's status is updated to `"superseded"`.

---

## 7. Confidence Scoring

### 7.1 Module-Specific Scoring Methodology

The confidence score for this module is computed from the five components defined in Part 2 Section 8.2, with Market Research-specific signal definitions:

**Component weights:**
- `sourceCount`: 15%
- `sourceAuthority`: 35%
- `resultRecency`: 20%
- `coverageCompleteness`: 20%
- `internalConsistency`: 10%

**Rationale for weight distribution:** Market research confidence is dominated by source authority more than competitor research. A TAM figure from a single Grand View Research report is more reliable than a TAM figure synthesized from 10 random web snippets. The higher `sourceAuthority` weight (35% vs. 25% in Module 01) reflects this reality. `internalConsistency` is lower (10% vs. 15%) because market size estimates legitimately vary across sources due to differing market definitions — inter-source disagreement is expected and should not disproportionately penalize the result.

**Component scoring signals for this module:**

| Component | Scoring Signal | Score |
|---|---|---|
| `sourceCount` | ≥ 4 distinct market size figures from ≥ 3 different source domains | 1.00 |
| `sourceCount` | 3 distinct market size figures | 0.75 |
| `sourceCount` | 2 distinct market size figures | 0.60 |
| `sourceCount` | 1 market size figure | 0.40 |
| `sourceCount` | 0 market size figures (search returned no data) | 0.00 |
| `sourceAuthority` | Any government source (census.gov, ita.doc.gov, bls.gov, ec.europa.eu) used | 0.90 component anchor — weighted heavily |
| `sourceAuthority` | Established research firm (Grand View Research, IBISWorld, Mordor, MarketsandMarkets, Statista) | 0.75 |
| `sourceAuthority` | Industry association or trade publication | 0.65 |
| `sourceAuthority` | News article or press release | 0.45 |
| `sourceAuthority` | Unclassified web search result | 0.25 |
| `sourceAuthority` | LLM synthesis only (no external source available) | 0.10 |
| `resultRecency` | All market size figures dated within 24 months | 1.00 |
| `resultRecency` | Figures dated 24–48 months | 0.75 |
| `resultRecency` | Figures dated > 48 months | 0.50 |
| `resultRecency` | No date available on any figure | 0.40 |
| `coverageCompleteness` | TAM, SAM, SOM, CAGR, ≥ 2 segments, ≥ 1 geographic breakdown, ≥ 2 market drivers all present | 1.00 |
| `coverageCompleteness` | SOM missing (SAM and TAM present) | 0.85 |
| `coverageCompleteness` | CAGR missing | 0.80 |
| `coverageCompleteness` | Segments missing | 0.75 |
| `coverageCompleteness` | Only TAM available (no SAM, SOM, or CAGR) | 0.50 |
| `coverageCompleteness` | Only preliminary TAM range (light path result) | 0.30 |
| `internalConsistency` | TAM figures from multiple sources agree within 30% | 1.00 |
| `internalConsistency` | TAM figures diverge by 30–60% (different market definitions likely) | 0.70 |
| `internalConsistency` | TAM figures diverge by > 60% | 0.50 |
| `internalConsistency` | Bottom-up cross-check available and agrees within 30% of top-down | +0.05 bonus (max 1.0 after bonus) |
| `internalConsistency` | CAGR direction contradicts trend data direction | -0.10 penalty |

**Final score formula:**

```
rawScore = (sourceCount × 0.15) + (sourceAuthority × 0.35) + (resultRecency × 0.20) +
           (coverageCompleteness × 0.20) + (internalConsistency × 0.10)

calibratedScore = min(1.0, rawScore × moduleCalibration.scoreAdjustmentFactor)
```

### 7.2 Primary vs. Secondary Source Weighting

Market research uses a wider mix of source types than competitive landscape research, and the source authority calculation for this module requires careful handling of the "analyst report" source type:

| Source Type | Expected Frequency | Authority Weight |
|---|---|---|
| `government_statistical` (census.gov, bls.gov, ita.doc.gov, etc.) | Occasional — available for established categories | 0.90 |
| `established_analyst_report` (Grand View, IBISWorld, Mordor, MarketsandMarkets) | Common for commercial categories | 0.75 |
| `industry_association` (trade association publications, industry group reports) | Moderate | 0.65 |
| `trade_publication` (industry journals, trade press) | Moderate | 0.55 |
| `news_article` (market size mentioned in business press coverage) | Common | 0.45 |
| `statista_aggregate` (Statista pages that aggregate third-party estimates) | Common | 0.65 |
| `web_search_result` (unclassified content) | Common | 0.25 |
| `llm_synthesis` (fields generated by Claude with no external source) | Used for SOM assumptions | 0.10 |

**Important caveat for analyst reports:** Many market research reports (Grand View Research, Mordor Intelligence, etc.) are pay-gated. Atlas's web search will typically surface only the report summary page or a press release announcing the report, not the full report. The `ExtractedFigure` from a market research report summary is treated as an analyst-reported figure with authority weight 0.75 — even though Atlas is reading the free summary, not the paid full report. The assumption is that the headline TAM figure in the summary accurately reflects the paid report's findings. This is recorded as an assumption in `AssumptionRecord[]`.

### 7.3 Confidence Degradation Schedule

Market data changes more slowly than competitive landscape data. Accordingly, the confidence degradation schedule for this module is more generous:

```
effectiveConfidence(t) = storedScore × max(0.35, 1.0 - (daysSinceResearch / 90))
```

| Days Since Research | Example (stored score 0.80) | Effective Confidence | Label |
|---|---|---|---|
| 0 (fresh) | 0.80 | 0.80 | AUTO_ACCEPT |
| 30 days | 0.80 × (1 - 0.33) = 0.80 × 0.67 = 0.54 | 0.54 | REQUIRES_REVIEW |
| 60 days | 0.80 × (1 - 0.67) = 0.80 × 0.33 = 0.26 → floor applies | 0.35 (floor) | REQUIRES_REVIEW |
| 90 days | floor | 0.35 (floor) | REQUIRES_REVIEW |

**Half-life:** 90 days (per Part 2 Section 8.7 for Market Data category)
**Minimum floor:** 0.35

**Interpretation:** A market research result with an 0.80 stored score degrades to REVIEW_RECOMMENDED at approximately 24 days (0.60 threshold) and to REQUIRES_REVIEW at approximately 30 days. This reflects that industry-level market trends do not change meaningfully month-to-month, but a 3–6 month-old estimate may miss a meaningful market shift or new analyst report. The quarterly scheduled refresh (Section 2.1) is designed to keep the result within the AUTO_ACCEPT or REVIEW_RECOMMENDED window for the majority of the time between refreshes.

### 7.4 What Triggers REQUIRES_REVIEW

This module's result triggers `REQUIRES_REVIEW` when any of the following conditions apply:

1. **Effective confidence below 0.60** (standard threshold from Part 2 Section 8.3)
2. **TAM estimate unavailable** — no market size figure was found for the category; an empty TAM cannot populate the Idea Brief or pitch deck and requires human input
3. **Only a light-path result exists** — light results do not include SAM, SOM, segmentation, or CAGR; they are always REQUIRES_REVIEW regardless of confidence score
4. **CAGR unavailable** — growth rate is a required field for funding stages (Stage 12, 13); if CAGR could not be established from any source, the result requires review before flowing to those stages
5. **High-risk assumption present** — if the module assumed `productCategory` and the inferred category significantly constrains the market estimate (e.g., a "smart home" product categorized as "consumer electronics" instead of "IoT devices" produces a very different TAM), the assumption is `riskIfWrong: "high"` and REQUIRES_REVIEW is triggered
6. **TAM divergence > 60%** — when multiple TAM sources conflict by more than 60% and reconciliation was not possible, the result requires the founder to choose which market definition is correct
7. **Effective confidence degraded below 0.60** due to time elapsed (see Section 7.3)
8. **`inventorProvidedMarketSize` diverges from Atlas estimate by > 50%** — when the founder's manually entered market size differs substantially from Atlas's research-derived estimate, the discrepancy requires the founder to reconcile the difference before the figure is used downstream

### 7.5 What Triggers AUTO_ACCEPT

This module's result auto-accepts when ALL of the following conditions are true:

1. `effectiveConfidence ≥ 0.85`
2. TAM, SAM, and CAGR are all present (not null)
3. At least one CAGR figure comes from a multi-source triangulation (not single-source)
4. No high-risk assumptions are present
5. No prior rejection of this module for this `inventionId`
6. `runDepth` is `"full"` or `"incremental"` (not `"light"`)
7. If `inventorProvidedMarketSize` is set, the Atlas estimate is within 50% of the founder's figure (no unresolved divergence)

This module IS eligible for auto-acceptance. At AUTO_ACCEPT threshold, the market sizing estimates, CAGR, and segmentation data flow directly into the stage view and document pipeline without requiring explicit founder confirmation. The founder can still edit auto-accepted results at any time.

---

## 8. Caching

### 8.1 Cache Key Structure

Per Part 1 Section 6.2, the cache key for this module is:

- `inventionId` — the invention record
- `stageId` — the stage this research was generated for
- `moduleId: "market_research"` — fixed
- `contextHash` — a deterministic hash of the following fields:

```
contextHash = sha256(
  normalize(productDescription) +       // Lowercased, whitespace-normalized, keyword-extracted
  normalize(productCategory) +
  normalize(targetMarket) +              // Defaults to "US"
  normalize(pricePointIntent ?? "") +    // Included because price tier changes SAM
  sort(channelPreference ?? []).join(",") // Included because channel changes SOM
)
```

**Context hash stability rules for this module:**

- Changes to `productDescription` that do not change the market category are unlikely to invalidate the hash (minor description changes do not change which market the invention is entering)
- Changes to `productCategory` ALWAYS invalidate the hash
- Changes to `targetMarket` ALWAYS invalidate the hash
- Changes to `pricePointIntent` do NOT trigger a full re-run but DO trigger a SAM/SOM sub-task (the TAM and CAGR are unchanged)
- Changes to `channelPreference` alone do NOT trigger a full re-run but DO trigger a SOM sub-task
- Changes to `targetAudience` alone do NOT invalidate the hash (audience is used in segmentation weight, not market definition)

### 8.2 TTL and Expiration

| Run Depth | TTL from Execution | Rationale |
|---|---|---|
| `"light"` result | 24 hours | Light results are preliminary; should be superseded quickly by a full run when Stage 3 opens |
| `"full"` result | 90 days | Standard TTL for Market Data category (Part 1 Section 6.3) |
| `"incremental"` result | 90 days from incremental run date | Incremental runs reset the TTL |

After TTL expiration, the result is stale and refreshes on the next qualifying trigger. The stale result continues to be served with a staleness indicator until refresh completes.

### 8.3 Incremental Update Strategy

This module supports incremental updates for quarterly scheduled refreshes.

**Incremental update conditions** (a new run uses `runDepth: "incremental"` instead of `"full"` when ALL are true):

1. A prior completed result exists for the same (inventionId, stageId, moduleId, contextHash)
2. The prior result has status `"completed"` and `coverageCompleteness` was rated ≥ 0.75
3. The trigger is `scheduledResearch` (not `onStageComplete`, not `manualRefresh`, not a context-delta trigger)
4. The prior result was completed within the last 180 days (results older than 180 days trigger a full re-run even if the trigger is scheduled)

**What the incremental run does:**
- Uses `lastRunCursor` as the date boundary for delta queries in Steps 2 and 5 (new market reports published since last run)
- Re-runs Step 7 (CAGR triangulation) on the combined old + new signals
- Skips Steps 6, 8, 9, 10 (segmentation, full TAM synthesis, geographic breakdown, and drivers analysis — these are stable over 90 days)
- Detects whether the updated CAGR or trend direction has changed materially versus the baseline (`growthRateRevised: true` / `tamRevised: true` flags)
- Writes a new version with the complete result (TAM/SAM/SOM from baseline + updated growth signals)

**Why incremental is preferred for quarterly runs:** A full run costs approximately $0.10–$0.18. An incremental run (updating growth signals only) costs approximately $0.02–$0.05 — a 70–80% cost reduction. Over 4 quarterly refreshes per year, this saves $0.24–$0.52 per invention per year while maintaining the growth signal freshness that funding-related stages require.

### 8.4 Full Re-Run Required vs. Partial Refresh

| Trigger | Full Re-Run or Partial Refresh |
|---|---|
| `onOpen` (Stage 3) — first time Stage 3 opens | Full re-run — no prior full-run result exists |
| `onStageComplete` (Stage 3) | Full re-run — confirmed Stage 3 inputs may add specificity |
| `onOpen` (Stage 5) | Opportunity sizing sub-task only (SAM/SOM recalculation with price and channel inputs confirmed) |
| `onOpen` (Stage 12) | Full incremental refresh — funding context requires current data |
| `onOpen` (Stage 13) | Pitch deck market data sub-task (format restructuring, no new research) |
| `scheduledResearch` | Incremental refresh (unless > 180 days old — then full re-run) |
| `manualRefresh` | Full re-run always |
| Context delta (product category changed) | Full re-run |
| Context delta (price point or channel changed) | SAM/SOM sub-task only |
| Prior result has `"failed"` status | Full re-run — treat as cache miss |

---

## 9. Error Handling

### 9.1 Known Failure Modes

| Failure Mode | Description | Likelihood |
|---|---|---|
| No market size data found | All search queries return zero results with extractable market size figures | Low-Moderate — for very niche or novel categories |
| Single-source TAM only | Only one market size figure extracted; cannot triangulate | Moderate |
| CAGR unavailable | No growth rate data found for the category | Moderate — newer categories lack established CAGR data |
| LLM synthesis failure (Step 8) | Claude Sonnet or fallback LLM unavailable | Low |
| Government data unavailable | No census.gov / bls.gov / ita.doc.gov results for the category | Common — most narrow product categories lack direct government trade data |
| Web search rate limit | Brave Search or SerpAPI quota exhausted | Low-Moderate |
| Provider timeout | Query exceeds 8-second timeout for all providers | Low |
| Wide CAGR range (> 5 pp divergence) | Multiple sources give conflicting CAGR estimates | Moderate — common for rapidly evolving markets |
| TAM scope mismatch | Sources use different geographic or definitional scope, making comparison invalid | Moderate |

### 9.2 Provider-Specific Failure Handling

**Brave Search failure:**
1. Immediately fall back to `serpapi_google`
2. If `serpapi_google` also fails, fall back to `bing_search`
3. If all web search providers fail, job is marked `"all_providers_failed"` and retried after the backoff window
4. Per-provider fallback penalty per Part 2 Section 7.6 (-0.05 first fallback, -0.10 second fallback) applied to confidence

**Google Trends failure (Step 5):**
- Step 5 is skipped entirely (`trendDataUnavailable: true`)
- No confidence penalty — trend data is supplemental
- Seasonality profile will be `null`; the UI notes: "Seasonal demand data is unavailable for this category."

**Claude Sonnet failure (Step 8):**
1. Retry once after 30 seconds with the same prompt
2. On second failure, fall back to `openai_gpt4o_mini`
3. If both fail: Steps 8, 9, and 10 are skipped. The result is written with raw `ExtractedFigure[]` data only — no synthesized TAM/SAM/SOM. Confidence is automatically reduced: `coverageCompleteness` capped at 0.30 (raw figures without synthesis are not a complete result). Result is REQUIRES_REVIEW with founder message: "Atlas found market size data but could not synthesize it into a complete analysis. The raw figures are below for your review."
4. The `ExtractedFigure[]` array is surfaced directly to the founder — who can use the raw data and manually enter the synthesized values

**Claude Haiku failure (Steps 1 and 10):**
- Step 1: Use template fallback query battery
- Step 10 (drivers synthesis): Skipped; `marketDrivers` is set to null; `dataGaps` includes "Key market driver analysis unavailable — LLM synthesis error"
- No job-level failure from Haiku failure alone

### 9.3 Partial Result Handling

A **partial result** occurs when some steps complete and others fail. Partial results are written with a `"partial"` flag and are surfaced to the founder.

| Partial Scenario | Fields Available | Fields Missing | Confidence Impact |
|---|---|---|---|
| Steps 1–7 succeeded, Step 8 (synthesis) failed | Raw `ExtractedFigure[]` data; CAGR estimate; trend data | Synthesized TAM/SAM/SOM | `coverageCompleteness` → 0.30 |
| Steps 1–8 succeeded, Step 6 skipped (segmentation unavailable) | Full TAM/SAM/SOM; CAGR; drivers | Consumer segments | `coverageCompleteness` → 0.80 |
| Steps 1–4 succeeded, Step 5 (Trends) skipped | TAM/SAM/SOM; CAGR | Seasonality; trend direction | No penalty — Trends is optional |
| Steps 1–3 succeeded, no government data (Step 4) | Market data from web search | No government-sourced anchors | `sourceAuthority` reduced (no primary source weight) |
| Only light-path data (Steps 1–2) | Preliminary TAM range | SAM; SOM; CAGR; segments; geography; drivers | Full score likely ≤ 0.35 |

Partial results are never served to the Document Pipeline for document assembly sections that require complete data. They are surfaced to the founder in the stage view with a clear partial-result indicator.

### 9.4 Founder-Facing Error Messages

**Research job failed (all retries exhausted):**

> "Atlas wasn't able to complete market research for your product category. This sometimes happens for newer or more niche markets where public data is limited. You can [Try again] or [Enter market data manually]."

**Only a light-path or partial result is available:**

> "Atlas found preliminary market data for your category but couldn't complete a full analysis. [N] market size figures were found but need your review. You can [Review what Atlas found] or [Refresh for a complete analysis]."

**No market size data found at all:**

> "Atlas couldn't find market size data for this specific product category. This may be a new or niche market. You can [Enter market size manually] or [Try a broader category]."

**CAGR not available:**

> "Atlas found market size estimates but couldn't find a reliable growth rate for this category. You can [Enter a growth rate] based on your own research, or [Ask Atlas to try again]."

**Wide CAGR range:**

> "Atlas found conflicting growth rate estimates for this market (ranging from [X%] to [Y%]). Different sources define this market differently. Please [Review the estimates] and confirm which growth rate best applies to your specific product."

**Research in progress:**

> "Atlas is building your market analysis... This takes about 60–90 seconds."

### 9.5 Retry Behavior

| Retry Event | Delay | Max Retries |
|---|---|---|
| Network error | 30 sec → 2 min → 10 min → 30 min | 4 |
| Provider 429 (rate limit) | Retry-After header (or 60 sec if absent) | 4 |
| Provider 5xx | 30 sec → 2 min → 10 min → 30 min | 4 |
| Timeout | 30 sec (then full re-execution) | 3 |
| LLM synthesis failure (Step 8) | 30 sec (try fallback LLM on first retry) | 2 |
| Haiku failure (Steps 1, 10) | Immediate template fallback (no retry delay) | 1 (then fallback) |

**Non-retryable failures:**
- Invalid `inventionId` or `stageId` — dispatcher bug
- `productDescription` too short to classify (< 20 characters) — requires founder correction
- Per-invention budget exhausted — held, not retried, until budget resets

---

## 10. Cost Estimate

### 10.1 Expected API Call Count Per Run

**Full run (`runDepth: "full"`):**

| Step | Provider | Calls | Description |
|---|---|---|---|
| Step 1 | Claude Haiku (LLM) | 1 | Query battery generation (+ 1 optional for category inference) |
| Step 2 | Brave Search | 8–12 | One call per search query |
| Step 4 | Brave Search | 3–5 | Government/trade data targeted queries |
| Step 5 | SerpAPI (Google Trends) | 4 | Category + secondary keyword; 2 geographic queries |
| Step 6 | Brave Search | 3–4 | Segmentation queries |
| Step 7 | Brave Search | 0–2 | Additional CAGR queries only if fewer than 2 CAGR figures extracted |
| Step 8 | Claude Sonnet (LLM) | 1 | TAM/SAM/SOM synthesis |
| Step 9 | Brave Search | 0–3 | Additional geographic queries only for multi-market products |
| Step 10 | Claude Haiku (LLM) | 1 | Market drivers and trends synthesis |
| **Total** | | **21–33** | Typical full run |

**Light run (`runDepth: "light"`):**

| Step | Provider | Calls | Description |
|---|---|---|---|
| Step 1 | Template fallback | 0 | No LLM needed for light path |
| Step 2 | Brave Search | 3–5 | Reduced query battery |
| **Total** | | **3–5** | |

**Incremental run (`runDepth: "incremental"`, quarterly scheduled):**

| Step | Provider | Calls | Description |
|---|---|---|---|
| Step 1 | Claude Haiku | 1 | Delta-scoped query battery |
| Step 2 | Brave Search | 3–5 | Delta-scoped queries (new reports only) |
| Step 5 | SerpAPI (Google Trends) | 2 | Trend signal update only |
| Step 7 | In-worker | 0–2 | CAGR re-triangulation from new signals |
| **Total** | | **6–10** | |

### 10.2 Estimated Cost Range Per Run

| Run Type | Estimated Cost Range | Notes |
|---|---|---|
| Full run | $0.10–$0.18 | Typical range; higher end if additional geographic queries execute |
| Light run | $0.01–$0.02 | 3–5 Brave Search queries only |
| Incremental run (no material new data) | $0.02–$0.04 | Few new signals, minimal re-synthesis |
| Incremental run (new analyst report available) | $0.04–$0.08 | CAGR re-triangulation required |

**Per-stage cost caps applied to this module:**
- Stage 1 cap: $0.25 — light sweep at Stage 1 open fits within this cap ($0.01–$0.02)
- Stage 3 cap: $1.50 — full run at Stage 3 open fits within this cap ($0.10–$0.18); the remaining Stage 3 budget is shared with other stage-3 research modules (competitor enrichment sub-task)
- Stage 12 cap: $0.75 — incremental refresh at Stage 12 open ($0.02–$0.08) fits within this cap
- Stage 13 cap: $1.00 — pitch deck sub-task (no new research, format restructuring only) fits within $0.02

**Per-invention lifetime cost:**

| Activity | Estimated Cost |
|---|---|
| Stage 1 onOpen light sweep | $0.01–$0.02 |
| Stage 3 onOpen full run | $0.10–$0.18 |
| Stage 3 onStageComplete full re-run | $0.10–$0.18 |
| Stage 5 onOpen opportunity sizing sub-task | $0.00–$0.02 (in-worker; minimal API calls) |
| Stage 12 onOpen full incremental refresh | $0.02–$0.08 |
| Stage 13 onOpen pitch deck sub-task | $0.01–$0.02 |
| 4 quarterly scheduled incremental refreshes | $0.08–$0.24 total |
| 1–2 expected manual refreshes per journey | $0.10–$0.36 total |
| **Total for module per invention** | **$0.42–$1.10** |

This is consistent with the broader per-invention research cost envelope from Part 2 Section 10.5. Market research is less expensive per run than competitive landscape research (fewer enrichment steps, no per-competitor pricing queries) but has a higher quarterly cadence for the growth signal updates.

### 10.3 Cost Optimization Strategies

**Strategy 1 — Incremental runs for quarterly refreshes:**
Described in Section 8.3. 70–80% cost reduction vs. full re-runs for quarterly updates. Stable TAM/SAM/SOM estimates are not re-synthesized unless the context hash changes or > 180 days have elapsed.

**Strategy 2 — Skip Step 5 (Google Trends) when trend direction is already stable:**
If the prior incremental run returned `trendDirection: "stable"` and no major market news was detected in Step 2's delta queries, Step 5 is skipped for that incremental run. Trend data for established, stable categories does not change meaningfully quarter-over-quarter.

**Strategy 3 — Use Haiku for drivers synthesis (Step 10):**
The key drivers analysis is a categorization task — Haiku handles it at ~75% cost reduction vs. Sonnet, which is reserved for the analytically demanding TAM/SAM/SOM synthesis in Step 8.

**Strategy 4 — Cap government data queries at 5:**
Government data queries (Step 4) are capped at 5 queries per run. The marginal value of a 6th government query is low — if 5 targeted queries do not return relevant data, additional queries will not either.

**Strategy 5 — Suppress Stage 13 re-research:**
Stage 13's `onOpen` trigger does not execute new web research — it is a data-format sub-task only (restructuring the existing Stage 3 result into pitch deck format). This eliminates $0.10–$0.18 that would otherwise be spent re-running the full module for investor deck assembly.

---

## 11. Founder Review Requirements

### 11.1 What Requires Founder Review

Per Part 2 Section 9.2, this module generates a review request under the following conditions:

| Condition | Review Type | Blocking? |
|---|---|---|
| `effectiveConfidence < 0.60` (REQUIRES_REVIEW) | Explicit review required | Yes — market-size-dependent stage fields are not credited until confirmed |
| `runDepth: "light"` result is what the founder encounters | Required review prompt | Yes — light results cannot populate market size fields in stage-gating documents |
| TAM estimate unavailable | Required review prompt | Yes — TAM is required to complete the Market Research Summary |
| CAGR unavailable (for Stages 12 and 13) | Required review prompt at Stages 12/13 | Yes at Stage 12 and 13 — growth rate is required for funding readiness scoring |
| High-risk assumption present (assumed productCategory, assumed targetMarket) | Required review prompt | Yes — high-risk assumptions always require confirmation |
| TAM divergence > 60% between sources (unresolved) | Required review prompt | Yes — conflicting market definitions must be resolved before the figure is used |
| `inventorProvidedMarketSize` diverges from Atlas estimate by > 50% | Required review prompt | Yes — the discrepancy must be resolved before either figure is used downstream |
| `effectiveConfidence` 0.60–0.84 (REVIEW_RECOMMENDED) | Gentle review prompt | No — stage can advance but market size fields are not fully credited until confirmed |
| Quarterly refresh produces `growthRateRevised: true` | Market update notification | No — notification only; founder prompted to review the growth rate change |
| `marketMaturityStage` changed from prior result (e.g., `"growth"` → `"maturing"`) | Material change notification | No — surfaced as a monitoring feed update |

### 11.2 What Auto-Accepts

A market research result is auto-accepted when ALL of the following are true:

1. `effectiveConfidence ≥ 0.85`
2. TAM, SAM, and CAGR are all present (not null)
3. `cagrConfidence` is `"multi_source"` (at least 2 independent CAGR figures triangulated)
4. No high-risk assumptions present
5. No prior rejection of this module for this `inventionId`
6. `runDepth` is `"full"` or `"incremental"` (not `"light"`)
7. If `inventorProvidedMarketSize` is set, Atlas estimate is within 50% of the founder's figure

Auto-accepted results are marked `"auto_accepted"` in the audit trail and flow directly to the stage view and document pipeline. The founder can always edit an auto-accepted result.

### 11.3 What Gets Surfaced as REVIEW_RECOMMENDED

REVIEW_RECOMMENDED (amber indicator, gentle prompt, non-blocking) is triggered when `effectiveConfidence` is between 0.60 and 0.84. Specific prompts:

| Sub-Condition | Prompt Shown to Founder |
|---|---|
| Single-source CAGR only | "Atlas found a market growth rate from one source. This is [X]% annually, but confirm with your own research — a single source may not capture the full picture for your specific product segment." |
| Sparse consumer segmentation data | "Atlas found limited consumer segmentation data for this category. The segments shown are based on general category research. You may want to verify these apply to your specific product." |
| Result is 25–60 days old (approaching degradation) | "This market research was conducted [N] days ago. Markets evolve — confirm these figures are still current, or ask Atlas to refresh." |
| Trend data shows `"volatile"` direction | "Atlas noticed significant fluctuation in consumer interest for this category. Market momentum may be unpredictable — factor this into your business model planning." |
| Only secondary sources available (no government or analyst reports) | "Atlas researched this market using publicly available web sources. No established analyst reports were found. The estimates below are synthesized from general web data and may be less precise than industry reports." |
| Bottom-up and top-down estimates diverge by 30–60% | "Atlas's market size estimate shows a moderate discrepancy between two calculation methods ([top-down estimate] vs. [bottom-up estimate]). Review both figures and choose the one that best matches your market definition." |

### 11.4 What Blocks Stage Advancement If Not Reviewed

The following specific conditions prevent a stage from reaching "Ready to Move Forward" status:

| Stage | Blocking Condition |
|---|---|
| Stage 3 | The Market Research Summary document cannot be marked complete without a confirmed TAM estimate. If the market research result is REQUIRES_REVIEW, Stage 3's market sizing section remains in "Awaiting your review" state until the founder confirms it. |
| Stage 3 | The Market Research Summary's growth rate field cannot be populated without a confirmed CAGR. If CAGR is unavailable and the founder has not manually entered one, Stage 3's growth rate section is flagged as incomplete. |
| Stage 12 | The Funding Readiness Score market dimension cannot be computed without a confirmed market size and growth rate. If the market research confidence score is below 0.60, the market dimension of the Readiness Score is locked at its minimum value until the founder confirms or updates the market data. |
| Stage 13 | The Investor Pitch Deck market opportunity slide cannot be assembled without confirmed TAM, SAM, and CAGR. If market research is REQUIRES_REVIEW at Stage 13 entry, the market slide is flagged as "Needs review before assembly." |

**Important:** These blocks are on specific document sections or Readiness Score components, not on the entire stage. A founder can complete other sections of Stage 3 or Stage 12 and return to market research sections later. Only the field(s) that depend on confirmed market research are blocked.

---

## 12. Future Expansion

### 12.1 Phase 2 Enhancements (Q4 2026 Target)

**Real analyst report parsing:**
The current module reads only the free summary pages of market research reports (Grand View, IBISWorld, etc.) because the full reports are behind paywalls. Phase 2 should integrate with a market research report aggregator (e.g., Statista subscription API, Research and Markets API, or a curated report library) to access full report data. Full reports provide segment-level market breakdowns, 10-year CAGR forecasts, and regional detail that the free summaries lack. This would significantly increase the `sourceAuthority` score for most results and reduce the frequency of partial results due to limited data. Estimated additional cost per full run: $0.05–$0.20 depending on report query pricing model.

**Amazon market demand signals:**
Add SerpAPI Amazon search integration to extract Amazon's "Best Sellers Rank" data for the top 20 products in the relevant category. BSR data is a proxy for category demand volume — it is not a substitute for a formal market size estimate, but it provides a real-time demand signal that anchors the market estimate in actual buyer behavior, not analyst projections. This would become an additional input to Step 8's synthesis prompt and reduce the risk of over-relying on potentially outdated analyst report figures.

**Google Shopping query volume as demand proxy:**
Integrate SerpAPI Google Shopping search volume data (where available) for the primary product category keywords. Search volume is a real-time proxy for consumer demand — a category with 500K monthly Google Shopping queries is measurably larger than one with 50K queries, independent of any market report. This data would supplement the Google Trends signal from Step 5 with a more granular demand-volume estimate.

**International market report coverage:**
The current module is optimized for US market data. Phase 2 should add region-specific market report sources for the EU, UK, Canada, and Australia — the primary adjacent markets for US-launched consumer products. This requires identifying the equivalent high-authority data sources for those markets (Eurostat for EU, Statistics Canada, ONS for UK) and building geographic-scoped query variants.

### 12.2 Phase 3 Enhancements (Q1–Q2 2027 Target)

**Real-time market data feeds:**
For established consumer product categories, some data providers offer near-real-time market data feeds (e.g., Nielsen/NielsenIQ market intelligence, NPD Group data, SPINS for natural/organic products). These feeds provide monthly or quarterly category-level sales volume and revenue figures sourced directly from retailer point-of-sale data — far more accurate than analyst projections. Integration would require negotiating data licensing (these are commercial enterprise data products), but would make the TAM/SAM estimates genuinely primary-sourced with 0.90+ authority weight. This is a Phase 3 capability due to the cost and integration complexity of these data feeds.

**Custom TAM model from bottom-up with census data:**
Phase 3 should build a structured bottom-up market sizing calculator that can combine US Census population data (consumer counts by demographic segment) with average category spend per consumer from BLS Consumer Expenditure Survey data to produce a bottom-up TAM estimate that does not rely on any analyst report. For categories where Census and BLS provide enough data, this would give Atlas a primary-sourced TAM estimate for US markets regardless of whether any analyst has published a report on the category. This is a Phase 3 capability due to the data pipeline complexity.

**Longitudinal market tracking:**
Over the life of a multi-year Atlas invention journey, the quarterly incremental refreshes produce a time series of market size and CAGR estimates. Phase 3 should persist this time series as a `marketTimeSeries` table and surface it as a chart in the founder's monitoring dashboard — showing whether the market has grown, contracted, or accelerated since the founder began their journey. This turns the market research module from a point-in-time estimate into a genuine market intelligence tracking function.

**TAM/SAM model customization:**
Phase 3 should allow founders who have specific market definition preferences to configure the TAM and SAM calculation methodology. For example, an inventor who defines their SAM as "households with incomes above $100K in major urban markets" should be able to specify this constraint and have Atlas compute the SAM accordingly from demographic data. The current module uses Atlas's inferred audience as the SAM constraint — Phase 3 should allow founder override of the SAM definition with Atlas still performing the calculation.

**Competitive-market integration (cross-module synthesis):**
Phase 3 should build a cross-module synthesis step that runs after both `market_research` and `competitive_landscape` modules have completed, and produces an integrated market share analysis: given the total market size (from `market_research`) and the known competitor landscape (from `competitive_landscape`), what is the estimated current market share distribution and what share is theoretically available to a new entrant? This would produce a `MarketShareModel` that appears in the Market Research Summary as a new section and directly feeds the competitive market share analysis in Stage 3.

### 12.3 Data Sources to Add

The following data sources are identified as high-value additions for this module, pending provider availability and commercial terms:

| Data Source | Provider ID | What It Adds | Priority |
|---|---|---|---|
| Statista Premium API | `statista_premium_api` | Full market reports with segment-level and 5-year forecast data | High |
| NielsenIQ Market Intelligence | `nielseniq_api` | Real-time retail sales volume and category spend data | High (Phase 3) |
| NPD Group Data | `npd_group_api` | Consumer electronics, home goods, and apparel category sales data | High (Phase 3) |
| Research and Markets API | `research_and_markets_api` | Broad analyst report library with structured data access | Medium |
| US Census Consumer Expenditure Survey | `bls_cex_api` | Bottom-up category spend data from primary government source | Medium |
| Eurostat API | `eurostat_api` | EU market statistics for pan-European market sizing | Medium |
| SPINS Natural Products Data | `spins_api` | Natural/organic/specialty food and personal care category data | Low (category-specific) |
| Amazon Best Sellers API (via SerpAPI) | `serpapi_amazon_bsr` | Real-time demand proxy from Amazon category rankings | Medium |

### 12.4 Capabilities Not Yet Built

The following capabilities are architecturally defined in this specification but not yet implemented:

1. **Bottom-up cross-check computation (Step 8):** The prompt instructs Claude Sonnet to perform a bottom-up cross-check where segment count and average spend data are available. The segment count and average spend inputs are drawn from Steps 3 and 6. The in-worker validation that checks whether `bottomUpCrossCheck.available` is true and conditionally includes this computation path must be implemented explicitly.

2. **Stage 5 opportunity sizing sub-task:** The Stage 5 `onOpen` trigger executes a SAM/SOM sub-task that recalculates the addressable opportunity with confirmed price point and channel inputs. This sub-task is a distinct code path from the full run — it re-runs Steps 8 and 11 only (with the full prior-run data as context plus the new price/channel constraints) without re-executing the web search steps.

3. **`inventorProvidedMarketSize` cross-validation:** The input field `inventorProvidedMarketSize` is specified as a cross-validation reference point in Step 8's prompt. The post-synthesis comparison logic (detecting divergence > 50% and setting the REQUIRES_REVIEW trigger) must be implemented as a deterministic post-Step-8 validation pass, not left to the LLM to detect.

4. **Quarterly scheduled research enrollment:** The `scheduledResearch` hook for this module should enroll automatically at Stage 3 completion (the same way `competitive_landscape` enrolls at Stage 1 completion). The enrollment — creating a `scheduledJob` entry for `market_research` with a 90-day interval — must be implemented in the Stage 3 `onStageComplete` handler in the Journey Engine, not in the research module worker.

5. **Pitch deck market data sub-task (Stage 13):** Stage 13's `onOpen` trigger is defined as a data-format sub-task only — no new research, just restructuring the existing Stage 3 result into pitch deck format. This sub-task must be implemented as a distinct operation from the research module worker: it reads from `researchResults` but does not execute any API calls or write a new research result version. It writes directly to the `pitchDeckDraftData` table.

6. **`MarketDataChangeEvent` detection in incremental runs:** The incremental run's merge step (where new market data is compared to the baseline) must detect material changes and set `growthRateRevised: true` and `tamRevised: true` flags. The materiality threshold for growth rate revision is a 2-percentage-point change in CAGR. For TAM revision, it is a 20% change in the estimate. These thresholds must be implemented as configurable constants, not hardcoded values.

---

## Appendix — Provider Summary for This Module

| Step | Category | Primary Provider | Fallback 1 | Fallback 2 |
|---|---|---|---|---|
| Step 1 — Query construction | LLM | `anthropic_claude_haiku` | Template fallback (no LLM) | — |
| Step 2 — Web search (general) | Web Search | `brave_search` | `serpapi_google` | `bing_search` |
| Step 4 — Government/trade data queries | Web Search | `brave_search` (site-targeted) | `serpapi_google` (site-targeted) | Skip (no government data) |
| Step 5 — Trend and seasonality signals | Market Data | `google_trends` (via SerpAPI) | Skip (optional step) | — |
| Step 6 — Segmentation queries | Web Search | `brave_search` | `serpapi_google` | — |
| Step 7 — CAGR triangulation (additional) | Web Search | `brave_search` | `serpapi_google` | — |
| Step 8 — TAM/SAM/SOM synthesis | LLM | `anthropic_claude_sonnet` | `openai_gpt4o_mini` | — |
| Step 9 — Geographic additional queries | Web Search | `brave_search` | `serpapi_google` | — |
| Step 10 — Market drivers synthesis | LLM | `anthropic_claude_haiku` | `openai_gpt4o_mini` | — |

---

## Appendix — Stage Hook Map for This Module

| Hook | Stage | Action |
|---|---|---|
| `onOpen` | 1 | Enqueue light sweep at Priority 4 (if product category available from onboarding) |
| `onOpen` | 3 | Enqueue full detailed run at Priority 3 |
| `onStageComplete` | 3 | Enqueue full re-run at Priority 3 (with confirmed Stage 3 inputs) |
| `onOpen` | 5 | Enqueue opportunity sizing sub-task at Priority 3 |
| `onOpen` | 12 | Enqueue full incremental refresh at Priority 2 (funding context — elevated priority) |
| `onOpen` | 13 | Enqueue pitch deck sub-task at Priority 3 |
| `onStageEnter` | 3, 12, 13 | Execute freshness and context-delta check; conditionally enqueue refresh at Priority 2 |
| `scheduledResearch` | 3 (enrolled at Stage 3 completion) | Enqueue incremental refresh at Priority 4, quarterly interval (90 days) |
| `manualRefresh` | Any stage where result is surfaced | Enqueue full re-run at Priority 1 |

---

*End of ATLAS_RESEARCH_ENGINE_ARCHITECTURE_MODULE_02_MARKET.md*
*Version 1.0 — July 2026*
*Architecture specification only. No implementation. No code changes. No existing files modified.*
*Source: ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_MODULE_01_COMPETITOR.md · STAGE_BLUEPRINTS/STAGE_03_MARKET_RESEARCH.md · STAGE_BLUEPRINTS/STAGE_13_INVESTOR_DECK.md*
