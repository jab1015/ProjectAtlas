# ATLAS PATENT INTELLIGENCE — ANALYSIS

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Specification — Not Yet Implemented**
**Source Documents:**
- `docs/ATLAS_AUTOMATION_CONSTITUTION.md`
- `docs/ATLAS_PATENT_INTELLIGENCE_DISCOVERY.md`
- `docs/ATLAS_PATENT_INTELLIGENCE_SEARCH_ENGINE.md`

---

## Document Purpose

This document defines how Atlas **analyzes** patent search results after the Search Engine completes execution.

Discovery determines **what** to search.
Search Engine **retrieves** the results.
Analysis determines **what the results mean**.

Atlas transforms raw `PatentRecord`, `PatentFamily`, and `ClaimSummary` objects from the Search Engine into structured, actionable inventor intelligence.

It does not specify caching, cost controls, API management, founder approval workflow, or human review UI implementation. Those belong in subsequent Patent Intelligence documents.

---

## Table of Contents

- [Section 1 — Analysis Overview](#section-1--analysis-overview)
- [Section 2 — Analysis Pipeline](#section-2--analysis-pipeline)
- [Section 3 — Claim Intelligence](#section-3--claim-intelligence)
- [Section 4 — Novelty & Prior Art Assessment](#section-4--novelty--prior-art-assessment)
- [Section 5 — Freedom-to-Operate Indicators](#section-5--freedom-to-operate-indicators)
- [Section 6 — Risk Assessment](#section-6--risk-assessment)
- [Section 7 — Opportunity Identification](#section-7--opportunity-identification)
- [Section 8 — Recommendations](#section-8--recommendations)
- [Section 9 — Structured Outputs](#section-9--structured-outputs)
- [Section 10 — Engineering Principles](#section-10--engineering-principles)

---

## Section 1 — Analysis Overview

### 1.1 Purpose of the Analysis Subsystem

The Analysis subsystem is the intelligence layer of Atlas Patent Intelligence. It receives raw, ranked patent data from the Search Engine and converts it into findings that an inventor can act on.

Raw patent data is not actionable. A list of 200 patent numbers sorted by relevance score is not what a founder needs. What the founder needs:

- Which of those patents could block commercialization of their product
- How close the invention is to what has already been claimed
- What risks the patent landscape presents and at what level
- Where the white space is and how to take advantage of it
- What specific actions Atlas recommends as next steps

The Analysis subsystem produces all of this — automatically, without requiring the founder to interpret raw patent records.

### 1.2 Position in the Patent Intelligence Stack

```
Invention Context
      ↓
  [Discovery]             ← Determines WHAT to search
      ↓
  Search Package
      ↓
[Search Engine]           ← Executes the search
      ↓
  Structured Search Output
  (PatentRecord / PatentFamily / ClaimSummary)
      ↓
[Analysis]                ← Interprets WHAT THE RESULTS MEAN (this document)
      ↓
  PatentAnalysisReport
      ↓
[Founder Review]          ← Human judgment on findings
      ↓
[Document Assembly]       ← Prior Art Dossier, Patent Readiness Report
```

### 1.3 What Analysis Transforms

**Inputs (from Search Engine):**
- `PatentRecord[]` — normalized, ranked patent documents with claim text, legal status, and metadata
- `PatentFamily[]` — grouped patent families with jurisdiction coverage
- `ClaimSummary[]` — structured claim text for top-ranked results
- `TechnologyCluster[]` — aggregated technology landscape data
- `CitationGraph` — citation relationships between patents
- `CoverageReport` — what was searched and at what quality
- Invention context — the inventor's description, novel elements, product description from the Atlas invention record

**Outputs (for Founder Review and Document Assembly):**
- `PatentAnalysisReport` — top-level analysis container
- `ClaimIntelligence[]` — parsed and structured claim analysis per relevant patent
- `NoveltyAssessment` — novelty score, prior art references, element mapping
- `FTOIndicators` — freedom-to-operate signals with explicit disclaimers
- `RiskAssessment` — structured risk categorization with contributing factors
- `OpportunityReport` — white space, design-around paths, licensing indicators
- `RecommendationSet` — ordered, prioritized action recommendations
- `FounderReviewPackage` — curated subset formatted for Atlas UI presentation

### 1.4 Permanent Design Constraints

The Analysis subsystem operates under three non-negotiable constraints:

- **Never claims legal certainty.** All outputs use probabilistic, advisory language. Atlas does not determine whether a patent is infringed. Atlas identifies indicators, signals, and risk levels for human review.
- **Always distinguishes evidence from conclusions.** Every conclusion field in every output schema has a corresponding evidence field. Atlas never asserts a finding without documenting what data produced it.
- **Always supports human review.** Every analysis output is reviewable and overridable by a qualified human. Analysis never produces a locked conclusion — it produces a structured finding that a patent attorney or founder can examine, challenge, and override.

---

## Section 2 — Analysis Pipeline

The Analysis subsystem processes Search Engine output through a 10-step pipeline. Steps 1–6 are parallelizable per patent. Steps 7–10 operate across the full result set.

```
Patent Results (from Search Engine)
      ↓
 1. Claim Extraction
      ↓
 2. Novelty Assessment
      ↓
 3. Prior Art Analysis
      ↓
 4. Similarity Analysis
      ↓
 5. Freedom-to-Operate Indicators
      ↓
 6. Risk Assessment
      ↓
 7. Opportunity Identification
      ↓
 8. Recommendations
      ↓
 9. Structured Analysis Output
      ↓
10. Founder Review Package Assembly
```

### Step 1 — Claim Extraction

**Input:** `PatentRecord[]` with `claims` field populated for top-ranked results.

**Processing:**
- Parse raw claim text from each `PatentRecord.claims` array.
- Detect and separate independent claims from dependent claims.
- Build claim hierarchy tree (independent → dependent chain).
- Extract key inventive concepts and protected features from independent claim language.
- Identify claim boundaries that represent potential design-around opportunities.

**Output:** `ClaimIntelligence[]` — one object per analyzed patent. See Section 3.

---

### Step 2 — Novelty Assessment

**Input:** `ClaimIntelligence[]` + invention context (`novelElements`, `solutionSummary`, `productDescription`).

**Processing:**
- Score novelty of the inventor's concept on a 0.0–1.0 scale.
- Assess prior art strength for each reference.
- Map inventor concept elements to prior art elements (element-by-element).

**Output:** `NoveltyAssessment` object. See Section 4.

---

### Step 3 — Prior Art Analysis

**Input:** `NoveltyAssessment` + `PatentRecord[]` + `PatentFamily[]`.

**Processing:**
- Categorize each prior art reference by strength: anticipatory, obviousness-relevant, background art, non-relevant.
- Measure technology overlap between each reference and the invention.
- Collect evidence per reference (claim elements matched, relevant text excerpts, similarity scores).

**Output:** `PriorArtSummary` with `PriorArtReference[]`. See Section 9.

---

### Step 4 — Similarity Analysis

**Input:** `ClaimIntelligence[]` + invention context.

**Processing:**
- Compute multi-factor similarity score for each patent: semantic similarity, claim element matching, classification proximity, keyword overlap.
- Normalize to 0.0–1.0 scale.
- Produce similarity rank across the full result set.

**Output:** Similarity scores appended to `ClaimIntelligence` and `PriorArtReference` objects.

---

### Step 5 — Freedom-to-Operate Indicators

**Input:** `ClaimIntelligence[]` + `PatentFamily[]` + legal status data + jurisdiction data.

**Processing:**
- Compute claim proximity score (0.0–1.0) per independent claim per relevant patent.
- Evaluate active legal status per jurisdiction.
- Flag expired patents, abandoned applications, design patent interactions.
- Trace patent families and flag multi-member family hits.

**Output:** `FTOIndicators` object. See Section 5.

---

### Step 6 — Risk Assessment

**Input:** `FTOIndicators` + `NoveltyAssessment` + `PriorArtSummary` + assignee metadata.

**Processing:**
- Aggregate risk factors across all prior art and FTO signals.
- Compute composite risk score (0.0–1.0).
- Assign risk category (Very Low through Very High).
- Identify top contributing factors to risk level.

**Output:** `RiskAssessment` object. See Section 6.

---

### Step 7 — Opportunity Identification

**Input:** `NoveltyAssessment` + `FTOIndicators` + `RiskAssessment` + `TechnologyCluster[]`.

**Processing:**
- Identify white-space areas with no active patent coverage.
- Surface specific claim limitations available for design-around.
- Flag patents suitable for licensing indicators.
- Identify expired high-value patents whose technology is freely available.
- Locate technology gaps and innovation directions.

**Output:** `OpportunityReport` with `OpportunityItem[]`. See Section 7.

---

### Step 8 — Recommendations

**Input:** All prior outputs.

**Processing:**
- Apply recommendation taxonomy (8 types) with trigger condition logic.
- Assign priority levels (URGENT through INFORMATIONAL).
- Link each recommendation to evidence that triggered it.

**Output:** `RecommendationSet` with `Recommendation[]`. See Section 8.

---

### Step 9 — Structured Analysis Output

**Input:** All prior outputs.

**Processing:**
- Assemble `PatentAnalysisReport` top-level container.
- Embed all sub-reports.
- Validate required fields.
- Stamp with analysis metadata (version, timestamp, coverage quality).

**Output:** `PatentAnalysisReport`. See Section 9.

---

### Step 10 — Founder Review Package Assembly

**Input:** `PatentAnalysisReport`.

**Processing:**
- Extract the curated subset most relevant to founder decision-making.
- Apply Atlas UI formatting (plain language summaries, priority ordering, disclaimer insertion).
- Produce `FounderReviewPackage` optimized for Atlas dashboard presentation.

**Output:** `FounderReviewPackage`. See Section 9.

---

## Section 3 — Claim Intelligence

### 3.1 Claim Parsing

Atlas parses raw claim text from `PatentRecord.claims` using the following logic:

- **Claim number detection:** Each claim begins with a claim number (e.g., `1.`, `Claim 1`, `1)`). Atlas strips the number and stores it as `claimNumber`.
- **Preamble extraction:** The preamble (the portion before the transitional phrase) introduces the category of subject matter being claimed (e.g., "A device for...", "A method of...").
- **Transitional phrase detection:** Identifies `comprising`, `consisting of`, `consisting essentially of`, `including`, `having` — which determines whether the claim is open-ended or closed.
- **Claim body parsing:** The body following the transitional phrase lists claim elements, typically as a series of limitations separated by semicolons or line breaks.
- **Limitation extraction:** Each claim limitation (element + functional restriction) is extracted as a discrete unit for element-by-element mapping.

### 3.2 Independent vs. Dependent Claims

**Detection logic:**
- **Independent claim:** Contains no reference to another claim. Stands alone. Typically written as "A [noun] comprising..." without qualification.
- **Dependent claim:** Explicitly references another claim in its preamble: "The [noun] of claim N, wherein..." or "The method of claim N, further comprising...".

**Relationship mapping:**
- Each dependent claim is mapped to its parent claim number.
- Multi-level dependencies are traced (a claim that depends on a claim that depends on another claim).
- The complete dependency chain is stored in `claimHierarchy`.

### 3.3 Claim Hierarchy

Atlas builds a claim tree for each analyzed patent:

```
Claim 1 (independent)
├── Claim 2 (depends on 1)
│   └── Claim 5 (depends on 2)
├── Claim 3 (depends on 1)
└── Claim 4 (depends on 1)
Claim 6 (independent)
└── Claim 7 (depends on 6)
```

- Independent claims define the outer boundary of protection.
- Each dependent claim adds a narrowing limitation to its parent.
- A patent's broadest protection is defined by its independent claims.
- Design-around analysis focuses on the limitations of independent claims — avoiding those limitations avoids the claim.

### 3.4 Key Inventive Concepts

Atlas extracts the core protected features from each independent claim by:

- Identifying the **novel combination** — the set of elements claimed together (not individually, since individual elements may not be novel).
- Surfacing the **functional limitation** — what the combination must accomplish, not merely what it is.
- Flagging **numerical limitations** — specific values, ranges, ratios that narrow the claim's scope.
- Noting **material / compositional limitations** — specific substances, compounds, or material properties required.
- Identifying **process step limitations** — the sequence of steps required for method claims.

### 3.5 Protected Features

For each independent claim, Atlas surfaces:

| Feature Type | Description | Example |
|---|---|---|
| **Structural elements** | Physical components explicitly named and required | "a first chamber", "an elongated member", "a valve" |
| **Functional limitations** | What a structural element must do | "configured to seal", "operable to transmit", "adapted to retain" |
| **Compositional elements** | Material or substance requirements | "comprising at least 30% by weight of polyethylene", "a ceramic substrate" |
| **Process steps** | Sequential actions required for method claims | "heating to a temperature between X and Y", "applying a coating to the surface" |
| **Numerical limitations** | Specific values or ranges | "having a thickness of 0.5 to 2.0 mm", "at a frequency of 60 Hz" |

### 3.6 Potential Design-Around Opportunities

Atlas identifies claim boundaries available for design-around by:

- **Limiting element avoidance:** Identifying specific claim limitations (structural, functional, compositional) that the inventor's design could omit or replace with a non-infringing equivalent.
- **Range boundary analysis:** For numerical limitations, noting the claim's boundary values — designs operating outside those ranges fall outside the claim's scope.
- **Transitional phrase leverage:** Claims using `consisting of` (closed) are narrower than claims using `comprising` (open-ended) — `consisting of` claims cannot cover designs that add elements beyond those listed.
- **Functional equivalence risk:** Identifying limitations where a structural modification might still be argued to perform the same function — these are higher-risk design-around targets.
- **Independent claim element count:** Claims with more required elements are narrower — each element is an opportunity for a design-around path.

### 3.7 ClaimIntelligence Object

```typescript
ClaimIntelligence {
  patentNumber:             string          // Required — the patent this analysis covers
  independentClaims:        ParsedClaim[]   // Required — all independent claims parsed
  dependentClaims:          ParsedClaim[]   // Required — all dependent claims parsed
  claimHierarchy:           ClaimTree       // Required — tree structure of claim relationships
  broadestClaim:            ParsedClaim     // Required — the widest-scope independent claim
  keyInventiveConcepts:     string[]        // Required — core protected concepts extracted from independent claims
  protectedFeatures: {
    structuralElements:     string[]        // Optional — named structural components required
    functionalLimitations:  string[]        // Optional — functional requirements per element
    compositionalElements:  string[]        // Optional — material/substance requirements
    processSteps:           string[]        // Optional — sequential steps for method claims
    numericalLimitations:   NumericalLimit[] // Optional — [{value, unit, relationship: gte|lte|eq|range}]
  }
  designAroundOpportunities: DesignAroundHint[] // Optional — [{limitation, avoidanceStrategy, riskLevel}]
  claimCount:               number          // Required — total number of claims
  independentClaimCount:    number          // Required
  rawClaimsAvailable:       boolean         // Required — whether full claim text was retrieved
  analysisConfidence:       string          // Required — high | medium | low
  reasoning:                string          // Required — explanation of key findings
}
```

```typescript
ParsedClaim {
  claimNumber:        number
  claimType:          string          // independent | dependent
  parentClaimNumber:  number?         // Present for dependent claims
  preamble:           string          // Subject matter category
  transitionalPhrase: string          // comprising | consisting of | etc.
  body:               string          // Full body text
  limitations:        string[]        // Discrete claim elements
  text:               string          // Original full claim text
}
```

---

## Section 4 — Novelty & Prior Art Assessment

### 4.1 Novelty Scoring

Atlas scores the apparent novelty of the inventor's concept on a **0.0–1.0 scale**:

| Score Range | Interpretation |
|---|---|
| 0.80–1.00 | Strong novelty indicators — no prior art found that anticipates the core mechanism or combination |
| 0.60–0.79 | Moderate-to-strong novelty — related prior art exists but does not fully anticipate the claimed combination |
| 0.40–0.59 | Uncertain — meaningful prior art found; partial anticipation risk; differentiation unclear from current evidence |
| 0.20–0.39 | Weak novelty indicators — significant prior art overlap; the inventor's novel contribution may be narrow or unclear |
| 0.00–0.19 | Very weak — prior art closely anticipates the described mechanism; patentability risk is high |

**What drives high scores:**
- No prior art found disclosing the specific combination of elements the inventor describes
- Prior art exists in adjacent technology areas but does not disclose the core mechanism
- Inventor's novel elements are clearly distinct from the closest prior art claims
- Technology cluster shows low patent density in the specific sub-domain

**What drives low scores:**
- Prior art patents with independent claims that substantially overlap the inventor's described mechanism
- Multiple prior art references that together render the combination obvious
- Inventor's description closely matches the language of existing claims
- High filing activity in the exact technology sub-domain

**Partial anticipation:**
When prior art discloses some but not all elements of the inventor's combination, Atlas:
- Documents which elements are anticipated and which are not
- Flags the unanticipated elements as the potential basis for a narrowed claim
- Applies a partial score reduction proportional to the number of anticipated elements
- Notes in `reasoning` that novelty may survive on the uncovered elements

### 4.2 Prior Art Strength Categories

| Category | Label | Criteria |
|---|---|---|
| **Anticipatory** | `anticipatory` | A single prior art reference discloses every element of the inventor's described combination. Pre-dates the invention. If accurate, this reference defeats patentability without combination with other art. |
| **Obviousness-relevant** | `obviousness` | One or more references that, in combination, could render the invention obvious to a person having ordinary skill in the art (PHOSITA). No single reference anticipates, but the combination is close. |
| **Background art** | `background` | Prior art in the same technology field that establishes the state of the art but does not closely overlap with the inventor's specific mechanism or combination. |
| **Non-relevant** | `non_relevant` | Retrieved by the search but does not bear meaningfully on patentability or FTO for this invention. Retained in output but down-weighted in all scoring. |

### 4.3 Technology Overlap

Atlas measures overlap between the inventor's concept and each prior art patent's claims and description using:

- **Claim element matching:** How many claim limitations in the prior art patent correspond to elements in the inventor's described mechanism. Scored as a ratio: `matched_elements / total_claim_elements`.
- **Description overlap:** Semantic similarity between the patent's detailed description and the inventor's `productDescription` + `solutionSummary`. Measured via embedding cosine similarity.
- **Classification proximity:** CPC code distance between the prior art patent and the invention's primary classification.
- **Combined overlap score:** Weighted combination of the above, normalized to 0.0–1.0.

High technology overlap (> 0.70) triggers escalation to FTO analysis in Step 5.

### 4.4 Similarity Scoring

**Inputs:**
- `semanticSimilarity` — cosine similarity between patent embedding and invention description embedding (0.0–1.0)
- `claimElementMatchRatio` — fraction of the prior art patent's independent claim elements that match inventor's described elements (0.0–1.0)
- `classificationProximity` — CPC code distance converted to proximity score: exact subgroup = 1.0, same subclass = 0.75, same class = 0.50, same section = 0.25 (0.0–1.0)
- `keywordOverlap` — Jaccard similarity between the patent's keyword set and the invention's keyword set (0.0–1.0)

**Output scale:** 0.0–1.0 composite similarity score.

**Normalization:** Each input is normalized to 0.0–1.0 before weighting. Weights by search intent:
- Prior art intent: semantic similarity (35%), claim element matching (35%), classification proximity (20%), keyword overlap (10%)
- FTO intent: claim element matching (45%), semantic similarity (30%), classification proximity (15%), keyword overlap (10%)

### 4.5 Evidence Collection

For each prior art reference, Atlas collects:

| Field | Description |
|---|---|
| `patentNumber` | Normalized DOCDB format |
| `publicationDate` | ISO 8601 — critical for establishing prior art date |
| `priorityDate` | ISO 8601 — the legally relevant prior art date |
| `assignee` | Normalized assignee name and type |
| `priorArtStrength` | `anticipatory` \| `obviousness` \| `background` \| `non_relevant` |
| `claimElementsMatched` | List of specific claim limitations that correspond to inventor's elements |
| `relevantTextExcerpts` | Key passages from claims and description that support the overlap finding |
| `similarityScore` | 0.0–1.0 composite similarity |
| `technologyOverlapScore` | 0.0–1.0 technology overlap |
| `legalStatus` | `active` \| `expired` \| `abandoned` \| `pending` |
| `elementMapping` | Element-by-element matching table (see 4.6) |
| `reasoning` | Plain-language explanation of why this reference is relevant |

### 4.6 Reference Mapping

Atlas produces an element-by-element matching table for each prior art reference, mapping inventor concept elements to prior art claim elements:

```
Inventor Element                      | Prior Art Claim Element         | Match Type
--------------------------------------|----------------------------------|--------------------
"vacuum-sealed inner chamber"         | "hermetically sealed cavity"    | functional equivalent
"one-way pressure valve"              | "check valve configured to..."  | structural equivalent
"thermoplastic outer shell"           | [no corresponding element]      | not anticipated
"temperature range of 60°C to 90°C"  | "temperatures above 50°C"       | partially anticipated
```

**Match types:**
- `exact` — same element using same or synonymous language
- `functional_equivalent` — different structure, same claimed function
- `structural_equivalent` — different language, same structural concept
- `partially_anticipated` — overlaps but not fully covered
- `not_anticipated` — inventor's element has no corresponding prior art element

### 4.7 Output Schemas

```typescript
NoveltyAssessment {
  inventionId:            string          // Required
  noveltyScore:           number          // Required — 0.0–1.0
  noveltyLabel:           string          // Required — strong | moderate | uncertain | weak | very_weak
  priorArtReferences:     PriorArtReference[] // Required — all assessed references
  anticipatoryRefs:       PriorArtReference[] // Required — subset: anticipatory strength only
  obviousnessRefs:        PriorArtReference[] // Required — subset: obviousness-relevant only
  unanticipatedElements:  string[]        // Required — inventor elements not found in prior art
  anticipatedElements:    string[]        // Required — inventor elements found in prior art
  partialAnticipation:    boolean         // Required
  noveltyBasis:           string[]        // Required — what the novelty, if any, appears to rest on
  coverageGaps:           string[]        // Optional — technology areas not searched that could affect this score
  analysisConfidence:     string          // Required — high | medium | low
  reasoning:              string          // Required
}
```

```typescript
PriorArtReference {
  patentNumber:           string          // Required
  title:                  string          // Required
  priorityDate:           string          // Required — ISO 8601
  publicationDate:        string          // Required — ISO 8601
  assignee:               string          // Required
  assigneeType:           string          // Required — competitor | active_filer | npe | academic | individual
  legalStatus:            string          // Required — active | expired | abandoned | pending | unknown
  priorArtStrength:       string          // Required — anticipatory | obviousness | background | non_relevant
  similarityScore:        number          // Required — 0.0–1.0
  technologyOverlapScore: number          // Required — 0.0–1.0
  claimElementsMatched:   string[]        // Required — specific claim limitations matched
  relevantTextExcerpts:   string[]        // Required — supporting passages
  elementMapping:         ElementMapRow[] // Required — element-by-element matching table
  jurisdiction:           string[]        // Required — jurisdictions where this patent is active
  familyId:               string?         // Optional — INPADOC family ID if known
  reasoning:              string          // Required — plain-language relevance explanation
}
```

---

## Section 5 — Freedom-to-Operate Indicators

> **⚠ ATLAS DISCLAIMER — READ BEFORE USING FTO INDICATORS**
>
> Atlas provides decision support, not legal advice. The FTO indicators below are research signals derived from automated patent analysis. They are NOT legal conclusions about whether the inventor's product infringes any patent claim.
>
> Freedom-to-operate analysis is a legal determination that requires qualified patent counsel reviewing the specific claims of specific patents against the specific design and intended use of the inventor's product. Atlas's FTO indicators reduce the research burden for that analysis — they do not replace it.
>
> Founders should consult a qualified patent attorney before making any product development, commercialization, or IP-related decisions based on these indicators.

### 5.1 Potential Overlap Indicator

**Definition:** A signal that a patent's claims may read on the inventor's intended product.

**Signals that indicate potential overlap:**
- Independent claim element count where ≥ 70% of elements correspond to inventor's described product features
- Claim language that covers the functional result the inventor's product achieves, not just the specific implementation
- Broad claim language using open-ended transitions (`comprising`) with few limiting elements
- Assignee known to enforce patents in the technology area

**Data sources:** `ClaimIntelligence.claimElementsMatched`, `PatentRecord.legalStatus`, `PatentRecord.assigneeType`.

### 5.2 Claim Proximity Score

**Definition:** A 0.0–1.0 scored indicator of how close the inventor's concept is to each independent claim.

**Scoring:**
- 0.0–0.29: Low proximity — few or no claim elements correspond to the invention's described features
- 0.30–0.59: Moderate proximity — meaningful overlap on some elements; full scope unclear
- 0.60–0.79: High proximity — the majority of claim elements correspond; potential reading on the invention
- 0.80–1.00: Very high proximity — the claim closely tracks the inventor's described product; warrants attorney review

**Computation:** Weighted combination of `claimElementMatchRatio` (50%), `semanticSimilarity` (30%), and `functionalEquivalenceScore` (20%).

### 5.3 Jurisdiction Awareness

**Indicators tracked per patent:**
- Active legal status in the US jurisdiction (primary concern for US-market founders)
- Active legal status in EP jurisdiction (relevant for European market plans)
- PCT pending status — international application filed but national phase not yet entered
- Active status in JP, CN, or other jurisdictions relevant to the inventor's manufacturing or market plan
- Jurisdiction gaps — markets where the patent does NOT have active coverage (potential safe harbor)

**Data sources:** `PatentRecord.legalStatusByJurisdiction`, `PatentFamily.legalStatusByJurisdiction`.

### 5.4 Expired Patents

**Detection logic:**
- `legalStatus: expired` confirmed by legal status endpoint for the relevant jurisdiction
- Expiration date computed where not directly available: filing date + 20 years (utility), filing date + 15 years (design)

**Why expired ≠ automatically safe:**
- **Continuation risk:** An expired patent may have spawned pending continuation applications with updated claims that are currently active. The continuation's claims may be as broad as or broader than the expired parent.
- **Related family members:** Patent families often include continuation-in-parts, divisionals, and foreign counterparts — some of which may still be active in relevant jurisdictions.
- **Atlas flag:** Every expired patent with active family members is flagged `continuationRisk: true` and linked to the active family members for review.

### 5.5 Abandoned Applications

**Detection logic:**
- `legalStatus: abandoned` for published applications
- Verified through USPTO application status check or equivalent national office confirmation

**Why abandoned ≠ automatically safe:**
- **Refiling risk:** An abandoned application may have been refiled as a continuation — the refiled application may be active under a different publication number.
- **Prosecution history estoppel:** Claims abandoned during prosecution may limit future claim scope, which can work in the inventor's favor — but requires attorney analysis.
- **Atlas flag:** Abandoned applications are retained in the analysis as prior art (they affect patentability) but are down-weighted as FTO concerns.

### 5.6 Patent Families

**Family tracing:**
- Atlas retrieves INPADOC family data for all patents with claim proximity score ≥ 0.50.
- The full family is examined, not just the representative patent.

**Why a family hit requires evaluating all members:**
- Claims differ across family members — the EP counterpart may claim the invention more broadly than the US patent.
- Legal status differs across family members — the US patent may be expired while the EP counterpart is still active.
- Continuation applications are family members — they may have broader or differently-scoped claims than the original grant.

**Atlas behavior:** Any family with at least one active member in a relevant jurisdiction is flagged `activeFamilyRisk: true` regardless of the representative patent's status.

### 5.7 Design Patent Interactions

**Flagging logic:**
- Atlas identifies when a design patent covers the ornamental appearance of a product category matching the inventor's product category.
- Design patent proximity is evaluated on product appearance characteristics, not mechanical function — separate from utility patent proximity scoring.
- Flags products where the inventor's product appearance could be confused with the protected ornamental design.

**Data sources:** Design patent classification codes (D-series USPC, Locarno classes in CPC), product category keywords, visual similarity signals from product descriptions.

**Indicator:** `designPatentFlag: true` when a relevant design patent is identified. No proximity score is assigned — design patent analysis requires attorney visual comparison.

### 5.8 Utility Patent Interactions

**Independent claim mapping:**
- For each utility patent with claim proximity ≥ 0.40, Atlas maps the inventor's product features against each independent claim element-by-element.
- Claims where all elements are present in the inventor's described product are flagged `potentialReadOn: true`.

**Dependent claim proximity:**
- Dependent claims narrow the independent claim — a product that does not practice a dependent claim's additional limitation may still practice the independent claim.
- Dependent claim proximity scores are reported separately and are typically lower than independent claim scores.

### 5.9 FTOIndicators Object

```typescript
FTOIndicators {
  inventionId:              string              // Required
  overallFTOSignal:         string              // Required — low_concern | moderate_concern | high_concern | requires_counsel
  analysisDate:             string              // Required — ISO 8601
  patentsWithHighProximity: FTOPatentIndicator[] // Required — patents with claim proximity ≥ 0.60
  activePatentCount:        number              // Required — active patents in relevant jurisdictions
  expiredPatentCount:       number              // Required
  abandonedApplicationCount: number             // Required
  continuationRiskFlags:    string[]            // Required — patent numbers with active continuations
  activeFamilyRiskFlags:    string[]            // Required — family IDs with at least one active member
  designPatentFlags:        string[]            // Required — design patent numbers flagged for review
  jurisdictionCoverage:     JurisdictionStatus[] // Required — [{jurisdiction, activePatentCount, highProximityCount}]
  disclaimer:               string              // Required — must include full Atlas FTO disclaimer text
  reasoning:                string              // Required
}
```

```typescript
FTOPatentIndicator {
  patentNumber:             string              // Required
  claimProximityScore:      number              // Required — 0.0–1.0
  potentialReadOn:          boolean             // Required — any independent claim with all elements matched
  assigneeName:             string              // Required
  assigneeType:             string              // Required
  legalStatus:              string              // Required — per primary jurisdiction
  activeJurisdictions:      string[]            // Required — where this patent is currently active
  continuationRisk:         boolean             // Required
  activeFamilyRisk:         boolean             // Required
  designPatentFlag:         boolean             // Required
  expirationDate:           string?             // Optional — ISO 8601
  independentClaimCount:    number              // Required
  reasoning:                string              // Required
}
```

**Disclaimer text Atlas must include when surfacing FTO indicators:**

> "These are research signals, not legal conclusions. Atlas has identified patent indicators that may be relevant to your freedom to develop and commercialize this product. This analysis does not constitute a freedom-to-operate opinion. Only a qualified patent attorney can provide a legal FTO opinion. Do not make commercialization decisions based solely on these indicators."

---

## Section 6 — Risk Assessment

> **ATLAS DISCLAIMER:** Atlas provides decision support, not legal advice. Risk indicators are not legal conclusions. Founders should consult qualified patent counsel before making any IP-related business or development decisions.

### 6.1 Risk Categories

#### Very Low — 0.0–0.19

**Label:** `very_low`

**Score range:** 0.00–0.19

**Contributing factors:**
- No active patents with claim proximity > 0.30
- Technology space has low patent density
- Expired or abandoned art only; no active continuations found
- No active competitor assignees in the technology class
- Coverage report shows high completeness

**Example scenario:** An inventor developing a novel combination of existing food ingredients with no patent equivalent; prior art search surfaces only background art and expired patents.

**Recommended founder response:** Continue development with standard IP diligence. Consider whether the novelty indicators are strong enough to support a provisional patent application. Maintain documented records of conception and development.

---

#### Low — 0.20–0.39

**Label:** `low`

**Score range:** 0.20–0.39

**Contributing factors:**
- Active patents present but with low claim proximity (0.30–0.49)
- Technology space has moderate patent density
- Some related art but no clear FTO concern
- Assignees not known for aggressive enforcement in this area

**Example scenario:** Inventor developing a new type of ergonomic grip; related patents cover the general category but use narrower claim language that does not extend to the inventor's specific mechanism.

**Recommended founder response:** Proceed with development. Commission a focused FTO review on the 2–3 patents with the highest claim proximity scores before manufacturing. Document design decisions that distinguish from the prior art.

---

#### Moderate — 0.40–0.59

**Label:** `moderate`

**Score range:** 0.40–0.59

**Contributing factors:**
- One or more active patents with claim proximity in the 0.50–0.69 range
- Broad independent claims that may extend to the invention's function
- Active assignees with enforcement history in adjacent technology areas
- Patent family coverage across multiple jurisdictions

**Example scenario:** Inventor developing a new packaging mechanism; an active patent with a broad `comprising` claim covers the general sealing function, but its specific structural elements may differ from the inventor's approach.

**Recommended founder response:** Consult a patent attorney before finalizing the product design. Request a focused FTO opinion on the 1–3 highest-proximity patents. Explore design-around paths for the highest-overlap claim limitations. Document the distinctions between the invention and the flagged patents.

---

#### High — 0.60–0.79

**Label:** `high`

**Score range:** 0.60–0.79

**Contributing factors:**
- One or more active patents with claim proximity ≥ 0.70
- Potential read-on of inventor's product on at least one independent claim
- Large, active assignee with demonstrated IP enforcement history
- International family coverage in the inventor's target markets
- Recent continuation application activity

**Example scenario:** Inventor developing a consumer device that closely tracks the functional and structural description of an independent claim held by an active, large-cap technology company with known enforcement programs.

**Recommended founder response:** Engage a patent attorney immediately before any manufacturing or commercialization activity. Obtain a formal FTO opinion. Identify and evaluate design-around paths. Do not discuss the specific invention or its design publicly until legal guidance is obtained.

---

#### Very High — 0.80–1.00

**Label:** `very_high`

**Score range:** 0.80–1.00

**Contributing factors:**
- Active patent(s) with claim proximity ≥ 0.80
- High likelihood of read-on based on element-by-element analysis
- Patent held by an NPE or patent assertion entity (PAE) known for active licensing and litigation
- Multiple active family members across relevant jurisdictions
- Continuation applications pending with potentially broader claims than the parent grant

**Example scenario:** Inventor describing a product that matches nearly verbatim the claim language of an active, recently-maintained patent held by a known NPE that has filed infringement suits against similar products in the past two years.

**Recommended founder response:** Halt commercialization planning. Engage a patent attorney immediately. Do not manufacture or publicly demonstrate the product. The attorney should assess the risk of literal infringement, doctrine of equivalents exposure, and whether any licensing, design-around, or invalidity challenge path is viable.

---

### 6.2 Risk Factors

The following factors contribute to the composite risk score:

| Factor | Contribution | Notes |
|---|---|---|
| **Active patents with high claim proximity** | Highest | Patents with proximity ≥ 0.70 drive the score most |
| **Large, active assignees** | High | Fortune 500 or known enforcement-active companies add risk |
| **NPE / PAE assignees** | High | Non-practicing entities with enforcement history are high-risk signals |
| **Recent filing activity** | Medium-High | High filing volume in the technology space in past 2 years indicates an active IP battlefield |
| **International family coverage** | Medium | Families active in the inventor's target markets increase commercial risk |
| **Continuation application risk** | Medium | Pending continuations may produce broader claims; unquantifiable until published |
| **Design patent interactions** | Variable | Flagged only when product appearance is relevant; weight depends on visual proximity |

### 6.3 RiskAssessment Object

```typescript
RiskAssessment {
  inventionId:              string              // Required
  riskCategory:             string              // Required — very_low | low | moderate | high | very_high
  riskScore:                number              // Required — 0.0–1.0
  topContributingFactors:   RiskFactor[]        // Required — top 5 factors, ordered by contribution
  activeHighProximityCount: number              // Required — patents with proximity ≥ 0.60
  largeAssigneeFlags:       string[]            // Required — assignee names flagged as large/enforcement-active
  npeFlags:                 string[]            // Required — assignee names flagged as NPEs
  recentFilingActivityLevel: string             // Required — high | medium | low
  internationalFamilyCoverage: boolean          // Required
  continuationRiskPresent:  boolean             // Required
  designPatentRiskPresent:  boolean             // Required
  coverageConfidence:       string              // Required — high | medium | low (from CoverageReport)
  disclaimer:               string              // Required — full Atlas disclaimer text
  reasoning:                string              // Required
}
```

```typescript
RiskFactor {
  label:            string          // Required — human-readable factor name
  contribution:     string          // Required — high | medium | low
  evidence:         string[]        // Required — patent numbers or data points supporting this factor
  reasoning:        string          // Required
}
```

---

## Section 7 — Opportunity Identification

### 7.1 Opportunity Types

#### White-Space Opportunities

**Definition:** Technology areas, CPC sub-classifications, or functional domains within the broader technology space where no active patents cover the specific combination the inventor is pursuing.

**Detection:**
- Technology clusters with zero active patents in the specific sub-domain
- CPC subgroups with low filing density combined with high novelty score on the inventor's elements
- Geographical white space — jurisdictions where the technology is not patented

**Inventor value:** Confirms where the invention is free to operate without IP risk; suggests where a patent application would face minimal prior art obstacles.

---

#### Design-Around Opportunities

**Definition:** Specific claim limitations in high-proximity patents that the inventor's design could avoid by making targeted modifications.

**Detection:**
- Independent claim limitations with a clear structural or functional equivalent the inventor could substitute
- Numerical boundary limitations the inventor's design could operate outside of
- Compositional limitations the inventor's design could avoid by material substitution
- Structural element requirements the inventor's design could achieve through an alternative mechanism

**Output fields:** Specific claim number, specific limitation, proposed avoidance strategy, risk level of the proposed approach.

---

#### Licensing Opportunities

**Definition:** Patents that may be more economically favorable to license than to design around.

**Indicators of licensing suitability:**
- `assigneeType: individual` or `assigneeType: academic` — smaller entities may be more amenable to licensing
- `assigneeType: npe` without known aggressive enforcement history — NPEs often have economic incentive to license
- Patent expiring within 3 years — licensing cost may be lower given short remaining term
- Patent is not in the assignee's core business area — strategic value is lower, licensing price may be more reasonable

**Output:** License-candidate patents with reasoning; no licensing price estimates — pricing requires attorney negotiation.

---

#### Expired Patent Opportunities

**Definition:** High-value expired patents whose disclosed technology and embodiments are now available for use by anyone.

**Detection:**
- `legalStatus: expired` with no active continuations or family members
- High technology overlap with the inventor's concept — the disclosed embodiments are relevant starting points
- Detailed specification with working examples that the inventor could use as technical references

**Inventor value:** Expired patents represent freely available prior art — their technical disclosures can be used without restriction. A founder aware of a highly relevant expired patent has a known-good technical foundation to build from.

---

#### Technology Gaps

**Definition:** Areas in the prior art landscape where existing patents address parts of the problem but no complete solution exists — leaving room for a combining or improving invention.

**Detection:**
- Multiple prior art patents each covering a different component of the inventor's solution, with no single patent combining them
- Prior art patents with narrow claims that do not cover the inventor's improved version
- Technology cluster analysis revealing a functional gap between what the prior art discloses and what the current state of the art achieves

---

#### Market Differentiation

**Definition:** How the inventor's novelty gaps translate into marketing differentiation.

**Logic:**
- Elements that are not anticipated by prior art represent genuinely novel capabilities
- Genuinely novel capabilities are legitimate product differentiators — "first to..." claims that are supportable by the patent landscape
- Atlas maps unanticipated elements to potential marketing messages

**Output:** List of unanticipated elements with suggested plain-language differentiation statements.

---

#### Potential Innovation Directions

**Definition:** Adjacent technology spaces with low patent density that represent viable expansion or improvement paths for the invention.

**Detection:**
- Adjacent CPC codes with low filing activity
- Technology clusters that solve related problems but are not crowded
- White-space areas adjacent to the inventor's primary technology domain

**Output:** Adjacent technology directions with filing density and rough novelty outlook.

---

### 7.2 OpportunityReport Object

```typescript
OpportunityReport {
  inventionId:              string              // Required
  opportunityItems:         OpportunityItem[]   // Required — all identified opportunities
  whiteSpaceCount:          number              // Required
  designAroundCount:        number              // Required
  licensingCandidateCount:  number              // Required
  expiredPatentCount:       number              // Required
  technologyGapCount:       number              // Required
  topOpportunity:           OpportunityItem     // Required — highest-value opportunity identified
  reasoning:                string              // Required
}
```

```typescript
OpportunityItem {
  opportunityId:            string              // Required — unique identifier
  opportunityType:          string              // Required — white_space | design_around | licensing | expired_patent | technology_gap | market_differentiation | innovation_direction
  title:                    string              // Required — short human-readable label
  description:              string              // Required — plain-language opportunity description
  evidence:                 string[]            // Required — patent numbers, classification codes, or other data supporting this opportunity
  relatedPatentNumbers:     string[]            // Optional — patents directly associated with this opportunity
  confidence:               string              // Required — high | medium | low
  founderActionRequired:    string              // Required — what the founder should do with this opportunity
  reasoning:                string              // Required
}
```

---

## Section 8 — Recommendations

### 8.1 Recommendation Taxonomy

#### CONTINUE_DEVELOPMENT

**Trigger conditions:**
- Novelty score ≥ 0.65
- Risk category is `very_low` or `low`
- No patents with claim proximity ≥ 0.60 identified
- Coverage confidence is `medium` or `high`

**Example text:** "Your invention's core mechanism does not appear to be anticipated by active prior art in the searched patent landscape. Novelty indicators are strong. Risk level is low. You can continue development with standard IP diligence."

---

#### MODIFY_DESIGN

**Trigger conditions:**
- One or more patents with claim proximity 0.60–0.79
- Design-around opportunities identified in `OpportunityReport`
- Risk category `moderate` or lower

**Example text:** "One patent has been identified with a moderately high claim proximity to your described mechanism. Specific design-around paths are available that could reduce this proximity. Consider modifying [specific element] to avoid [specific claim limitation] in [patent number]. Review the design-around analysis in Section 7 before finalizing your product specification."

---

#### CONSULT_PATENT_COUNSEL

**Trigger conditions:**
- Risk category `high` or `very_high`
- One or more patents with claim proximity ≥ 0.70
- Patent family with active members across multiple jurisdictions
- NPE assignee with enforcement history flagged

**Example text:** "High-risk indicators have been identified in the patent landscape. One or more active patents have claim language that may extend to your described product. Atlas recommends engaging a qualified patent attorney before proceeding with manufacturing, investment, or public disclosure."

---

#### INVESTIGATE_SPECIFIC_PATENTS

**Trigger conditions:**
- Patents identified where full claim text was not retrieved
- Patents with moderate-high proximity where family coverage is incomplete
- Patents where legal status is `unknown`

**Example text:** "[Patent number] returned in the search with indicators of relevance but without full claim text. Manual review of this patent's independent claims is recommended before finalizing your FTO assessment."

---

#### MONITOR_COMPETITORS

**Trigger conditions:**
- Active competitor assignees filing in the technology class identified
- Recent filing activity (within 12 months) by known competitors
- Competitor assignees with patents in the 0.40–0.60 proximity range

**Example text:** "[Competitor name] has filed [N] patents in your technology area in the past 12 months. Their recent filings should be monitored as they may define the IP boundaries of the competitive landscape. Atlas will flag new relevant filings from this assignee."

---

#### COLLECT_ADDITIONAL_EVIDENCE

**Trigger conditions:**
- Coverage report shows degraded provider coverage
- Novelty score is in the `uncertain` range (0.40–0.59) and coverage is incomplete
- Key jurisdiction not searched due to provider failure
- Analysis confidence is `low`

**Example text:** "The patent search did not achieve full coverage in [specific area / jurisdiction] due to provider limitations at the time of search. The novelty assessment is based on partial evidence. Running an expanded search would improve confidence in these findings before relying on them for IP strategy decisions."

---

#### IMPROVE_DIFFERENTIATION

**Trigger conditions:**
- Specific inventor-described elements are anticipated by prior art
- Novelty score 0.30–0.59
- Unanticipated elements identified but not prominent in inventor's description

**Example text:** "The prior art suggests that [specific element] of your described invention has been previously claimed. However, [specific unanticipated element] does not appear in the searched prior art and may represent your strongest basis for a novel claim. Strengthening your product's design around [specific unanticipated element] would both improve patentability prospects and provide a defensible marketing differentiator."

---

#### CONSIDER_FILING

**Trigger conditions:**
- Novelty score ≥ 0.70
- White-space opportunities identified in the technology cluster
- Risk category `very_low` or `low`
- Inventor has not indicated they are already pursuing a patent filing

**Example text:** "Strong novelty indicators and white space have been identified in your technology area. The prior art search did not surface active patents that anticipate your described mechanism. This may be an appropriate time to discuss a provisional patent application with an IP attorney to establish a priority date before continuing product development."

---

### 8.2 Recommendation Priority Levels

| Level | When Used |
|---|---|
| `URGENT` | Immediate action required before any further development or disclosure — triggered by very high risk or active enforcement-risk signals |
| `HIGH` | Important action that should be completed before the next stage milestone — triggered by high risk or significant novelty concerns |
| `MEDIUM` | Meaningful action that should be addressed within the current stage — triggered by moderate risk or significant opportunity |
| `LOW` | Beneficial action but not time-critical — triggered by low-risk findings or minor refinements |
| `INFORMATIONAL` | Context and awareness only — no specific action required |

### 8.3 Output Schemas

```typescript
RecommendationSet {
  inventionId:            string              // Required
  recommendations:        Recommendation[]   // Required — ordered by priority (URGENT first)
  urgentCount:            number              // Required
  highCount:              number              // Required
  topRecommendationType:  string              // Required — the most important recommendation type
  overallGuidance:        string              // Required — one-paragraph plain-language synthesis
  analysisDate:           string              // Required — ISO 8601
}
```

```typescript
Recommendation {
  recommendationId:       string              // Required — unique identifier
  type:                   string              // Required — CONTINUE_DEVELOPMENT | MODIFY_DESIGN | CONSULT_PATENT_COUNSEL | INVESTIGATE_SPECIFIC_PATENTS | MONITOR_COMPETITORS | COLLECT_ADDITIONAL_EVIDENCE | IMPROVE_DIFFERENTIATION | CONSIDER_FILING
  priority:               string              // Required — URGENT | HIGH | MEDIUM | LOW | INFORMATIONAL
  title:                  string              // Required — short display title
  text:                   string              // Required — full recommendation text shown to founder
  triggerEvidence:        string[]            // Required — patent numbers, scores, or findings that triggered this recommendation
  relatedPatentNumbers:   string[]            // Optional — patents directly relevant to this recommendation
  actionRequired:         boolean             // Required
  reasoning:              string              // Required — internal explanation of why this recommendation was generated
}
```

---

## Section 9 — Structured Outputs

### 9.1 PatentAnalysisReport

Top-level container for all analysis output.

```typescript
PatentAnalysisReport {
  reportId:               string              // Required — unique report identifier
  inventionId:            string              // Required
  analysisVersion:        string              // Required — version of the analysis engine that produced this
  analysisDate:           string              // Required — ISO 8601
  searchPackageIds:       string[]            // Required — which search packages were analyzed
  coverageQuality:        string              // Required — full | partial | degraded (from CoverageReport)

  claimIntelligence:      ClaimIntelligence[] // Required — one per analyzed patent (top-ranked)
  noveltyAssessment:      NoveltyAssessment   // Required
  priorArtSummary:        PriorArtSummary     // Required
  riskSummary:            RiskSummary         // Required
  ftoIndicators:          FTOIndicators       // Required
  opportunityReport:      OpportunityReport   // Required
  designAroundReport:     DesignAroundReport  // Required
  recommendationSet:      RecommendationSet   // Required

  patentsAnalyzed:        number              // Required — total patents included in the analysis
  patentsWithClaimText:   number              // Required — patents where full claims were available
  analysisConfidence:     string              // Required — high | medium | low
  disclaimer:             string              // Required — full Atlas legal disclaimer
}
```

---

### 9.2 NoveltyAssessment

Defined in full in Section 4.7 above.

Key fields summary:

```typescript
NoveltyAssessment {
  noveltyScore:           number              // Required — 0.0–1.0
  noveltyLabel:           string              // Required — strong | moderate | uncertain | weak | very_weak
  anticipatoryRefs:       PriorArtReference[] // Required
  unanticipatedElements:  string[]            // Required
  anticipatedElements:    string[]            // Required
  partialAnticipation:    boolean             // Required
  noveltyBasis:           string[]            // Required
  analysisConfidence:     string              // Required
  reasoning:              string              // Required
}
```

---

### 9.3 PriorArtSummary

Aggregated view across all prior art references.

```typescript
PriorArtSummary {
  inventionId:                string              // Required
  totalReferences:            number              // Required — all references retrieved
  anticipatoryCount:          number              // Required
  obviousnessCount:           number              // Required
  backgroundCount:            number              // Required
  nonRelevantCount:           number              // Required
  activeReferences:           number              // Required — references with active legal status
  expiredReferences:          number              // Required
  topPriorArtReferences:      PriorArtReference[] // Required — top 10 by similarity score
  earliestPriorArtDate:       string              // Required — ISO 8601 — oldest relevant reference found
  assigneeSummary:            AssigneeSummary[]   // Required — [{assigneeName, referenceCount, assigneeType}]
  technologyAreaCoverage:     string[]            // Required — CPC codes covered by the prior art found
  reasoning:                  string              // Required
}
```

---

### 9.4 RiskSummary

Condensed risk view for display and downstream use.

```typescript
RiskSummary {
  riskCategory:               string              // Required — very_low | low | moderate | high | very_high
  riskScore:                  number              // Required — 0.0–1.0
  topContributingFactors:     RiskFactor[]        // Required — top 3 factors
  activeHighProximityCount:   number              // Required — patents with proximity ≥ 0.60
  primaryRiskPatent:          string?             // Optional — patent number representing highest single risk
  requiresImmediateAction:    boolean             // Required
  disclaimer:                 string              // Required
}
```

---

### 9.5 OpportunityReport

Defined in full in Section 7.2 above.

Key fields summary:

```typescript
OpportunityReport {
  opportunityItems:           OpportunityItem[]   // Required
  whiteSpaceCount:            number              // Required
  designAroundCount:          number              // Required
  topOpportunity:             OpportunityItem     // Required
  reasoning:                  string              // Required
}
```

---

### 9.6 DesignAroundReport

Specific claim limitations, avoidance strategies, and evidence.

```typescript
DesignAroundReport {
  inventionId:                string              // Required
  designAroundOpportunities:  DesignAroundItem[]  // Required
  highConfidenceCount:        number              // Required — opportunities with confidence: high
  totalOpportunityCount:      number              // Required
  reasoning:                  string              // Required
}
```

```typescript
DesignAroundItem {
  itemId:                     string              // Required
  patentNumber:               string              // Required — patent containing the claim to avoid
  claimNumber:                number              // Required — specific claim number
  targetedLimitation:         string              // Required — the specific claim limitation to avoid
  avoidanceStrategy:          string              // Required — plain-language description of how to avoid it
  modificationRequired:       string              // Required — what would need to change in the inventor's design
  riskLevel:                  string              // Required — low | medium | high
  riskRationale:              string              // Required — why this design-around carries the stated risk
  confidence:                 string              // Required — high | medium | low
  evidence:                   string[]            // Required — basis for the avoidance strategy
  reasoning:                  string              // Required
}
```

---

### 9.7 RecommendationSet

Defined in full in Section 8.3 above.

Key fields summary:

```typescript
RecommendationSet {
  recommendations:            Recommendation[]   // Required — ordered by priority
  urgentCount:                number             // Required
  topRecommendationType:      string             // Required
  overallGuidance:            string             // Required
}
```

---

### 9.8 FounderReviewPackage

Curated subset of the full analysis, formatted for Atlas UI presentation and human review.

```typescript
FounderReviewPackage {
  inventionId:                string              // Required
  reportId:                   string              // Required — links to PatentAnalysisReport
  generatedAt:                string              // Required — ISO 8601

  // Summary tier — shown at top of founder review screen
  noveltyScore:               number              // Required — 0.0–1.0
  noveltyLabel:               string              // Required
  riskCategory:               string              // Required
  riskScore:                  number              // Required
  topRecommendationType:      string              // Required
  overallGuidance:            string              // Required — plain-language synthesis paragraph

  // Key findings — the 5 most important findings for founder review
  keyFindings:                KeyFinding[]        // Required — max 5 items
  urgentRecommendations:      Recommendation[]    // Required — all URGENT priority recommendations
  highRecommendations:        Recommendation[]    // Required — all HIGH priority recommendations

  // Top prior art — the 3 most relevant references
  topPriorArt:                PriorArtReference[] // Required — top 3 by similarity score

  // Top risks and opportunities
  topRiskFactors:             RiskFactor[]        // Required — top 3 contributing risk factors
  topOpportunities:           OpportunityItem[]   // Required — top 3 opportunities

  // Disclaimer — must be displayed in UI
  disclaimer:                 string              // Required — full Atlas legal disclaimer text
  disclaimerAcknowledged:     boolean             // Required — whether founder has acknowledged disclaimer
                                                  //   (set false on generation; set true on UI acknowledgment)

  // Coverage context
  coverageQuality:            string              // Required — full | partial | degraded
  coverageNote:               string?             // Optional — plain-language note when coverage is degraded
}
```

```typescript
KeyFinding {
  findingId:              string          // Required
  title:                  string          // Required — short display title
  summary:                string          // Required — 1–2 sentence plain-language summary
  severity:               string          // Required — critical | high | medium | low | informational
  category:               string          // Required — novelty | risk | fto | opportunity | recommendation
  relatedPatentNumbers:   string[]        // Optional
  actionRequired:         boolean         // Required
}
```

---

## Section 10 — Engineering Principles

**Never claim legal certainty.**
- Every output field that expresses a finding uses probabilistic language: "indicates", "suggests", "may", "potential", "appears to".
- All output schemas include a `disclaimer` field. Required fields are never omitted; they receive explicit uncertainty annotations when confidence is low.
- No Atlas output ever states that a patent is infringed, that a product is cleared for commercialization, or that a claim is valid or invalid.

**Never replace patent counsel.**
- Atlas reduces the research burden for the attorney-client engagement. It pre-identifies the patents an attorney should examine. It does not replace the attorney's legal analysis.
- Every high-risk or complex finding is paired with a `CONSULT_PATENT_COUNSEL` recommendation.
- The `FounderReviewPackage` explicitly frames Atlas analysis as preparation for — not a substitute for — qualified IP legal advice.

**Clearly distinguish evidence from conclusions.**
- Every output schema that contains a conclusion field (score, label, finding) also contains a corresponding `reasoning` field and an `evidence` field documenting the specific data that produced the conclusion.
- No score is presented without its derivation being traceable to source patent records.

**Provide transparent reasoning.**
- All `ClaimIntelligence`, `NoveltyAssessment`, `FTOIndicators`, `RiskAssessment`, and `RecommendationSet` objects contain a `reasoning` field.
- The `reasoning` field is plain-language text — human-readable without technical patent knowledge.
- Atlas never produces a score without explaining what drove it.

**Support human review.**
- Every analysis output is structured for human review: ordered by priority, labeled with confidence levels, linked to source patent records.
- `FounderReviewPackage.disclaimerAcknowledged` is set `false` on generation — the founder must actively acknowledge the disclaimer before acting on findings.
- All findings carry `analysisConfidence` levels so reviewers can weight findings accordingly.
- No analysis conclusion is permanent — a qualified reviewer can override, annotate, or dismiss any finding.

**Reduce founder effort.**
- Pre-filtering: only top-ranked, most relevant patents receive full claim analysis. Founders are not presented with 200 raw records.
- Pre-ranking: `FounderReviewPackage.keyFindings` surfaces the 5 most important findings. Founders begin with what matters most.
- Pre-summarization: `overallGuidance` provides a synthesized plain-language reading of the full analysis in one paragraph.
- Atlas handles the research; the founder reviews the findings and applies judgment to the decisions those findings inform.

**Remain provider independent.**
- No analysis logic references a specific patent data provider.
- All inputs to the Analysis subsystem are normalized `PatentRecord` and `ClaimSummary` objects — provider identity is irrelevant to the analysis.
- Switching providers does not require changes to the Analysis pipeline.

**Follow Atlas Owns Execution.**
- The Analysis engine runs automatically when triggered by the Patent Intelligence stack (after Search Engine completes).
- Founders do not initiate analysis manually. They review results.
- Per the Automation Constitution: Atlas executes, founders review, founders approve. Analysis is Atlas's responsibility. Judgment on the findings is the founder's.

---

## Summary

| Section | What It Defines |
|---|---|
| Section 1 | Analysis subsystem purpose, stack position, inputs/outputs, and permanent design constraints |
| Section 2 | Full 10-step analysis pipeline with inputs, processing, and outputs per step |
| Section 3 | Claim parsing, independent/dependent detection, claim hierarchy, protected features, design-around opportunities, and ClaimIntelligence schema |
| Section 4 | Novelty scoring, prior art strength categories, technology overlap, similarity scoring, evidence collection, reference mapping, and NoveltyAssessment / PriorArtReference schemas |
| Section 5 | FTO indicators (potential overlap, claim proximity, jurisdiction, expired patents, abandoned applications, families, design patents, utility patents), FTOIndicators schema, and required disclaimer language |
| Section 6 | Five risk categories (Very Low through Very High) with contributing factors, example scenarios, founder responses, and RiskAssessment schema |
| Section 7 | Seven opportunity types (white space, design-around, licensing, expired patents, technology gaps, market differentiation, innovation directions) and OpportunityReport schema |
| Section 8 | Eight recommendation types with trigger conditions and example text, five priority levels, and RecommendationSet schema |
| Section 9 | Complete field-level schemas for all eight output objects: PatentAnalysisReport, NoveltyAssessment, PriorArtSummary, RiskSummary, OpportunityReport, DesignAroundReport, RecommendationSet, FounderReviewPackage |
| Section 10 | Eight engineering principles: legal certainty prohibition, no replacement of counsel, evidence/conclusion separation, transparent reasoning, human review support, founder effort reduction, provider independence, Atlas Owns Execution |

**Subsequent documents will define:**
- Confidence framework for patent research
- Caching and incremental update strategy
- Cost controls and provider selection economics
- Founder review flow for patent findings
- Patent monitoring and alerting (post-launch)

---

*End of ATLAS_PATENT_INTELLIGENCE_ANALYSIS.md*
*Version 1.0 — July 2026*
*Analysis specification only. No implementation. No code changes.*
*Source: ATLAS_AUTOMATION_CONSTITUTION.md · ATLAS_PATENT_INTELLIGENCE_DISCOVERY.md · ATLAS_PATENT_INTELLIGENCE_SEARCH_ENGINE.md*
