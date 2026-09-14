# ATLAS RESEARCH ENGINE ARCHITECTURE
## Part 1 — Sections 1–6: Core Architecture

**Version 1.0 — July 2026**
**Classification: Internal Engineering Reference**
**Status: Specification — Not Yet Implemented**
**Source Documents:**
- `docs/ATLAS_AUTOMATION_CONSTITUTION.md`
- `docs/ATLAS_AUTOMATION_IMPLEMENTATION_PLAN.md`
- `docs/FOUNDER_REFERENCE_PROJECT_RISE_JARS_PART_D.md`

---

## Document Purpose

This document is Part 1 of the Atlas Research Engine Architecture specification. It covers the foundational architecture of the Research Engine: what it is, how it is structured, how the research lifecycle flows, how stage lifecycle hooks trigger research, how the research queue operates, and how caching is managed.

Part 2 (Sections 7–10) will cover Provider Abstraction, Confidence Framework, Human Review Flow, and Security/Cost Controls.

Part 3 (Section 11+) will cover individual Research Modules and Engineering Principles.

This is an architecture specification. It defines what must be built, in what shape, and why. It is not implementation code. It is the engineering blueprint that future coding workers will follow.

No existing files are modified by this document.

---

## Table of Contents

- [Section 1 — Research Engine Overview](#section-1--research-engine-overview)
- [Section 2 — Architecture](#section-2--architecture)
- [Section 3 — Research Lifecycle](#section-3--research-lifecycle)
- [Section 4 — Stage Lifecycle Hooks](#section-4--stage-lifecycle-hooks)
- [Section 5 — Research Queue](#section-5--research-queue)
- [Section 6 — Caching](#section-6--caching)

---

## Section 1 — Research Engine Overview

### 1.1 Purpose

The Atlas Research Engine is the subsystem responsible for gathering, processing, storing, and delivering external research on behalf of inventors — automatically, proactively, and before the founder is asked a single question.

The Research Engine is the primary mechanism by which Atlas fulfills the constitutional obligation encoded in Principle 4 of the Atlas Automation Constitution:

> "Atlas should proactively research before asking the founder to supply information."

Without the Research Engine, Atlas is a guided workflow that asks founders to do work Atlas could do instead. With the Research Engine, Atlas arrives at each stage having already completed the foundational research, so that the founder's first interaction with a stage is review, confirmation, and judgment — not blank-form data entry.

### 1.2 The Problem It Solves

As of July 2026, Atlas operates between Level 1 (Guided) and Level 2 (Assisted) on the Automation Maturity Model. The primary gap preventing Atlas from reaching Level 3 (Autonomous) is that Atlas still asks founders for information it could find itself.

Specific examples of the problem:
- Stage 1 asks: "Who are your competitors?" — Atlas should research this before asking.
- Stage 3 asks founders to supply market size data from external sources — Atlas should build a draft TAM/SAM/SOM model from public data before the founder opens Stage 3.
- Stage 4 requires the founder to manually search USPTO, Google Patents, and Espacenet — 4 to 10 hours per inventor — when Atlas could execute these searches automatically.
- Stage 7 requires the founder to independently identify manufacturers — Atlas should provide a shortlist before Stage 7 opens.
- Stage 10 requires the founder to research competitor pricing manually — Atlas should populate this data proactively.

The Research Engine eliminates these gaps by treating research as a first-class infrastructure service that runs automatically at defined trigger points throughout the inventor journey.

### 1.3 Mission Alignment

The Research Engine directly enables Atlas's mission: moving inventors from Idea to Market while minimizing founder effort.

Every research task the Research Engine completes is a task the founder does not have to do. The compounding effect across a 15-stage journey is substantial:

- The Automation Implementation Plan identifies 27 of 40 audited question categories as AUTO — meaning Atlas should answer them without founder input.
- Across those 27 categories, the projected founder effort savings range from 2–4 hours (Stage 1 competitive research) to 40–75 hours (Stage 13 pitch deck assembly, which draws heavily on prior research).
- The total estimated founder hours saved from full Research Engine implementation is 120–200+ hours per inventor journey.

The Research Engine is not a convenience feature. It is the infrastructure that bridges the gap between Atlas's current Level 2 state and the Level 3 Autonomous target within 12 months.

### 1.4 Scope

The Research Engine covers:

**In scope:**
- All external research Atlas conducts autonomously on behalf of an inventor
- Background research jobs triggered by stage lifecycle events
- Scheduled ongoing monitoring research (post-launch competitive intelligence, KPI tracking)
- Research result storage, versioning, and freshness management
- Confidence scoring on research results
- Routing research outputs to the appropriate downstream consumers (stage views, document pipeline, risk tracker, monitoring feed)
- Provider-agnostic API integration for web search, patent databases, trademark databases, domain availability, and analytics platforms

**Out of scope:**
- Document assembly and generation (Document Auto-Assembly Pipeline — separate subsystem, triggered by Research Engine outputs)
- Analytics integration for founder-connected platform data such as Shopify, GA4, Klaviyo (Analytics Integration Layer — separate subsystem, though outputs feed into the Research Engine's monitoring pipeline)
- Founder-facing UI for reviewing research results (UI layer — consumes Research Engine outputs but is architecturally separate)
- Stage gating and readiness scoring (Journey Engine — research completion feeds into readiness, but the readiness computation lives in journeyEngine.ts)

### 1.5 Relationship to Other Atlas Systems

The Research Engine is one of four major subsystems required to move Atlas to Level 3 Autonomous, as identified in the Automation Implementation Plan (Section 2.4):

| Subsystem | Role | Dependency Relationship |
|---|---|---|
| **Research Engine** | Gathers and stores external intelligence | Triggers document pipeline; feeds risk tracker; populates stage data |
| **Document Auto-Assembly Pipeline** | Assembles finished documents from prior stage data | Consumes Research Engine outputs and stageProgress data |
| **Analytics Integration Layer** | Ingests live performance data from founder-connected platforms | Feeds post-launch Research Engine monitoring jobs |
| **Stage Lifecycle Hook System** | Triggers Research Engine jobs at appropriate stage events | The hook system is the trigger surface; the Research Engine is the executor |

The Research Engine is the foundational layer. The Document Pipeline depends on Research Engine results being available. The Stage Lifecycle Hook System is the trigger mechanism that activates the Research Engine at the right moments in the inventor journey.

### 1.6 Design Philosophy

The Research Engine must be built on these non-negotiable principles drawn directly from the Atlas Automation Constitution:

**Never ask what Atlas can find.** Every question that can be pre-answered by research must be pre-answered. The Research Engine exists to eliminate questions, not to generate material for them.

**Research before the founder arrives.** Research must complete before the founder opens a stage, not after. If research runs while the founder is waiting at a loading screen, the design has failed. Research is a background process triggered by stage events, not a foreground process blocking the founder's session.

**Transparency about what was researched.** The founder must always be able to see what Atlas found, where it came from, when it was found, and how confident Atlas is in the result. Research is not a black box — it is a transparent, auditable service.

**Provider independence.** The Research Engine must not be coupled to any specific external API or data provider. Providers change, APIs deprecate, costs shift. The architecture must support swapping or adding providers without changing Atlas business logic.

**Graceful degradation.** Research failure must never block the founder's journey. If a research job fails, Atlas proceeds with what it knows and flags the gap transparently. A failed prior art search does not prevent the founder from accessing Stage 4. It surfaces a notice that automated search was unavailable and prompts manual review.

---

## Section 2 — Architecture

### 2.1 System Components

The Research Engine is composed of the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                     STAGE LIFECYCLE HOOKS                        │
│   onCreate | onOpen | onStageEnter | onStageComplete             │
│   scheduledResearch | manualRefresh                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ triggers
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RESEARCH DISPATCHER                         │
│   Resolves research tasks for a given (inventionId, stageId,     │
│   triggerEvent). Deduplicates. Enqueues in Research Queue.       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ enqueues
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       RESEARCH QUEUE                             │
│   Priority-ordered. Concurrent. Retryable. Cancellable.          │
│   Persisted in Convex (researchQueue table).                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ dispatches
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND WORKERS                            │
│   Convex Actions (use node). One action per research module.     │
│   Stateless. Provider-agnostic via Provider Abstraction Layer.   │
└───┬──────────────────────┬──────────────────────────────────────┘
    │ calls                │ stores results
    ▼                      ▼
┌──────────────┐   ┌───────────────────────────────────────────────┐
│   PROVIDER   │   │              RESULT STORAGE                    │
│ ABSTRACTION  │   │  researchResults table (Convex)                │
│    LAYER     │   │  Keyed by (inventionId, stageId, moduleId,     │
│              │   │  version). Confidence-scored. Versioned.       │
│  WebSearch   │   └───────────────────────────────────────────────┘
│  PatentAPI   │             │ consumed by
│  TrademarkDB │             ▼
│  DomainAPI   │   ┌───────────────────────────────────────────────┐
│  AnalyticsAPI│   │           OUTPUT ROUTER                        │
└──────────────┘   │  Routes results to:                            │
                   │  → stage_view (surfaced in founder's UI)       │
                   │  → document_input (Document Pipeline)          │
                   │  → risk_tracker (persistent risk sidebar)      │
                   │  → monitoring_feed (ongoing monitoring queue)  │
                   └───────────────────────────────────────────────┘
```

### 2.2 Research Engine

The Research Engine is the coordination layer. It does not execute research directly — that is the job of background workers. The Research Engine is responsible for:

1. **Receiving trigger events** from the Stage Lifecycle Hook System
2. **Resolving research tasks** — determining which research modules should run for a given (inventionId, stageId, triggerEvent) combination, based on stageConfig definitions
3. **Dispatching tasks to the Research Queue** — creating queue entries with appropriate priority, deduplication keys, and execution parameters
4. **Monitoring completion** — tracking which research tasks have completed, failed, or are pending for a given stage open event
5. **Reporting readiness** — signaling to the Stage Lifecycle Hook System when sufficient research has completed for the stage to be presented to the founder

**Implementation Location:** `convex/researchEngine.ts` (new file)

**Runtime Environment:** Convex mutations and queries (for queue management and state reading). Convex actions with `"use node"` directive (for external API calls in background workers).

**Core Data:** The Research Engine reads from and writes to the following Convex tables:
- `researchQueue` — pending, in-progress, and completed research jobs
- `researchResults` — stored research outputs with confidence scores and versioning
- `stageProgress` — source of prior stage context that seeds research tasks

### 2.3 Research Queue

The Research Queue is the persistence and scheduling layer for all research work. It is a Convex table (`researchQueue`) with the following characteristics:

- **Durable** — All queue entries survive server restarts and deployment cycles
- **Ordered** — Jobs are processed in priority order (see Section 5 for full priority scheme)
- **Concurrent** — Multiple research jobs run in parallel, subject to per-inventor and global concurrency limits
- **Retryable** — Failed jobs are retried with exponential backoff, up to a configurable maximum
- **Observable** — Queue depth, job status, processing latency, and failure rates are all queryable

Full design in Section 5.

### 2.4 Stage Lifecycle Hooks

The Stage Lifecycle Hook System is the trigger surface for the Research Engine. Hooks are defined in `stageConfig[]` and executed by `journeyEngine.ts` at the appropriate lifecycle moments. Each hook resolves which research tasks should run and hands them to the Research Engine for dispatching.

Full design in Section 4.

### 2.5 Background Workers

Background workers are stateless Convex Actions (with `"use node"` directive) that execute individual research tasks. Each research module has a corresponding background worker function. Workers:

- Accept a structured input payload (inventionId, stageId, moduleId, parameters derived from prior stage data)
- Call external APIs through the Provider Abstraction Layer
- Process and normalize API responses
- Compute a confidence score for the result
- Write results to `researchResults` table
- Update the queue entry status to completed or failed

Workers do not call each other directly. They do not maintain state between invocations. A worker that fails does not affect other workers running concurrently.

### 2.6 Scheduling

Research jobs have two scheduling modes:

**Event-Driven:** Triggered by stage lifecycle hooks (onCreate, onOpen, onStageEnter, onStageComplete, manualRefresh). These are the primary triggers. Event-driven jobs run when something meaningful happens in the inventor's journey.

**Scheduled (Recurring):** Triggered on a time-based cadence for ongoing monitoring tasks. These run after stage completion to keep research fresh. Examples:
- Competitive product landscape refresh: monthly after Stage 1 completion
- Competitor pricing update: monthly after Stage 10 completion
- Patent landscape monitoring: monthly after Stage 4 completion
- Competitive intelligence feed: weekly after Stage 14 launch

Scheduled research is managed through Convex's scheduled functions mechanism, which is triggered once per invention when a stage completes and registers the recurring job with the appropriate cadence.

### 2.7 Caching

Caching is the mechanism by which the Research Engine avoids redundant research work. Because external API calls have latency and cost, the Research Engine must not re-execute research that is still fresh. Caching is managed at the `researchResults` level, not at the HTTP layer.

Full design in Section 6.

### 2.8 Data Persistence

Research results are persisted in Convex in the `researchResults` table. This is a new table that must be added to the Convex schema. The table stores:

| Field | Type | Description |
|---|---|---|
| `inventionId` | `Id<"inventions">` | Which inventor's invention this research belongs to |
| `stageId` | `number` | Which stage this research was conducted for |
| `moduleId` | `string` | Which research module produced this result (e.g., `"competitive_landscape"`, `"prior_art"`) |
| `version` | `number` | Monotonically increasing version counter for this (inventionId, stageId, moduleId) combination |
| `status` | `string` | `"pending"` \| `"in_progress"` \| `"completed"` \| `"failed"` \| `"stale"` |
| `triggerEvent` | `string` | Which lifecycle event triggered this research job |
| `rawResult` | `any` | The raw, unprocessed API response (stored for audit and reprocessing) |
| `processedResult` | `any` | The normalized, structured research output ready for consumption |
| `confidenceScore` | `number` | 0–100 score indicating confidence in the result's accuracy and freshness |
| `evidenceCount` | `number` | Number of distinct sources or data points used to generate the result |
| `sources` | `string[]` | Array of source references (URLs, patent IDs, database identifiers) |
| `assumptions` | `string[]` | Any assumptions Atlas made that should be confirmed by the founder |
| `researchedAt` | `number` | Unix timestamp when research was executed |
| `expiresAt` | `number` | Unix timestamp when this result should be considered stale and refreshed |
| `providerUsed` | `string` | Which provider was used (for audit, cost tracking, and debugging) |
| `outputRoutes` | `string[]` | Which output routes this result feeds: `"stage_view"`, `"document_input"`, `"risk_tracker"`, `"monitoring_feed"` |
| `founderReviewedAt` | `number \| null` | Unix timestamp when the founder reviewed and confirmed this result |
| `founderOverride` | `any \| null` | If the founder edited or rejected the result, the override value is stored here |

**Required Convex Index:**
```
.index("by_invention_stage_module", ["inventionId", "stageId", "moduleId"])
.index("by_invention_stage", ["inventionId", "stageId"])
.index("by_status", ["status"])
.index("by_expires_at", ["expiresAt"])
```

### 2.9 Versioning

Each research result carries a version number. When a research job is re-run for the same (inventionId, stageId, moduleId) combination — due to a manual refresh, a scheduled update, or a retry — a new version record is written rather than overwriting the existing record.

This versioning approach provides:
- **Auditability** — The full history of research results for any module is preserved
- **Rollback** — If a new result is lower quality than the previous one, the system can surface the prior version
- **Diffing** — The founder can see what changed between research runs (e.g., a competitor changed their pricing since last month)
- **Continuity** — If a re-run fails, the previous successful version remains available for consumption

The active version for any (inventionId, stageId, moduleId) combination is the latest completed version. Pending or failed versions do not displace the previous completed version.

### 2.10 Result Storage

Research results are stored in two forms:

**Raw Result:** The unprocessed API response, stored as-is. This preserves fidelity for debugging, auditing, and future reprocessing if the normalization logic changes.

**Processed Result:** The normalized, structured output ready for downstream consumption. The structure of the processed result is module-specific and defined per research module in the module specification (Part 3 of this document series). Processed results are typed objects with consistent field conventions.

Results are not compressed or summarized during storage. The full result is stored. Summarization and truncation happen at the presentation layer, not at the storage layer.

### 2.11 Provider Abstraction Layer

The Provider Abstraction Layer insulates Atlas business logic from the specifics of any external API or data provider. The Research Engine calls provider-agnostic interfaces; the abstraction layer routes those calls to the configured provider.

Full design in Part 2, Section 7.

### 2.12 Retry Logic

Research jobs have structured retry behavior:

- **Initial attempt:** Runs immediately when the job is dispatched
- **First retry:** After 30 seconds (exponential base)
- **Second retry:** After 2 minutes
- **Third retry:** After 10 minutes
- **Final retry:** After 30 minutes
- **Maximum retries:** 4 (configurable per module)
- **After max retries:** Job status set to `"failed"`. Prior successful version (if any) remains active. Failure is surfaced to the founder as a transparent notice in the stage view.

Retries are triggered by:
- Network errors (transient connectivity failures)
- Provider rate limiting (429 responses)
- Provider temporary unavailability (5xx responses)
- Timeout exceeded (job ran longer than the configured timeout)

Retries are NOT triggered by:
- Invalid inputs (if the research task was malformed, retrying will not help)
- Provider permanent errors (e.g., invalid API key — surface as a configuration error, not a retry)
- Confidence score below threshold (a low-confidence result is still a result — surface with appropriate confidence annotation)

### 2.13 Failure Recovery

When a research job fails permanently (all retries exhausted):

1. The queue entry is marked `"failed"` with a failure reason and the final error message
2. If a prior successful version exists, that version remains the active result (no disruption to downstream consumers)
3. If no prior successful version exists, the downstream consumers (stage view, document pipeline) receive a `null` result with a `research_unavailable` flag
4. The stage view surfaces a transparent notice to the founder: "Automated research for [module name] was not available. You can [retry now] or [enter this information manually]."
5. The founder is never blocked from proceeding. Failure degrades gracefully to manual input.
6. Failed jobs are logged to the monitoring infrastructure for operational visibility. Persistent failures indicate a provider issue that requires engineering attention.

---

## Section 3 — Research Lifecycle

### 3.1 Overview

Every piece of research the Research Engine produces follows the same lifecycle from trigger to integration into the founder's experience. This section describes each step in the lifecycle in full detail.

```
Research Requested
      ↓
    Queued
      ↓
   Executed
      ↓
Confidence Scored
      ↓
Documents Updated
      ↓
Founder Review
      ↓
   Approved
      ↓
Stage Updated
```

### 3.2 Step 1 — Research Requested

**What happens:** A stage lifecycle hook fires (see Section 4 for full hook definitions). The hook calls the Research Dispatcher in `convex/researchEngine.ts`, passing:
- `inventionId` — which inventor's invention this is for
- `stageId` — which stage the hook is associated with
- `triggerEvent` — which hook fired (`"onCreate"`, `"onOpen"`, `"onStageEnter"`, `"onStageComplete"`, `"scheduledResearch"`, `"manualRefresh"`)
- `context` — the current state of the inventor's `stageProgress` records, used to seed research tasks with prior-stage data

**What the Dispatcher does:**
1. Looks up `stageConfig[stageId].researchTasks` to determine which research modules should run for this (stageId, triggerEvent) combination
2. For each research module in the task list, checks whether a fresh result already exists in `researchResults` (cache hit check — see Section 6)
3. For each module without a fresh cached result, creates a queue entry in `researchQueue`
4. Returns a batch job ID that can be used to monitor the progress of the dispatched jobs

**Deduplication:** If an identical (inventionId, stageId, moduleId) job is already in the queue with status `"pending"` or `"in_progress"`, the Dispatcher does not create a duplicate. It returns the existing job ID for monitoring.

**Context extraction:** Before enqueuing a research task, the Dispatcher extracts the relevant prior-stage data that the research module needs as input. For example, the Competitive Landscape module for Stage 3 needs the product description from Stage 1 stageProgress. The Dispatcher reads this context from stageProgress and includes it in the queue entry's input payload.

### 3.3 Step 2 — Queued

**What happens:** The research job is persisted in the `researchQueue` Convex table with status `"pending"`. The queue entry contains everything the background worker will need to execute the job, so the worker is fully self-contained and does not need to re-query context at execution time.

**Queue entry fields:**
| Field | Description |
|---|---|
| `jobId` | Unique identifier for this queue entry |
| `inventionId` | Which inventor |
| `stageId` | Which stage |
| `moduleId` | Which research module |
| `triggerEvent` | What triggered the job |
| `priority` | Numeric priority (see Section 5 for priority scheme) |
| `inputPayload` | The structured input parameters the worker needs, including extracted context from prior stages |
| `status` | `"pending"` at creation |
| `enqueuedAt` | Timestamp |
| `scheduledFor` | When to execute (null = immediately, timestamp = scheduled future execution) |
| `maxRetries` | Maximum retry attempts (module-specific default) |
| `attemptCount` | Current attempt number (0 at creation) |
| `timeoutMs` | Maximum execution time in milliseconds |
| `providerPreference` | Optional preferred provider for this job (overrides module default) |

**Ordering:** Jobs in the queue are processed in priority order. Within the same priority tier, FIFO ordering applies (earlier-enqueued jobs run first).

**Visibility:** The queue state is readable by the stage view to display research-in-progress indicators to the founder. Founders can see that "Atlas is researching competitors..." rather than encountering a silent wait.

### 3.4 Step 3 — Executed

**What happens:** A background worker (Convex Action with `"use node"`) picks up the queue entry, claims it by setting status to `"in_progress"` and recording `startedAt`, then executes the research task.

**Execution steps within a worker:**

1. **Read input payload** — All parameters needed for the research task are in the queue entry's `inputPayload`. The worker does not query additional context.

2. **Select provider** — The worker calls the Provider Abstraction Layer with the provider preference from the queue entry (or the module default). The abstraction layer resolves the appropriate provider and returns a configured client.

3. **Execute API call(s)** — The worker calls the provider API with the constructed request. Some research modules require multiple API calls (e.g., competitive landscape may query web search, then follow up with sentiment analysis on found URLs). The worker manages this sequence internally.

4. **Timeout enforcement** — If the worker exceeds the `timeoutMs` from the queue entry, it terminates and marks the job as failed with reason `"timeout_exceeded"`. The retry mechanism handles subsequent attempts.

5. **Raw result capture** — The worker captures the full API response(s) as the raw result.

6. **Normalization** — The worker passes the raw result through the module's normalization function, which transforms the provider-specific response format into Atlas's standard structured format for that module.

7. **Confidence scoring** — The worker calls the module's confidence scoring function (see Section 3.5 for confidence scoring detail).

8. **Write to researchResults** — The worker writes a new version record to the `researchResults` table with status `"completed"`, the raw result, the processed result, confidence score, sources, and metadata.

9. **Update queue entry** — The worker updates the queue entry to `"completed"` with `completedAt` timestamp and the result ID from `researchResults`.

10. **Trigger output routing** — The worker calls the Output Router with the result ID, which fans out the result to the configured output routes (stage_view, document_input, risk_tracker, monitoring_feed).

**Error handling within the worker:**
- If the provider returns a non-retryable error, the worker marks the job `"failed"` immediately without incrementing attempt count
- If the provider returns a retryable error, the worker increments attempt count, sets a backoff timestamp, and resets status to `"pending"` for the retry scheduler to pick up
- If the worker itself throws unexpectedly, Convex's action infrastructure captures the error; the queue cleanup job marks the entry as failed after the timeout window

### 3.5 Step 4 — Confidence Scored

**What happens:** After executing the API call and normalizing the result, the worker computes a confidence score for the research output. This score is stored with the result and drives downstream behavior including whether founder review is required and how the result is presented in the UI.

**Confidence score range:** 0–100. This is not an AI-generated score — it is a deterministic calculation based on objective signals.

**Confidence scoring dimensions:**

| Dimension | Description | Weight |
|---|---|---|
| **Source count** | How many distinct sources were consulted (more sources = higher confidence) | 20% |
| **Source authority** | Quality and credibility of sources (official databases, verified publications vs. unstructured web content) | 25% |
| **Result recency** | How recent the data is (current-quarter data vs. two-year-old data) | 20% |
| **Coverage completeness** | How much of the expected output schema was populated vs. left null | 20% |
| **Internal consistency** | Whether results from different sources agree with each other | 15% |

**Confidence thresholds and their behavioral implications:**

| Score | Label | Founder Review Required | UI Treatment |
|---|---|---|---|
| 80–100 | High confidence | Optional | Presented as Atlas's finding with source citation |
| 60–79 | Moderate confidence | Recommended | Presented with a note that the founder should verify key figures |
| 40–59 | Low confidence | Required | Presented with explicit warning and confirmation prompt |
| 0–39 | Very low confidence | Required + notify | Presented with strong caveat; Atlas recommends manual research as supplement |

**Transparency annotation:** Every research result is annotated with one of three labels (per the Implementation Plan's Transparency Policy):
- `Atlas researched` — data sourced from external API or web search, with source reference
- `Atlas inferred` — data derived from prior stage inputs or calculation
- `Atlas assumed` — data used without research or direct input; must be confirmed

Any `Atlas assumed` annotation triggers an automatic confirmation prompt in the founder's review flow.

### 3.6 Step 5 — Documents Updated

**What happens:** After a research result is written to `researchResults` with status `"completed"`, the Output Router fires. For research results with `"document_input"` in their `outputRoutes`, the Output Router notifies the Document Auto-Assembly Pipeline that new research data is available.

**What the Document Pipeline does with research results:**
- The pipeline checks whether a document that depends on this research module is currently in draft state
- If yes, the pipeline re-runs the assembly for that document section using the new research data
- If the document has already been reviewed and approved by the founder, the pipeline creates a new draft version and notifies the founder that updated research is available
- If no dependent document is currently in scope, the pipeline queues the research result for use when the relevant stage opens

**Research-to-document mapping examples:**

| Research Module | Document(s) Updated |
|---|---|
| Competitive Landscape | Competitive Landscape Report, Market Research Summary, Pitch Deck (competitive slide) |
| Prior Art Search | Prior Art Summary, Patent Readiness Report, IP Brief |
| Market Size Data | TAM/SAM/SOM Model, Market Research Summary, Pitch Deck (market slide) |
| Competitor Pricing | Competitive Pricing Context table, Pricing Strategy Document |
| Manufacturer Shortlist | Manufacturer Evaluation Scorecard, Manufacturing Plan |
| Brand Name Availability | Name Evaluation Report |
| Grant Programs | Grant Program Shortlist, Funding Strategy Document |

**Important:** The Research Engine does not directly modify documents. It writes results to `researchResults` and signals the Document Pipeline. Document modification is the Document Pipeline's responsibility. This separation keeps the Research Engine focused on data acquisition and prevents coupling between research logic and document assembly logic.

### 3.7 Step 6 — Founder Review

**What happens:** When the founder opens a stage where research has completed (or is completing), they encounter the research results surfaced in the stage view. The stage view displays:
- The research findings in structured, readable format
- The confidence score and its label (High / Moderate / Low / Very Low)
- The sources consulted
- Any assumptions Atlas made that should be confirmed
- The research timestamp (when was this researched)
- Any prior version available for comparison (if this is a refresh)

**Review modes by confidence level:**
- **High confidence:** The founder sees the result with a simple "Looks right / Edit this" interaction. No explicit approval required. Proceeding past the section without interaction counts as implicit acceptance.
- **Moderate confidence:** The founder is prompted to review key figures and confirm them. The prompt is contextual: "Atlas found these competitors based on your product description. Do these look right? You can add, remove, or edit."
- **Low / Very low confidence:** The founder must explicitly confirm or override. They cannot advance the stage without interacting with the research result. The stage readiness score does not reach the "Ready to Move Forward" threshold until the founder has reviewed low-confidence research.

**What the founder can do with a research result:**
1. **Accept** — The result is marked `founderReviewedAt` with the current timestamp. No further action needed.
2. **Edit** — The founder modifies one or more fields in the research output. The modified values are stored in `founderOverride` alongside the original Atlas result. Both are preserved.
3. **Reject and Request Re-run** — The founder can request Atlas to run the research again (triggers a `manualRefresh` lifecycle hook for that specific module).
4. **Reject and Enter Manually** — The founder enters the data manually. The manual entry is stored in `founderOverride`. The Atlas result is marked as overridden but preserved for audit.

**Persistent founder overrides:** If the founder overrides a research result, and the Research Engine later refreshes the result (via scheduled research or manual refresh), the refreshed result is presented as a new draft alongside the founder's override, not replacing it. The founder decides whether to adopt the new research or maintain their override.

### 3.8 Step 7 — Approved

**What happens:** When the founder accepts a research result (explicitly or implicitly via acceptance behavior), the result is considered approved and transitions to active status for downstream use.

**Downstream effects of approval:**
- The result's `founderReviewedAt` field is set
- The Document Auto-Assembly Pipeline marks the dependent document sections as ready for final assembly
- The stageProgress record for the relevant field is updated with the approved data (so it flows downstream to future stages)
- If the research result feeds a risk tracker item (e.g., a patent deadline derived from prior art), the risk tracker item is activated

**Implicit approval:** For high-confidence results, if the founder advances past the stage section that presents the research without explicitly editing it, the result is treated as implicitly approved. This prevents friction for results the founder agrees with.

**Approval expiry:** An approved research result does not remain approved indefinitely if the underlying data changes. For research modules with scheduled refresh (e.g., competitive pricing, refreshed monthly), when a new version of the result is generated by the scheduler, the founder's approval of the prior version does not automatically transfer to the new version. The new version is surfaced for founder review with the diff highlighted ("competitor X changed their price from $89 to $74 since your last review").

### 3.9 Step 8 — Stage Updated

**What happens:** After research is approved and documents are updated, the Research Engine signals the Journey Engine that research for the relevant stage is complete. The Journey Engine re-evaluates the stage's readiness score, incorporating the newly available research data into the completeness calculation.

**What changes in stage state:**
- Fields that were previously empty (pending research) are now populated with the approved research data
- The stage's readiness score increases as research-dependent fields are filled
- The `stageProgress` record reflects the new field values with `source: "atlas_research"` notation
- If the stage was waiting on research before becoming accessible to the founder, it transitions from the "Atlas is preparing this stage" state to the fully interactive state

**Cross-stage propagation:** Approved research results that contain data relevant to future stages trigger a cross-stage propagation step. For example, when competitive landscape research is approved in Stage 1, the competitive data is written as a pre-populated input to the Stage 3 market research view. When prior art is approved in Stage 4, it is referenced in the Stage 9 IP Brief auto-assembly. This propagation is defined per-module in the module specification (Part 3) and executed by the stageProgress cross-population mechanism in `journeyEngine.ts`.

---

## Section 4 — Stage Lifecycle Hooks

### 4.1 Overview

Stage lifecycle hooks are the trigger surface for the Research Engine. They are defined in `stageConfig[]` in `convex/journeyEngine.ts` and represent distinct moments in the lifecycle of a stage when research should be initiated.

There are six hooks:
1. `onCreate` — fires when the invention record is first created (Stage 1 only)
2. `onOpen` — fires when any stage is first unlocked and made accessible to the founder
3. `onStageEnter` — fires when the founder actively opens (navigates to) a stage
4. `onStageComplete` — fires when the founder completes a stage and advances
5. `scheduledResearch` — fires on a recurring time-based schedule (not an event)
6. `manualRefresh` — fires when the founder explicitly requests a research refresh

These six hooks cover the full surface of research trigger opportunities across the inventor journey.

### 4.2 Hook: onCreate

**When it fires:** Immediately when a new `inventions` record is created for a founder. This fires before the founder has completed Stage 1 for the first time.

**Purpose:** To begin the most basic initial research that can be conducted with minimal context — specifically, research that helps Atlas prepare for the Stage 1 conversation before the founder has said much beyond their initial product description (if any is captured at account creation).

**What research occurs at onCreate:**
- None from external sources at this moment, because there is no product description yet to seed research queries
- What does occur: initialization of the research tracking state for the invention — setting up the `researchResults` scaffolding and ensuring the Research Engine is ready to receive the first meaningful trigger
- Some implementations may capture initial product category or problem space from the onboarding flow; if captured, a light competitive overview can be initiated here

**Practical notes:**
- onCreate is the lightest hook. The heavier research does not begin until onOpen for Stage 1 or onStageEnter for Stage 1, when the founder has provided a product description.
- If the onboarding flow captures a product category (e.g., "I'm building a physical consumer product in the food and beverage space"), onCreate can trigger a light category-level research sweep: rough market size, known major competitors, and regulatory overview. This gives Stage 1 a head start before the founder has typed their product description.

### 4.3 Hook: onOpen

**When it fires:** When a stage first becomes unlocked and accessible to the founder. A stage becomes unlocked when the prior stage is sufficiently complete (per the Journey Engine's readiness gating logic). `onOpen` fires once per stage per invention — the first time the stage transitions from locked to accessible.

**Purpose:** To execute the majority of the stage's pre-research before the founder opens the stage. The goal is that when the founder navigates to a stage, the research has already been running in the background and is either complete or nearly complete. The founder should arrive at a stage that already has populated data, not a blank form.

**Execution timing:** `onOpen` fires immediately when the stage is unlocked — which is triggered by the founder completing the prior stage. Because the founder typically takes some time after completing Stage N before navigating to Stage N+1, this gives the Research Engine a window (typically minutes to hours) to complete most research before the founder arrives.

**What research occurs at onOpen, by stage:**

**Stage 1 — Idea Capture:**
- No prior stage data available; `onOpen` fires with the product description submitted during onboarding (if available)
- If product description is available: Light competitive sweep (web search for similar products), initial patent landscape preview, SIC/NAICS category inference
- If no product description yet: No research; waits for `onStageEnter` after the description is provided

**Stage 2 — Validation:**
- Input: Product description and Idea Brief from Stage 1
- Research triggered: Community problem signal (Reddit, forums, app store reviews for competing products), competitive product review sentiment, funding history of known competitors as market activity proxy

**Stage 3 — Market Research:**
- Input: Product description, target audience, competitive landscape from Stages 1–2
- Research triggered: Comparable category market sizes from public data, demographic data for target segment, search trend volume for product category and related keywords, competitive market share proxies (Alexa rank, social following as indicators), industry growth rate and CAGR from published reports, market trend reports

**Stage 4 — Patent Readiness:**
- Input: Product description, novel element statements if already articulated, invention mechanism keywords
- Research triggered: Automated prior art search using USPTO API and Google Patents API (top 20–50 most relevant results), recent patent activity in the technology area (last 24 months), competitor patent filings, IP attorney networks relevant to invention category

**Stage 5 — Product Design:**
- Input: Product type (from Stage 1 physical product spec module), product description, target market
- Research triggered: Regulatory requirements by product category and target market (FDA, CE, Prop 65, etc.), material specifications standard for the product type, manufacturing implications of material choices (MOQ, tooling, lead times), industrial design firms and freelancers specializing in the product category

**Stage 6 — Prototype:**
- Input: Product type, product spec, open design questions from Stage 5
- Research triggered: Prototype services and fabricators by product type and geography, cost and lead time benchmarks for each prototype phase, common failure modes in the product design's mechanism type, user testing recruitment criteria for the product category

**Stage 7 — Manufacturing:**
- Input: Product type, product spec, geographic preference from founder
- Research triggered: Manufacturers in product category (domestic and overseas shortlist), typical MOQ and tooling cost benchmarks, freight cost estimates for international manufacturing scenarios, factory certification requirements (ISO, FDA registration, food contact certifications), common IP risks in manufacturing agreements for this product type

**Stage 8 — Branding:**
- Input: Product description, target customer profiles, competitive landscape
- Research triggered: Competitive brand landscape (what existing brands look and sound like, what whitespace exists), visual aesthetic references for the product category, brand name preliminary connotation analysis for target market

**Stage 9 — IP Protection:**
- Input: Provisional patent filing date (if available), public disclosures logged, patent claims from Stage 4, product spec from Stage 5, brand identity from Stage 8
- Research triggered: IP attorneys with consumer goods and relevant product category specialty, recent patent filings in the technology area, applicable International Classes for trademark registration, competitive patent monitoring (check for new filings since Stage 4)
- Note: IP deadline calculations (provisional → utility conversion window) are triggered here using entered filing dates — these are calculations, not external research

**Stage 10 — Pricing:**
- Input: Product type, competitive landscape, Stage 7 manufacturer quotes, Stage 3 customer profiles
- Research triggered: Current competitor pricing for the product category (web search), retail margin requirements for applicable channels (keystone, Amazon FBA, distributor), consumer willingness-to-pay signals from Stage 2 validation notes, pricing benchmarks for comparable products at similar quality and positioning

**Stage 11 — Marketing:**
- Input: Brand identity, customer segment profiles, competitive landscape, pricing
- Research triggered: Channel performance benchmarks for the product category, keyword and SEO opportunity for content strategy topics, competitor marketing positioning and channel presence (Meta Ad Library + web), influencer accounts in product category with engagement metrics, editorial calendar windows for relevant publications, audience size estimates and CPC benchmarks for recommended paid channels

**Stage 12 — Sales:**
- Input: Messaging architecture, brand identity, product spec, pricing, customer profiles
- Research triggered: Margin structure and requirements for each applicable sales channel, comparable product performance on relevant marketplace platforms, retail buyer contacts for the product category (RangeMe/Faire integration), conversion rate benchmarks for DTC, Amazon, and retail categories

**Stage 13 — Funding:**
- Input: All prior stage outputs (market research, product spec, brand, pricing, unit economics, sales projections)
- Research triggered: Angel investors and seed funds active in the product category, applicable government grant programs (SBIR, STTR, state programs) by product category, comparable raises (stage, sector, geography matched), strategic corporate investors in the category, crowdfunding platform performance benchmarks for the product type

**Stage 14 — Launch:**
- Input: All prior stage completion records, launch date target, channel selections
- Research triggered: Launch timing benchmarks for the product category (seasonality, competitive windows), PR coverage opportunities (journalists, outlets, communities covering the product's space), customer review platform setup requirements for applicable channels

**Stage 15 — Growth:**
- Input: Analytics connections established, sales data from first weeks post-launch
- Research triggered: Channel expansion benchmarks for comparable businesses, international expansion readiness criteria for the product type, competitor product evolution (what others in the space are iterating toward), new SKU opportunity signals based on available growth data

### 4.4 Hook: onStageEnter

**When it fires:** Every time the founder actively navigates to a stage. Unlike `onOpen` (which fires once when a stage is first unlocked), `onStageEnter` fires on every visit to the stage. This includes the first visit and all subsequent visits.

**Purpose:** To handle two scenarios that `onOpen` cannot cover:
1. **Context is now available that wasn't available at onOpen:** The founder may have added product description details, answered clarifying questions, or provided information that seeds more specific research queries than were possible at unlock time.
2. **Stale research needs refreshing:** If a significant amount of time has passed since onOpen research ran, onStageEnter can trigger a freshness check and re-run any stale results.

**What research occurs at onStageEnter:**

- **Freshness check:** For each research module associated with the stage, check whether the current result is fresh (see Section 6 for freshness policy). If any result has expired since it was last run, enqueue a refresh job.

- **Context delta check:** Compare the current stage context (current stageProgress field values) against the context that was used when research last ran. If material context has changed (e.g., the founder updated their product description or added a target market), re-run the affected research modules with the updated context.

- **Incomplete research check:** If any research modules that should have run at onOpen have not yet completed (e.g., they were still in-progress or failed), re-enqueue them at higher priority on this stage enter, since the founder is now actively viewing the stage.

**Important:** onStageEnter does not re-run all research on every visit. It is a targeted freshness and completeness check, not a full research reset. Research that is still fresh is not re-triggered.

### 4.5 Hook: onStageComplete

**When it fires:** When the founder completes a stage and advances to the next stage. Specifically, when the Journey Engine determines that the stage's readiness score has crossed the threshold for "Ready to Move Forward" and the founder has confirmed advancement.

**Purpose:** To trigger research that:
1. Was waiting for stage completion data as its input (some research modules can only run after the current stage is fully populated)
2. Should prepare the next stage's research environment before the founder arrives there
3. Should update monitoring or risk tracker items based on decisions made in the completed stage

**What research occurs at onStageComplete:**

- **Next-stage preparation:** Immediately after Stage N completes, the Research Engine pre-triggers a subset of Stage N+1's onOpen research using the data that just became available from Stage N completion. This gives Stage N+1's research the maximum possible head-start before the founder arrives.

- **Stage-specific post-completion research:**

  - **Stage 1 completion:** Trigger detailed competitive research (now that the full Idea Brief is finalized, more specific search queries are possible)
  - **Stage 4 completion:** Trigger ongoing patent landscape monitoring enrollment (monthly check for new filings in the technology area)
  - **Stage 7 completion:** Trigger unit economics calculation pipeline (now that manufacturer quotes are finalized, the full unit economics model can be populated)
  - **Stage 8 completion:** Trigger trademark and domain availability checks for the finalized brand name
  - **Stage 9 completion:** Enroll provisional patent deadline tracker (if a provisional filing date was entered)
  - **Stage 10 completion:** Trigger ongoing competitive pricing monitoring enrollment (monthly refresh of competitor prices)
  - **Stage 11 completion:** Trigger landing page SEO optimization research using the finalized messaging architecture
  - **Stage 14 completion (launch):** Trigger enrollment in post-launch competitive intelligence monitoring (weekly) and KPI monitoring (daily, if analytics platforms are connected)

- **Cross-stage data propagation signal:** After completion research runs, signal the Document Pipeline that new stage outputs are available, triggering re-assembly of any documents that depend on the just-completed stage's outputs.

### 4.6 Hook: scheduledResearch

**When it fires:** On a time-based recurring schedule, independent of founder actions. Scheduled research is enrolled when a stage completes and a recurring research need is identified.

**Purpose:** To keep research fresh after the founder has moved past the stage that first generated it. Markets change, competitors change prices, new patents get filed, and platforms launch new products. Research conducted once at stage open becomes stale over time. Scheduled research ensures Atlas's knowledge stays current through the ongoing journey.

**Scheduling mechanism:** When a stage completes and scheduled research is indicated, the Research Engine registers a Convex scheduled function with:
- `inventionId` — which invention to run research for
- `moduleId` — which research module to refresh
- `interval` — the recurring interval (weekly, monthly, quarterly)
- `stageId` — which stage the refreshed result belongs to
- `nextRunAt` — the timestamp for the next scheduled run

The scheduled function writes a new queue entry at each firing time, which the normal queue processing mechanism handles like any other job.

**What scheduled research runs, by module:**

| Research Module | Cadence | Trigger Stage | Continues Through |
|---|---|---|---|
| Competitive product landscape | Monthly | Stage 1 completion | Entire journey and post-launch |
| Community sentiment for problem space | Monthly | Stage 2 completion | Stage 15 |
| Search trend volume for product keywords | Monthly | Stage 3 completion | Stage 15 |
| Patent landscape — new filings in technology area | Monthly | Stage 4 completion | Post-launch indefinitely |
| Competitive pricing | Monthly | Stage 10 completion | Stage 15 |
| Competitor marketing intelligence | Monthly | Stage 11 completion | Stage 15 |
| KPI monitoring (if analytics connected) | Daily | Stage 14/15 (post-launch) | Post-launch indefinitely |
| Competitive intelligence feed | Weekly | Stage 14 (post-launch) | Post-launch indefinitely |
| New SKU opportunity signals | Monthly | 90 days post-launch | Post-launch indefinitely |

**How scheduled results are presented to the founder:** Scheduled research results do not interrupt the founder's active session. They are queued and processed in the background. When the founder next opens a relevant stage view, they see:
- A "Research updated [N days ago]" indicator showing the result is recent
- A diff highlight if the new result differs materially from the prior version
- No forced interruption; the update is surfaced as an informational enhancement, not a blocking review

### 4.7 Hook: manualRefresh

**When it fires:** When the founder explicitly requests a research refresh for a specific module within a stage view. This is a direct, founder-initiated trigger — not a system-initiated trigger.

**Purpose:** To give founders the ability to force a fresh research run when:
- They believe the current research result is outdated
- They rejected the current result and want Atlas to try again
- They added context (e.g., updated their product description) and want research re-run with the new context
- Time has passed since the last research run and they want current data before making a decision

**What happens on manualRefresh:**

1. The founder clicks "Refresh this research" (or equivalent UI trigger) in the stage view for a specific module
2. The UI calls a Convex mutation that enqueues a `manualRefresh` job for that (inventionId, stageId, moduleId)
3. The job is enqueued at high priority (same as `onStageEnter` triggered jobs)
4. The stage view shows a "Refreshing..." indicator while the job runs
5. When complete, the new result is displayed alongside a diff from the prior result
6. The founder reviews the new result and can accept, edit, or reject it as normal

**Rate limiting:** To prevent excessive API cost, manualRefresh is rate limited per (inventionId, moduleId) pair: no more than one manual refresh per module per hour. If the founder attempts to refresh within the cooldown window, they receive a notice: "This research was just updated [N minutes] ago. You can refresh again after [time]."

**Priority treatment:** manualRefresh jobs are assigned the highest user-interactive priority in the queue (Priority Level 1 — see Section 5). They preempt scheduled and background research jobs because the founder is actively waiting for the result.

---

## Section 5 — Research Queue

### 5.1 Overview

The Research Queue is the persistence and scheduling layer for all research work in the Atlas Research Engine. It ensures that research jobs are executed reliably, in the right order, without overloading external providers, and with appropriate handling for failures.

The queue is implemented as a Convex table (`researchQueue`) combined with Convex Actions that serve as workers. Convex's reactive query system provides built-in observability into queue state.

### 5.2 Priority System

The Research Queue uses a five-level priority system. Priority determines the order in which jobs are dispatched when the queue contains more work than active workers can handle concurrently. Lower numbers = higher priority.

**Priority Level 1 — User Interactive (Highest)**
- **Source:** manualRefresh hook
- **Description:** The founder is actively waiting for this result. It must run as soon as any worker slot is available.
- **Examples:** Founder clicks "Refresh competitor research" while reviewing Stage 3. Founder requests a re-run of prior art search after rejecting the initial result.
- **SLA Target:** Begin execution within 5 seconds of enqueueing. Complete within 60 seconds where provider latency permits.

**Priority Level 2 — Blocking Stage Entry**
- **Source:** onStageEnter hook, for modules that are required for the stage view to be meaningful
- **Description:** The founder has just opened a stage and the stage view is either blank or showing stale data because a required research module has not yet completed. These jobs are not interactive in the "waiting for a click" sense, but the founder is actively in the stage and the delay is visible.
- **Examples:** Competitive landscape research that should have been ready at Stage 3 open was still in-progress when the founder arrived. Prior art search is still running when the founder enters Stage 4.
- **SLA Target:** Begin execution within 15 seconds of enqueueing. Complete within 120 seconds.

**Priority Level 3 — Pre-Stage Research (Default)**
- **Source:** onOpen hook, onStageComplete hook (for next-stage pre-loading)
- **Description:** Background research preparing a stage that the founder has not yet entered. The founder does not see this work in progress, but its completion before the founder arrives is the goal.
- **Examples:** Stage 5 regulatory compliance research running after Stage 4 completes. Manufacturer shortlist research running when Stage 7 is first unlocked.
- **SLA Target:** Begin execution within 60 seconds of enqueueing. Complete before the founder typically arrives at the stage (target: within 15 minutes of enqueueing).

**Priority Level 4 — Scheduled Refresh**
- **Source:** scheduledResearch hook
- **Description:** Periodic background refresh of research that was previously completed. The current result is still valid; this job updates it with fresher data.
- **Examples:** Monthly competitive pricing refresh. Monthly patent landscape monitoring check.
- **SLA Target:** Begin execution within 30 minutes of the scheduled fire time. Complete within the day.

**Priority Level 5 — Low Priority Background (Lowest)**
- **Source:** onCreate hook pre-loading, optional supplementary research triggered by onStageComplete for non-critical modules
- **Description:** Nice-to-have research that improves quality but does not block any stage or founder interaction.
- **Examples:** Enriching a manufacturer shortlist with additional candidates beyond the minimum required. Pre-loading distant future stage research (e.g., Stage 13 comparable raises when the founder is only in Stage 7).
- **SLA Target:** Best-effort. Complete within 24 hours.

**Priority escalation:** A job's priority can be escalated if it remains unstarted past its SLA target. A Priority Level 3 job that has been pending for 10 minutes without starting is escalated to Priority Level 2 to prevent it from remaining in queue behind a backlog.

### 5.3 Concurrency

**Per-invention concurrency limit:** No more than 5 research jobs for the same `inventionId` may run concurrently. This prevents a single inventor's research burst (e.g., when they complete Stage 1 and all Stage 2 + Stage 3 onOpen jobs fire) from monopolizing all worker capacity.

**Per-module concurrency limit:** No more than 1 job for the same (inventionId, moduleId) combination may be in-progress at the same time. If a job for `competitive_landscape` for Invention A is already in-progress, a second job for the same (inventionId, moduleId) is held in queue until the first completes.

**Global concurrency limit:** The total number of concurrently running research workers across all inventions is bounded by Convex's action concurrency limits. The Research Engine's queue dispatcher respects these limits and does not dispatch new jobs when the global limit is reached.

**Burst handling:** When a founder completes a stage and multiple onStageComplete + next-stage onOpen jobs fire simultaneously, the dispatcher batches them into the queue with appropriate priorities rather than attempting to start all of them at once. Priority Level 1 and 2 jobs are dispatched immediately. Priority Level 3–5 jobs are staggered to prevent burst overload on external providers.

### 5.4 Scheduling

**Immediate jobs:** Jobs with no `scheduledFor` value are eligible for immediate dispatch. The dispatcher checks for available worker slots every time a new job is enqueued.

**Deferred jobs:** Jobs with a `scheduledFor` timestamp are held in queue until that timestamp is reached. The Convex scheduled function that manages recurring research writes deferred jobs with the appropriate future timestamp.

**Backoff scheduling:** When a job fails and is eligible for retry, the retry job is written with a `scheduledFor` value calculated from the backoff formula:
- Attempt 1 (first retry): scheduledFor = now + 30 seconds
- Attempt 2: scheduledFor = now + 120 seconds (2 minutes)
- Attempt 3: scheduledFor = now + 600 seconds (10 minutes)
- Attempt 4 (last retry): scheduledFor = now + 1800 seconds (30 minutes)

The scheduler runs a Convex query on a 5-second polling interval that checks for jobs where `scheduledFor <= now` and transitions them from deferred to eligible for dispatch.

### 5.5 Cancellation

Research jobs can be cancelled in the following scenarios:

**Explicit cancellation by the Research Engine:**
- When a stage is reset or an invention is deleted, all pending and in-progress jobs for that inventionId are cancelled
- When a higher-priority job for the same (inventionId, moduleId) is enqueued (e.g., a manualRefresh fires while an onOpen job for the same module is still pending), the lower-priority job is cancelled and the higher-priority job proceeds

**Implicit cancellation:**
- If a job remains in pending state past 4x its SLA target without a worker becoming available, it is cancelled with reason `"queue_timeout"` and a new job is re-enqueued at a higher priority tier

**In-progress cancellation:**
- In-progress Convex Actions cannot be forcefully terminated mid-execution. Instead, cancellation signals are written to the queue entry. The worker checks for the cancellation signal at safe checkpoint intervals within its execution. When a worker detects a cancellation signal, it completes the current API call, writes whatever partial result it has, marks the job as cancelled, and exits without writing a full result.

**What happens to cancelled jobs:**
- The prior successful result (if any) remains active and unaffected
- The cancellation event is logged in the queue entry
- If the cancellation was due to a replacement job being enqueued (higher-priority manualRefresh), the new job proceeds immediately without waiting for the cancelled job to fully terminate

### 5.6 Retries

Retry behavior is defined per-module with defaults specified in the module configuration. The base defaults are:

| Configuration | Default Value | Configurable Range |
|---|---|---|
| Max retry attempts | 4 | 0–8 |
| Retry on network error | Yes | Yes/No |
| Retry on provider 429 (rate limit) | Yes | Yes/No |
| Retry on provider 5xx | Yes | Yes/No |
| Retry on timeout | Yes | Yes/No |
| Retry on 4xx (other than 429) | No | No |
| Retry on empty result | No (treated as valid result with low confidence) | Yes/No |

**Retry result quality:** If a retry produces a better result (higher confidence score, more complete coverage) than the previous attempt, the better result is stored as the active version.

**Provider rotation on retry:** If a research module supports multiple providers (see Provider Abstraction Layer, Part 2 Section 7), the retry scheduler may rotate to an alternate provider on the second retry. This handles provider-specific outages without requiring permanent provider switching.

### 5.7 Timeouts

Each research job has a timeout that limits how long the background worker can run before being considered failed:

| Priority Level | Default Timeout | Maximum Timeout |
|---|---|---|
| Priority 1 (User Interactive) | 45 seconds | 90 seconds |
| Priority 2 (Blocking Stage Entry) | 90 seconds | 180 seconds |
| Priority 3 (Pre-Stage Research) | 180 seconds | 360 seconds |
| Priority 4 (Scheduled Refresh) | 300 seconds | 600 seconds |
| Priority 5 (Low Priority Background) | 600 seconds | 900 seconds |

Module-specific timeouts can override these defaults. For example, the Patent Prior Art Search module may need a longer timeout due to the volume of API calls required (searching across multiple query variations), while the Domain Availability module has a very short timeout (a single API call with a fast response).

**Timeout behavior:** When a timeout is reached, the worker is signaled to complete its current operation and return. If the worker has partial results at timeout (e.g., 15 of 20 prior art search queries have returned), those partial results are stored with a reduced confidence score and a `"partial_result"` flag. The next retry attempt continues from a full restart (not from the partial state).

### 5.8 Duplicate Prevention

The Research Engine prevents duplicate work through multiple mechanisms:

**Queue-level deduplication:** Before enqueuing a new job, the dispatcher checks for an existing job in `researchQueue` with matching (inventionId, stageId, moduleId) that is in `"pending"` or `"in_progress"` status. If one exists, the new enqueue is suppressed and the existing job's ID is returned.

**Cache-level deduplication:** Before enqueuing a job, the dispatcher checks `researchResults` for a fresh result (see Section 6 for freshness policy). If a fresh result exists, no job is enqueued. The fresh result is returned directly.

**Concurrent execution guard:** The per-module concurrency limit (only 1 job per (inventionId, moduleId) in-progress at any time) prevents race conditions where two concurrent jobs for the same module would write conflicting versions to `researchResults`.

**Context hash check:** Each queue entry stores a hash of the context data that was used to build the research request (product description, stage outputs, prior research). If a new request arrives for the same module with an identical context hash, and a result for that context hash exists and is not expired, the new request is treated as a cache hit rather than a new job.

### 5.9 Queue Monitoring

The Research Queue exposes monitoring data through Convex queries accessible by Atlas's operational tooling:

**Queue depth by priority:** Count of pending jobs at each priority level. Used to detect queue growth (indicates workers are not keeping up with job creation rate).

**Per-invention research lag:** For each active invention, the age of the oldest pending research job. Used to detect inventions where research is significantly delayed.

**Completion rate by module:** Percentage of jobs completed successfully vs. failed, per research module. Used to detect module-specific reliability issues.

**Average execution time by module:** P50 and P95 execution times per module. Used to detect provider latency degradation.

**Provider error rate by provider:** Error rate per provider, categorized by error type (network, 4xx, 5xx, timeout). Used to detect provider-specific issues and trigger provider rotation decisions.

**Stale result count:** Count of `researchResults` records where `expiresAt < now` and no pending refresh job exists. This is the backlog of stale research that has not yet been refreshed.

**Key alerts:**
- Queue depth > 50 pending jobs at Priority 1 or 2: immediate alert (founder-facing delays)
- Any module with > 20% failure rate over a 24-hour window: operational alert (provider issue)
- Any invention with research lag > 30 minutes at Priority 3: informational alert (background pre-loading falling behind)
- Any provider with > 10% error rate in the last hour: operational alert

---

## Section 6 — Caching

### 6.1 Overview

Research results are expensive to produce — they require external API calls that cost money, take time, and consume provider rate limits. The Research Engine must not re-execute research that is still accurate enough to use. Caching is the mechanism that prevents redundant work.

Caching in the Research Engine operates at the result storage layer, not at the HTTP cache layer. The cache is the `researchResults` table itself. A "cache hit" means a valid, non-expired result exists for the requested (inventionId, stageId, moduleId, contextHash) combination. A "cache miss" means no such result exists, or the existing result has expired.

### 6.2 Cache Keys

Each research result is keyed by a combination of four dimensions:

**Primary key fields:**
- `inventionId` — Which inventor's data this is
- `stageId` — Which stage this research was generated for
- `moduleId` — Which research module generated it (e.g., `"competitive_landscape"`, `"prior_art"`, `"competitor_pricing"`)

**Context hash:**
- `contextHash` — A deterministic hash of the input parameters used to execute the research. This captures the "what was searched for" dimension, distinguishing results for the same module but different inputs.

**What goes into the context hash depends on the module:**

| Module | Context Hash Inputs |
|---|---|
| Competitive Landscape | Product description (normalized), product category, target market |
| Prior Art Search | Invention description (normalized), novel element statements, technology keywords |
| Competitor Pricing | Product category, competitor list (sorted), target channels |
| Market Size | Product category, target segment definition, geographic market |
| Manufacturer Shortlist | Product type, geographic preference |
| Trademark Availability | Brand name candidate (exact, lowercased) |
| Domain Availability | Brand name candidate (exact, lowercased) |
| Grant Programs | Product category, business stage, geographic market |
| Influencer Research | Product category, target audience demographic |

**Context hash stability:** The context hash is computed from a canonical representation of the inputs (whitespace-normalized, field-sorted, lowercased for text fields). Small surface-level changes to the product description (e.g., fixing a typo) should not invalidate the context hash unless the change is semantically material. Hash stability rules per module are defined in the module configuration.

**Version within a key:** Multiple versions can exist for the same (inventionId, stageId, moduleId, contextHash). The active version is always the highest-version completed record. Prior versions are retained for history.

### 6.3 Expiration

Each research result has an `expiresAt` timestamp. When the current time passes `expiresAt`, the result is considered stale. Staleness does not make the result unavailable — stale results continue to be served until a fresh result replaces them. But staleness does trigger a refresh job (subject to the scheduling and priority rules of the Research Queue).

**Default expiration durations by module category:**

| Category | Default Expiration | Rationale |
|---|---|---|
| **Time-invariant research** | 180 days | Research that doesn't change with market conditions: patent search methodology, regulatory compliance requirements (stable until laws change), tooling cost calculation methodology |
| **Slow-changing market data** | 90 days | Industry structure, major competitor lists, market size estimates. These change, but slowly. A 90-day-old market sizing is still useful. |
| **Periodic market data** | 30 days | Competitor pricing, new competitor launches, search trend volume. Monthly refresh keeps this current enough for decision-making. |
| **Rapidly changing data** | 7 days | Trademark filing status for a name in active consideration, social handle availability (claimed quickly), promotional pricing |
| **Real-time data** | 1 day | KPI monitoring (post-launch), launch-day competitive monitoring, inventory levels |
| **One-time research** | Never expires | Research that is only relevant at a specific moment and whose result is locked by a founder decision (e.g., prior art results that feed an approved IP Strategy Recommendation) |

**Module-specific overrides:** Each research module defines its own expiration duration, which overrides the category default. The module specification (Part 3) documents the expiration duration for each module.

**Expiration vs. freshness:** These are related but distinct concepts. Expiration is a hard threshold — past the expiration date, the result is stale. Freshness is a softer measure that accounts for both expiration and confidence score. A result can be fresh (within expiration window) but still low confidence. A result can be recently expired but still high confidence. Freshness policy (Section 6.4) governs when the Research Engine treats an existing result as sufficient vs. triggering a refresh.

### 6.4 Refresh Rules

A refresh is triggered when the Research Engine determines that the current cached result should be replaced with a newer one. The rules that govern when a refresh occurs:

**Rule 1 — Expiration-based refresh (automatic):**
When a job is enqueued that would produce a result for an (inventionId, stageId, moduleId) combination, the dispatcher first checks if the current result is expired (`researchResults.expiresAt < now`). If expired, the job proceeds (cache miss). If not expired, the job is skipped (cache hit).

**Rule 2 — Context change refresh (automatic):**
When a new job is enqueued with a different `contextHash` from the current active result, the job proceeds even if the current result is not expired. If the inventor updates their product description materially, the competitive landscape research should re-run with the new description — even if the old result was researched yesterday.

**Rule 3 — Scheduled refresh (time-based):**
The `scheduledResearch` hook fires on the defined cadence for each monitoring module and enqueues a refresh job at Priority Level 4. This runs regardless of the current result's expiration status — scheduled refreshes run on their cadence whether the result is technically expired or not.

**Rule 4 — Manual refresh (founder-initiated):**
The `manualRefresh` hook always triggers a refresh, regardless of expiration or context. When the founder explicitly requests a refresh, Atlas runs it.

**Rule 5 — Failed result refresh:**
If the current active result has a `"failed"` status (all retries exhausted), the next `onStageEnter` event for that stage triggers a retry at Priority Level 2 — treating the failed result as an expired cache miss.

**Rule 6 — Low confidence refresh:**
Results with confidence score below 40 (Very Low) are treated as soft-expired and will trigger a refresh on the next `onStageEnter`, even if they are within their nominal expiration window. A very-low-confidence result that is "fresh" is not worth keeping.

### 6.5 Freshness Policy

Freshness is the composite measure of whether a cached result is good enough to serve without a refresh. A result is considered fresh when ALL of the following are true:

1. The result status is `"completed"` (not failed, pending, or cancelled)
2. The result has not passed its `expiresAt` timestamp
3. The result's `contextHash` matches the current stage context (no material input changes since the result was produced)
4. The result's confidence score is at least 40 (Very Low confidence results are not considered fresh)
5. The result has not been explicitly rejected by the founder (founder rejection marks the result as stale regardless of expiration)

When a result is fresh, the Research Engine serves it from the cache without enqueueing a new job. This is a cache hit.

When a result fails any of these five conditions, the Research Engine treats it as a cache miss and enqueues a new job (subject to deduplication against existing queued jobs).

**Freshness for downstream systems:** The Document Pipeline and stage view query the freshness of research results before incorporating them into documents or displaying them. If a result is stale (but the refresh job hasn't completed yet), the stale result is served with a visible indicator: "This research was last updated [N days] ago. Atlas is refreshing it in the background."

### 6.6 Manual Refresh

Manual refresh is the founder-facing mechanism to request an immediate cache bypass. It is documented in Section 4.7 (manualRefresh hook) and Section 5.5 (Cancellation).

From a caching perspective, manualRefresh is a cache invalidation followed by a high-priority re-execution. The existing cached result is not deleted — it remains available as the active result until the new job completes. This ensures the founder has access to the existing data while the refresh runs.

**Manual refresh UI affordances:**
- Available on every research module surfaced in a stage view
- Displays the timestamp of the current result ("Last researched: 12 days ago")
- Shows the expected time to refresh ("Refreshing takes about 30–60 seconds")
- Rate limited to prevent abuse (see Section 4.7 for rate limit details)

**Manual refresh result handling:**
- If the manual refresh produces a better result (higher confidence, more complete), the new result replaces the old as the active version
- If the manual refresh produces a lower-quality result, both versions are available and the founder can choose which to use
- If the manual refresh fails, the existing cached result remains active and the founder sees an error message with the option to try again

### 6.7 Incremental Updates

Some research modules produce results that can be updated incrementally rather than re-run completely. Incremental updates allow Atlas to refresh only the portion of a result that has changed, rather than re-executing the full research task.

**When incremental updates apply:**

| Module | Incremental Update Pattern |
|---|---|
| **Competitive Landscape** | Add newly discovered competitors to the existing list without re-searching for already-known competitors. Delta query: search for competitors discovered since last run. Merge with existing list, checking for duplicates. |
| **Patent Landscape Monitoring** | Search only for patents filed since the last check date (`after:YYYY-MM-DD` filter in patent queries). Append new filings to the existing list. |
| **Competitor Pricing** | Re-query prices only for competitors already in the landscape; no need to rediscover the competitor list unless the competitive landscape result has been refreshed. |
| **KPI Monitoring** | Append new data points to the time series rather than re-fetching historical data. |
| **Competitive Intelligence Feed** | Fetch only content published since the last check timestamp. Append to the feed. |

**When incremental updates do NOT apply:**
- On context change (if the product description changes materially, the full research must re-run)
- On first run (no existing result to increment from)
- On manual refresh (the founder is requesting a full re-run, not an incremental update)
- For modules where the result is a holistic synthesis rather than an accumulating list (e.g., market size models, which are computed from the current state of all inputs, not from a delta)

**Incremental update implementation:** Each research module that supports incremental updates defines:
- A `lastRunCursor` field in the processed result (e.g., a timestamp, a page token, or a date range end)
- An `incrementalQuery` function that takes the prior cursor and returns a query scoped to new data only
- A `mergeFunction` that takes the prior result and the incremental additions and produces a combined result
- A confidence score recalculation that accounts for the merged result quality

Incremental updates produce a new version in `researchResults` (same versioning scheme as full re-runs) with the merged processed result and an updated confidence score.

---

## Summary

This document has defined the foundational architecture of the Atlas Research Engine across six sections:

| Section | What It Defines |
|---|---|
| Section 1 | The purpose, scope, mission alignment, and design philosophy of the Research Engine |
| Section 2 | The complete system architecture: components, data persistence, versioning, retry logic, and failure recovery |
| Section 3 | The full eight-step research lifecycle from trigger to stage update |
| Section 4 | All six stage lifecycle hooks with full definitions of what research runs at each |
| Section 5 | The complete Research Queue design: priority system, concurrency, scheduling, cancellation, retries, timeouts, deduplication, and monitoring |
| Section 6 | The caching layer: cache keys, expiration, refresh rules, freshness policy, manual refresh, and incremental updates |

**Part 2** (Sections 7–10) will define:
- Section 7: Provider Abstraction Layer — provider-independent architecture supporting all API integrations
- Section 8: Confidence Framework — scoring methodology, thresholds, evidence standards
- Section 9: Human Review Flow — auto-acceptance, founder approval, override, rejection
- Section 10: Security, privacy, rate limiting, cost controls, API budgeting, monitoring, audit logging

**Part 3** (Section 11+) will define:
- Section 11: Individual Research Modules (architecture for each of the 8 initial modules)
- Section 12: Engineering Principles (permanent rules for implementation)

---

*End of ATLAS_RESEARCH_ENGINE_ARCHITECTURE_PART1.md*
*Version 1.0 — July 2026*
*Architecture specification only. No implementation. No code changes.*
*Source: ATLAS_AUTOMATION_CONSTITUTION.md · ATLAS_AUTOMATION_IMPLEMENTATION_PLAN.md · FOUNDER_REFERENCE_PROJECT_RISE_JARS_PART_D.md*
