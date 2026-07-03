# ATLAS RESEARCH ENGINE ARCHITECTURE
## Part 2 — Sections 7–10: Provider Abstraction, Confidence, Human Review, Security

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Specification — Not Yet Implemented**
**Source Documents:**
- `docs/ATLAS_AUTOMATION_CONSTITUTION.md`
- `docs/ATLAS_AUTOMATION_IMPLEMENTATION_PLAN.md`
- `docs/FOUNDER_REFERENCE_PROJECT_RISE_JARS_PART_D.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md`

---

## Document Purpose

This document is Part 2 of the Atlas Research Engine Architecture specification. It continues directly from Part 1 (Sections 1–6) and covers:

- **Section 7 — Provider Abstraction:** The provider-independent architecture layer that allows Atlas to integrate with any external data source without coupling to any specific vendor.
- **Section 8 — Confidence Framework:** The complete system for scoring, representing, and acting on the reliability and completeness of research results.
- **Section 9 — Human Review Flow:** The full workflow governing how founders interact with, review, approve, edit, override, and reject research results.
- **Section 10 — Security, Privacy, Rate Limiting, and Cost Controls:** The architecture governing API key management, data privacy, cost budgets, rate limiting, circuit breakers, audit logging, and observability.

This is an architecture specification only. It defines what must be built, in what shape, and why. It is not implementation code. No existing files are modified by this document.

---

## Table of Contents

- [Section 7 — Provider Abstraction](#section-7--provider-abstraction)
- [Section 8 — Confidence Framework](#section-8--confidence-framework)
- [Section 9 — Human Review Flow](#section-9--human-review-flow)
- [Section 10 — Security, Privacy, Rate Limiting, Cost Controls](#section-10--security-privacy-rate-limiting-cost-controls)

---

## Section 7 — Provider Abstraction

### 7.1 Overview and Purpose

The Provider Abstraction Layer is the interface boundary between Atlas's Research Engine business logic and the external APIs and data sources that power it. Its purpose is to ensure that no Atlas business logic is coupled to the specifics of any external provider — not their request format, response schema, authentication mechanism, rate limit behavior, or pricing model.

This architecture principle is non-negotiable. Providers change. APIs deprecate. Pricing structures shift. A competitor analysis that runs on SerpAPI today may need to run on Brave Search tomorrow. A patent search that uses the USPTO Public Search API may be supplemented by or replaced with a Google Patents integration. If Atlas business logic is coupled to any of these directly, every provider change requires business logic changes — creating fragility, increasing cost, and slowing iteration.

The Provider Abstraction Layer solves this by defining stable interfaces that Atlas business logic calls, while providers implement those interfaces independently. Swapping a provider requires changing the provider implementation, not the research module.

### 7.2 Abstract Provider Interface

Every provider in Atlas — regardless of category — implements the base `ResearchProvider` interface. This interface defines the minimum contract that every provider must satisfy.

**Base ResearchProvider Interface:**

```
ResearchProvider {
  // Identity
  providerId: string               // Unique identifier: "brave_search", "serpapi_web", "uspto_ptas"
  providerName: string             // Display name: "Brave Search API", "SerpAPI Web", "USPTO Patent Search"
  category: ProviderCategory       // Enum: WEB_SEARCH | NEWS | ACADEMIC | PATENT | MARKET_DATA | RETAIL | LLM | TRADEMARK | DOMAIN | ANALYTICS
  version: string                  // Provider interface version: "1.0", "2.1"

  // Availability
  isEnabled: boolean               // Whether this provider is currently active
  isHealthy: () => Promise<boolean> // Live health check against provider's status endpoint
  supportsModule: (moduleId: string) => boolean  // Whether this provider can serve a given research module

  // Execution
  execute: (request: ProviderRequest) => Promise<ProviderResponse>
  
  // Cost estimation
  estimateCost: (request: ProviderRequest) => CostEstimate  // Pre-execution cost estimate
  
  // Rate limit state
  getRateLimitStatus: () => RateLimitStatus  // Current rate limit headroom
  
  // Configuration
  getConfig: () => ProviderConfig   // Returns provider-specific configuration (masked credentials)
}
```

**ProviderRequest Structure:**

```
ProviderRequest {
  requestId: string          // Unique ID for this request (for idempotency and logging)
  moduleId: string           // Which research module is making this request
  operation: string          // The operation being requested: "search", "patent_search", "availability_check", etc.
  parameters: Record<string, any>  // Operation-specific parameters (query string, filters, pagination, etc.)
  maxResults: number         // How many results to return at most
  timeoutMs: number          // How long the provider has to respond
  context: RequestContext    // Metadata: inventionId (hashed), stageId, priority level
}
```

**ProviderResponse Structure:**

```
ProviderResponse {
  requestId: string          // Echoed from request for correlation
  providerId: string         // Which provider responded
  status: "success" | "partial" | "error" | "rate_limited" | "timeout"
  rawResponse: any           // The verbatim API response, unmodified
  normalizedResults: any[]   // Provider-normalized but not yet Atlas-normalized results
  resultCount: number        // How many results were returned
  totalAvailable: number | null  // How many total results exist (if provider reports this)
  cost: CostRecord           // Actual cost incurred by this request
  latencyMs: number          // Actual execution time
  rateLimitHeaders: RateLimitInfo | null  // Provider's rate limit headers, if returned
  errorCode: string | null   // Provider error code on failure
  errorMessage: string | null // Human-readable error message on failure
  retryable: boolean         // Whether this error is retryable
  providerMetadata: any      // Provider-specific metadata (not used by Atlas logic)
}
```

**CostEstimate and CostRecord:**

```
CostEstimate {
  estimatedCents: number     // Estimated cost in US cents (integer, e.g., 2 = $0.02)
  estimationBasis: string    // How the estimate was computed: "per_query", "per_result", "flat"
  confidence: "exact" | "approximate" | "order_of_magnitude"
}

CostRecord {
  actualCents: number        // Actual cost in US cents after execution
  billingUnit: string        // What was billed: "query", "result", "token", "call"
  unitsConsumed: number      // How many billing units were consumed
  providerInvoiceRef: string | null  // Provider's own reference ID for reconciliation
}
```

### 7.3 Provider Categories

Atlas organizes providers into categories. Each category maps to a family of research modules with shared interface requirements. A single provider may serve multiple categories if its API supports them.

---

#### Category 1 — Web Search Providers

Web search providers power competitive research, market signal gathering, community sentiment analysis, marketing intelligence, and other research modules that require broad internet content access.

**Interface extension (WebSearchProvider extends ResearchProvider):**

```
WebSearchProvider {
  // Additional required operations
  search: (query: string, filters: SearchFilters) => Promise<SearchResult[]>
  getRelatedSearches: (query: string) => Promise<string[]>
  
  // Supported filters
  supportsFilters: {
    dateRange: boolean         // Filter results by publication date
    site: boolean              // Restrict to a specific domain
    contentType: boolean       // Restrict to news, blog, product pages, etc.
    geography: boolean         // Restrict to results from a geographic region
    language: boolean          // Restrict to results in a specific language
  }
}

SearchResult {
  url: string
  title: string
  snippet: string
  publishedDate: string | null
  domain: string
  contentType: "web" | "news" | "product" | "academic" | "forum" | "review"
  relevanceScore: number       // Provider's relevance score (normalized to 0.0–1.0)
}
```

**Active Web Search Providers:**

| Provider ID | Provider Name | Primary Use | Notes |
|---|---|---|---|
| `brave_search` | Brave Search API | General web search, competitive research | Privacy-preserving; good coverage of small brands and D2C sites; no Google bias |
| `serpapi_google` | SerpAPI (Google Web) | High-coverage web search | Uses Google's index; highest coverage but higher cost; fallback to Brave |
| `serpapi_shopping` | SerpAPI (Google Shopping) | Product pricing, competitive retail data | Shopping tab specifically; excellent for competitor pricing research |
| `serpapi_news` | SerpAPI (Google News) | News coverage for competitive and market research | News-specific index; use for market trend research |
| `bing_search` | Bing Search API | Secondary/fallback general search | Lower cost; useful as fallback for web search |

**News Providers:**

News providers are a specialized subset of web search focused on recent journalism, press coverage, and publication-level tracking.

| Provider ID | Provider Name | Primary Use |
|---|---|---|
| `newsapi` | NewsAPI.org | Press coverage research for Stage 14 launch; editorial calendar intelligence |
| `serpapi_news` | SerpAPI Google News | Market trend news, competitive news monitoring |
| `gdelt` | GDELT Project API | Public event monitoring; free but lower precision |

**Academic Providers:**

Academic providers serve research modules that need peer-reviewed literature, industry research publications, and standards documentation.

| Provider ID | Provider Name | Primary Use |
|---|---|---|
| `semantic_scholar` | Semantic Scholar API | Academic literature on materials science, food science, technology areas |
| `crossref` | Crossref API | DOI resolution and publication metadata; free; supplement to Semantic Scholar |
| `core_ac` | CORE.ac.uk API | Open access academic papers; free; supplement |

---

#### Category 2 — Patent Providers

Patent providers serve Stage 4 (Patent Readiness) and Stage 9 (IP Protection) research modules. These are the highest-stakes research integrations in Atlas — the results directly inform multi-year IP strategy decisions.

**Interface extension (PatentProvider extends ResearchProvider):**

```
PatentProvider {
  search: (query: PatentQuery) => Promise<PatentResult[]>
  getPatentById: (patentId: string) => Promise<PatentDetail | null>
  getPatentFamily: (patentId: string) => Promise<PatentFamilyResult>
  searchByAssignee: (assigneeName: string) => Promise<PatentResult[]>
  getRecentFilings: (technologyClass: string, afterDate: string) => Promise<PatentResult[]>
  
  supportedJurisdictions: string[]  // e.g., ["US", "EP", "WO", "JP", "CN"]
}

PatentQuery {
  keywords: string[]             // Search terms for title, abstract, claims
  classificationCodes: string[]  // CPC, IPC, USPC codes for technology classification
  dateRange: DateRange | null    // File date range
  assignees: string[] | null     // Filter by assignee name
  jurisdiction: string           // "US" | "EP" | "WO" | "GLOBAL"
  maxResults: number
  sortBy: "relevance" | "date_desc" | "date_asc"
}

PatentResult {
  patentId: string               // Patent number or application number
  jurisdiction: string           // "US" | "EP" | "WO" etc.
  title: string
  abstract: string
  inventors: string[]
  assignee: string | null
  filingDate: string
  publicationDate: string
  grantDate: string | null
  status: "pending" | "granted" | "abandoned" | "expired"
  classificationCodes: string[]
  relevanceScore: number         // Provider's relevance score (normalized to 0.0–1.0)
  patentUrl: string              // Direct URL to patent record
  claimsSummary: string | null   // Summary of independent claims if available
}
```

**Active Patent Providers:**

| Provider ID | Provider Name | Jurisdictions | Notes |
|---|---|---|---|
| `uspto_ptas` | USPTO Patent Full-Text and Image Database API | US only | Official USPTO API; authoritative for US patents; full claim text available |
| `serpapi_google_patents` | SerpAPI (Google Patents) | US, EP, WO, JP, CN, DE, FR, GB, AU, CA | Broadest coverage across jurisdictions; excellent relevance ranking |
| `epo_ops` | EPO Open Patent Services (OPS) | EP, WO, PCT, most national | Official EPO API; required for EP and PCT searches; free tier available |
| `patentsview` | PatentsView API | US (USPTO data) | Structured USPTO data with enhanced metadata; useful for assignee searches and technology classification |
| `lens_patents` | Lens.org API | Global (all major jurisdictions) | Free; good supplemental coverage; useful fallback |

**Patent Provider Selection Logic:**

For Stage 4 prior art search:
1. Primary: `serpapi_google_patents` — broadest global coverage and best relevance ranking
2. Supplemental (always runs in parallel): `uspto_ptas` — for authoritative US full-text claim access
3. Supplemental for international inventions: `epo_ops` — for EP/PCT coverage

For Stage 9 patent landscape monitoring (ongoing monitoring of new filings):
1. Primary: `serpapi_google_patents` with `after:{lastRunDate}` filter
2. Fallback: `patentsview` for US-specific monitoring

---

#### Category 3 — Market Data Providers

Market data providers serve Stage 3 (Market Research) and Stage 10 (Pricing) research modules. They supply quantitative market sizing data, category benchmarks, consumer trend signals, and pricing intelligence.

**Interface extension (MarketDataProvider extends ResearchProvider):**

```
MarketDataProvider {
  getCategorySize: (category: MarketCategory) => Promise<MarketSizeData>
  getSearchTrends: (keywords: string[], geography: string) => Promise<TrendData>
  getDemographicData: (segment: DemographicSegment) => Promise<DemographicData>
  getPricingBenchmarks: (category: MarketCategory, channel: string) => Promise<PricingBenchmarkData>
  getCompetitorPrices: (competitorUrls: string[], productCategory: string) => Promise<CompetitorPriceData[]>
  
  // Data freshness metadata
  getDataVintage: (dataType: string) => Promise<DataVintageInfo>  // How old the source data is
}

MarketSizeData {
  totalMarketValueUSD: number | null
  currency: string
  geography: string
  year: number
  methodology: string        // How this estimate was produced
  sourcePublication: string  // The industry report or database name
  cagr: number | null        // Compound annual growth rate if available
  confidence: number         // Provider's own confidence in this estimate (0.0–1.0)
}

TrendData {
  keyword: string
  geography: string
  period: string             // e.g., "last_12_months", "last_5_years"
  dataPoints: TrendDataPoint[]  // Time series
  relativeInterest: number   // Current interest relative to peak (0–100 in Google Trends scale)
  trend: "rising" | "stable" | "declining" | "breakout"
}

CompetitorPriceData {
  competitorName: string
  productName: string
  productUrl: string
  price: number
  currency: string
  channel: string            // "brand_website", "amazon", "target", "walmart", etc.
  capturedAt: string         // When this price was captured
  isOnSale: boolean
  originalPrice: number | null  // Pre-sale price if currently on sale
}
```

**Active Market Data Providers:**

| Provider ID | Provider Name | Data Type | Notes |
|---|---|---|---|
| `google_trends` | Google Trends (via SerpAPI) | Search trend volume, category trends | Available via SerpAPI; no direct Google Trends API |
| `serpapi_shopping_prices` | SerpAPI Google Shopping | Live competitor pricing | Most reliable real-time pricing across channels |
| `statista_api` | Statista API | Industry market size reports | Expensive; use only when needed; check free alternatives first |
| `fred_api` | FRED (St. Louis Fed) API | Macroeconomic and demographic data | Free; U.S. Census integration; useful for demographic market sizing |
| `census_api` | US Census Bureau API | Population and demographic data | Free; authoritative for TAM demographic sizing |
| `bls_api` | Bureau of Labor Statistics API | Consumer spending, price indices | Free; useful for inflation adjustments and category spending data |
| `semrush_api` | SEMrush API | SEO data, keyword search volume, traffic estimates | High quality but expensive; use for Stage 11 keyword research |

---

#### Category 4 — Retail API Providers

Retail API providers serve Stage 12 (Sales) research modules — specifically retail buyer research, marketplace performance benchmarking, and retail compliance intelligence.

**Interface extension (RetailProvider extends ResearchProvider):**

```
RetailProvider {
  searchBuyerContacts: (category: string, channel: string) => Promise<RetailBuyerContact[]>
  getMarketplaceListings: (keywords: string[], marketplace: string) => Promise<MarketplaceListing[]>
  getChannelMargins: (channel: string, category: string) => Promise<ChannelMarginData>
  getComplianceRequirements: (channel: string, productCategory: string) => Promise<ComplianceRequirement[]>
}

RetailBuyerContact {
  retailerName: string
  buyerName: string | null       // null if only category-level contact available
  categoryFocus: string[]
  contactType: string            // "buyer", "category_manager", "vendor_relations"
  platform: string               // "rangeme", "faire", "direct"
  profileUrl: string | null
  approachNotes: string | null   // How to approach this buyer (platform-specific guidance)
}

MarketplaceListing {
  platform: string               // "amazon", "target.com", "walmart.com", etc.
  productTitle: string
  price: number
  rating: number | null
  reviewCount: number | null
  rank: number | null            // Best Seller Rank or equivalent
  estimatedMonthlySales: number | null  // From third-party tools where available
  asin: string | null
}

ChannelMarginData {
  channel: string
  sellerMargin: number           // Percentage margin to the seller
  channelFee: number             // Channel fee or markup (percentage)
  paymentTerms: string | null    // e.g., "Net 30", "Immediate"
  requirementsNotes: string[]    // Key requirements to sell on this channel
}
```

**Active Retail Providers:**

| Provider ID | Provider Name | Data Type | Notes |
|---|---|---|---|
| `rangeme_api` | RangeMe API | Retail buyer contacts, category discovery | Partnership required; priority integration for Stage 12 |
| `faire_api` | Faire API | Wholesale buyer contacts, indie retail | Partnership/OAuth; key for independent retail channel |
| `serpapi_amazon` | SerpAPI (Amazon) | Amazon listing data, BSR, pricing | No official Amazon API for listing research; SerpAPI provides web scraping |
| `keepa_api` | Keepa Amazon Price Tracker | Amazon price history and sales velocity | Historical pricing and BSR trends; useful for competitor tracking |

---

#### Category 5 — LLM Providers

LLM providers supply the natural language generation and analysis capabilities used throughout the Research Engine for query generation, result normalization, synthesis, and confidence-enhancing cross-reference analysis.

LLM providers are used by the Research Engine for:
1. **Query generation** — transforming structured invention parameters into well-formed search queries for patent and web search providers
2. **Result synthesis** — collating multiple raw results from different sources into a coherent structured output
3. **Relevance classification** — determining whether a found patent or competitor is actually relevant to the invention
4. **Assumption extraction** — identifying implicit assumptions that should be flagged for founder review
5. **Confidence commentary** — generating natural language explanations of confidence scores

**Interface extension (LLMProvider extends ResearchProvider):**

```
LLMProvider {
  complete: (prompt: LLMPrompt) => Promise<LLMCompletion>
  completeStructured: (prompt: LLMPrompt, schema: OutputSchema) => Promise<any>  // JSON schema-constrained output
  
  contextWindow: number          // Maximum tokens in context
  supportsStructuredOutput: boolean  // Whether the model reliably outputs valid JSON schema
  costPerInputToken: number      // Cost per 1K input tokens in USD cents
  costPerOutputToken: number     // Cost per 1K output tokens in USD cents
}

LLMPrompt {
  systemPrompt: string
  userMessage: string
  temperature: number            // 0.0 for deterministic synthesis; 0.3–0.7 for query generation
  maxOutputTokens: number
  context: string[]              // Additional context chunks (prior stage data, research results)
}

LLMCompletion {
  text: string
  inputTokensUsed: number
  outputTokensUsed: number
  finishReason: "stop" | "length" | "error"
}
```

**Active LLM Providers:**

| Provider ID | Provider Name | Primary Use | Notes |
|---|---|---|---|
| `anthropic_claude_sonnet` | Anthropic Claude Sonnet | Query generation, result synthesis, relevance classification | Primary LLM; high quality structured output; reliable JSON adherence |
| `anthropic_claude_haiku` | Anthropic Claude Haiku | Simple classification tasks, short synthesis | Lower cost; use for high-volume low-complexity LLM calls |
| `openai_gpt4o_mini` | OpenAI GPT-4o Mini | Fallback LLM; structured output tasks | Secondary fallback if Anthropic has availability issues |
| `perplexity_sonar` | Perplexity AI Sonar | Research synthesis with citations | Built-in web search + synthesis; useful for market research synthesis tasks |

**LLM Cost Containment Policy:** LLM calls are among the most expensive operations in the Research Engine. Every LLM call must:
1. Use the minimum model tier that satisfies the quality requirement for the task
2. Use structured output (JSON schema-constrained) whenever the output needs to be parsed downstream
3. Be cached — LLM responses for identical (prompt + context hash) combinations are cached for 24 hours
4. Be bounded — all LLM calls have explicit `maxOutputTokens` limits appropriate to the task

---

#### Category 6 — Trademark and Domain Providers

Trademark and domain providers serve Stage 8 (Branding) research modules — specifically brand name candidate screening for trademark conflicts and handle availability.

**Interface extension (TrademarkProvider extends ResearchProvider):**

```
TrademarkProvider {
  searchTrademark: (name: string, classes: string[]) => Promise<TrademarkSearchResult>
  getTrademarkStatus: (trademarkId: string) => Promise<TrademarkStatusResult>
  
  supportedJurisdictions: string[]  // e.g., ["US", "EU", "UK", "CA", "AU"]
}

TrademarkSearchResult {
  searchedName: string
  jurisdiction: string
  results: TrademarkHit[]
  searchTimestamp: string
  riskLevel: "clear" | "low_risk" | "moderate_risk" | "high_risk" | "conflict"
}

TrademarkHit {
  trademarkId: string
  registeredName: string
  ownerName: string
  status: "live" | "dead" | "pending"
  classes: string[]              // International Nice Classification classes
  filingDate: string
  registrationDate: string | null
  similarityScore: number        // How similar this hit is to the searched name (0.0–1.0)
  conflictBasis: string | null   // Why this is flagged: phonetic, visual, semantic
}
```

**Trademark Providers:**

| Provider ID | Provider Name | Jurisdiction | Notes |
|---|---|---|---|
| `uspto_tess` | USPTO TESS API | United States | Official USPTO trademark database; authoritative for US |
| `euipo_api` | EUIPO TMview API | European Union | Official EU trademark database |
| `markify_api` | Markify API | US, EU, UK, CA, AU, global | Third-party aggregator; broader coverage; paid but comprehensive |

**Domain and Handle Providers:**

| Provider ID | Provider Name | Checks | Notes |
|---|---|---|---|
| `namecheap_api` | Namecheap Domain API | .com, .co, .io, .net, .org, .us | Primary domain availability check |
| `godaddy_api` | GoDaddy Domain API | .com, .co, .io and 200+ TLDs | Fallback domain check |
| `social_handle_scraper` | Custom Handle Checker | Instagram, TikTok, Pinterest, X | Public availability check via platform-specific mechanisms; not an official API for all platforms |

---

### 7.4 Provider Registry

The Provider Registry is the central catalog of all configured providers in Atlas. It is the source of truth for which providers are available, which are healthy, and which capabilities each provider offers.

**Registry structure:**

```
ProviderRegistry {
  providers: Map<string, ResearchProvider>   // providerKey → provider instance
  categories: Map<ProviderCategory, string[]>  // category → list of providerKeys in priority order
  moduleMapping: Map<string, string[]>         // moduleId → list of providerKeys that can serve it
  fallbackChains: Map<string, string[]>        // primaryProviderKey → [fallback1, fallback2, ...]
}
```

**Registry initialization:** The registry is initialized at application startup from the provider configuration (environment variables and configuration files). Providers are instantiated with their credentials, connection settings, and rate limit configurations. The registry is not modified at runtime — provider swapping is an operational configuration change, not a runtime change.

**Registry querying:** The Research Engine's dispatcher queries the registry to resolve which providers should be used for a given request. The query takes a `moduleId` and an optional `providerPreference` override and returns the ordered list of providers to try (primary first, then fallbacks).

**Provider health tracking:** The registry maintains live health state for each provider. Health checks run on a 5-minute polling interval against each provider's status endpoint (or a lightweight "ping" query where no status endpoint exists). Unhealthy providers are automatically skipped in provider selection until they recover.

### 7.5 Provider Selection Algorithm

When a research module needs to execute an API call, the dispatcher uses the following algorithm to select which provider to use:

**Step 1 — Explicit override check:** If the queue entry has a `providerPreference` set (e.g., because a manual refresh was requested and the module has a preferred provider for manual runs), use that provider directly, skipping the rest of the algorithm.

**Step 2 — Module mapping lookup:** Look up the providers registered for this `moduleId` in the registry's `moduleMapping`. This returns an ordered list of providers that can serve the module.

**Step 3 — Health filter:** Remove any providers from the list whose current health status is `unhealthy`.

**Step 4 — Cost filter:** If the current queue entry has a `costBudgetRemainingCents` constraint (see Section 10), remove providers whose `estimateCost()` for this request exceeds the budget. If all providers exceed the budget, the job is held in queue with status `budget_hold` until the budget resets.

**Step 5 — Rate limit filter:** Remove providers whose `getRateLimitStatus()` shows no remaining capacity in the current rate limit window. If all providers are rate-limited, the job is deferred with backoff until at least one provider has available capacity.

**Step 6 — Select primary:** Use the first remaining provider in the ordered list. This is the primary provider for this execution.

**Step 7 — Prepare fallback list:** Record the remaining providers (after the primary) as the fallback chain for this execution. These are used if the primary fails.

**Step 8 — Execute with fallback:** Attempt the primary provider. If the primary fails with a retryable error and a fallback is available, attempt the first fallback. Log which provider was ultimately used in the result's `providerUsed` field.

### 7.6 Fallback Chains

Fallback chains define which provider to try if the primary provider fails for a given module. Fallbacks are attempted in sequence — if fallback 1 fails, fallback 2 is attempted, and so on.

**Fallback trigger conditions:**

A fallback is attempted when the primary provider returns:
- `status: "error"` with `retryable: true`
- `status: "rate_limited"` (when no backoff capacity is available in the current window)
- `status: "timeout"` on the first attempt
- Any HTTP 503 or 429 response

A fallback is NOT attempted when the primary provider returns:
- `status: "error"` with `retryable: false` (e.g., invalid query, authentication failure)
- `status: "success"` or `status: "partial"` (the result is used as-is)

**Fallback chain definitions by module:**

| Module | Primary Provider | Fallback 1 | Fallback 2 |
|---|---|---|---|
| Competitive Landscape | `brave_search` | `serpapi_google` | `bing_search` |
| Competitor Pricing | `serpapi_shopping_prices` | `brave_search` | `serpapi_google` |
| Prior Art Search (US) | `serpapi_google_patents` + `uspto_ptas` | `patentsview` | `lens_patents` |
| Market Trends | `google_trends` | `semrush_api` | `brave_search` (for trend signals) |
| Trademark Availability | `markify_api` | `uspto_tess` | none |
| Domain Availability | `namecheap_api` | `godaddy_api` | none |
| News Coverage | `newsapi` | `serpapi_news` | `brave_search` |
| Grant Programs | `sbir_gov` | `grants_gov` | `brave_search` |
| LLM Synthesis | `anthropic_claude_sonnet` | `openai_gpt4o_mini` | none |

**Fallback logging:** Every fallback attempt is logged to the audit system. The research result records which provider was ultimately used (`providerUsed` field). If a fallback was triggered, the reason for the primary provider failure is also recorded. This data feeds into provider reliability monitoring (Section 10).

**Fallback result quality:** When a fallback provider is used, the confidence scoring system applies a fallback-provider penalty (-0.05 to the confidence score) to reflect that the result came from a secondary source. This penalty is defined per fallback level — first fallback: -0.05, second fallback: -0.10. The penalty is noted in the result's `confidenceExplanation` so the founder understands why confidence may be lower than expected.

### 7.7 Provider Swapping

Provider swapping is the operational procedure for replacing one provider with another without changing Atlas business logic. The procedure:

**Scenario A — Replacing a provider with a compatible substitute (same interface, different vendor):**

1. Configure the new provider in the provider registry with its credentials and settings
2. Set the new provider as the primary in the relevant `moduleMapping` entries
3. Move the old provider to fallback position (or remove it)
4. Deploy the configuration change
5. Monitor error rates and confidence scores for 24 hours post-swap to validate quality

Atlas business logic requires no changes. The research module's normalization function may need to be updated if the new provider's response schema differs from the old — but this is a provider-layer change, not a business logic change.

**Scenario B — Adding a new provider to an existing category (supplemental coverage):**

1. Implement the provider interface for the new provider
2. Register the provider in the registry with its category and capabilities
3. Add the provider to the fallback chain for relevant modules
4. Optionally promote it to primary if quality testing confirms superiority
5. Deploy and monitor

**Scenario C — Emergency provider disable (outage or quality failure):**

1. Set `isEnabled: false` for the provider in the registry
2. The health check system automatically routes to fallbacks
3. No code change required — the provider selection algorithm skips disabled providers
4. Restore when the issue is resolved

**Zero-downtime swaps:** Because the Provider Abstraction Layer separates provider implementation from provider selection, swaps are operationally safe. The old provider continues serving requests until the new configuration is deployed. No research job queue entries need modification.

### 7.8 Future Provider Expansion Path

The Provider Abstraction Layer is designed for continuous expansion. The following provider categories and specific integrations are identified for future roadmap phases:

**Analytics Platform Providers (Phase 4 — Q1 2027):**
These providers support the Analytics Integration Layer for live KPI monitoring in Stages 14–15.

| Provider ID | Provider Name | Data Type | Roadmap Phase |
|---|---|---|---|
| `shopify_admin` | Shopify Admin API | Revenue, orders, inventory, customer data | Phase 4 |
| `google_analytics_4` | Google Analytics 4 API | Traffic, conversion, user behavior | Phase 4 |
| `klaviyo_api` | Klaviyo API | Email campaign performance, subscriber data | Phase 4 |
| `mailchimp_api` | Mailchimp API | Email performance | Phase 4 |
| `meta_ads_api` | Meta Ads API | Facebook/Instagram ad performance and ROAS | Phase 4 |
| `google_ads_api` | Google Ads API | Google advertising performance | Phase 4 |
| `amazon_seller_central` | Amazon Seller Central API | Amazon sales performance, reviews, BSR | Phase 5 |

**Professional Directory Providers (Phase 5 — Q2 2027):**

| Provider ID | Provider Name | Data Type | Roadmap Phase |
|---|---|---|---|
| `ipwatchdog_directory` | IPWatchdog Attorney Directory | IP attorney search by specialty | Phase 5 |
| `avvo_api` | Avvo Attorney Search | IP attorney ratings and reviews | Phase 5 |

**CPG-Specific Data Providers (Phase 3 — Q4 2026):**

| Provider ID | Provider Name | Data Type | Roadmap Phase |
|---|---|---|---|
| `usda_api` | USDA Database APIs | Food safety regulatory data | Phase 3 |
| `fda_api` | FDA API | FDA product database, recall history | Phase 3 |
| `cpsc_api` | CPSC API | Consumer product safety records | Phase 3 |

**Adding a new provider type:** Any provider that satisfies the `ResearchProvider` base interface can be registered in the system. Adding a new category requires: (1) defining the category-specific interface extension, (2) implementing the interface for at least one provider, (3) registering the module mappings, and (4) defining the normalization function for the research module. The Research Engine core requires no changes. This architecture supports indefinite provider expansion without architectural limits.

---

## Section 8 — Confidence Framework

### 8.1 Overview and Purpose

Every research result produced by the Atlas Research Engine carries a confidence score. The confidence score is not a vague quality signal — it is a structured, deterministic measurement that drives concrete downstream behaviors: whether the founder must review a result before it is used, whether the result can be auto-accepted, how prominently caveats are displayed, and how Atlas calibrates its own research quality over time.

The confidence framework serves three constituencies:

**The founder:** The confidence score tells the founder how much to trust what Atlas found. High confidence means Atlas is confident and the founder can accept with minimal scrutiny. Low confidence means Atlas is uncertain and the founder's judgment is required before the result is committed.

**The Research Engine:** Confidence scores drive refresh scheduling, fallback triggering, and quality monitoring. A low-confidence result should be refreshed when better data becomes available. A pattern of low-confidence results from a specific provider signals a provider quality issue.

**The Document Pipeline:** Documents assembled from research results carry the confidence of their inputs. The Document Pipeline uses confidence scores to determine whether a document section should be presented as "Atlas's finding" or as "Atlas's estimate — please verify."

### 8.2 Confidence Score Schema

The canonical confidence score is expressed as a float between 0.0 and 1.0, rounded to two decimal places. This is the external and storage representation.

Note: Part 1 of this specification (Section 3.5) uses the equivalent 0–100 integer scale for display purposes. The mapping is: `displayScore = Math.round(confidenceScore * 100)`. The 0.0–1.0 float is the canonical form stored in `researchResults.confidenceScore`.

**Complete confidence record schema:**

```
ConfidenceRecord {
  // Core score
  score: number                    // 0.0–1.0, two decimal places
  label: ConfidenceLabel           // Enum: AUTO_ACCEPT | REVIEW_RECOMMENDED | REQUIRES_REVIEW
  
  // Score components (each 0.0–1.0)
  components: {
    sourceCount: number            // Score for number of distinct sources consulted
    sourceAuthority: number        // Score for source quality and credibility
    resultRecency: number          // Score for data freshness
    coverageCompleteness: number   // Score for how much of the expected output was populated
    internalConsistency: number    // Score for agreement across sources
  }
  
  // Component weights (must sum to 1.0)
  componentWeights: {
    sourceCount: 0.20
    sourceAuthority: 0.25
    resultRecency: 0.20
    coverageCompleteness: 0.20
    internalConsistency: 0.15
  }
  
  // Evidence
  evidenceCount: number            // Total distinct evidence items (sources, citations, data points)
  primarySourceCount: number       // Count of primary sources (official databases, first-party data)
  secondarySourceCount: number     // Count of secondary sources (web content, aggregators)
  sources: SourceReference[]       // Full citation for each source consulted
  
  // Assumptions
  assumptions: AssumptionRecord[]  // Every assumption Atlas made that should be confirmed
  
  // Temporal
  researchedAt: string             // ISO 8601 timestamp of research execution
  dataVintage: string | null       // Date of the oldest data point in the result
  expiresAt: string                // ISO 8601 timestamp when this result becomes stale
  freshnessAt: string              // ISO 8601 timestamp of last freshness confirmation (could be older than researchedAt for incremental updates)
  
  // Transparency annotation
  transparencyLabel: "atlas_researched" | "atlas_inferred" | "atlas_assumed"
  
  // Founder calibration
  founderApprovedAt: string | null // When the founder accepted this result
  founderEdited: boolean           // Whether the founder modified the result
  founderRejected: boolean         // Whether the founder rejected the result
  calibrationWeight: number        // How much this result should contribute to calibration (0.0–1.0)
  
  // Provider
  providersConsulted: string[]     // All providers that contributed to this result
  primaryProviderUsed: string      // The primary provider
  fallbackProviderUsed: string | null  // Fallback provider if primary failed
  
  // Explanations
  confidenceExplanation: string    // Human-readable explanation of the score and its basis
  lowConfidenceReasons: string[]   // Specific reasons why score is below AUTO_ACCEPT, if applicable
  assumptionPrompts: string[]      // Questions the founder should answer to confirm key assumptions
}

SourceReference {
  sourceId: string                 // Internal unique ID for this source
  url: string | null               // URL to the source (if publicly accessible)
  title: string                    // Source title or name
  sourceType: SourceType           // Enum (see Section 8.4)
  publishedDate: string | null     // When this source was published or last updated
  accessedDate: string             // When Atlas accessed this source
  relevanceScore: number           // How relevant this specific source was to the result (0.0–1.0)
  excerpt: string | null           // The specific excerpt or data point Atlas extracted from this source
}

AssumptionRecord {
  assumptionId: string
  statement: string                // The assumption in plain language
  basis: string                    // Why Atlas is making this assumption
  confirmationPrompt: string       // The question to ask the founder to confirm or override
  riskIfWrong: "low" | "medium" | "high"  // How much the result changes if this assumption is wrong
  isConfirmedByFounder: boolean    // Whether the founder has explicitly confirmed this assumption
}
```

### 8.3 Confidence Thresholds and Their Behavioral Implications

The confidence framework defines three named thresholds that drive the Human Review Flow (Section 9) and document assembly behavior.

**Threshold 1 — AUTO_ACCEPT (Score ≥ 0.85)**

A confidence score at or above 0.85 means Atlas is highly confident in the result. The evidence base is strong, sources are authoritative, the result is recent, and internal consistency is high.

Behavioral implications:
- The result is applied to the stage view and document pipeline without requiring explicit founder approval
- The founder sees the result surfaced as "Atlas's finding" with a simple "Looks right / Edit" affordance
- Proceeding past the result without interaction counts as implicit acceptance
- The result is immediately eligible for use in document assembly
- The founder is not interrupted by a review request — the result flows through automatically
- A subtle source citation is shown ("Based on [N sources], researched [date]") but no warning or caveat is displayed

**Threshold 2 — REVIEW_RECOMMENDED (Score 0.60–0.84)**

A confidence score between 0.60 and 0.84 means Atlas has reasonable evidence but meaningful gaps or uncertainties exist. The result is usable but benefits from founder confirmation.

Behavioral implications:
- The result is surfaced in the stage view with a "Please review" indicator
- The founder sees the specific reasons why confidence is below AUTO_ACCEPT (e.g., "Only 2 sources consulted" or "Data is 45 days old")
- The founder is prompted to review key figures with the question: "Do these findings look right? You can confirm, edit, or ask Atlas to research again."
- The result CAN flow into document assembly before founder review — but document sections built from REVIEW_RECOMMENDED results are annotated with "Pending your confirmation" in the document's metadata
- The stage's readiness score is slightly penalized for unconfirmed REVIEW_RECOMMENDED results — not blocked, but not fully credited until confirmed
- If the founder confirms without editing, confidence is upgraded to the confirmed score (see Section 8.7)

**Threshold 3 — REQUIRES_REVIEW (Score < 0.60)**

A confidence score below 0.60 means Atlas lacks sufficient evidence to be confident in this result. The result may be directionally useful but should not be relied upon without founder verification.

Behavioral implications:
- The result is surfaced with an explicit warning indicator
- The founder must actively interact with the result before the stage's readiness score credits the field
- The stage will not reach "Ready to Move Forward" status while REQUIRES_REVIEW results remain unconfirmed
- Document sections that depend on this result are flagged with a "Requires founder confirmation before use" state — they cannot be finalized until the founder acts
- The founder must take one of three explicit actions: confirm, edit, or reject and enter manually
- The specific low-confidence reasons are displayed prominently
- If the research result has assumptions attached, each assumption's confirmation prompt is surfaced explicitly

**Threshold enforcement table:**

| Threshold | Score Range | Auto-Applied | Founder Interruption | Document Gating | Stage Gate Impact |
|---|---|---|---|---|---|
| AUTO_ACCEPT | ≥ 0.85 | Yes | No | None | Full credit |
| REVIEW_RECOMMENDED | 0.60–0.84 | Provisional | Gentle prompt | Annotated as pending | Partial credit until confirmed |
| REQUIRES_REVIEW | < 0.60 | No | Required | Gated — cannot finalize | No credit until founder acts |

### 8.4 Source Classification (Primary vs. Secondary)

Every source Atlas consults is classified as primary or secondary. This classification affects the `sourceAuthority` component of the confidence score.

**Primary Sources (higher weight in sourceAuthority scoring):**

Primary sources are first-party, authoritative, or directly verifiable data.

| Source Type | Description | Examples |
|---|---|---|
| `official_database` | Government or regulatory body database | USPTO, EPO, FDA, US Census Bureau, BLS, SEC EDGAR |
| `official_api` | Official API from a platform or institution | Google Analytics 4, Shopify Admin API (for the founder's own store) |
| `peer_reviewed` | Academic journal or conference paper | PubMed, IEEE, material science journals |
| `verified_platform` | Commerce platform with verified transaction data | Amazon BSR (reflects real purchase behavior), Shopify order data |
| `government_report` | Officially published government statistics or reports | US Census industry reports, USDA data |

**Secondary Sources (lower weight in sourceAuthority scoring):**

Secondary sources are derived, aggregated, or editorially curated content.

| Source Type | Description | Examples |
|---|---|---|
| `industry_report` | Third-party market research publication | Statista, IBISWorld, Grand View Research reports |
| `news_article` | Journalism and editorial coverage | TechCrunch, WSJ, trade publications |
| `brand_website` | Content published by a brand or company | Competitor pricing pages, product specs |
| `forum_community` | User-generated content from forums or communities | Reddit, Quora, Amazon Q&A |
| `review_aggregator` | Review platforms | Amazon reviews, Trustpilot, G2 |
| `web_search_result` | General web content without a more specific classification | Miscellaneous web pages |
| `llm_synthesis` | Content generated by an LLM based on its training data | Used when no external source was consulted; lowest authority |

**sourceAuthority score computation:**

The `sourceAuthority` component is computed as a weighted average of the authority level of all sources consulted, where:
- `official_database` and `official_api` → authority weight 1.0
- `peer_reviewed` and `government_report` → authority weight 0.9
- `verified_platform` → authority weight 0.85
- `industry_report` → authority weight 0.7
- `news_article` and `brand_website` → authority weight 0.5
- `forum_community` and `review_aggregator` → authority weight 0.35
- `web_search_result` → authority weight 0.25
- `llm_synthesis` → authority weight 0.10

If no external sources were consulted (result is pure LLM synthesis with no external retrieval), `sourceAuthority = 0.10` and this is always a REQUIRES_REVIEW result regardless of other component scores.

### 8.5 Scoring Methodology Per Module Type

While the component weights are fixed, the specific signals used to compute each component vary by research module type. The following defines the scoring methodology for each major module category.

---

**Competitive Landscape Module:**

| Component | Scoring Signals |
|---|---|
| sourceCount | ≥ 5 competitors found → 1.0; 3–4 → 0.75; 1–2 → 0.50; 0 → 0.0 |
| sourceAuthority | Weighted by source types of each competitor's data source (brand website = 0.5, Amazon listing = 0.85, news = 0.5) |
| resultRecency | All competitor data < 30 days old → 1.0; some 30–90 days → 0.75; some > 90 days → 0.50 |
| coverageCompleteness | All expected fields populated (name, price, channel, positioning) → 1.0; missing pricing → 0.7; missing channel → 0.8 |
| internalConsistency | Price ranges consistent across sources → 1.0; conflicting prices with no explanation → 0.5 |

**Prior Art Search Module:**

| Component | Scoring Signals |
|---|---|
| sourceCount | ≥ 20 patents reviewed → 1.0; 10–19 → 0.8; 5–9 → 0.6; 1–4 → 0.4; 0 (search error) → 0.0 |
| sourceAuthority | USPTO or EPO official database → 1.0; Google Patents (secondary index) → 0.8; Lens.org → 0.6 |
| resultRecency | Search executed today → 1.0; within 30 days → 0.85; 31–90 days → 0.60; > 90 days → 0.30 |
| coverageCompleteness | All key classification codes searched → 1.0; only keyword search (no classification) → 0.6; single query only → 0.4 |
| internalConsistency | Prior art consistently categorized as relevant or not → 1.0; mixed relevance without explanation → 0.65 |

**Market Size Module:**

| Component | Scoring Signals |
|---|---|
| sourceCount | Multiple independent sources agree → 1.0; single source → 0.5; estimated from component build-up → 0.6 |
| sourceAuthority | Official government or industry association data → 1.0; paid research report → 0.7; web estimate → 0.3 |
| resultRecency | Data from current year → 1.0; 1–2 years old → 0.75; 3–5 years old → 0.40; > 5 years → 0.10 |
| coverageCompleteness | TAM + SAM + SOM all populated with methodology → 1.0; only TAM → 0.5; no SOM → 0.75 |
| internalConsistency | Top-down and bottom-up estimates within 30% of each other → 1.0; within 50% → 0.7; > 50% gap → 0.4 |

**Competitor Pricing Module:**

| Component | Scoring Signals |
|---|---|
| sourceCount | ≥ 3 competitors with prices → 1.0; 2 competitors → 0.75; 1 competitor → 0.50 |
| sourceAuthority | Price from brand's own site or verified marketplace listing → 1.0; estimate from search snippet → 0.5 |
| resultRecency | Prices captured within 24 hours → 1.0; within 7 days → 0.85; within 30 days → 0.65; > 30 days → 0.40 |
| coverageCompleteness | Price, channel, and product name all captured for each competitor → 1.0; price only → 0.7 |
| internalConsistency | Prices consistent with known market positioning → 1.0; outliers present without explanation → 0.7 |

**Trademark Availability Module:**

| Component | Scoring Signals |
|---|---|
| sourceCount | Official database + third-party aggregator searched → 1.0; official only → 0.75 |
| sourceAuthority | USPTO TESS (official) → 1.0; Markify (aggregator) → 0.75 |
| resultRecency | Search executed < 24 hours ago → 1.0; within 7 days → 0.75; within 30 days → 0.50; > 30 days → 0.20 |
| coverageCompleteness | All relevant IC classes searched → 1.0; only primary class → 0.65 |
| internalConsistency | Both sources agree on availability → 1.0; conflicting results → 0.30 (escalate to REQUIRES_REVIEW) |

**Grant Programs Module:**

| Component | Scoring Signals |
|---|---|
| sourceCount | SBIR.gov + Grants.gov + state programs searched → 1.0; federal only → 0.70 |
| sourceAuthority | Official government API data → 1.0; web search results → 0.5 |
| resultRecency | Grant status current → 1.0; last checked > 30 days → 0.6; > 90 days → 0.3 |
| coverageCompleteness | Program name, deadline, amount, eligibility all captured → 1.0; missing deadline → 0.7 |
| internalConsistency | Program details consistent across sources → 1.0; conflicting deadlines → 0.3 |

### 8.6 Evidence Used and Assumptions Made

**Evidence representation:** Every research result's `ConfidenceRecord` includes the complete list of `SourceReference` objects for every source consulted. This is not a summary — every source Atlas touched is listed. The founder can inspect the exact evidence base for any result.

**Minimum evidence requirements by threshold:**

| Threshold | Minimum Primary Sources | Minimum Total Sources |
|---|---|---|
| AUTO_ACCEPT (≥ 0.85) | 1 primary source OR 3+ secondary sources with high consistency | 3 total |
| REVIEW_RECOMMENDED (0.60–0.84) | 0 primary (all secondary acceptable) | 1 total |
| REQUIRES_REVIEW (< 0.60) | No minimum — any result with < 0.60 is REQUIRES_REVIEW regardless | Any |

**Assumption classification:** Atlas makes assumptions when it cannot verify a fact through research but must use a value to proceed. Every assumption is explicitly listed in the result's `assumptions` array with:
- A plain-language statement of the assumption
- The basis for making it (why Atlas assumed this rather than a different value)
- The confirmation prompt (what to ask the founder)
- The risk if wrong (how much the result changes if the assumption is incorrect)

**Common assumption types:**

| Assumption Type | Example | Default Basis |
|---|---|---|
| Geographic market | "Assuming primary market is the United States" | Based on founder's country of residence from profile |
| Product category | "Assuming this is classified as a consumer product rather than a commercial product" | Based on product description |
| Channel preference | "Assuming direct-to-consumer primary channel for Year 1" | Standard assumption for first-time founders without stated preference |
| Price point positioning | "Assuming premium positioning based on material quality described" | Inferred from product description keywords |
| Manufacturing geography | "Assuming Chinese manufacturing for cost modeling" | Standard assumption for physical CPG products unless founder stated preference |

All assumptions with `riskIfWrong: "high"` automatically trigger a REQUIRES_REVIEW result, regardless of other confidence components. High-risk assumptions cannot be silently passed through to document assembly without explicit founder confirmation.

### 8.7 Confidence Degradation Over Time

A result that was accurate when researched becomes less accurate as time passes. The confidence framework implements time-based confidence degradation to reflect this reality.

**Degradation function:**

The stored `confidenceScore` in `researchResults` is the score at time of research. The effective confidence at any later point in time is computed by applying a degradation multiplier:

```
effectiveConfidence(t) = storedScore × degradationMultiplier(t, moduleId)

degradationMultiplier(t, moduleId) = max(minimumFloor, 1.0 - (daysSinceResearch / halfLifeDays))
```

**Half-life values by module category:**

| Module Category | Half-Life (days) | Minimum Floor | Rationale |
|---|---|---|---|
| Competitor Pricing | 14 | 0.20 | Prices change frequently; week-old data degrades quickly |
| Competitive Landscape | 30 | 0.30 | Competitor list changes slowly; occasional new entrants |
| Market Trends | 30 | 0.40 | Trends shift on a monthly scale |
| Trademark Availability | 7 | 0.10 | Trademarks can be filed at any time; rapid degradation |
| Domain/Handle Availability | 3 | 0.05 | Domains and handles can be claimed within hours |
| Market Size | 90 | 0.50 | Market size estimates are valid for quarters, not days |
| Prior Art (patent search) | 30 | 0.50 | New patents file continuously; monthly refresh is appropriate |
| Regulatory Requirements | 180 | 0.60 | Regulations change infrequently but significantly when they do |
| Manufacturer Shortlist | 60 | 0.40 | Manufacturers open, close, and change specializations |
| Grant Programs | 30 | 0.20 | Grant cycles open and close on monthly or quarterly cycles |

**Degradation in the UI:** When the founder views a stage, the displayed confidence is the `effectiveConfidence(now)` — not the stored score from research time. If effective confidence has degraded below a threshold that the original research score exceeded (e.g., it started as AUTO_ACCEPT but has degraded to REVIEW_RECOMMENDED), the UI transitions the result's treatment to the lower threshold's behavior. The founder sees: "This research was last updated [N days ago]. The confidence has decreased with time. Atlas can refresh it now."

**Degradation does not delete results:** A degraded result is still served to the founder — it is not removed from the cache. Degradation changes the confidence label and triggers a background refresh job, but the old result remains available until a fresh result replaces it.

### 8.8 How Founder Approval Affects Confidence Calibration

When a founder approves, edits, or rejects a research result, this action is a data signal about the quality of Atlas's research for that module. Over time, these signals calibrate Atlas's confidence scoring so that scores become more accurate — closer to what the founder actually confirms as correct.

**Founder approval signal types:**

| Action | Signal Type | Calibration Effect |
|---|---|---|
| Founder accepts without editing | Positive confirmation | Research result and score were appropriate; calibration weight += positive |
| Founder accepts with minor edits (< 10% of fields changed) | Weak confirmation | Result was substantially correct; minor adjustment needed |
| Founder accepts with major edits (≥ 10% of fields changed) | Mixed signal | Result was directionally correct but significantly off in specifics |
| Founder rejects and enters manually | Negative signal | Result was wrong or insufficient for this module/context |
| Founder requests re-run (doesn't reject, just wants fresher data) | Neutral — freshness signal | Result was probably correct but founder wanted confirmation of currency |

**Calibration storage:**

Each research result in `researchResults` has a `calibrationWeight` field (0.0–1.0) that is set when founder review occurs. This weight reflects how informative this specific approval event was (high weight for clear accept/reject; lower weight for ambiguous cases).

A `moduleCalibration` table stores per-module calibration records:

```
moduleCalibration {
  moduleId: string
  sampleCount: number            // Total founder review events for this module
  positiveConfirmationRate: number  // Fraction of results confirmed without major edit
  averageScoreOnConfirm: number  // Average confidence score for confirmed results
  averageScoreOnReject: number   // Average confidence score for rejected results
  scoreAdjustmentFactor: number  // Derived multiplier to apply to raw scores for this module
  lastUpdated: string
}
```

**Score adjustment application:**

When a raw confidence score is computed for a module with calibration data:

```
calibratedScore = min(1.0, rawScore × scoreAdjustmentFactor)
```

If Atlas consistently over-estimates confidence (results are rejected despite high scores), `scoreAdjustmentFactor` < 1.0 brings scores down. If Atlas under-estimates (results are accepted even when scored low), `scoreAdjustmentFactor` > 1.0 brings scores up.

**Calibration thresholds for adjustment:** The `scoreAdjustmentFactor` is only applied when `sampleCount ≥ 20`. Below 20 samples, raw scores are used without adjustment. This prevents calibration from being biased by small sample noise.

**Calibration is per-module, not per-founder:** Calibration data is pooled across all founders for a given module. Individual founder preferences (e.g., a founder who always edits everything) are not learned at the individual level — this would introduce personal bias into a system that should reflect ground-truth research quality.

---

## Section 9 — Human Review Flow

### 9.1 Overview

The Human Review Flow defines how research results transition from Atlas-produced outputs to founder-confirmed data that drives stage progress and document assembly. It is the implementation of one of Atlas's core constitutional principles: Atlas does the work, the founder reviews the work.

The goal of the Human Review Flow is to make review as effortless as possible for high-quality results while ensuring the founder's judgment is captured for results where it matters. A founder who agrees with a high-confidence result should be able to confirm it with a single interaction — or no interaction at all. A founder who needs to correct a low-confidence result should have clear tools to do so without friction.

The Human Review Flow is governed by two complementary principles:
- **Minimize unnecessary interruptions.** Do not ask the founder to review results that are clearly correct. AUTO_ACCEPT results flow through without interruption.
- **Ensure consequential decisions are made consciously.** REQUIRES_REVIEW results must be actively confirmed before they are used. The founder's attention is finite and precious — but for low-confidence research, that attention is genuinely required.

### 9.2 What Triggers a Review Request

A review request is surfaced to the founder when any of the following conditions are true:

**Condition 1 — REQUIRES_REVIEW result for a stage-gating field:**
A research result has `effectiveConfidence < 0.60` AND the result populates a field that is required for the stage to advance. The review request is blocking — the stage cannot reach "Ready to Move Forward" until the founder acts.

**Condition 2 — REVIEW_RECOMMENDED result for a featured stage field:**
A research result has `effectiveConfidence` between 0.60 and 0.84 AND the result populates a prominently featured field in the stage view. The review request is non-blocking but prominent — the founder sees the recommendation to review and can proceed without acting, but it is surfaced clearly.

**Condition 3 — High-risk assumption present:**
A research result contains one or more `AssumptionRecord` entries with `riskIfWrong: "high"`. These trigger review regardless of the overall confidence score. Even a 0.90-scored result that contains a high-risk assumption must surface the assumption for founder confirmation.

**Condition 4 — Research result directly conflicts with prior founder-provided data:**
If a research result produces a finding that directly contradicts information the founder has previously entered or confirmed (e.g., Atlas researches competitor pricing and finds a price that matches the founder's current stated price, but the competitive landscape shows a major new competitor the founder has not acknowledged), a review request is generated to surface the conflict.

**Condition 5 — Scheduled research produces a material change:**
A scheduled research refresh (Section 4, scheduledResearch hook) produces a result that differs materially from the previously approved version. "Materially different" is defined per module — for competitive pricing, a change of ≥ 15% in any competitor's price; for the competitive landscape, a net-new competitor added or a known competitor removed.

**Condition 6 — Founder has explicitly indicated they want to review:**
The founder can opt into "Always review research for this stage" in their stage settings. When this flag is set, all research results for that stage trigger review requests regardless of confidence level.

### 9.3 How Results Are Surfaced to the Founder

Research results are surfaced in the stage view UI. The surfacing pattern depends on the confidence threshold:

**AUTO_ACCEPT surfacing:**

The result appears in the stage view as a populated field or structured data block with:
- The finding displayed clearly in Atlas's standard research card format
- A source attribution line: "Atlas researched this based on [N sources] — [timeframe]"
- A subtle "Edit" affordance — visible on hover, not primary
- No explicit review prompt
- A small confidence indicator (green dot) visible in the card header
- The founder can proceed without interacting with this card at all

**REVIEW_RECOMMENDED surfacing:**

The result appears in the stage view as a populated field or data block with:
- The finding displayed in the research card format
- An amber indicator and label: "Review recommended"
- A brief explanation of why review is recommended: "Confidence is moderate — 2 sources consulted. Please verify these findings match your knowledge."
- Two primary actions: "Looks right, confirm" and "Edit this"
- A secondary action: "Ask Atlas to research again"
- Source details expanded by default (not collapsed behind a link)
- The stage's readiness score shows partial credit for this field until confirmed

**REQUIRES_REVIEW surfacing:**

The result appears in the stage view as a populated field or data block with:
- The finding displayed with a red/warning indicator and label: "Your review is required"
- A prominent explanation of the low confidence: the specific reasons why Atlas is uncertain
- The list of assumptions made, with each high-risk assumption presented as a direct question: "Atlas assumed [X]. Is this correct?"
- Three primary actions: "Confirm this is right", "Edit and confirm", "This is wrong — let me enter it"
- A secondary action: "Ask Atlas to research this again"
- A notice: "This stage cannot advance until you've confirmed this finding"
- The field is highlighted in the stage's completion checklist as requiring action

**Notification behavior:**

For scheduled research that produces material changes, the founder is notified via an in-app notification (surfaced in the notification bell or equivalent indicator), not via email. The notification reads: "[Module name] research has been updated. [Change summary]. Your previous approval may no longer be current — please review." Clicking the notification takes the founder directly to the relevant stage view.

Email notifications for review requests are reserved for:
- High-risk IP deadline alerts (provisional patent deadline approaching)
- Public disclosure statutory bar countdown alerts
- Cases where the founder has been inactive for > 7 days and has pending REQUIRES_REVIEW items blocking stage progress

### 9.4 Automatic Acceptance Rules

Automatic acceptance is the mechanism by which high-quality research results flow into the stage and document pipeline without interrupting the founder. Automatic acceptance occurs when ALL of the following conditions are met:

**Rule 1 — Confidence at AUTO_ACCEPT threshold:**
`effectiveConfidence ≥ 0.85` at the time the result is surfaced to the founder.

**Rule 2 — No high-risk assumptions:**
The result's `assumptions` array contains no `AssumptionRecord` entries with `riskIfWrong: "high"`.

**Rule 3 — No conflict with prior founder data:**
The result does not contradict any founder-confirmed data from prior stages.

**Rule 4 — Module is auto-acceptance eligible:**
Certain research modules are marked as requiring explicit founder approval regardless of confidence level, because the stakes are too high for automatic acceptance. The following modules are NOT auto-acceptance eligible even at 0.85+:

| Module | Reason Auto-Acceptance is Excluded |
|---|---|
| Prior Art Search | IP strategy decisions based on prior art have irreversible legal implications |
| IP Strategy Recommendation | The filing decision itself cannot be made automatically |
| Go/No-Go Recommendation | The Stage 2 advancement decision is constitutionally the founder's |
| Pricing Recommendation | Setting the price is a strategic business decision |
| Funding Strategy | Investor selection and equity terms require founder judgment |

**Rule 5 — Founder has not disabled auto-acceptance:**
If the founder has opted into "Always review research for this stage," auto-acceptance is disabled for that stage.

**When automatic acceptance triggers:**

If all five rules are satisfied, the result is automatically accepted when one of the following occurs:
- The founder advances past the stage section containing the result (implicit acceptance by progression)
- The founder clicks "Continue" or advances to a new section within the stage
- 24 hours pass after the result was surfaced without the founder taking a negative action (rejection or edit)

Automatic acceptance sets `founderReviewedAt` to the acceptance timestamp and `founderEdited: false`. It is recorded in the audit trail as `"auto_accepted"` with the trigger reason.

### 9.5 Founder Approval Workflow

When a research result requires explicit approval (REVIEW_RECOMMENDED or REQUIRES_REVIEW thresholds, or a non-auto-acceptance-eligible module), the founder goes through the approval workflow.

**Step 1 — Review presentation:**
The founder opens (or is navigated to) the stage view where the result is surfaced. The result is presented according to the surfacing pattern described in Section 9.3.

**Step 2 — Founder reads the result:**
The founder reads the research finding, the sources cited, the assumptions made, and the confidence explanation. All of this is visible in the expanded research card.

**Step 3 — Founder evaluates the result:**
The founder considers whether the result is correct, complete, and consistent with what they know. For competitive landscape results, they ask: "Are these the right competitors? Are the prices accurate? Is anything missing?" For prior art results, they ask: "Do these patents actually look similar to my invention?"

**Step 4 — Founder selects an action:**
The founder selects from the available approval actions (see Section 9.6 for edit workflow, Section 9.7 for rejection workflow). For simple approval:
- The founder clicks "Confirm this is right" (or equivalent)
- The `founderReviewedAt` field is set to the current timestamp
- `founderEdited: false` is recorded
- The action is logged in the audit trail as `"founder_approved"`

**Step 5 — Result transitions to approved state:**
After approval:
- The result's effective confidence is upgraded (see Section 8.7 for calibration effect)
- Document sections dependent on this result transition from "pending confirmation" to "ready for assembly"
- The stage's readiness score credits the field fully
- The calibration record for this module is updated with a positive confirmation signal

**Approval chain for multi-result stages:**

Some stages have multiple research results that all require review. The stage view presents these in a logical sequence — the most foundational results first (e.g., competitive landscape before competitor pricing, which depends on it). The founder works through the sequence, approving each. The stage's completion indicator tracks how many review-required results remain unconfirmed.

### 9.6 Founder Edit Workflow (Partial Acceptance)

When a founder finds that a research result is partially correct — some findings are right, others need adjustment — the edit workflow allows them to accept the parts that are right while modifying the parts that are wrong.

**What the founder can edit:**

The research card UI presents the processed result as a structured, editable form where each field can be modified independently. For example:
- In the Competitive Landscape module: each competitor row (name, price, channel, positioning) is individually editable. The founder can accept competitors Atlas found correctly and correct prices that are out of date.
- In the Market Size module: each TAM/SAM/SOM value is editable. The founder can accept the TAM from Atlas's research but override the SOM with their own more specific estimate.
- In the Prior Art Search module: each patent result's relevance classification is editable. The founder can agree with "highly relevant" on some patents and downgrade others to "not relevant."

**How edits are stored:**

When the founder edits a research result:
1. The original Atlas-generated values are preserved in `rawResult` and `processedResult` — never overwritten
2. The founder's modifications are stored in `founderOverride` as a delta object — only the fields the founder changed are stored, not the full result
3. The downstream consumers (document pipeline, stage view) merge the override onto the base result: `mergedResult = { ...processedResult, ...founderOverride }`
4. `founderEdited: true` is set
5. The audit trail records `"founder_edited"` with the specific fields changed and their before/after values

**Partial acceptance and confidence:**

When the founder edits a research result, the effective confidence of the edited fields is elevated to 1.00 — the founder has confirmed those values directly. The effective confidence of unedited fields retains the original Atlas confidence score (post-calibration adjustment). This means a partially edited result can have field-level confidence heterogeneity — some fields founder-confirmed at 1.0, others at Atlas-scored confidence.

**Downstream treatment of edited results:**

Documents assembled from an edited research result annotate edited fields with `source: "founder_confirmed"` rather than `source: "atlas_research"`. This matters for document audit purposes — the investor pitch deck's market size figure shows whether the number came from Atlas's research or from the founder's direct input.

**Override persistence:**

Once the founder edits a result, the override persists across all future refreshes of that research module. When a scheduled or manual refresh produces a new version of the result, the founder's override is shown alongside the new Atlas result as a comparison: "Atlas now finds [new value]. You previously set this to [override value]. Do you want to update your override?"

The founder's override is NEVER automatically replaced by a new Atlas result, even if the new result has higher confidence. The founder's confirmed data is always preserved.

### 9.7 Founder Rejection and Research Re-Run

When a founder rejects a research result — either because it is completely wrong, useless, or simply not trusted — they trigger the rejection and re-run workflow.

**Rejection triggers:**

- Founder clicks "This is wrong — ask Atlas to research again" (automated re-run)
- Founder clicks "This is wrong — I'll enter this myself" (manual override, no re-run)
- Founder clicks "Reject this result" from the review menu

**Rejection actions available:**

| Action | What Happens |
|---|---|
| "Research this again" | Triggers a `manualRefresh` job at Priority Level 1. The current result is marked with `founderRejected: true` but remains visible (with a "Rejected — refreshing" indicator) until the new result arrives. |
| "I'll enter this myself" | Triggers the manual override path (Section 9.8). No re-run is initiated. |
| "Research this differently" | Opens a prompt where the founder can provide context to Atlas: "The competitors you found are not the right ones — I'm competing more in the premium segment." This context is incorporated into the next research job's parameters. |

**Re-run behavior after rejection:**

When a re-run is triggered by rejection:
1. A new queue entry is created with the `manualRefresh` trigger event
2. If the founder provided additional context ("Research this differently"), that context is appended to the research module's input parameters for this job only
3. The job runs at Priority Level 1 (user-interactive priority)
4. When the new result arrives, it is presented to the founder for review — rejecting a result does not create an automatic acceptance loop
5. The founder's rejection is noted in the calibration record for this module (negative signal)

**If the re-run also produces a poor result:**

If the founder rejects a re-run result as well, the system surfaces the "I'll enter this myself" option more prominently. After two rejections, Atlas acknowledges: "I wasn't able to find reliable information on this. You can enter the data directly, and I'll use what you provide going forward."

This graceful degradation is a constitutional requirement: the founder's journey must never be blocked by Atlas's inability to find data. Rejection → re-run → rejection → manual entry is always available as an escape path.

### 9.8 Manual Overrides (Founder Provides Their Own Data)

Manual overrides allow the founder to provide their own data for a research field, superseding Atlas's research entirely. This is used when:
- The founder has direct, personal knowledge that is more accurate than what Atlas found
- Atlas's research repeatedly fails to find useful data
- The data is private or proprietary (e.g., the founder has a manufacturing relationship that gave them pricing not publicly available)
- The founder simply prefers to control specific data points directly

**Manual override entry:**

When the founder selects "I'll enter this myself," the stage view transitions the research card from "Atlas-generated result" view to an editable form matching the module's output schema. The founder fills in their own values.

**Manual override storage:**

Manual override data is stored in `founderOverride` with a special flag: `isManualOverride: true`. This distinguishes manual overrides (founder supplied the data) from edit overrides (founder corrected Atlas's data).

**Manual override precedence:**

Manual overrides are the highest-precedence data in the system. No Atlas research, scheduled refresh, or automatic update can displace a manual override. The only way to remove a manual override is for the founder to explicitly clear it.

When Atlas runs a scheduled research refresh for a module that has a manual override:
1. Atlas runs the research and stores the new result
2. The manual override remains active — the new result does not replace it
3. The founder receives a notification: "Atlas has updated its research for [module name]. Your manually entered data is still being used. You can view Atlas's findings and decide whether to update your data."
4. The founder can choose to adopt the new Atlas result, update their manual data, or keep the current manual data unchanged

This ensures the founder always knows when new data is available while preserving their authority over their own overrides.

**Override persistence against re-research:**

A manual override is a signal to the Research Engine that the founder has made an authoritative decision about this data point. The Research Engine interprets this as: "Do not ask again without a specific reason."

The specific protection rules:
- Stage lifecycle hooks (onOpen, onStageEnter) do NOT enqueue research jobs for modules that have active manual overrides for stage-gating fields
- Scheduled research jobs still run for override-protected modules — but their results are stored and surfaced for comparison, not applied
- Manual refresh (founder-initiated) still runs for override-protected modules — the founder is explicitly asking to see new data
- If a manual override is more than 90 days old, the stage view surfaces a gentle notification: "Your manually entered [field name] data is over 90 days old. Want Atlas to see if anything has changed?" — but this notification is informational only; it does not require action.

### 9.9 Audit Trail for All Founder Decisions

Every founder interaction with a research result is recorded in a permanent audit trail. This audit trail serves three purposes:

1. **Transparency:** The founder can always see the history of any data point — what Atlas found, what they changed, when they changed it, and why.
2. **Calibration:** The audit trail is the data source for the confidence calibration system (Section 8.8).
3. **Compliance and accountability:** For high-stakes research (IP, pricing, legal compliance), having a record of what was researched, when, and what the founder confirmed provides a defensible record of due diligence.

**Audit event schema:**

```
ResearchAuditEvent {
  eventId: string                  // Unique ID for this event
  inventionId: Id<"inventions">    // Which invention
  moduleId: string                 // Which research module
  resultVersion: number            // Which version of the research result this event relates to
  
  eventType: AuditEventType        // Enum (see below)
  
  // Actor
  actorType: "founder" | "atlas_system" | "scheduled_job"
  founderId: Id<"users"> | null    // Set if actorType is "founder"
  
  // Timing
  eventAt: string                  // ISO 8601 timestamp
  
  // What happened
  previousValue: any | null        // The value before this event (null for new research)
  newValue: any | null             // The value after this event (null for deletions)
  changedFields: string[] | null   // Which fields changed (for edit events)
  
  // Context
  triggerReason: string | null     // Why this event occurred (e.g., "founder_requested_rerun", "scheduled_refresh")
  founderNote: string | null       // Any note the founder left when editing or rejecting
  confidenceAtEvent: number        // Confidence score at the time of this event (0.0–1.0)
  
  // Session
  sessionId: string | null         // Founder's session at time of event (for grouping related actions)
}

AuditEventType = 
  | "research_completed"           // Atlas completed a research job and stored a result
  | "auto_accepted"                // System automatically accepted a high-confidence result
  | "founder_viewed"               // Founder opened the stage view where this result is surfaced
  | "founder_approved"             // Founder explicitly approved without editing
  | "founder_edited"               // Founder approved with modifications
  | "founder_rejected_rerun"       // Founder rejected and requested a re-run
  | "founder_rejected_manual"      // Founder rejected and entered manually
  | "founder_override_entered"     // Founder provided manual override data
  | "founder_override_updated"     // Founder updated a manual override
  | "founder_override_cleared"     // Founder removed a manual override and restored Atlas's result
  | "scheduled_refresh_available"  // A scheduled refresh produced a new result; founder notified
  | "refresh_adopted"              // Founder adopted a scheduled refresh result to replace their previous data
  | "refresh_dismissed"            // Founder viewed a scheduled refresh result but kept their prior data
```

**Audit log retention:** Audit events are retained for the lifetime of the invention record plus 7 years. They are never deleted as part of normal system operations. Deletion occurs only when the founder explicitly deletes their account and all associated data (GDPR-compliant deletion).

**Founder access to audit history:** The founder can access the full audit history for any research result from the stage view by clicking "Research history" on any research card. The history view shows a timeline of all events: when Atlas researched it, what it found, when the founder viewed it, what they did with it, and when it was refreshed.

**Internal use of audit data:** The audit trail is also used by Atlas's internal monitoring (Section 10) for detecting patterns in founder engagement with research, identifying modules with high rejection rates (which signals quality issues), and tracking the overall Auto-Accept Rate as a system health metric.

---

## Section 10 — Security, Privacy, Rate Limiting, Cost Controls

### 10.1 Overview

The Research Engine makes external API calls on behalf of Atlas users. These calls involve sensitive data (the founder's invention details), financial cost (paid API calls), and operational risk (rate limit violations, budget overruns, provider outages). This section defines the architecture for managing all of these responsibly.

The security and cost architecture of the Research Engine is guided by four principles:

1. **Confidentiality:** Inventor data is the founder's intellectual property. The minimum necessary data leaves Atlas's environment. Data that must leave is anonymized where possible.
2. **Least privilege:** API credentials are scoped to the minimum necessary permissions. No key has more access than the specific operations it serves.
3. **Defense in depth:** Cost and rate limit protections are enforced at multiple levels — per-request, per-stage, per-invention, per-month — so that a failure at any one level does not cause catastrophic overrun.
4. **Full auditability:** Every API call, its cost, and its context is logged and queryable. No spending is unaccounted for.

### 10.2 API Key Management

**Core rule: API keys are never in the frontend.**

All provider API keys are server-side secrets. They are stored in the deployment platform's environment variable management system (Vercel environment variables for this project) and accessed only by Convex backend code running in Convex Actions. API keys are never:
- Included in any client-side bundle
- Sent to the browser
- Stored in Convex's document database
- Logged in plaintext in any log output
- Included in Convex query or mutation return values
- Passed through any path that could be read by the founder's browser session

**Key storage architecture:**

```
Convex Actions (use node) → read process.env.PROVIDER_API_KEY_XXXX
                         ↓
    Provider HTTP calls are made server-side, within Convex's action runtime
                         ↓
    Raw API responses are stored in researchResults (no credential data)
                         ↓
    Processed results are returned to Convex mutations and stored
                         ↓
    Founder's browser reads processed results via Convex queries (no credentials ever sent)
```

**Key naming conventions (environment variable names):**

| Variable Name | Provider | Notes |
|---|---|---|
| `BRAVE_SEARCH_API_KEY` | Brave Search | Web search primary |
| `SERPAPI_API_KEY` | SerpAPI | Multiple provider capabilities via one key |
| `USPTO_API_KEY` | USPTO Patent Full-Text API | Patent search |
| `EPO_OPS_CLIENT_ID` | EPO Open Patent Services | EP/PCT patent search |
| `EPO_OPS_CLIENT_SECRET` | EPO Open Patent Services | Paired with CLIENT_ID |
| `MARKIFY_API_KEY` | Markify | Trademark search |
| `NAMECHEAP_API_KEY` | Namecheap Domain API | Domain availability |
| `NAMECHEAP_USERNAME` | Namecheap Domain API | Paired with API key |
| `ANTHROPIC_API_KEY` | Anthropic Claude | LLM synthesis |
| `OPENAI_API_KEY` | OpenAI | LLM fallback |
| `PERPLEXITY_API_KEY` | Perplexity | Research synthesis |
| `STATISTA_API_KEY` | Statista | Market data |
| `SEMRUSH_API_KEY` | SEMrush | SEO/keyword data |
| `KEEPA_API_KEY` | Keepa | Amazon price history |
| `RANGEME_CLIENT_ID` | RangeMe | Retail buyer contacts |
| `RANGEME_CLIENT_SECRET` | RangeMe | Paired OAuth credentials |
| `FAIRE_CLIENT_ID` | Faire | Wholesale buyer contacts |
| `FAIRE_CLIENT_SECRET` | Faire | Paired OAuth credentials |

**Key rotation policy:**

- Provider API keys are rotated on a quarterly schedule or immediately upon any suspected compromise
- Key rotation requires no code changes — only environment variable updates and redeployment
- Old keys remain active for 24 hours after rotation to allow in-flight requests to complete
- Key rotation events are logged to the audit system (Section 10.9)

**Per-provider key scoping:**

Where providers offer scoped API keys (permissions limited to specific operations), Atlas uses the most restrictive scope that covers the operations needed. For example:
- Shopify Admin API keys are scoped to read-only access for the analytics integration — no write permissions
- OAuth tokens for analytics providers (GA4, Klaviyo) use the minimum OAuth scopes required for read access to performance data

### 10.3 Data Privacy — What Inventor Data Leaves Atlas

Inventor data is the inventor's intellectual property. Every external API call that Atlas makes on an inventor's behalf transmits some form of the inventor's data to a third-party provider. This section defines what leaves Atlas, when it leaves, and what protections are applied.

**Data that leaves Atlas in research requests:**

| Data Type | Transmitted To | Anonymization Applied | Retention at Provider |
|---|---|---|---|
| Product description (used to generate search queries) | Web search providers (Brave, SerpAPI) | Transformed into a search query — not sent verbatim; query construction strips founder-identifying context | Provider's standard retention (varies by provider) |
| Technology keywords (for patent search) | USPTO API, SerpAPI Google Patents, EPO OPS | Sent as keyword query — no inventor identity attached | Provider's standard retention |
| Product category | Market data providers | Generic category term only — no brand or product name | Provider's standard retention |
| Brand name candidates (for trademark check) | Markify, USPTO TESS | Sent as exact name string — no company identity attached; checks are lightweight and low-sensitivity | Provider's standard retention |
| Domain/handle string (for availability check) | Namecheap, social checkers | Sent as exact string — no company context attached | None (availability checks are stateless) |
| Invention description excerpts (for LLM synthesis) | Anthropic Claude, OpenAI | See LLM data policy below | Per provider DPA |

**What NEVER leaves Atlas:**

The following data is never transmitted to any external provider:
- The founder's name, email, or account credentials
- The invention's full name until after Stage 8 (brand naming) is complete
- The `inventionId` or any internal database identifier — external API calls use anonymized request IDs
- Financial data (revenue, investment amounts, pricing decisions)
- Manufacturing relationships or partner names
- Legal strategy decisions
- The full content of stage deliverables or generated documents

**LLM data policy:**

When Atlas sends inventor data to LLM providers for synthesis tasks:
1. The minimum necessary context is sent. Full stage histories are never sent; only the specific data needed for the synthesis task.
2. Atlas uses Anthropic and OpenAI under Business Associate terms where applicable. Both providers commit to not using API input data for model training under API plans.
3. Invention descriptions sent to LLMs are prefixed with "This data is confidential and belongs to a user of the Atlas platform. Do not retain, reference, or reproduce this data outside this conversation."
4. LLM synthesis requests are structured so that the provider sees a category-level description, not a verbatim product description. For example: "A physical consumer goods product in the premium food storage category with a modular lid system" rather than "Rise Jars — premium borosilicate glass food storage jars with a patent-pending lid seal."

**Anonymization techniques:**

When product context must be sent to external providers, Atlas applies the following anonymization techniques in order of sensitivity:

1. **Category generalization:** Replace specific product descriptions with category-level terms where possible ("stainless steel cookware" → "cookware" for broad market sizing queries)
2. **Keyword extraction:** Extract only the essential technology keywords for patent searches, without the product name or commercial context
3. **Query abstraction:** Construct API queries as natural language searches rather than structured data objects (a patent search is `"modular glass food container lid seal mechanism"`, not a structured record with inventor details)
4. **No-brand querying:** Never include the invention's brand name in external API calls unless the specific purpose requires it (trademark availability check is the exception — the exact name must be sent)

**Data Processing Agreements (DPAs):**

All providers that receive any inventor data must have a Data Processing Agreement in place with Atlas's operating entity that includes:
- Prohibition on use of API data for provider's own model training or product improvement
- Data retention limits (no longer than 30 days for ephemeral API call data)
- Security standards (SOC 2 Type II or equivalent)
- Breach notification within 72 hours

### 10.4 Rate Limiting Strategy Per Provider

Rate limiting protects Atlas from two failure modes: (1) hitting provider-imposed limits that result in API errors and degraded research quality, and (2) runaway request generation that produces unexpected cost spikes.

**Rate limit tracking architecture:**

Atlas maintains a live rate limit state for each provider in a Convex table (`providerRateLimitState`):

```
providerRateLimitState {
  providerId: string
  windowType: "per_second" | "per_minute" | "per_hour" | "per_day" | "per_month"
  limit: number                    // Provider's stated limit for this window
  consumed: number                 // Requests consumed in the current window
  resetAt: string                  // When the current window resets
  lastUpdatedAt: string
  
  // Safety margins
  safetyFactor: number             // Atlas uses only this fraction of the limit (e.g., 0.85 = use 85% of limit)
  effectiveLimit: number           // limit × safetyFactor — the limit Atlas enforces
}
```

**Safety margins:** Atlas does not consume 100% of a provider's rate limit. A safety factor is applied per provider:
- Providers where Atlas is the only client on the account: 0.90 safety factor (use up to 90% of limit)
- Providers where multiple Atlas environments share a key (development + staging + production): 0.50 safety factor
- Providers with strict per-minute limits (where exceeding is disruptive): 0.75 safety factor

**Rate limit tracking sources:**

Rate limit state is updated from two sources:
1. **Provider response headers:** Most providers return rate limit headers in every response (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`). Atlas reads these on every response and updates the `providerRateLimitState` record.
2. **Internal tracking:** For providers that do not return rate limit headers, Atlas tracks its own request counts against the known limits from the provider's documentation.

**Rate limit enforcement in the queue:**

The Research Queue's dispatcher enforces rate limits before dispatching a job:

1. Query `providerRateLimitState` for the target provider
2. If `consumed ≥ effectiveLimit` for the current window, hold the job in queue with status `"rate_limit_hold"` and set `scheduledFor` to the window reset time
3. If `consumed < effectiveLimit`, proceed with dispatch and increment `consumed`

**Per-provider rate limit defaults:**

| Provider | Window | Provider Limit | Atlas Effective Limit (85%) | Strategy |
|---|---|---|---|---|
| Brave Search | Per month | 2,000 free / 10,000 paid | 8,500 per month | Paid plan; reserve capacity for P1/P2 jobs |
| SerpAPI | Per month | 5,000 per plan | 4,250 per month | Monitor closely; escalate plan as volume grows |
| USPTO PTAS | Per day | 500 requests | 425 per day | Low limit; batch queries aggressively |
| EPO OPS | Per week | 2,500 requests | 2,125 per week | OAuth refresh handles resets |
| Anthropic Claude Sonnet | Per minute | 4,000 tokens/min (Tier 1) | 3,400 tokens/min | LLM calls are token-budgeted individually |
| Anthropic Claude Haiku | Per minute | 50,000 tokens/min (Tier 1) | 42,500 tokens/min | Prefer Haiku for high-volume low-complexity |
| Markify | Per month | Varies by plan | 85% of plan | Review monthly; adjust plan as needed |
| Namecheap Domain API | Per second | 20 requests | 17 per second | Burst protection; stagger batch checks |

**Rate limit violation handling:**

If a rate limit is hit unexpectedly (provider returns 429 before Atlas's internal counter expected it):
1. Update `providerRateLimitState` immediately with the `Retry-After` header value (or 60 seconds if no header)
2. Mark the current job as `"rate_limited"` and re-enqueue with the retry scheduled for the reset time
3. Trigger provider fallback evaluation (is another provider available for this module?)
4. Log the unexpected rate limit hit to the monitoring system (anomaly alert if it occurs more than twice in an hour)

### 10.5 Per-Invention Cost Budgets

Each invention has a cost budget that limits how much the Research Engine can spend on API calls for that invention's research across its lifetime.

**Default per-invention research budget:** $15.00 USD (1,500 cents) across the full 15-stage journey.

This budget is designed to cover:
- Full prior art search across 5 query variations: ~$0.25
- Competitive landscape research at 5 stage hooks: ~$0.50
- Market data research: ~$0.75
- All trademark and domain availability checks: ~$0.30
- All LLM synthesis calls across 15 stages: ~$3.00
- Competitor pricing research (monthly for 12 months): ~$1.80
- All other research modules combined: ~$4.40
- Scheduled monitoring over 12 months: ~$4.00

**Budget configuration:**

```
inventionCostBudget {
  inventionId: Id<"inventions">
  totalBudgetCents: number         // Default: 1500 ($15.00)
  spentCents: number               // Running total of all research costs for this invention
  remainingCents: number           // totalBudgetCents - spentCents
  
  // Stage-level tracking
  stageBudgets: Map<number, StageCostRecord>  // stageId → cost record
  
  // Budget tier
  budgetTier: "standard" | "expanded" | "unlimited"  // Based on founder's subscription tier
  tierBudgetCents: number          // The budget for this tier
  
  // Status
  budgetStatus: "healthy" | "approaching_limit" | "at_limit" | "exhausted"
  alertsSent: string[]             // Which alert thresholds have already been triggered
}
```

**Budget tiers by subscription:**

| Subscription Tier | Research Budget Per Invention |
|---|---|
| Free / Trial | $5.00 (500 cents) |
| Standard | $15.00 (1,500 cents) — default |
| Pro | $40.00 (4,000 cents) |
| Enterprise | $150.00 (15,000 cents) |

**What counts toward the budget:**

Every external API call made by a Research Engine background worker is tracked against the invention's budget. This includes:
- Web search queries
- Patent database queries
- LLM synthesis calls (token-based pricing)
- Trademark and domain availability checks
- Market data API calls

What does NOT count toward the per-invention budget:
- Founder-connected platform reads (Shopify, GA4 — these are covered by the analytics integration's separate billing)
- Internal Convex computation (Convex billing is handled separately at the platform level)
- Health check pings to providers

### 10.6 Per-Stage Cost Caps

In addition to the per-invention lifetime budget, each stage has a cost cap that limits spending on a single stage's research.

**Default per-stage cost caps:**

| Stage | Cap (cents) | Rationale |
|---|---|---|
| Stage 1 — Idea Capture | 25 | Light research; web search only |
| Stage 2 — Validation | 50 | Community research; review sentiment |
| Stage 3 — Market Research | 150 | Most expensive market data stage |
| Stage 4 — Patent Readiness | 200 | Prior art search is the most expensive research task in Atlas |
| Stage 5 — Product Design | 75 | Regulatory and material research |
| Stage 6 — Prototype | 50 | Vendor research |
| Stage 7 — Manufacturing | 100 | Manufacturer research and compliance data |
| Stage 8 — Branding | 100 | Trademark + domain + handle checks across 20 candidates |
| Stage 9 — IP Protection | 50 | Attorney directory research; lower cost stage |
| Stage 10 — Pricing | 75 | Competitive pricing research |
| Stage 11 — Marketing | 150 | Channel benchmarks + influencer research |
| Stage 12 — Sales | 75 | Retail buyer research |
| Stage 13 — Funding | 100 | Grant database + comparable raises |
| Stage 14 — Launch | 50 | Launch timing research |
| Stage 15 — Growth | 200 | Ongoing monitoring (monthly over 12 months) |

**Stage cap enforcement:**

When the Research Queue dispatcher evaluates a job, it checks both the per-stage remaining budget and the per-invention remaining budget. The binding constraint is whichever is lower. If a job's estimated cost would exceed either cap, the job is held until the constraint clears (budget resets) or the job priority escalates to a level where an exception is warranted.

**Exception escalation:** Priority Level 1 (user interactive) jobs bypass the per-stage cap but NOT the per-invention budget. A founder who manually refreshes research pays from the invention budget even if the stage cap is technically exhausted. This prevents user-initiated actions from being silently blocked.

### 10.7 Global Monthly Cost Budget

At the platform level, Atlas maintains a global monthly budget for all Research Engine API spending across all inventions and all founders.

**Global monthly budget structure:**

```
globalCostBudget {
  month: string                    // "2026-07" format
  totalBudgetCents: number         // Platform-level monthly budget
  spentCents: number               // Actual spending so far this month
  projectedMonthEndCents: number   // Projection based on current run rate
  remainingCents: number
  
  // Breakdown by provider
  byProvider: Map<string, number>  // providerId → cents spent this month
  
  // Breakdown by module type
  byModule: Map<string, number>    // moduleId → cents spent this month
  
  // Budget status
  status: "healthy" | "approaching_limit" | "at_80pct" | "at_90pct" | "exceeded"
  
  // Alert thresholds
  alertThresholds: {
    warn: number                   // Send warning when spending reaches this % (default: 70%)
    critical: number               // Trigger critical alert at this % (default: 90%)
    hardStop: number               // Trigger hard stop circuit breaker at this % (default: 100%)
  }
}
```

**Default global monthly budget:** $500 USD (50,000 cents) at launch, with planned escalation as the invention count grows:

| Invention Count | Recommended Monthly Budget |
|---|---|
| 1–100 inventions | $500 |
| 101–500 inventions | $2,000 |
| 501–2,000 inventions | $6,000 |
| 2,001+ inventions | Reviewed quarterly; scale with per-invention average |

The global budget is reviewed and adjusted at the beginning of each month. Adjustments are made by updating the `globalCostBudget.totalBudgetCents` value — no code changes are required.

### 10.8 Cost Monitoring and Alerts

**Cost monitoring dashboard:**

The Research Engine exposes cost monitoring data through Convex queries accessible by Atlas's operational tooling. The monitoring view provides:

- Real-time spend against monthly budget (global and per-provider breakdown)
- Per-invention spend ranking (which inventions are consuming the most budget)
- Per-module cost efficiency (cost per research job by module)
- Day-over-day and week-over-week spend trends
- Cost projection for month-end based on current run rate

**Alert definitions:**

| Alert ID | Condition | Severity | Action |
|---|---|---|---|
| `GLOBAL_BUDGET_70PCT` | Global monthly spend reaches 70% of budget | Warning | Notify engineering; review large consumers |
| `GLOBAL_BUDGET_90PCT` | Global monthly spend reaches 90% of budget | Critical | Notify on-call; evaluate circuit breaker eligibility |
| `GLOBAL_BUDGET_EXCEEDED` | Global monthly spend reaches 100% of budget | Emergency | Automatic circuit breaker triggers (Section 10.9) |
| `INVENTION_BUDGET_80PCT` | Single invention reaches 80% of its per-invention budget | Informational | Log; no action; approaches auto-escalation |
| `INVENTION_BUDGET_EXHAUSTED` | Single invention reaches 100% of budget | Warning | Research jobs held; founder notified via UI |
| `PROVIDER_COST_SPIKE` | Any single provider's daily spend is 3× the 7-day average | Warning | Alert engineering; investigate unusual usage |
| `LLM_TOKEN_SPIKE` | LLM token consumption is 2× the previous day's usage | Warning | Review research job logs for runaway generation |
| `COST_PER_JOB_ELEVATED` | Average cost per research job for any module is 3× the 30-day average | Warning | Possible provider price change or query inflation |

**Alert delivery:**

All alerts are delivered through Atlas's monitoring infrastructure. Informational and Warning alerts are logged and visible in the monitoring dashboard. Critical and Emergency alerts trigger notifications to the on-call engineering team via Slack or equivalent communication channel.

### 10.9 Automatic Cost Circuit Breakers

Circuit breakers are automatic safety mechanisms that halt or throttle research activity when cost thresholds are reached. They are the last line of defense against unexpected cost overruns.

**Circuit Breaker 1 — Global Budget Exhausted:**

When global monthly spending reaches 100% of budget:
- All NEW research jobs with priority Level 4 (Scheduled Refresh) and Level 5 (Low Priority Background) are immediately paused. These are the lowest-urgency jobs and can safely be deferred to the next billing period.
- Priority Level 3 (Pre-Stage Research) jobs are throttled to 20% of their normal concurrency limit.
- Priority Level 1 (User Interactive) and Level 2 (Blocking Stage Entry) jobs continue unaffected. The founder's active session must never be degraded by a budget circuit breaker.
- An engineering alert is sent immediately.
- The founder-facing UI shows no degradation for active use — only background pre-loading is affected.

**Circuit Breaker 2 — Per-Invention Budget Exhausted:**

When a single invention reaches 100% of its per-invention budget:
- All research jobs for that `inventionId` are paused regardless of priority, EXCEPT Priority Level 1 (user interactive — founder is actively waiting for a result).
- The stage view for the affected invention shows a budget notification: "Atlas has completed extensive research for your invention. Automated background research has paused temporarily. You can continue working, and Atlas will resume research on a new billing cycle. [Upgrade plan] to increase your research budget."
- Manual refresh (Priority Level 1) still works — but the cost is logged against the inventor's budget. If a founder manually refreshes and exhausts the last of their budget in Priority Level 1 jobs, subsequent manual refreshes are queued until the budget resets.

**Circuit Breaker 3 — Anomalous Spending Spike:**

If any single provider's hourly spending exceeds 10× the 7-day average hourly spending for that provider:
- All jobs queued for that provider are immediately paused
- An emergency alert is sent to engineering
- The circuit breaker holds until manually cleared by an engineer who investigates the cause
- This protects against runaway query loops, corrupted input data generating unusually expensive queries, or provider pricing changes not yet reflected in cost estimates

**Circuit Breaker 4 — LLM Runaway Token Generation:**

If any single LLM synthesis call returns more than twice its `maxOutputTokens` budget (indicating the token limit is not being properly enforced by the provider):
- The response is truncated to `maxOutputTokens` before processing
- The overrun is logged as an anomaly
- If the same module triggers two such overruns within an hour, that module's LLM calls are paused and an alert is generated
- This prevents LLM verbose output from silently inflating per-job costs

**Circuit breaker state storage:**

```
circuitBreakerState {
  breakerId: string                // "global_budget" | "invention_budget:${inventionId}" | "provider:${providerId}" | "llm_runaway:${moduleId}"
  status: "open" | "closed" | "half_open"   // open = triggered; closed = normal; half_open = testing recovery
  triggeredAt: string | null
  triggerReason: string | null
  clearedAt: string | null
  clearedBy: string | null        // "auto_reset" | "engineer_cleared" | "budget_reset"
  triggerCount: number            // How many times this breaker has triggered this month
}
```

**Circuit breaker recovery:**

- Global budget circuit breaker: Auto-resets on the first day of the next billing month.
- Per-invention budget circuit breaker: Resets when the inventor's subscription renews or when they upgrade their plan.
- Anomalous spending circuit breaker: Requires manual engineer review and clearance.
- LLM runaway circuit breaker: Resets after 1 hour if no further overruns occur; requires manual clearance if it triggers three times in a day.

### 10.10 Audit Logging — What Was Researched, When, By Whom, At What Cost

Every research job executed by the Research Engine is logged to a permanent audit record. This audit log serves operational monitoring, cost reconciliation, security review, and compliance purposes.

**Research execution audit log schema:**

```
researchExecutionLog {
  logId: string                    // Unique log entry ID
  
  // Job context
  jobId: string                    // researchQueue entry ID
  inventionId: Id<"inventions">    // Which invention (stored as internal ID; not exposed externally)
  stageId: number                  // Which stage
  moduleId: string                 // Which research module
  triggerEvent: string             // Hook that triggered this job
  
  // Timing
  enqueuedAt: string               // When the job was added to the queue
  startedAt: string                // When execution began
  completedAt: string | null       // When execution ended (null if failed or in-progress)
  durationMs: number               // Execution duration
  
  // Outcome
  status: "completed" | "failed" | "cancelled" | "timeout"
  resultVersion: number | null     // The researchResults version created by this job
  confidenceScore: number | null   // Final confidence score (0.0–1.0)
  
  // Provider
  providerAttempts: ProviderAttemptRecord[]  // One record per provider attempted (primary + fallbacks)
  primaryProviderUsed: string
  fallbackUsed: boolean
  
  // Cost
  estimatedCostCents: number       // Pre-execution estimate
  actualCostCents: number          // Actual cost incurred
  costVariancePct: number          // (actual - estimated) / estimated × 100
  billingBreakdown: CostBreakdown  // How the cost was composed
  
  // Data transmitted
  dataSentToProvider: DataTransmissionRecord  // What was sent (no PII, only category-level description)
  
  // Error (if applicable)
  errorType: string | null
  errorMessage: string | null
  isRetryable: boolean | null
  retryAttemptNumber: number       // 0 for first attempt; 1, 2, 3... for retries
}

ProviderAttemptRecord {
  providerId: string
  attemptNumber: number
  status: "success" | "failure" | "rate_limited" | "timeout"
  latencyMs: number
  httpStatusCode: number | null
  costCents: number
}

DataTransmissionRecord {
  dataTypes: string[]              // Categories of data sent: e.g., ["product_category", "technology_keywords"]
  anonymizationApplied: string[]   // Anonymization techniques applied: e.g., ["category_generalization", "no_brand"]
  dataSizeBytes: number | null     // Size of the outbound request payload
}
```

**Audit log retention:** Research execution logs are retained for 2 years. This covers:
- Cost reconciliation disputes with providers (typically resolved within 90 days)
- Security incident review requirements (12 months)
- General engineering analysis and retrospectives (ongoing)

**Cost reconciliation:** At the end of each billing month, Atlas's finance team can export the research execution log for the month, sum `actualCostCents` by provider, and reconcile against each provider's invoice. Any variance greater than 5% triggers an investigation.

**Who can access audit logs:**

- Engineering team: Full read access for debugging and monitoring
- Finance team: Read access for cost records and billing reconciliation
- Founders: Read access to their own invention's audit events via the "Research history" feature in the stage view. Founders see which modules were researched, when, and at what confidence level — but NOT provider names or actual costs (those are internal operational details).

### 10.11 Monitoring and Observability

**Research Engine health metrics:**

The following metrics are tracked in real time and available to the engineering team via the monitoring dashboard:

**Queue metrics:**
- Queue depth by priority level (current count of pending jobs at each priority)
- Average wait time by priority level (time from enqueue to execution start)
- Job completion rate (jobs completed per minute)
- Job failure rate (jobs failed per hour, by failure type)
- Circuit breaker status (open/closed for each breaker)

**Research quality metrics:**
- Average confidence score by module (rolling 7-day average)
- Auto-accept rate by module (% of results that reach AUTO_ACCEPT threshold)
- Founder rejection rate by module (% of results rejected by founders)
- Founder edit rate by module (% of results modified by founders before acceptance)
- Research freshness distribution (% of active results that are fresh vs. stale vs. expired)

**Cost metrics:**
- Real-time spend vs. monthly budget (global)
- Cost per research job by module (rolling 7-day average)
- Cost per invention by stage (for detecting cost outliers)
- Provider cost breakdown (spend by provider, this month vs. last month)
- LLM token consumption (daily and monthly totals)

**Provider health metrics:**
- Provider uptime (rolling 24-hour availability per provider)
- Provider error rate (% of requests returning errors, by error type)
- Provider latency (P50, P95 response time per provider)
- Rate limit headroom (% of capacity remaining in current window, per provider)
- Fallback trigger rate (how often fallbacks are being used, by provider)

**Inventor journey metrics (operational view):**
- Research-to-stage-entry lag (time between stage unlock and research completion — ideally < 5 minutes)
- Stages with pending REQUIRES_REVIEW items (how many active inventions have blocking review items)
- Manual override rate by module (high override rate signals research quality issue)
- Cross-stage data propagation lag (time for approved research to flow into document pipeline)

**Alerting architecture:**

All metrics are monitored against alert thresholds. Alerts flow through the following pipeline:
1. Metric value exceeds threshold in Convex query
2. Alert event is written to `alertEvents` table
3. A Convex scheduled function polls `alertEvents` every 60 seconds for unprocessed alerts
4. Critical and emergency alerts are dispatched to the engineering team's notification channel immediately
5. Warning and informational alerts are batched into a daily digest email for the engineering team
6. All alert events are retained in `alertEvents` for 90 days for trend analysis

**Observability design principles:**

The monitoring system is designed for maximum signal, minimum noise:
- Every alert has a clear definition, a clear action, and a clear owner
- Alerts are rate-limited to prevent alert storms (if the same alert fires 10 times in an hour, it is deduplicated into one notification with a count)
- Every alert that fires should prompt a specific engineering action — alerts with no action are removed or recategorized as metrics to review in the daily digest
- The daily digest is short: top 5 metrics by variance, top 5 cost consumers, any new circuit breaker triggers, and the research quality summary

---

## Summary

This document has defined four critical architecture layers of the Atlas Research Engine:

| Section | What It Defines |
|---|---|
| Section 7 — Provider Abstraction | The provider-independent interface layer: abstract provider contracts, all six provider categories with named providers, provider registry, selection algorithm, fallback chains, provider swapping procedures, and the future provider expansion path |
| Section 8 — Confidence Framework | Complete confidence score schema (0.0–1.0), scoring methodology per module type, source classification (primary vs. secondary), assumption management, the three behavioral thresholds (AUTO_ACCEPT, REVIEW_RECOMMENDED, REQUIRES_REVIEW), time-based confidence degradation, and founder-approval-driven calibration |
| Section 9 — Human Review Flow | The full lifecycle of founder review: trigger conditions, surfacing patterns by confidence level, automatic acceptance rules, explicit approval workflow, partial acceptance via edit workflow, rejection and re-run workflow, manual override entry and persistence, and the complete audit trail schema |
| Section 10 — Security, Privacy, Rate Limiting, Cost Controls | API key management (never in frontend), data privacy rules and anonymization techniques, per-provider rate limiting with safety margins, per-invention and per-stage cost caps, global monthly budget, cost monitoring and alerts, four automatic circuit breakers, research execution audit logging, and the full monitoring and observability architecture |

**Part 3** (Section 11+) will define:
- Section 11: Individual Research Module Architectures — full specification for each of the 8 initial research modules (Competitive Landscape, Market Research, Patent Research, Manufacturer Research, Retail Research, Pricing Research, Customer Research, Regulatory Research)
- Section 12: Engineering Principles — the permanent rules governing implementation of the Research Engine and all features that depend on it

---

*End of ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md*
*Version 1.0 — July 2026*
*Architecture specification only. No implementation. No code changes. No existing files modified.*
*Source: ATLAS_AUTOMATION_CONSTITUTION.md · ATLAS_AUTOMATION_IMPLEMENTATION_PLAN.md · FOUNDER_REFERENCE_PROJECT_RISE_JARS_PART_D.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md*
