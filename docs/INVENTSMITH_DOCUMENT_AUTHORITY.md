# InventSmith Document Authority

**Updated:** October 18, 2026 (America/New_York)
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged

This file defines documentation authority, naming, historical-reference rules, and how current status must be reported.

## Canonical product name

The customer-facing and current product name is **InventSmith — The Inventor OS** by **Modern Methods**.

The former **Atlas / ProjectAtlas** name is historical only. It may remain where changing it would make a factual record inaccurate, including the current repository slug `jab1015/ProjectAtlas`, exact historical records, compatibility identifiers pending tested migration, and separately excluded historical material.

## Current authoritative documents

Read these first, in this order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/INVENTSMITH_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_CAPABILITY_MATRIX.md`
5. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`
6. `docs/INVENTSMITH_CONSEQUENTIAL_SECURITY_CHECKPOINT.md`
7. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

When these documents disagree with newer verified GitHub branch/PR/CI state, the newer verified GitHub state wins and the documents must be refreshed.

## Status reporting rule

Never publish one overall completion percentage. Report these states independently:

- **Planned**
- **Implemented**
- **Automated verification passed**
- **Deployed**
- **Live functionally verified**
- **Professional review completed**
- **Real-world evidence present**
- **External action executed**

Repository-green is necessary but never sufficient for deployed/live/professional/real-world claims.

## Current locked product/architecture decisions

- Product: **InventSmith — The Inventor OS** by **Modern Methods**.
- Complete applicable idea-to-market destination remains mandatory.
- Organization-native hierarchy: **User → Organization / Company → Memberships → Invention Workspaces**.
- Single inventors use one-member personal organizations.
- Billing/entitlements and expensive-work allowances belong to organization scope for organization-owned inventions.
- Multiple active/archived inventions and multi-user organizations are first-class requirements.
- Invention-level sharing and bounded professional access are required.
- Active organization membership is the outer invention-access boundary; removed/suspended membership cannot be resurrected by an explicit grant.
- Organization owners retain `manage` authority across organization inventions even if a stale/narrow explicit grant exists.
- Physical, software, hybrid, and regulated invention paths remain first-class where applicable.
- Harmful/abusive development remains refused.
- Professional review and external-use authorization are separate states.
- Consequential external approvals bind exact current authorized artifact revisions and must be revalidated at execution time.
- Permission/review/release records are not evidence that an outside-world action occurred.
- Signed subscription and fulfillment ingress must fail closed before application mutations on invalid secret/signature/payload/size.
- Subscription lifecycle access is derived from confirmed recorded provider state, with cancellation/past-due period-end handling, immediate unpaid downgrade, stale-event rejection, and deterministic equal-time ordering.
- A public checkout redirect/query parameter is not evidence of entitlement or a completed upgrade and must not emit authoritative completion analytics.
- Fulfillment replay must be idempotent for purchase creation and sales counting and must reuse the authoritative stored download token.
- Download links must normalize external purchase IDs safely, enforce purchase token/status, constrain file selection to the purchased product, and record successful download accounting before redirect.

## Hosting/deployment authority

Current owner-controlled direction:

- **GitHub:** source/CI authority;
- **Vercel:** intended Modern Methods-owned web deployment;
- **Convex:** Modern Methods-controlled backend/database/auth/storage/functions deployment path.

The Convex deployment `fiery-gazelle-628` belongs to another application and is not an InventSmith environment. It must not be inspected, modified, or used for InventSmith testing. InventSmith production is `agile-seahorse-379`; the dedicated InventSmith test deployment is `dev/inventsmith-test` (`quick-fox-785`). The test deployment exists but has not yet received the latest repository head.

MadeThis is retired from the active implementation plan.

## Current exact repository truth

Immediately before this documentation refresh, the exact verified code checkpoint was `93744db1fdf2772925f96dbc4d33ed1823192f86`.

InventSmith CI **#226** (`39016181734`) passed against that exact head with:

- exact-head checkout/verification;
- web and Convex typechecking;
- **116 test files / 660 tests**;
- production dependency audit: **0 vulnerabilities**;
- bounded development advisory packages limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** production build;
- **32/32** static pages generated.

CI remains hardened to verify the actual expected PR head, pin official checkout/setup-node actions to immutable commits, and avoid persisted checkout credentials. Lucia `3.2.2` remains deprecated and is a separately planned/tested authentication migration item.

## Current implementation/security truth

Implemented repository foundations include organization-native architecture; scoped entitlements/usage accounting; invention authorization/sharing; privacy/export/deletion behavior; consent-based invitations; complete applicable journey wiring; physical/software/hybrid/regulated classification/routing; evidence/trust boundaries; partial validation/recovery; attempt/lease worker reliability; genuine prototype/quote/launch/professional evidence gates; versioned artifact persistence; professional-review state; exact-revision external-use authorization; exact-artifact consequential approval scope; exact-generation manufacturing release; package export; signed subscription/fulfillment ingress; replay-safe purchase fulfillment; and authorized/accounted download delivery.

Recent behavior coverage directly verifies subscription lifecycle timing, delayed/duplicate/equal-timestamp event ordering, billing identity continuity, signed subscription ingress/application, fulfillment replay safety, signed fulfillment rejection ordering, authoritative download-token reuse, external purchase-ID normalization, product-scoped download file selection, download accounting before redirect, and checkout-success analytics/entitlement truth separation.

The repository currently has no outside-world executor that sends RFQs, contacts suppliers/manufacturers, discloses invention artifacts, places orders/payments, files submissions, or publishes for the inventor.

This documentation refresh creates a newer head and therefore requires a new exact-head CI result before the documentation head itself is called automatically verified.

## Continuation rule

A new chat or coding worker should use the authoritative InventSmith documents above and continue from the live branch/PR/CI state. Do not restart completed work, merge PR #24, touch `main`, reintroduce MadeThis synchronization, or treat historical former-name documents as current authority.

Near-term engineering should continue owner-controlled provider lifecycle/live acceptance, deeper persisted representative lifecycles, artifact/output quality, and deployment preparation without weakening the current signed-ingress, lifecycle-ordering, idempotency, authorization, accounting, consequential-action, checkout-truth, or no-executor boundaries.
