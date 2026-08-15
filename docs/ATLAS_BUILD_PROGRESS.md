# Atlas Build Progress

**Last updated:** August 14, 2026  
**Release target:** Controlled pilot — Idea to Feasibility and IP Readiness  
**Authoritative scope:** `docs/ATLAS_PRODUCT_RESET_V1.md`  
**Overall completion:** **76%**

## How the percentage is calculated

The percentage is a weighted pilot-readiness estimate, not a count of files or screens. A workstream only receives full credit when its code, tests, documentation, runtime behavior, and required external configuration are verified.

| Workstream | Weight | Complete | Weighted contribution | Evidence / gap |
|---|---:|---:|---:|---|
| Product scope and safety baseline | 10% | 100% | 10.0% | Product Reset v1 defines customer, boundaries, autonomy, trust states, and release outcome. |
| Canonical invention data model | 12% | 92% | 11.0% | Core ledgers, usage, subscriptions, privacy operations, media metadata, invention deletion, and account-deletion code exist. Deployment/backfill validation remains. |
| Autonomous orchestration engine | 18% | 88% | 15.8% | Dependency queue, leases, retries, atomic reservations, finite budgets, entitlements, human gates, stale-output rejection, continuation, and scheduled recovery exist. Cloud runtime remains unverified. |
| Feasibility package coverage | 18% | 62% | 11.2% | Dedicated work maps to every named package section, concept imagery, package assembly, Markdown, and browser-local PDF/DOCX export. Live output quality and visual QA remain. |
| Evidence and output trust | 12% | 68% | 8.2% | Claim typing, source ledger, verification freshness, disputes, coverage, trust promotion, dependencies, stale propagation, and professional-review gates exist. Live representative-case citation evaluation remains. |
| Inventor experience and chat | 10% | 80% | 8.0% | Status briefing, subscription/privacy controls, locked-work visibility, work library, downloads, review queue, blocked-work response, usage display, and record-aware chat exist. Full usability testing remains. |
| Security, privacy, and usage control | 8% | 99% | 7.9% | Backend authorization, signed webhooks, finite budgets, bounded exports, privacy controls, transactional deletion implementation, CI checks, and zero known production vulnerabilities are verified in code. Deployed deletion/restoration testing remains. |
| Deployment and operations | 7% | 43% | 3.0% | Machine-checkable readiness, runbook, CI, scheduled recovery, admin operations, privacy operations, and a secret-safe health endpoint exist. Convex deployment, live monitoring, backups, and spend alerts remain. |
| Representative pilot evaluation | 5% | 15% | 0.8% | Deterministic quality checks cover completeness, unsupported claims, trust integrity, staleness, media, failures, and malformed human gates. No live representative invention or professional review has been completed. |
| **Total** | **100%** |  | **75.9% → 76%** | |

## Current milestone

**Milestone:** Make one invention run safely from intake through an evidence-checked feasibility recommendation without hidden manual assembly.

### Latest verified checkpoint

- Root Atlas application only; reference implementations are outside this release scope.
- GitHub `main` contains the autonomous controlled-pilot architecture and a permanent Atlas CI workflow.
- Added a fail-closed account-deletion executor that removes invention-owned records and stored artifacts, clears usage/notifications, removes Convex Auth credentials and sessions, and anonymizes retained transaction/subscription records.
- Account-deletion requests cannot be manually marked complete; administrators must execute the deletion workflow with auditable notes.
- Paid-account deletion requires explicit confirmation that external billing was cancelled or otherwise resolved before local identity/data deletion proceeds.
- Administrator accounts are protected from the privacy-queue deletion path.
- Added billing-gate regression coverage.
- PR #4 passed both TypeScript targets, **159 regression tests across 24 files**, `npm audit --omit=dev --audit-level=high` with **0 production vulnerabilities**, and a clean Next.js production build covering **30 routes** before merge.
- Added a backend health probe and public `/api/health` endpoint on the current operations branch. It exposes readiness booleans only and no secrets, user data, invention data, or detailed errors. This remains code-complete but not live-verified until Convex deployment.
- Deployment runbook now includes health monitoring and a disposable-account deletion/restoration acceptance test.

### Previously completed foundation

- Canonical invention record and ledgers for evidence, assumptions, decisions, approvals, work, deliverables, dependencies, professional review, usage, subscription events, and privacy requests.
- Autonomous dependency-based work queue with leases, retries, budgets, entitlements, human gates, automatic continuation, 15-minute recovery, and stale-output rejection.
- Market, competitor, prior-art, technical, materials/manufacturing, regulatory, IP-readiness, evidence-verification, concept-image, final recommendation, and package-assembly work types.
- Evidence URL sanitation, separate verification stage, 90-day verification freshness, source coverage, confidence, limitations, missing-information metadata, and automatic stale-work regeneration.
- Invention-aware Ask Atlas with bounded recent history and an 80,000-character model-context ceiling.
- Inventor status briefing, decision/approval review, work library, professional-review records, and execution history.
- Metered `gpt-image-2` concept visualization pipeline with Convex media storage and deletion cleanup.
- Browser-local DOCX/PDF package export with evidence, trust, limitations, professional-review status, and size limits.
- Backend authorization hardening, token-bound downloads, signed subscription reconciliation, finite plan limits, and admin operations/privacy consoles.

### In progress

- Validate the new deployment health endpoint through CI and merge it to `main`.
- Continue reducing code-level pilot blockers that do not require external deployment.
- Prepare the representative fixture and exports for live end-to-end deployment verification.

### Next highest-priority work

1. Put the health/operations milestone through CI and merge when green.
2. Improve export verification so representative PDF/DOCX bytes can be generated and structurally tested without requiring an authenticated browser session.
3. Connect a controlled Convex deployment and verify `/api/health`, auth, cron recovery, reservations, and the real autonomous work queue.
4. Configure the existing OpenAI key in the Convex server environment through a masked secret flow.
5. Run one representative non-safety-critical physical product through the deployed workflow, including a bounded live model/image smoke test.
6. Configure and validate the MadeThis subscription lifecycle webhook against the deployed endpoint.
7. Render and visually inspect representative DOCX/PDF output.
8. Run a disposable-account deletion/restoration test and configure live monitoring, spend alerts, backup ownership, and incident response.
9. Conduct inventor usability testing and patent/engineering professional review of the handoff package.

## Known release blockers

- No configured Convex deployment has yet been live-verified for the current build.
- The OpenAI key exists securely outside source control but is not yet verified in the Convex server environment; no live paid model/image call has been made in this build cycle.
- MadeThis has not yet been verified sending the signed subscription lifecycle contract to a deployed Atlas endpoint.
- No professional patent/engineering reviewer has evaluated a generated handoff package.
- Account-deletion execution is implemented and CI-verified, but a disposable deployed account deletion/restoration test remains required.
- PDF/DOCX generators exist and are regression-tested at the logic layer, but representative binary rendering/layout has not yet been visually verified.
- External monitoring, spend alerts, backup/restoration ownership, and incident-response operations are not yet live-configured.

## Progress-update rule

Update this document whenever a milestone closes, a release blocker changes, a new end-to-end verification is completed, or the weighted completion estimate changes materially. Every user-facing closeout should repeat the current percentage and distinguish verified work from work that only exists in code.
