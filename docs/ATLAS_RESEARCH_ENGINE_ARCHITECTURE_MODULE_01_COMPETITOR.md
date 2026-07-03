# ATLAS RESEARCH ENGINE ARCHITECTURE
## Section 11, Module 1: Competitor Research

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Specification — Not Yet Implemented**
**Module ID:** `competitive_landscape`
**Source Documents:**
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md`
- `docs/STAGE_BLUEPRINTS/STAGE_01_IDEA.md`
- `docs/STAGE_BLUEPRINTS/STAGE_03_MARKET_RESEARCH.md`

---

## Document Purpose

This document specifies the complete architecture for **Research Module 1: Competitor Research** (`competitive_landscape`). It is Section 11, Module 1 of the Atlas Research Engine Architecture series.

This specification covers every aspect of how this module operates: when it fires, what inputs it requires, what research it executes, which providers it uses, what outputs it produces, how confidence is scored, how results are cached and refreshed, how errors are handled, how cost is managed, and what the founder review requirements are.

This document is an architecture specification only. It defines what must be built. No existing files are modified by this document.

All references to "Part 1" refer to `ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md`. All references to "Part 2" refer to `ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md`.

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

The Competitor Research module (`competitive_landscape`) is responsible for discovering, structuring, and continuously refreshing the set of competing products and companies that exist in the same market space as an inventor's invention.

This module executes targeted web search and structured data synthesis to produce a living competitor list: who the competitors are, what their products do, what they charge, how they reach customers, how they are positioned, and what the overall competitive structure of the market implies for the inventor's opportunity.

The module does not conduct a one-time search. It is a continuous intelligence function that first runs with minimal context (light sweep at Stage 1 open) and deepens progressively as the inventor's context sharpens (detailed search after Stage 1 completion), and then refreshes on a monthly cadence for the duration of the inventor's journey.

### 1.2 Why It Matters to an Inventor

Every inventor begins their journey with some awareness of competing solutions — but that awareness is almost always incomplete, informal, and biased toward the products they happen to know. Atlas has a constitutional obligation (Principle 4 of the Automation Constitution) to conduct this research before asking the inventor to supply it.

For an inventor, competitive landscape research matters for seven specific downstream reasons:

1. **Differentiation clarity:** You cannot articulate what makes your invention different until you understand what you are being different from. Stage 1's Idea Brief requires a differentiation statement — this module provides the factual foundation for that statement.

2. **Patent strategy input:** The competitive landscape seeds the prior art search in Stage 4. Knowing who the competitors are and what their products do helps formulate better patent search queries and identifies which competitor's filings are most relevant.

3. **Market sizing anchor:** Stage 3's competitive market share analysis depends on a known competitor list. The size of known players, combined with market size data, produces the share distribution model.

4. **Pricing context:** Stage 10 cannot set a price in a vacuum. Competitor pricing data is the primary reference point for price positioning decisions. This module captures that data as part of the competitive profile.

5. **Investor pitch credibility:** Investors in Stage 13 will ask "who else is doing this?" A well-researched competitive landscape with clear differentiation and honest assessment of competitive threats is evidence of founder sophistication.

6. **Channel and GTM strategy:** Knowing where competitors sell (DTC, Amazon, retail, B2B, subscription) informs Stage 11 channel selection. If every competitor is on Amazon and the margins still work, that is a signal. If every competitor avoids Amazon, that is also a signal.

7. **Ongoing intelligence:** After launch (Stage 14+), new competitors enter markets, incumbents change prices, and pivots happen. The monthly refresh of this module means the founder is notified when the competitive landscape changes materially — before those changes affect their business.

### 1.3 Stages Served

The Competitor Research module serves the following stages by stage ID:

| Stage ID | Stage Name | How the Module Serves This Stage |
|---|---|---|
| 1 | Idea Capture | Provides the initial competitive context that grounds the differentiation statement in the Idea Brief |
| 2 | Validation | Supplies competitive product sentiment signals (review data, user feedback patterns) that inform whether the problem is adequately solved by existing products |
| 3 | Market Research | Delivers the competitor list with market share proxies used in the competitive market share analysis and the Market Research Summary |
| 10 | Pricing | Provides current competitor pricing data across channels as the primary pricing reference for Stage 10 decisions |
| 11 | Marketing | Supplies competitor channel presence and marketing positioning data that inform channel selection and messaging differentiation |
| 15 | Growth (post-launch) | Powers the ongoing competitive intelligence feed that alerts the founder to new entrants, price changes, and product pivots |

### 1.4 Atlas Decisions Informed

The Competitor Research module directly informs the following Atlas-generated outputs and recommendations:

- **Idea Brief differentiation statement** — Atlas identifies the closest competing products and uses them to draft a factual differentiation statement for founder review
- **Stage 2 Validation guidance** — When researching community sentiment for the problem, Atlas cross-references the competitor list to evaluate whether existing products are adequately solving the problem (informing the validated problem signal)
- **Market Research Summary competitive section** — The competitor list, estimated share proxies, and positioning analysis become the Competitive Market Structure section of the Market Research Summary
- **Competitive Pricing Context table** — The pricing data collected by this module populates the pricing reference table used in Stage 10 pricing strategy decisions
- **Pitch Deck competitive slide** — The competitive landscape output maps directly to the competitive landscape slide in the investor pitch deck (Stage 13)
- **Go-to-market positioning recommendations** — The gap analysis within the competitive landscape (where no competitor competes at all) informs Atlas's positioning recommendations in Stage 11
- **Risk Tracker entry for major new competitors** — When the monthly refresh detects a net-new competitor with significant market presence (estimated revenue > $1M or venture-backed), the risk tracker is updated with a "New competitive threat" entry

---

## 2. Trigger Conditions

### 2.1 Stage Lifecycle Hooks That Fire This Module

The Competitor Research module fires at the following lifecycle hooks, as defined in Part 1, Section 4:

| Hook | Stage ID | Trigger Description | Research Depth |
|---|---|---|---|
| `onOpen` | 1 | Stage 1 is first unlocked; product description available from onboarding | Light sweep only |
| `onStageComplete` | 1 | Inventor completes Stage 1; full Idea Brief is finalized | Full detailed research |
| `onOpen` | 2 | Stage 2 is unlocked | Competitive product sentiment (supplemental sub-task) |
| `onOpen` | 3 | Stage 3 is unlocked | Market share proxy enrichment (supplemental sub-task) |
| `onOpen` | 10 | Stage 10 is unlocked | Competitor pricing refresh (sub-task) |
| `onOpen` | 11 | Stage 11 is unlocked | Competitor channel and positioning enrichment (sub-task) |
| `onStageEnter` | 1, 3, 10, 11 | Freshness and context-delta check on every visit | Conditional refresh only |
| `scheduledResearch` | 1 | Monthly cadence beginning 30 days after Stage 1 completion | Full incremental refresh |
| `manualRefresh` | Any | Founder explicitly requests refresh | Full re-run |

**Depth definitions:**

- **Light sweep:** 3–5 web search queries, no LLM synthesis, no enrichment. Returns a preliminary competitor list as a seed for the detailed run.
- **Full detailed research:** Full query battery (described in Section 4), LLM synthesis, pricing enrichment, channel identification, and confidence scoring.
- **Supplemental sub-task:** A targeted addition to the existing result — not a full re-run. Examples: appending sentiment data for known competitors (Stage 2 onOpen), refreshing prices for known competitors (Stage 10 onOpen).
- **Full incremental refresh:** Queries scoped to new discoveries since the last run cursor (new competitors only), then merged with the existing list.

### 2.2 Specific Field Changes That Trigger a Re-Run

Beyond lifecycle hooks, a context-delta check at `onStageEnter` triggers a re-run of this module when any of the following `stageProgress` fields have changed materially since the last research run:

| Field Changed | Stage | Re-Run Scope |
|---|---|---|
| `productDescription` | 1 | Full detailed re-run — product description is the primary query seed |
| `productCategory` | 1 | Full detailed re-run — category change alters the entire competitor search space |
| `targetMarket` | 1 | Full detailed re-run — market change may surface entirely different competitors |
| `targetAudience` | 2 | Supplemental sentiment sub-task re-run |
| `channelPreference` | 3, 10 | Supplemental pricing/channel enrichment re-run |
| `geographicMarket` | 1 | Full detailed re-run — geography change fundamentally alters competitor scope |

**Materiality threshold for `productDescription` changes:** The context hash (see Section 8.1) is computed from a normalized, keyword-extracted representation of the product description. Surface changes (typo fixes, formatting adjustments) do not invalidate the hash. A change is material if the keyword extraction produces a different keyword set — i.e., the inventor added, removed, or substantially modified the core product mechanism, product category, or target use case.

### 2.3 Cooldown and Deduplication Rules

The following cooldown rules apply to this module specifically, layered on top of the general deduplication rules in Part 1, Section 5.8:

| Trigger Source | Cooldown Window | Rule |
|---|---|---|
| `manualRefresh` | 60 minutes | No more than one manual refresh per invention per 60 minutes for this module |
| `onStageEnter` freshness check | 24 hours | If a run completed within the past 24 hours and the context hash is unchanged, no re-run is triggered by `onStageEnter` |
| `scheduledResearch` | 25 days (soft) | The scheduled job interval is 30 days; the 25-day soft floor prevents early triggers from stacking up |
| `onStageComplete` → detailed run | 48 hours (guard) | If a detailed run was already triggered by `onStageComplete` for Stage 1 within the past 48 hours, a subsequent `onOpen` for Stage 2 does not re-run the full module (only the supplemental sentiment sub-task) |

**Queue-level deduplication:** If a job for `competitive_landscape` is already in `"pending"` or `"in_progress"` status for the same `inventionId`, any new trigger is suppressed at the queue level and returns the existing job ID. This is the general mechanism from Part 1, Section 5.8 applied to this module.

### 2.4 Manual Refresh Eligibility

The Competitor Research module is eligible for manual refresh at any stage where the result is surfaced in the founder's stage view. This includes Stages 1, 2, 3, 10, and 11 actively, and all stages in the post-launch monitoring context (Stage 15 and ongoing).

Manual refresh is available to the founder at all times, subject to the 60-minute cooldown rule. No additional restrictions apply.

When the founder requests a manual refresh, the full detailed research logic (Section 4) is executed — not the light sweep or incremental sub-task paths.

---

## 3. Input Schema

### 3.1 Required Inputs

These inputs must be present before the module's full detailed research logic can execute. The light sweep path (Stage 1 `onOpen` before Idea Brief completion) can run with a subset of required inputs — see Section 3.4 for degraded-input behavior.

| Field | Type | Source | Description |
|---|---|---|---|
| `inventionId` | `Id<"inventions">` | System | The Convex document ID of the invention record |
| `stageId` | `number` | System | The stage ID triggering this research job (used for result routing and cost accounting) |
| `productDescription` | `string` | Stage 1 `stageProgress` | The inventor's narrative description of the product, as captured and confirmed in the Idea Brief. Minimum 20 characters. Used as the primary seed for all search queries. |
| `productCategory` | `string` | Atlas-inferred from Stage 1 | The SIC/NAICS-aligned category label inferred by Atlas from the product description. Examples: `"consumer_packaged_goods"`, `"kitchen_appliances"`, `"personal_care"`, `"pet_products"`. Required for targeting market-specific search queries. |

### 3.2 Optional Inputs

These inputs are used when available to improve result quality and precision. Their absence does not prevent execution — it reduces confidence scores and search precision.

| Field | Type | Source | Description |
|---|---|---|---|
| `targetMarket` | `string` | Stage 1 `stageProgress` | Geographic target market (e.g., `"US"`, `"North America"`, `"global"`). Defaults to `"US"` if not supplied. |
| `targetAudience` | `string` | Stage 1 or Stage 2 `stageProgress` | Plain-language description of the intended buyer (e.g., `"home cooks aged 28–45 who care about kitchen aesthetics"`). Used to refine search queries toward products sold to this audience. |
| `noveltyStatement` | `string` | Stage 1 `stageProgress` | The inventor's stated differentiator — what they believe is unique. Used to construct queries that specifically look for competitors with similar claimed differentiation, testing whether the differentiator is genuinely novel. |
| `knownCompetitors` | `string[]` | Stage 1 `stageProgress`, inventor-supplied | List of competitor names or product names the inventor is already aware of. These are added to the competitor list directly as seeds, and Atlas confirms/enriches them rather than discovering them from scratch. |
| `channelPreference` | `string[]` | Stage 1 or Stage 3 `stageProgress` | Channels the inventor is targeting (e.g., `["DTC", "Amazon", "specialty_retail"]`). Used to filter competitor research toward the channels where head-to-head competition will occur. |
| `pricePointIntent` | `string` | Atlas-inferred or founder-supplied | Pricing tier the inventor intends to occupy: `"value"`, `"mid_market"`, `"premium"`, `"ultra_premium"`. Used to weight competitor price searches toward the relevant tier. |
| `geographicMarket` | `string` | Stage 1 `stageProgress` | If different from `targetMarket`, the geographic scope of the competitive landscape search. Defaults to `targetMarket`. Supports `"US"`, `"North America"`, `"Europe"`, `"global"`. |
| `runDepth` | `string` | Queue entry (dispatcher-set) | `"light"` (Stage 1 onOpen early run), `"full"` (standard), or `"incremental"` (scheduled refresh). Defaults to `"full"`. Controls which steps in Section 4 are executed. |
| `lastRunCursor` | `string | null` | Prior `researchResults` record | ISO 8601 date string indicating the end date of the previous run. Used by incremental refresh to scope delta queries. Null for first run. |
| `existingCompetitorList` | `CompetitorRecord[]` | Prior `researchResults` record | The competitor list from the most recent completed run. Used by incremental refresh for deduplication and merge. Null for first run. |
| `founderRejectionContext` | `string | null` | `ResearchAuditEvent` | If the founder previously rejected a result and provided context ("the competitors you found aren't the right segment"), this string is appended to query construction to bias the next run toward the correct segment. |

### 3.3 Input Validation Rules

Before the research job executes, the worker validates the input payload:

1. `inventionId` must be a valid Convex document ID. If invalid, the job fails immediately with `"invalid_input"` — no retry.
2. `productDescription` must be present and at least 20 characters. If missing, the job falls back to `runDepth: "light"` using only the `productCategory` (if available). If neither is present, the job is held in queue with status `"awaiting_input"` until the field is populated.
3. `productCategory` must be one of the recognized category values. If the dispatcher cannot infer a category from the product description, the module runs with a generic category label (`"physical_consumer_product"`) and reduces the expected confidence score by 0.10 (category-generalization penalty applied to `coverageCompleteness` component).
4. `lastRunCursor` must be a valid ISO 8601 date string if `runDepth` is `"incremental"`. If the cursor is malformed, the worker falls back to `runDepth: "full"` and logs the fallback reason.
5. `knownCompetitors`, if supplied, must be a string array with no more than 20 entries. If the array exceeds 20 entries, the first 20 are used and the remainder are logged as dropped inputs.

### 3.4 What Happens When Required Inputs Are Missing

| Missing Input | Behavior |
|---|---|
| `productDescription` missing AND `productCategory` missing | Job status set to `"awaiting_input"`. The queue entry persists. When either field is populated in `stageProgress`, the dispatcher re-evaluates and dispatches. No error is surfaced to the founder. |
| `productDescription` missing but `productCategory` present | `runDepth` forced to `"light"`. Only category-level queries are executed (Steps 1 and 2 of Section 4). Result confidence will be low (REQUIRES_REVIEW). UI surfaces: "Atlas searched for competitors in your product category. Add a product description for a more targeted search." |
| `productCategory` missing but `productDescription` present | Atlas infers category from product description using an LLM classification step (one Haiku call, ~200 tokens) before proceeding with full research. Category inference is recorded as an assumption in the result's `AssumptionRecord[]`. |
| `targetMarket` missing | Defaults to `"US"`. Recorded as an assumption: "Atlas assumed your primary market is the United States." |
| `inventionId` invalid | Job fails immediately, no retry. Error logged. No founder notification — this indicates a dispatcher bug, not a founder-facing condition. |

---

## 4. Research Logic (Step-by-Step)

### 4.1 Overview

The Competitor Research module executes in three paths depending on `runDepth`:

- **Light path** (`runDepth: "light"`): Steps 1 and 2 only. Produces a preliminary competitor list seed.
- **Full path** (`runDepth: "full"`): Steps 1 through 10. Produces the complete structured competitive landscape result.
- **Incremental path** (`runDepth: "incremental"`): Steps 1, 2 (scoped to delta queries only), 3 (for new competitors only), 8, 9 (merge), and 10 (re-score full merged list). Does not re-query already-known competitors.

All paths are executed by a Convex Action with `"use node"` directive in `convex/research/competitiveLandscape.ts` (new file).

---

### Step 1 — Query Construction (All Paths)

**What happens:** The worker constructs the search query battery from the input payload. This step uses an LLM call (Claude Haiku) to transform the structured input fields into effective natural language search queries.

**Provider used:** `anthropic_claude_haiku` (LLM — Category 5 from Part 2 Section 7.3)

**LLM prompt strategy:**

The worker calls Claude Haiku with the following structured prompt:

```
System: You are a competitive research query generator. Your task is to generate a set of targeted web search queries that will find direct and indirect competitors for a product invention. Generate queries that will surface:
1. Direct competitors (same product category, same problem solved)
2. Indirect competitors (different mechanism, same problem solved)
3. The category's major brands and market leaders
4. Relevant Amazon/retail product searches
5. Recent market entrants (use "2024 OR 2025 OR 2026" in at least one query)

Output ONLY a JSON array of strings. No commentary. No explanation. Each string is one search query.
Max 10 queries total. Each query must be under 80 characters.

Product description: {productDescription}
Product category: {productCategory}
Target market: {targetMarket}
Target audience: {targetAudience | "not specified"}
Known competitors to exclude from discovery queries (already known): {knownCompetitors | "none"}
Founder rejection context (adjust queries accordingly): {founderRejectionContext | "none"}
```

**Output:** An array of 6–10 search query strings. Stored internally as `queryBattery: string[]`.

**Fallback if LLM call fails:** The worker constructs a fallback query battery using template interpolation — no LLM required. Templates:
- `"{productCategory} products {targetMarket}"`
- `"best {productDescription keywords} alternatives"`
- `"top brands {productCategory} {targetMarket} 2025"`
- `"buy {productCategory} online {targetMarket}"`
- `"{productDescription keywords} competitors review"`

The fallback battery uses 5 queries instead of 6–10 and is annotated as `"template_fallback"` in the job log. Confidence for the `sourceCount` component will be penalized slightly (up to -0.10) if the query count is below 6.

**Cost estimate for Step 1:** 1 Haiku call, approximately 400 input tokens + 200 output tokens = ~$0.0003.

---

### Step 2 — Web Search Execution (All Paths; Delta-Scoped for Incremental)

**What happens:** The worker executes each query in the battery against the web search provider. Results are collected and normalized.

**Provider used (primary):** `brave_search` (Web Search — Category 1 from Part 2 Section 7.3)

**Fallback chain:** `brave_search` → `serpapi_google` → `bing_search`

**Fallback trigger conditions:** As defined in Part 2 Section 7.6 — provider failure, rate limit exhaustion, or timeout.

**Execution parameters per query:**
- `maxResults: 10` (10 results per query × 6–10 queries = 60–100 raw results before deduplication)
- `filters.contentType: ["web", "product", "news"]` — exclude academic and forum content at this step
- `filters.geography: targetMarket` — where the provider supports geographic filtering
- `timeoutMs: 8000` per query (8-second timeout; query is retried once on timeout before falling back to next provider)

**Incremental path delta scoping:** For `runDepth: "incremental"`, a date filter is appended to each query where the provider supports it: `after:{lastRunCursor}`. For Brave Search, this is the `freshness` parameter. For SerpAPI Google, this is the `tbs=qdr:` parameter. This ensures only content published since the last run cursor is returned, reducing both cost and result processing volume.

**Result normalization:** Each `SearchResult` from the provider is normalized into a `RawCompetitorSignal`:

```
RawCompetitorSignal {
  url: string                    // Source URL
  title: string                  // Page title
  snippet: string                // Search snippet
  domain: string                 // Root domain (used for competitor deduplication)
  contentType: string            // "product" | "news" | "brand_website" | "marketplace" | "review" | "web"
  relevanceScore: number         // Provider's relevance score (0.0–1.0)
  sourceType: SourceType         // Mapped to Part 2 Section 8.4 classification
  publishedDate: string | null
  queryOrigin: string            // Which query string produced this result
}
```

**Cost estimate for Step 2:**
- Brave Search: $0.003–$0.005 per query (paid plan) × 6–10 queries = $0.018–$0.05 per full run
- Incremental run with date scoping: $0.010–$0.025 per run (fewer queries return results)

---

### Step 3 — Competitor Identification and Initial Deduplication (Full Path Only)

**What happens:** The worker processes the raw result set to identify which results represent distinct competing products or companies, and deduplicates across the query battery.

**No external provider.** This is a deterministic processing step executed in-worker.

**Deduplication logic:**

1. **Domain-level grouping:** All `RawCompetitorSignal` entries with the same root domain are grouped together as potentially representing the same company. This prevents counting BrandX.com and a BrandX Amazon listing as two separate competitors.

2. **Known competitor cross-reference:** Entries whose domain or title matches any entry in `knownCompetitors` (input field) are flagged as `"known_confirmed"` and elevated to the candidate list directly.

3. **Brand-vs-retailer classification:** Results from marketplace domains (amazon.com, target.com, walmart.com, costco.com, etc.) are classified as `"marketplace_listing"` rather than `"brand_website"`. The brand name is extracted from the product title and used as the competitive entity, not the marketplace domain. This prevents Amazon from appearing as a competitor in every run.

4. **Relevance threshold filtering:** `RawCompetitorSignal` entries with `relevanceScore < 0.35` are discarded at this step. Very low-relevance results are noise, not signal.

5. **Candidate extraction:** For each surviving group, the worker extracts a `CompetitorCandidate`:

```
CompetitorCandidate {
  candidateId: string            // UUID assigned at extraction
  brandName: string              // Extracted or inferred brand/company name
  productName: string | null     // Specific product name if identifiable
  primaryDomain: string          // Brand's primary domain (or marketplace product URL)
  evidenceSources: RawCompetitorSignal[]  // All raw signals that contributed to this candidate
  isKnownCompetitor: boolean     // Whether the inventor named this in knownCompetitors
  highestRelevanceScore: number  // Highest relevance score among evidence sources
}
```

**Minimum candidate threshold:** If fewer than 2 competitors are identified after filtering, the worker triggers one additional broad-category fallback query: `"top {productCategory} brands {targetMarket}"` and re-runs Steps 2 and 3 with the fallback query result appended. This fallback is logged and does not count against the rate limit tracking for the standard query battery.

**Cost estimate for Step 3:** No API calls. In-worker processing only.

---

### Step 4 — Competitor Website and Listing Enrichment (Full Path Only)

**What happens:** For each `CompetitorCandidate`, the worker fetches the competitor's brand website (or primary product page) to extract pricing, product features, and positioning information. This step supplements the snippet-level data from Step 2 with deeper product-level detail.

**Provider used (primary):** `serpapi_shopping_prices` for marketplace listings; `brave_search` for brand website fetches via search (NOT direct HTTP fetches — Atlas does not directly crawl competitor websites; it uses search results that include the relevant page content).

**What is extracted per competitor:**

For each `CompetitorCandidate`, the worker constructs a targeted search query to retrieve the competitor's pricing and product detail page:

- Query template: `"{brandName} {productName} price buy"`
- `maxResults: 5` per competitor
- `filters.site: {primaryDomain}` where site filtering is supported (limits results to the competitor's own domain)

Results are parsed for:
- **Price:** Extracted from shopping results, product page snippets, or structured data in search results. Multiple prices captured if different variants or channels show different pricing.
- **Channel presence:** Which channels the competitor sells through (inferred from which marketplace domains return results for the competitor's products)
- **Product positioning signals:** Keywords from the product title, product page snippets, and ad copy that signal the brand's positioning (premium, value, eco-friendly, clinical, etc.)

**Rate of enrichment:** The enrichment query is executed for the top 10 `CompetitorCandidate` entries ranked by `highestRelevanceScore`. Candidates ranked 11+ receive no enrichment in the standard run (they appear in the output with `enriched: false`). This bound controls cost at this step.

**Price extraction normalization:** Extracted prices are normalized to a `PriceRecord`:

```
PriceRecord {
  amount: number                 // Price in cents (e.g., 2999 = $29.99)
  currency: string               // ISO 4217 (default "USD")
  channel: string                // "brand_website" | "amazon" | "target" | "walmart" | "wholesale" | "subscription" | "unknown"
  isOnSale: boolean
  originalAmount: number | null  // If on sale; the pre-sale price
  capturedAt: string             // ISO 8601 timestamp
  sourceUrl: string              // URL where the price was found
}
```

**Cost estimate for Step 4:**
- Brave Search: $0.003–$0.005 per query × up to 10 competitor enrichment queries = $0.03–$0.05
- SerpAPI Shopping: $0.01 per query × up to 10 = $0.10

---

### Step 5 — LLM Synthesis — Competitor Profile Generation (Full Path Only)

**What happens:** The worker passes the enriched `CompetitorCandidate` list and all associated evidence to Claude Sonnet for structured synthesis into competitor profiles. The LLM's task is to normalize, interpret, and structure the raw research signals into a coherent per-competitor profile.

**Provider used:** `anthropic_claude_sonnet` (primary); `openai_gpt4o_mini` (fallback if Anthropic unavailable)

**What the LLM synthesizes:**

The worker constructs a synthesis prompt structured as follows:

```
System: You are a competitive intelligence analyst for Atlas, an AI platform for inventors. 
Your task is to synthesize raw web search results into structured competitor profiles.
Be precise. Be conservative — only claim what the evidence supports.
If evidence is insufficient to fill a field, mark it null.
Output ONLY valid JSON matching the provided schema. No commentary.

Schema: {CompetitorProfile JSON Schema — see Section 5 for field definitions}

Temperature: 0.1 (near-deterministic for synthesis accuracy)
MaxOutputTokens: 2000 (sufficient for 10 competitor profiles × ~200 tokens each)
```

User message includes:
- The product description and category (for context — so the LLM can evaluate competitive relevance)
- The full `CompetitorCandidate` list with enrichment data
- The target market and target audience
- Any `founderRejectionContext` (so the LLM adjusts which competitors are treated as relevant)

**What the LLM produces:**

For each competitor in the input, the LLM outputs a `CompetitorProfile` (see Section 5.2 for the full schema). Key synthesis tasks the LLM performs:

- **Positioning statement synthesis:** Generates a 1–2 sentence description of how the competitor positions themselves, inferred from their product copy, marketing language, and channel presence
- **Competitive threat level assessment:** Classifies each competitor as `"direct"` (same problem, similar mechanism), `"indirect"` (same problem, different mechanism), or `"adjacent"` (different problem, same audience or channel)
- **Differentiation gap identification:** For the top 5 most relevant competitors, identifies one gap between what the competitor offers and what the inventor's description suggests the invention offers — as a starting point for differentiation language
- **Strengths and weaknesses:** 1–3 bullet points each, strictly grounded in evidence from the search results (the LLM is instructed not to fabricate strengths or weaknesses not supported by the evidence)

**LLM instruction constraints (anti-hallucination):**

The prompt explicitly instructs the LLM:
- Never invent a price not found in the evidence
- Never claim a competitor has a feature not mentioned in their product page or description
- If evidence for a field is absent, output `null` — do not fabricate
- Mark all assumptions explicitly in an `"assumptions"` array within the profile
- Do not include the product being invented as a competitor

**Cost estimate for Step 5:**
- Claude Sonnet: ~2,500 input tokens + ~2,000 output tokens per run = approximately $0.013 per run

---

### Step 6 — Competitive Structure Analysis (Full Path Only)

**What happens:** The worker executes a second, smaller LLM synthesis pass to assess the overall competitive market structure — beyond the individual competitor profiles. This is the "forest vs. trees" analysis: what does the collective landscape mean for the inventor?

**Provider used:** `anthropic_claude_haiku` (this is a lightweight analysis task — Haiku is sufficient and significantly cheaper than Sonnet)

**Fallback:** `openai_gpt4o_mini`

**LLM prompt strategy:**

```
System: You are a market structure analyst. Given a list of competitors in a product category,
analyze the overall competitive structure and what it implies for a new market entrant.
Be concise. Output ONLY valid JSON matching the provided schema.
Temperature: 0.2

Schema: {CompetitiveStructureAnalysis JSON Schema — see Section 5.3}
```

User message includes:
- The full synthesized `CompetitorProfile[]` list from Step 5
- The product category and target market
- The inventor's stated price point intent (if available)

**What the LLM produces:**

A `CompetitiveStructureAnalysis` object covering:
- **Market concentration:** Fragmented (many small players), oligopoly (3–5 dominant players), or monopoly-adjacent (one clear dominant player)
- **Price clustering:** The dominant price tier(s) where competitors cluster, and whether there is whitespace above or below
- **Channel concentration:** Which channels are over-served vs. under-served among current competitors
- **Positioning whitespace:** Where no current competitor is positioned (if anywhere) — the combination of price tier + positioning that is unoccupied
- **Competitive intensity label:** `"low"` (few competitors, fragmented, easy to differentiate), `"moderate"`, or `"high"` (crowded, well-funded incumbents, hard to differentiate)
- **New entrant implications:** One paragraph assessing how easy or hard it is for a new product to gain share in this market, and what the primary competitive risks are

**Cost estimate for Step 6:**
- Claude Haiku: ~1,500 input tokens + ~500 output tokens = approximately $0.0004 per run

---

### Step 7 — Search Volume and Trend Signal (Full Path Only; Optional)

**What happens:** The worker queries Google Trends data for the primary product category keywords and the top 3 competitor brand names to establish whether the market is growing, stable, or declining, and how much organic search volume exists for the space.

This step is **optional** — it runs if the Stage 10 per-stage cost cap is not yet approaching exhaustion and if `productCategory` has been resolved to a specific enough category for meaningful trend data.

**Provider used:** `google_trends` (via SerpAPI; Market Data — Category 3 from Part 2 Section 7.3)

**Fallback:** If `google_trends` via SerpAPI is rate-limited or unavailable, this step is skipped entirely (marked as `trendDataUnavailable: true` in the output). Trend data is supplemental — its absence does not block result completion.

**What is queried:**
- The primary product category keyword (e.g., `"glass food storage containers"`)
- The top 2 competitor brand names (only the top 2 — to manage cost)
- Relative interest over the past 5 years
- Current trend direction: `"rising"`, `"stable"`, `"declining"`, `"breakout"`

**How trend data is used:** Trend data is incorporated into the `CompetitiveStructureAnalysis.marketMomentum` field and surfaces in the UI as a supporting data point for the competitive landscape summary. It is not a confidence-gating input — low confidence in trend data does not independently reduce the module's overall confidence score.

**Cost estimate for Step 7:**
- SerpAPI Google Trends: $0.01–$0.02 per query × 3 queries = $0.03–$0.06

---

### Step 8 — Deduplication of Full Competitor List (All Paths)

**What happens:** Before writing results, the worker deduplicates the final competitor list to ensure no competitor appears twice (e.g., discovered through two different search queries and not caught by Step 3's domain-level grouping).

**No external provider.** In-worker processing only.

**Deduplication rules:**

1. **Exact domain match:** Two profiles with the same `primaryDomain` are merged (higher-confidence profile wins; the other's evidence sources are appended to the winner's `evidenceSources`).

2. **Brand name similarity match:** Two profiles where one brand name is a substring of the other, or where the Levenshtein distance between brand names is ≤ 2, are flagged for merge review. The LLM synthesis step (Step 5) is designed to catch these — but in-worker string matching provides a deterministic safety net.

3. **Product-vs-parent-company distinction:** If one profile represents a parent company and another represents a specific product line within the same parent (e.g., "Rubbermaid" and "Rubbermaid Brilliance"), the product-line profile is nested under the parent profile as a `productLine` entry rather than treated as a separate competitor.

4. **Known competitor merge:** If a `CompetitorProfile` from discovery matches an entry in `knownCompetitors`, the profile's `isKnownCompetitor` flag is set to `true` and the inventor's known name is canonicalized with the discovered information.

**Cost estimate for Step 8:** No API calls. In-worker processing only.

---

### Step 9 — Merge with Prior Result (Incremental Path Only)

**What happens:** For `runDepth: "incremental"`, the worker merges the new competitor discoveries (from Steps 1–3 scoped to the delta period) with the `existingCompetitorList` from the prior run.

**No external provider.** In-worker processing only.

**Merge logic:**

1. **New competitor identification:** Any competitor in the new discovery results whose `primaryDomain` does not appear in the `existingCompetitorList` is classified as `"net_new"`.

2. **Price update detection:** For competitors already in the `existingCompetitorList`, if the current price data (from Step 4 for those competitors) differs from the stored price by ≥ 10% in any channel, the price change is logged as a `CompetitorChangeEvent`:

```
CompetitorChangeEvent {
  competitorName: string
  changeType: "price_increase" | "price_decrease" | "new_competitor" | "competitor_removed" | "channel_added" | "channel_removed"
  previousValue: any | null
  newValue: any
  detectedAt: string
  materialityFlag: boolean       // True if change is significant enough to surface as a review notification
}
```

3. **Removed competitor detection:** Competitors in `existingCompetitorList` that return zero evidence across all queries in the current run are flagged as `"possibly_removed"`. They are retained in the list for one additional refresh cycle before being removed. Premature removal due to a single quiet search cycle is worse than retaining a stale entry.

4. **Merged list composition:** The merged list = `existingCompetitorList` (updated where changes detected) + `net_new` competitors.

5. **Change events:** All `CompetitorChangeEvent` entries are stored in the result's `changesSinceLastRun` field and used to generate the diff notification for the founder (see Part 2 Section 4.6 for scheduled research surfacing behavior).

---

### Step 10 — Confidence Scoring and Result Finalization (All Paths)

**What happens:** The worker computes the confidence score for the result (see Section 7 for full methodology), attaches the `ConfidenceRecord`, assembles the final `CompetitorResearchResult` output document (see Section 5), and writes it to `researchResults`.

**No external provider.** Deterministic computation.

**Result assembly:**

The worker assembles the final result object from:
- The deduplicated `CompetitorProfile[]` list
- The `CompetitiveStructureAnalysis`
- Trend data (if Step 7 succeeded) or `trendDataUnavailable: true`
- The `ConfidenceRecord` (see Section 7)
- The `changesSinceLastRun` array (incremental path only)
- Metadata: `researchedAt`, `expiresAt`, `providerUsed`, `runDepth`, `queryCount`, `lastRunCursor` (updated to current timestamp for next incremental run)

The result is then written to `researchResults` as a new version record (see Section 6).

---

## 5. Output Schema

### 5.1 Top-Level Result Structure

The `processedResult` field in the `researchResults` record stores the following top-level object for this module:

```
CompetitorResearchResult {
  // Module identification
  moduleId: "competitive_landscape"
  runDepth: "light" | "full" | "incremental"
  
  // Core output
  competitors: CompetitorProfile[]           // The structured competitor list (see 5.2)
  competitiveStructure: CompetitiveStructureAnalysis  // Market-level structure (see 5.3)
  trendData: CompetitorTrendData | null      // Search volume and trend signals (see 5.4)
  
  // Change tracking (incremental runs only)
  changesSinceLastRun: CompetitorChangeEvent[]  // Empty on first run
  netNewCompetitorCount: number              // Count of newly discovered competitors
  priceChangesDetected: number               // Count of competitors with detected price changes
  
  // Research metadata
  queryCount: number                         // How many search queries were executed
  competitorsDiscovered: number              // Total unique competitors in this result
  competitorsEnriched: number                // Competitors with full enrichment (Steps 4–5)
  competitorsUnenriched: number              // Competitors with discovery data only
  lastRunCursor: string                      // ISO 8601 date — used as start point for next incremental run
  
  // Confidence record (attached per Part 2 Section 8.2)
  confidence: ConfidenceRecord               // Full confidence record — see Section 7
}
```

### 5.2 CompetitorProfile Schema

One record per discovered competitor. This is the core structured output of the module.

```
CompetitorProfile {
  // Identity
  competitorId: string                       // UUID (stable across incremental runs)
  brandName: string                          // Canonical brand or company name
  productName: string | null                 // Primary product name (null if brand-level only)
  primaryDomain: string                      // Root domain of brand website
  primaryMarketplaceUrl: string | null       // Primary Amazon/marketplace listing URL if applicable
  
  // Classification
  threatLevel: "direct" | "indirect" | "adjacent"  // Competitive relationship to the invention
  isKnownCompetitor: boolean                 // Inventor named this competitor explicitly
  isNewDiscovery: boolean                    // Found for first time in this run (incremental path)
  enriched: boolean                          // Whether Steps 4–5 were executed for this competitor
  
  // Pricing (from Step 4)
  pricing: {
    prices: PriceRecord[]                    // All captured prices (may include multiple channels/variants)
    priceRangeLow: number | null             // Lowest price found (in cents)
    priceRangeHigh: number | null            // Highest price found (in cents)
    priceTier: "value" | "mid_market" | "premium" | "ultra_premium" | "unknown"
    pricingNotes: string | null              // Any pricing structure notes (subscription, volume tiers, etc.)
  }
  
  // Channel presence (from Steps 2–4)
  channels: {
    dtc: boolean                             // Sells via their own website
    amazon: boolean                          // Listed on Amazon
    targetRetail: boolean                    // Listed at Target
    walmartRetail: boolean                   // Listed at Walmart
    specialtyRetail: boolean                 // Listed in specialty/independent retail
    wholesale: boolean                       // Available via wholesale/Faire/distributor
    subscription: boolean                    // Sold via subscription model
    channels: string[]                       // Specific channel names with evidence
  }
  
  // Positioning (from Step 5 LLM synthesis)
  positioning: {
    positioningStatement: string             // 1–2 sentence synthesis of how they position themselves
    keyMessages: string[]                    // Top 3 marketing messages (from their product copy)
    targetAudience: string | null            // Who they appear to target (inferred)
    differentiationClaims: string[]          // What they claim makes them different (from their copy)
  }
  
  // Competitive analysis (from Step 5 LLM synthesis)
  competitiveAnalysis: {
    strengths: string[]                      // 1–3 strengths grounded in evidence
    weaknesses: string[]                     // 1–3 weaknesses grounded in evidence
    differentiationGap: string | null        // One gap between what they offer and what the invention offers (top 5 competitors only)
    assumptionsInAnalysis: string[]          // Any assumptions the LLM made (per anti-hallucination rules)
  }
  
  // Evidence
  evidenceSources: SourceReference[]        // All sources that contributed to this profile (per Part 2 Section 8.2)
  
  // Temporal
  firstDiscoveredAt: string                  // ISO 8601 — when this competitor was first found
  lastConfirmedAt: string                    // ISO 8601 — last time evidence confirmed this competitor exists
  possiblyRemoved: boolean                   // True if no evidence in current run (pending removal)
}
```

### 5.3 CompetitiveStructureAnalysis Schema

```
CompetitiveStructureAnalysis {
  marketConcentration: "fragmented" | "moderately_concentrated" | "oligopoly" | "monopoly_adjacent"
  marketConcentrationNotes: string           // 1–2 sentences explaining the concentration classification
  
  priceClustering: {
    dominantTier: "value" | "mid_market" | "premium" | "ultra_premium" | "split"
    priceRangeLow: number | null             // Lowest price in the market (cents)
    priceRangeHigh: number | null            // Highest price in the market (cents)
    averagePrice: number | null              // Mean price across competitors (cents)
    priceWhitespaceLow: boolean              // Is there an under-served low-price segment?
    priceWhitespaceHigh: boolean             // Is there an under-served high-price segment?
  }
  
  channelConcentration: {
    overServedChannels: string[]             // Channels saturated with competing products
    underServedChannels: string[]            // Channels with few current competitors
  }
  
  positioningWhitespace: string | null       // Description of any unoccupied competitive position
  competitiveIntensity: "low" | "moderate" | "high"
  competitiveIntensityNotes: string          // 1–2 sentences supporting the intensity classification
  
  newEntrantImplications: string             // One paragraph on new entrant viability and primary risks
  marketMomentum: "strong_growth" | "moderate_growth" | "flat" | "declining" | "emerging" | "unknown"
  marketMomentumBasis: string | null        // Evidence basis for momentum assessment
  
  totalCompetitorsAnalyzed: number
  directCompetitorCount: number
  indirectCompetitorCount: number
  adjacentCompetitorCount: number
}
```

### 5.4 CompetitorTrendData Schema

```
CompetitorTrendData {
  primaryKeyword: string                     // The product category keyword queried
  relativeInterest: number                   // Current interest relative to peak (0–100 Google Trends scale)
  trend: "rising" | "stable" | "declining" | "breakout"
  period: "last_12_months" | "last_5_years"
  
  competitorTrends: CompetitorTrendRecord[]  // Trend data for top 2 competitors
  
  dataVintage: string                        // How fresh the trend data is
  trendDataUnavailable: boolean              // True if Step 7 was skipped
}

CompetitorTrendRecord {
  competitorName: string
  relativeInterest: number
  trend: "rising" | "stable" | "declining" | "breakout"
}
```

### 5.5 Confidence Record

The `ConfidenceRecord` attached to every `CompetitorResearchResult` is the full schema defined in Part 2 Section 8.2. The module-specific scoring methodology is defined in Section 7 of this document.

The `transparencyLabel` for competitive landscape results is always `"atlas_researched"` (data sourced from external APIs and web search) unless the result was produced with `runDepth: "light"` using only category-level queries — in that case, `transparencyLabel` is `"atlas_inferred"`.

### 5.6 Mapping to Convex Document Fields

The following maps output fields to their destination in the Convex data model:

| Output Field | Destination Table | Destination Field | Notes |
|---|---|---|---|
| `CompetitorResearchResult` (full object) | `researchResults` | `processedResult` | Primary storage; full result |
| `competitors[]` | `stageProgress` | `competitorList` | Top 10 by relevance; written after founder review |
| `competitiveStructure.competitiveIntensity` | `stageProgress` | `competitiveIntensityLabel` | Used in Stage 3 competitive market share analysis |
| `competitors[].pricing.prices[]` | `stageProgress` | `competitorPricingData` | Consumed by Stage 10 pricing module |
| `competitors[].channels` | `stageProgress` | `competitorChannelPresence` | Consumed by Stage 11 channel selection module |
| `competitiveStructure.positioningWhitespace` | `stageProgress` | `competitiveWhitespace` | Consumed by Stage 11 positioning module |
| `changesSinceLastRun` (material changes) | Risk Tracker | New entry with type `"competitive_change"` | Only for changes with `materialityFlag: true` |

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
- `moduleId: "competitive_landscape"`
- `processedResult: CompetitorResearchResult`
- `outputRoutes: ["stage_view", "document_input", "risk_tracker", "monitoring_feed"]`

**`stageProgress` (written after founder approval):**
- Fields written depend on which stage's `stageProgress` record is the target. The dispatcher routes the result to the correct stage's progress record based on `stageId` at time of research.

### 6.3 Write Rules

| Target | Write Rule |
|---|---|
| `researchResults` | **Insert only** — never overwrite. New version per run. Version number is `max(existingVersions) + 1`. |
| `stageProgress.competitorList` | **Merge** — new discoveries are added to the existing list; existing entries are updated in place by `competitorId`. No entry is removed from `stageProgress` by this merge (removed entries are flagged `possiblyRemoved: true`). |
| `stageProgress.competitorPricingData` | **Overwrite** — pricing data is replaced in full on each approved research result, since prices change. |
| `stageProgress.competitiveIntensityLabel` | **Overwrite** — the latest assessment replaces the prior. |
| Risk Tracker entry for new competitor | **Append** — a new risk tracker entry is created; existing entries are not modified. |

### 6.4 Versioning Behavior

As defined in Part 1 Section 2.9, every research run for this module writes a new version record. The active version is always the latest completed version.

**Incremental run versioning:** An incremental run produces a new version whose `processedResult` contains the full merged competitor list (not just the delta). This is important for downstream consumers — they always read the complete current result, not a sequence of deltas.

**Version retention:** All prior versions are retained indefinitely for the lifetime of the invention. The Document Pipeline and stage view always read the latest completed version. Prior versions are accessible through the "Research history" view in the stage UI.

**Stale version behavior:** When a new version is written, the prior version's status is updated to `"superseded"` (not `"stale"` — `"stale"` is reserved for results that have passed their `expiresAt` without a new version). Superseded results are retained but not served as the active result.

---

## 7. Confidence Scoring

### 7.1 Module-Specific Scoring Methodology

The confidence score for this module is computed from five components as defined in Part 2 Section 8.2, using the module-specific scoring signals defined in Part 2 Section 8.5 for the Competitive Landscape Module.

**Component weights (fixed per Part 2 Section 8.2):**
- `sourceCount`: 20%
- `sourceAuthority`: 25%
- `resultRecency`: 20%
- `coverageCompleteness`: 20%
- `internalConsistency`: 15%

**Component scoring signals for this module:**

| Component | Scoring Signal | Score |
|---|---|---|
| `sourceCount` | ≥ 5 distinct competitors found and profiled | 1.00 |
| `sourceCount` | 3–4 competitors found | 0.75 |
| `sourceCount` | 1–2 competitors found | 0.50 |
| `sourceCount` | 0 competitors found (search error or no competitors exist) | 0.00 |
| `sourceAuthority` | Weighted average across all source types consulted (brand website = 0.50, Amazon listing = 0.85, marketplace with verified transaction data = 0.85, news article = 0.50, web search result = 0.25) — per Part 2 Section 8.4 authority weights | varies |
| `resultRecency` | All competitor data captured within 30 days | 1.00 |
| `resultRecency` | Some competitor data 30–90 days old | 0.75 |
| `resultRecency` | Some competitor data > 90 days old | 0.50 |
| `coverageCompleteness` | All expected fields populated (name, at least one price, at least one channel, positioning statement) for all enriched competitors | 1.00 |
| `coverageCompleteness` | Price missing for any enriched competitor | 0.70 |
| `coverageCompleteness` | Channel presence not identified for any enriched competitor | 0.80 |
| `coverageCompleteness` | Positioning statement absent for top 5 competitors | 0.75 |
| `coverageCompleteness` | Result produced with `runDepth: "light"` (no enrichment) | 0.50 |
| `internalConsistency` | Price ranges consistent across sources for all competitors (within 10% variance for same product same channel) | 1.00 |
| `internalConsistency` | Conflicting prices present with no clear explanation (e.g., same product listed at $29 and $89 without variant or channel distinction) | 0.50 |
| `internalConsistency` | Trend data (if available) directionally consistent with competitive intensity assessment | +0.05 bonus added to raw score before normalization, max 1.0 |

**Final score formula:**

```
rawScore = (sourceCount × 0.20) + (sourceAuthority × 0.25) + (resultRecency × 0.20) + (coverageCompleteness × 0.20) + (internalConsistency × 0.15)

calibratedScore = min(1.0, rawScore × moduleCalibration.scoreAdjustmentFactor)
```

Where `moduleCalibration.scoreAdjustmentFactor` is 1.0 until at least 20 founder review events have been recorded for this module (per Part 2 Section 8.8).

### 7.2 Primary vs. Secondary Source Weighting

This module relies primarily on **secondary sources** (brand websites, marketplace listings, web search results). Primary sources are rare in competitive landscape research — government databases do not catalog competing consumer products.

| Source Type | Expected Frequency | Authority Weight |
|---|---|---|
| `verified_platform` (Amazon marketplace listing with verified sales) | Common for products sold on Amazon | 0.85 |
| `brand_website` (competitor's own domain) | Common | 0.50 |
| `news_article` (press coverage of competitor launch, funding, etc.) | Occasional | 0.50 |
| `industry_report` (category-level market reports) | Rare unless used in Step 7 | 0.70 |
| `web_search_result` (unclassified web content) | Common | 0.25 |
| `llm_synthesis` (fields generated by LLM without external source) | Used for positioning statements | 0.10 |

**Implication:** The `sourceAuthority` component will typically score in the 0.50–0.70 range for most competitive landscape results. This is expected and appropriate — competitive landscape data is inherently web-sourced. A fully primary-sourced competitive landscape result is not achievable for this module type. The confidence thresholds account for this: a Competitive Landscape result with a score of 0.72 should not be penalized for the inherently secondary nature of its sources.

### 7.3 Confidence Degradation Schedule

As defined in Part 2 Section 8.7, effective confidence degrades over time:

```
effectiveConfidence(t) = storedScore × max(0.30, 1.0 - (daysSinceResearch / 30))
```

| Days Since Research | Example (stored score 0.80) | Effective Confidence | Label |
|---|---|---|---|
| 0 (fresh) | 0.80 | 0.80 | AUTO_ACCEPT |
| 15 days | 0.80 × (1 - 0.50) = 0.80 × 0.50 = 0.40 → but floor applies | 0.40 | REQUIRES_REVIEW |
| 30 days | 0.80 × (1 - 1.0) → floor applies | 0.30 (floor) | REQUIRES_REVIEW |
| 60 days | floor | 0.30 (floor) | REQUIRES_REVIEW |

**Interpretation:** A competitive landscape result degrades to REVIEW_RECOMMENDED within approximately 8 days of research (at stored score 0.80), and to REQUIRES_REVIEW within approximately 12 days. This aggressive degradation schedule reflects the reality that competitive landscapes change meaningfully within a month — prices change, new entrants appear, and old competitors pivot. The monthly scheduled refresh (Section 2.1) is designed to keep the result within the AUTO_ACCEPT or REVIEW_RECOMMENDED window for the majority of the time between refreshes.

**Half-life:** 30 days (per Part 2 Section 8.7 for Competitive Landscape category)
**Minimum floor:** 0.30

### 7.4 What Triggers REQUIRES_REVIEW

This module's result triggers `REQUIRES_REVIEW` (threshold label, not a refusal) when any of the following conditions apply:

1. **Effective confidence below 0.60** (applies the standard threshold from Part 2 Section 8.3)
2. **Fewer than 2 competitors discovered** — a competitive landscape with 0 or 1 competitors either means the search failed or the market is genuinely tiny, both of which require founder confirmation
3. **All competitor prices missing** — pricing is a core output of this module; if no prices were captured, the result is incomplete and requires review
4. **`runDepth: "light"` result** — light-path results are always REQUIRES_REVIEW regardless of other scores, because they have not executed enrichment or LLM synthesis
5. **High-risk assumption present** — specifically, if the module assumed a `productCategory` (Step 1 fallback) and that category assumption could fundamentally alter the competitor set, the assumption is classified `riskIfWrong: "high"` and the result is REQUIRES_REVIEW regardless of score
6. **Confidence degraded below 0.60** due to time elapsed since research (see Section 7.3)

### 7.5 What Triggers AUTO_ACCEPT

This module's result auto-accepts (does not require explicit founder interaction before flowing to downstream consumers) when ALL of the following are true:

1. `effectiveConfidence ≥ 0.85`
2. At least 3 competitors are profiled with full enrichment
3. All competitors in the top 5 by relevance have at least one price captured
4. No high-risk assumptions are present in the result
5. The result has not been previously rejected by the founder for this `inventionId`
6. The result `runDepth` is `"full"` or `"incremental"` (not `"light"`)

This module IS eligible for auto-acceptance (it is not on the excluded list from Part 2 Section 9.4). At AUTO_ACCEPT threshold, the competitor list and competitive structure analysis flow directly into the stage view and document pipeline without requiring the founder to click "Confirm."

The founder can still edit auto-accepted results at any time. Auto-acceptance is implicit confirmation, not a lock.

---

## 8. Caching

### 8.1 Cache Key Structure

Per Part 1 Section 6.2, the cache key for this module is the combination of:

- `inventionId` — the invention record
- `stageId` — the stage this research was generated for (note: the same module may have different cached results for different stages — a Stage 1 competitive landscape and a Stage 10 competitor pricing enrichment are different cache entries)
- `moduleId: "competitive_landscape"` — fixed
- `contextHash` — a deterministic hash of the following fields from the input payload:

```
contextHash = sha256(
  normalize(productDescription) +        // Lowercased, whitespace-normalized, keyword-extracted
  normalize(productCategory) +
  normalize(targetMarket) +               // Defaults to "US" if not supplied
  sort(knownCompetitors).join(",")        // Sorted alphabetically for stability
)
```

**Context hash stability rules for this module:**

- Changes to `productDescription` that are **less than 20% keyword overlap change** (e.g., fixing typos, rewording the same concept) do NOT invalidate the hash. The keyword extraction step normalizes minor rewordings.
- Changes to `productCategory` ALWAYS invalidate the hash. Category is the primary search axis.
- Changes to `targetMarket` ALWAYS invalidate the hash. Geography fundamentally changes the competitor set.
- Adding a new entry to `knownCompetitors` ALWAYS invalidates the hash (so the new competitor is researched).
- Changing `targetAudience` alone does NOT invalidate the hash (it affects enrichment nuance but not the primary competitor discovery set).

### 8.2 TTL and Expiration

| Run Depth | TTL from Execution | Rationale |
|---|---|---|
| `"light"` result | 6 hours | Light results are placeholder seeds; they should be superseded quickly by a full run |
| `"full"` result | 30 days | Standard TTL for competitive landscape category (Part 1 Section 6.3) |
| `"incremental"` result | 30 days from incremental run date | Incremental runs reset the TTL as if a full run had occurred |

After TTL expiration, the result is considered stale and will be refreshed on the next qualifying trigger (per Part 1 Section 6.4 Rule 1). The stale result continues to be served to the founder with a staleness indicator until the refresh completes.

### 8.3 Incremental Update Strategy

This module supports incremental updates as defined in Part 1 Section 6.7.

**Incremental update conditions** (a new run uses `runDepth: "incremental"` instead of `"full"` when ALL are true):

1. A prior completed result exists for the same (inventionId, stageId, moduleId, contextHash)
2. The prior result has status `"completed"` and `possiblyRemoved` is false for all competitors
3. The trigger is `scheduledResearch` (not `onStageComplete`, not `manualRefresh`, not a context-delta trigger)
4. The prior result was completed within the last 90 days (results older than 90 days trigger a full re-run even if the trigger is scheduled)

**What the incremental run does:**
- Uses `lastRunCursor` from the prior result as the date boundary for delta queries
- Only Steps 1, 2 (with delta scoping), 3, 8, 9, and 10 execute (Steps 4–7 are skipped for already-known competitors)
- New competitor discoveries from the delta period go through the full Steps 4–5 enrichment
- The merged result is written as a new version

**Why incremental is preferred for scheduled runs:** A full run for this module costs approximately $0.15–$0.25. An incremental run for a mature competitive landscape (where most competitors are already known) costs approximately $0.03–$0.08 — a 60–80% cost reduction. Over 12 monthly refresh cycles, this represents significant savings while maintaining research quality.

### 8.4 Full Re-Run Required vs. Partial Refresh

| Trigger | Full Re-Run or Partial Refresh |
|---|---|
| `onStageComplete` (Stage 1) | Full re-run — first detailed research with complete Idea Brief context |
| `onOpen` (Stages 2, 10, 11) | Supplemental sub-task only (not a full re-run) — targeted enrichment of existing result |
| `scheduledResearch` | Incremental refresh (unless > 90 days old — then full re-run) |
| `manualRefresh` | Full re-run always |
| Context delta (product description changed materially) | Full re-run — context change invalidates prior result |
| `onStageEnter` freshness check (result stale) | Full re-run if stale; incremental if within 90 days but expired |
| Prior result has `"failed"` status | Full re-run — treat failed result as a cache miss |

---

## 9. Error Handling

### 9.1 Known Failure Modes

| Failure Mode | Description | Likelihood |
|---|---|---|
| No competitors found | All search queries return zero results classifiable as competitors | Low |
| All prices missing | Competitors found but no pricing data extractable from any source | Moderate |
| LLM synthesis failure | Claude Sonnet or fallback LLM unavailable | Low |
| Web search rate limit | Brave Search or SerpAPI monthly quota exhausted | Low-Moderate |
| Provider timeout | Web search query exceeds 8-second timeout for all providers | Low |
| LLM hallucination (anti-pattern) | LLM invents competitor details not in evidence | Mitigated by Step 5 prompt constraints |
| Context hash collision | Two different product descriptions hash to the same value | Extremely rare; handled by context hash collision detection |
| Query battery LLM failure | Claude Haiku Step 1 call fails | Low — template fallback mitigates |

### 9.2 Provider-Specific Failure Handling

**Brave Search (`brave_search`) failure:**
1. Immediately fall back to `serpapi_google`
2. If `serpapi_google` also fails, fall back to `bing_search`
3. If all web search providers fail, the job is marked `"all_providers_failed"` and retried after the backoff window
4. Provider failure reason is logged to `researchExecutionLog.providerAttempts`
5. A fallback provider penalty is applied to confidence: first fallback -0.05, second fallback -0.10 (per Part 2 Section 7.6)

**SerpAPI Shopping (`serpapi_shopping_prices`) failure (Step 4):**
1. Fall back to `brave_search` for competitor pricing queries
2. If `brave_search` also fails for pricing, Step 4 is skipped for that competitor (price marked as `null`)
3. Missing prices reduce `coverageCompleteness` confidence component (not a job failure)

**LLM synthesis failure (Step 5):**
1. Fall back to `openai_gpt4o_mini`
2. If both LLMs fail, Steps 5 and 6 are skipped entirely
3. The result is written with `enriched: false` for all competitors and `positioningStatement: null`
4. Confidence is automatically reduced: `coverageCompleteness` capped at 0.50 when Step 5 is skipped
5. The result label is REQUIRES_REVIEW due to reduced confidence — the founder sees: "Atlas found competitors but could not generate detailed profiles. The basic competitor list is available for your review."

**Google Trends failure (Step 7):**
1. Step 7 is skipped — it is already optional
2. `trendDataUnavailable: true` is set in the output
3. No confidence penalty — trend data is supplemental

### 9.3 Partial Result Handling

A **partial result** occurs when some steps complete successfully and others fail. Partial results are written to `researchResults` with a `"partial"` flag and a `partialReason` description. They are not treated as failures — they are treated as REQUIRES_REVIEW results with reduced confidence.

| Partial Scenario | Fields Available | Fields Missing | Confidence Impact |
|---|---|---|---|
| Web search succeeded but enrichment failed (Step 4 failed) | Competitor list (names, domains, basic evidence) | Pricing, channel detail | `coverageCompleteness` → 0.50 |
| Web search succeeded but LLM synthesis failed (Step 5 failed) | Competitor list, pricing (from Step 4 snippets) | Positioning, differentiation gaps | `coverageCompleteness` → 0.60 |
| Only light-path data available (Steps 1–2 only) | Preliminary competitor names | Pricing, channels, positioning, structure analysis | Full score likely ≤ 0.50 |
| All providers failed for some competitors (partial discovery) | Competitors successfully discovered | Competitors not discovered | `sourceCount` component reflects actual count |

Partial results are never served to the Document Pipeline for document assembly — they are surfaced to the founder in the stage view with a clear partial-result indicator, but they are gated from auto-flowing into document sections that require complete data.

### 9.4 How Errors Are Surfaced to the Founder

**Research job failed (all retries exhausted):**

The stage view shows a persistent notice in the place where the competitive landscape would be displayed:

> "Atlas wasn't able to complete competitor research for your product. This sometimes happens due to temporary issues with our data sources. You can [Try again] or [Enter competitors manually]."

The "Try again" button triggers a `manualRefresh` at Priority Level 1. The "Enter competitors manually" button opens the manual override form (per Part 2 Section 9.8).

**Partial result available:**

The stage view shows the partial result with a notice:

> "Atlas found [N] competitors but wasn't able to gather complete pricing and positioning details. Review what Atlas found, or [Refresh for more complete data]."

**Research in progress:**

The stage view shows a skeleton/loading state with:

> "Atlas is researching competitors... This usually takes 30–60 seconds."

If research is still in progress when the founder opens the stage (Priority Level 2 job), the live status updates are reflected in the UI through Convex's reactive query system.

### 9.5 Retry Behavior

This module uses the default retry configuration from Part 1 Section 2.12 unless otherwise specified:

| Retry Event | Delay | Max Retries |
|---|---|---|
| Network error | 30 sec → 2 min → 10 min → 30 min | 4 |
| Provider 429 (rate limit) | Retry-After header (or 60 sec if absent) | 4 |
| Provider 5xx | 30 sec → 2 min → 10 min → 30 min | 4 |
| Timeout | 30 sec (then full re-execution with same inputs) | 3 |
| LLM synthesis failure | 30 sec (on first retry try fallback LLM) | 2 |
| Query battery LLM failure | Immediate (use template fallback — no retry delay needed) | 1 (then template fallback) |

**Provider rotation on retry:** On the second retry (attempt 3), the dispatcher rotates to the next provider in the fallback chain if the primary provider has failed twice (per Part 1 Section 5.6).

**Non-retryable failures:**
- Invalid `inventionId` or `stageId` — dispatcher bug, not retryable
- Malformed `productDescription` that the LLM cannot process as a query seed — surface to founder for correction
- Per-invention budget exhausted — job held, not retried, until budget resets (per Part 2 Section 10.9, Circuit Breaker 2)

---

## 10. Cost Estimate

### 10.1 Expected API Call Count Per Run

**Full run (`runDepth: "full"`):**

| Step | Provider | Calls | Description |
|---|---|---|---|
| Step 1 | Claude Haiku (LLM) | 1 | Query battery generation |
| Step 2 | Brave Search (primary) | 6–10 | One call per search query |
| Step 4 | Brave Search (primary) | Up to 10 | One enrichment query per top-10 competitor |
| Step 4 | SerpAPI Shopping | Up to 10 | One shopping query per top-10 competitor |
| Step 5 | Claude Sonnet (LLM) | 1 | Competitor profile synthesis |
| Step 6 | Claude Haiku (LLM) | 1 | Competitive structure analysis |
| Step 7 | SerpAPI (Google Trends) | 3 | Category keyword + top 2 competitor trends |
| **Total** | | **23–36** | |

**Light run (`runDepth: "light"`):**

| Step | Provider | Calls | Description |
|---|---|---|---|
| Step 1 | Claude Haiku (LLM) | 0 | Template fallback only (no LLM) |
| Step 2 | Brave Search (primary) | 3–5 | Reduced query battery |
| **Total** | | **3–5** | |

**Incremental run (`runDepth: "incremental"`, 30-day scheduled):**

| Step | Provider | Calls | Description |
|---|---|---|---|
| Step 1 | Claude Haiku (LLM) | 1 | Delta-scoped query battery |
| Step 2 | Brave Search (primary) | 3–5 | Delta-scoped queries |
| Step 4 | Brave Search or SerpAPI Shopping | 0–4 | Enrichment only for newly discovered competitors |
| Step 5 | Claude Sonnet (LLM) | 0–1 | Only if new competitors are found (≥ 1) |
| Step 6 | Claude Haiku (LLM) | 1 | Updated structure analysis |
| **Total** | | **5–12** | |

### 10.2 Estimated Cost Range Per Run

Per Part 2 Section 10.5 and Section 10.6:

| Run Type | Estimated Cost Range | Notes |
|---|---|---|
| Full run | $0.12–$0.22 | Typical range; higher end if SerpAPI Shopping is primary source for pricing |
| Light run | $0.01–$0.02 | 3–5 Brave Search queries only |
| Incremental run (no new competitors) | $0.02–$0.05 | Delta queries plus structure re-analysis |
| Incremental run (2–3 new competitors) | $0.06–$0.12 | New competitor enrichment and synthesis |

**Per-stage cost caps applied to this module:**
- Stage 1 cap: $0.25 (25 cents) — the full run at Stage 1 completion fits within this cap
- Stage 3 cap: $1.50 (150 cents) — Stage 3 shares budget with Market Research module; competitive landscape enrichment at Stage 3 open is a sub-task costing < $0.05
- Stage 10 cap: $0.75 (75 cents) — competitor pricing enrichment at Stage 10 open costs < $0.10

Over the full journey (15 stages + 12 monthly scheduled refreshes), the total expected spend for this module per invention is:

| Activity | Estimated Cost |
|---|---|
| Stage 1 onOpen light sweep | $0.01–$0.02 |
| Stage 1 onStageComplete full run | $0.12–$0.22 |
| Stage 2, 3, 10, 11 supplemental sub-tasks | $0.05–$0.15 total |
| 12 monthly scheduled incremental refreshes | $0.24–$0.84 total |
| 2–3 expected manual refreshes per journey | $0.24–$0.66 total |
| **Total for module per invention** | **$0.66–$1.89** |

This is consistent with the $0.50 estimate cited in Part 2 Section 10.5 for "Competitive landscape research at 5 stage hooks" — the per-stage hook costs are within range. The additional 12-month monitoring adds the remainder.

### 10.3 Cost Optimization Strategies

**Strategy 1 — Incremental runs for scheduled refreshes:**
Described in Section 8.3. 60–80% cost reduction for monthly scheduled runs compared to full re-runs.

**Strategy 2 — Cap enrichment at top 10 competitors:**
The enrichment step (Step 4) is capped at the top 10 competitors by relevance score. Competitors ranked 11+ receive discovery data only. Enriching all discovered competitors would significantly increase cost without proportionate quality gain — the founder rarely needs detailed profiles for the 15th most relevant competitor.

**Strategy 3 — Use Haiku for structure analysis:**
Step 6 (competitive structure analysis) uses Claude Haiku rather than Claude Sonnet. The structure analysis is a classification task (concentration, intensity, whitespace identification) that Haiku handles reliably at ~75% cost reduction vs. Sonnet.

**Strategy 4 — Skip trend data on incremental runs:**
Step 7 (Google Trends) is skipped on incremental runs unless `changesSinceLastRun` contains a `"new_competitor"` event. Trend data does not change meaningfully enough month-to-month to justify re-querying on every scheduled refresh.

**Strategy 5 — LLM caching for identical context hashes:**
Per Part 2 Section 7.3 (LLM Cost Containment Policy), LLM responses for identical (prompt + context hash) combinations are cached for 24 hours. If two inventions with nearly identical product descriptions trigger simultaneous competitor research, the LLM synthesis results are served from cache for the second request. In practice, this applies during development and testing more than in production.

---

## 11. Founder Review Requirements

### 11.1 What Requires Founder Review

Per Part 2 Section 9.2, this module generates a review request under the following conditions:

| Condition | Review Type | Blocking? |
|---|---|---|
| `effectiveConfidence < 0.60` (REQUIRES_REVIEW) | Explicit review required | Yes — stage readiness score does not credit competitor-dependent fields until confirmed |
| `runDepth: "light"` result is what the founder encounters first | Required review prompt | Yes — light results cannot populate stage-gating fields until reviewed |
| Fewer than 2 competitors found | Required review prompt | Yes — an empty or near-empty list cannot be auto-accepted |
| All competitor prices missing | Required review prompt | Yes — pricing is a gating requirement for Stage 10 advancement |
| High-risk assumption present (e.g., assumed productCategory) | Required review prompt | Yes — high-risk assumptions always require confirmation per Part 2 Section 8.6 |
| `effectiveConfidence` is 0.60–0.84 (REVIEW_RECOMMENDED) | Gentle review prompt | No — stage can advance but score is not fully credited until confirmed |
| Scheduled refresh produces a competitor change with `materialityFlag: true` | Material change notification | No — notification only; founder prompted to review the specific change |
| Net-new competitor discovered with estimated revenue > $1M or venture-backed signals | Material change notification | No — surfaced as risk tracker update |

### 11.2 What Auto-Accepts

A competitive landscape result is auto-accepted (no founder interaction required before flowing to stage view and document pipeline) when:

- `effectiveConfidence ≥ 0.85`
- At least 3 competitors are profiled with full enrichment
- No high-risk assumptions present
- No prior rejection of this module for this `inventionId`
- `runDepth` is `"full"` or `"incremental"`

Auto-accepted results are marked `"auto_accepted"` in the audit trail and `founderReviewedAt` is set to the acceptance timestamp (per Part 2 Section 9.4).

The founder can always edit an auto-accepted result. Auto-acceptance is not a lock — it is the system's determination that the result is high-quality enough to proceed without interruption.

### 11.3 What Gets Surfaced as REVIEW_RECOMMENDED

REVIEW_RECOMMENDED (amber indicator, gentle prompt, non-blocking) is triggered when:

- `effectiveConfidence` is between 0.60 and 0.84

The specific prompts shown to the founder vary by sub-condition:

| Sub-Condition | Prompt Shown to Founder |
|---|---|
| Only 1–2 sources per competitor | "Atlas found these competitors with moderate confidence. The research is based on limited sources — please verify these are the right competitors for your product." |
| Pricing data is sparse | "Atlas found these competitors but pricing data is incomplete for some. Confirm or fill in any missing prices before using this data for your pricing strategy." |
| Result is 15–25 days old (approaching degradation) | "This competitor research was conducted [N] days ago. Markets change — confirm these findings are still current, or ask Atlas to refresh." |
| Trend data shows unusual divergence | "Atlas noticed that search interest for this category is [declining/volatile]. This may affect competitive dynamics — confirm your competitive assessment accounts for this trend." |

### 11.4 What Blocks Stage Advancement If Not Reviewed

The following specific conditions prevent a stage from reaching "Ready to Move Forward" status as long as they apply:

| Stage | Blocking Condition |
|---|---|
| Stage 1 | No competitor research has been completed OR the only result is `runDepth: "light"` AND the founder has not manually entered competitors |
| Stage 3 | The competitive market share analysis section cannot be completed without a confirmed competitor list. If the competitive landscape result is REQUIRES_REVIEW, Stage 3's competitive section remains in "Awaiting your review" state until the founder confirms it. |
| Stage 10 | The pricing reference table cannot be populated without confirmed competitor pricing. If competitor prices are all null, Stage 10's pricing reference table is flagged as incomplete. |

**Important:** These blocks are on specific stage sections, not on the entire stage. A founder can complete other sections of Stage 1, 3, or 10 and return to the competitor research section later. The stage is not globally blocked — only the field(s) that depend on the research result.

---

## 12. Future Expansion

### 12.1 Phase 2 Enhancements (Q4 2026 Target)

**Social media presence enrichment:**
Add competitor social media account discovery and follower/engagement signal extraction as an additional enrichment step. This would surface each competitor's presence on Instagram, TikTok, Pinterest, and YouTube — the primary channels for physical CPG products — and provide a rough digital reach signal. This adds one supplemental web search step per competitor (searching "{brandName} instagram" or "{brandName} tiktok") and is manageable within the existing cost model (~$0.05 additional per full run). The social data feeds directly into Stage 11 (Marketing) channel analysis.

**Competitor ad library detection:**
Check Meta Ad Library for each competitor (via SerpAPI SERP scraping of the Ad Library public interface) to detect whether competitors are running paid social advertising and the approximate volume. This answers a key Stage 11 question: are competitors investing in paid acquisition? The data is binary (running ads / not running ads) and requires no pricing — it is purely a presence signal.

**Review sentiment analysis:**
Add an optional enrichment step that scrapes publicly available Amazon or Google Reviews for the top 3 direct competitors and runs a structured sentiment extraction (product strengths, product weaknesses, common complaints, feature requests). This is a Step 5 addition: after profile synthesis, if Amazon reviews are available, pass the top 20 reviews through Claude Haiku for structured sentiment extraction. The output becomes a `reviewSentiment` field in `CompetitorProfile`. This directly informs Stage 2 (Validation) and Stage 11 (Marketing differentiation). Estimated additional cost: ~$0.02–$0.05 per full run.

**B2B competitor support:**
The current module is optimized for B2C physical product competitors. Phase 2 should add a B2B competitor research path for inventions targeting business buyers. This requires different query templates, different enrichment steps (LinkedIn company pages, G2/Capterra listings for software-adjacent inventions), and different pricing extraction logic (enterprise pricing is typically not publicly listed). This is a separate `runDepth` mode: `"full_b2b"`.

### 12.2 Phase 3 Enhancements (Q1–Q2 2027 Target)

**SimilarWeb traffic intelligence:**
Integrate SimilarWeb API (Phase 3 per Part 2 Section 7.8 expansion path) to pull monthly web traffic estimates for each competitor's domain. Traffic data is a strong proxy for revenue and market presence — a competitor with 500K monthly visits is meaningfully different from one with 50K visits, even if their product and price are similar. This data would populate a `trafficEstimate` field in `CompetitorProfile` and enable better market share proxy calculations in Stage 3.

**Funding history enrichment:**
Query Crunchbase or CB Insights API (to be added to the Provider Registry in Phase 3) for funding history of identified competitors. Venture-backed competitors represent a different threat level than bootstrapped ones — they have resources to compete aggressively and may be playing a loss-leader strategy. This data would populate a `fundingProfile` field in `CompetitorProfile` and trigger a material change notification when a competitor closes a new funding round.

**International market competitor mapping:**
For inventions targeting non-US markets (Europe, APAC), add market-specific query templates and provider configurations. The current module defaults to US-centric search and pricing data. Full international support requires market-local search providers (e.g., Bing for specific European markets, Yahoo Japan for JP market research) and currency normalization.

**Automated competitive differentiation matrix:**
After the full competitive landscape is confirmed by the founder, run an additional LLM synthesis step that produces a structured differentiation matrix: a grid mapping each competitor against the key product dimensions of the inventor's invention. This becomes the foundation for the "Competitive Landscape" slide in the investor pitch deck (Stage 13). The matrix is too complex and too sensitive (it requires the inventor's confirmed product spec) for the early research stage — it belongs in Phase 3 when the invention is more fully defined.

**Competitor product launch monitoring:**
Add a provider integration for G2 New Product launches, Product Hunt, or similar product discovery platforms that announce new product launches in real time. This enables the post-launch monitoring (Stage 15) to catch net-new competitors much faster than the monthly web search refresh cycle — some competitive threats emerge overnight.

### 12.3 Data Sources to Add

The following data sources are identified as high-value additions for this module, pending provider availability and DPA compliance:

| Data Source | Provider ID | What It Adds | Priority |
|---|---|---|---|
| SimilarWeb | `similarweb_api` | Competitor traffic and digital market share | High |
| Crunchbase | `crunchbase_api` | Competitor funding history and investor backing | High |
| Amazon Brand Analytics | `amazon_seller_central` | Actual search volume and share-of-voice data for Amazon-sold competitors | Medium |
| Meta Ad Library | Custom scraper | Competitor paid social advertising presence | Medium |
| G2 / Capterra | `g2_api` | Review and rating data for software-adjacent categories | Low |
| Product Hunt | `producthunt_api` | Net-new competitor launch detection | Low |
| LinkedIn Company | `linkedin_company_api` | B2B competitor company size and growth signals | Low (Phase 3 B2B path) |

### 12.4 Capabilities Not Yet Built

The following capabilities are architecturally defined in this specification but not yet built in the current system. They are documented here so that implementers have a complete picture of the target state:

1. **Incremental run merge logic (Step 9):** The incremental path is specified in full in this document, but the merge logic for `CompetitorChangeEvent` detection and the `lastRunCursor`-based delta query scoping must be implemented as a distinct code path from the full run.

2. **Supplemental sub-tasks for Stages 2, 10, and 11 onOpen:** The stage-specific supplemental enrichment tasks (sentiment for Stage 2, pricing refresh for Stage 10, channel/positioning for Stage 11) are distinct operations from the core competitive landscape run. They share the same module ID but use targeted query variants and produce sub-result updates to the existing `CompetitorProfile[]` list rather than full replacements.

3. **Risk Tracker integration:** The `materialityFlag: true` change events from incremental runs should trigger new entries in the Risk Tracker Convex table. The Risk Tracker table schema and the integration between `researchResults` change events and that table are not yet implemented.

4. **Stage 15 post-launch competitive intelligence feed:** The weekly competitive intelligence feed for post-launch monitoring is a higher-frequency, lower-depth variant of the incremental refresh that surfaces news articles and web content mentioning known competitors. This is architecturally part of this module (same `moduleId`) but requires the `scheduledResearch` scheduler to support a weekly interval, which the current scheduler may not implement by default.

5. **Founder rejection context injection:** The `founderRejectionContext` field is specified as a query modifier in Step 1 — but the pipeline that reads `ResearchAuditEvent` records, extracts the founder's context from rejection events, and injects it into the next job's input payload must be implemented in the Research Dispatcher, not in the module worker.

---

## Appendix — Provider Summary for This Module

| Step | Category | Primary Provider | Fallback 1 | Fallback 2 |
|---|---|---|---|---|
| Step 1 — Query construction | LLM | `anthropic_claude_haiku` | Template fallback (no LLM) | — |
| Step 2 — Web search | Web Search | `brave_search` | `serpapi_google` | `bing_search` |
| Step 4 — Competitor pricing enrichment | Web Search / Market Data | `serpapi_shopping_prices` | `brave_search` | — |
| Step 5 — Competitor profile synthesis | LLM | `anthropic_claude_sonnet` | `openai_gpt4o_mini` | — |
| Step 6 — Competitive structure analysis | LLM | `anthropic_claude_haiku` | `openai_gpt4o_mini` | — |
| Step 7 — Search trend signals | Market Data | `google_trends` (via SerpAPI) | Skip (optional step) | — |

---

## Appendix — Stage Hook Map for This Module

| Hook | Stage | Action |
|---|---|---|
| `onOpen` | 1 | Enqueue light sweep at Priority 3 (if product description available from onboarding) |
| `onStageComplete` | 1 | Enqueue full detailed run at Priority 3 |
| `onOpen` | 2 | Enqueue supplemental sentiment sub-task at Priority 3 |
| `onOpen` | 3 | Enqueue supplemental market share proxy enrichment at Priority 3 |
| `onOpen` | 10 | Enqueue supplemental pricing refresh sub-task at Priority 3 |
| `onOpen` | 11 | Enqueue supplemental channel/positioning enrichment at Priority 3 |
| `onStageEnter` | 1, 3, 10, 11 | Execute freshness and context-delta check; conditionally enqueue refresh at Priority 2 |
| `scheduledResearch` | 1 (enrolled at Stage 1 completion) | Enqueue incremental refresh at Priority 4, monthly interval |
| `manualRefresh` | Any stage where result is surfaced | Enqueue full re-run at Priority 1 |

---

*End of ATLAS_RESEARCH_ENGINE_ARCHITECTURE_MODULE_01_COMPETITOR.md*
*Version 1.0 — July 2026*
*Architecture specification only. No implementation. No code changes. No existing files modified.*
*Source: ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md · STAGE_BLUEPRINTS/STAGE_01_IDEA.md · STAGE_BLUEPRINTS/STAGE_03_MARKET_RESEARCH.md*
