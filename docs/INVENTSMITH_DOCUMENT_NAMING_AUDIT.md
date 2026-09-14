# InventSmith Documentation Naming Audit

**Audit date:** September 14, 2026  
**Canonical product:** **InventSmith — The Inventor OS**  
**Publisher:** **Modern Methods**  
**Active branch:** `inventsmith/full-product-build`  
**Draft PR:** #24 — intentionally unmerged

## Result

Active/current InventSmith documentation has been normalized to the InventSmith product name. Active Atlas-prefixed documentation filenames were retired in favor of InventSmith-prefixed filenames, the Stage 1–15 blueprints use InventSmith product prose, the release-management plans use InventSmith filenames/prose, and the active InventSmith Bible/document directories use InventSmith naming.

Google Drive current/working InventSmith legal/IP records were also reviewed and corrected where current-state wording or hosting direction was stale. Exact former-name wording remains only where preserving chronology, provenance, repository evidence, or a historical quotation requires it.

## Intentionally retained former-name / compatibility references

The following do **not** represent current product branding and are intentionally retained until a separate tested migration or historical-retention decision is made:

- Repository slug: `jab1015/ProjectAtlas`.
- Exact technical identifiers and source paths whose rename could break code, tests, deployment, database, auth, integrations, or historical CI evidence, including lowercase `atlas...` source/workflow identifiers and compatibility-prefixed `ATLAS_*` identifiers.
- Exact historical commit messages, branch/workflow names, emails, quotations, screenshots, exhibits, third-party records, and chronology.
- The separately excluded `Atlas-fama` tree. It is not part of active InventSmith product work and was deliberately left untouched.

## Canonical active documents

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/INVENTSMITH_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`
5. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`
6. `docs/INVENTSMITH_CAPABILITY_MATRIX.md`
7. `docs/INVENTSMITH_REBRAND_PLAN.md`

## Verification boundary

Repository verification, deployed state, live functional verification, and professional review remain separate statuses. A green repository check does not mean InventSmith is deployed or production-accepted. Trust the live branch and exact-head GitHub Actions result over an older checkpoint recorded in documentation.
