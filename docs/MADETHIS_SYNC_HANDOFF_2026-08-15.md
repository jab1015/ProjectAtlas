# ProjectAtlas — MadeThis Coding Worker Synchronization Handoff

**Prepared:** August 15, 2026  
**Repository:** `https://github.com/jab1015/ProjectAtlas`  
**Branch to inspect:** `main`  
**Verified functional baseline SHA:** `bc913e7d049b0bf18140996ba02230390201b170`  
**Scope:** Root Atlas application only — Idea to Feasibility and IP Readiness controlled pilot

## Purpose

Use the MadeThis Coding Worker to inspect this public repository, compare it against the current MadeThis-managed Atlas source, and reproduce the verified changes inside the managed environment.

Do **not** replace, recreate, reset, or detach the existing managed production environment. Preserve the existing Convex database, Convex authentication data, Vercel deployment, environment bindings, domain, and other MadeThis-managed infrastructure unless an explicit migration step below requires a compatible additive change.

## Source-of-truth documents

1. `docs/ATLAS_PRODUCT_RESET_V1.md` — authoritative product scope and safety boundary.
2. `docs/ATLAS_BUILD_PROGRESS.md` — living controlled-pilot readiness tracker.
3. `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` — deployment and pilot acceptance procedure.
4. Repository `main` at or after functional baseline `bc913e7d049b0bf18140996ba02230390201b170`.

If legacy managed code conflicts with these documents, preserve existing user data/infrastructure while adapting code to the current root-repository behavior.

## Required synchronization scope

Reproduce the complete current root Atlas implementation, including:

- Canonical Invention Record and ledgers for assumptions, evidence, findings, decisions, approvals, work items, execution events, deliverables, dependencies, professional reviews, usage, subscription events, and privacy requests.
- Idempotent workspace migration for inventions created before the Product Reset architecture. It must add missing canonical records/work kinds without overwriting or duplicating existing work.
- Autonomous dependency work queue with finite cost budgets, atomic reservations, leases, retries, stale-output rejection, entitlement enforcement, continuation, and 15-minute recovery.
- Pre-model controlled-pilot risk triage that blocks clearly restricted/safety-critical categories before any OpenAI research/generation request or model cost.
- Evidence integrity pipeline: unverified source capture, verification status, freshness limits, claim typing, source coverage, confidence/limitations, trust promotion, disputes, and stale propagation.
- Feasibility-package work types, including competitor/market research, preliminary prior-art landscape, technical feasibility, materials/manufacturing, regulatory screening, IP readiness, feature-to-prior-art comparison, distinguishing-feature hypotheses, requirements, design directions, preliminary BOM/cost, development risks, engineering handoff, evidence verification, recommendation, package assembly, and concept visualization.
- Metered concept-image generation with Convex storage and deletion cleanup.
- Invention-aware Ask Atlas with bounded history/model context and transparent evidence state.
- Inventor status briefing, review queue, work/document library, execution history, usage display, privacy controls, and subscription state.
- Representative-pilot admin launcher using the canonical non-safety-critical fixture.
- PDF/DOCX package export with trust/evidence/limitations metadata and size limits.
- Authenticated structured JSON account export that excludes passwords/auth credentials, sessions, refresh tokens, verification codes, download bearer tokens, and server/API secrets. Do not embed binary file bytes in the JSON.
- Transactional account-deletion executor, including storage cleanup, auth/session/account/token cleanup, usage/notification deletion, anonymization of retained financial/subscription records, and external-billing fail-closed handling.
- Signed/idempotent subscription lifecycle reconciliation and backend entitlement enforcement.
- Admin operations and privacy tooling.
- Secret-safe `/api/health` endpoint and operational health probe.
- `npm run verify:live` live-backend readiness verifier.
- Permanent GitHub CI-equivalent verification expectations: both TypeScript targets, regressions, production dependency audit, and Next production build.
- Build must not depend on downloading Google Fonts or other remote font assets at build time.

## Infrastructure invariants — preserve these

The synchronization must not destroy or unnecessarily recreate:

- Existing Convex project/deployment and stored records.
- Existing Convex Auth users and credentials.
- Existing Vercel project/deployment configuration.
- Existing custom domain and DNS bindings.
- Existing valid MadeThis environment values and secrets.
- Existing production user data.

Schema evolution must be additive/backward-compatible until stored data is migrated. Do not delete legacy tables merely because the current UI no longer uses them.

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
2. Atlas must not claim patentability, freedom to operate, legal approval, regulatory compliance, or engineering approval.
3. Professional-review-required outputs remain gated until actual reviewer records satisfy the required scope.
4. Consequential external actions remain behind explicit authorization.
5. Missing/unverified/stale evidence cannot silently become evidence-checked support.
6. Cost budgets and backend entitlements remain enforced server-side.
7. Account deletion must fail closed when paid external billing still requires resolution.
8. Secrets, auth credentials, and bearer tokens must not enter exports, logs, source, or public health responses.

## Verification after synchronization

Run the managed equivalent of all of the following and provide results:

```text
npx tsc --noEmit
npx tsc -p convex --noEmit
npm test
npm audit --omit=dev --audit-level=high
npx next build
```

Acceptance requires:

- Both TypeScript checks pass.
- Full regression suite passes.
- Production dependency audit reports no high/critical production vulnerabilities.
- Production build succeeds without remote-font network dependency.
- Existing managed Convex data/auth remain intact.

Then verify the deployed backend:

```text
npm run verify:live -- https://<managed-convex-deployment>.convex.site
```

The live health contract must report HTTP 200, `ready: true`, database reachable, AI configured, and auth configured. Health output must contain booleans/status only, never secret values or user/invention data.

## Controlled representative smoke test

From the admin operations screen, create the standard representative pilot case:

**Adjustable countertop produce-rinsing rack** — a manually adjustable rack spanning a household sink with a removable perforated basket, intended for adults in small kitchens.

Verify the case:

1. Creates the canonical record and complete dependency queue.
2. Starts only work permitted by the account's entitlement and daily budget.
3. Performs real bounded model/research work using server-side credentials.
4. Stores source locators as unverified until the independent verification stage.
5. Promotes only qualifying evidence.
6. Generates the required package artifacts and concept visualization without representing them as professional approval.
7. Produces downloadable PDF/DOCX package output.
8. Surfaces professional-review requirements and human gates correctly.
9. Records attempts, costs, gates, failures, and resolutions in the execution history.

## Deployment stop conditions

Stop the synchronization/deployment and report the first failure if any change would:

- require wiping/recreating the existing Convex database or auth population;
- detach the current Vercel project/domain;
- expose a secret in source/browser output/logs;
- bypass a server-side entitlement, cost, safety, approval, or professional-review gate;
- drop existing stored data without a verified migration;
- fail TypeScript, regression, production audit, or production build verification.

## Completion report requested from MadeThis

Return:

- Managed-source commit/deployment identifier.
- GitHub `main` SHA used for comparison.
- Files/behaviors reproduced or intentionally adapted.
- Schema/data migration actions performed.
- Verification command results and regression-test count.
- Live `/api/health` result with secret values omitted.
- Representative-pilot smoke-test outcome.
- Any remaining differences between public GitHub and managed Atlas source.

The synchronization is complete only when the managed Atlas environment reproduces the verified root-repository behavior while preserving existing production infrastructure and data.
