# InventSmith Current Plan and Progress

**Updated:** October 16, 2026 (America/New_York)  
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code checkpoint before this documentation refresh:** `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`

## Product destination

InventSmith owns the applicable invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence, maturity, authorization, and human-gate truth model.

Do not publish one overall completion percentage. Repository implementation, automated verification, deployment, live functional acceptance, genuine professional review, real-world evidence, and outside-world execution are separate states.

## Exact verified repository checkpoint

InventSmith CI **#165** (run `38994705687`) passed against exact branch head `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`.

The successful exact-head workflow passed:

- exact-head checkout and SHA assertion;
- Node 22 / npm lockfile installation;
- operational script syntax checks;
- web TypeScript;
- Convex TypeScript;
- **107 test files / 603 tests**;
- production dependency audit with **0 vulnerabilities**;
- bounded development-dependency audit;
- Next.js **15.5.27** production build with **32/32** static pages generated.

The accepted development-only advisory boundary remains limited to:

- `@next/eslint-plugin-next`;
- `braces`;
- `eslint-config-next`;
- `fast-glob`;
- `micromatch`.

Unexpected development advisory packages fail CI. The previous Vitest ESM/native-loader warning has been removed by moving the config to `vitest.config.mts` and using `import.meta.dirname`. Lucia `3.2.2` still emits a deprecation warning and requires a separately planned auth migration rather than a blind package change.

This documentation refresh creates a newer branch head. The final documentation head must receive its own exact-head CI before that documentation head is called automatically verified.

## Source, Convex, hosting, and deployment boundary

GitHub remains source/CI authority. Convex is a core InventSmith backend, not an optional add-on. The documented Modern Methods-controlled Convex **development** deployment `fiery-gazelle-628` previously passed backend health/configuration checks for functions/database connectivity, OpenAI server configuration, and Convex Auth signing configuration.

That does **not** mean the current code head is deployed or live accepted. Current truth remains:

- repository/CI: verified through exact head `2e0933bf...`;
- Convex development infrastructure: previously configured/health-checked;
- newest branch head on Convex: not claimed deployed by this document;
- Modern Methods-owned Vercel/frontend deployment: not yet verified complete;
- authenticated browser acceptance: not yet complete;
- production billing/webhooks: not yet owner-live accepted;
- genuine professional review/real-world evidence: count only when actually performed and recorded.

MadeThis is historical only and must not be used as a deployment or synchronization target.

## Implemented and hardened product state

The active branch contains organization-native invention workspaces, organization-scoped access/usage/entitlements, consent-based invitations, privacy/export/deletion boundaries, complete applicable journey routing, persistent evidence and invention records, fail-closed evidence promotion, partial validation and failed-only retry, attempt/lease-aware autonomous work, usage settlement, professional-review state, genuine prototype/quote/launch evidence gates, versioned deliverables, exact-revision external-use authorization, exact-generation manufacturing release, package export, and consequential approval guards.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release paths. Missing/unknown department routing fails closed before model execution.

### New direct security behavior coverage through the verified checkpoint

The latest hardening tranche moved several consequential boundaries from source-contract-only coverage to executable behavior tests:

- account deletion: administrator protection; company/studio owner protection; rejected paths with zero destructive writes/storage deletion;
- privacy request execution: generic resolution cannot falsely complete deletion; terminal/admin/billing guards run before destructive execution; successful deletion transitions `in_progress → delete → completed`;
- organization ownership transfer: personal-organization rejection, inactive target rejection, idempotent same-owner behavior, exact successful transition writes;
- organization member management: Owner/Admin authorization, owner-role protection, inactive target rejection, self-removal rejection, exact role/removal writes;
- organization billing-sensitive export: Admin exports do not even query raw subscription events; Owner exports may include organization-bound attribution;
- personal privacy export: company/studio inventions are excluded even when created by the user; only owner-personal organization scope counts; removed memberships do not resurrect scope; company/studio-bound billing events remain excluded;
- organization invitation acceptance: pre-binding, wrong-account, changed-email, ambiguous-account, expiry, and current seat-capacity guards are behavior-tested before membership creation/activation.

### Engineering/manufacturing and external-use boundaries

Manufacturing readiness remains revision-bound and fail-closed. Latest applicable prototype-readiness, RFQ, manufacturing-drawing, and native-CAD state must be fresh and sufficiently reviewed. Newer preliminary/stale work cannot be hidden by an older clean revision.

Manufacturing release is a separate manager-authorized transition for one exact synchronized newest qualifying generation. It does not contact a supplier, disclose an artifact, order, purchase, pay, file, or publish.

Professional review, external-use authorization, consequential approval, manufacturing release, and outside-world execution are separate states. Consequential external actions remain bound to exact current authorized artifact scope and must be revalidated immediately before any future external side effect.

The repository still has **no executor** that sends an RFQ, contacts a supplier/manufacturer, discloses invention artifacts, places an order/payment, files a submission, or publishes for the inventor.

## Immediate continuation order

1. Qualify the final documentation-refresh head with exact-head InventSmith CI.
2. Continue carefully expanding direct destructive behavior coverage, with invention deletion the next larger/high-risk path; expose/test existing logic without duplicating or weakening it.
3. Drive representative physical, software, hybrid, and regulated inventions through deeper persisted state transitions, evidence replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Continue specialized artifact/package and generated-format quality acceptance, including rendered document and CAD-format checks where feasible.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Continue low-risk InventSmith naming cleanup while preserving compatibility/historical identifiers that still require tested migration.
7. Prepare fresh owner-controlled Vercel/Convex runtime configuration; deploy/verify only when intentionally executed and observed.
8. Complete live authenticated multi-user/multi-invention acceptance, provider failure/retry, concurrency, billing/webhooks, professional-review, and representative lifecycle acceptance after owner-controlled infrastructure is ready.
9. Plan the Lucia v3 authentication migration separately; do not destabilize auth solely to remove a deprecation warning.
10. Calibrate commercial limits from measured provider/runtime economics.

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

Read `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`, this file, `docs/INVENTSMITH_BUILD_PROGRESS.md`, `docs/INVENTSMITH_CAPABILITY_MATRIX.md`, `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`, `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`, and `docs/INVENTSMITH_CONSEQUENTIAL_SECURITY_CHECKPOINT.md`; then fetch the live branch, draft PR #24, and exact-head CI. Trust newer verified GitHub state over documentation text. Do not restart completed work, merge PR #24, touch `main`, or reintroduce MadeThis synchronization.
