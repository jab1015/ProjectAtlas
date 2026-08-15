# InventSmith — MadeThis Coding Worker Synchronization Handoff

**Prepared:** August 15, 2026  
**Repository:** `https://github.com/jab1015/ProjectAtlas`  
**Branch to inspect:** `main` after this handoff is merged  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Previous customer-facing name:** Atlas  
**Scope:** Root application only — Idea to Feasibility and IP Readiness controlled pilot

## Purpose

Use the MadeThis Coding Worker to inspect the public repository, compare it against the current MadeThis-managed source, and reproduce the verified changes inside the managed environment.

The public product identity is now **InventSmith — The Inventor OS**. Existing `Atlas`/`ATLAS_*` technical identifiers may remain intentionally where changing them would risk database, authentication, deployment, webhook, environment, route, or stored-data compatibility. Do not perform a blind global rename inside the managed environment.

Do **not** replace, recreate, reset, or detach the existing managed production environment. Preserve the existing Convex database, Convex authentication population, Vercel project, environment bindings, domain, storage, subscriptions, and production data unless an explicit compatible migration is required.

## Source-of-truth documents

1. `docs/BRAND_IDENTITY.md` — current InventSmith identity and compatibility rename policy.
2. `docs/ATLAS_PRODUCT_RESET_V1.md` — authoritative controlled-pilot scope and safety boundary; legacy filename retained for continuity.
3. `docs/ATLAS_BUILD_PROGRESS.md` — living readiness tracker.
4. `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` — deployment and pilot acceptance procedure.
5. Repository `main` at the final handoff SHA communicated by the owner after this document is merged.

If legacy managed code conflicts with these documents, preserve existing user data/infrastructure while adapting code to current root-repository behavior.

## Required synchronization scope

Reproduce the complete current root InventSmith implementation, including:

- Official InventSmith branding and logo across current customer-facing surfaces.
- Ask InventSmith customer-facing identity while preserving compatibility-sensitive internal function identifiers where required.
- Canonical Invention Record and ledgers for assumptions, evidence, findings, decisions, approvals, work items, execution events, deliverables, dependencies, professional reviews, usage, subscription events, and privacy requests.
- Idempotent workspace migration for inventions created before the Product Reset architecture. It must add missing canonical records/work kinds without overwriting or duplicating existing work.
- Autonomous dependency work queue with finite cost budgets, atomic reservations, leases, retries, stale-output rejection, entitlement enforcement, continuation, and recovery.
- Pre-model controlled-pilot risk triage that blocks clearly restricted/safety-critical categories before OpenAI research/generation requests or model cost.
- Evidence integrity pipeline: unverified source capture, verification status, freshness limits, claim typing, source coverage, confidence/limitations, trust promotion, disputes, and stale propagation.
- Feasibility-package work types covering competitor/market research, preliminary prior-art landscape, technical feasibility, materials/manufacturing, regulatory screening, IP readiness, feature-to-prior-art comparison, distinguishing-feature hypotheses, requirements, design directions, preliminary BOM/cost, development risks, engineering handoff, evidence verification, recommendation, package assembly, and concept visualization.
- Metered concept-image generation with Convex storage and deletion cleanup.
- Invention-aware Ask InventSmith with bounded history/model context and transparent evidence state.
- Inventor status briefing, review queue, work/document library, execution history, usage display, privacy controls, and subscription state.
- Representative-pilot admin launcher using the canonical non-safety-critical fixture.
- InventSmith-branded PDF/DOCX package export with trust/evidence/limitations metadata and size limits.
- Authenticated structured JSON account export excluding passwords/auth credentials, sessions, refresh tokens, verification codes, download bearer tokens, and server/API secrets. Do not embed binary file bytes in JSON.
- Transactional account-deletion executor, including storage cleanup, auth/session/account/token cleanup, usage/notification deletion, anonymization of retained financial/subscription records, and external-billing fail-closed handling.
- Signed/idempotent subscription lifecycle reconciliation and backend entitlement enforcement.
- Admin operations and privacy tooling.
- Secret-safe `/api/health` endpoint and operational health probe.
- `npm run verify:live` live-backend readiness verifier.
- Permanent CI verification: both TypeScript targets, regression suite, production dependency audit, and Next production build.
- Permanent InventSmith branding regression coverage so current customer-facing Atlas identity is not reintroduced.
- Build must not depend on downloading Google Fonts or other remote font assets at build time.

## Infrastructure invariants — preserve these

The synchronization must not destroy or unnecessarily recreate:

- Existing Convex project/deployment and stored records.
- Existing Convex Auth users and credentials.
- Existing Vercel project/deployment configuration.
- Existing custom domain and DNS bindings.
- Existing valid MadeThis environment values and secrets.
- Existing subscription/customer state.
- Existing production user data.

Schema evolution must remain additive/backward-compatible until stored data is migrated. Do not delete legacy tables merely because the current UI no longer uses them.

## Compatibility identifiers

Do not rename a legacy Atlas identifier merely for cosmetic consistency if it participates in a deployed contract. Examples may include existing Convex function/table identifiers, `ATLAS_*` environment variables, the managed checkout route, and the existing subscription-signature protocol header. Customer-facing branding must be InventSmith; compatibility identifiers may remain internal.

## Required server-side environment

Confirm presence through masked/secret-safe tooling only. Never print values.

- `OPENAI_API_KEY`
- `ATLAS_OPENAI_MODEL` if overriding the tested default
- Convex Auth key material (`JWT_PRIVATE_KEY` and `JWKS`)
- `CONVEX_SITE_URL`
- `PLATFORM_FULFILLMENT_SECRET` where legacy fulfillment remains required
- `ATLAS_SUBSCRIPTION_WEBHOOK_SECRET`

Browser-visible variables must never contain server credentials.

## Safety invariants

Do not weaken these while reconciling managed code:

1. No safety-critical/restricted pilot category may reach autonomous model work merely because a user asks it to proceed.
2. InventSmith must not claim patentability, freedom to operate, legal approval, regulatory compliance, or engineering approval.
3. Professional-review-required outputs remain gated until actual reviewer records satisfy the required scope.
4. Consequential external actions remain behind explicit authorization.
5. Missing/unverified/stale evidence cannot silently become evidence-checked support.
6. Cost budgets and backend entitlements remain enforced server-side.
7. Account deletion must fail closed when paid external billing still requires resolution.
8. Secrets, auth credentials, and bearer tokens must not enter exports, logs, source, or public health responses.

## Verification after synchronization

Run the managed equivalent of:

```text
npx tsc --noEmit
npx tsc -p convex --noEmit
npm test
npm audit --omit=dev --audit-level=high
npx next build
```

Acceptance requires both TypeScript checks, the full regression suite, no high/critical production dependency vulnerabilities, a successful production build, and intact managed Convex data/auth.

Then verify the deployed backend:

```text
npm run verify:live -- https://<managed-convex-deployment>.convex.site
```

The live health contract must report HTTP 200, `ready: true`, database reachable, AI configured, and auth configured. Health output must contain status/booleans only—never secret values or user/invention data.

## Controlled representative smoke test

From admin operations, create the standard representative pilot case:

**Adjustable countertop produce-rinsing rack** — a manually adjustable rack spanning a household sink with a removable perforated basket, intended for adults in small kitchens.

Verify that it creates the canonical record/dependency queue, starts only entitled/budgeted work, performs bounded live model/research work using server credentials, preserves evidence trust states, generates required package artifacts and concept visualization, produces downloadable InventSmith PDF/DOCX output, surfaces professional-review/human gates, and records attempts/costs/gates/failures/resolutions.

## Deployment stop conditions

Stop and report the first failure if synchronization would:

- wipe/recreate the existing Convex database or auth population;
- detach the current Vercel project/domain;
- expose a secret in source/browser output/logs;
- bypass a server-side entitlement, cost, safety, approval, or professional-review gate;
- drop stored data without a verified migration;
- fail TypeScript, regression, production audit, brand regression, or production-build verification.

## Completion report requested from MadeThis

Return:

- Managed-source commit/deployment identifier.
- GitHub `main` SHA used for comparison.
- Files/behaviors reproduced or intentionally adapted.
- Schema/data migration actions performed.
- Verification command results and regression-test count.
- Secret-safe live `/api/health` result.
- Representative-pilot smoke-test outcome.
- Any remaining differences between public GitHub and MadeThis-managed source.

Synchronization is complete only when the managed InventSmith environment reproduces the verified root-repository behavior while preserving existing production infrastructure and data.
