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
| Complete applicable journey/navigation | implemented | representative regressions passed | not deployed | deeper persisted state-transition acceptance |
| Physical/software/hybrid/regulated classification | implemented | representative routing covered | not deployed | live acceptance |
| Organization-native tenancy/access | implemented | authorization foundation covered | not deployed | deeper consequential runtime cases |
| Evidence provenance/trust | implemented | fail-closed evidence tests established | not deployed | live provider calibration |
| Scoped evidence invalidation | implemented | prototype/quote/sales downstream scope covered | not deployed | additional replacement/removal cases |
| Worker attempt/lease reliability | implemented | deterministic regressions established | not deployed | concurrency/soak |
| Usage settlement/accounting | implemented | deterministic paths covered, including org blocked-work resume | not deployed | provider interruption economics |
| Professional-review audit state | implemented | direct mutation/replay/invalidation behavior covered | not deployed | genuine qualified reviews |
| Native CAD generation foundation | implemented | worker/CAD regressions established | not deployed | real engineering validation |
| CAD engineering maturity transition | implemented | exact revision/freshness/specialty/sibling/invalidation behavior covered | not deployed | genuine qualified engineering review |
| Manufacturing maturity gate | implemented | latest/fresh/reviewed requirements covered | not deployed | deliberate manufacturing-release transition remains separate |
| Real prototype/quote/launch evidence gates | implemented | direct behavior covered | not deployed | genuine evidence in live journeys |
| Privacy/deletion authorization | implemented | expanded backend authorization coverage | not deployed | live destructive acceptance |
| Organization ownership/member controls | implemented | expanded authorization coverage | not deployed | live multi-user acceptance |
| Billing-sensitive organization export | implemented | owner-only raw billing attribution enforced | not deployed | owner billing integration acceptance |
| Package external-use safety | implemented | stale/quality/exact authorization fail-closed tests established | not deployed | rendered artifact QA |
| Exact-revision external-use authorization | implemented | manager authorization, duplicate-latest rejection, idempotency and Work Library UI covered | not deployed | live multi-user acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution revalidation tests passed at `530b5757` | not deployed | migrate remaining legacy callers; audit all real execution paths |
| Blocked-work private-information resume | implemented | mutation-level authorization, gate, replay, usage and side-effect tests passed | not deployed | live persisted acceptance |
| Fresh owner-controlled deployment path | documented | readiness scripts/build checks exist | not provisioned | create owner Vercel/Convex and execute runbook |
| Billing/webhooks | backend foundation exists | security/idempotency foundations reviewed | not owner-live | select/configure owner billing provider and test real events |
| Commercial cost calibration | instrumentation foundation | partial | not live | measured runtime/provider economics |

## Latest CI truth

InventSmith CI #78, run `34997848353`, passed at exact head `530b5757fe9e6c762f03967de60547ac383c12ff`: dependency installation, operational-script checks, web TypeScript, Convex TypeScript, regression tests, production dependency audit, and Next production build all passed.

Documentation and hardening commits newer than that checkpoint require their own exact-head CI before they can be called automatically verified.

## Immediate tracker

1. Exact-head CI for the newest docs/hardening head.
2. Migrate remaining legacy approval UI/callers to the guarded consequential approval mutation.
3. Audit RFQ/manufacturer/external-sharing execution for exact current artifact scope and approval revalidation.
4. Implement deliberate manufacturing release separately from engineering review/external authorization/order/payment.
5. Deeper behavioral authorization and cross-organization tests.
6. Representative lifecycle state-transition acceptance.
7. Artifact/rendered export and generated-format quality.
8. Remaining low-risk customer-facing naming cleanup.
9. Owner-controlled deployment preparation, then live acceptance.
10. Billing/provider/concurrency and commercial calibration.

PR #24 remains draft/open/unmerged; `main` remains untouched.
