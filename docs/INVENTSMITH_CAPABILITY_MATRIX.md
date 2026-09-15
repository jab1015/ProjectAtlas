# InventSmith Capability Matrix

**Updated:** September 15, 2026  
**Branch:** `inventsmith/full-product-build`  
**Purpose:** Track implementation and acceptance dimensions independently from deployment and professional/real-world evidence.

## Status vocabulary

- **Planned** — required by the master specification.
- **Implemented** — repository code exists.
- **Automated verification passed** — exact relevant implementation passed deterministic checks.
- **Deployed** — exact implementation/config is on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated behavior was exercised there.
- **Professional review required/completed** — tracked separately where applicable.

No overall completion percentage is asserted. Repository implementation, deterministic verification, deployment, live functional acceptance, professional review, and real-world evidence are separate gates and must not be collapsed into a single percentage.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Naming / infrastructure

Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**. The historical repository slug `jab1015/ProjectAtlas` and selected `atlas*` / `ATLAS_*` compatibility identifiers remain intentionally until a separately tested migration is justified. MadeThis is retired. Owner-controlled Vercel and Convex are not yet deployed.

## Current capability state

| Capability | Repository state | Automated state | Live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | implemented | representative regressions passed; completion semantics regression-locked | not deployed | deeper persisted state-transition acceptance |
| Physical/software/hybrid/regulated classification | implemented | representative routing covered | not deployed | live acceptance |
| Organization-native tenancy/access | implemented | authorization foundation covered | not deployed | deeper consequential runtime cases |
| Evidence provenance/trust | implemented | fail-closed evidence tests established | not deployed | live provider calibration |
| Scoped evidence invalidation | implemented | prototype/quote/sales downstream scope covered, including quote and launch evidence removal behavior | not deployed | additional replacement/removal cases |
| Worker attempt/lease reliability | implemented | deterministic regressions established | not deployed | concurrency/soak |
| Usage settlement/accounting | implemented | deterministic paths covered, including org blocked-work resume | not deployed | provider interruption economics |
| Professional-review audit state | implemented | direct mutation/replay/invalidation behavior covered | not deployed | genuine qualified reviews |
| Native CAD generation foundation | implemented | worker/CAD regressions established | not deployed | real engineering validation |
| CAD engineering maturity transition | implemented | exact revision/freshness/specialty/sibling/invalidation behavior covered | not deployed | genuine qualified engineering review |
| Manufacturing maturity gate | implemented | latest/fresh/reviewed requirements covered | not deployed | live representative manufacturing-readiness acceptance |
| Deliberate manufacturing release | implemented | exact synchronized generation, authorization, professional-review, maturity, idempotency and non-execution semantics covered | not deployed | live qualified release acceptance; supplier/order/payment remain separate |
| Real prototype/quote/launch evidence gates | implemented | direct behavior covered, including launch-evidence removal re-blocking | not deployed | genuine evidence in live journeys |
| Privacy/deletion authorization | implemented | expanded backend authorization coverage | not deployed | live destructive acceptance |
| Organization ownership/member controls | implemented | expanded authorization coverage | not deployed | live multi-user acceptance |
| Billing-sensitive organization export | implemented | owner-only raw billing attribution enforced | not deployed | owner billing integration acceptance |
| Package external-use safety | implemented | stale/quality/exact authorization fail-closed tests established | not deployed | rendered artifact QA |
| Exact-revision external-use authorization | implemented | manager authorization, duplicate-latest rejection, idempotency, Work Library UI and non-execution audit covered | not deployed | live multi-user acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution revalidation plus non-execution approval audit passed by exact-head CI | not deployed | audit remaining real execution paths and callers |
| Blocked-work private-information resume | implemented | mutation-level authorization, gate, replay, usage and side-effect tests passed | not deployed | live persisted acceptance |
| Fresh owner-controlled deployment path | documented | readiness scripts/build checks exist | not provisioned | create owner Vercel/Convex and execute runbook |
| Billing/webhooks | backend foundation exists | security/idempotency foundations reviewed | not owner-live | select/configure owner billing provider and test real events |
| Commercial cost calibration | instrumentation foundation | partial | not live | measured runtime/provider economics |

## Latest CI truth

InventSmith CI #106, run `35017774702`, passed at exact code head `11be8a28f240a03bb960b8410a9261262e26f07a`: dependency installation, operational-script checks, web TypeScript, Convex TypeScript, regression tests, production dependency audit, and Next production build all passed.

That verified code checkpoint includes deliberate manufacturing release, explicit non-execution audit semantics across approval/external-use/manufacturing-release transitions, launch-evidence-removal behavior, and tightened Journey/dashboard/department/status completion language. Documentation commits newer than that checkpoint require their own exact-head CI before the documentation head itself can be called automatically verified.

## Immediate tracker

1. Exact-head CI for the newest documentation head.
2. Finish migration of any remaining legacy approval UI/callers to the guarded consequential approval mutation where such callers still exist.
3. Continue auditing RFQ/manufacturer/external-sharing execution for exact current artifact scope, approval revalidation and a hard permission-versus-execution distinction.
4. Deeper behavioral authorization and cross-organization tests.
5. Representative lifecycle state-transition acceptance, including manufacturing release and subsequent external-action boundaries.
6. Artifact/rendered export and generated-format quality.
7. Remaining low-risk customer-facing naming cleanup.
8. Owner-controlled deployment preparation, then live acceptance.
9. Billing/provider/concurrency and commercial calibration.

PR #24 remains draft/open/unmerged; `main` remains untouched.