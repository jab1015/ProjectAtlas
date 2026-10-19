# InventSmith Capability Matrix

**Updated:** October 19, 2026 (America/New_York)
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified CI checkpoint:** `93744db1fdf2772925f96dbc4d33ed1823192f86` (CI #226). Later operations-console compatibility changes were preview-accepted but await exact-head CI.

## Status vocabulary

- **Planned** — required by the current product specification.
- **Implemented** — repository code exists.
- **Automated verification passed** — the exact relevant implementation passed deterministic checks.
- **Deployed** — the exact implementation/config is on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated behavior was exercised there.
- **Professional review completed** — genuine qualifying review was actually recorded.
- **Real-world evidence present** — genuine outside-world evidence was actually ingested/verified.
- **External action executed** — an outside-world side effect actually occurred and was separately recorded.

No overall completion percentage is asserted.

### Current preview checkpoint — October 19, 2026

Branch head `6b6becb` has a failed Netlify Deploy Preview. The build log reports invalid UTF-8 in `src/app/(app)/invention/[id]/page.tsx`; the broken source blob is being repaired and a fresh preview remains pending. The existing successful preview is still serving the earlier commit, so the new fixes are not yet available to test. No full-product Convex deployment or provider-backed AI acceptance is claimed.

## Naming / infrastructure

Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**. The historical repository slug `jab1015/ProjectAtlas` and selected `atlas*` / `ATLAS_*` compatibility identifiers remain only where tested migration has not yet occurred.

MadeThis is retired/historical. The Convex deployment `fiery-gazelle-628` belongs to another application and is excluded from InventSmith work. The intended InventSmith test deployment is `dev/inventsmith-test` (`quick-fox-785`); its current code and auth configuration are unverified. Prior purported test deploy runs actually targeted production `agile-seahorse-379`. Modern Methods-owned Vercel/frontend deployment and authenticated browser acceptance remain separate acceptance dimensions.

### Limited production checkpoint

Convex production `agile-seahorse-379` has a deliberately limited password-recovery backend deployment. Existing production functions and data were preserved; PR #24 remains unmerged and the full unverified product was not deployed. The Netlify PR #24 preview has live-functionally verified password recovery through successful reset-email delivery, code entry, and sign-in.

## Current capability state

| Capability | Repository state | Automated state | Deployment/live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | implemented | representative regressions passed; completion semantics locked | newest head not claimed live | deeper persisted lifecycle acceptance |
| Password recovery | implemented | recovery flow and auth backend checks passed | live-functionally verified on the PR #24 preview against limited Convex production | broader authenticated acceptance and final release decision |
| Dedicated AI agent per department | implemented: 17 stable profiles | routing/prompt/audit/fail-closed coverage passed | newest head not claimed deployed | provider-backed authenticated executions |
| Physical/software/hybrid/regulated routing | implemented | representative routing covered | not live-accepted | persisted/live acceptance |
| Organization-native tenancy/access | implemented | direct authorization, ownership, member, sharing and owner-precedence behavior covered | not live multi-user accepted | deeper live multi-user cases |
| Selected beta access and credits | implemented | admin-only dated overrides, append-only credit ledger, effective-plan enforcement, reservation settlement, deletion/export coverage | source implementation present; no verified deployment to `quick-fox-785`; live admin workflow not accepted | exercise selected-account grant/revoke and credit adjustment with disposable testers |
| Secure organization invitations | implemented | exact account/email binding, expiry and current seat-capacity directly tested | not live multi-user accepted | authenticated live acceptance |
| Invention sharing/grants | implemented | active same-org target requirement, exact insert/update, stale-grant cleanup directly tested | not live multi-user accepted | live grant/revocation acceptance |
| Evidence provenance/trust | implemented | fail-closed evidence tests established | not live-calibrated | provider-backed calibration |
| Worker attempt/lease reliability | implemented | deterministic regressions established | not live-soak-tested | concurrency/soak |
| Usage settlement/accounting | implemented | deterministic paths plus deletion reserved-usage release covered | not production-integrated | provider interruption economics |
| Professional-review audit state | implemented | direct mutation/replay/invalidation covered | genuine review not generalized | qualified real reviews |
| Native CAD / manufacturing maturity | implemented foundation | revision/freshness/review/release regressions established | not engineering-live-validated | genuine engineering/manufacturing acceptance |
| Real prototype/quote/launch evidence gates | implemented | direct behavior covered | only genuine outside evidence counts | representative real evidence |
| Account/privacy/invention deletion | implemented | destructive guards, execution ordering, cleanup/storage/accounting directly tested | not live-destructive-tested | disposable live acceptance |
| Personal / organization export scope | implemented | company/studio separation and owner-only billing attribution covered | not live-accepted | representative export inspection |
| Subscription event application | implemented | duplicate/invalid-target/exact-org/legacy/ownership-transfer behavior directly tested | provider not owner-live | real provider lifecycle acceptance |
| Subscription lifecycle semantics | implemented | cancellation/past-due period-end, unpaid downgrade, user/personal-org mirror directly tested | provider not owner-live | real provider timing acceptance |
| Subscription event ordering | implemented | delayed older events rejected; equal timestamps deterministic independent of arrival order for org + legacy scopes | provider not owner-live | live delayed/replay acceptance |
| Signed subscription HTTP ingress | implemented | secret/signature, malformed/oversized payload, UTF-8 byte limit, normalization and exact mutation handoff directly tested | not owner-live | provider callback acceptance |
| Fulfillment replay handling | implemented | duplicate sales suppression, platform/Stripe replay and authoritative stored token directly tested | provider not owner-live | real checkout replay acceptance |
| Signed fulfillment HTTP ingress | implemented | signature/body validation, no-side-effect rejects, product lookup, new/replay mutation order directly tested | not owner-live | real provider fulfillment acceptance |
| Authorized download delivery | implemented | malformed external ID fail-closed, token/status checks, product-scoped file selection, storage availability and accounting-before-redirect directly tested | not live-accepted | owner-controlled storage/download acceptance |
| Checkout success truth | implemented | public redirect/query string cannot emit authoritative upgrade-completed analytics; only checkout-return event recorded | not live-accepted | bind future confirmed conversion analytics to provider-backed state |
| Package external-use safety | implemented | stale/quality/exact authorization/duplicate-newest/empty-content fail-closed coverage | not live-accepted | rendered artifact QA |
| Exact-revision external-use authorization | implemented | exact latest/fresh manager authorization and non-execution semantics covered | not live multi-user accepted | persisted/live acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution-time revalidation covered | no external executor exists | preserve guard; separately audit future executor |
| Production dependency security | implemented in lock/workflow | verified checkpoint has 0 production vulnerabilities | repository-only state | continue patch discipline |
| Development dependency audit boundary | implemented | only known Next/ESLint lint-chain advisories accepted | repository-only state | upstream fixes or safe migration |
| Exact-head CI integrity | implemented | PR head checkout/assertion; pinned actions; no persisted credentials | repository-only state | keep enforced |
| Authentication dependency modernization | Lucia v3 currently in use | current auth/type/build gates pass | migration not performed | deliberately plan/test replacement |
| Owner-controlled Convex path | partially executed | dedicated test deployment `quick-fox-785` exists but current code is unverified; workflow logs show prior runs targeted `agile-seahorse-379`; `fiery-gazelle-628` is another app | production received unintended broader function deployment; no further deployment allowed; branch head `0a90b9f` has a Netlify preview; newest local fixes are not deployed | perform authenticated acceptance |
| Owner-controlled Convex production path | limited deployment | password-recovery backend deployed and health/auth acceptance verified | limited live acceptance only | preserve existing functions/data while expanding scope deliberately |
| Owner-controlled Vercel/frontend path | preview exists | repository build passes | PR #24 preview authenticated; password recovery and operations console preview-verified | point a test preview at the dedicated InventSmith test deployment |
| InventSmith operations console | implemented | page code and compatibility fallback verified locally | refreshed preview works; AI details intentionally unavailable from limited production response | verify against full test deployment and exercise a controlled failed work item |
| Billing/webhooks | substantial backend/security foundation | signed ingress, lifecycle, ordering, fulfillment, replay/download and checkout-truth behavior covered | not owner-live | provider/live lifecycle acceptance |
| Commercial cost calibration | instrumentation foundation exists | partial | not production-measured | measured provider/runtime economics |

## Latest exact CI truth

InventSmith CI **#226**, run `39016181734`, passed at exact code head `93744db1fdf2772925f96dbc4d33ed1823192f86`.

Checkpoint results:

- **116 test files passed**;
- **660 tests passed**;
- production dependency audit: **0 vulnerabilities**;
- accepted development-only advisory packages limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** build passed with **32/32** static pages generated;
- Lucia `3.2.2` deprecation remains a separate auth-migration item.

This documentation refresh creates a newer head and therefore requires exact-head CI before the documentation head itself is called automatically verified.

## Immediate tracker

1. Exact-head CI for the final documentation-refresh head.
2. Owner-controlled live provider lifecycle acceptance: signatures, checkout confirmation, cancellation/past-due, delayed/replayed events, fulfillment/download, ownership transitions, and browser-visible entitlement changes.
3. Representative persisted physical/software/hybrid/regulated lifecycle acceptance through replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Artifact/rendered export and generated-format quality.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Remaining low-risk customer-facing naming cleanup.
7. Verify the dedicated InventSmith test deployment `dev/inventsmith-test` (`quick-fox-785`), including selected beta access and credit controls; never reuse `fiery-gazelle-628`.
8. Provider/concurrency and commercial calibration.
9. Deliberately planned/tested Lucia migration.

PR #24 remains draft/open/unmerged; `main` remains untouched.
