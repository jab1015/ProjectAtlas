# InventSmith Naming and Rebrand Plan

**Status:** canonical product rename approved; active documentation normalization in progress  
**Current customer-facing name:** InventSmith  
**Descriptor:** The Inventor OS  
**Publisher:** Modern Methods  
**Former working name:** Atlas / ProjectAtlas — historical references only

## Canonical naming rule

Current customer-facing identity, active documentation, handoff instructions, generated product copy, and current-state descriptions use **InventSmith — The Inventor OS**.

Former-name wording may remain only when it is necessary to preserve factual history or technical compatibility, including the current historical repository slug, exact commit/workflow/branch names, environment variables, code/database identifiers, quoted emails, exhibits, screenshots, third-party records, or chronology explicitly describing the former working name.

## Required customer-facing changes

1. Application metadata, browser titles, descriptions, Open Graph and other public metadata.
2. Navigation, headers, authentication screens, onboarding, dashboard, settings, billing, privacy, admin and operational surfaces.
3. Ask InventSmith is used wherever the assistant is shown to users.
4. Customer-facing AI/system prompts identify the product as InventSmith.
5. Generated PDF/DOCX/package titles, cover pages, footers and product attribution use InventSmith.
6. Emails, subscription copy, privacy/export copy and user-visible error/help text use InventSmith.
7. README and active product/deployment documentation use InventSmith-named canonical files.
8. Representative-pilot and acceptance language uses InventSmith except where quoting exact historical evidence.
9. Google Drive working/current documents use InventSmith; historical conception/evidence records may retain former-name references only where chronology or evidentiary accuracy requires them.

## Active canonical documentation filenames

- `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
- `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
- `docs/INVENTSMITH_BUILD_PROGRESS.md`
- `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`
- `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`
- `docs/INVENTSMITH_CAPABILITY_MATRIX.md`

The former active `ATLAS_BUILD_PROGRESS.md` and `ATLAS_DEPLOYMENT_RUNBOOK.md` filenames have been retired from the active full-product branch.

## Preserve until a separately tested migration is justified

- Historical repository slug `jab1015/ProjectAtlas` and Git history.
- Existing Convex table/function identifiers.
- Existing environment-variable names such as compatibility-prefixed `ATLAS_*` variables.
- Existing database IDs and stored records.
- Exact workflow/commit/branch names used as historical or CI evidence.
- Historical release, email, exhibit, and conception records where changing the wording would falsify history.

A repository rename can be evaluated separately after active documentation and code compatibility references are inventoried. It is not required for the product itself to be fully branded InventSmith.

## Safety rule

Do not perform a blind global former-name-to-InventSmith replacement. Review each occurrence. Rename current product identity and current documentation; preserve factual historical references and compatibility identifiers until their migration is independently tested.

## Acceptance criteria

- No current customer-facing page identifies the product by the former working name.
- Ask InventSmith is used consistently.
- InventSmith — The Inventor OS is used in primary branding.
- Modern Methods remains the publisher/company identity.
- All authoritative/current repository documents use InventSmith filenames and current InventSmith terminology.
- Google Drive current/working documents use InventSmith terminology while preserving accurate historical evidence.
- Historical compatibility identifiers are clearly described as compatibility/historical identifiers rather than current branding.
- TypeScript, regression tests, production dependency audit and production build pass after naming/documentation changes.
