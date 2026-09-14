# InventSmith Current Plan and Progress

**Updated:** September 14, 2026  
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally unmerged

## Product destination

InventSmith owns the invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence and human-gate truth model.

No single overall completion percentage is authoritative. The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Source, hosting, and deployment boundary

GitHub is the current source/CI authority. The future runtime remains a Modern Methods-owned Vercel deployment plus a Modern Methods-owned Convex deployment. MadeThis is historical only and must not be used as a deployment or synchronization target. Repository-green does not mean deployed or live-functionally-verified.

## Verified hardening state

Phase 1 production-hardening foundations remain in place: partial validation/retry, conservative confidence, fail-closed evidence promotion, attempt-aware usage settlement, authorization boundaries, and worker lease/attempt protection.

Phase 2 acceptance now includes representative physical/software/hybrid/regulated routing, versioned artifact handoff, professional-review records, real prototype/manufacturer/sales evidence gates, scoped evidence invalidation, manufacturing-maturity enforcement, consequential privacy/billing authorization, and package-export safety.

### Engineering / prototype / RFQ maturity

Final manufacturing readiness cannot be unlocked from preliminary CAD and quotes alone. The scheduler requires completed prototype readiness plus the latest fresh, professionally reviewed prototype-readiness and RFQ artifacts. Early sourcing and draft RFQ preparation remain available. Prototype/quote evidence changes refresh only their real downstream dependency chain rather than staling unrelated project evidence.

### Consequential-operation security

Direct regression coverage now protects account deletion execution, targeted privacy export, authenticated self-service privacy actions, organization member management, ownership transfer, and billing-sensitive organization export. Organization admins retain authorized project export access, but raw subscription-event billing attribution is owner-only, matching the existing owner-only billing policy.

### Artifact quality and package export

Package export is now an explicit external-use boundary rather than a file-format convenience. The newest deliverable revision is selected per kind. Full DOCX/PDF package export fails closed when automated package quality has not passed, when any included newest deliverable is stale, or when any included deliverable has not reached `ready_for_authorized_use`. Draft/review artifacts remain visible and individually downloadable inside InventSmith. Authorized packages record trust state, artifact maturity, evidence provenance, review records, limitations, and explicit current external-use status.

## Latest verified repository checkpoint

**Verified clean head:** `81eae51584feb0cdf3d38f8d20c44009aa63b0e1`  
**GitHub Actions:** workflow run **#620**, run ID `34911131075`  
**Result:** **PASS**

That exact head passed dependency installation, operational-script checks, web TypeScript, Convex TypeScript, the full regression suite, production dependency audit, and the Next.js production build.

PR #24 remains draft/open/unmerged and `main` remains untouched.

## Current implementation order

1. **Representative lifecycle acceptance.** Drive physical, software, hybrid, and regulated scenarios farther through actual lifecycle behavior. Prioritize physical/hybrid validation → design → CAD → prototype → RFQ → manufacturing readiness because truth/maturity mistakes there have the highest consequence.
2. **Expand consequential behavioral security where runtime coverage is still source-shape-only.** Preserve unauthenticated, cross-tenant, Viewer/Edit/Manage, owner/admin, privacy, billing, destructive, and external-use boundaries.
3. **Artifact/package depth.** Continue improving generated artifact content quality and specialized handoff packaging while preserving the new fail-closed export authorization boundary.
4. **Prepare the fresh owner-controlled runtime.** Keep Vercel/Convex environment variables, auth, storage, billing/webhooks, provider configuration, and acceptance procedures documented without provisioning paid/live services until the founder is ready.
5. **Live deployment and acceptance later.** After owner-controlled infrastructure exists, run real authenticated multi-user/multi-invention acceptance, provider failure/retry, evidence extraction, usage concurrency, billing/webhooks, physical/software/hybrid journeys, professional review, and live functional verification.
6. **Commercial calibration later.** Lock final seats/storage/premium-work allowances only after representative measured provider/runtime economics support sustainable limits.

## Deployment / acceptance state

- **Planned product destination:** defined in `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`.
- **Implemented:** substantial end-to-end journey, organization architecture, classification, evidence, autonomous work, artifacts, physical/software/hybrid routing, professional gates, engineering maturity, consequential security, and package-export hardening exist in the repository.
- **Automated verification:** PASS through exact clean head `81eae51584feb0cdf3d38f8d20c44009aa63b0e1` / workflow run #620.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review completed:** only when a real qualified review is actually recorded; never infer this from repository-green or AI output.

## New-chat start instruction

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/INVENTSMITH_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`
5. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then fetch the live `inventsmith/full-product-build` branch, draft PR #24, and exact-head CI. Trust the live repository over this document if the branch has advanced. Do not restart completed work, do not merge PR #24, and do not reintroduce MadeThis synchronization. The immediate implementation priority is representative lifecycle acceptance followed by deeper runtime authorization and artifact-quality acceptance.
