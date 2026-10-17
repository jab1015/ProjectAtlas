# InventSmith Current Plan and Progress

**Updated:** October 17, 2026 (America/New_York)  
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code checkpoint before this documentation refresh:** `93744db1fdf2772925f96dbc4d33ed1823192f86`

## Product destination

InventSmith owns the applicable invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence, maturity, authorization, and human-gate truth model.

Do not publish one overall completion percentage. Repository implementation, automated verification, deployment, live functional acceptance, genuine professional review, real-world evidence, and outside-world execution are separate states.

## Exact verified repository checkpoint

InventSmith CI **#226** (run `39016181734`) passed against exact branch head `93744db1fdf2772925f96dbc4d33ed1823192f86`.

The successful exact-head workflow passed:

- exact-head checkout and SHA assertion;
- Node 22.23.3 / npm 10.9.9 lockfile installation;
- operational script syntax checks;
- web TypeScript;
- Convex TypeScript;
- **116 test files / 660 tests**;
- production dependency audit with **0 vulnerabilities**;
- bounded development-dependency audit;
- Next.js **15.5.27** production build with **32/32** static pages generated.

The accepted development-only advisory boundary remains limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`. Unexpected advisory packages fail CI. Lucia `3.2.2` remains deprecated and requires a separately planned authentication migration rather than a blind dependency change.

This documentation refresh creates a newer branch head. The final documentation head must receive its own exact-head CI before that documentation head is called automatically verified.

## Source, Convex, hosting, and deployment boundary

GitHub remains source/CI authority. Convex is a core InventSmith backend, not an optional add-on. The documented Modern Methods-controlled Convex **development** deployment `fiery-gazelle-628` has a prior backend health/configuration checkpoint.

That does **not** mean the current code head is deployed or live accepted. Current truth remains:

- repository/CI: verified through exact code head `93744db1...`;
- Convex development infrastructure: previously configured/health-checked;
- newest branch head on Convex: not claimed deployed;
- Modern Methods-owned Vercel/frontend deployment: not yet verified complete;
- authenticated browser acceptance: not yet complete;
- production billing/webhooks: not owner-live accepted;
- genuine professional review/real-world evidence: count only when actually performed and recorded.

MadeThis is historical only and must not be used as a deployment or synchronization target.

## Implemented and hardened product state

The active branch includes organization-native invention workspaces, scoped access/usage/entitlements, consent-based invitations, privacy/export/deletion boundaries, complete applicable journey routing, persistent evidence/invention state, fail-closed evidence promotion, partial validation/retry, attempt/lease-aware autonomous work, usage settlement, professional-review state, genuine prototype/quote/launch evidence gates, versioned deliverables, exact-revision external-use authorization, exact-generation manufacturing release, package export, and consequential approval guards.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release paths. Missing or unknown department routing fails closed before model execution.

### Direct security, billing, fulfillment, and checkout behavior coverage

Executable behavior tests now directly cover:

- account deletion and privacy-request execution guards;
- personal and organization privacy/export scope;
- organization ownership, member management, invitation acceptance, and invention sharing;
- stale invention-grant cleanup and owner `manage` precedence;
- invention deletion cleanup/storage/accounting behavior;
- subscription application idempotency, invalid organization targeting, exact organization application, legacy-user behavior, and billing identity continuity across ownership transfer;
- cancellation/past-due period-end behavior and immediate unpaid downgrade for both organization and legacy-user billing, including personal-organization entitlement mirroring;
- delayed/older provider-event rejection and deterministic equal-timestamp resolution independent of delivery order for both billing scopes;
- signed subscription HTTP ingress: secret/signature validation, malformed/oversized payload rejection, UTF-8 byte limits, payload normalization, and exact mutation handoff;
- fulfillment replay safety: duplicate fulfillment cannot double-count sales and returns the authoritative stored download token rather than a dead newly proposed token;
- signed fulfillment HTTP ingress: rejected requests perform zero product reads/purchase writes, unknown products do not create purchases, valid new purchases increment sales once, and replays do not increment sales;
- download authorization: malformed external purchase IDs fail closed, wrong/unfulfilled links cannot reach storage, requested files must belong to the purchased product, successful redirects record download accounting first, and accounting failure prevents redirect;
- checkout-success truth: a public checkout redirect/query string cannot emit authoritative `upgrade_completed` analytics or claim entitlement; the page records only a non-authoritative `checkout_returned` event while waiting for confirmed billing state.

## Engineering/manufacturing and external-use boundaries

Manufacturing readiness remains revision-bound and fail-closed. Newer preliminary/stale work cannot be hidden by an older clean revision. Manufacturing release is a separate manager-authorized transition for one exact synchronized newest qualifying generation and is not supplier contact, disclosure, ordering, payment, filing, or publication.

Professional review, external-use authorization, consequential approval, manufacturing release, and outside-world execution remain separate states. The repository still has **no executor** that sends RFQs, contacts suppliers/manufacturers, discloses invention artifacts, places orders/payments, files submissions, or publishes for the inventor.

## Immediate continuation order

1. Qualify the final documentation-refresh head with exact-head InventSmith CI.
2. Continue provider/billing acceptance on owner-controlled infrastructure: real signatures, checkout, confirmed provider events, cancellation/past-due, replay, fulfillment, download, ownership changes, and browser-visible entitlement transitions.
3. Drive representative physical, software, hybrid, and regulated inventions through deeper persisted state transitions, evidence replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Continue specialized artifact/package and generated-format quality acceptance, including rendered document and CAD-format checks where feasible.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Continue low-risk InventSmith naming cleanup while preserving compatibility/historical identifiers that still require tested migration.
7. Prepare fresh owner-controlled Vercel/Convex runtime configuration; deploy/verify only when intentionally executed and observed.
8. Complete live authenticated multi-user/multi-invention acceptance, provider failure/retry, concurrency, billing/webhooks, professional-review, and representative lifecycle acceptance after owner-controlled infrastructure is ready.
9. Plan the Lucia v3 authentication migration separately.
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
