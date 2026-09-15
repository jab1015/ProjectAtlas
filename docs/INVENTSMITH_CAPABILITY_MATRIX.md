# InventSmith Capability Matrix

**Updated:** September 15, 2026  
**Branch:** `inventsmith/full-product-build`  
**Purpose:** Track implementation and acceptance dimensions independently while also providing a founder planning estimate.

## Planning completion snapshot

- **Name conversion:** ~96%
- **Repository implementation + hardening:** ~88%
- **Automated qualification:** ~85%
- **Owner-controlled deployment/live acceptance:** 0%
- **Weighted overall path to production acceptance:** ~72%

These are planning estimates, not production-readiness claims. Deployment, live verification and genuine professional/real-world evidence remain independent gates.

## Status vocabulary

- **Planned** — required by the master specification.
- **Implemented** — repository code exists.
- **Automated verification passed** — exact relevant implementation passed deterministic checks.
- **Deployed** — exact implementation/config is on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated behavior was exercised there.
- **Professional review** — required/completed separately where applicable.

## Naming / infrastructure

Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**. The historical GitHub slug `jab1015/ProjectAtlas` and selected `atlas*` / `ATLAS_*` compatibility identifiers remain intentionally until a separately tested migration is justified. MadeThis is retired. Owner-controlled Vercel and Convex are not yet deployed.

## Current capability state

| Capability | Implemented | Automated state | Live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | yes | representative regressions passed on preceding qualified lines | not deployed | deeper state-transition acceptance |
| Physical/software/hybrid/regulated classification | yes | representative routing covered | not deployed | live acceptance |
| Organization-native tenancy/access | yes | authorization foundation covered | not deployed | deeper consequential runtime cases |
| Evidence provenance/trust | yes | fail-closed evidence tests established | not deployed | live provider calibration |
| Scoped evidence invalidation | yes | prototype/quote/sales downstream scope covered | not deployed | additional replacement/removal cases |
| Worker attempt/lease reliability | yes | deterministic regressions established | not deployed | concurrency/soak |
| Usage settlement/accounting | yes | deterministic paths covered | not deployed | provider interruption economics |
| Professional-review audit state | yes | deterministic review behavior covered | not deployed | genuine qualified reviews |
| Native CAD generation foundation | yes | worker/CAD regressions established | not deployed | maturity promotion + real engineering validation |
| Manufacturing maturity gate | yes | fail-closed latest/fresh/reviewed requirements added | not deployed | prove achievable CAD maturity transition and manufacturing release |
| Real prototype/quote/launch evidence gates | yes | direct behavior covered | not deployed | genuine evidence in live journeys |
| Privacy/deletion authorization | yes | expanded backend authorization coverage | not deployed | live destructive acceptance |
| Organization ownership/member controls | yes | expanded authorization coverage | not deployed | live multi-user acceptance |
| Billing-sensitive organization export | yes | owner-only raw billing attribution enforced | not deployed | owner billing integration acceptance |
| Package external-use safety | yes | stale/quality/authorization fail-closed tests established | not deployed | rendered artifact QA |
| Blocked-work consequential gate protection | corrected implementation in progress | newest source correction awaiting exact-head CI at documentation update | not deployed | restore safe typed private-information path without bypassing consequential gates |
| Fresh owner-controlled deployment path | documented | readiness scripts/build checks exist | not provisioned | create Modern Methods Vercel/Convex and execute runbook |
| Billing/webhooks | backend foundation exists | security/idempotency foundations reviewed | not owner-live | select/configure owner billing provider and test real events |
| Commercial cost calibration | instrumentation foundation | partial | not live | measured runtime/provider economics |

## Latest CI truth

A preceding qualified line, including InventSmith CI #10 at `c350b2d`, passed. Exact-head InventSmith CI #12 for `6ec9fe87f0643c6f4d664c48ab39f591b8f60947` failed at Convex TypeScript because `inventionWorkspace.ts` referenced nonexistent `professionalReviews.reviewArea`. The edit was corrected at source head `36ef66392a31a93573d4fb5a25697bd75c0b7927` before this documentation refresh.

Do not mark the corrected/new documentation head fully verified until exact-head CI passes.

## Immediate tracker

1. Exact-head CI recovery.
2. Safe blocked-work private-information/input resume path; all consequential gates remain fail-closed.
3. Native-CAD `engineering_reviewed` transition after accepted qualified engineering review; keep `manufacturing_released` separate.
4. RFQ/manufacturer/external-sharing approval audit.
5. Deeper behavioral authorization tests.
6. Deeper representative lifecycle state-transition acceptance.
7. Artifact/rendered export quality.
8. Remaining low-risk customer-facing naming cleanup.
9. Owner-controlled deployment preparation, then live acceptance.
10. Billing/provider/concurrency and commercial calibration.

PR #24 remains draft/open/unmerged; `main` remains untouched.