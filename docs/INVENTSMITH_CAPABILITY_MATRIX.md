# InventSmith Capability Matrix

**Updated:** October 16, 2026 (America/New_York)  
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation refresh:** `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`

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

MadeThis is retired/historical. A Modern Methods-controlled Convex development deployment (`fiery-gazelle-628`) has the previously documented backend health/configuration checkpoint. The newest branch head is not claimed deployed there. Modern Methods-owned Vercel/frontend deployment and authenticated browser acceptance remain separate incomplete steps.

## Current capability state

| Capability | Repository state | Automated state | Deployment/live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | implemented | representative regressions passed; completion semantics locked | newest head not claimed live | deeper persisted lifecycle acceptance |
| Dedicated AI agent per department | implemented: 17 stable profiles | routing/prompt/audit/fail-closed coverage passed | Convex dev infrastructure exists; newest head not claimed deployed | provider-backed authenticated representative executions |
| Physical/software/hybrid/regulated routing | implemented | representative routing covered | not live-accepted | persisted/live acceptance |
| Organization-native tenancy/access | implemented | authorization plus ownership/member behavior coverage | not live multi-user accepted | deeper consequential multi-user cases |
| Secure organization invitations | implemented | exact account/email binding, expiry, current seat capacity, create/reactivate behavior directly tested | not live multi-user accepted | authenticated live acceptance |
| Evidence provenance/trust | implemented | fail-closed evidence tests established | not live-calibrated | provider-backed calibration |
| Scoped evidence invalidation | implemented | prototype/quote/sales downstream invalidation covered | not live-accepted | more replacement/removal cases |
| Worker attempt/lease reliability | implemented | deterministic regressions established | not live-soak-tested | concurrency/soak |
| Usage settlement/accounting | implemented | deterministic paths covered | not production-integrated | provider interruption economics |
| Professional-review audit state | implemented | direct mutation/replay/invalidation covered | no generalized claim of genuine review | qualified real reviews |
| Native CAD generation foundation | implemented | worker/CAD regressions established | not engineering-live-validated | real engineering validation |
| CAD engineering maturity transition | implemented | exact revision/freshness/review/invalidation covered | not live-accepted | genuine qualified engineering review |
| Manufacturing maturity gate | implemented | latest/fresh/reviewed requirements covered | not live-accepted | representative manufacturing-readiness acceptance |
| Deliberate manufacturing release | implemented | exact generation, authorization, review, maturity, idempotency/non-execution covered | not live-accepted | qualified release acceptance; supplier/order/payment remain separate |
| Real prototype/quote/launch evidence gates | implemented | direct behavior covered | only genuine outside evidence counts | representative real evidence |
| Account deletion/privacy request execution | implemented | administrator/terminal/billing/ownership guards and execution ordering directly tested | not live-destructive-tested | live destructive acceptance with disposable data |
| Personal privacy export scoping | implemented | company/studio data exclusion, personal-org ownership and billing-event scoping directly tested | not live-accepted | representative exported-package inspection |
| Organization member controls | implemented | manager authority, owner protection, inactive/self-removal and exact writes directly tested | not live multi-user accepted | live role/removal acceptance |
| Organization ownership transfer | implemented | personal-org/inactive-target/idempotent/success transitions directly tested | not live multi-user accepted | live transfer acceptance |
| Billing-sensitive organization export | implemented | Admin does not query raw billing events; Owner-bound attribution covered | billing provider not owner-live | real billing integration acceptance |
| Package external-use safety | implemented | stale/quality/exact authorization/duplicate-newest/empty-content fail-closed coverage | not live-accepted | rendered artifact QA |
| Exact-revision external-use authorization | implemented | exact latest/fresh manager authorization and non-execution semantics covered | not live multi-user accepted | persisted/live acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution-time revalidation covered | no external executor exists | preserve guard; separately audit any future executor |
| Blocked-work private-information resume | implemented | mutation-level auth/gate/replay/usage/side-effect coverage | not live-accepted | persisted acceptance |
| Production dependency security | implemented in lock/workflow | exact verified checkpoint has 0 production vulnerabilities | repository-only state | continue patch discipline |
| Development dependency audit boundary | implemented | only known Next/ESLint lint-chain advisories accepted | repository-only state | upstream fixes or safe migration |
| Exact-head CI integrity | implemented | workflow checks out/asserts PR head; actions pinned; credentials not persisted | repository-only state | keep enforced |
| Vitest config-loader compatibility | implemented | warning removed using `.mts` + `import.meta.dirname` | repository/tooling state | keep current with future Vite changes |
| Authentication dependency modernization | Lucia v3 currently in use | current auth/type/build gates pass | current runtime migration not performed | deliberately plan/test Lucia replacement |
| Owner-controlled Convex path | partially executed | backend health/config previously verified on dev deployment | Convex development only | verify exact newest deployment when intentionally deployed |
| Owner-controlled Vercel/frontend path | documented | repository build passes | not provisioned/accepted | preview + authenticated acceptance |
| Billing/webhooks | backend/security foundation exists | security/idempotency foundations present | not owner-live | select/configure provider and test real events |
| Commercial cost calibration | instrumentation foundation exists | partial | not production-measured | measured provider/runtime economics |

## Latest exact CI truth

InventSmith CI **#165**, run `38994705687`, passed at exact code head `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`.

Checkpoint results:

- **107 test files passed**;
- **603 tests passed**;
- production dependency audit: **0 vulnerabilities**;
- accepted development-only advisory packages limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** build passed with **32/32** static pages generated;
- previous Vitest native-loader warnings are removed;
- Lucia `3.2.2` deprecation remains an explicitly separate auth-migration item.

This documentation refresh creates a newer head and therefore requires exact-head CI before the documentation head itself is called automatically verified.

## Immediate tracker

1. Exact-head CI for the final documentation-refresh head.
2. Carefully expand destructive invention-deletion behavior coverage without duplicating/weakening the existing cleanup/accounting algorithm.
3. Representative persisted physical/software/hybrid/regulated lifecycle acceptance through replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Artifact/rendered export and generated-format quality.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Remaining low-risk customer-facing naming cleanup.
7. Owner-controlled Vercel/Convex preparation and live acceptance only after actual deployment.
8. Billing/provider/concurrency and commercial calibration.
9. Deliberately planned/tested Lucia migration.

PR #24 remains draft/open/unmerged; `main` remains untouched.
