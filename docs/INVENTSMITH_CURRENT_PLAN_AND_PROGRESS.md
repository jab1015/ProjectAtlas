# InventSmith Current Plan and Progress

**Updated:** October 16, 2026  
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code checkpoint before this documentation update:** `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`

## Product destination

InventSmith owns the applicable invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence, maturity, authorization, and human-gate truth model.

Do not publish an overall completion percentage. Repository implementation, deterministic verification, deployment, live functional acceptance, professional review, genuine real-world evidence, and outside-world execution are separate states.

## Exact repository and CI checkpoint

Before this documentation-only update, draft PR #24 pointed to exact branch head `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`. InventSmith CI run **#136** (`38990243845`) passed against that exact head.

The successful exact-head workflow included:

- exact-head checkout and SHA assertion;
- Node 22 / npm installation from the lockfile;
- operational script syntax checks;
- web TypeScript;
- Convex TypeScript;
- regression tests;
- production dependency audit;
- bounded development-dependency audit;
- Next production build.

At that checkpoint:

- **101 test files passed**;
- **571 tests passed**;
- production dependency audit reported **0 vulnerabilities**;
- the remaining full-tree advisory boundary was limited to the known unpatched Next/ESLint lint-tool chain: `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** completed the production build and generated **32/32** static pages;
- the workflow used the actual PR branch head rather than a synthetic pull-request merge commit.

This documentation update creates a newer branch head. That newer documentation head must receive its own exact-head CI result before it is described as automatically verified.

## Source, hosting, and deployment boundary

GitHub remains source and CI authority. A Modern Methods-controlled Convex **development** deployment, `fiery-gazelle-628`, exists and previously passed the documented backend health/configuration checks for Convex functions/database connectivity, OpenAI server configuration, and Convex Auth signing configuration.

That does **not** mean InventSmith is production deployed or live accepted. Current truth remains:

- Convex development backend: configured/health-checked at the previously recorded checkpoint;
- Convex exact newest branch head: not claimed deployed by this documentation update;
- Vercel/frontend owner-controlled deployment: not yet completed/verified;
- authenticated browser acceptance: not yet completed;
- production billing/webhook integration: not yet completed;
- genuine professional review and real-world invention evidence: only count when actually performed/recorded.

MadeThis is historical only and must not be used as a deployment or synchronization target.

## Implemented product/hardening state

The active branch contains the organization-native invention workspace foundation, organization-scoped access/usage/entitlements, consent-based membership/invitations, privacy/export/deletion boundaries, complete applicable journey routing, persistent evidence and invention records, fail-closed research/evidence promotion, partial validation and failed-only retry, attempt/lease-aware autonomous work, usage settlement, professional-review state, genuine prototype/quote/launch evidence gates, versioned deliverables, exact-revision external-use authorization, deliberate manufacturing release, package export, and consequential approval guards.

Seventeen stable department-agent profiles cover the physical/hybrid journey plus software-specific product, engineering, prototype, and release paths. Missing or unknown department routing fails closed before model execution, and agent identity is bound into execution/audit context.

### Engineering/manufacturing

Manufacturing readiness is revision-bound and fail-closed. The latest required prototype-readiness, RFQ, manufacturing-drawing, and native-CAD state must be fresh and sufficiently reviewed. Newer preliminary/stale work cannot be hidden by an older clean revision.

Engineering review can advance exact current CAD to `engineering_reviewed` only when review requirements are satisfied. Manufacturing release remains a separate manager-authorized transition for the exact synchronized newest native-CAD generation. It does not contact a supplier, disclose an artifact, order, purchase, pay, file, or publish; its audit semantics explicitly record no outside-world execution.

### Evidence and professional review

Model prose cannot promote itself into trusted external evidence. Provider-returned evidence/provenance and claim/source association are required where external research is claimed. Real prototype, manufacturer quote, and launch/sales evidence gates remain separate from AI output.

Professional review and inventor authorization are separate. Professional review cannot by itself grant permission to disclose, file, publish, contact a supplier, order, manufacture, or spend money.

### External-use and consequential-action boundary

`ready_for_authorized_use` is bound to one exact latest fresh deliverable revision. Ambiguous duplicate-latest state fails closed. Material review changes, staleness, supersession, or maturity invalidation can revoke that authorization.

Consequential requests for confidential sharing, third-party contact, publishing/disclosure, submission/filing, or external use are bound to explicit deliverable IDs and are revalidated at creation, approval, and execution guard time. Legacy or unscoped external requests cannot be approved/executed as valid scope.

The repository audit still records **no current executor** that sends an RFQ, contacts a supplier/manufacturer, discloses invention artifacts, places an order/payment, files a submission, or publishes for the inventor. Any future executor must revalidate exact current approved scope immediately before the side effect and record separate execution evidence.

### Consequential security

The branch has direct and contract-level authorization coverage around account deletion, privacy export, organization/member management, ownership transfer, billing-sensitive export, blocked-work resume, professional review, external authorization, and consequential approvals.

The newest hardening pass added direct behavior tests for account deletion, including administrator protection and suspended owner fail-closed behavior with zero destructive side effects before ownership resolution. Further direct behavioral coverage remains planned for other destructive/privacy/billing/org-management paths that still rely more heavily on source contracts or narrower tests.

### Dependency/CI supply-chain hardening

The CI workflow now:

- checks out and verifies the exact expected head;
- pins official checkout/setup-node actions to immutable commits;
- disables persisted checkout credentials;
- enforces `npm audit --omit=dev --audit-level=high`;
- separately bounds known unresolved development-only lint-chain advisories and fails on unexpected dev advisory packages.

Production dependency fixes include current patched Next.js and targeted overrides for affected production/development packages. Do not force-downgrade Next lint tooling merely to silence the remaining unpatched `braces` chain.

## Immediate continuation order

1. Qualify this documentation head with exact-head InventSmith CI; fix any concrete failure without weakening controls.
2. Continue direct behavioral security tests for destructive/privacy/billing/organization-management/external-use paths.
3. Drive representative physical, software, hybrid, and regulated inventions farther through persisted state transitions, evidence replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Continue artifact/package content and generated-format quality acceptance, including rendered DOCX/PDF and CAD-format validation where feasible.
5. Preserve the no-executor boundary until a deliberately implemented outside-world executor exists with execution-time revalidation and separate execution evidence.
6. Continue low-risk customer-facing InventSmith naming cleanup while preserving historical/compatibility identifiers that still require tested migration.
7. Prepare fresh owner-controlled Vercel/Convex runtime configuration; deploy/verify only when intentionally executed and observed.
8. Complete live authenticated multi-user/multi-invention acceptance, provider failure/retry, concurrency, billing/webhooks, professional-review, and representative lifecycle acceptance after owner-controlled infrastructure is ready.
9. Calibrate commercial limits from measured provider/runtime economics.

## Status rules

- **Planned** — specified but not necessarily implemented.
- **Implemented** — code exists in the repository.
- **Automated verification passed** — the exact implementation head passed relevant deterministic checks.
- **Deployed** — the exact code/config is present on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated acceptance passed there.
- **Professional review completed** — a genuine qualifying review was actually recorded.
- **Real-world evidence present** — genuine outside-world evidence was actually ingested/verified.
- **External action executed** — an outside-world side effect actually occurred and was separately recorded.

Never collapse these states into a single production-ready claim.

## New-chat start instruction

Read `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`, this file, `docs/INVENTSMITH_BUILD_PROGRESS.md`, `docs/INVENTSMITH_CAPABILITY_MATRIX.md`, `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`, and `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`; then fetch the live branch, draft PR #24, and exact-head CI. Trust newer verified GitHub state over documentation text. Do not restart completed work, merge PR #24, touch `main`, or reintroduce MadeThis synchronization.
