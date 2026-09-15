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

Hardening foundations include partial validation/retry, conservative confidence, fail-closed evidence promotion, attempt-aware usage settlement, organization/invention authorization boundaries, worker lease/attempt protection, genuine evidence gates, professional-review records, scoped evidence invalidation, manufacturing maturity, consequential privacy/billing authorization, and package-export safety.

### Engineering / prototype / RFQ maturity

Final manufacturing readiness is fail-closed. The latest physical/hybrid path requires fresh reviewed prototype readiness, RFQ and manufacturing-drawing artifacts plus production-mature native CAD. Native CAD begins preliminary. An accepted engineering review bound to the exact fresh CAD deliverable can advance it to `engineering_reviewed`; a changes-requested review or stale artifact invalidates that engineering maturity. Engineering review never creates `manufacturing_released`, which remains a separate consequential authorization boundary. Preliminary, stale, superseded, or unreviewed CAD cannot silently satisfy final manufacturing readiness.

### Evidence invalidation

Prototype-test, manufacturer-quote, and sales evidence changes invalidate only their applicable transitive downstream graph. Removing required real-world evidence re-closes the corresponding gate. Newer stale/preliminary revisions defeat older clean revisions rather than allowing fallback to obsolete work.

### Consequential-operation security

Account deletion, targeted privacy export, authenticated self-service privacy actions, organization member management, ownership transfer, billing-sensitive export, decisions and approvals have server-side authorization boundaries. Organization admins may export authorized project data, while raw billing attribution remains owner-only.

Blocked-work free-form responses are restricted to the stored `private_information` gate. Decision, authorization, professional-review, payment, physical-work, missing, and unknown gates fail closed rather than accepting typed text as a substitute for their dedicated paths.

### Artifact quality and package export

Full DOCX/PDF package export is an external-use boundary. It fails closed when package quality has not passed, any newest included deliverable is stale, or any included deliverable has not reached `ready_for_authorized_use`. Draft/review artifacts remain visible and individually downloadable inside InventSmith. Authorized packages preserve trust state, maturity, provenance, review records, limitations, and external-use status.

## CI truth

InventSmith CI #23 passed at exact source head `d103d72b96429d9ceabe73e52d54f34b351e6094`, including operational-script checks, web TypeScript, Convex TypeScript, regression tests, production dependency audit, and Next production build.

Later CAD invalidation and documentation commits must receive their own exact-head CI before being called automatically verified.

PR #24 remains draft/open/unmerged and `main` remains untouched.

## Remaining implementation order

1. Verify exact-head CI for the latest CAD invalidation/documentation line and correct any concrete failure without weakening controls.
2. Add mutation-level persisted blocked-work acceptance covering successful private information, all rejection gates, authorization, replay, preserved unrelated state, and zero rejected side effects.
3. Add direct professional-review mutation acceptance for exact CAD revision promotion/invalidation and downstream eligibility.
4. Audit every potential third-party/RFQ/external-sharing path so confidential information or manufacturer contact requires current authorized artifacts plus explicit inventor approval.
5. Expand direct behavioral security tests for destructive, billing, privacy, organization-management and external-use operations.
6. Continue representative physical, software, hybrid and regulated lifecycle acceptance through actual persisted state transitions.
7. Continue artifact/package depth and specialized handoff quality.
8. Finish low-risk customer-facing naming cleanup while preserving historical repository and compatibility identifiers until a separately tested migration is justified.
9. Prepare fresh owner-controlled Vercel/Convex runtime configuration and acceptance checklist without claiming deployment.
10. After owner-controlled infrastructure exists, perform live authenticated multi-user/multi-invention, provider failure/retry, evidence extraction, concurrency, billing/webhook, professional-review and representative lifecycle acceptance.
11. Calibrate commercial limits from measured provider/runtime economics.

## Deployment / acceptance state

- **Product destination:** defined and locked in `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`.
- **Repository implementation:** active and continuing on this branch.
- **Automated verification:** passed through exact source head `d103d72b`; newer commits pending exact-head qualification.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review completed:** only when a real qualified review is actually recorded; never infer it from repository-green or AI output.

## New-chat start instruction

Read `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`, this file, `docs/INVENTSMITH_BUILD_PROGRESS.md`, `docs/INVENTSMITH_CAPABILITY_MATRIX.md`, `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`, and `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`; then fetch the live branch, draft PR #24, and exact-head CI. Trust newer verified repository state. Do not restart completed work, merge PR #24, or reintroduce MadeThis synchronization.
