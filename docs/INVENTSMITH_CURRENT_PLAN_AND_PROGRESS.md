# InventSmith Current Plan and Progress

**Status:** Authoritative continuation checkpoint  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Updated:** September 14, 2026  
**Active branch:** `inventsmith/full-product-build`  
**Draft pull request:** #24 — keep draft and unmerged  
**Authoritative product destination:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`

## Purpose and operating instruction

This is the current handoff document for a new chat, coding session, or future worker. Resume from this file plus `INVENTSMITH_MASTER_PRODUCT_SPEC.md`, `INVENTSMITH_BUILD_PROGRESS.md`, `INVENTSMITH_DEPLOYMENT_RUNBOOK.md`, and `INVENTSMITH_DOCUMENT_AUTHORITY.md`. Do not revert to the retired controlled-pilot scope created under the former working name.

Continue routine investigation, implementation, tests, CI verification, documentation, and re-review autonomously until a genuine founder-only action is required. Do not merge PR #24. Do not weaken authentication, authorization, evidence, entitlement, usage, professional-review, physical-evidence, or human-approval controls merely to make tests pass.

## Product destination

InventSmith is an end-to-end operating system that takes an inventor from idea to market while dynamically routing work to the actual product type:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering where applicable → Prototype → Manufacturing or Software Delivery → Branding → IP / Legal Preparation → Pricing → Marketing → Sales → Funding → Launch → Growth.**

Physical inventions receive applicable physical design, CAD/engineering, prototype, and manufacturing work. Software inventions receive software product design, UX, architecture/data/security, implementation/prototype, QA/beta, and release work without invented physical gates. Hybrid inventions run both applicable branches. Regulated/safety-sensitive work remains behind qualified professional review where consequential.

The inventor should not have to manage departments. InventSmith owns routing, sequencing, dependencies, evidence state, reversible autonomous work, and the smallest necessary real-world/professional gates.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Naming rule

The current customer-facing and documentation name is **InventSmith — The Inventor OS**. The former **Atlas / ProjectAtlas** wording is historical only and may remain solely where required for exact repository paths, compatibility identifiers, commit messages, emails, quotations, exhibits, or other factual historical evidence. Active product prose and current instructions must use InventSmith.

## Source, hosting, and environment direction

The owner-controlled target is locked as:

- **GitHub:** `jab1015/ProjectAtlas` — historical repository slug and current repository/CI source of truth. A repository rename may be considered separately after compatibility review.
- **Vercel:** future Modern Methods-owned Next.js deployment.
- **Convex:** future Modern Methods-owned database/auth/storage/functions deployment.

The prior MadeThis-managed environment is retired from the implementation plan. Do not synchronize back to it, modify it, depend on it, migrate its test data, or copy its secrets. Live owner-controlled Vercel/Convex provisioning has not yet been performed. Repository-green is not the same as deployed or live-functionally-verified.

## Organization-native architecture — implemented foundation

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

Implemented foundations include organization-native invention creation/listing; active/archive capacity; Owner/Admin/Member/Viewer/Professional-or-Guest boundaries; invention-level sharing; organization-scoped entitlements and expensive-resource accounting; organization ownership continuity; consent-based invitations; privacy/export/deletion boundaries; and legacy personal-invention migration compatibility.

## Classification and dynamic routing — implemented

InventSmith classifies inventions before normal organization-native workspace persistence.

- **Physical:** applicable Product Design, CAD/engineering, physical prototype, and manufacturing.
- **Software:** software product specification, UX, architecture, data/API, security/privacy, implementation/prototype, QA/beta, and distribution/release without irrelevant physical work.
- **Hybrid:** both applicable physical and software branches. Connected hardware with companion/mobile/cloud applications is explicitly covered.
- **Regulated:** supported with professional-review gates where consequential rather than automatically rejected.
- **Unsupported harmful/abusive concepts:** rejected before normal workspace creation.
- **Business-only concepts:** routed outside the invention-product workflow when appropriate.

Stage 5+ legacy root navigation redirects into the complete Journey Center.

## Phase 1 hardening status

Phase 1 areas are tracked separately; do not turn them into one overall completion percentage.

- **A — Journey:** complete repository routing through the full journey; low-priority unreachable legacy wording remains.
- **B — Partial Validation:** partial state, preserved successes, failed-only retry, organization-aware recovery state, and edit-gated retry are implemented and regression-tested. Live provider retry acceptance remains for deployment.
- **C — Confidence Truth:** context-only AI confidence is conservative and external-data claims cannot imply independent retrieval when none occurred. Live retrieval calibration remains.
- **D — Evidence Trust:** model labels alone fail closed. Provider-returned retrieval source records plus exact normalized URL/claim association are required before promotion. Live-provider acceptance/calibration remains.
- **E — Usage Accounting:** attempt-aware settlement preserves known incurred cost; unknown provider usage conservatively consumes reserved budget while remaining explicitly unknown. Deployed interruption acceptance remains.
- **F — Behavioral Security:** direct authorization and professional-review behavior coverage exists. Additional destructive, billing, privacy, and organization-management behavior tests remain a priority.
- **G — Worker Reliability:** attempt identity, lease checks, stale-attempt protection, bounded retry, and Native CAD cleanup are implemented and tested. Deployed concurrency/lease-expiry soak remains.

## Phase 2 acceptance completed so far

Repository acceptance now exercises product behavior across representative physical, software, hybrid, and regulated inventions.

Completed acceptance includes:

- representative work-plan dependency closure and Journey Center required work;
- classifier correction for connected physical inventions with companion/mobile/cloud software;
- direct persistence behavior for inventor evidence changes, including canonical invention update, correct gate release, downstream invalidation/requeue, running-work protection, stale findings/deliverables, and execution history;
- validation/decision → physical Patent → candidate generation/scoring → Product Design → Native CAD handoff;
- software-only specification/architecture/security paths without fake physical CAD/manufacturer work;
- hybrid acceptance preserving both applicable physical and software artifact branches;
- regulated consequential outputs staying behind professional-review trust state;
- versioned deliverable persistence using the highest prior version;
- package selection using the newest revision even when the newest revision is stale, preventing an older clean artifact from masking invalidated work;
- professional-review recording with auditable reviewer identity/reference, actionable notes for changes requested, and promotion only after all required assigned reviews are accepted;
- direct manufacturer RFQ/quote and actual sales/launch evidence behavior: matching evidence releases only the correct blocked gate, while removed or mismatched evidence does not release it.

## Evidence, artifact, and maturity rules

InventSmith differentiates inventor statements, sourced facts, estimates, and AI inference. AI prose cannot convert a source into trusted evidence. Patent/prior-art work remains research/readiness, not a patentability, freedom-to-operate, or legal opinion.

Generated CAD remains preliminary until applicable engineering/prototype evidence supports higher maturity. Software plans/specifications cannot be represented as implemented, tested, or deployed software without real execution evidence. Professionally reviewed does not automatically mean authorized for external use.

Real prototype, manufacturer quote, launch/customer, and professional-review gates must never be synthesized from AI output.

## Latest verified repository checkpoint

**Verified clean head:** `c76e209da0c1dd4266ee59157f740c4297048322`  
**GitHub Actions:** workflow run **#586**, run ID `34907940666`  
**Result:** **PASS**

That exact head passed dependency installation, operational-script checks, web TypeScript, Convex TypeScript, the full regression suite, production dependency audit, and the Next.js production build.

PR #24 remained draft/open/unmerged and `main` remained untouched at that verified checkpoint.

The final active-document prose normalization and historical-name corrections advance the branch beyond that verified checkpoint; the live exact-head CI must be checked before the newer head is called fully verified.

## Current implementation order

1. **Engineering/prototype/RFQ maturity enforcement.** Prove CAD and engineering artifacts cannot silently become production-ready without the required engineering/prototype evidence; prove real RFQ/quote evidence refreshes only applicable downstream costing/readiness state; prove removed/replaced evidence invalidates dependent trusted outputs.
2. **Consequential-operation behavioral security.** Expand direct runtime tests for external-use authorization, destructive/privacy actions, billing-sensitive operations, and organization-management boundaries across unauthenticated, cross-tenant, Viewer/Edit/Manage roles.
3. **Artifact quality and packaging.** Verify generated/exported deliverables preserve current revision, limitations, evidence provenance, stale state, maturity, review requirements, and external-use authorization rather than merely existing.
4. **Representative lifecycle acceptance.** Drive physical, software, hybrid, and regulated scenarios farther through actual lifecycle behavior. Prioritize physical/hybrid validation → design → CAD → prototype → RFQ → manufacturing-readiness because truth/maturity mistakes there have the highest consequence.
5. **Prepare the fresh owner-controlled runtime.** Keep Vercel/Convex environment variables, auth, storage, billing/webhooks, provider configuration, and acceptance procedures documented without provisioning paid/live services until the founder is ready.
6. **Live deployment and acceptance later.** After owner-controlled infrastructure exists, run real authenticated multi-user/multi-invention acceptance, provider failure/retry, evidence extraction, usage concurrency, billing/webhooks, physical/software/hybrid journeys, professional review, and live functional verification.
7. **Commercial calibration later.** Lock final seats/storage/premium-work allowances only after representative measured provider/runtime economics support sustainable limits.

## Deployment / acceptance state

- **Planned product destination:** defined in the master product spec.
- **Implemented:** substantial end-to-end journey, organization architecture, classification, evidence, autonomous work, artifacts, physical/software/hybrid routing, professional gates, and Phase 1/2 hardening exist in the repository.
- **Automated verification:** PASS through exact clean head `c76e209da0c1dd4266ee59157f740c4297048322` / workflow run #586; final documentation-content normalization is awaiting exact-head CI.
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

Then fetch the live `inventsmith/full-product-build` branch, draft PR #24, and exact-head CI. Trust the live repository over this document if the branch has advanced. Do not restart completed work, do not merge PR #24, and do not reintroduce MadeThis synchronization. The immediate implementation priority is engineering/prototype/RFQ maturity enforcement followed by consequential-operation behavioral security and artifact-quality acceptance.
