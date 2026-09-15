# InventSmith Build Progress

**Last updated:** September 15, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally unmerged

## Current completion snapshot

Planning estimates, kept separate from release claims:

| Dimension | Estimate | Current truth |
|---|---:|---|
| Customer-facing InventSmith name conversion | **96%** | Canonical UI/docs use InventSmith; historical repo slug and tested compatibility identifiers remain intentionally |
| Repository product implementation + hardening | **88%** | Complete journey is substantially implemented; remaining work is concentrated in consequential gate behavior, maturity transitions, deeper acceptance and cleanup |
| Automated repository qualification | **85%** | Broad suite has repeatedly passed; newest corrected gate-hardening head still needs exact-head CI |
| Owner-controlled deployment/live acceptance | **0%** | Modern Methods Vercel/Convex not provisioned yet |
| Overall production-acceptance path | **72%** | Weighted planning estimate including repository work, deployment, live acceptance, billing/providers and genuine professional/real-world gates |

The old controlled-pilot 80% figure is retired and is not an overall completion measure.

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

The latest blocked-work hardening prevents typed text from substituting for consequential authorization/professional-review/payment/decision/physical-evidence gates. CI #12 exposed a concrete implementation regression (`reviewArea` was referenced on a professional-review record even though the schema has no such field). That edit was corrected at `36ef66392a31a93573d4fb5a25697bd75c0b7927`. Exact-head CI for that corrected source checkpoint was pending when this progress document was refreshed.

## Artifact/package boundary

Newest deliverable revision wins even when stale, preventing fallback to obsolete clean work. Full DOCX/PDF package export fails closed on package-quality failure, stale included output, or missing explicit external-use authorization. Draft/review artifacts remain available internally. Export metadata preserves maturity, trust, provenance, review records, limitations and external-use status.

## CI checkpoint truth

A broad preceding qualified line, including InventSmith CI #10 at `c350b2d`, passed. Exact-head run #12 for `6ec9fe87f0643c6f4d664c48ab39f591b8f60947` failed Convex TypeScript because of the invalid `reviewArea` property reference. The corrected source head became `36ef66392a31a93573d4fb5a25697bd75c0b7927` before these documentation refresh commits.

Do not describe the corrected/new documentation head as fully verified until its own exact-head CI completes successfully.

PR #24 remains draft/open/unmerged. `main` remains untouched.

## Remaining work

1. Restore exact-head green CI after the blocked-work correction.
2. Finish the typed safe-input/private-information blocked-work path while keeping all consequential gates fail-closed.
3. Prove/implement native-CAD engineering maturity promotion and preserve separate manufacturing release.
4. Audit RFQ/manufacturer/external-contact paths for explicit inventor approval and current authorized artifacts.
5. Expand behavioral authorization tests for destructive, billing, privacy, organization-management and external-use operations.
6. Drive representative physical/hybrid/software/regulated cases farther through real state transitions rather than graph shape alone.
7. Continue specialized artifact content and export-quality acceptance.
8. Finish low-risk InventSmith naming cleanup without destabilizing historical/compatibility identifiers.
9. Prepare fresh owner-controlled Vercel/Convex configuration and then perform live acceptance only after provisioning.
10. Validate real billing/webhooks/providers/concurrency and calibrate commercial limits from measured economics.

## Status boundaries

- **Implemented** means code exists.
- **Automated verification passed** means the exact implementation head passed the relevant CI/tests.
- **Deployed** means the exact code/config is on Modern Methods-controlled infrastructure.
- **Live functionally verified** means authenticated acceptance passed there.
- **Professional/real-world evidence complete** means genuine qualifying records/evidence exist.

These statuses must never be collapsed into a production-ready claim.

## New-chat handoff

Read `INVENTSMITH_MASTER_PRODUCT_SPEC.md`, `INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`, this file, `INVENTSMITH_DEPLOYMENT_RUNBOOK.md`, and `INVENTSMITH_DOCUMENT_AUTHORITY.md`; then fetch the live branch, draft PR #24 and exact-head CI. Trust live GitHub state over this document if newer.