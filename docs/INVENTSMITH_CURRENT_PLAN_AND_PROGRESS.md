# InventSmith Current Plan and Progress

**Updated:** October 16, 2026 (America/New_York)  
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code checkpoint before this documentation refresh:** `75ac3b9b7fb0bd20bf8254bb13ca80d033779e52`

## Product destination

InventSmith owns the applicable invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence, maturity, authorization, and human-gate truth model.

Do not publish one overall completion percentage. Repository implementation, automated verification, deployment, live functional acceptance, genuine professional review, real-world evidence, and outside-world execution are separate states.

## Exact verified repository checkpoint

InventSmith CI **#182** (run `38997088336`) passed against exact branch head `75ac3b9b7fb0bd20bf8254bb13ca80d033779e52`.

The successful exact-head workflow passed:

- exact-head checkout and SHA assertion;
- Node 22 / npm lockfile installation;
- operational script syntax checks;
- web TypeScript;
- Convex TypeScript;
- **110 test files / 621 tests**;
- production dependency audit with **0 vulnerabilities**;
- bounded development-dependency audit;
- Next.js **15.5.27** production build with **32/32** static pages generated.

The accepted development-only advisory boundary remains limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`. Unexpected advisory packages fail CI. The prior Vitest ESM/native-loader warning is resolved. Lucia `3.2.2` still emits a deprecation warning and remains a separately planned authentication migration.

This documentation refresh creates a newer branch head. The final documentation head must receive its own exact-head CI before that documentation head is called automatically verified.

## Source, Convex, hosting, and deployment boundary

GitHub remains source/CI authority. Convex is a core InventSmith backend, not an optional add-on. The documented Modern Methods-controlled Convex **development** deployment `fiery-gazelle-628` previously passed backend health/configuration checks for functions/database connectivity, OpenAI server configuration, and Convex Auth signing configuration.

That does **not** mean the current branch head is deployed or live accepted. Current truth remains:

- repository/CI: verified through exact code head `75ac3b9b...`;
- Convex development infrastructure: previously configured/health-checked;
- newest branch head on Convex: not claimed deployed;
- Modern Methods-owned Vercel/frontend deployment: not yet verified complete;
- authenticated browser acceptance: not yet complete;
- production billing/webhooks: not owner-live accepted;
- genuine professional review/real-world evidence: count only when actually performed and recorded.

MadeThis is historical only and must not be used as a deployment or synchronization target.

## Implemented and hardened product state

The active branch contains organization-native invention workspaces, organization-scoped access/usage/entitlements, consent-based invitations, privacy/export/deletion boundaries, complete applicable journey routing, persistent evidence and invention records, fail-closed evidence promotion, partial validation and failed-only retry, attempt/lease-aware autonomous work, usage settlement, professional-review state, genuine prototype/quote/launch evidence gates, versioned deliverables, exact-revision external-use authorization, exact-generation manufacturing release, package export, and consequential approval guards.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release paths. Missing or unknown department routing fails closed before model execution.

### Direct security behavior coverage through the verified checkpoint

Executable behavior tests now cover:

- account deletion administrator protection and company/studio owner fail-closed behavior;
- privacy-request execution ordering, terminal-state rejection, billing resolution, and destructive-call sequencing;
- personal privacy-export scoping that excludes company/studio inventions and organization-bound billing events;
- organization ownership transfer, member-role/removal authority, owner protection, inactive targets, and self-removal protection;
- invitation acceptance bound to exact account/email, expiration, organization state, and current seat capacity;
- invention deletion authorization, related-row/storage cleanup, and reserved autonomous-usage release;
- invention-level access grants requiring active same-organization membership;
- stale invention-grant cleanup when an organization member is removed;
- organization-owner authority remaining `manage` even if an older explicit invention grant is narrower;
- subscription application behavior for duplicate events, stale events, invalid organization targets, exact organization application, legacy-user stale events, and organization-only plan rejection on the legacy-user path.

Rejected consequential/billing paths are tested to avoid unauthorized entitlement or destructive writes where that is the intended behavior. Auditable subscription events may still be recorded when application is rejected.

### Engineering/manufacturing and external-use boundaries

Manufacturing readiness remains revision-bound and fail-closed. Latest applicable prototype-readiness, RFQ, manufacturing-drawing, and native-CAD state must be fresh and sufficiently reviewed. Newer preliminary/stale work cannot be hidden by an older clean revision.

Manufacturing release is a separate manager-authorized transition for one exact synchronized newest qualifying generation. It does not contact a supplier, disclose an artifact, order, purchase, pay, file, or publish.

Professional review, external-use authorization, consequential approval, manufacturing release, and outside-world execution are separate states. Consequential external actions remain bound to exact current authorized artifact scope and must be revalidated immediately before any future external side effect.

The repository still has **no executor** that sends an RFQ, contacts a supplier/manufacturer, discloses invention artifacts, places an order/payment, files a submission, or publishes for the inventor.

## Immediate continuation order

1. Qualify the final documentation-refresh head with exact-head InventSmith CI.
2. Continue billing/webhook behavior coverage, especially signed HTTP webhook-to-handler coupling, replay/out-of-order lifecycle cases, and ownership-transfer billing identity behavior.
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
