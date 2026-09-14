# InventSmith Capability Matrix

**Updated:** September 14, 2026  
**Branch:** `inventsmith/full-product-build`  
**Purpose:** Track capability status without inventing an overall completion percentage.

## Status vocabulary

Each capability is tracked independently:

- **Planned** — required by the master product specification.
- **Implemented** — repository code supporting the capability exists on the branch.
- **Automated verification passed** — the exact relevant code has passed deterministic automated checks. A historical green run does not automatically verify later changes.
- **Deployed** — exact implementation/configuration is deployed to the owner-controlled environment.
- **Live functionally verified** — authenticated representative behavior has been exercised successfully on that deployment.
- **Professional review** — `not applicable`, `required`, or `completed` based on the artifact/capability.

## Current infrastructure boundary

Owner-controlled Vercel and Convex are **not yet deployed**. Therefore no capability is currently marked owner-controlled `deployed` or `live functionally verified` in this matrix. The former MadeThis runtime is intentionally outside the acceptance path and is not counted as deployment evidence.

## Foundation / trust / runtime matrix

| Capability | Planned | Implemented | Automated verification passed | Deployed | Live functionally verified | Professional review | Current evidence / gap |
|---|---|---|---|---|---|---|---|
| 15-stage journey visibility/navigation | yes | yes | historical branch coverage; exact current head pending CI | no | no | n/a | `journey-map.tsx` exposes all 15 stages and routes later stages to dependency-aware workspaces. |
| Validation mixed success/failure truth | yes | yes, current batch | exact current head pending CI | no | no | n/a | Runner now distinguishes `PARTIAL`; UI/shared type contract and regression test added. |
| Validation targeted retry preserving successful sections | yes | partial | no | no | no | n/a | Failed sections remain explicit; targeted failed-only execution still requires completion. |
| Context-only validation confidence honesty | yes | yes, current batch | exact current head pending CI | no | no | n/a | Fixed 0.75/high removed; context-only confidence is conservative and labels AI inference/unverified external claims. |
| Claim/source evidence integrity | yes | partial | prior regression coverage exists; stronger retrieval-binding tests pending | no | no | n/a | URL sanitization/freshness/source coverage exist, but evidence-verification promotion still needs binding to actual retrieval execution/claim support rather than model labels alone. |
| Usage accounting across success/failure/human gate/retry | yes | partial | prior accounting tests exist; identified defect remains | no | no | n/a | Successful/stale-output settlement is implemented; `failWork`/`blockWorkForHuman` still settle zero in paths that may have already incurred model cost. |
| Backend behavioral authorization/isolation | yes | implemented foundation | existing behavioral coverage requires focused re-verification on current head | no | no | n/a | Organization-native backend guards and authorization tests exist; current batch will re-check unauthenticated, cross-tenant, admin and entitlement behavior. |
| Worker lease/attempt/late-response reliability | yes | partial/implemented foundation | existing worker regressions require focused re-review | no | no | n/a | Leases/retries/stale-input handling exist; attempt identity and late-response behavior remain under Phase 1G review. |
| Production provider unavailable behavior | yes | partial | pending focused test | no | no | n/a | Main work orchestrator fails if AI credentials are absent; legacy validation provider/factory paths need final mock-fallback audit. |
| Fresh owner-controlled deployment path | yes | documentation implemented | documentation/static CI pending current head | no | no | n/a | Deployment runbook now targets owner Vercel + Convex and explicitly retires MadeThis synchronization. |

## Core inventor experience

| Capability | Planned | Implemented | Automated verification passed | Deployed | Live functionally verified | Professional review | Current evidence / gap |
|---|---|---|---|---|---|---|---|
| Sign in / session | yes | repository foundation | historical tests/build only | no | no | n/a | Fresh Convex Auth deployment and live acceptance pending. |
| Create/classify invention | yes | yes | historical branch regressions | no | no | n/a | Physical/software/hybrid/regulated/unsupported/business-only routing exists. |
| Evidence upload/original preservation | yes | yes | historical regression coverage | no | no | n/a | Binary ingestion/extraction/retry foundation exists; live PDF/DOCX/XLSX/image acceptance pending. |
| Evidence provenance / processing states / invalidation | yes | yes | historical branch coverage | no | no | n/a | Canonical evidence and downstream staleness foundations exist; retrieval-trust hardening remains open as above. |
| Validation / market / prior-art research | yes | yes with open trust fixes | mixed-state/confidence changes pending exact-head CI | no | no | legal/patent professional review required for consequential conclusions | Current Phase 1B/C/D work is correcting truth boundaries. |
| Decision/review workflow | yes | yes | historical branch coverage | no | no | depends on decision | Consequential approvals retain server-side gates. |
| Versioned downloadable packages | yes | yes | historical export tests | no | no | depends on contents | PDF/DOCX and other artifact foundations exist; representative rendered QA pending. |
| Ask InventSmith grounded in invention record | yes | yes | historical regressions | no | no | n/a | Grounded/canonical write-back foundation exists; live-provider execution claims remain acceptance item. |

## Product design / engineering

| Capability | Planned | Implemented | Automated verification passed | Deployed | Live functionally verified | Professional review | Current evidence / gap |
|---|---|---|---|---|---|---|---|
| Requirements → design candidates → comparison/selection | yes | yes | historical full-product regression coverage | no | no | engineering review required for consequential release | Implemented physical Product Design flow. |
| Concept Visualization maturity | yes | yes | historical tests | no | no | not required for concept visualization | Must remain clearly distinct from CAD/release. |
| Preliminary native CAD | yes, supported categories only | yes foundation | historical CAD regressions | no | no | qualified engineering review required before release claims | STEP/STL/DXF/editable source foundations exist for explicitly supported geometry. |
| Prototype Candidate | yes | workflow/evidence gates implemented | historical tests | no | no | engineering/prototype evidence required | AI output cannot fabricate physical test evidence. |
| Engineering Reviewed | yes | gate/record foundation | historical tests | no | no | required and not globally completed | Must be backed by actual reviewer records. |
| Manufacturing Released | yes | gate foundation | historical tests | no | no | required where applicable and not globally completed | Cannot be inferred from generated CAD/specifications. |

## Commercial journey

| Capability | Planned | Implemented | Automated verification passed | Deployed | Live functionally verified | Professional review | Current evidence / gap |
|---|---|---|---|---|---|---|---|
| Prototype/testing and evidence-driven revision | yes | yes foundation | historical tests | no | no | engineering review where applicable | Genuine test evidence still required in real journeys. |
| Manufacturing/RFQ/quote comparison | yes | yes foundation | historical tests | no | no | specialist review may apply | Genuine supplier quote gate remains mandatory. |
| IP/legal preparation/routing | yes | yes | historical tests | no | no | qualified legal/patent review required for consequential advice | No patentability/FTO/legal approval claims. |
| Branding/positioning/assets | yes | yes | historical tests | no | no | trademark/legal review where appropriate | Generated brand artifacts require visual QA. |
| Pricing/unit economics | yes | yes | historical tests | no | no | financial/professional review depending use | Modeled inputs must not masquerade as quotes/actuals. |
| Marketing/sales | yes | yes | historical tests | no | no | n/a | Must remain invention/evidence-specific. |
| Funding / pitch / financial artifacts | yes | yes | historical artifact tests | no | no | financial/legal review depending use | Editable PPTX and spreadsheet foundations exist. |
| Launch/growth | yes | yes workflow foundation | historical tests | no | no | n/a | Actual-performance analysis requires genuine post-launch evidence. |

## Hosting / external integration blockers

| Item | Repository work possible now | Live credential/infrastructure blocker |
|---|---|---|
| GitHub CI | yes | none for PR verification |
| Fresh Convex project/auth/storage/scheduled work | source/docs/tests yes | owner Convex account/project/secure env values required for deployment |
| Fresh Vercel project | source/docs/build yes | owner Vercel project and public Convex URL required for deployment |
| OpenAI live checks | deterministic provider tests yes | server API key required for live provider execution |
| Paid checkout/billing/webhooks | adapter hardening/docs yes | owner-selected billing integration/secrets required; do not bypass entitlement while absent |
| Custom domain/DNS | not required for current source work | intentionally deferred; no DNS changes authorized |

## Immediate Phase 1 tracker

1. **A Journey after foundation:** verified implemented; preserve dependency gates.
2. **B Partial validation:** mixed-state fix implemented; finish targeted failed-section retry and verify exact-head CI.
3. **C Fixed confidence:** fixed in current batch; exact-head CI pending.
4. **D Evidence promotion:** open — bind promotion to actual retrieval execution/claim support and add fabricated-citation/prompt-injection regressions.
5. **E Usage accounting:** open — propagate known incurred cost into failed/human-gated settlement; preserve unknown-vs-zero distinction and single settlement.
6. **F Behavioral security:** re-verify existing runtime tests and add missing behavioral cases if source-string checks remain material.
7. **G Worker reliability:** re-review attempt identity, late response, duplicate completion, timeouts/cancellation, stale inputs, retry/storage cleanup and bounded context/output.

Update this file after each cohesive batch with exact CI evidence rather than an overall completion percentage.
