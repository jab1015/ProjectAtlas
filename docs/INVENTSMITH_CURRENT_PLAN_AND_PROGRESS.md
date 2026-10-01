# InventSmith Current Plan and Progress

**Updated:** October 1, 2026
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

Hardening foundations include partial validation/retry, conservative confidence, fail-closed evidence promotion, attempt-aware usage settlement, organization/invention authorization boundaries, worker lease/attempt protection, genuine evidence gates, professional-review records, scoped evidence invalidation, manufacturing maturity and deliberate manufacturing release, consequential privacy/billing authorization, package-export safety, exact-revision external-use authorization, exact-artifact consequential approval scope, and explicit non-execution audit semantics for permission/release transitions.

### Engineering / prototype / RFQ maturity

Final manufacturing readiness is fail-closed. The latest physical/hybrid path requires fresh reviewed prototype readiness, RFQ and manufacturing-drawing artifacts plus production-mature native CAD. Native CAD begins preliminary. An accepted engineering review bound to the exact fresh current CAD deliverable can advance it to `engineering_reviewed`; a changes-requested review, stale artifact, superseded revision, or disqualifying sibling review invalidates that engineering maturity. Engineering review never creates `manufacturing_released`, which remains a separate stronger consequential boundary. Reopened review invalidates an existing manufacturing release rather than preserving stale production maturity.

A deliberate manufacturing-release mutation now exists for one exact synchronized newest native-CAD generation. It requires invention-manager authority, fresh current artifacts, accepted auditable exact professional reviews, and `engineering_reviewed` maturity across the complete native-CAD set. Release changes only artifact maturity to `manufacturing_released`; it does not contact a supplier, disclose artifacts, purchase anything, make a payment, place a production order, file anything, or publish. The execution audit records `externalActionExecuted: false`.

Professional-review replay is idempotent. Replaying the exact accepted review for a fresh current artifact does not silently remove a separately recorded external-use authorization. A material review change, staleness, revision supersession, or maturity invalidation revokes that authorization state.

### Evidence invalidation

Prototype-test, manufacturer-quote, and sales evidence changes invalidate only their applicable transitive downstream graph. Removing required real-world evidence re-closes the corresponding gate. Direct behavior coverage now verifies both manufacturer-quote removal and actual launch/sales evidence removal, including clearing stale completion/output state and requeuing dependent analysis while preserving unrelated completed work. Newer stale/preliminary revisions defeat older clean revisions rather than allowing fallback to obsolete work.

### Consequential-operation security

Account deletion, targeted privacy export, authenticated self-service privacy actions, organization member management, ownership transfer, billing-sensitive export, decisions and approvals have server-side authorization boundaries. Organization admins may export authorized project data, while raw billing attribution remains owner-only.

Blocked-work free-form responses are restricted to the stored `private_information` gate in the actual mutation handler. Decision, authorization, professional-review, payment, physical-work, missing, and unknown gates fail closed rather than accepting typed text as a substitute for their dedicated paths. Mutation-level tests cover authorization, replay, organization-scoped usage, zero rejected side effects, and preservation of unrelated state.

### Explicit external-use authorization

`ready_for_authorized_use` has a production transition rather than only being an export label. An invention manager must explicitly authorize one exact latest fresh deliverable revision. Ambiguous duplicate latest revisions fail closed. Deliverables with required professional review cannot be authorized until that review is complete. The transition is idempotent and records the exact deliverable ID, kind, version, and authorizing user in the execution audit trail.

The Work Library exposes this as an explicit **Authorize external use** action with a confirmation explaining that authorization applies only to that exact revision and does not itself contact a third party, spend money, place a manufacturing order, make a filing, publish, or replace professional review. Authorization audits explicitly record that no external action was executed.

### Exact artifact scope for consequential external actions

External approval requests for confidential sharing, third-party contact, publishing/disclosure, submission/filing, or external use must be bound to one or more exact deliverable IDs. Each deliverable is verified as belonging to the invention, latest for its kind, fresh, unambiguous at its latest version, and already `ready_for_authorized_use` before a request can be created.

Approval resolution repeats that verification. Execution repeats it again through the guarded external-action check, so stale or superseded scope fails closed even after a request was approved. Old external approvals with no artifact-scope audit record cannot be approved or executed. Authorized managers can still deny such legacy requests. Payment approval remains separate from artifact-disclosure scope. Approval resolution itself records `externalActionExecuted: false`; approval is permission, not evidence that contact, disclosure, filing, publishing, ordering, or payment occurred.

Direct mutation tests for exact artifact binding, stale/superseded revalidation, legacy denial, authorization failure, and execution-time stale-scope rejection are included in the current verified branch history.

The October 1 execution-path audit found no repository path that actually sends an RFQ, contacts a manufacturer or supplier, discloses an invention artifact, places a manufacturing order, pays a supplier, files a submission, or publishes on the inventor's behalf. Current RFQ/manufacturer work prepares internal artifacts and ingests genuine outside responses. The only approval-resolution UI calls the guarded `consequentialApprovalMutation`; the legacy workspace export delegates to the same handler. Any future external executor must call `requireCurrentApprovedExternalAction` immediately before its side effect and record execution separately from permission.

### Package/export integrity

The Work Library now fails closed when a deliverable kind has more than one newest revision. Ambiguous candidates are excluded from both external-use authorization controls and package selection, and the package reports an explicit blocker instead of choosing one arbitrarily. Authorized packages also reject artifacts with missing titles or empty readable content before DOCX/PDF generation.

### Inventor-facing completion semantics

Journey Center, dashboard, department work, and status briefing now distinguish internal InventSmith work completion from external real-world execution. Completed journey stages are labeled **Stage work complete**, department items use **Work complete**, the dashboard reports **Idea-to-market stage work**, and the briefing says **Recently completed work**. Journey Center explicitly states that stage-work completion does not mean InventSmith contacted a supplier or professional, placed an order or payment, submitted a filing, published anything, or launched a product.

### Workspace reconstruction audit

Historical commit `d103d72b` had an unusually large textual diff in `convex/inventionWorkspace.ts` because multiline code was compressed while professional-review logic was changed. The live branch still contains all 13 pre-refactor workspace operations. A regression contract locks those exports plus decision validation, dedicated blocked-work/professional-review handlers, consequential approval categories, and organization-aware access checks so accidental truncation cannot silently recur.

## CI truth

InventSmith CI #117, run `36930923481`, passed at exact head `2263c17faae24ceb237ae29b23376f86761cb0e5`. The run completed dependency installation, operational-script checks, web TypeScript, Convex TypeScript, 561 regression tests, production dependency audit, and the Next production build successfully. That checkpoint includes the deliberate manufacturing-release UI, fail-closed newest synchronized CAD-generation display semantics, and package duplicate-newest/content hardening.

Documentation commits after that verified code checkpoint must receive their own exact-head green CI before the documentation head itself is called automatically verified.

PR #24 remains draft/open/unmerged and `main` remains untouched.

## Remaining implementation order

1. Qualify the newest documentation head with the full InventSmith CI workflow and fix any concrete failure without weakening controls.
2. Preserve the audited no-executor boundary: every future third-party/RFQ/disclosure/filing/publishing executor must use exact current artifact scope, revalidate approval at execution time, and create separate execution evidence.
3. Expand direct behavioral security tests for destructive, billing, privacy, organization-management and external-use operations where only source-contract coverage remains.
4. Continue representative physical, software, hybrid and regulated lifecycle acceptance through persisted state transitions, especially evidence replacement/removal, cross-kind newest-revision invalidation, deliberate manufacturing release, and later external-action boundaries.
5. Continue artifact/package depth and specialized handoff quality, including independent validation of generated CAD formats where feasible and rendered DOCX/PDF review.
6. Finish low-risk customer-facing naming cleanup while preserving historical repository, managed-platform attribution, active support routing, and compatibility identifiers until replacements are owner-confirmed and tested.
7. Prepare fresh owner-controlled Vercel/Convex runtime configuration and acceptance checklist without claiming deployment.
8. After owner-controlled infrastructure exists, perform live authenticated multi-user/multi-invention, provider failure/retry, evidence extraction, concurrency, billing/webhook, professional-review and representative lifecycle acceptance.
9. Calibrate commercial limits from measured provider/runtime economics.

## Deployment / acceptance state

- **Product destination:** defined and locked in `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`.
- **Repository implementation:** active and continuing on this branch.
- **Automated verification:** full CI passed at exact code head `2263c17faae24ceb237ae29b23376f86761cb0e5`; this documentation head requires its own exact-head result before it is called automatically verified.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review completed:** only when a real qualified review is actually recorded; never infer it from repository-green or AI output.

## New-chat start instruction

Read `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`, this file, `docs/INVENTSMITH_BUILD_PROGRESS.md`, `docs/INVENTSMITH_CAPABILITY_MATRIX.md`, `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`, and `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`; then fetch the live branch, draft PR #24, and exact-head CI. Trust newer verified repository state. Do not restart completed work, merge PR #24, or reintroduce MadeThis synchronization.
