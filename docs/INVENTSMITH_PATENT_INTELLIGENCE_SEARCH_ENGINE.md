# ATLAS PATENT INTELLIGENCE — SEARCH ENGINE

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Specification — Not Yet Implemented**
**Source Documents:**
- `docs/ATLAS_AUTOMATION_CONSTITUTION.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md`
- `docs/ATLAS_PATENT_INTELLIGENCE_DISCOVERY.md`

---

## Document Purpose

This document defines how Atlas **executes** patent searches after the Discovery subsystem has prepared the research package.

Discovery determines **what** to search.

This document defines **how** Atlas performs the search.

It does not specify confidence scoring, caching strategy, cost controls, founder review, or human approval. Those belong in subsequent Patent Intelligence documents.

---

## Table of Contents

- [Section 1 — Search Engine Overview](#section-1--search-engine-overview)
- [Section 2 — Search Execution Pipeline](#section-2--search-execution-pipeline)
- [Section 3 — Search Providers](#section-3--search-providers)
- [Section 4 — Search Methods](#section-4--search-methods)
- [Section 5 — Result Processing](#section-5--result-processing)
- [Section 6 — Ranking](#section-6--ranking)
- [Section 7 — Structured Outputs](#section-7--structured-outputs)
- [Section 8 — Engineering Principles](#section-8--engineering-principles)

---

## Section 1 — Search Engine Overview

### 1.1 Role Within Atlas Patent Intelligence

The Search Engine is the execution layer of Atlas Patent Intelligence. It sits immediately downstream of Discovery and upstream of result analysis, founder review, and document assembly.

Its sole responsibility: **take a prepared Search Package and produce a ranked, normalized, deduplicated set of patent records.**

The Search Engine does not determine what to search — that is Discovery's job. The Search Engine does not interpret results for the founder — that belongs to the analysis and review layers. It searches, collects, processes, and structures.

### 1.2 Position in the Patent Intelligence Stack

```
Invention Context
      ↓
  [Discovery]          ← Determines WHAT to search
      ↓
  Search Package
      ↓
[Search Engine]        ← Executes the search (this document)
      ↓
  Structured Output
      ↓
[Analysis Layer]       ← Prior art scoring, FTO indicators, claim overlap
      ↓
[Founder Review]       ← Human judgment on findings
      ↓
[Document Assembly]    ← Prior Art Dossier, Patent Readiness Report
```

### 1.3 Design Constraints

The Search Engine operates under three permanent constraints:

- **Provider independence.** No business logic is tied to a specific patent database. Providers are interchangeable.
- **Horizontal scalability.** Each search job is stateless and independently executable. A job for one invention does not depend on the state of a job for another.
- **Reproducibility.** The same Search Package, executed against the same providers, produces the same structured output. Non-determinism is contained and traceable.

---

## Section 2 — Search Execution Pipeline

The Search Engine processes every Search Package through a fixed 10-step pipeline. Steps execute in order within a single package. Multiple packages execute in parallel.

```
Search Package
      ↓
 1. Provider Selection
      ↓
 2. Query Optimization
      ↓
 3. Parallel Search Execution
      ↓
 4. Result Collection
      ↓
 5. Normalization
      ↓
 6. Deduplication
      ↓
 7. Ranking
      ↓
 8. Evidence Assembly
      ↓
 9. Structured Output
```

### 2.1 Search Package (Input)

**Input:** A `SearchPackage` object produced by Discovery.

**Contents consumed:**
- `searchIntent` — defines evaluation criteria for results
- `keywords` and `synonymVariants` — drives keyword and semantic queries
- `classificationCodes` — drives classification queries
- `assigneeTargets` — drives assignee queries
- `inventorTargets` — drives inventor queries
- `jurisdiction` — constrains provider selection
- `searchMethod` — specifies which execution methods apply
- `dateConstraint` — constrains result date range where applicable

### 2.2 Provider Selection

**Purpose:** Choose which patent databases will execute this search package.

**Logic:**
- Map `jurisdiction` to available providers (e.g., `US` → USPTO; `EP` → EPO Espacenet; `WO` → WIPO PATENTSCOPE; `GLOBAL` → all providers).
- Map `searchMethod` to provider capability matrix (not all providers support all methods).
- Select the minimum set of providers that provides complete coverage for the package's intent and jurisdiction.
- Apply fallback assignments: if a preferred provider is unavailable, assign coverage to the next capable provider.

**Output:** Provider assignment list — which providers execute which query types for this package.

### 2.3 Query Optimization

**Purpose:** Transform the Search Package's abstract search instructions into provider-specific query strings.

**Actions per provider:**
- Construct boolean keyword queries using `keywords` + `synonymVariants` with field-specific targeting (title, abstract, claims, full text).
- Map CPC/IPC codes to provider-specific classification query syntax.
- Format assignee and inventor names per provider's name-matching conventions.
- Apply date filters from `dateConstraint`.
- Truncate queries that exceed provider character or term limits while preserving highest-priority terms.
- Generate semantic search embeddings if `searchMethod` includes `semantic`.

**Output:** Provider-specific query objects, one per provider per search method.

### 2.4 Parallel Search Execution

**Purpose:** Dispatch all queries simultaneously to minimize total execution time.

**Behavior:**
- All provider queries for a given Search Package execute in parallel.
- Each query is independently retried up to two times on transient failure before being marked as failed.
- Execution is time-bounded per query — no single provider can block the pipeline indefinitely.
- Failed queries are recorded in `SearchStatistics` with failure reason; partial results from successful providers proceed through the pipeline.

### 2.5 Result Collection

**Purpose:** Gather raw results from all provider responses into a single unprocessed result set.

**Behavior:**
- Collect all results returned within the execution window.
- Tag each result with: source provider, query method, query timestamp, and result rank from that provider.
- Store raw result snapshots before any transformation — enables debugging and result auditing.
- If a provider returns zero results, record a zero-result event in `SearchStatistics`.

### 2.6 Normalization

**Purpose:** Transform provider-specific result formats into a unified internal schema.

**See Section 5.1 for full normalization specification.**

### 2.7 Deduplication

**Purpose:** Remove duplicate patent records that appear across multiple providers or queries.

**See Section 5.2 for full deduplication specification.**

### 2.8 Ranking

**Purpose:** Order the deduplicated result set by relevance to the invention and search intent.

**See Section 6 for full ranking specification.**

### 2.9 Evidence Assembly

**Purpose:** Enrich top-ranked results with additional data needed for downstream analysis.

**Actions:**
- For results ranked in the top tier (configurable, default: top 25 per package), fetch full claim text if not already retrieved.
- Build citation edges for highly ranked results (backward citations only at this stage — forward citation traversal is a separate search method).
- Extract legal status for top-ranked results where not returned in the initial query.
- Flag patent family members of top-ranked results for family search follow-up.

**Output:** Enriched patent records for top-ranked results; unenriched records for lower-ranked results.

### 2.10 Structured Output

**Purpose:** Serialize the processed result set into the documented output schema.

**Actions:**
- Assemble all `PatentRecord` objects.
- Group into `PatentFamily` objects where family data is available.
- Build `TechnologyCluster` groupings from classification codes.
- Construct `CitationGraph` for top-ranked results with citation edges.
- Compute `SearchStatistics` covering execution metrics.
- Produce `CoverageReport` documenting what was searched and what was not.

**See Section 7 for full output schema.**

---

## Section 3 — Search Providers

### 3.1 Provider Abstraction

Every provider is accessed through a common `PatentSearchProvider` interface. No provider-specific logic leaks into the pipeline. The interface defines:

- `search(query: ProviderQuery): Promise<ProviderResult[]>`
- `getPatent(patentNumber: string): Promise<ProviderPatentRecord>`
- `getLegalStatus(patentNumber: string): Promise<LegalStatus>`
- `getCitations(patentNumber: string): Promise<CitationList>`
- `getFamily(patentNumber: string): Promise<FamilyList>`
- `healthCheck(): Promise<ProviderHealth>`

Adding a new provider requires implementing this interface only. No changes to the pipeline.

### 3.2 USPTO (United States Patent and Trademark Office)

**Coverage:** US utility patents, US design patents, US plant patents, published US applications.

**Supported methods:**
- Full-text keyword search (title, abstract, claims, description)
- Classification search (CPC codes, legacy USPC codes)
- Assignee name search
- Inventor name search
- Patent number lookup
- Application number lookup

**Data strengths:**
- Complete coverage of all US-granted patents.
- Full claim text available for all granted patents.
- Legal status (active/expired/abandoned) for all records.
- PTAB inter partes review records.

**Limitations:**
- No semantic/embedding search in native API.
- International coverage requires separate providers.
- Design patent search requires different query structure from utility patent search.

**Notes:**
- USPTO PatentsView API and USPTO Patent Full-Text Database are primary access paths.
- Bulk data downloads provide snapshot-based access for high-volume classification searches.

### 3.3 Google Patents

**Coverage:** Global — indexes USPTO, EPO, WIPO, JPO, CNIPA, and 100+ national offices.

**Supported methods:**
- Full-text keyword search across global corpus
- Semantic search (AI-powered similarity via Google Patents API)
- Classification search (CPC and IPC)
- Assignee search
- Inventor search
- Patent family lookup
- Prior art search using natural language description

**Data strengths:**
- Broadest coverage of any single provider — international filings in one query.
- Machine translation for non-English full text.
- Patent family data (INPADOC integration).
- Semantic prior art search using full-text description as query input.

**Limitations:**
- Claim-level search quality varies by language and document age.
- Real-time legal status less reliable than national office sources.

**Notes:**
- Google Patents Public Data (BigQuery) enables high-volume batch queries.
- Prior art finder endpoint accepts natural language description as input — primary vector for semantic prior art search.

### 3.4 WIPO PATENTSCOPE

**Coverage:** PCT (Patent Cooperation Treaty) international applications and national phase entries.

**Supported methods:**
- Full-text search across PCT applications
- Classification search (IPC codes)
- Assignee and inventor search
- International publication number lookup
- National phase entry tracking

**Data strengths:**
- Authoritative source for PCT applications — not all appear in USPTO or Google Patents at filing time.
- Covers pending international applications before they enter national phase.
- Key for inventions with international filing intent.
- WIPO Pearl terminology database useful for multilingual concept coverage.

**Limitations:**
- Does not cover most national-only filings outside the PCT system.
- Less comprehensive claim-level search than USPTO or Google Patents.

**Notes:**
- WIPO API (PatentScope Search API) is the primary access method.
- IPC classification search is authoritative here — IPC is maintained by WIPO.

### 3.5 EPO Espacenet

**Coverage:** European patents, European patent applications, and international patents in the DOCDB database (100M+ documents).

**Supported methods:**
- Full-text keyword search
- Classification search (CPC codes — CPC maintained jointly by EPO and USPTO)
- Assignee and inventor search
- Patent family lookup (INPADOC)
- Citation lookup
- Legal status lookup per jurisdiction

**Data strengths:**
- Best source for European patent family data and legal status.
- INPADOC family data is authoritative — EPO maintains this dataset.
- Citation data quality is high for European and PCT documents.
- CPC classification data is co-authoritative (EPO and USPTO jointly maintain CPC).

**Limitations:**
- Full-text search slower than Google Patents for large result sets.
- US design patents not well-covered.

**Notes:**
- EPO Open Patent Services (OPS) API is the primary access method.
- INPADOC family endpoint is the canonical source for patent family merging (Section 5.3).

### 3.6 Future Providers

The provider abstraction supports addition without pipeline changes. Anticipated future providers:

| Provider | Coverage | Primary Use Case |
|---|---|---|
| Derwent Innovation | Curated patent analytics | Claim quality scoring, market coverage |
| LexisNexis PatentAdvisor | US prosecution analytics | Examiner behavior, patent quality |
| Orbit Intelligence | Global family data | Enhanced family and legal status |
| CNIPA (China) | Chinese national patents | China-specific IP landscape |
| JPO J-PlatPat | Japanese national patents | Japan-specific IP landscape |
| Design patent databases | US, Hague system designs | Design patent search |
| Academic literature databases | Non-patent prior art | Obviousness analysis inputs |

### 3.7 Fallback Behavior

When a provider is unavailable, the Search Engine applies the following fallback strategy:

**Provider failure detection:**
- Each provider exposes a `healthCheck()` method called before query dispatch.
- A provider is marked unavailable if: health check fails, connection timeout exceeds threshold, or error rate in recent queries exceeds 50%.

**Fallback assignments:**

| Unavailable Provider | Fallback Coverage |
|---|---|
| USPTO | Google Patents (US corpus); mark US claim-level search as degraded |
| Google Patents | USPTO (US) + WIPO (WO) + EPO (EP) for combined coverage; mark semantic search as unavailable |
| WIPO PATENTSCOPE | Google Patents PCT corpus; mark PCT-specific results as potentially incomplete |
| EPO Espacenet | Google Patents (EP corpus); mark European family and citation data as degraded |
| All providers | Abort execution; record package as failed; trigger retry queue |

**Coverage tracking:**
- Every fallback event is recorded in `CoverageReport.degradedCoverage[]`.
- Results produced during a fallback are tagged `coverageQuality: degraded`.
- The analysis layer receives coverage quality metadata so it can weight results accordingly.

---

## Section 4 — Search Methods

### 4.1 Keyword Search

**Purpose:** Find patents containing specific technical terms in their title, abstract, claims, or full text.

**Execution:**
- Construct boolean query from `keywords` and `synonymVariants` in the Search Package.
- Apply field weighting: prioritize claims-field matches, then title, then abstract, then description.
- Use AND operators for core mechanism terms; use OR operators for synonym variants.
- Apply jurisdiction and date filters from the Search Package.
- Execute against: USPTO full-text, Google Patents, EPO Espacenet full-text, WIPO full-text.

**Result selection:** All results above provider relevance threshold; cap at 200 per provider to control downstream volume.

### 4.2 Semantic Search

**Purpose:** Find patents that are conceptually similar to the invention's technical description — even when they do not share exact keywords.

**Execution:**
- Use the semantic description prepared by Discovery (Section 5.6 of the Discovery document) as the query input.
- Submit to Google Patents prior art search endpoint using the natural language description.
- Alternatively, generate an embedding vector from the semantic description and execute similarity search against a patent embedding index if available.
- Also execute against any provider that natively supports semantic/AI-assisted search.

**Result selection:** Top 50 results by semantic similarity score; retain similarity scores for ranking.

### 4.3 Classification Search

**Purpose:** Find all patents classified under the CPC/IPC codes that cover the invention's technology space.

**Execution:**
- Query each target CPC/IPC code from the Search Package's `classificationCodes` field.
- Include both primary and adjacent codes.
- Apply date constraints for recent filings; remove date constraints for prior art searches.
- Execute against: USPTO classification search, EPO Espacenet classification, WIPO IPC search.
- Expand CPC subgroup search to the immediate parent class if result count is low (< 10 results).

**Result selection:** All results within target classification codes; apply date and jurisdiction filters. Large classification codes (> 500 results) are sampled by recency and relevance.

### 4.4 Citation Search

**Purpose:** Find patents that cite, or are cited by, a known relevant patent.

**Execution:**
- **Backward citation traversal:** For a seed patent, retrieve all patents it cites. These represent the prior art the seed's inventor and examiner considered relevant.
- **Forward citation traversal:** For a seed patent, retrieve all patents that have cited it since publication. Forward citations identify inventions that built upon or were distinguished from the seed.
- Execute against: EPO Espacenet (citation data), USPTO, Google Patents.
- Traverse up to two citation hops for backward search; one hop for forward search in initial execution.

**Seed patents:** Top-ranked results from keyword and classification searches; any patents provided in `founderKnownPatents`.

### 4.5 Family Search

**Purpose:** Retrieve all members of a patent family — the set of patent applications and grants that share a common priority filing.

**Execution:**
- For each seed patent, query the INPADOC family database via EPO OPS API.
- Retrieve all family members across all jurisdictions.
- Map each family member to its jurisdiction, filing date, legal status, and document type (application vs. grant).

**Purpose of family data:**
- A blocking patent in one jurisdiction has family members in others — family search reveals the full international scope of a claim.
- A granted patent's pending continuation applications may have broader claims than the published grant.

### 4.6 Inventor Search

**Purpose:** Find all patents filed by a specific inventor, to assess their activity in the technology space.

**Execution:**
- Query each `inventorTarget` from the Search Package against inventor-name fields.
- Apply name normalization before querying (standardize format, handle name order variants).
- Filter results to the relevant technology classes to avoid unrelated filings.
- Execute against: USPTO inventor search, Google Patents inventor search, EPO Espacenet inventor search.

### 4.7 Assignee Search

**Purpose:** Find all patents held by specific assignees — primarily known competitors and active filers in the technology space.

**Execution:**
- Query each `assigneeTarget` from the Search Package against assignee-name fields.
- Apply entity name normalization (subsidiary names, holding company variants, historical name changes).
- Filter results to target CPC/IPC classification codes to focus on relevant IP.
- Execute against: USPTO assignee search, Google Patents assignee search, EPO Espacenet applicant search.

**Output flag:** Tag all results from competitor assignees as `assigneeType: competitor` for downstream prioritization.

### 4.8 Technology Cluster Search

**Purpose:** Execute a broad sweep across an entire technology cluster — multiple related CPC subclasses — to map the patent landscape at a higher level.

**Execution:**
- Group target classification codes into technology clusters as specified in the Search Package.
- Execute a combined classification query across all codes in the cluster.
- Aggregate results across the cluster and compute filing volume by year, assignee, and sub-classification.
- This method produces landscape data, not targeted prior art — it feeds `TechnologyCluster` output objects rather than `PatentRecord` outputs.

### 4.9 International Search

**Purpose:** Execute patent searches simultaneously across multiple jurisdictions.

**Execution:**
- Decompose the Search Package's query into jurisdiction-specific sub-queries.
- Dispatch sub-queries in parallel to each relevant national/regional provider.
- Collect results per jurisdiction and tag each result with its jurisdiction of origin.
- Apply language normalization to non-English results (see Section 5.4).

**Jurisdictions covered by default for GLOBAL intent:**
- US (USPTO / Google Patents)
- EP (EPO Espacenet)
- WO / PCT (WIPO PATENTSCOPE)
- JP (JPO via Google Patents translation layer)
- CN (CNIPA via Google Patents translation layer)

### 4.10 Design Patent Search

**Purpose:** Find design patents — patents protecting the ornamental appearance of a product.

**Execution:**
- Query USPTO design patent classification codes (D-series in USPC, Locarno classes in CPC).
- Search by product category keywords in design patent title fields.
- Design patent search uses product appearance terms, not mechanism terms — query construction differs from utility patent search.
- Execute against: USPTO design patent database, Hague System via WIPO for international design registrations.

**Note:** Design patent search uses a separate query pipeline from utility patent search. Keyword strategies differ; results are stored and ranked separately.

### 4.11 Utility Patent Search

**Purpose:** The primary search type — finds patents protecting functional inventions, methods, and compositions of matter.

**Execution:**
- Combines keyword, classification, and semantic methods in a coordinated sweep.
- Utility patent search is the default type for all Search Packages unless `searchIntent` specifies design-specific search.
- Queries target claims, abstract, and description fields in that priority order.
- Executes across all providers appropriate to the Search Package's jurisdiction.

---

## Section 5 — Result Processing

### 5.1 Normalization

**Purpose:** Map every provider's result format into a single, consistent `PatentRecord` schema.

**Field mappings applied per provider:**

| Target Field | Normalization Action |
|---|---|
| `patentNumber` | Standardize to DOCDB format (e.g., `US1234567B2`, `EP9876543A1`) |
| `title` | Strip trailing punctuation; normalize whitespace; preserve original language alongside translation |
| `abstract` | Normalize whitespace; strip HTML artifacts from provider responses |
| `filingDate` | Parse all date formats to ISO 8601 (`YYYY-MM-DD`) |
| `publicationDate` | Parse all date formats to ISO 8601 |
| `priorityDate` | Parse all date formats to ISO 8601; use earliest priority where multiple exist |
| `expirationDate` | Compute from filing date + jurisdiction term where not directly provided |
| `inventors` | Normalize to `{lastName, firstName, middleInitial}` structure; preserve original string |
| `assignees` | Normalize entity names using assignee normalization table; preserve original string |
| `classifications` | Map provider-specific codes to CPC + IPC; retain source classification code |
| `legalStatus` | Map provider-specific status codes to canonical: `active` \| `expired` \| `abandoned` \| `pending` \| `unknown` |

### 5.2 Duplicate Detection

**Purpose:** Eliminate duplicate patent records that appear from multiple providers or multiple queries.

**Deduplication cascade (in order):**

1. **Exact match:** Same `patentNumber` after normalization — deduplicate immediately. Merge `sourceProvider` list.
2. **Near-duplicate by document number variant:** Same base number with different kind codes (e.g., `US1234567A` and `US1234567B2`) — merge into single record, retain all kind code variants.
3. **Cross-provider duplicate:** Same patent retrieved from multiple providers — merge records, preferring the provider with more complete data fields (claim text, legal status).
4. **Semantic near-duplicate:** Different patent numbers but title + abstract cosine similarity above threshold — flag as potential duplicate for review; do not auto-merge without number confirmation.

**Output:** `deduplicatedCount` recorded in `SearchStatistics`.

### 5.3 Patent Family Merging

**Purpose:** Group individual patent records into patent families — the set of applications sharing a common priority filing.

**Process:**
- Use INPADOC family ID from EPO OPS as the primary family grouping key.
- If INPADOC data is unavailable, group by shared priority number.
- For each family, select a representative patent: prefer the granted US patent; fall back to granted EP patent; fall back to published PCT application.
- Store all family members in `PatentFamily.members[]` with jurisdiction and legal status per member.
- Replace individual `PatentRecord` objects with references to their parent `PatentFamily` in the ranked output.

**Effect on ranking:** Families are ranked as a unit. The representative patent's score represents the family. Family size (number of jurisdictions covered) is a positive ranking signal.

### 5.4 Language Normalization

**Purpose:** Make non-English patent documents accessible within a search result set that may be presented to English-speaking founders.

**Process:**
- Detect source language of title and abstract for each result.
- For non-English results: retrieve machine translation from provider if available (Google Patents provides these); otherwise flag for translation.
- Store both original-language text and translated text in the `PatentRecord`.
- Tag translation source (`provider_translation` or `machine_translation`) and language pair.
- Claims-level translation is not executed at this stage — translation of claim text is deferred to the analysis layer for top-ranked results only.

### 5.5 Metadata Extraction

**Purpose:** Ensure every `PatentRecord` is as complete as possible before ranking.

**Fields extracted if missing after normalization:**
- `priorityDate` — derived from priority claim data in the raw record.
- `expirationDate` — computed: filing date + 20 years (utility) or 15 years (design); minus any terminal disclaimer.
- `classifications` — derived from claims text if not provided in the query result.
- `inventors` — parsed from inventor field of raw record.
- `assignees` — parsed from assignee/applicant field; supplemented with assignment records where available.

### 5.6 Legal Status Extraction

**Purpose:** Determine the current enforceability of each patent.

**Process:**
- Use legal status returned by the provider where available.
- For USPTO results: supplement with USPTO Patent Center prosecution history data.
- For EPO results: use EPO OPS legal status endpoint.
- Map to canonical status values: `active` | `expired` | `abandoned` | `pending` | `unknown`.
- Record status jurisdiction (a patent family member may be active in US and expired in EP).

**Importance for downstream use:**
- Active patents with broad claims are FTO concerns.
- Expired patents are prior art — they cannot block commercialization but can affect patentability of the invention.
- Abandoned applications are prior art but do not represent commercial risk.

### 5.7 Citation Graph Building

**Purpose:** Construct a citation network for top-ranked results to support downstream analysis.

**Process:**
- For each result in the top-tier set (default: top 25 per package after ranking), retrieve backward citations.
- For seed patents (provided in `founderKnownPatents` or top-ranked prior art), retrieve forward citations.
- Construct a directed graph: nodes are patents; edges are citation relationships (direction: citing → cited).
- Record edge attributes: citation type (examiner-added vs. applicant-cited), citation date.
- Store as `CitationGraph` output object (see Section 7.5).

---

## Section 6 — Ranking

The ranking system assigns a composite score to each `PatentRecord` after normalization and deduplication. Scoring factors are weighted by `searchIntent`.

### 6.1 Relevance Score

**Definition:** How closely the patent matches the query terms that retrieved it.

**Computation:**
- Field-weighted keyword match density: claims match weight > title match weight > abstract match weight > description match weight.
- Boolean query precision: patents matching all core terms score higher than patents matching only synonym variants.
- Provider relevance rank incorporated as a signal (normalized across providers to remove provider-specific scale differences).

### 6.2 Similarity Score

**Definition:** Semantic closeness between the patent's technical content and the invention description.

**Computation:**
- Cosine similarity between the patent's embedding (or abstract embedding) and the invention's semantic description embedding.
- Applied primarily to results from semantic search — keyword-only results receive a default similarity estimate based on keyword overlap.
- Higher weight applied to claims-section similarity than to abstract-section similarity.

### 6.3 Claim Overlap Score

**Definition:** Degree to which the patent's independent claims use language that overlaps with the invention's described novel elements.

**Computation:**
- Term overlap between the patent's independent claims and the invention's `novelElements` or `solutionSummary`.
- Weighted by claim breadth: broader independent claims score higher on overlap risk than narrow dependent claims.
- Applied only when claim text is available; patents without claim text receive no claim overlap score.

### 6.4 Technology Proximity Score

**Definition:** How close the patent's classification codes are to the invention's target classification codes.

**Computation:**
- CPC code distance metric: exact subgroup match → highest score; same subclass → high score; same class → medium score; same section → low score.
- Patents in the invention's primary CPC code receive maximum technology proximity score.
- Adjacent CPC codes (identified during Discovery) receive a partial proximity score.

### 6.5 Publication Date Factor

**Definition:** Adjusts score based on temporal relevance of the patent to the current search intent.

**Application by search intent:**
- **Prior art anticipation:** Earlier publication dates score higher — the earliest prior art has the highest patentability impact.
- **Claim overlap / FTO:** Most recent active patents score higher — recent claims are more likely to be currently enforceable and represent current risk.
- **Technology landscape:** Recent filings score higher — they reflect current state of the art.
- **Monitoring:** Only patents published since the last search run are included.

### 6.6 Assignee Relevance Factor

**Definition:** Bonus applied to patents held by assignees of strategic importance.

**Factors:**
- Patents held by competitor assignees: positive bonus — directly relevant to competitive IP landscape.
- Patents held by known NPEs active in the technology area: positive bonus — represent active enforcement risk.
- Patents held by academic institutions: neutral — prior art value, lower FTO concern.
- Patents held by the inventor's own prior employers: flag for review — potential ownership dispute risk.

### 6.7 Jurisdiction Factor

**Definition:** Adjusts score based on which jurisdictions the patent covers.

**Factors:**
- US jurisdiction: highest weight for US-market inventions.
- EP jurisdiction: high weight for European-market expansion plans.
- PCT/WO status: indicates international filing intent — weight accordingly.
- Patents covering the founder's primary target market receive maximum jurisdiction weight.

### 6.8 Citation Strength Factor

**Definition:** Adjusts score based on the patent's citation influence in its technology area.

**Factors:**
- Highly cited patents (many forward citations from other patents) are foundational to the technology area — high relevance for landscape and prior art searches.
- Patents cited by the current invention's closest competitors carry additional weight.
- Self-citation chains (same assignee citing own patents) are down-weighted.

### 6.9 Commercial Importance Factor

**Definition:** Adjusts score based on indicators of the patent's commercial significance.

**Factors:**
- Patent family size: patents with large families (many jurisdictions, many continuation applications) represent significant investment — likely commercially important.
- Maintenance fee payment history: patents maintained through full term despite increasing fees signal commercial value to the assignee.
- IPR/PTAB challenge history: patents that have survived inter partes review are more robust — higher weight for FTO analysis.

### 6.10 Final Score Composition

The final rank score is a weighted sum of the above factors. Weights vary by `searchIntent`:

| Factor | Prior Art Intent | FTO / Claim Overlap Intent | Landscape Intent |
|---|---|---|---|
| Relevance | High | High | Medium |
| Similarity | High | High | Medium |
| Claim Overlap | High | Critical | Low |
| Technology Proximity | High | High | High |
| Publication Date | Earlier bias | Recency bias | Recency bias |
| Assignee Relevance | Medium | High | High |
| Jurisdiction | Medium | High | Medium |
| Citation Strength | High | Medium | High |
| Commercial Importance | Low | High | Medium |

---

## Section 7 — Structured Outputs

### 7.1 PatentRecord

The atomic output unit. One record per unique patent document.

```
PatentRecord {
  patentNumber:       string          // Normalized DOCDB format
  title:              string          // English title (original or translated)
  titleOriginal:      string?         // Original language title if non-English
  abstract:           string          // English abstract
  abstractOriginal:   string?         // Original language abstract if non-English
  claims:             string[]?       // Independent claim text (if retrieved)
  inventors:          Inventor[]      // [{lastName, firstName, middleInitial}]
  assignees:          Assignee[]      // [{name, normalizedName, assigneeType}]
  filingDate:         string          // ISO 8601
  publicationDate:    string          // ISO 8601
  priorityDate:       string          // ISO 8601
  expirationDate:     string?         // ISO 8601, computed where available
  legalStatus:        LegalStatus     // active | expired | abandoned | pending | unknown
  legalStatusByJurisdiction: Record<string, LegalStatus>?
  classifications:    Classification[] // [{code, type: cpc|ipc|uspc, description}]
  citations:          string[]?       // Patent numbers cited by this patent
  citedBy:            string[]?       // Patent numbers that cite this patent
  familyId:           string?         // INPADOC family ID
  sourceProvider:     string[]        // Which providers returned this record
  queryMethod:        string[]        // Which search methods retrieved this record
  relevanceScore:     number          // 0–1
  similarityScore:    number?         // 0–1, present if semantic search was executed
  claimOverlapScore:  number?         // 0–1, present if claim text available
  rankScore:          number          // Final composite rank score
  assigneeType:       string?         // competitor | active_filer | npe | academic | individual
  coverageQuality:    string          // full | degraded
}
```

### 7.2 PatentFamily

Groups patent records that share a common priority filing.

```
PatentFamily {
  familyId:               string        // INPADOC family ID or computed identifier
  representativePatent:   PatentRecord  // The primary record representing this family
  members:                FamilyMember[] // [{patentNumber, jurisdiction, documentType, legalStatus, publicationDate}]
  jurisdictions:          string[]      // All jurisdictions covered by this family
  earliestPriority:       string        // ISO 8601 — earliest priority date in the family
  latestPublication:      string        // ISO 8601 — most recent publication in the family
  legalStatusByJurisdiction: Record<string, LegalStatus>
  familySize:             number        // Count of family members
  rankScore:              number        // Rank score of the representative patent
}
```

### 7.3 RelatedInvention

A focused summary of a patent that has been identified as particularly relevant to the invention.

```
RelatedInvention {
  patentNumber:       string
  title:              string
  overlapSummary:     string      // Plain-language description of the overlap
  claimOverlapScore:  number      // 0–1
  similarityScore:    number      // 0–1
  threatLevel:        string      // high | medium | low | informational
  assigneeName:       string
  legalStatus:        LegalStatus
  priorityDate:       string      // ISO 8601
  jurisdiction:       string[]
}
```

### 7.4 ClaimSummary

Structured summary of a patent's claims.

```
ClaimSummary {
  patentNumber:           string
  independentClaims:      ClaimText[]   // [{claimNumber, text}]
  dependentClaimsCount:   number
  keyElements:            string[]      // Key claim elements extracted from independent claims
  broadestClaim:          string        // Text of the broadest independent claim
  claimLanguage:          string        // ISO 639-1 language code of original claim text
}
```

### 7.5 TechnologyCluster

Aggregated view of patent activity within a technology sub-domain.

```
TechnologyCluster {
  clusterId:          string
  label:              string        // Human-readable cluster description
  cpcCodes:           string[]      // CPC codes defining this cluster
  patentCount:        number        // Total patents in this cluster found in the search
  topAssignees:       AssigneeSummary[] // [{name, patentCount, mostRecentFiling}]
  filingTrend:        YearlyCount[]    // [{year, count}] — filing volume by year
  dateRange:          DateRange      // {earliest, latest}
  relevanceToInvention: string      // core | adjacent | peripheral
}
```

### 7.6 CitationGraph

Network of citation relationships between patents.

```
CitationGraph {
  rootPatent:         string          // Patent number of the root node
  forwardCitations:   CitationEdge[]  // [{from, to, citationType, citationDate}]
  backwardCitations:  CitationEdge[]  // [{from, to, citationType, citationDate}]
  depth:              number          // Maximum traversal depth executed
  totalNodes:         number          // Total distinct patents in the graph
  totalEdges:         number          // Total citation relationships
}
```

### 7.7 SearchStatistics

Execution metrics for the search run.

```
SearchStatistics {
  searchPackageId:        string
  inventionId:            string
  totalResultsCollected:  number      // Before deduplication
  deduplicatedCount:      number      // After deduplication
  familyCount:            number      // Patent families identified
  resultsByProvider:      Record<string, number>   // Provider → result count
  resultsByMethod:        Record<string, number>   // Method → result count
  zeroResultQueries:      QueryRef[]  // Queries that returned no results
  failedQueries:          FailedQuery[] // [{provider, method, reason}]
  executionTimeMs:        number
  queryCount:             number      // Total queries dispatched
}
```

### 7.8 CoverageReport

Documents what the search covered and what it did not.

```
CoverageReport {
  searchPackageId:        string
  providersQueried:       string[]    // All providers attempted
  providersSuccessful:    string[]    // Providers that returned results
  providersFailed:        string[]    // Providers that failed
  methodsExecuted:        string[]    // Search methods that ran successfully
  jurisdictionsCovered:   string[]    // Jurisdictions searched
  jurisdictionsUncovered: string[]    // Jurisdictions in scope but not searched
  dateRangeSearched:      DateRange?  // {earliest, latest}
  classificationsCovered: string[]    // CPC/IPC codes searched
  degradedCoverage:       DegradedEvent[] // [{provider, reason, affectedMethods}]
  coverageQuality:        string      // full | partial | degraded
}
```

---

## Section 8 — Engineering Principles

**Support parallel execution.**
- Multiple Search Packages from the same research run execute simultaneously.
- Within each package, all provider queries dispatch in parallel.
- Pipeline stages that can operate on partial result sets (normalization, deduplication) begin processing as results arrive — they do not wait for all providers to complete.
- Search jobs are stateless. They carry no dependency on the execution state of other jobs.

**Remain provider independent.**
- All provider interaction passes through the `PatentSearchProvider` interface.
- No ranking logic, normalization logic, or output schema contains any reference to a specific provider.
- A provider can be added, removed, or replaced without changes to the pipeline.
- Provider-specific query construction is isolated in per-provider query builder modules.

**Scale horizontally.**
- Each Search Package job is an independent, stateless unit of work.
- Jobs are dispatched from a queue and executed by worker processes. Adding workers increases throughput linearly.
- No shared mutable state between concurrent jobs.
- Jobs are idempotent: re-executing the same Search Package produces the same output.

**Avoid duplicate searches.**
- Before executing a Search Package, the engine checks whether an equivalent package has already been executed for this invention.
- Equivalence is determined by a context hash of the package's inputs.
- Identical packages return existing results without re-executing provider queries.

**Reuse cached search packages.**
- Search Packages produced by Discovery are persistent artifacts.
- When Discovery produces an incremental package (covering only delta context since the last full run), the Search Engine merges new results with prior results rather than replacing them.
- The Search Package carries a `packageVersion` that increments on each re-derivation; the engine tracks result sets per version.

**Produce reproducible results.**
- The same Search Package, executed at the same point in time, produces the same normalized, deduplicated, ranked output.
- Randomness is not introduced at any pipeline stage.
- All ranking weights are versioned. A change to ranking weights is a versioned change — old results are not retroactively re-ranked without an explicit re-run.
- Results are stamped with: `executedAt`, `providerVersions`, `rankingVersion`.

**Support future AI improvements.**
- Semantic search, similarity scoring, and claim overlap scoring are pluggable components.
- Ranking factor weights are configurable per `searchIntent` without code changes.
- Any pipeline step can be replaced with an improved AI model without changes to the pipeline's input/output contract.
- All AI-derived fields (similarity scores, claim overlap scores) carry provenance: which model produced the score and with what inputs.

---

## Summary

| Section | What It Defines |
|---|---|
| Section 1 | The Search Engine's role, its position in the Patent Intelligence stack, and its three permanent design constraints |
| Section 2 | The complete 10-step execution pipeline from Search Package input to Structured Output |
| Section 3 | The four current providers (USPTO, Google Patents, WIPO, EPO), the provider abstraction interface, future provider pathway, and fallback behavior |
| Section 4 | Execution logic for all 11 search methods: keyword, semantic, classification, citation, family, inventor, assignee, technology cluster, international, design patent, utility patent |
| Section 5 | Result processing: normalization, deduplication, family merging, language normalization, metadata extraction, legal status extraction, citation graph building |
| Section 6 | Ranking: nine factors and their intent-weighted composition |
| Section 7 | Complete output schema: PatentRecord, PatentFamily, RelatedInvention, ClaimSummary, TechnologyCluster, CitationGraph, SearchStatistics, CoverageReport |
| Section 8 | Eight engineering principles: parallel execution, provider independence, horizontal scalability, duplicate avoidance, search package reuse, reproducibility, AI upgrade support |

**Subsequent documents will define:**
- Prior art scoring and claim overlap analysis
- FTO indicator generation
- Confidence framework for patent research
- Caching strategy and incremental update approach
- Cost controls and provider selection economics
- Founder review flow for patent findings
- Patent monitoring and alerting (post-launch)

---

*End of ATLAS_PATENT_INTELLIGENCE_SEARCH_ENGINE.md*
*Version 1.0 — July 2026*
*Search Engine specification only. No implementation. No code changes.*
*Source: ATLAS_AUTOMATION_CONSTITUTION.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md · ATLAS_PATENT_INTELLIGENCE_DISCOVERY.md*
