# InventSmith Capability Matrix

**Updated:** October 16, 2026  
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation update:** `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`

## Status vocabulary

- **Planned** — required by the current product specification.
- **Implemented** — repository code exists.
- **Automated verification passed** — the exact relevant implementation passed deterministic checks.
- **Deployed** — the exact implementation/config is on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated behavior was exercised there.
- **Professional review completed** — genuine qualifying review was actually recorded.
- **Real-world evidence present** — genuine outside-world evidence was actually ingested/verified.
- **External action executed** — an outside-world side effect actually occurred and was separately recorded.

No overall completion percentage is asserted. The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Naming / infrastructure

Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**. The historical repository slug `jab1015/ProjectAtlas` and selected `atlas*` / `ATLAS_*` compatibility identifiers remain only where a tested migration has not yet occurred.

MadeThis is retired/historical. A Modern Methods-controlled Convex development deployment (`fiery-gazelle-628`) has the previously documented backend health/configuration checkpoint. Vercel/frontend production deployment and authenticated browser acceptance are not complete, and this documentation update does not claim the newest branch head was deployed.

## Current capability state

| Capability | Repository state | Automated state | Deployment/live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | implemented | representative regressions passed; completion semantics locked | newest head not claimed live | deeper persisted lifecycle acceptance |
| Dedicated AI agent per department | implemented: 17 stable profiles | routing/prompt/audit/fail-closed coverage passed at verified code checkpoint | Convex dev infrastructure exists; newest head not claimed deployed | provider-backed authenticated representative executions |
| Physical/software/hybrid/regulated routing | implemented | representative routing covered | not live-accepted | persisted/live acceptance |
| Organization-native tenancy/access | implemented | authorization foundation covered | not live-accepted | deeper multi-user consequential cases |
| Evidence provenance/trust | implemented | fail-closed evidence tests established | not live-calibrated | provider-backed calibration |
| Scoped evidence invalidation | implemented | prototype/quote/sales downstream invalidation covered | not live-accepted | more replacement/removal cases |
| Worker attempt/lease reliability | implemented | deterministic regressions established | not live-soak-tested | concurrency/soak |
| Usage settlement/accounting | implemented | deterministic paths covered | not production-integrated | provider interruption economics |
| Professional-review audit state | implemented | direct mutation/replay/invalidation covered | not genuinely reviewed except where real evidence exists | qualified real reviews |
| Native CAD generation foundation | implemented | worker/CAD regressions established | not engineering-live-validated | real engineering validation |
| CAD engineering maturity transition | implemented | exact revision/freshness/review/invalidation covered | not live-accepted | genuine qualified engineering review |
| Manufacturing maturity gate | implemented | latest/fresh/reviewed requirements covered | not live-accepted | representative manufacturing-readiness acceptance |
| Deliberate manufacturing release | implemented | exact synchronized generation, authorization, review, maturity, idempotency and non-execution semantics covered | not live-accepted | qualified release acceptance; supplier/order/payment remain separate |
| Real prototype/quote/launch evidence gates | implemented | direct behavior covered | only genuine outside evidence counts | representative real evidence |
| Privacy/deletion authorization | implemented | direct authorization plus account-deletion behavior coverage | not live-destructive-tested | broader direct/live destructive acceptance |
| Organization ownership/member controls | implemented | authorization coverage established | not live multi-user accepted | additional direct behavior/live cases |
| Billing-sensitive organization export | implemented | owner-only raw billing attribution enforced | billing provider not owner-live | real billing integration acceptance |
| Package external-use safety | implemented | stale/quality/exact authorization/duplicate-newest/empty-content fail-closed coverage | not live-accepted | rendered artifact QA |
| Exact-revision external-use authorization | implemented | exact latest/fresh manager authorization and non-execution semantics covered | not live multi-user accepted | persisted/live acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution-time revalidation covered | no external executor exists | preserve guard; separately audit any future executor |
| Blocked-work private-information resume | implemented | mutation-level auth/gate/replay/usage/side-effect coverage | not live-accepted | persisted acceptance |
| Production dependency security | implemented in lock/workflow | verified code checkpoint had 0 production vulnerabilities | repository-only state | continue patch discipline |
| Development dependency audit boundary | implemented | only known Next/ESLint lint-chain advisories accepted; unexpected packages fail CI | repository-only state | upstream fixes or safe migration |
| Exact-head CI integrity | implemented | workflow checks out/asserts PR head; actions pinned; credentials not persisted | repository-only state | keep enforced |
| Owner-controlled Convex path | partially executed | backend health/config previously verified on dev deployment | Convex development only | verify newest intended deployment when actually deployed |
| Owner-controlled Vercel/frontend path | documented | repository build passes | not provisioned/accepted | preview + authenticated acceptance |
| Billing/webhooks | backend/security foundation exists | security/idempotency foundations present | not owner-live | select/configure provider and test real events |
| Commercial cost calibration | instrumentation foundation exists | partial | not production-measured | measured provider/runtime economics |

## Latest exact CI truth

InventSmith CI **#136**, run `38990243845`, passed at exact code head `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`.

Successful gates included exact-head checkout/verification, dependency installation, operational-script checks, web TypeScript, Convex TypeScript, regression tests, production dependency audit, development dependency audit boundary, and Next production build.

Checkpoint results:

- 101 test files passed;
- 571 tests passed;
- production dependency audit: 0 vulnerabilities;
- accepted development-only advisory packages limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js 15.5.27 build passed with 32/32 static pages generated.

The documentation commits made after that code checkpoint require their own exact-head CI before the documentation head itself is called automatically verified.

## Immediate tracker

1. Exact-head CI for the newest documentation head.
2. More direct destructive/privacy/billing/organization-management/external-use behavior tests.
3. Representative persisted physical/software/hybrid/regulated lifecycle acceptance through replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Artifact/rendered export and generated-format quality.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Remaining low-risk customer-facing naming cleanup.
7. Owner-controlled Vercel/Convex preparation and then live acceptance when actually provisioned/deployed.
8. Billing/provider/concurrency and commercial calibration.
9. Lower-risk tooling debt such as Lucia v3 deprecation and Vitest config-loader warning, handled without destabilizing auth or weakening controls.

PR #24 remains draft/open/unmerged; `main` remains untouched.
