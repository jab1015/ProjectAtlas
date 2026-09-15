# InventSmith Current Plan and Progress

**Updated:** September 15, 2026  
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally unmerged

## Product destination

InventSmith owns the invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence, maturity, authorization, and human-gate truth model.

## Completion estimate

For planning purposes, the current best estimate is:

- **Repository product implementation + hardening: approximately 88% complete.**
- **Name-change/customer-facing InventSmith conversion: approximately 96% complete.** Remaining former-name references are primarily the historical repository slug and compatibility identifiers that should not be renamed casually.
- **Automated repository qualification: approximately 85% complete.** The broad suite has repeatedly passed, but the newest gate-hardening checkpoint exposed a Convex TypeScript regression that has been corrected and still requires a fresh exact-head CI pass.
- **Owner-controlled deployment/live acceptance: 0% complete by design.** Modern Methods-owned Vercel/Convex have not yet been provisioned or live-tested.
- **Overall path to production acceptance: approximately 72% complete.** This weighted estimate includes repository implementation, hardening, naming, automated acceptance, deployment, live functional acceptance, billing/provider acceptance, and genuine external/professional evidence gates. It is a planning estimate, not a release-readiness claim.

The retired controlled-pilot 80% figure is not an overall InventSmith completion figure.

## Source, hosting, and deployment boundary

GitHub is the current source/CI authority. The future runtime remains a Modern Methods-owned Vercel deployment plus a Modern Methods-owned Convex deployment. MadeThis is historical only and must not be used as a deployment or synchronization target. Repository-green does not mean deployed or live-functionally-verified.

## Implemented hardening state

Production-hardening foundations include partial validation/retry, conservative confidence, fail-closed evidence promotion, attempt-aware usage settlement, organization/invention authorization boundaries, worker lease/attempt protection, genuine evidence gates, professional-review records, scoped evidence invalidation, manufacturing maturity, consequential privacy/billing authorization, and package-export safety.

### Engineering / prototype / RFQ maturity

Final manufacturing readiness is fail-closed. The latest physical/hybrid hardening requires fresh reviewed prototype readiness, RFQ and manufacturing-drawing artifacts plus production-mature native CAD. Native CAD itself is assigned engineering professional review. Preliminary, stale, superseded, or unreviewed CAD cannot silently satisfy final manufacturing readiness. Early research, sourcing and draft RFQ preparation remain available.

### Evidence invalidation

Prototype-test, manufacturer-quote, and sales evidence changes invalidate only their applicable transitive downstream graph. Removing required real-world evidence re-closes the corresponding gate. Newer stale/preliminary revisions defeat older clean revisions rather than allowing fallback to obsolete work.

### Consequential-operation security

Account deletion, targeted privacy export, authenticated self-service privacy actions, organization member management, ownership transfer, billing-sensitive export, decisions and approvals have server-side authorization boundaries. Organization admins may export authorized project data, while raw billing attribution remains owner-only.

The latest blocked-work hardening also prevents ordinary typed responses from being treated as substitutes for consequential authorization, professional review, payment, decision, or physical-evidence gates. A CI failure at head `6ec9fe87f0643c6f4d664c48ab39f591b8f60947` identified an invalid Convex review-field reference. That edit was corrected at `36ef66392a31a93573d4fb5a25697bd75c0b7927`; exact-head CI for the corrected checkpoint was not yet available when this document was updated.

### Artifact quality and package export

Full DOCX/PDF package export is an external-use boundary. It fails closed when package quality has not passed, any newest included deliverable is stale, or any included deliverable has not reached `ready_for_authorized_use`. Draft/review artifacts remain visible and individually downloadable inside InventSmith. Authorized packages preserve trust state, maturity, provenance, review records, limitations, and external-use status.

## CI truth

The latest known broad successful checkpoint before the newest blocked-work edit was the preceding qualified line, including successful InventSmith CI #10 at `c350b2d` as recorded during continuation. The subsequent exact-head run #12 for `6ec9fe87f0643c6f4d664c48ab39f591b8f60947` failed Convex TypeScript because `professionalReviews` has no `reviewArea` field. The branch was corrected to `36ef66392a31a93573d4fb5a25697bd75c0b7927`.

**Do not call `36ef66392a31a93573d4fb5a25697bd75c0b7927` fully verified until exact-head CI runs and passes.**

PR #24 remains draft/open/unmerged and `main` remains untouched.

## Remaining implementation order

1. Obtain and verify exact-head CI for the corrected gate-hardening checkpoint; repair any concrete failure without weakening controls.
2. Finish blocked-work gate behavior so safe inventor-information responses can resume only the intended private-information/input gate while consequential gates remain impossible to bypass.
3. Complete physical/hybrid maturity acceptance, including the native-CAD maturity transition after accepted qualified engineering review and a separate stronger manufacturing-release boundary.
4. Audit every potential third-party/RFQ/external-sharing path so confidential information or manufacturer contact requires current authorized artifacts plus explicit inventor approval.
5. Expand direct behavioral security tests beyond source-shape assertions for destructive, billing, privacy, organization-management and external-use operations.
6. Continue representative physical, software, hybrid and regulated lifecycle acceptance through actual state transitions.
7. Continue artifact/package depth and specialized handoff quality.
8. Finish low-risk customer-facing naming cleanup while preserving historical repository and compatibility identifiers until a separately tested migration is justified.
9. Prepare the fresh owner-controlled Vercel/Convex runtime configuration and acceptance checklist without claiming deployment.
10. After owner-controlled infrastructure exists, perform live authenticated multi-user/multi-invention, provider failure/retry, evidence extraction, concurrency, billing/webhook, professional-review and representative lifecycle acceptance.
11. Calibrate final commercial limits from measured provider/runtime economics.

## Deployment / acceptance state

- **Product destination:** defined and locked in `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`.
- **Repository implementation:** substantial complete journey and hardening implemented; planning estimate ~88%.
- **Name conversion:** customer-facing InventSmith conversion substantially complete; planning estimate ~96%.
- **Newest corrected source head:** `36ef66392a31a93573d4fb5a25697bd75c0b7927`; exact-head CI pending at document update time.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review completed:** only when a real qualified review is actually recorded; never infer it from repository-green or AI output.

## New-chat start instruction

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/INVENTSMITH_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`
5. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then fetch the live `inventsmith/full-product-build` branch, draft PR #24, and exact-head CI. Trust the live repository over this document if the branch has advanced. Do not restart completed work, do not merge PR #24, and do not reintroduce MadeThis synchronization.