# ATLAS PATENT INTELLIGENCE — DISCOVERY FOUNDATION

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Specification — Not Yet Implemented**
**Source Documents:**
- `docs/ATLAS_AUTOMATION_CONSTITUTION.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md`
- `docs/ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md`

---

## Document Purpose

This document defines the **Discovery Foundation** of Atlas Patent Intelligence.

It does not specify search execution, caching strategy, confidence scoring, cost controls, or founder review flow. Those belong in subsequent Patent Intelligence documents.

This document answers one question: **How does Atlas determine what patent information it should search for — before any search begins?**

---

## Table of Contents

- [Section 1 — Purpose](#section-1--purpose)
- [Section 2 — Goals](#section-2--goals)
- [Section 3 — Research Triggers](#section-3--research-triggers)
- [Section 4 — Input Schema](#section-4--input-schema)
- [Section 5 — Discovery Strategy](#section-5--discovery-strategy)
- [Section 6 — Expected Outputs](#section-6--expected-outputs)
- [Engineering Principles](#engineering-principles)

---

## Section 1 — Purpose

### 1.1 Why Patent Intelligence Exists

Inventors make multi-year, financially material decisions based on the patent landscape around their invention. Those decisions — file a provisional, defer, pursue trade secret protection, avoid a specific mechanism, design around a claim — require accurate, current intelligence on:

- What has already been patented in the relevant technology space
- Whether the inventor's core mechanism overlaps with existing claims
- Who holds IP in the space (assignees, competitors, universities, NPEs)
- What freedom the inventor has to operate commercially without infringing

Without Atlas, founders spend 4 to 10 hours per invention conducting manual prior art searches across USPTO, Google Patents, and Espacenet — with inconsistent query strategies, no systematic classification search, and no coverage of international filings. Most stop when they run out of time, not when they have run out of relevant patents.

Patent Intelligence replaces that manual process with a systematic, structured, repeatable research program that executes automatically — before the founder is asked to do anything.

### 1.2 How It Supports Inventors from Idea to Market

Patent Intelligence is active from early-stage idea capture through post-launch monitoring:

- **Stage 1 (Idea Capture):** Surfaces the existing IP landscape as context before the founder defines their novel claim. Prevents founders from building toward a mechanism that is already heavily patented.
- **Stage 4 (Patent Readiness):** Delivers a structured prior art dossier — the primary research artifact the inventor needs to evaluate patentability and engage an IP attorney.
- **Stage 9 (IP Protection):** Refreshes the patent landscape at the moment of filing decisions. Identifies new filings that emerged since Stage 4.
- **Post-Stage 14 (Growth):** Monitors the patent landscape on an ongoing basis for new filings that could affect commercial freedom to operate.

### 1.3 How It Reduces Founder Effort

The Atlas Automation Constitution (Principle 4) is explicit: the patent landscape belongs to Atlas to research, not to the inventor.

Patent Intelligence reduces founder effort by:

- **Eliminating blank-slate search.** The founder no longer needs to construct search queries from scratch or decide which patent databases to search.
- **Eliminating coverage guesswork.** Atlas searches across classification codes, keyword variants, international terminology, assignee filings, and semantic concepts — systematic coverage the founder would not achieve manually.
- **Eliminating redundant work.** Prior searches are reused. Atlas does not re-derive what it already knows.
- **Concentrating founder attention.** The founder reviews structured findings and applies judgment to relevance — the one task that genuinely requires human expertise. Atlas handles everything upstream of that judgment.

---

## Section 2 — Goals

### 2.1 Primary Goals of the Discovery Subsystem

Discovery is the preparation phase. Its sole job is to determine the right questions to ask — before any search is executed.

**Find relevant patents.**
- Locate patents that share technological mechanism, component structure, material composition, or use case with the invention.
- Prioritize patents that are live, granted, and currently enforceable.

**Find prior art.**
- Identify patents, published applications, and non-patent literature that could affect patentability.
- Surface prior art in all relevant jurisdictions — not just the US.

**Identify claim overlap.**
- Prepare search targets specifically aimed at locating independent claims that overlap with the inventor's described novel mechanism.
- Flag potential anticipation risk (prior art that pre-dates and discloses the same mechanism).

**Discover similar inventions.**
- Find inventions that solve the same problem through different mechanisms — not identical, but within the same technology class.
- Identify the patent family surrounding similar inventions (continuation, continuation-in-part, divisional).

**Map assignees.**
- Identify which companies, universities, and individuals hold IP in the technology space.
- Distinguish active participants (filing regularly) from historical assignees (no recent activity).

**Support freedom-to-operate analysis.**
- Identify patents with claims broad enough to potentially cover the inventor's commercial product — not just the mechanism described in the application.
- Flag assignees known for aggressive patent enforcement in the technology area.

**Reduce patent research effort.**
- Generate a complete, structured research agenda from available invention context without asking the founder to supply search strategies.

**Improve confidence before filing.**
- Ensure the inventor and their attorney enter the filing conversation with a defensible evidence base — not a partial search of one database.

---

## Section 3 — Research Triggers

Every event that should initiate Patent Intelligence Discovery is documented below. Discovery specifically refers to the preparation of the research agenda — not search execution.

### 3.1 Trigger Table

| Trigger Event | Hook | Scope | Notes |
|---|---|---|---|
| **New invention created** | `onCreate` | Light discovery only | Invention context is minimal; extract available keywords from onboarding description if present |
| **Stage 1 completed** | `onStageComplete` | Full discovery | Idea Brief is now finalized; full invention context available for the first time |
| **Stage 4 opened** | `onOpen` | Full discovery | Primary Patent Intelligence trigger; prior art search preparation begins here |
| **Stage 4 entered by founder** | `onStageEnter` | Context delta check | Re-run discovery if invention description or novel element statements changed since onOpen |
| **Stage 4 completed** | `onStageComplete` | Next-stage pre-load | Prepare Stage 9 patent landscape monitoring refresh |
| **Stage 9 opened** | `onOpen` | Incremental discovery | Refresh since Stage 4; identify new filings in the technology area |
| **Stage 9 entered by founder** | `onStageEnter` | Context delta check | Re-run discovery if brand name, product spec, or filing status changed |
| **Founder edits invention description** | Field change event | Targeted re-discovery | Triggered when `productDescription`, `solutionSummary`, or `novelElements` fields change materially |
| **Founder adds novel element statement** | Field change event | Targeted re-discovery | New claim language may open new classification codes or keyword clusters |
| **Founder updates product description** | Field change event | Targeted re-discovery | Changed product may shift technology class; re-derive classifications |
| **Manual refresh requested** | `manualRefresh` | Full re-discovery | Founder explicitly requests fresh research agenda; re-derive all inputs |
| **Scheduled patent monitoring** | `scheduledResearch` | Incremental discovery | Monthly after Stage 4 completion; scoped to new filings since last run |
| **Competitive alert** | External signal | Targeted discovery | A known competitor files a new patent in the technology area; trigger assignee-scoped discovery |
| **New patent publication detected** | Monitoring feed | Targeted discovery | Patent publication matches the invention's technology class; evaluate for research agenda addition |

### 3.2 Discovery Depth by Trigger

| Depth | Description | When Used |
|---|---|---|
| **Light** | Extract primary keywords and high-level technology class only | `onCreate`, early Stage 1 |
| **Full** | Complete keyword extraction, classification derivation, concept expansion, assignee identification, and search intent definition | Stage 4 `onOpen`, manual refresh, Stage 1 completion |
| **Incremental** | Derive delta since last full discovery; scope to changed fields and new information only | `onStageEnter` context delta check, scheduled monitoring |
| **Targeted** | Re-run a specific discovery component (e.g., assignee search targets only, or classification codes only) | Field-level change events, competitive alerts |

---

## Section 4 — Input Schema

The following inputs are consumed by Patent Intelligence Discovery to derive the research agenda. All fields marked **Required** must be present for full discovery to proceed. Fields marked **Optional** improve discovery precision when available.

### 4.1 Core Invention Fields

| Field | Required | Source | Description |
|---|---|---|---|
| `workingTitle` | Required | Stage 1 stageProgress | The inventor's working name for the invention. Used for brand and product name searches alongside mechanism searches. |
| `problemStatement` | Required | Stage 1 stageProgress | The problem the invention solves. Drives use-case search intent and functional claim targeting. |
| `solutionSummary` | Required | Stage 1 stageProgress | How the invention solves the problem. The primary input for mechanism keyword extraction. |
| `productDescription` | Required | Stage 1 stageProgress | The full product description as understood at current stage. Central input for all discovery steps. |
| `novelElements` | Optional (high value) | Stage 4 stageProgress | Inventor-articulated novel element statements. When present, these seed the most precise claim overlap targeting. |
| `founderNotes` | Optional | Any stage stageProgress | Free-text inventor notes that may contain technical terminology, material names, or mechanism descriptions not present in structured fields. |

### 4.2 Technology Classification Fields

| Field | Required | Source | Description |
|---|---|---|---|
| `industry` | Optional | Stage 1 / Stage 3 stageProgress | Broad industry category (e.g., food and beverage, personal care, consumer electronics). Narrows technology class derivation. |
| `technology` | Optional | Stage 1 / Stage 5 stageProgress | Primary technology domain (e.g., mechanical, electrical, chemical, software, biological). Critical for classification code selection. |
| `materials` | Optional | Stage 5 stageProgress | Materials specified in the product design. Relevant to composition-of-matter claim search. |
| `mechanism` | Optional | Stage 1 / Stage 4 stageProgress | The core physical or technical mechanism (e.g., vacuum suction, pH-triggered release, compression molding). Highest-value input for classification targeting. |
| `components` | Optional | Stage 5 stageProgress | Named components in the product specification. Each component may be independently patentable and warrants targeted search. |

### 4.3 Market and Use Context Fields

| Field | Required | Source | Description |
|---|---|---|---|
| `useCases` | Optional | Stage 1 / Stage 3 stageProgress | Specific applications of the invention. Expands the search to use-case-specific patents that may not share mechanism but share purpose. |
| `targetAudience` | Optional | Stage 1 / Stage 3 stageProgress | Who the invention serves. Informs use-case and end-user claim targeting. |
| `productCategory` | Optional | Stage 1 / Stage 3 stageProgress | The commercial product category (e.g., kitchen appliance, dietary supplement, diagnostic device). Drives consumer product classification targeting. |

### 4.4 Competitive Context Fields

| Field | Required | Source | Description |
|---|---|---|---|
| `competitors` | Optional (high value) | Stage 1 / Stage 2 / Module 01 research | Known competitors by name. Each competitor is an assignee search target. Competitor patents often define the landscape boundaries most relevant to the invention. |
| `relatedProducts` | Optional | Stage 2 stageProgress | Related or substitute products in the market. May have associated patents worth reviewing. |

### 4.5 Prior Research Fields

| Field | Required | Source | Description |
|---|---|---|---|
| `existingResearch` | Optional | Prior Patent Intelligence runs | Previously completed patent research results. Used to scope incremental discovery and avoid deriving what is already known. |
| `founderKnownPatents` | Optional | Stage 4 stageProgress | Patent numbers or titles the founder has already identified. These seed the discovery with confirmed starting points and inform classification code derivation. |
| `relatedDocuments` | Optional | Uploads / stageProgress | Any technical documents, prior art references, or IP attorney correspondence the founder has attached. Parsed for technical terminology and patent citations. |

### 4.6 Generated Summaries

| Field | Required | Source | Description |
|---|---|---|---|
| `ideaBrief` | Optional (high value) | Stage 1 document | Atlas-generated Idea Brief document. Contains structured problem, solution, differentiation, and target audience — rich input for discovery when present. |
| `patentReadinessReport` | Optional | Stage 4 document | If a prior run of Stage 4 produced a report, its contents seed Stage 9 incremental discovery. |
| `priorArtSummary` | Optional | Prior Patent Intelligence run | Previously structured prior art findings. Scopes incremental discovery to delta-only searches. |

### 4.7 Degraded Input Behavior

Discovery must proceed even when input is incomplete.

| Scenario | Discovery Behavior |
|---|---|
| Only `workingTitle` available | Extract keywords from title only; derive broad technology class from title semantics; output low-precision discovery package with high uncertainty annotation |
| Only `problemStatement` + `workingTitle` | Add use-case keywords from problem statement; still low precision but broader coverage |
| `productDescription` available | Full keyword extraction and classification derivation possible; standard discovery depth |
| `productDescription` + `mechanism` + `novelElements` | Maximum discovery precision; full classification targeting, concept expansion, and assignee derivation |
| `founderKnownPatents` provided | Seed classification codes from known patents directly; treat known patents as confirmed anchors for classification targeting |

---

## Section 5 — Discovery Strategy

Discovery is the process of transforming raw invention context (Section 4 inputs) into a structured, actionable research agenda. It does not execute searches. It produces the inputs that searches will use.

### 5.1 Keyword Extraction

**Purpose:** Derive the explicit search terms most likely to retrieve relevant patents.

**Process:**
- Extract noun phrases from `productDescription`, `solutionSummary`, `mechanism`, `components`, and `founderNotes`.
- Identify technical terms: materials, compounds, chemical names, mechanism names, structural components.
- Distinguish core mechanism terms (highest priority) from product feature terms (medium priority) from use case terms (lower priority).
- Separate terms that describe the problem from terms that describe the solution.
- Flag domain-specific technical vocabulary for synonym expansion (Section 5.3).

**Output:** Ranked keyword list with source field annotation and priority weight.

### 5.2 Concept Extraction

**Purpose:** Identify the underlying technical concepts that the invention embodies — beyond the specific words the inventor used.

**Process:**
- Map the described mechanism to its functional category (e.g., "sealing mechanism" → closure systems, hermetic sealing, pressure-differential sealing).
- Identify the physical principles the invention relies on (e.g., capillary action, piezoelectric effect, thermoplastic deformation).
- Extract structural relationships (e.g., inner chamber, outer shell, one-way valve) as combinatorial search concepts.
- Identify what problem the invention solves in abstract terms — patents often claim the functional result, not the specific implementation.

**Output:** Concept map linking mechanism descriptions to functional patent search concepts.

### 5.3 Synonym Expansion

**Purpose:** Ensure searches are not limited to the specific vocabulary the inventor used, which may differ from how the same concept is described in patent literature.

**Process:**
- For each core keyword, generate synonyms using:
  - LLM-assisted expansion (Claude Haiku): prompt with the keyword and ask for patent-context equivalents.
  - Domain-specific synonym tables (maintained per technology category: food science, consumer electronics, personal care, mechanical systems, etc.).
  - Common inventor vs. patent attorney vocabulary mappings (e.g., "clasp" → "latch mechanism", "grip" → "ergonomic retention element").
- Expand chemical and material names to both IUPAC names and common trade names.
- Expand functional descriptions to specific mechanism terms (e.g., "keeps things cold" → "thermal insulation", "vacuum insulation panel", "phase change material").

**Output:** Expanded keyword set with synonym provenance annotation (LLM-derived vs. table-derived).

### 5.4 Industry Terminology Mapping

**Purpose:** Apply field-specific vocabulary that patent examiners and attorneys use in the relevant technology space.

**Process:**
- Map the invention's `industry` and `technology` fields to a terminology reference for that domain.
- Apply industry-standard term substitutions (e.g., in food science: "coating" → "encapsulant", "shell", "barrier film"; in consumer electronics: "chip" → "integrated circuit", "ASIC", "semiconductor device").
- Identify common term variants used in different patent offices for the same concept (US vs. EP vs. JP terminology patterns).
- Flag any terms in the inventor's description that are colloquial or marketing-derived — these are unlikely to appear in patent claims and must be replaced with technical equivalents.

**Output:** Industry-normalized keyword set.

### 5.5 Patent Classification Derivation

**Purpose:** Identify the Cooperative Patent Classification (CPC) and International Patent Classification (IPC) codes that cover the invention's technology space.

**Process:**
- Map primary mechanism keywords to CPC classification codes using:
  - CPC classification lookup tables maintained per technology domain.
  - LLM-assisted classification suggestion: provide product description and mechanism; request CPC subclass suggestions.
  - If `founderKnownPatents` is available, extract classification codes directly from those patents as seed anchors.
- Identify both the primary classification code (the invention's core mechanism) and adjacent codes (related mechanisms, use-case applications, material compositions).
- Distinguish utility-relevant codes (mechanical function, electrical function) from design-relevant codes (ornamental appearance) — both may be relevant depending on IP strategy.
- Flag classification codes that correspond to high-filing-activity areas (crowded art) vs. sparse areas.

**Output:** CPC/IPC code list with primary code, adjacent codes, and filing-activity annotation.

### 5.6 Semantic Concept Preparation

**Purpose:** Prepare inputs for semantic or AI-assisted patent search that goes beyond keyword matching.

**Process:**
- Generate a dense natural-language description of the invention's technical contribution suitable for embedding-based similarity search.
- This description emphasizes:
  - The functional result the invention achieves.
  - The mechanism by which it achieves that result.
  - The structural elements that implement the mechanism.
  - What is novel about this combination (as described by the inventor or inferred from their description).
- Generate 3–5 alternative phrasings of the same technical contribution, varying vocabulary and emphasis.
- Prepare a "negative space" description: what the invention is NOT (useful for filtering irrelevant results in semantic search).

**Output:** Semantic search description and alternative phrasings.

### 5.7 Search Intent Definition

**Purpose:** Define the purpose of each search component so that results can be evaluated against the right criteria.

Each search intent corresponds to a different question the patent research must answer:

| Intent | Question | Priority |
|---|---|---|
| **Prior art — anticipation** | Does a pre-existing patent disclose the same mechanism and thereby prevent patentability? | Critical |
| **Prior art — obviousness** | Does a combination of existing patents make the invention obvious to a person skilled in the field? | High |
| **Claim overlap — active** | Are there live, granted patents with claims broad enough to cover the invention's commercial implementation? | Critical (FTO) |
| **Technology landscape** | What is the general state of patenting in this space — who is filing, what are they claiming, is the space crowded? | High |
| **Competitor IP** | What patents does each known competitor hold in this technology area? | High |
| **Design-around targets** | Which specific claims are potential obstacles that a design-around strategy might avoid? | Medium |
| **Assignee activity** | Are there organizations filing aggressively in this space that represent a monitoring priority? | Medium |
| **International coverage** | Are there EP, PCT, or other international filings not present in the US database? | Medium |

**Output:** Intent-tagged research agenda with priority ranking.

### 5.8 Alternative Wording and International Terminology

**Purpose:** Ensure searches retrieve patents regardless of the regional or linguistic conventions used in filing.

**Process:**
- For each core concept, prepare:
  - US patent terminology (as used in USPTO filings).
  - European patent terminology (EPO convention — often differs from US for the same concept).
  - PCT/WIPO terminology (international application vocabulary).
  - Japanese Patent Office (JPO) common English translations for technology areas with significant Japanese IP activity (consumer electronics, food science, materials science).
  - Chinese National Intellectual Property Administration (CNIPA) common English translations for areas with significant Chinese IP activity.
- Flag technology areas where non-US patent literature is particularly important (e.g., food science, manufacturing processes, materials science have significant EP and JP coverage that US-only searches miss).

**Output:** Jurisdiction-annotated keyword variants.

### 5.9 Competitor, Assignee, and Inventor Targeting

**Purpose:** Identify the specific named entities (organizations and individuals) whose patent filings most warrant direct review.

**Process:**

*Competitor-derived assignee targets:*
- For each competitor identified in `competitors` or from Module 01 Competitor Research:
  - Identify the legal entity name under which the competitor files patents (may differ from trade name).
  - Identify parent company, subsidiaries, and holding companies that may also hold patents on their behalf.
  - Add all identified entity names to the assignee search target list.

*Technology-derived assignee targets:*
- From the classification codes identified in Section 5.5, identify the 10 most active assignees in those codes over the past 5 years.
- Flag any assignees that are non-practicing entities (NPEs / patent trolls) active in the technology area — these represent FTO risk disproportionate to their commercial presence.
- Identify university and research institution filers in the technology area — their patents are often licensed and represent prior art risk.

*Inventor targets:*
- From the classification codes and keyword searches, identify frequently cited inventors in the technology space.
- Individual inventors may have unfiled continuations or pending applications not yet visible; tracking active inventors reduces blind spots.
- If the founder has professional history or prior patents in the space, identify if any prior-employer assignees retain rights in related technology.

**Output:** Assignee target list (by category: competitor, active filer, NPE, academic) and inventor target list.

---

## Section 6 — Expected Outputs

Discovery produces a **Patent Intelligence Research Package** — a structured, serializable document that fully specifies what should be searched, why, and with what priority. This package is consumed by the patent search execution layer (specified in subsequent documents).

### 6.1 Search Packages

A Search Package is the atomic unit of the research agenda. Each package represents one discrete search task.

**Search Package fields:**

| Field | Description |
|---|---|
| `packageId` | Unique identifier for this search task |
| `inventionId` | Which invention this package was derived for |
| `searchIntent` | One of the intent types from Section 5.7 (e.g., `prior_art_anticipation`, `claim_overlap_active`, `competitor_ip`) |
| `priority` | Numeric priority: 1 (critical) → 5 (supplemental) |
| `keywords` | Primary keywords for this search |
| `synonymVariants` | Alternative keyword forms for this search |
| `jurisdiction` | Target jurisdiction: `US` | `EP` | `WO` | `JP` | `CN` | `GLOBAL` |
| `searchMethod` | How this package should be executed: `keyword` | `classification` | `assignee` | `inventor` | `semantic` |
| `classificationCodes` | CPC/IPC codes if `searchMethod` includes classification |
| `assigneeTargets` | Named entities if `searchMethod` includes assignee |
| `inventorTargets` | Named inventors if `searchMethod` includes inventor |
| `dateConstraint` | Optional date range for the search (e.g., `after:2020-01-01` for monitoring) |
| `derivedFrom` | Which input fields drove this package's generation (for traceability) |

### 6.2 Keyword Bundles

Keyword bundles organize the expanded keyword set into logical groups for structured search execution.

**Bundle types:**

| Bundle | Contents | Use |
|---|---|---|
| **Primary mechanism** | Core mechanism keywords and direct synonyms | Prior art, claim overlap searches |
| **Functional result** | Keywords describing what the invention achieves | Broadening search for anticipation |
| **Structural components** | Named component and subcomponent terms | Component-level prior art |
| **Material composition** | Material names, chemical names, trade names | Composition-of-matter claim search |
| **Use case / application** | End-use and application terms | Use-case specific prior art |
| **Problem space** | Problem description terms | Background art and alternative solutions |

### 6.3 Classification Targets

| Field | Description |
|---|---|
| `primaryCPCCode` | The single most representative CPC subclass for the invention |
| `adjacentCPCCodes` | Related CPC subclasses for broad coverage |
| `primaryIPCCode` | IPC equivalent (used for international searches) |
| `adjacentIPCCodes` | Related IPC codes |
| `uspcCodes` | Legacy USPC codes for older US patent coverage |
| `classificationConfidence` | How confident Atlas is in the classification derivation: `direct_match` | `inferred` | `approximate` |
| `classificationBasis` | What inputs drove this classification (mechanism description, known patents, LLM derivation) |

### 6.4 Assignee Targets

| Field | Description |
|---|---|
| `assigneeName` | Legal name of the entity as it appears in patent filings |
| `assigneeType` | `competitor` | `active_filer` | `npe` | `academic` | `individual` |
| `sourceCompetitor` | If derived from a competitor, the competitor name that triggered this target |
| `filingActivityLevel` | `high` | `medium` | `low` — based on filing volume in the technology class |
| `jurisdictions` | Which patent offices this assignee is known to file with |

### 6.5 Inventor Targets

| Field | Description |
|---|---|
| `inventorName` | Full name as appears in patent filings |
| `associatedAssignees` | Organizations this inventor has filed with |
| `relevanceBasis` | Why this inventor was targeted (frequent filer in CPC code, cited prior art, known domain expert) |

### 6.6 Technology Clusters

Technology clusters group related search packages and classification targets by technology sub-domain. They provide a structured view of the research landscape and enable the execution layer to allocate effort proportionally.

**Cluster fields:**

| Field | Description |
|---|---|
| `clusterId` | Unique identifier |
| `clusterLabel` | Human-readable description (e.g., "Closure mechanisms", "Thermal insulation materials") |
| `cpcCodes` | Classification codes within this cluster |
| `searchPackageIds` | The search packages that belong to this cluster |
| `estimatedFiingVolume` | How much patent activity exists in this cluster: `high` | `medium` | `low` |
| `relevanceToInvention` | `core` | `adjacent` | `peripheral` |

### 6.7 Discovery Confidence

Discovery Confidence reflects how well-defined the research agenda is — not how good the eventual search results will be.

| Field | Description |
|---|---|
| `overallDiscoveryConfidence` | `high` | `medium` | `low` |
| `keywordCoverageScore` | How complete the keyword extraction was given available inputs |
| `classificationCoverageScore` | How confident Atlas is in the classification derivation |
| `assigneeCoverageScore` | How complete the assignee identification is given available competitor and competitive landscape data |
| `missingInputsImpact` | Which missing optional inputs (Section 4) would most improve discovery precision if provided |
| `ambiguities` | Specific ambiguities in the invention description that limit discovery precision |

### 6.8 Recommended Next Searches

Discovery identifies which follow-on searches would most improve coverage after the initial research package is executed. These are not part of the initial search — they are conditional extensions.

| Recommendation | Trigger Condition |
|---|---|
| Citation forward search on top-ranked prior art | If prior art results reveal highly relevant patents, search forward to find all patents that cite them |
| Continuation / family search on blocking patents | If claim-overlap search surfaces a potential blocking patent, retrieve the full patent family |
| Additional assignee search for newly identified filers | If search results reveal active assignees not in the initial target list |
| International equivalents of US patents | If US-first search returns highly relevant results, identify corresponding EP/PCT filings |
| Sub-class deep dive | If classification search returns high filing volume in a sub-class, conduct targeted sub-class exploration |

---

## Engineering Principles

Patent Intelligence must be built and operated according to the following permanent principles:

**Minimize duplicate work.**
- Prior search results must be reused. No prior art search should re-derive classification codes, keyword sets, or assignee targets that are already known from a prior run.
- Discovery packages carry context hashes. Identical context produces identical packages — and the execution layer can cache results accordingly.

**Reuse prior searches.**
- Every completed search result is a persistent artifact. Incremental discovery builds on prior results; it does not restart from zero.
- When the invention context changes materially, only the affected discovery components are re-derived — not the entire package.

**Never ask founders for information Atlas can infer.**
- Classification codes, synonym expansions, industry terminology, assignee names — these are all derivable from invention description and competitor data Atlas already holds.
- The only inputs Patent Intelligence should ever request from a founder are novel element statements and any specific patents the founder has already identified. Everything else is Atlas's job.

**Be provider independent.**
- The Patent Intelligence Research Package is a provider-neutral specification. It does not reference USPTO, Google Patents, EPO, or any other search provider.
- Which providers execute which packages is the execution layer's concern, not the discovery layer's.
- Discovery outputs are valid regardless of which databases will ultimately execute them.

**Be explainable.**
- Every element of the research package traces back to a specific input field and a specific derivation step.
- The `derivedFrom` annotation on every search package and keyword bundle ensures the founder (and any auditing system) can see exactly why each search was included.
- Discovery outputs must be human-readable, not just machine-parseable.

**Be observable.**
- Discovery execution is logged. What inputs were used, what was derived, which steps ran, and what the output package contains — all of this is queryable.
- Discovery failures (e.g., insufficient input to derive classification codes) are surfaced as structured gaps, not silent omissions.

**Support future AI improvements.**
- Classification derivation, synonym expansion, concept extraction, and search intent mapping are all candidate sites for model improvement.
- The discovery pipeline is designed so that any step can be upgraded (better LLM, better tables, better heuristics) without changing the output schema or the execution layer's interface.
- All LLM-derived outputs are annotated with the model used and the prompt strategy, enabling comparison and regression testing as models improve.

---

## Summary

| Section | What It Defines |
|---|---|
| Section 1 | Why Patent Intelligence exists, how it serves the inventor journey, and how it reduces founder effort |
| Section 2 | The specific goals of the Discovery subsystem — from prior art to FTO indicators |
| Section 3 | Every trigger event that initiates discovery, with depth and scope definitions |
| Section 4 | The complete input schema — required and optional fields, sources, and degraded-input behavior |
| Section 5 | The step-by-step strategy for preparing research: keyword extraction, concept extraction, synonym expansion, terminology mapping, classification derivation, semantic concept preparation, search intent definition, alternative wording, and entity targeting |
| Section 6 | The structured outputs of Discovery: search packages, keyword bundles, classification targets, assignee targets, inventor targets, technology clusters, discovery confidence, and recommended next searches |

**Subsequent documents will define:**
- Patent search execution (how search packages are dispatched to providers)
- Result normalization and deduplication
- Prior art scoring and claim overlap analysis
- FTO indicator generation
- Confidence framework for patent research
- Caching and incremental update strategy
- Cost controls and provider selection
- Founder review flow for patent findings

---

*End of ATLAS_PATENT_INTELLIGENCE_DISCOVERY.md*
*Version 1.0 — July 2026*
*Discovery Foundation specification only. No implementation. No code changes.*
*Source: ATLAS_AUTOMATION_CONSTITUTION.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md · ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART2.md*
