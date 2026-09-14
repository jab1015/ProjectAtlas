# InventSmith Build Progress

**Last updated:** September 14, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally unmerged

## Product vision

InventSmith — The Inventor OS by Modern Methods — is an organization-native operating system that takes an inventor from a raw idea through an evidence-backed journey to market while hiding unnecessary process complexity from the inventor.

The common destination remains:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering where applicable → Prototype → Manufacturing or Software Delivery → Branding → IP / Legal Preparation → Pricing → Marketing → Sales → Funding → Launch → Growth.**

The inventor should not have to manage departments or manually sequence the process. InventSmith owns routing, dependencies, evidence state, work status, human gates, and next actions.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion. No historical pre-InventSmith or controlled-pilot completion percentage should be treated as overall InventSmith completion.

## Hosting and source-of-truth direction

The active owner-controlled target is:

- **GitHub:** `jab1015/ProjectAtlas` — historical repository slug and current source/CI authority. The repository slug may be renamed separately after compatibility review; the customer-facing product is InventSmith.
- **Vercel:** future Modern Methods-owned Next.js deployment.
- **Convex:** future Modern Methods-owned database/auth/storage/functions deployment.

The prior MadeThis-managed environment is retired from the implementation plan. Do not deploy to it, synchronize back to it, modify it, depend on it for repository development, migrate its test data, or copy its secrets. Live Vercel/Convex provisioning has not been performed yet. Repository-green is not the same as deployed or live-functionally-verified.

## Organization architecture

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

Implemented repository foundations include organization-native invention creation/listing; active/archive capacity; Owner/Admin/Member/Viewer/Professional-or-Guest boundaries; invention-level sharing; organization-scoped entitlements and expensive-resource accounting; organization ownership continuity; consent-based invitations; privacy/export/deletion boundaries; and migration compatibility for legacy personal inventions.

## Product classification and dynamic routing

Implemented classification supports physical, software, hybrid, and regulated inventions. Connected physical products with companion/mobile/cloud applications are classified/routed as hybrid when applicable. Pure software avoids irrelevant CAD, physical-prototype, and manufacturer-quote gates. Unsupported harmful/abusive concepts are rejected before normal workspace creation, and business-only concepts are routed outside the invention-product workflow when appropriate.

Stage 5+ root navigation routes into the complete Journey Center instead of trapping users in the retired four-stage workspace.

## Phase 1 production-hardening checkpoint

Phase 1 findings are tracked independently. Do not collapse these into one overall product-completion percentage.

| Area | Implemented state | Automated verification | Remaining boundary |
|---|---|---|---|
| **A — Journey after foundation** | Full 15-stage journey/routing exists; Stage 5+ root redirects to Journey Center | Route/journey regressions pass | Low-priority obsolete wording remains in unreachable legacy root-page branches |
| **B — Partial validation** | Mixed results persist as partial; successful sections are preserved; failed-only retry exists; org-aware recovery state and edit-gated retry exist | Partial/orchestration/recovery tests pass | Live provider failure/retry acceptance remains |
| **C — Confidence truth** | Context-only AI output uses conservative confidence; external-data sections are reduced without independent retrieval; prompt forbids invented evidence/research claims | Confidence regressions pass | Live independent-retrieval calibration remains |
| **D — Evidence promotion** | Model labels alone fail closed; provider-returned source records and exact normalized source/claim association are required before promotion | Evidence-integrity, provider-retrieval, and full-suite regressions pass | Deployed live-provider acceptance/calibration remains |
| **E — Usage accounting** | Attempt costs survive complete/fail/human-gate paths; known cost is not silently zeroed; unknown usage conservatively consumes reserved budget while remaining explicitly unknown | Usage-settlement, organization-usage, orchestration, and full-suite regressions pass | Deployed provider-interruption acceptance remains |
| **F — Behavioral security** | Direct behavior tests cover unauthenticated, cross-user, organization membership, Viewer/Edit/Manage, entitlement, and auditable professional-review boundaries | Behavioral authorization and professional-review regressions pass | Expand destructive, billing, privacy, external-use, and organization-management behavior coverage |
| **G — Worker reliability** | Central workers and Native CAD carry attempt identity; stale/late attempts cannot overwrite newer attempts; lease validity is rechecked before expensive execution; retries are bounded; CAD partial storage is cleaned | Worker lease, orchestration, CAD, and full-suite regressions pass | Deployed concurrency/lease-expiry soak remains |

## Phase 2 representative acceptance progress

Repository acceptance now goes beyond isolated subsystem wiring:

- representative physical, software, hybrid, and regulated work-plan journeys are exercised together;
- acceptance exposed and fixed the connected-hardware + companion/mobile/cloud classifier blind spot;
- direct persistence-level evidence behavior executes `applyInventorEvidenceChange` against a fake datastore and verifies canonical invention update, matching gate release, downstream invalidation/requeue, running/idea-capture protection, stale findings/deliverables, and execution history;
- validation/decision → artifact handoff verifies physical Patent → candidate generation → candidate scoring → Product Design specification → Native CAD;
- software-only acceptance preserves software specification/architecture/security paths without inventing physical CAD/manufacturing work;
- hybrid acceptance preserves both applicable physical and software artifact branches;
- regulated acceptance keeps consequential output behind professional-review trust gates;
- package selection uses the newest deliverable version even when that revision is stale, preventing an older clean artifact from hiding newer invalidated work;
- `completeWork` uses shared deliverable-persistence planning so new artifacts increment from the highest prior version and consequential output begins behind the applicable review gate;
- professional-review recording requires auditable reviewer identity/reference, actionable notes for changes requested, and all required assigned reviews accepted before promotion;
- direct real-world gate behavior verifies actual manufacturer quote/RFQ evidence releases only the manufacturer-quote gate, actual sales/launch evidence releases only the launch gate, and removed/mismatched evidence releases neither.

The Phase 2 boundary is now primarily behavioral and maturity-oriented rather than broad feature wiring.

## Evidence, confidence, and maturity boundary

InventSmith differentiates inventor statements, sourced facts, estimates, and AI inference. Model prose cannot convert a source into trusted evidence. For web research, promotion requires provider-returned retrieval source records plus exact normalized URL/claim association; absent/mismatched retrieval remains fail-closed.

Patent/prior-art material remains research/readiness, not a patentability, freedom-to-operate, or legal opinion. Generated CAD remains preliminary until applicable engineering/prototype evidence supports higher maturity. Software plans/specifications are not represented as implemented/tested/deployed software without real execution evidence. Professionally reviewed does not by itself mean authorized for external use.

## Worker and resource-accounting boundary

Autonomous work claims carry attempt identity. Completion, failure, and human-gate outcomes reject stale ownership. Known incurred model/image/CAD costs are carried into settlement. Unknown provider usage conservatively debits the reserved attempt budget while preserving `usageKnown: false`. Current-attempt identity and lease expiry are checked before provider context is released for general autonomous work and Native CAD.

## Dependency-security checkpoint

Production dependencies remain on the patched lines established during hardening, including Next.js `^15.5.25`, Sharp override `0.35.4`, and fflate override `0.8.3`. The production dependency audit passed at the latest verified checkpoint.

## Exact verified repository checkpoint

**Verified clean implementation head:** `bc93ed606866852e4ec88732e250d243a3db9a40`  
**GitHub Actions:** workflow run **#564** / run ID `34905374828`  
**Result:** **PASS**

That exact PR head passed dependency installation, operational-script checks, web TypeScript, Convex TypeScript, the full regression suite, production dependency audit, and the Next.js production build.

The immediately preceding implementation run #563 was cancelled when the documentation commit advanced the PR head after its regression/audit stages had already passed; #564 verified the resulting newer exact head successfully.

PR #24 remains draft/open/unmerged. `main` remains untouched at this checkpoint.

This status means repository verification is distinct from deployment, live functional verification, and professional review.

## Deployment / live status

- **Implemented:** substantial complete-journey product code, Phase 1 hardening, and expanding Phase 2 behavioral acceptance exist in the repository.
- **Automated verification passed:** yes through exact head `bc93ed606866852e4ec88732e250d243a3db9a40` / workflow run #564.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review:** required for consequential legal, engineering, regulatory, manufacturing, and other gated outputs as applicable; completion must come from real qualified review, not AI inference.

See `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md` for the fresh owner-controlled deployment and acceptance procedure.

## Next implementation priorities

1. **Engineering/prototype/RFQ maturity enforcement.** Prove CAD and engineering artifacts cannot silently advance to production-ready without required engineering/prototype evidence; prove RFQ/quote evidence updates only applicable downstream readiness/costing; prove removed/replaced evidence invalidates dependent trusted output.
2. **Consequential-operation behavioral security.** Add direct runtime tests for external-use authorization, destructive/privacy actions, billing-sensitive operations, and organization-management boundaries, including unauthenticated, cross-tenant, Viewer/Edit/Manage cases.
3. **Artifact quality and packaging.** Verify documents, exports, financial packages, and CAD deliverables preserve newest revision, limitations, evidence provenance, stale state, maturity, review state, and external-use authorization.
4. **Representative lifecycle acceptance.** Drive physical, software, hybrid, and regulated cases farther through actual lifecycle behavior. Prioritize physical/hybrid validation → design → CAD → prototype → RFQ → manufacturing readiness.
5. **Prepare—not provision—the fresh runtime.** Keep owner-controlled Vercel/Convex environment-variable, auth, storage, provider, billing/webhook, and operational requirements current until the founder is ready for live provisioning.
6. **Later live acceptance.** Run real authenticated multi-user/multi-invention, provider failure/retry, evidence extraction, concurrency, billing/webhook, professional-review, and representative lifecycle acceptance after deployment.
7. **Low-priority cleanup.** Remove obsolete “coming soon” or overbroad readiness wording in unreachable legacy UI branches.

## New-chat handoff

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/INVENTSMITH_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`
5. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then fetch live branch `inventsmith/full-product-build`, draft PR #24, and exact-head CI before changing anything. Trust the live branch over this document if it has advanced. Do not merge PR #24, do not restart completed organization/accounting/invitation/classification/artifact-handoff work, and do not reintroduce MadeThis synchronization. Immediate priority: engineering/prototype/RFQ maturity enforcement, followed by consequential-operation security and artifact-quality acceptance.
