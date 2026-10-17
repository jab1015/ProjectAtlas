# InventSmith Capability Matrix

**Updated:** October 16, 2026 (America/New_York)  
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation refresh:** `d01b845b489ec8a7591980fa81d69b915c82d4fc`

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

## Naming / infrastructure

Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**. The historical repository slug `jab1015/ProjectAtlas` and selected `atlas*` / `ATLAS_*` compatibility identifiers remain only where tested migration has not yet occurred.

MadeThis is retired/historical. A Modern Methods-controlled Convex development deployment (`fiery-gazelle-628`) has a prior backend health/configuration checkpoint. The newest branch head is not claimed deployed there. Modern Methods-owned Vercel/frontend deployment and authenticated browser acceptance remain separate incomplete steps.

## Current capability state

| Capability | Repository state | Automated state | Deployment/live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | implemented | representative regressions passed; completion semantics locked | newest head not claimed live | deeper persisted lifecycle acceptance |
| Dedicated AI agent per department | implemented: 17 stable profiles | routing/prompt/audit/fail-closed coverage passed | newest head not claimed deployed | provider-backed authenticated executions |
| Physical/software/hybrid/regulated routing | implemented | representative routing covered | not live-accepted | persisted/live acceptance |
| Organization-native tenancy/access | implemented | direct authorization, ownership, member, sharing and owner-precedence behavior covered | not live multi-user accepted | deeper live multi-user cases |
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
| Subscription event application | implemented | duplicate, stale, invalid target, exact org, legacy path, ownership-transfer identity directly tested | provider not owner-live | real provider lifecycle acceptance |
| Signed subscription HTTP ingress | implemented | secret/signature, malformed/oversized payload, UTF-8 byte limit, normalization and exact mutation handoff directly tested | not owner-live | provider callback acceptance |
| Fulfillment replay handling | implemented | duplicate sales suppression, platform/Stripe replay and authoritative stored token directly tested | provider not owner-live | real checkout replay acceptance |
| Signed fulfillment HTTP ingress | implemented | signature/body validation, no-side-effect rejects, product lookup, new/replay mutation order directly tested | not owner-live | real provider fulfillment acceptance |
| Authorized download delivery | implemented | malformed external ID fail-closed, token/status checks, product-scoped file selection, storage availability and accounting-before-redirect directly tested | not live-accepted | owner-controlled storage/download acceptance |
| Package external-use safety | implemented | stale/quality/exact authorization/duplicate-newest/empty-content fail-closed coverage | not live-accepted | rendered artifact QA |
| Exact-revision external-use authorization | implemented | exact latest/fresh manager authorization and non-execution semantics covered | not live multi-user accepted | persisted/live acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution-time revalidation covered | no external executor exists | preserve guard; separately audit future executor |
| Production dependency security | implemented in lock/workflow | verified checkpoint has 0 production vulnerabilities | repository-only state | continue patch discipline |
| Development dependency audit boundary | implemented | only known Next/ESLint lint-chain advisories accepted | repository-only state | upstream fixes or safe migration |
| Exact-head CI integrity | implemented | PR head checkout/assertion; pinned actions; no persisted credentials | repository-only state | keep enforced |
| Authentication dependency modernization | Lucia v3 currently in use | current auth/type/build gates pass | migration not performed | deliberately plan/test replacement |
| Owner-controlled Convex path | partially executed | backend health/config previously verified on dev deployment | development only | verify exact newest deployment when intentionally deployed |
| Owner-controlled Vercel/frontend path | documented | repository build passes | not provisioned/accepted | preview + authenticated acceptance |
| Billing/webhooks | substantial backend/security foundation | direct signed subscription + fulfillment + replay/download behavior coverage | not owner-live | provider/live lifecycle acceptance |
| Commercial cost calibration | instrumentation foundation exists | partial | not production-measured | measured provider/runtime economics |

## Latest exact CI truth

InventSmith CI **#210**, run `38999026644`, passed at exact code head `d01b845b489ec8a7591980fa81d69b915c82d4fc`.

Checkpoint results:

- **114 test files passed**;
- **650 tests passed**;
- production dependency audit: **0 vulnerabilities**;
- accepted development-only advisory packages limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** build passed with **32/32** static pages generated;
- Lucia `3.2.2` deprecation remains a separate auth-migration item.

This documentation refresh creates a newer head and therefore requires exact-head CI before the documentation head itself is called automatically verified.

## Immediate tracker

1. Exact-head CI for the final documentation-refresh head.
2. Provider billing lifecycle cases: cancellation, past-due, out-of-order events, real checkout/fulfillment/download and ownership-transfer acceptance.
3. Representative persisted physical/software/hybrid/regulated lifecycle acceptance through replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Artifact/rendered export and generated-format quality.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Remaining low-risk customer-facing naming cleanup.
7. Owner-controlled Vercel/Convex preparation and live acceptance only after actual deployment.
8. Provider/concurrency and commercial calibration.
9. Deliberately planned/tested Lucia migration.

PR #24 remains draft/open/unmerged; `main` remains untouched.
