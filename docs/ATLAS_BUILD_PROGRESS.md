# Atlas Build Progress

**Last updated:** August 14, 2026  
**Release target:** Controlled pilot — Idea to Feasibility and IP Readiness  
**Authoritative scope:** `docs/ATLAS_PRODUCT_RESET_V1.md`  
**Overall completion:** **75%**

## How the percentage is calculated

The percentage is a weighted pilot-readiness estimate, not a count of files or screens. A workstream only receives full credit when its code, tests, documentation, runtime behavior, and required external configuration are verified.

| Workstream | Weight | Complete | Weighted contribution | Evidence / gap |
|---|---:|---:|---:|---|
| Product scope and safety baseline | 10% | 100% | 10.0% | Product Reset v1 defines customer, boundaries, autonomy, trust states, and release outcome. |
| Canonical invention data model | 12% | 90% | 10.8% | Core ledgers, daily usage, subscription events, privacy requests, version dependencies, media metadata, and invention deletion lifecycle exist. Migrations/backfill and account-deletion execution need deployment validation. |
| Autonomous orchestration engine | 18% | 88% | 15.8% | Dependency queue, leases, retries, atomic cost reservations, finite daily budgets, enforceable work-kind entitlements, human gates, stale-output rejection, automatic continuation, and scheduled recovery exist. Cloud runtime and long-running recovery remain unverified. |
| Feasibility package coverage | 18% | 62% | 11.2% | Dedicated work maps to every named package section, concept imagery, package assembly, Markdown, and formatted browser-local PDF/DOCX export with trust and review metadata. Live output quality and visual export QA remain. |
| Evidence and output trust | 12% | 68% | 8.2% | Claim typing, URL sanitation, source ledger, verification stage, 90-day verification freshness, disputes, coverage, trust promotion, dependency links, stale propagation, and professional-review gates exist. Live representative-case citation evaluation remains. |
| Inventor experience and chat | 10% | 80% | 8.0% | Status briefing, subscription status, privacy controls, locked-work visibility, work library, local downloads, review queue, blocked-work response, usage display, and record-aware chat exist. Full usability testing remains. |
| Security, privacy, and usage control | 8% | 97% | 7.8% | Backend authorization, token-bound files, signed subscription reconciliation, webhook hardening, finite budgets, bounded exports, privacy request controls, authorization tests, and a zero-vulnerability production audit are verified. Deployed threat/privacy testing remains. |
| Deployment and operations | 7% | 38% | 2.7% | Machine-checkable readiness, controlled-pilot runbook, scheduled recovery definition, admin operations console, privacy operations queue, and subscription secret checklist exist. Convex deployment, external monitoring, backups, and live operations remain incomplete. |
| Representative pilot evaluation | 5% | 15% | 0.8% | Deterministic package-quality checks cover completeness, unsupported claims, trust integrity, staleness, media, failures, and malformed human gates. No live representative invention or professional review has been completed. |
| **Total** | **100%** |  | **75.0% → 75%** | |

## Current milestone

**Milestone:** Make one invention run safely from intake through an evidence-checked feasibility recommendation without hidden manual assembly.

### Completed in the current build cycle

- Established the Product Reset v1 safety and scope baseline.
- Added the canonical invention record and ledgers for evidence, assumptions, decisions, approvals, work, deliverables, dependencies, and professional review.
- Built the autonomous work queue with priority, dependencies, leases, retries, cost budgets, and bounded run size.
- Seeded analysis, competitor, market, prior-art, technical, materials/manufacturing, regulatory, IP-readiness, evidence-verification, and final recommendation work.
- Added dashboard briefings answering what Atlas completed, discovered, needs, and will do next.
- Added inventor decision/approval review and the ability to respond to a genuine blocked-work gate; Atlas then resumes automatically.
- Added an invention-aware Ask Atlas experience backed by structured project state rather than chat memory.
- Added evidence URL sanitation and prevented unsupported claims from being stored as sourced facts.
- Added a separate source-verification stage and conservative trust-state promotion rules.
- Added deliverable source coverage, confidence, search date, limitations, and missing-information metadata.
- Added an inventor-visible execution history for autonomous work, costs, gates, decisions, and chat events.
- Added a secret-safe deployment readiness command and controlled-pilot deployment runbook.
- Connected downstream IP-readiness and recommendation work to prior deliverables and evidence, including their trust states.
- Added finite tier-aware daily autonomous budgets and chat allowances with inventor-visible usage.
- Added material-change propagation, stale finding/deliverable warnings, stale in-flight output rejection, automatic rework, version increments, and dependency records.
- Expanded the autonomous graph to dedicated generators for the complete named feasibility-package outline and final package assembly.
- Added metered `gpt-image-2` concept visualization generation as a separately retryable job, Convex media storage, maturity labeling, downloads, and deletion cleanup. No paid image request has been made yet.
- Corrected pricing and FAQ language to remove unlimited execution and unavailable legal/CAD claims.
- Added deterministic controlled-pilot package evaluation for completeness, evidence coverage, trust-state integrity, stale work, concept media, failures, and human-gate precision.
- Added required patent, engineering, and regulatory review records plus an admin-only recorded-review workflow; a deliverable is promoted only after every assigned review is accepted.
- Corrected the Enterprise active-invention allowance to a finite 25 across server and client policy code.
- Added a standard-risk representative fixture for an adjustable countertop produce-rinsing rack; its package passes complete evidence checks and fails closed for missing prior art or unsupported sourced claims.
- Added browser-local DOCX and PDF package exports containing current deliverable versions, trust states, evidence, assumptions, limitations, quality blockers, professional-review records, and safety disclaimers. Export libraries load only when requested and do not transmit invention content to another document service.
- Upgraded vulnerable authentication, Next.js, Convex, analytics, and transitive production dependencies; `npm audit --omit=dev` reports zero known production vulnerabilities.
- Hardened inherited storefront backend paths: catalog and upload writes, draft/admin queries, customer reports, and professional review now enforce administrator role in Convex itself; user purchase queries enforce identity; validation research enforces invention ownership; and storage URLs require a fulfilled bearer token tied to the purchased product.
- Added browser export size limits and user-visible failure handling so generated packages fail closed before exhausting browser memory.
- Added claim-time autonomous work entitlements: Explorer receives the research preview, Inventor receives feasibility and preliminary IP-readiness, and Pro/Enterprise receive design visualization, engineering handoff, and final package assembly. Higher-tier queued work is visibly locked instead of falsely presented as imminent.
- Hardened fulfillment webhooks with constant-time signature comparison, bounded/validated payloads, fulfilled-purchase checks, and fail-closed file selection.
- Added a signed, idempotent subscription-event ledger with out-of-order protection, pre-signup reconciliation, paid-period grace rules, cancellation/unpaid downgrade behavior, backend tier updates, and inventor-visible subscription status.
- Replaced placeholder privacy and terms pages with implementation-aligned controlled-pilot drafts that disclose AI processing, retention, ownership, professional limitations, safety boundaries, and the need for counsel review before public launch.
- Added authenticated, deduplicated export/deletion requests, inventor-visible request status, an administrator privacy-operations queue, and mandatory resolution notes for completed or declined requests.
- Added a 15-minute unattended recovery sweep that resumes queued work and reclaims expired leases without asking the inventor, while continuing to honor dependencies, plan entitlements, human gates, and bounded run budgets.
- Added atomic daily cost reservations so simultaneous autonomous claims cannot overspend a tier allowance; reservations settle on completion/failure/blocking, survive lease recovery, and are returned when an invention is deleted.
- Added explicit output-token ceilings for autonomous work and inventor chat to bound model cost and response size.
- Added a backend-admin-enforced operations console that prioritizes terminal failures, expired leases, human gates, and daily used/reserved autonomous cost without exposing it to inventor accounts.
- Added evidence-freshness enforcement: promoted output now requires a successful source verification no older than 90 days; missing, future-dated, expired, or malformed verification evidence fails closed and blocks the controlled-pilot evaluator.
- Extended unattended maintenance to mark outputs supported by expired evidence stale, requeue their verification once, resume that work automatically, and clear only the evidence-expiry stale marker after successful fresh verification.
- Bounded inventor-chat model context to 80,000 characters with per-record limits and explicit truncation markers; conversation display, rate-limit checks, and answer context now use bounded recent-message reads instead of unbounded history collection.
- Verified the current checkpoint with both TypeScript targets, 156 regression tests across 23 files, a zero-vulnerability production dependency audit, a readiness scan, and a clean local Next.js production build covering 30 routes. Document libraries remain lazy-loaded.

### In progress

- Run the representative fixture through the deployed autonomous generator before any paid pilot.
- Resolve the two machine-detected deployment blockers and three manual operations checks.
- Validate unattended recovery and reservation settlement against the deployed transactional runtime.

### Next highest-priority work

1. Connect a controlled Convex deployment, then run the representative fixture through the actual autonomous generators and deterministic quality gates.
2. Configure the existing OpenAI key in the Convex server environment through a masked secret flow.
3. Run one representative non-safety-critical physical product through the deployed workflow, including a low-cost live model/image smoke test after cost approval.
4. Render and visually inspect authenticated DOCX/PDF downloads from that representative case.
5. Add monitoring, spend alerts, backup ownership, incident response, and privacy/deletion validation.
6. Conduct inventor usability testing and patent/engineering professional review of the handoff package.

## Known release blockers

- No configured Convex deployment is present in the local workspace, so generated backend types and cloud runtime behavior cannot yet be verified.
- Creating the Convex target will upload the private backend source and mutate an external cloud deployment; the attempted connection was stopped pending explicit user approval for that specific external action.
- The OpenAI key is safely stored locally but has not been configured in the Convex server environment; no live paid model call has been made.
- Checkout links, backend work entitlements, and signed lifecycle reconciliation exist, but the MadeThis billing system has not yet been configured to send the new subscription event contract to a deployed Atlas endpoint.
- No professional patent/engineering reviewer has evaluated a generated handoff package.
- Account deletion is coordinated through the privacy-operations queue; the final cross-system deletion executor and restoration test are not yet implemented.
- The first-package generators and PDF/DOCX export exist, but their output quality and rendered document layout have not been validated on a deployed representative case.

## Progress-update rule

Update this document whenever a milestone closes, a release blocker changes, a new end-to-end verification is completed, or the weighted completion estimate changes by at least three percentage points. Every user-facing closeout should repeat the current percentage and distinguish verified work from work that only exists in code.
