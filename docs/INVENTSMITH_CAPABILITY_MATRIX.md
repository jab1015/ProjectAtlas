# InventSmith Capability Matrix

**Updated:** October 16, 2026
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

Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**. The historical repository slug `jab1015/ProjectAtlas` and selected `atlas*` / `ATLAS_*` compatibility identifiers remain intentionally until a separately tested migration is justified. MadeThis is retired. Owner-controlled Convex development is configured and backend-health verified; Vercel/frontend production deployment and authenticated acceptance are not complete.

## Current capability state

| Capability | Repository state | Automated state | Live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | implemented | representative regressions passed; completion semantics regression-locked | not deployed | deeper persisted state-transition acceptance |
| Dedicated AI agent per department | implemented: 17 stable department profiles with unique identity, mission and guardrails; shared provider infrastructure | local 568-test suite includes complete physical/hybrid/software routing, prompt binding, audit metadata and fail-closed unknown routing | deployed to Convex development; provider-backed representative acceptance not yet run | exact-head CI and authenticated representative department executions |
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
| Package external-use safety | implemented | stale/quality/exact authorization, duplicate-newest ambiguity, and empty-content fail-closed tests established | not deployed | rendered artifact QA |
| Exact-revision external-use authorization | implemented | manager authorization, duplicate-latest rejection, idempotency, Work Library UI and non-execution audit covered | not deployed | live multi-user acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution revalidation plus non-execution approval audit passed by exact-head CI; all current resolution callers converge on guarded handler | not deployed | no external executor exists; guard and separately audit any future executor |
| Blocked-work private-information resume | implemented | mutation-level authorization, gate, replay, usage and side-effect tests passed | not deployed | live persisted acceptance |
| Fresh owner-controlled deployment path | documented and partially executed | Convex functions deployed; backend health confirms database, OpenAI and auth configuration | Convex development ready; frontend absent | Vercel/frontend, webhooks, monitoring/backup ownership and authenticated acceptance |
| Billing/webhooks | backend foundation exists | security/idempotency foundations reviewed | not owner-live | select/configure owner billing provider and test real events |
| Commercial cost calibration | instrumentation foundation | partial | not live | measured runtime/provider economics |

## Latest CI truth

InventSmith CI #118 passed at exact pre-change head `79e37ecdd60ccedfadab8dbe721cc9bac5b69f69`. Current department-agent/deployment changes pass local TypeScript, `git diff --check`, and all 568 regression tests; they require exact-head CI after commit/push.

That verified code checkpoint includes deliberate manufacturing release, explicit non-execution audit semantics across approval/external-use/manufacturing-release transitions, launch-evidence-removal behavior, and tightened Journey/dashboard/department/status completion language. Documentation commits newer than that checkpoint require their own exact-head CI before the documentation head itself can be called automatically verified.

## Immediate tracker

1. Exact-head CI for the newest documentation head.
2. Deeper behavioral destructive/privacy/billing/organization and cross-organization tests.
3. Representative persisted lifecycle acceptance, including replacement/removal, newest-revision invalidation, manufacturing release and subsequent external-action boundaries.
4. Artifact/rendered export and generated-format quality.
5. Guard and separately audit any future external-action executor; none exists in the current repository.
6. Remaining low-risk customer-facing naming cleanup.
7. Owner-controlled deployment preparation, then live acceptance.
8. Billing/provider/concurrency and commercial calibration.

PR #24 remains draft/open/unmerged; `main` remains untouched.
