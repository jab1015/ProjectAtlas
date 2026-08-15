# InventSmith — The Inventor OS

InventSmith is the Modern Methods inventor operating system for moving an idea through structured research, feasibility, evidence review, invention development, and IP-readiness preparation with bounded autonomous assistance.

**Product:** InventSmith  
**Descriptor:** The Inventor OS  
**Publisher:** Modern Methods  
**Core promise:** You invent. InventSmith does the work.

## Current release target

Controlled pilot: **Idea to Feasibility and IP Readiness**.

The current implementation includes the canonical invention workspace and ledgers, autonomous dependency orchestration, evidence verification and trust controls, feasibility-package generation, concept visualization, PDF/DOCX export, Ask InventSmith, representative-pilot tooling, subscription/entitlement enforcement, privacy export and deletion controls, operational health checks, CI, and deployment verification tooling.

## Repository status

Repository-level implementation and verification are complete for the current handoff baseline. Remaining acceptance work requires the MadeThis-managed runtime so that the existing Convex database/auth population, Vercel project, domain, storage, environment bindings, secrets, subscription lifecycle, and live production data can be preserved and validated.

Do not recreate or wipe the existing managed environment during synchronization.

## Primary documents

- `docs/BRAND_IDENTITY.md` — InventSmith brand identity and rename policy.
- `docs/ATLAS_PRODUCT_RESET_V1.md` — authoritative controlled-pilot product scope and safety boundary (legacy filename retained for continuity).
- `docs/ATLAS_BUILD_PROGRESS.md` — living build/readiness tracker.
- `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` — deployment and acceptance runbook.
- `docs/MADETHIS_SYNC_HANDOFF_2026-08-15.md` — MadeThis Coding Worker synchronization handoff.

## Verification

The repository CI gate verifies:

```text
npx tsc --noEmit
npx tsc -p convex --noEmit
npm test
npm audit --omit=dev --audit-level=high
npx next build
```

A permanent branding regression check prevents current customer-facing Atlas identity from being reintroduced. Legacy `Atlas`/`ATLAS_*` technical identifiers may remain where changing them would create deployment, data, webhook, environment, or compatibility risk.

## Managed-environment acceptance

After MadeThis synchronizes the verified GitHub baseline into its managed source, acceptance requires live health/auth verification, representative invention/model/image testing, subscription-webhook validation, rendered document QA, deletion/restoration testing, and operational monitoring/backups.
