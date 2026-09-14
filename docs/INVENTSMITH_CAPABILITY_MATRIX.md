# InventSmith Capability Matrix

**Updated:** September 14, 2026  
**Branch:** `inventsmith/full-product-build`  
**Purpose:** Track capability status without inventing an overall completion percentage.

## Status vocabulary

Each capability is tracked independently:

- **Planned** — required by the master product specification.
- **Implemented** — repository code supporting the capability exists on the branch.
- **Automated verification passed** — the exact relevant implementation has passed deterministic automated checks. A historical green run does not automatically verify later changes.
- **Deployed** — exact implementation/configuration is deployed to owner-controlled infrastructure.
- **Live functionally verified** — authenticated representative behavior has been exercised successfully on that deployment.
- **Professional review** — `not applicable`, `required`, or `completed` based on the artifact/capability.

## Naming and infrastructure boundary

The current product is **InventSmith — The Inventor OS**. Former-name wording is historical/compatibility-only. The GitHub repository currently retains the historical slug `jab1015/ProjectAtlas`; that slug does not define the customer-facing product name.

Owner-controlled Vercel and Convex are **not yet deployed**. Therefore no capability is currently marked owner-controlled `deployed` or `live functionally verified`. The former MadeThis runtime is intentionally outside the acceptance path and is not counted as deployment evidence.

## Latest verified implementation checkpoint

**Exact verified clean documentation checkpoint:** `c76e209da0c1dd4266ee59157f740c4297048322`  
**Workflow run:** #586 / run ID `34907940666`  
**Result:** PASS across dependency installation, operational-script checks, web TypeScript, Convex TypeScript, full regression suite, production dependency audit, and Next.js production build.

Later final documentation-content normalization and historical-name corrections advance the branch beyond that checkpoint. The live branch/PR exact-head CI must be checked before a newer head is described as fully verified.

## Foundation / trust / runtime matrix

| Capability | Planned | Implemented | Automated verification | Deployed | Live verified | Professional review | Current evidence / remaining boundary |
|---|---|---|---|---|---|---|---|
| 15-stage journey visibility/navigation | yes | yes | passed through verified implementation checkpoint | no | no | n/a | Stage 5+ routes into complete Journey Center. |
| Validation mixed success/failure truth | yes | yes | passed | no | no | n/a | `PARTIAL` is distinct from completed/failed. |
| Failed-only validation retry preserving successful sections | yes | yes | passed | no | no | n/a | Org-aware recovery and edit-gated retry implemented; live provider retry acceptance remains. |
| Context-only confidence honesty | yes | yes | passed | no | no | n/a | Conservative evidence-based confidence; no fabricated independent-retrieval claim. |
| Claim/source evidence integrity | yes | yes repository foundation | passed | no | no | n/a | Provider-returned source records + exact normalized URL/claim association required; live-provider calibration remains. |
| Usage accounting across success/failure/human gate/retry | yes | yes | passed | no | no | n/a | Known incurred cost preserved; unknown usage conservatively debits reserved budget while remaining unknown. |
| Backend behavioral authorization/isolation | yes | implemented foundation | passed baseline | no | no | n/a | Direct unauthenticated/cross-tenant/Viewer/Edit/Manage behavior covered; deeper consequential-operation coverage remains. |
| Professional-review audit behavior | yes | yes | passed | no | no | required where applicable | Reviewer reference/audit fields and all-required-review promotion behavior covered. |
| Worker lease/attempt/late-response reliability | yes | yes | passed | no | no | n/a | Attempt identity, pre-provider lease validation, stale/late protection, bounded retry and CAD cleanup implemented; deployed soak remains. |
| Production provider unavailable behavior | yes | yes in primary paths | automated provider/orchestrator coverage passed | no | no | n/a | Live provider acceptance still required after deployment. |
| Fresh owner-controlled deployment path | yes | documentation implemented | passed through verified documentation checkpoint; later doc-only corrections pending live exact-head check | no | no | n/a | `INVENTSMITH_DEPLOYMENT_RUNBOOK.md` targets Modern Methods-owned Vercel + Convex and retires MadeThis synchronization. |

## Core inventor experience

| Capability | Planned | Implemented | Automated verification | Deployed | Live verified | Professional review | Current evidence / remaining boundary |
|---|---|---|---|---|---|---|---|
| Sign in / session | yes | repository foundation | historical/current build coverage | no | no | n/a | Fresh Convex Auth live acceptance pending. |
| Create/classify invention | yes | yes | passed representative regressions | no | no | n/a | Physical/software/hybrid/regulated/unsupported/business-only routing exists; connected-hardware companion-app blind spot fixed. |
| Evidence upload/original preservation | yes | yes | regression foundation passed | no | no | n/a | Live PDF/DOCX/XLSX/image ingestion acceptance pending. |
| Evidence provenance / processing / invalidation | yes | yes | passed | no | no | n/a | Direct persistence behavior verifies correct gate release and downstream stale/requeue behavior. |
| Validation / market / prior-art research | yes | yes | Phase 1 B/C/D regressions passed | no | no | legal/patent review required for consequential conclusions | Live provider/retrieval calibration remains. |
| Decision/review workflow | yes | yes | passed representative behavior | no | no | depends on decision | Professional review, inventor decisions, and external authorization remain distinct. |
| Versioned downloadable packages | yes | yes | passed persistence/handoff tests | no | no | depends on contents | Newest revision selection verified even when newest revision is stale; rendered QA remains. |
| Ask InventSmith grounded in invention record | yes | yes | regression foundation exists | no | no | n/a | Live provider execution acceptance remains. |

## Product design / engineering

| Capability | Planned | Implemented | Automated verification | Deployed | Live verified | Professional review | Current evidence / remaining boundary |
|---|---|---|---|---|---|---|---|
| Requirements → design candidates → comparison/selection | yes | yes | representative handoff coverage passed | no | no | engineering review required for consequential release | Physical Patent → candidate generation/scoring → Product Design handoff verified. |
| Concept visualization maturity | yes | yes | repository tests | no | no | not required for concept visualization | Must remain distinct from CAD/release. |
| Preliminary native CAD | yes for supported categories | yes foundation | CAD/worker regressions passed | no | no | qualified engineering review required before release claims | STEP/STL/DXF/editable source foundation with attempt/cleanup protection. |
| Prototype Candidate | yes | workflow/evidence gates implemented | gate behavior coverage exists | no | no | engineering/prototype evidence required | AI output cannot fabricate physical test evidence. |
| Engineering Reviewed | yes | gate/record foundation | professional review behavior passed | no | no | required and not globally completed | Must be backed by actual reviewer records. |
| Manufacturing Released | yes | gate foundation | real-world quote gate behavior passed | no | no | required where applicable and not globally completed | Cannot be inferred from generated CAD/specifications or model prose. |

## Representative Phase 2 acceptance

| Area | Repository acceptance state | Remaining work |
|---|---|---|
| Physical work-plan journey | representative dependency closure and artifact chain covered | Deeper prototype/RFQ/manufacturing maturity enforcement |
| Software-only journey | software spec/architecture/security branch covered without fake physical gates | Deeper implementation/test/release evidence acceptance |
| Hybrid journey | both physical + software artifact branches preserved | Drive farther through prototype/RFQ + software delivery convergence |
| Regulated journey | consequential outputs remain behind professional-review trust state | Real qualified professional/live acceptance after deployment |
| Inventor evidence persistence | direct fake-datastore mutation behavior covered | Expand additional evidence categories and replacement/removal cases |
| Manufacturer quote gate | direct behavior covered | Prove downstream costing/readiness invalidation and refresh semantics |
| Actual sales/launch evidence gate | direct behavior covered | Deeper post-launch analytics/growth behavior |
| Versioned artifact persistence | highest prior version + consequential review state covered | Rendered/export package quality and limitation labeling |
| Professional review | audit/reference/multi-review promotion covered | More role/authorization boundaries and live review workflow |

## Commercial journey

| Capability | Planned | Implemented | Automated verification | Deployed | Live verified | Professional review | Current evidence / remaining boundary |
|---|---|---|---|---|---|---|---|
| Prototype/testing and evidence-driven revision | yes | foundation implemented | relevant gate tests | no | no | engineering review where applicable | Genuine test evidence still required in real journeys. |
| Manufacturing/RFQ/quote comparison | yes | foundation implemented | direct quote-gate behavior passed | no | no | specialist review may apply | Genuine supplier quote remains mandatory. |
| IP/legal preparation/routing | yes | yes | repository tests | no | no | qualified legal/patent review required | No patentability/FTO/legal approval claims. |
| Branding/positioning/assets | yes | yes | repository tests | no | no | trademark/legal review where appropriate | Generated assets require visual QA. |
| Pricing/unit economics | yes | yes | repository tests | no | no | financial/professional review depending use | Modeled inputs must not masquerade as quotes/actuals. |
| Marketing/sales | yes | yes | repository tests | no | no | n/a | Must remain invention/evidence-specific. |
| Funding / pitch / financial artifacts | yes | yes | artifact foundations tested | no | no | financial/legal review depending use | Editable package quality review remains. |
| Launch/growth | yes | workflow foundation | launch evidence gate behavior covered | no | no | n/a | Actual-performance analysis requires genuine post-launch evidence. |

## Hosting / external integration blockers

| Item | Repository work possible now | Live credential/infrastructure blocker |
|---|---|---|
| GitHub CI | yes | none for PR verification |
| Fresh Convex project/auth/storage/scheduled work | source/docs/tests yes | owner Convex account/project/secure env values required for deployment |
| Fresh Vercel project | source/docs/build yes | owner Vercel project and public Convex URL required for deployment |
| OpenAI live checks | deterministic provider tests yes | server API key required for live provider execution |
| Paid checkout/billing/webhooks | adapter hardening/docs yes | owner-selected billing integration/secrets required; do not bypass entitlement while absent |
| Custom domain/DNS | not required for current source work | intentionally deferred; no DNS changes authorized |

## Immediate implementation tracker

1. **Engineering/prototype/RFQ maturity enforcement:** current highest-priority coding work.
2. **Consequential-operation behavioral security:** external-use authorization, destructive/privacy, billing-sensitive, and org-management boundaries.
3. **Artifact quality and packaging:** newest revision, provenance, limitations, maturity, stale/review/external-use state in exports.
4. **Deeper representative lifecycle acceptance:** especially physical/hybrid validation → design → CAD → prototype → RFQ → manufacturing readiness.
5. **Prepare, not provision, owner-controlled runtime:** maintain Vercel/Convex/auth/provider/billing configuration and acceptance procedures.
6. **Live acceptance later:** authenticated multi-user/provider/concurrency/billing/professional/representative journey checks after deployment.

Update this file after each cohesive batch with exact CI evidence rather than an overall completion percentage.
