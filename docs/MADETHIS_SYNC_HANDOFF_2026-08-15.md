# InventSmith — Historical MadeThis Synchronization Handoff

**Prepared:** August 15, 2026  
**Retired:** September 14, 2026  
**Repository:** `jab1015/ProjectAtlas`  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods

> **RETIRED — DO NOT EXECUTE THIS HANDOFF.**
>
> This file is retained only as historical evidence of the previous deployment plan. The owner has explicitly moved InventSmith away from MadeThis. The MadeThis-managed Convex/Vercel environment is not the source of truth, does not require data migration, and must not be modified, deployed to, deleted, synchronized, or treated as a prerequisite for repository work.

## Superseding deployment direction

The active destination is owner-controlled infrastructure:

1. **GitHub** for source control and automated verification.
2. **Modern Methods-owned Vercel account** for the Next.js website/application.
3. **Modern Methods-owned Convex account** for database, authentication, storage, scheduled work, and backend execution.

The current MadeThis environment contains disposable test data. No MadeThis database/auth/storage migration is required. Live owner-controlled account provisioning and deployment will occur later when credentials are available.

## Active sources of truth

Read these instead of following the old synchronization procedure:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_CAPABILITY_MATRIX.md`
5. `docs/ATLAS_DEPLOYMENT_RUNBOOK.md`
6. repository branch `inventsmith/full-product-build` and draft PR #24

The legacy filename is intentionally retained so old links fail safe into this retirement notice rather than sending a future maintainer back to MadeThis.

## Historical context only

The previous handoff instructed a MadeThis Coding Worker to reproduce GitHub changes while preserving the MadeThis-managed Convex database, authentication population, Vercel project, domain, secrets, subscriptions, and stored data. Those preservation/synchronization requirements are no longer active requirements.

Do **not** use this historical file to justify:

- synchronizing GitHub changes into MadeThis;
- requiring access to MadeThis before source-level fixes can proceed;
- migrating MadeThis test data;
- preserving MadeThis-specific environment bindings or deployment assumptions;
- pinning a release SHA for MadeThis;
- deploying or deleting MadeThis resources.

Compatibility-sensitive internal `Atlas`/`ATLAS_*` identifiers may still remain where changing them would risk application contracts. That is independent of MadeThis and does not make MadeThis an infrastructure dependency.

## Continuing safety invariants

The product must continue to preserve backend authorization, entitlements, evidence provenance, cost accounting, professional-review gates, explicit authorization before consequential external actions, privacy controls, and secret-safe configuration. InventSmith must not claim patentability/FTO/legal approval, regulatory certification, engineering approval, unperformed software testing/deployment, fabricated supplier quotes, fabricated market evidence, or guaranteed commercial outcomes.

## Verification boundary

Repository verification remains:

```text
npm ci
npx tsc --noEmit
npx tsc -p convex --noEmit
npm test
npm audit --omit=dev --audit-level=high
npx next build
```

A green repository does not mean deployed or live-verified. Owner-controlled Vercel/Convex deployment and live acceptance remain separate future statuses.
