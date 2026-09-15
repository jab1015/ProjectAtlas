# InventSmith Current Plan and Progress

**Updated:** September 15, 2026  
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally unmerged

## Product destination

InventSmith owns the invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence, maturity, authorization, and human-gate truth model.

## Progress reporting rule

Do not publish an overall completion percentage. Track repository implementation, automated verification, deployment, live functional acceptance, professional review, and genuine real-world evidence as separate states. The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Source, hosting, and deployment boundary

Source and CI remain in the current repository. The future runtime remains a Modern Methods-owned Vercel deployment plus a Modern Methods-owned Convex deployment. MadeThis is historical only and must not be used as a deployment or synchronization target. Repository-green does not mean deployed or live-functionally-verified.

## Implemented hardening state

Hardening foundations include partial validation/retry, conservative confidence, fail-closed evidence promotion, attempt-aware usage settlement, organization/invention authorization boundaries, worker lease/attempt protection, genuine evidence gates, professional-review records, scoped evidence invalidation, manufacturing maturity, consequential privacy/billing authorization, package-export safety, exact-revision external-use authorization, and exact-artifact consequential approval scope.

### Engineering / prototype / RFQ maturity

Final manufacturing readiness is fail-closed. The latest physical/hybrid path requires fresh reviewed prototype readiness, RFQ and manufacturing-drawing artifacts plus production-mature native CAD. Native CAD begins preliminary. An accepted engineering review bound to the exact fresh current CAD deliverable can advance it to `engineering_reviewed`; a changes-requested review, stale artifact, superseded revision, or disqualifying sibling review invalidates that engineering maturity. Engineering review never creates `manufacturing_released`, which remains a separate stronger consequential boundary. Reopened review invalidates an existing manufacturing release rather than preserving stale production maturity.

Professional-review replay is idempotent. Replaying the exact accepted review for a fresh current artifact does not silently remove a separately recorded external-use authorization. A material review change, staleness, revision supersession, or maturity invalidation revokes that authorization state.

### Evidence invalidation

Prototype-test, manufacturer-quote, and sales evidence changes invalidate only their applicable transitive downstream graph. Removing required real-world evidence re-closes the corresponding gate. Newer stale/preliminary revisions defeat older clean revisions rather than allowing fallback to obsolete work.

### Consequential-operation security

Account deletion, targeted privacy export, authenticated self-service privacy actions, organization member management, ownership transfer, billing-sensitive export, decisions and approvals have server-side authorization boundaries. Organization admins may export authorized project data, while raw billing attribution remains owner-only.

Blocked-work free-form responses are restricted to the stored `private_information` gate in the actual mutation handler. Decision, authorization, professional-review, payment, physical-work, missing, and unknown gates fail closed rather than accepting typed text as a substitute for their dedicated paths. Mutation-level tests cover authorization, replay, organization-scoped usage, zero rejected side effects, and preservation of unrelated state.

### Explicit external-use authorization

`ready_for_authorized_use` has a production transition rather than only being an export label. An invention manager must explicitly authorize one exact latest fresh deliverable revision. Ambiguous duplicate latest revisions fail closed. Deliverables with required professional review cannot be authorized until that review is complete. The transition is idempotent and records the exact deliverable ID, kind, version, and authorizing user in the execution audit trail.

The Work Library exposes this as an explicit **Authorize external use** action with a confirmation explaining that authorization applies only to that exact revision and does not itself contact a third party, spend money, place a manufacturing order, make a filing, publish, or replace professional review. Package export remains separately fail-closed on package quality, staleness, and authorization of every included newest artifact.

### Exact artifact scope for consequential external actions

External approval requests for confidential sharing, third-party contact, publishing/disclosure, submission/filing, or external use must be bound to one or more exact deliverable IDs. Each deliverable is verified as belonging to the invention, latest for its kind, fresh, unambiguous at its latest version, and already `ready_for_authorized_use` before a request can be created.

Approval resolution repeats that verification. Execution repeats it again through the guarded external-action check, so stale or superseded scope fails closed even after a request was approved. Old external approvals with no artifact-scope audit record cannot be approved or executed. Authorized managers can still deny such legacy requests. Payment approval remains separate from artifact-disclosure scope.

Direct mutation tests for this behavior are included in the exact green `530b5757` checkpoint.

### Workspace reconstruction audit

Historical commit `d103d72b` had an unusually large textual diff in `convex/inventionWorkspace.ts` because multiline code was compressed while professional-review logic was changed. The live branch still contains all 13 pre-refactor workspace operations. A regression contract locks those exports plus decision validation, dedicated blocked-work/professional-review handlers, consequential approval categories, and organization-aware access checks so accidental truncation cannot silently recur.

## CI truth

InventSmith CI #78, run `34997848353`, passed at exact head `530b5757fe9e6c762f03967de60547ac383c12ff`. The run completed dependency installation, operational-script checks, web TypeScript, Convex TypeScript, regression tests, production dependency audit, and the Next production build successfully.

Documentation commits after that exact verified checkpoint must receive their own exact-head green CI before being called automatically verified.

PR #24 remains draft/open/unmerged and `main` remains untouched.

## Remaining implementation order

1. Qualify the newest exact branch head with the full InventSmith CI workflow and fix any concrete failure without weakening controls.
2. Replace any remaining legacy UI/caller approval resolution with `consequentialApprovalMutation` so the guarded exact-artifact path is the real user path, not only a backend API.
3. Audit every potential third-party/RFQ/external-sharing execution path so confidential information or manufacturer contact requires current authorized artifacts plus current explicit approval at the moment of execution.
4. Complete manufacturing release as a deliberate boundary distinct from engineering review, external-use authorization, payment, manufacturer contact, and an actual production order; do not infer it from repository state or professional review alone.
5. Expand direct behavioral security tests for destructive, billing, privacy, organization-management and external-use operations.
6. Continue representative physical, software, hybrid and regulated lifecycle acceptance through actual persisted state transitions, including evidence replacement/removal and newest-revision behavior.
7. Continue artifact/package depth and specialized handoff quality, including independent validation of generated CAD formats where feasible.
8. Finish low-risk customer-facing naming cleanup while preserving historical repository and compatibility identifiers until a separately tested migration is justified.
9. Prepare fresh owner-controlled Vercel/Convex runtime configuration and acceptance checklist without claiming deployment.
10. After owner-controlled infrastructure exists, perform live authenticated multi-user/multi-invention, provider failure/retry, evidence extraction, concurrency, billing/webhook, professional-review and representative lifecycle acceptance.
11. Calibrate commercial limits from measured provider/runtime economics.

## Deployment / acceptance state

- **Product destination:** defined and locked in `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`.
- **Repository implementation:** active and continuing on this branch.
- **Automated verification:** full CI passed at exact head `530b5757fe9e6c762f03967de60547ac383c12ff`; documentation and later hardening commits require their own exact-head result.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review completed:** only when a real qualified review is actually recorded; never infer it from repository-green or AI output.

## New-chat start instruction

Read `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`, this file, `docs/INVENTSMITH_BUILD_PROGRESS.md`, `docs/INVENTSMITH_CAPABILITY_MATRIX.md`, `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`, and `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`; then fetch the live branch, draft PR #24, and exact-head CI. Trust newer verified repository state. Do not restart completed work, merge PR #24, or reintroduce MadeThis synchronization.
