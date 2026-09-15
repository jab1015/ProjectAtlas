# InventSmith Build Progress

**Last updated:** September 15, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally unmerged

## Current status snapshot

InventSmith status is reported by capability and acceptance evidence rather than unsupported overall completion percentages. Repository implementation, automated verification, deployment, live functional verification, and professional/real-world evidence are separate states and must not be collapsed into one number.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Product vision and routing

InventSmith — The Inventor OS by Modern Methods — is an organization-native operating system that owns the applicable journey:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering where applicable → Prototype → Manufacturing or Software Delivery → Branding → IP / Legal Preparation → Pricing → Marketing → Sales → Funding → Launch → Growth.**

Physical, software, hybrid and regulated inventions route through applicable branches. Unsupported harmful/abusive concepts are refused. Ordinary business/service-only concepts are routed outside the invention workflow.

## Hosting/source boundary

GitHub remains source/CI authority. The target runtime is a future Modern Methods-owned Vercel + Convex deployment. MadeThis is retired/historical and must not be used as a sync or deployment target. Repository-green is not equivalent to deployed or live verified.

## Implemented foundation

The branch contains organization-native ownership/membership/invention access; organization-scoped entitlements and usage accounting; active/archive capacity; consent-based invitations; privacy/export/deletion boundaries; complete journey routing; persistent invention records; evidence provenance/trust; autonomous work orchestration; partial validation/retry; worker lease/attempt safety; physical/software/hybrid/regulated classification; professional-review gates; real prototype/quote/launch evidence gates; versioned deliverables; explicit exact-revision external-use authorization; deliberate exact-generation manufacturing release; package export; and representative behavioral acceptance coverage.

## Major hardening completed

### Evidence and confidence

Model prose cannot promote itself into trusted evidence. Provider-returned source records and normalized source/claim association are required where external research is claimed. Prototype, manufacturer quote and launch/sales evidence have scoped downstream invalidation. Evidence removal re-closes applicable gates.

Direct behavior coverage verifies manufacturer-quote upload/removal and actual launch/sales upload/removal. Removing real launch evidence re-blocks `launch_actual_evidence`, clears stale completion/output/cost state, requeues dependent post-launch analysis, removes the evidence from the structured invention record, emits the blocked audit event, and leaves unrelated completed work untouched.

### Worker/resource safety

Attempts carry identity and bounded retry state. Stale/late workers cannot overwrite newer attempts. Known incurred usage survives completion/failure/human-gate settlement. Unknown provider usage remains explicitly unknown and is conservatively accounted rather than silently recorded as zero. Blocked-work resumption uses the organization-native usage ledger for organization inventions.

### Engineering/manufacturing maturity

Final manufacturing readiness is no longer a dependency-status-only result. Latest fresh reviewed prototype-readiness, RFQ and manufacturing-drawing artifacts are required, and the newest concrete native-CAD generation must be fresh, professionally reviewed and production-mature. Preliminary/stale/unreviewed newer CAD cannot be hidden by an older clean revision. Native CAD requires engineering professional review.

Accepted engineering review bound to the exact fresh current CAD revision can promote preliminary CAD to `engineering_reviewed`. Missing, rejected, changes-requested, stale, superseded, wrong-revision, or disqualifying sibling review state cannot. Reopened review invalidates engineering maturity and revokes `manufacturing_released` rather than preserving an obsolete production release. Engineering review never creates `manufacturing_released`.

A separate manager-authorized manufacturing-release mutation now releases one exact synchronized newest native-CAD generation only after the complete generation is fresh, `engineering_reviewed`, and backed by accepted auditable exact professional reviews. It is idempotent for the exact already-audited generation and fails closed on incomplete, ambiguous, stale, inconsistent, or insufficiently reviewed CAD. The transition is explicitly not supplier contact, disclosure, purchasing/payment, a production order, filing, or publication, and its audit metadata records `externalActionExecuted: false`.

### Consequential security

Direct authorization coverage protects privacy/deletion, targeted exports, organization member management, ownership transfer and billing-sensitive export. Raw billing attribution remains owner-only.

The actual blocked-work mutation derives the gate from stored work-item state, permits bounded free-form text only for `private_information`, requires invention edit authorization before writes, preserves unrelated state, audits the transition, schedules only under current usage/entitlement, uses organization-native usage for organization inventions, and fails all consequential/missing/unknown gates closed. Mutation-level tests cover success, empty/oversized input, consequential gate classes, authorization failures, wrong scope, replay, exhausted usage and rejected-side-effect safety.

### Professional review and external-use authorization

Professional review and inventor authorization are intentionally separate. Qualified review may establish professional trust and engineering maturity, but it cannot itself disclose, publish, file, manufacture, order, contact a third party, or grant external-use permission.

`ready_for_authorized_use` has a dedicated manager-authorized transition bound to one exact latest fresh deliverable. Ambiguous duplicate latest revisions fail closed. Required professional review must already be completed where policy requires it. Successful authorization is auditable and idempotent.

An exact replay of an accepted current/fresh professional review preserves an already-recorded external-use authorization. A material review change, staleness, supersession or maturity invalidation revokes that authorization state.

The Work Library exposes an explicit **Authorize external use** action. Its confirmation states that this exact-revision authorization does not replace professional review and does not automatically contact a third party, spend money, place a manufacturing order, make a legal filing, or publish anything. The authorization audit records `externalActionExecuted: false`.

### Consequential external-action approval scope

External disclosure/contact/file/publish approvals are bound to explicit deliverable IDs rather than invention scope alone. Request creation fails closed unless each scoped artifact is the latest, fresh, exact authorized revision. Approval revalidates that scope, and the execution guard revalidates it again immediately before consequential execution. A stale or superseded artifact therefore cannot ride an older approved request into an external action.

Legacy/unscoped external requests cannot be approved or executed, but an authorized manager can still decline them safely. Payment approval remains a separate path and is not falsely forced into artifact-disclosure scope. Approval resolution itself is explicitly non-executing and records `externalActionExecuted: false`.

### Inventor-facing completion semantics

Inventor-facing status language now distinguishes InventSmith work state from external execution. Journey Center uses **Stage work complete** and explicitly states that stage completion does not mean supplier/professional contact, ordering/payment, filing, publication, or launch occurred. Department work uses **Work complete**; the dashboard uses **Idea-to-market stage work** and **Full InventSmith journey**; the status briefing uses **Recently completed work**. These semantics are regression-locked.

## Artifact/package boundary

Newest deliverable revision wins even when stale, preventing fallback to obsolete clean work. Full DOCX/PDF package export fails closed on package-quality failure, stale included output, or missing explicit external-use authorization. Draft/review artifacts remain available internally. Export metadata preserves maturity, trust, provenance, review records, limitations and external-use status.

## Reconstruction guard

Historical commit `d103d72b` produced a large textual change in `convex/inventionWorkspace.ts`. Audit of the live branch confirmed the original 13 workspace operations remain present; later refactors moved blocked-work and professional-review behavior into dedicated handlers rather than removing those operations. A source contract test locks all 13 operations, decision validation, dedicated safety handlers, consequential approval categories and organization-aware access checks against accidental future truncation.

## CI checkpoint truth

InventSmith CI #106, run `35017774702`, passed at exact code head `11be8a28f240a03bb960b8410a9261262e26f07a`. Dependency installation, operational-script checks, web TypeScript, Convex TypeScript, regression tests, production dependency audit and the Next production build all succeeded.

That exact verified head includes direct mutation tests for consequential approval artifact binding, stale/superseded revalidation, legacy denial, authorization failure, execution-time stale-scope rejection, manufacturing release, launch evidence removal, and the tightened inventor-facing completion semantics.

Documentation commits after `11be8a28` describe that verified code checkpoint; the latest documentation head must receive its own exact-head CI result before the documentation head itself is called automatically verified.

PR #24 remains draft/open/unmerged. `main` remains untouched.

## Remaining work

1. Qualify the newest documentation head with exact-head CI and correct concrete failures without weakening controls.
2. Finish migration of any remaining UI/callers from legacy approval resolution to the guarded exact-scope consequential approval path where such callers still exist.
3. Continue auditing every RFQ/manufacturer/external-contact execution path so confidential disclosure or contact requires current approved exact artifacts at execution time and internal permission/release events cannot be mistaken for execution.
4. Expand direct behavioral security tests for destructive, privacy, billing, organization-management and external-use operations.
5. Drive representative physical/hybrid/software/regulated cases farther through actual persisted state transitions, including replacement/removal invalidation, newest-revision behavior, manufacturing release and subsequent external-action boundaries.
6. Continue specialized artifact content and export-quality acceptance, including independent generated-format validation where feasible.
7. Finish low-risk InventSmith naming cleanup without destabilizing historical/compatibility identifiers.
8. Prepare fresh owner-controlled Vercel/Convex configuration and perform live acceptance only after provisioning.
9. Validate real billing/webhooks/providers/concurrency and calibrate commercial limits from measured economics.

## Status boundaries

- **Planned** means the capability is specified but not necessarily implemented.
- **Implemented** means code exists.
- **Automated verification passed** means the exact implementation head passed the relevant CI/tests.
- **Deployed** means the exact code/config is on Modern Methods-controlled infrastructure.
- **Live functionally verified** means authenticated acceptance passed there.
- **Professional review required/completed** records whether genuine qualifying review is still required or has actually occurred.

These statuses must never be collapsed into a production-ready claim.

## New-chat handoff

Read `INVENTSMITH_MASTER_PRODUCT_SPEC.md`, `INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`, this file, `INVENTSMITH_CAPABILITY_MATRIX.md`, `INVENTSMITH_DEPLOYMENT_RUNBOOK.md`, and `INVENTSMITH_DOCUMENT_AUTHORITY.md`; then fetch the live branch, draft PR #24 and exact-head CI. Trust live GitHub state over this document if newer.