# InventSmith — The Inventor OS

InventSmith is the Modern Methods inventor operating system for moving an idea through evidence, validation, market and prior-art research, product development, commercialization, launch, and growth with bounded autonomous assistance.

**Product:** InventSmith  
**Descriptor:** The Inventor OS  
**Publisher:** Modern Methods  
**Core promise:** You invent. InventSmith does the work.

## Product destination

The product destination is the complete evidence-backed idea-to-market journey defined in `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`:

Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → applicable Engineering/CAD or Software Development → Prototype/Test → Manufacturing or Release Preparation → Branding → IP/Legal Preparation → Pricing → Marketing → Sales → Funding → Launch → Growth.

The older feasibility/IP-readiness pilot is a historical foundation milestone, not the definition of the finished product and not an overall completion percentage.

## Repository and hosting direction

Source of truth is this GitHub repository. Active implementation continues on `inventsmith/full-product-build` in draft PR #24 until the owner explicitly approves a merge.

The future owner-controlled runtime is:

- **GitHub** — source control and automated verification.
- **Vercel (Modern Methods-owned account)** — Next.js website/application hosting.
- **Convex (Modern Methods-owned account)** — database, authentication, storage, scheduled/backend work.

The previous MadeThis-managed Convex/Vercel environment is not a migration dependency. Its test data is disposable. Do not deploy to, modify, delete, synchronize, or require access to the MadeThis environment for repository development.

Live Vercel/Convex provisioning and production acceptance are intentionally deferred until the owner-controlled accounts and credentials are available. Repository work must continue independently wherever technically possible.

## Current repository capabilities

The full-product branch contains material implementation across the canonical invention record, Evidence Locker, validation/research, Market Research, Patent Readiness, Ask InventSmith, dependency-aware autonomous work, physical Product Design/native CAD foundations, software-product routing, prototype/manufacturing evidence gates, branding, IP/legal preparation, pricing, marketing, sales, funding artifacts, launch/growth work, organization authorization, entitlement/usage controls, privacy, exports, and operational tooling.

Capability status is tracked independently as planned, implemented, automated verification passed, deployed, live functionally verified, and professional review required/completed. Repository implementation must not be described as deployed or production-accepted until live acceptance actually occurs.

## Primary documents

- `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md` — authoritative product destination.
- `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md` — current continuation plan and implementation history.
- `docs/ATLAS_BUILD_PROGRESS.md` — living build/readiness tracker; legacy filename retained for compatibility.
- `docs/INVENTSMITH_CAPABILITY_MATRIX.md` — evidence-based capability and verification matrix.
- `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` — fresh owner-controlled Convex/Vercel deployment and acceptance runbook; legacy filename retained for links.
- `docs/MADETHIS_SYNC_HANDOFF_2026-08-15.md` — historical MadeThis handoff, explicitly retired and not an active deployment instruction.

## Local and CI verification

Inspect `package.json` and `.github/workflows/atlas-ci.yml` before changing verification commands. The current CI gate installs from the lockfile and verifies:

```text
npm ci
node --check scripts/check-deployment-readiness.mjs
node --check scripts/verify-live-deployment.mjs
npx tsc --noEmit
npx tsc -p convex --noEmit
npm test
npm audit --omit=dev --audit-level=high
npx next build
```

Mocks belong only in explicit test/development paths. Missing live providers in production must be reported as unavailable rather than silently replaced with mock results.

## Configuration rules

Never commit credentials or print secret values. Server credentials belong in Convex/Vercel secret configuration. Browser-exposed `NEXT_PUBLIC_*` values must contain only intentionally public configuration.

Legacy internal `Atlas`/`ATLAS_*` technical identifiers may remain where changing them would create stored-data, route, webhook, environment, or compatibility risk. Customer-facing identity is InventSmith — The Inventor OS by Modern Methods.

## Release boundary

Repository-green is necessary but is not deployment or product acceptance. Production claims require an owner-controlled deployment plus live checks for authentication, authorization/isolation, evidence ingestion, autonomous execution, billing/webhooks, privacy/deletion, artifact quality, representative complete journeys, and any genuine professional/physical/market evidence gates applicable to the invention.
