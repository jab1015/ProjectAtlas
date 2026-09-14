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

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion. No historical Atlas or controlled-pilot completion percentage should be treated as overall InventSmith completion.

## Hosting and source-of-truth direction

The active owner-controlled target is:

- **GitHub:** `jab1015/ProjectAtlas` — repository and CI source of truth.
- **Vercel:** future Modern Methods-owned Next.js deployment.
- **Convex:** future Modern Methods-owned database/auth/storage/functions deployment.

The prior MadeThis-managed environment is retired from the implementation plan. Do not deploy to it, synchronize back to it, modify it, delete its data, depend on it for repository development, or copy its secrets into the owner-controlled environment. No MadeThis data migration is required for the current fresh-environment plan.

Live Vercel/Convex provisioning has **not** been performed yet. Repository-green is not the same as deployed or live-functionally-verified.

## Organization architecture

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

Implemented repository foundations include organization-native invention creation/listing; active/archive capacity; Owner/Admin/Member/Viewer/Professional-or-Guest boundaries; invention-level sharing; organization-scoped entitlements and expensive-resource accounting; organization ownership continuity; consent-based invitations; privacy/export/deletion boundaries; and migration compatibility for legacy personal inventions.

## Product classification and dynamic routing

Implemented classification supports:

- **Physical inventions:** applicable Product Design, CAD/engineering, physical prototype and manufacturing flow.
- **Software inventions:** software product design, UX, architecture, data/API, security/privacy, prototype/build, QA/beta and distribution/release flow without irrelevant physical gates.
- **Hybrid inventions:** both applicable branches, including connected physical products with companion/mobile/cloud applications.
- **Regulated inventions:** supported with professional review gates where consequential.
- **Unsupported harmful/abusive concepts:** rejected before normal invention workspace creation.
- **Business-only concepts:** routed outside the invention-product workflow when appropriate.

Stage 5+ root navigation is guarded by `src/app/(app)/invention/[id]/layout.tsx`, which routes the user into the complete Journey Center instead of trapping them in the retired four-stage workspace.

## Phase 1 production-hardening checkpoint

Phase 1 findings are tracked independently. Do not collapse these into one overall product-completion percentage.

| Area | Implemented state | Automated verification | Remaining boundary |
|---|---|---|---|
| **A — Journey after foundation** | Full 15-stage journey/routing exists; Stage 5+ root redirects to Journey Center | Route/journey regressions pass | Legacy unreachable copy in the old root page still contains obsolete wording and should be cleaned when convenient |
| **B — Partial validation** | Mixed results persist as partial; successful sections are preserved; failed-only retry exists; Stage 2 route shows recovery state; org collaborators can view state while retry stays edit-gated | Partial/orchestration/recovery tests pass | Live provider failure/retry acceptance remains for deployed environment |
| **C — Confidence truth** | Context-only AI output uses conservative confidence; external-data sections are reduced without independent retrieval; prompt forbids invented evidence/research claims | Confidence regressions pass | Live independent-retrieval calibration remains |
| **D — Evidence promotion** | Model labels alone fail closed. Web-research work requests provider-returned `web_search_call.action.sources`; sourced claims are bound only to exact normalized URLs the provider reports as retrieved; trace metadata is persisted before reliability/promotion can advance | Evidence-integrity, provider-retrieval and full-suite regressions pass | Deployed live-provider acceptance and continued calibration of source/claim semantics remain |
| **E — Usage accounting** | Attempt costs carry through complete/fail/human-gate paths; known incurred cost is no longer silently zeroed; ambiguous/unknown provider usage conservatively consumes the reserved attempt budget while remaining explicitly marked as unknown rather than fabricated measured cost | Unknown-usage settlement, organization usage, orchestration and full-suite regressions pass | Deployed provider-interruption acceptance remains |
| **F — Behavioral security** | Direct behavior tests cover unauthenticated, cross-user, org membership, viewer/edit/manage, entitlement and auditable professional-review boundaries | Behavioral authorization and professional-review regressions pass | Continue expanding direct runtime behavior tests for destructive, billing/privacy and organization-management operations |
| **G — Worker reliability** | Central workers and Native CAD carry attempt identity; stale/late attempts cannot overwrite newer attempts; CAD partial storage is cleaned; retries are bounded; current-attempt and lease validity are rechecked before expensive provider execution | Worker lease, orchestration, CAD and full-suite regressions pass | Deployed concurrency/lease-expiry soak remains |

## Phase 2 representative acceptance progress

Repository acceptance now goes beyond isolated subsystem wiring:

- representative physical, software, hybrid and regulated work-plan journeys are exercised together;
- the acceptance layer exposed and fixed a real classification blind spot where connected hardware with a companion/mobile/cloud application could be misclassified as physical-only;
- direct persistence-level evidence behavior executes `applyInventorEvidenceChange` against a fake datastore and verifies canonical invention-record update, matching real-world evidence-gate release, downstream work invalidation/requeue, preservation of running and idea-capture work, stale findings/deliverables, and execution-event history;
- validation/decision → artifact handoff acceptance verifies the physical patent/design handoff transitively through candidate generation → candidate scoring → Product Design specification → Native CAD;
- software-only acceptance preserves software specification/architecture/security paths without inventing physical CAD/manufacturing work;
- hybrid acceptance preserves both physical and software artifact branches from the same evidence-backed handoff;
- regulated acceptance keeps consequential output behind professional-review trust gates;
- package selection uses the newest deliverable version even when that newest revision is stale, preventing an older clean artifact from hiding newer invalidated work;
- `completeWork` uses shared `buildDeliverablePersistencePlan` logic so new artifacts increment from the highest prior version and consequential output begins as `professional_review_required`;
- professional-review recording requires an auditable reviewer identity/reference, requires actionable notes when changes are requested, and promotes only after every assigned required review is accepted;
- direct real-world gate behavior now verifies that actual manufacturer quote/RFQ evidence releases only the manufacturer-quote gate, actual sales/launch evidence releases only the launch gate, and removed or mismatched evidence does not release either gate.

The current Phase 2 repository boundary is increasingly behavioral rather than wiring-only. Remaining work is focused on artifact-quality/maturity behavior, additional consequential-operation security tests, and deployed/live acceptance after owner-controlled hosting is provisioned.

## Validation recovery implementation

Current validation recovery includes PARTIAL final state, failed-only retries that preserve prior successes, conservative UI/view-state inference, an organization-aware content-minimal recovery query, and edit-gated failed-only retry controls.

## Evidence and confidence boundary

InventSmith differentiates inventor statements, sourced facts, estimates and AI inference. Model prose cannot convert a source into trusted evidence.

For web-research work, InventSmith requests provider-returned web-search source records from the OpenAI Responses API. A source can move beyond unverified only when the stored source locator exactly matches a normalized provider-returned URL and a structured sourced-fact claim is associated with that same URL. Retrieval time, provider identity/title where available, and the claim-to-source association are persisted as trace metadata. The claim-support text is an association record, **not a verbatim quote from the source**. If provider source records are absent or the URL/claim association does not match, promotion remains fail-closed.

Patent/prior-art material remains research/readiness, not a patentability, freedom-to-operate or legal opinion. Generated CAD remains preliminary until applicable engineering/prototype evidence supports a higher maturity state. Software plans/specifications are not represented as implemented/tested/deployed software without real execution evidence.

## Worker and resource-accounting boundary

Autonomous work claims carry attempt identity. Completion, failure and human-gate outcomes reject stale ownership. Known incurred model/image/CAD costs are carried into settlement instead of being silently recorded as zero. Late-attempt settlement uses execution-event evidence for idempotency, and Native CAD cleans stored artifacts when generation fails before a valid commit.

When provider usage is ambiguous, InventSmith conservatively debits the reserved attempt budget while preserving `usageKnown: false`. Current-attempt identity and lease expiry are also checked before provider context is released for general autonomous work and Native CAD.

## Dependency-security checkpoint

Production dependencies were updated to remove the high/critical production audit blockers identified during hardening:

- Next.js patched 15.5.x line (`^15.5.25` at this checkpoint).
- Sharp override `0.35.4`.
- fflate override `0.8.3`.

At the latest verified clean implementation checkpoint before the newest gate-behavior test, the production dependency audit reported **0 vulnerabilities**.

## Exact verified repository checkpoint

**Verified clean implementation head:** `f9116098592f2f49969858a6952f03672233472c`  
**GitHub Actions:** Atlas CI run **#561** / run ID `34904736891`  
**Result:** **PASS**

That exact PR-head verification passed dependency installation, operational-script checks, web TypeScript, Convex TypeScript, the full regression suite, production dependency audit, and the Next.js production build.

**Newest implementation head under verification:** `03689abd5cac2ea1e7a3970e97c1d3b552968a3e`  
**GitHub Actions:** Atlas CI run **#563** / run ID `34905278858`  
**State at this document update:** queued behind the preceding clean-head run; do not treat it as verified until the run completes successfully.

This status means repository verification is distinct from deployment, live functional verification, and professional review.

## Deployment / live status

- **Implemented:** substantial product, Phase 1 hardening, and expanding Phase 2 behavioral acceptance code exists in the repository.
- **Automated verification passed:** yes through the clean checkpoint above; newest gate-behavior head is still being verified at this document revision.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review:** required for consequential legal, engineering, regulatory, manufacturing and other gated outputs as applicable; completion must be recorded from real qualified review, not inferred from AI output.

See `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` for the fresh owner-controlled deployment and acceptance procedure.

## Next implementation priorities

1. **Continue artifact-quality and maturity behavior.** CAD, documents, exports and commercial deliverables must preserve limitations, current revision, maturity and review state rather than merely exist.
2. **Continue consequential-operation behavioral security tests.** Prefer direct behavior tests for destructive, billing, privacy and organization-management boundaries.
3. **Deepen real-world engineering/prototype/RFQ acceptance.** Continue from real evidence-gate release into refreshed assessment/readiness without fabricating physical or commercial facts.
4. **Prepare—not provision—the fresh runtime.** Keep Vercel/Convex environment-variable ownership, auth, webhook/billing and operational requirements documented until the owner is ready to create the actual services.
5. **Low-priority cleanup:** remove obsolete “coming soon” / overbroad readiness wording remaining in unreachable legacy root-page branches.

## New-chat handoff

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/ATLAS_DEPLOYMENT_RUNBOOK.md`
5. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then fetch live branch `inventsmith/full-product-build` and draft PR #24 before changing anything. Trust the live branch and exact-head CI over this document if the branch has advanced. Do not merge PR #24, do not restart completed organization/accounting/invitation/classification/artifact-handoff work, and do not reintroduce MadeThis synchronization instructions.
