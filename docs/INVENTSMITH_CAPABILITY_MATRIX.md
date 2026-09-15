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
| Usage settlement/accounting | implemented | deterministic paths covered | not deployed | provider interruption economics |
| Professional-review audit state | implemented | deterministic review behavior covered | not deployed | genuine qualified reviews |
| Native CAD generation foundation | implemented | worker/CAD regressions established | not deployed | real engineering validation |
| CAD engineering maturity transition | implemented | exact revision/freshness/specialty/invalidation regression coverage; exact-head CI pending for latest invalidation commit | not deployed | genuine qualified engineering review |
| Manufacturing maturity gate | implemented | latest/fresh/reviewed requirements covered | not deployed | manufacturing release remains a separate authorization boundary |
| Real prototype/quote/launch evidence gates | implemented | direct behavior covered | not deployed | genuine evidence in live journeys |
| Privacy/deletion authorization | implemented | expanded backend authorization coverage | not deployed | live destructive acceptance |
| Organization ownership/member controls | implemented | expanded authorization coverage | not deployed | live multi-user acceptance |
| Billing-sensitive organization export | implemented | owner-only raw billing attribution enforced | not deployed | owner billing integration acceptance |
| Package external-use safety | implemented | stale/quality/authorization fail-closed tests established | not deployed | rendered artifact QA |
| Blocked-work private-information resume | implemented | exact-head CI passed at `d103d72b`; mutation-level side-effect acceptance still required | not deployed | persisted handler integration coverage |
| Fresh owner-controlled deployment path | documented | readiness scripts/build checks exist | not provisioned | create owner Vercel/Convex and execute runbook |
| Billing/webhooks | backend foundation exists | security/idempotency foundations reviewed | not owner-live | select/configure owner billing provider and test real events |
| Commercial cost calibration | instrumentation foundation | partial | not live | measured runtime/provider economics |

## Latest CI truth

InventSmith CI #23 passed at exact source head `d103d72b96429d9ceabe73e52d54f34b351e6094`: dependency installation, operational-script checks, web TypeScript, Convex TypeScript, regression tests, production dependency audit, and Next production build all passed.

Subsequent CAD invalidation hardening commits require their own exact-head CI before they can be called automatically verified.

## Immediate tracker

1. Exact-head CI for CAD invalidation hardening.
2. Mutation-level persisted blocked-work acceptance including rejection side effects and replay.
3. Professional-review mutation acceptance including exact CAD revision promotion/invalidation.
4. RFQ/manufacturer/external-sharing approval audit.
5. Deeper behavioral authorization and cross-organization tests.
6. Representative lifecycle state-transition acceptance.
7. Artifact/rendered export quality.
8. Remaining low-risk customer-facing naming cleanup.
9. Owner-controlled deployment preparation, then live acceptance.
10. Billing/provider/concurrency and commercial calibration.

PR #24 remains draft/open/unmerged; `main` remains untouched.
