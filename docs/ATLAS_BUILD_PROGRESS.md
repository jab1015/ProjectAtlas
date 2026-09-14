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

No historical Atlas or controlled-pilot completion percentage should be treated as overall InventSmith completion.

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
- **Hybrid inventions:** both applicable branches.
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
| **D — Evidence promotion** | Model labels alone fail closed; trust promotion requires traceable retrieval timestamp, exact URL and claim support; fabricated citations/prompt injection cannot promote evidence | Evidence-integrity regressions pass | Positive production path that records real retrieval-source/claim-support metadata still needs completion |
| **E — Usage accounting** | Attempt costs carry through complete/fail/human-gate paths; known incurred cost is no longer silently zeroed; reservations settle through shared user/org accounting | Typechecks/regressions pass | Further behavior coverage for unknown-cost/provider interruption cases is still useful |
| **F — Behavioral security** | Direct behavior tests cover unauthenticated, cross-user, org membership, viewer/edit/manage and entitlement boundaries | Behavioral authorization regressions pass | Continue expanding direct runtime behavior tests for especially consequential operations |
| **G — Worker reliability** | Central workers and Native CAD carry attempt identity; stale/late attempts cannot overwrite newer attempts; CAD partial storage is cleaned; retries bounded | Typechecks/regressions pass | Add pre-provider lease/current-attempt validation so an already-expired worker cannot spend another provider call before commit rejection |

## Validation recovery implementation

Current validation recovery now includes:

- PARTIAL final state when at least one requested section succeeds and another fails;
- failed-only retries that preserve prior successes and their completed count;
- conservative UI/view-state inference when an older normalizer omits the top-level partial status;
- `validationResearchRecovery:getValidationRecoveryState`, an organization-aware, content-minimal query returning only state and counts;
- route-level Stage 2 recovery banner with a failed-only retry control for Edit/Manage users;
- read-only/reviewer users may see recovery state but do not gain retry permission.

## Evidence and confidence boundary

InventSmith differentiates inventor statements, sourced facts, estimates and AI inference. Model prose cannot convert a source into trusted evidence.

A source is currently eligible for promotion only when fresh traceable retrieval metadata exists, the recorded retrieval URL exactly matches the stored normalized locator, and non-empty claim-level support was captured. This is deliberately fail-closed until the positive retrieval-record integration is completed.

Patent/prior-art material remains research/readiness, not a patentability, freedom-to-operate or legal opinion. Generated CAD remains preliminary until applicable engineering/prototype evidence supports a higher maturity state. Software plans/specifications are not represented as implemented/tested/deployed software without real execution evidence.

## Worker and resource-accounting boundary

Autonomous work claims now carry attempt identity. Completion, failure and human-gate outcomes reject stale ownership. Known incurred model/image/CAD costs are carried into settlement instead of being silently recorded as zero. Late-attempt settlement uses execution-event evidence for idempotency, and Native CAD cleans stored artifacts when generation fails before a valid commit.

The next worker-hardening step is to validate the lease/current attempt immediately before an expensive provider call, reducing wasted spend when a worker has already expired.

## Dependency-security checkpoint

Production dependencies were updated to remove the high/critical audit blockers identified during this hardening pass:

- Next.js moved to the patched 15.5.x line (`^15.5.25` in the manifest at this checkpoint).
- Sharp override moved to `0.35.4`.
- fflate override moved to `0.8.3`.

The regenerated lockfile is committed. The normal CI dependency audit passes at the verified checkpoint below.

## Exact verified repository checkpoint

**Verified head:** `692d4577e5a0b07da9e37fd2f71cc8d41077c676`  
**GitHub Actions:** Atlas CI run **#520** / run ID `34873125860`  
**Result:** **PASS**

The exact PR-head verification passed:

- dependency installation;
- operational-script syntax checks;
- web TypeScript;
- Convex TypeScript;
- **395 / 395 regression tests** across 71 test files;
- production dependency audit at the configured high-severity gate;
- Next.js production build.

This status means **automated repository verification passed** for that exact SHA. It does **not** mean the app is deployed, live-functionally-verified, or professionally reviewed.

## Deployment / live status

- **Implemented:** substantial product and Phase 1 hardening code exists in the repository.
- **Automated verification passed:** yes, at the exact checkpoint above.
- **Deployed to owner-controlled Vercel/Convex:** no.
- **Live functionally verified:** no.
- **Professional review:** required for consequential legal, engineering, regulatory, manufacturing and other gated outputs as applicable; completion must be recorded from real qualified review, not inferred from AI output.

See `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` for the fresh owner-controlled deployment and acceptance procedure.

## Next implementation priorities

1. **Complete the positive evidence-retrieval path.** Persist real trusted retrieval/source records and claim-support metadata from supported provider tooling, then allow promotion only through that traceable record.
2. **Add pre-execution attempt/lease validation.** Prevent expired or superseded workers from making another expensive provider call before they discover they no longer own the work.
3. **Deepen representative end-to-end repository acceptance.** Exercise create invention → evidence → extraction → validation/research → decision → versioned package/artifact using physical, software and hybrid fixtures, while preserving real-world evidence gates.
4. **Continue artifact-quality and safety review.** CAD, documents, exports and commercial deliverables must be checked for content quality, versioning, limitations and appropriate maturity labels—not just file existence.
5. **Prepare—not provision—the fresh runtime.** Keep Vercel/Convex environment-variable ownership, auth, webhook/billing and operational requirements documented until the owner is ready to create the actual services.

## New-chat handoff

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/ATLAS_DEPLOYMENT_RUNBOOK.md`
5. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then fetch live branch `inventsmith/full-product-build` and draft PR #24 before changing anything. Treat `692d4577e5a0b07da9e37fd2f71cc8d41077c676` / Atlas CI #520 as the latest fully verified checkpoint **unless the live branch has advanced and a newer exact-head run is green**. Do not merge PR #24, do not restart completed organization/accounting/invitation/classification work, and do not reintroduce MadeThis synchronization instructions.
