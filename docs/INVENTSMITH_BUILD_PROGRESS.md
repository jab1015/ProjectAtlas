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

The branch contains organization-native ownership/membership/invention access; organization-scoped entitlements and usage accounting; active/archive capacity; consent-based invitations; privacy/export/deletion boundaries; complete journey routing; persistent invention records; evidence provenance/trust; autonomous work orchestration; partial validation/retry; worker lease/attempt safety; physical/software/hybrid/regulated classification; professional-review gates; real prototype/quote/launch evidence gates; versioned deliverables; package export; and representative acceptance coverage.

## Major hardening completed

### Evidence and confidence

Model prose cannot promote itself into trusted evidence. Provider-returned source records and normalized source/claim association are required where external research is claimed. Prototype, manufacturer quote and launch/sales evidence have scoped downstream invalidation. Evidence removal re-closes applicable gates.

### Worker/resource safety

Attempts carry identity and bounded retry state. Stale/late workers cannot overwrite newer attempts. Known incurred usage survives completion/failure/human-gate settlement. Unknown provider usage remains explicitly unknown and is conservatively accounted rather than silently recorded as zero.

### Engineering/manufacturing maturity

Final manufacturing readiness is no longer a dependency-status-only result. Latest fresh reviewed prototype-readiness, RFQ and manufacturing-drawing artifacts are required, and the newest native CAD must be fresh, professionally reviewed and production-mature. Preliminary/stale/unreviewed newer CAD cannot be hidden by an older clean revision. Native CAD now requires engineering professional review.

A remaining acceptance item is to prove and, if necessary, implement the safe artifact-maturity promotion path from preliminary CAD to `engineering_reviewed` after accepted qualified engineering review. `manufacturing_released` must remain a stronger deliberate boundary rather than being inferred merely from review acceptance.

### Consequential security

Direct authorization coverage protects privacy/deletion, targeted exports, organization member management, ownership transfer and billing-sensitive export. Raw billing attribution remains owner-only. Full package export requires current `ready_for_authorized_use` artifacts.

The blocked-work helper correctly fails closed unless the stored gate is `private_information`, but the live mutation caller at the reviewed checkpoint omitted the stored gate argument. That integration defect rejects legitimate private-information responses and is the next source correction. Consequential decision, authorization, professional-review, payment and physical-work gates must remain on their dedicated paths.

## Artifact/package boundary

Newest deliverable revision wins even when stale, preventing fallback to obsolete clean work. Full DOCX/PDF package export fails closed on package-quality failure, stale included output, or missing explicit external-use authorization. Draft/review artifacts remain available internally. Export metadata preserves maturity, trust, provenance, review records, limitations and external-use status.

## CI checkpoint truth

At reviewed head `3bc3cd78e5054e3c6d2c283b88b19cc25c52b7e3`, InventSmith CI run #18 (`34923710934`) completed with failure. Web TypeScript and Convex TypeScript passed. The regression suite reported 442 passing tests and one failing assertion in `inventsmith-full-product-acceptance.regression.test.ts`, because this progress document did not contain the exact retired-pilot sentence required by the full-product contract. Production dependency audit and Next production build were skipped after the test failure.

This document restores that contract sentence. Do not describe a newer source/documentation head as fully verified until its own exact-head CI completes successfully.

PR #24 remains draft/open/unmerged. `main` remains untouched.

## Remaining work

1. Correct and behavior-test the actual `respondToBlockedWork` mutation caller so stored private-information gates can resume while consequential gates remain fail-closed.
2. Restore exact-head green CI after that correction and this documentation contract repair.
3. Prove/implement native-CAD engineering maturity promotion and preserve separate manufacturing release.
4. Audit RFQ/manufacturer/external-contact paths for explicit inventor approval and current authorized artifacts.
5. Expand connected functional acceptance beyond graph/routing shape, including persistence, authorization, retries, usage settlement and invalidation.
6. Drive representative physical/hybrid/software/regulated cases farther through real state transitions.
7. Continue specialized artifact content and export-quality acceptance.
8. Finish low-risk InventSmith naming cleanup without destabilizing historical/compatibility identifiers.
9. Prepare fresh owner-controlled Vercel/Convex configuration and perform live acceptance only after provisioning.
10. Validate real billing/webhooks/providers/concurrency and calibrate commercial limits from measured economics.

## Status boundaries

- **Planned** means the capability is specified but not necessarily implemented.
- **Implemented** means code exists.
- **Automated verification passed** means the exact implementation head passed the relevant CI/tests.
- **Deployed** means the exact code/config is on Modern Methods-controlled infrastructure.
- **Live functionally verified** means authenticated acceptance passed there.
- **Professional review required/completed** records whether genuine qualifying review is still required or has actually occurred.

These statuses must never be collapsed into a production-ready claim.

## New-chat handoff

Read `INVENTSMITH_MASTER_PRODUCT_SPEC.md`, `INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`, this file, `INVENTSMITH_DEPLOYMENT_RUNBOOK.md`, and `INVENTSMITH_DOCUMENT_AUTHORITY.md`; then fetch the live branch, draft PR #24 and exact-head CI. Trust live GitHub state over this document if newer.
