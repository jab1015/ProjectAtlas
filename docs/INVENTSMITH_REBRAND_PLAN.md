# InventSmith Naming and Rebrand Plan

**Updated:** September 15, 2026  
**Status:** customer-facing rename substantially complete; compatibility/historical cleanup remains deliberately conservative  
**Current customer-facing name:** InventSmith  
**Descriptor:** The Inventor OS  
**Publisher:** Modern Methods  
**Former working name:** Atlas / ProjectAtlas — historical references only  
**Planning completion estimate:** **approximately 96%**

## Canonical naming rule

Current customer-facing identity, active documentation, handoff instructions, generated product copy, and current-state descriptions use **InventSmith — The Inventor OS**.

Former-name wording may remain only when necessary for factual history or technical compatibility, including the historical repository slug, exact commit/workflow/branch names, environment variables, code/database identifiers, quoted records, screenshots, exhibits, or chronology describing the former working name.

## Completed naming work

- Canonical product identity is InventSmith — The Inventor OS by Modern Methods.
- Active authoritative documentation uses `INVENTSMITH_*` filenames.
- Current product/deployment/progress prose uses InventSmith terminology.
- Ask InventSmith naming is established for the assistant-facing experience.
- Current Google Drive legal/IP working documents were renamed to InventSmith while preserving historical provenance.
- Former active Atlas-named build/deployment documentation has been retired from the active full-product branch.
- MadeThis has been removed from the current deployment direction and survives only as historical context where necessary.

## Remaining naming work

The remaining ~4% is intentionally narrow:

1. Continue auditing low-risk customer-facing strings for obsolete former-name or “coming soon” wording in legacy/unreachable UI branches.
2. Preserve technical identifiers such as `atlas*`, `ATLAS_*`, existing Convex function/table names, exact workflow/branch names and stored identifiers unless a separately tested migration provides concrete value.
3. Keep the historical repository slug `jab1015/ProjectAtlas` for now. A repository rename is a separate compatibility/redirect/CI/deployment decision and is not required for customer-facing branding completion.
4. Re-run exact-head TypeScript/regression/audit/build qualification after any remaining source-level naming cleanup.

## Active canonical documentation

- `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
- `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
- `docs/INVENTSMITH_BUILD_PROGRESS.md`
- `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`
- `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`
- `docs/INVENTSMITH_CAPABILITY_MATRIX.md`
- `docs/INVENTSMITH_REBRAND_PLAN.md`

## Preserve until separately tested

- Historical repository slug `jab1015/ProjectAtlas` and Git history.
- Existing Convex table/function identifiers.
- Compatibility-prefixed `ATLAS_*` environment variables.
- Existing database IDs and stored records.
- Exact workflow/commit/branch names used as CI/history evidence.
- Historical release/email/exhibit/conception records where changing wording would falsify history.
- Separately excluded former-name trees/repositories that are not part of active InventSmith work.

## Safety rule

Do not perform blind global replacement. Rename customer-facing/current product identity; preserve historical truth and compatibility identifiers until migration is independently tested.

## Acceptance criteria

- No reachable current customer-facing page identifies the product by the former working name.
- Ask InventSmith is consistent.
- InventSmith — The Inventor OS is primary branding.
- Modern Methods remains publisher/company identity.
- Authoritative/current repository documents use InventSmith filenames and terminology.
- Current Google Drive working documents use InventSmith terminology while historical evidence remains accurate.
- Compatibility identifiers are understood as technical/historical, not current branding.
- Exact source head passes TypeScript, regressions, production dependency audit and production build after final source-level naming changes.

A repository rename may be evaluated later, but it is not counted as a blocker to customer-facing InventSmith completion.