# InventSmith Build Progress

**Last updated:** October 16, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation update:** `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`

## Current status snapshot

InventSmith status is reported by capability and evidence, not by an unsupported overall completion percentage. Repository implementation, automated verification, deployment, live functional verification, genuine professional review, real-world evidence, and outside-world execution are separate states.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Product vision and routing

InventSmith — The Inventor OS by Modern Methods — owns the applicable journey:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering where applicable → Prototype → Manufacturing or Software Delivery → Branding → IP / Legal Preparation → Pricing → Marketing → Sales → Funding → Launch → Growth.**

Physical, software, hybrid, and regulated inventions route through applicable branches. Harmful/abusive concepts remain refused. Ordinary business/service-only concepts are routed outside the invention-development workflow.

## Hosting/source boundary

GitHub is source/CI authority. The documented Modern Methods-controlled Convex development deployment `fiery-gazelle-628` has passed the previously recorded backend health/configuration checks for functions/database connectivity, OpenAI configuration, and Convex Auth configuration. That is development infrastructure, not production acceptance.

The newest branch head is not claimed deployed by this documentation update. Vercel/frontend owner-controlled deployment and authenticated browser acceptance remain incomplete. MadeThis is historical only and must not be used as a sync/deployment target.

## Implemented foundation

The branch contains organization-native ownership/membership/invention access; organization-scoped entitlements and usage accounting; active/archive capacity; consent-based invitations; privacy/export/deletion boundaries; complete applicable journey routing; persistent invention/evidence state; evidence provenance/trust; autonomous work orchestration; partial validation/retry; worker lease/attempt protection; physical/software/hybrid/regulated classification; professional-review gates; genuine prototype/quote/launch evidence gates; versioned deliverables; exact-revision external-use authorization; deliberate exact-generation manufacturing release; package export; and representative behavioral acceptance coverage.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release paths. Provider/retry/evidence infrastructure remains shared, but model execution fails closed unless a work item resolves to a registered department agent.

## Major hardening state

### Evidence and confidence

Model prose cannot promote itself into trusted evidence. External research claims require provider-returned evidence/provenance and normalized claim/source association. Prototype, manufacturer quote, and launch/sales evidence retain scoped downstream invalidation; removing required genuine evidence re-closes applicable gates.

### Worker/resource safety

Attempts carry identity and bounded retry state. Stale/late workers cannot overwrite newer attempts. Known incurred usage survives completion/failure/human-gate settlement. Unknown provider usage remains explicitly unknown/conservatively accounted rather than silently recorded as zero.

### Engineering/manufacturing maturity

Final manufacturing readiness is revision-bound and fail-closed. Latest fresh reviewed prototype-readiness, RFQ, manufacturing-drawing, and native-CAD state is required where applicable. Newer preliminary/stale/unreviewed CAD cannot be hidden by an older clean revision.

Accepted exact engineering review can advance current CAD to `engineering_reviewed`. Missing/rejected/changes-requested/stale/superseded/wrong-revision/disqualifying review state cannot. Reopened review invalidates engineering maturity and any obsolete manufacturing release.

Manufacturing release is a separate manager-authorized transition for one exact synchronized newest native-CAD generation. It does not contact a supplier, disclose artifacts, purchase/pay, place an order, file, or publish; audit metadata records `externalActionExecuted: false`.

### Professional review and external-use authorization

Professional review and inventor authorization remain separate. `ready_for_authorized_use` is bound to one exact latest fresh deliverable. Duplicate latest revisions fail closed. Required professional review must already be complete where policy requires it. Staleness, supersession, material review change, or maturity invalidation can revoke authorization.

### Consequential external-action scope

External disclosure/contact/file/publish approvals are bound to explicit deliverable IDs. Scope is revalidated at request creation, approval, and immediately before any eventual execution. Legacy/unscoped external requests cannot be approved/executed as valid scope. Approval resolution remains non-executing and records `externalActionExecuted: false`.

The repository still has no current executor that actually sends an RFQ, contacts a supplier/manufacturer, discloses invention artifacts, places an order/payment, files, or publishes for the inventor. Future executors must use the execution-time guard and record outside-world execution separately.

### Consequential security

Authorization coverage protects account deletion/privacy, targeted export, organization member management, ownership transfer, billing-sensitive export, blocked-work resume, professional review, external-use authorization, and consequential approvals.

The latest hardening pass added direct behavior tests around account deletion: administrator deletion is rejected before destructive/query side effects, and suspended company/studio owners remain blocked with zero destructive writes/storage deletes until ownership is resolved.

Additional direct behavior tests remain desirable for other destructive/privacy/billing/organization-management/external-use paths where source-contract or narrower coverage still dominates.

### Dependency and workflow hardening

CI now checks out and asserts the exact expected branch head rather than relying on GitHub's synthetic PR merge ref. Official checkout/setup-node actions are pinned to immutable commits and checkout credentials are not persisted.

Production audit is enforced with `npm audit --omit=dev --audit-level=high`. A separate development-dependency boundary permits only the currently known unresolved lint-only chain (`@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, `micomatch` is not permitted; `micromatch` is the accepted package) and fails on unexpected advisory packages.

Production/development dependency remediation updated Next.js and targeted transitive dependencies without force-downgrading the Next lint stack.

## Exact CI checkpoint

InventSmith CI **#136**, run `38990243845`, passed at exact code head `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`.

The successful job included exact-head checkout/verification, dependency installation, operational script checks, web typecheck, Convex typecheck, regressions, production dependency audit, development dependency audit boundary, and Next production build.

At that checkpoint:

- **101 test files passed**;
- **571 tests passed**;
- production dependency audit: **0 vulnerabilities**;
- development advisory boundary accepted only `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** production build passed;
- **32/32** static pages were generated.

This documentation update creates a newer documentation head. It must receive its own exact-head CI before that documentation head is called automatically verified.

PR #24 remains draft/open/unmerged. `main` remains untouched.

## Remaining work

1. Qualify the newest documentation head with exact-head CI and fix concrete failures without weakening controls.
2. Expand direct behavioral security tests for destructive/privacy/billing/organization-management/external-use operations.
3. Drive representative physical/hybrid/software/regulated cases through deeper persisted state transitions, evidence replacement/removal, newest-revision behavior, manufacturing release, and later external-action boundaries.
4. Continue specialized artifact content, rendered export, and generated-format quality acceptance.
5. Preserve the audited no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Finish low-risk InventSmith naming cleanup without destabilizing historical/compatibility identifiers.
7. Prepare owner-controlled Vercel/Convex runtime configuration and perform deployment/live acceptance only when actually provisioned and observed.
8. Validate real billing/webhooks/providers/concurrency and calibrate commercial limits from measured economics.
9. Address lower-risk tooling debt separately, including the current Lucia v3 deprecation and Vitest config-loader warning, without destabilizing auth or weakening gates.

## Status boundaries

- **Planned** means specified but not necessarily implemented.
- **Implemented** means repository code exists.
- **Automated verification passed** means the exact implementation head passed relevant CI/tests.
- **Deployed** means the exact code/config is on Modern Methods-controlled infrastructure.
- **Live functionally verified** means authenticated representative acceptance passed there.
- **Professional review completed** means a genuine qualifying review was actually recorded.
- **Real-world evidence present** means genuine outside-world evidence was actually ingested/verified.
- **External action executed** means the outside-world side effect actually occurred and was separately recorded.

These states must never be collapsed into a production-ready claim.

## New-chat handoff

Read `INVENTSMITH_MASTER_PRODUCT_SPEC.md`, `INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`, this file, `INVENTSMITH_CAPABILITY_MATRIX.md`, `INVENTSMITH_DEPLOYMENT_RUNBOOK.md`, and `INVENTSMITH_DOCUMENT_AUTHORITY.md`; then fetch the live branch, draft PR #24, and exact-head CI. Trust newer live GitHub state over this document if newer.
