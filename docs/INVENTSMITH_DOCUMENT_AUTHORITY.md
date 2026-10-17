# InventSmith Document Authority

**Updated:** October 16, 2026  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged

This file defines documentation authority, naming, historical-reference rules, and how current status must be reported.

## Canonical product name

The customer-facing and current product name is **InventSmith — The Inventor OS** by **Modern Methods**.

The former **Atlas / ProjectAtlas** name is historical only. It may remain where changing it would make a factual record inaccurate, including:

- the current historical GitHub repository slug `jab1015/ProjectAtlas` until a separately reviewed repository rename is performed;
- exact historical commit messages, branch/workflow names, environment-variable/code identifiers, quotations, screenshots, exhibits, or third-party records;
- historical chronology explaining the former working name;
- compatibility identifiers that remain until a tested code-level migration occurs;
- the separately excluded `Atlas-fama` material.

Current product prose, active plans, current-state descriptions, handoffs, headings, and canonical documentation must use **InventSmith**.

## Current authoritative documents

Read these first, in this order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md` — authoritative product destination and non-negotiable requirements.
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md` — authoritative current implementation checkpoint and continuation order.
3. `docs/INVENTSMITH_BUILD_PROGRESS.md` — concise repository progress and acceptance state.
4. `docs/INVENTSMITH_CAPABILITY_MATRIX.md` — capability-by-capability implementation/acceptance evidence.
5. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md` — owner-controlled deployment and live-acceptance procedure.
6. `docs/INVENTSMITH_CONSEQUENTIAL_SECURITY_CHECKPOINT.md` — focused consequential-operation security boundary.
7. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md` — precedence, naming, and supersession rules.

When these documents disagree with a newer verified GitHub branch/PR/CI state, the newer verified GitHub state wins and the documents must be refreshed.

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

## Historical/specialized documents

Older documents created under Atlas/ProjectAtlas remain historical or specialized source material. They do not override the authoritative InventSmith documents above.

Any older statement that says or implies that only early stages are the destination; later stages are merely future scope; the controlled pilot equals overall completion; software is outside invention scope; regulated inventions must be blanket-rejected; subscriptions are inherently user-only; organizations/inventions are inherently single-user/single-workspace; MadeThis remains the deployment target; or repository-green alone means production acceptance is superseded.

## Current locked product/architecture decisions

- Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**.
- Complete applicable idea-to-market destination remains mandatory.
- Product principle: **The inventor should never have to think about InventSmith. InventSmith should think about the inventor.**
- Organization-native hierarchy: **User → Organization / Company → Memberships → Invention Workspaces**.
- Single inventors use one-member personal organizations.
- Billing/entitlements and expensive-work allowances belong to organization scope for organization-owned inventions.
- Multiple active/archived inventions and multi-user organizations are first-class requirements.
- Invention-level sharing and bounded professional/guest access are required.
- Physical, software, and hybrid products are first-class invention types.
- Pure software routes through software product specification, UX, architecture, data/API design, security/privacy readiness, prototype/build planning, QA/beta, and distribution/release rather than physical manufacturing work.
- Hybrid products run both applicable physical and software branches.
- Regulated/safety-sensitive inventions are generally supported with explicit professional/regulatory/engineering/security/privacy gates rather than blanket rejection.
- Harmful/abusive development remains refused.
- Ordinary business/service concepts without a new physical/software/hybrid product route outside the invention workflow.
- Pricing direction remains Explorer $0 → Inventor $39 → Pro $99 → Enterprise $199 → Studio $299+; exact allowances remain economics-driven until measured cost-to-serve is sufficiently calibrated.
- Professional review and external-use authorization are separate states.
- Consequential external approvals bind exact current authorized artifact revisions and must be revalidated at execution time.
- Permission/review/release records are not evidence that an outside-world action occurred.

## Hosting/deployment authority

Current owner-controlled direction:

- **GitHub:** source/CI authority;
- **Vercel:** intended Modern Methods-owned web deployment;
- **Convex:** Modern Methods-controlled backend/database/auth/storage/functions deployment path.

A Convex development deployment (`fiery-gazelle-628`) has the previously documented backend health/configuration checkpoint. That is development infrastructure, not production/live acceptance, and this documentation update does not claim the newest branch head is deployed there.

MadeThis is retired from the active implementation plan. Do not synchronize back to it, deploy to it, modify it, migrate its test data/secrets, or treat it as source of truth.

## Current exact repository truth

Immediately before this documentation refresh, draft PR #24 was open, draft, unmerged, based on `main`, and pointed to exact branch head `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`.

InventSmith CI **#136** (`38990243845`) passed against that exact head. The workflow passed exact-head checkout/verification, dependency installation, operational script checks, web and Convex typechecking, 101 test files / 571 tests, production dependency audit, bounded development-dependency audit, and the Next.js 15.5.27 production build with 32/32 static pages generated. Production audit reported 0 vulnerabilities.

The remaining accepted development-only advisory packages at that checkpoint were limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`.

The exact CI workflow itself is hardened to use the actual expected branch head, pin official checkout/setup-node actions to immutable commits, and avoid persisted checkout credentials.

The latest code hardening also added direct behavior tests around account deletion fail-closed behavior, including administrator protection and suspended organization-owner protection with zero destructive side effects before ownership resolution.

This documentation refresh creates a newer head and therefore requires a new exact-head CI result before the documentation head itself is called automatically verified.

## Current implementation truth

Implemented repository foundations include organization-native architecture; scoped entitlements/usage accounting; invention authorization/sharing; privacy/export/deletion behavior; consent-based invitations; complete applicable journey wiring; physical/software/hybrid/regulated classification/routing; evidence/trust boundaries; partial validation/recovery; attempt/lease worker reliability; genuine prototype/quote/launch/professional evidence gates; versioned artifact persistence; professional-review state; exact-revision external-use authorization; exact-artifact consequential approval scope; deliberate exact-generation manufacturing release; package export; and representative behavior/regression coverage.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release work. Unknown/missing department routing fails closed before model execution.

The repository currently has no outside-world executor that sends RFQs, contacts suppliers/manufacturers, discloses invention artifacts, places orders/payments, files submissions, or publishes for the inventor. Any future executor must revalidate exact current approved scope immediately before its side effect and record execution separately from authorization.

## Continuation rule

A new chat or coding worker should use the authoritative InventSmith documents above and continue from the live branch/PR/CI state. Do not restart completed work, merge PR #24, touch `main`, reintroduce MadeThis synchronization, or treat historical former-name documents as current authority.

After any new status-documentation commit, qualify that documentation head with exact-head CI before calling the documentation checkpoint verified.
