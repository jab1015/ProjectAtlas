# InventSmith Document Authority

**Updated:** October 16, 2026 (America/New_York)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged

This file defines documentation authority, naming, historical-reference rules, and how current status must be reported.

## Canonical product name

The customer-facing and current product name is **InventSmith — The Inventor OS** by **Modern Methods**.

The former **Atlas / ProjectAtlas** name is historical only. It may remain where changing it would make a factual record inaccurate, including the current repository slug `jab1015/ProjectAtlas`, exact historical records, compatibility identifiers pending tested migration, and separately excluded historical material.

Current product prose, active plans, current-state descriptions, handoffs, headings, and canonical documentation must use **InventSmith**.

## Current authoritative documents

Read these first, in this order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md` — authoritative product destination and non-negotiable requirements.
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md` — authoritative current implementation checkpoint and continuation order.
3. `docs/INVENTSMITH_BUILD_PROGRESS.md` — repository progress and acceptance state.
4. `docs/INVENTSMITH_CAPABILITY_MATRIX.md` — capability-by-capability implementation/acceptance evidence.
5. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md` — owner-controlled deployment and live-acceptance procedure.
6. `docs/INVENTSMITH_CONSEQUENTIAL_SECURITY_CHECKPOINT.md` — focused consequential-operation security boundary.
7. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md` — precedence, naming, and supersession rules.

When these documents disagree with newer verified GitHub branch/PR/CI state, the newer verified GitHub state wins and the documents must be refreshed.

## Status reporting rule

Never publish one overall completion percentage. The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

Report these states independently:

- **Planned** — specified but not necessarily implemented.
- **Implemented** — repository code exists.
- **Automated verification passed** — the exact implementation head passed relevant deterministic CI/tests.
- **Deployed** — the exact code/config is present on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated behavior passed there.
- **Professional review completed** — a genuine qualifying review was actually recorded.
- **Real-world evidence present** — genuine outside-world evidence was actually ingested/verified.
- **External action executed** — an outside-world side effect actually occurred and was separately recorded.

Repository-green is necessary but never sufficient for deployed/live/professional/real-world claims.

## Current locked product/architecture decisions

- Product: **InventSmith — The Inventor OS** by **Modern Methods**.
- Complete applicable idea-to-market destination remains mandatory.
- Organization-native hierarchy: **User → Organization / Company → Memberships → Invention Workspaces**.
- Single inventors use one-member personal organizations.
- Billing/entitlements and expensive-work allowances belong to organization scope for organization-owned inventions.
- Multiple active/archived inventions and multi-user organizations are first-class requirements.
- Invention-level sharing and bounded professional access are required.
- Physical, software, and hybrid products are first-class invention types.
- Regulated/safety-sensitive inventions are generally supported with explicit professional/regulatory/engineering/security/privacy gates rather than blanket rejection.
- Harmful/abusive development remains refused.
- Professional review and external-use authorization are separate states.
- Consequential external approvals bind exact current authorized artifact revisions and must be revalidated at execution time.
- Permission/review/release records are not evidence that an outside-world action occurred.

## Hosting/deployment authority

Current owner-controlled direction:

- **GitHub:** source/CI authority;
- **Vercel:** intended Modern Methods-owned web deployment;
- **Convex:** Modern Methods-controlled backend/database/auth/storage/functions deployment path.

The documented Convex development deployment `fiery-gazelle-628` has a prior backend health/configuration checkpoint. That is development infrastructure, not production/live acceptance. This documentation refresh does not claim the latest repository head is deployed there.

MadeThis is retired from the active implementation plan. Do not synchronize back to it, deploy to it, modify it, migrate its test data/secrets, or treat it as source of truth.

## Current exact repository truth

Immediately before this documentation refresh, draft PR #24 was open, draft, unmerged, based on `main`, and the exact verified code checkpoint was `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`.

InventSmith CI **#165** (`38994705687`) passed against that exact head with:

- exact-head checkout/verification;
- web and Convex typechecking;
- **107 test files / 603 tests**;
- production dependency audit: **0 vulnerabilities**;
- bounded development advisory packages limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** production build;
- **32/32** static pages generated.

CI itself is hardened to use the actual expected branch head, pin official checkout/setup-node actions to immutable commits, and avoid persisted checkout credentials.

Vitest config native-loader warnings are resolved. Lucia `3.2.2` remains deprecated and is a separately planned/tested authentication migration item.

## Current implementation/security truth

Implemented repository foundations include organization-native architecture; scoped entitlements/usage accounting; invention authorization/sharing; privacy/export/deletion behavior; consent-based invitations; complete applicable journey wiring; physical/software/hybrid/regulated classification/routing; evidence/trust boundaries; partial validation/recovery; attempt/lease worker reliability; genuine prototype/quote/launch/professional evidence gates; versioned artifact persistence; professional-review state; exact-revision external-use authorization; exact-artifact consequential approval scope; exact-generation manufacturing release; package export; and representative behavior/regression coverage.

Recent behavior-level security coverage directly verifies:

- account-deletion administrator and organization-owner guards;
- privacy request deletion execution ordering/terminal/billing guards;
- organization ownership transfer and member management;
- owner-only billing attribution in organization export;
- personal-export exclusion of company/studio invention and billing scope;
- exact-account/email invitation acceptance, expiration, and seat-capacity checks before membership activation.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release work. Unknown/missing department routing fails closed before model execution.

The repository currently has no outside-world executor that sends RFQs, contacts suppliers/manufacturers, discloses invention artifacts, places orders/payments, files submissions, or publishes for the inventor.

This documentation refresh creates a newer head and therefore requires a new exact-head CI result before the documentation head itself is called automatically verified.

## Continuation rule

A new chat or coding worker should use the authoritative InventSmith documents above and continue from the live branch/PR/CI state. Do not restart completed work, merge PR #24, touch `main`, reintroduce MadeThis synchronization, or treat historical former-name documents as current authority.

The next larger destructive behavior target is invention deletion and its storage/usage cleanup/accounting path; modify it only with careful behavior-preserving extraction and exact-head verification.
