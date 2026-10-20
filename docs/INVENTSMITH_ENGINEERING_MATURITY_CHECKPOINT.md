# InventSmith Engineering Maturity Checkpoint

**Updated:** October 20, 2026
**Branch:** `inventsmith/full-product-build`  
**Status:** engineering-review and deliberate manufacturing-release transitions implemented and behavior-tested; live qualified acceptance remains

## October 20 workflow and inventor-guidance checkpoint

The inventor-facing workflow now routes Stage 5+ users to the full Journey Center instead of the retired “coming soon” page. The Journey Center presents one plain-language next action while preserving the existing approval, expert-review, evidence, and physical-work boundaries. A low-confidence Validation report can prepare a survey page automatically, but distribution remains the inventor’s choice; collected answers remain unverified evidence until appropriately assessed.

Local verification for this checkpoint passed 130 test files / 703 tests, both TypeScript checks, the production dependency audit with 0 vulnerabilities, and the Next.js production build with 36/36 static pages. No live CAD generation, engineering review, physical prototype, manufacturer acceptance, supplier contact, or release action is claimed. The updated code has not yet been verified in the Netlify Preview.

## Manufacturing-readiness hardening

InventSmith distinguishes dependency completion from consequential engineering maturity. Final `manufacturing_readiness` now requires the applicable dependency chain plus the latest fresh reviewed engineering artifacts rather than trusting status alone.

Current final boundary requires:

- latest fresh professionally reviewed `prototype_readiness_assessment`;
- latest fresh professionally reviewed `manufacturer_rfq_package`;
- latest fresh professionally reviewed `manufacturing_drawing_specification`;
- newest `native_cad_package` to be fresh, professionally reviewed/authorized, and at least `engineering_reviewed` artifact maturity.

`native_cad_package` itself now requires engineering professional review. A newer preliminary, stale or unreviewed CAD revision defeats an older reviewed revision. Early manufacturing process research, factory requirements, sourcing, draft RFQ work and genuine quote evidence remain available before final readiness.

## Implemented maturity transitions

Accepted auditable engineering review of the exact newest fresh native-CAD revision promotes that artifact from `preliminary_cad` to `engineering_reviewed` only after every exact required review is accepted. Older, ambiguous, stale, changes-requested, or incompletely reviewed revisions fail closed. Review replay is idempotent; reopening review revokes engineering maturity and any prior manufacturing release.

A separate manager-only mutation releases one complete synchronized newest six-artifact native-CAD generation from `engineering_reviewed` to `manufacturing_released`. It revalidates freshness, exact professional reviews, synchronized version, generation completeness, authority, and audit evidence. The Design Studio exposes this transition with explicit confirmation. Release does not change external-use authorization and does not contact a supplier, disclose files, purchase, pay, order production, file, publish, or start production.

## Remaining engineering-maturity work

Verify the full physical/hybrid chain in an owner-controlled live runtime with genuine evidence and qualified review:

**design → drawings/CAD → prototype evidence → prototype readiness → RFQ → real quote → comparison/agreement → manufacturing readiness**.

## Safety boundary

This checkpoint does not claim deployment, live functional verification, actual engineering approval, physical prototype testing, manufacturer acceptance, supplier contact, a production order, or real-world manufacturing release. Repository artifact-maturity transitions are implemented; genuine external facts still require genuine records/evidence.

### October 20, 2026 — authenticated PR #24 Preview acceptance

Netlify Deploy Preview `6ad6c9cbe5ef4c10168cd3e8` for head `9d4a5c2` built successfully (`npx next build`, 36/36 pages; no Convex CLI) and was checked in the inventor’s signed-in session. Validation now shows **complete, 11/11 sections, current evidence, 45% evidence-support confidence**, credits the uploaded `Data_All_260313` survey and its extracted findings, and clearly labels it inventor-provided/unverified with limits on demand, market size, and performance claims. Because confidence is at or below 50%, the page prepared an active follow-up survey link and a plain next step to share it with five people. The public respondent page loaded all five questions and the provenance/privacy note; no response was submitted.

Journey Center and the Validation page had conflicting next-step copy: Journey Center said “Continue Validation” while Validation offered the prepared survey. A local change now detects the active `[Validation follow-up]` survey and changes Journey Center’s next action to “Share your prepared survey with five people who may have this problem, then add their answers as evidence.” Focused regression tests (4), web and Convex TypeScript checks, and `git diff --check` pass. This small alignment change is not yet in the tested Preview; its PR update and Preview acceptance remain pending.

The journey view also shows 1/15 stages done, Validation 0/2 tasks, Market Research needing a retry, and no saved results in the later stages. Agent profiles and routing are implemented and covered by tests, but live successful work/save/handoff has not been verified in each department. Treat full department deployment as incomplete until controlled acceptance proves outputs and evidence links per department. The survey is prepared but not distributed; no external messages, respondent data, AI generation, production publish, or PR merge occurred.

### October 20, 2026 — Journey Center Preview compatibility correction

Authenticated retest of Preview `6ad6cb3025118d39094ac8cf` confirmed the survey link remains available, but Journey Center still displayed “Continue Validation.” The deployment builds the website only; it does not deploy Convex functions, so the server-side wording adjustment was not live. The correction now reads the existing, already-working `evidenceRequests:list` query in the Journey Center page and displays the survey-sharing instruction when an active `[Validation follow-up]` exists. The unsupported Convex query change was removed. Focused regression coverage must be rerun, and this UI-only fix still needs a pushed commit and its own authenticated Preview check. No Convex or production deployment was made.

### October 20, 2026 — final authenticated Preview result

Netlify Preview `6ad6cc30d1357a83bd6def1a` for app commit `56018db` completed successfully with `npx next build` and 36/36 pages. The signed-in RiseJars Journey Center now displays: “Share your prepared survey with five people who may have this problem, then add their answers as evidence.” This correction reads the working `evidenceRequests:list` query in the page, so no Convex deploy is required. The signed-in Validation route continues to show the complete current 11/11-section report at 45%, with the uploaded `Data_All_260313` survey credited and its inventor-provided/unverified limits stated. The active public response page rendered all five survey questions. No response was submitted, and the survey was not distributed.

Latest app-source checks: focused next-step/journey tests **4/4 passed**, web TypeScript passed, and Netlify’s Next.js build completed. The full repository suite passed immediately before this small page-only compatibility correction (**130 files / 703 tests**); the focused regressions were rerun after it. The paired Production-context build was canceled, and Netlify Auto Publishing remains locked. PR #24 remains open/unmerged.

Live department execution is still not established: Journey Center reports 1/15 stages done, Validation 0/2 tasks, Market Research needs a retry, and no saved results for downstream departments. The repository covers 21 department-agent profiles/routing with automated tests, but each department still needs controlled live output and handoff acceptance. The current browser account lacks admin access for operations review; no new agent batch, paid generation, or production backend deployment was run.

## Engineering retest evidence — 2026-10-19

- Preview acceptance: authenticated Validation page correctly attributes inventor-uploaded survey findings, presents provenance/limitations, current evidence state, 45% evidence-support score, and prepared survey next step.
- Route smoke: 15/15 stage URLs rendered. Not equivalent to successful stage-level agent execution. Growth showed 0/5 completed, five queued, and zero saved deliverables.
- Regression suite: 130 files, 703 tests passed.
- Local build reproducibility: blocked at Convex codegen due missing target env in checkout. Netlify Preview deploy build succeeded.
- Remaining maturity gap: run safe, cost-bounded end-to-end agent execution tests per department with prerequisites satisfied; verify persisted artifact, evidence references, retry/idempotency and user-visible handoff for each.

## Department execution maturity — 2026-10-19

**Routing maturity:** 21 distinct profiles; all product work-plan assignments resolve to registered agents, and the prompt binds the selected agent mission/guardrails. Regression tests cover both general orchestration and native CAD.

**Hosted route maturity:** all 15 stage routes load successfully. Current RiseJars acceptance state is Idea done, Validation 11/11 current at 45%, Market Research with zero saved market deliverables, Patent Readiness incomplete, Design 0/17, and downstream stage queues waiting on prerequisites.

**Execution maturity:** insufficient for a claim that every department works end to end. No live provider job was run; per-department output persistence, evidence citation, retries, and handoffs still need acceptance under a visible usage cap.

## Lifecycle agent-routing defect fixed — 2026-10-19

The audit found that lifecycle initialization saved display labels (for example, `Prototype`) where provider routing requires registered keys (for example, `prototype`). Such work could fail at execution with “missing a registered department agent.” Lifecycle initialization now derives and validates the registered key from the stage label before queueing work. Regression coverage checks all 10 lifecycle departments resolve to their own stable agent identity, mission prompt, and audit metadata, and verifies the initializer uses this mapping.

Verification after the fix: focused agent/lifecycle tests **18/18 passed**; full suite **130 files / 704 tests passed**; web TypeScript **passed**. This is not yet live provider acceptance: no workers were started because the signed-in account does not display remaining shared AI/research/CAD usage. A fresh Netlify Preview for the code fix is the next verification gate.


### Department isolation and current verification — October 20, 2026

The Product Design “Continue design work” action (stage 5) and lifecycle department “Continue” action (stages 6–15) now carry their requested stage ID through the authenticated scheduler, worker pool, retries, and atomic work selector. The selector recognizes both canonical `stageId` and lifecycle `departmentStageId` tags, only claims work items tagged for the requested department, and counts active work invention-wide for concurrency safety. This prevents a department check from silently processing unrelated departments. Dependency prerequisites must already be complete; a scoped run will stop cleanly if its department has no eligible work. General background work without a stage ID retains the existing invention-wide behavior.

A regression test covers stage isolation and the shared concurrency cap. Current local checks: **130 test files / 705 tests passed; TypeScript passed**. The focused department routing and work-selector tests passed **18/18**. The routing and isolation changes have been pushed to the PR branch; Netlify Preview acceptance is pending for the latest commit. Netlify Preview for routing commit `7178a89` is currently building; neither live provider-backed department completion nor generated artifacts are yet verified. Shared AI/research/CAD usage remaining is not visible in the signed-in account, so do not trigger a live run until a bounded usage ceiling is known.


### Final authenticated Preview acceptance — October 20, 2026

Netlify Deploy Preview **`6f2d15a`** completed successfully for PR #24 (Next.js build generated all **36/36** static pages). Signed-in smoke tests loaded all 15 inventor journey stages and verified each expected page title without an app-level error. Validation is current at **11/11 sections, 45% evidence-support confidence**; the page explicitly says `Data_All_260313` was included, identifies it as inventor-provided/unverified, displays the inventor-shareable survey link, and no longer shows the stale/refreshing message. The 45% value is a support score, not a probability of success.

Autonomous work isolation is implemented for Product Design/CAD (stage 5) and the lifecycle departments (stages 6–15): the selected stage ID follows the authenticated scheduler, worker pool, and retries; work selection recognizes canonical and lifecycle stage tags and preserves invention-wide concurrency limits. Agent registration/routing and scoped selection are covered by deterministic tests. Local verification: TypeScript passed; **130 test files / 705 tests passed**. The browser emitted extension metadata errors only; no InventSmith page errors were observed.

**Remaining acceptance boundary:** no live model, research, rendering, or CAD worker was started, so per-agent generated output, saved artifact, evidence citations, retries, and downstream handoffs are not yet end-to-end verified. This account does not expose remaining shared AI/research/CAD capacity. Do not run provider-backed work until a usage ceiling can be enforced. The ordinary Production deploy remains unpublished; the Production-context build for `6f2d15a` was canceled, and Netlify auto-publishing remains locked.

### Authenticated department execution check — October 19, 2026

The signed-in PR #24 Netlify Preview renders the Validation report with the uploaded `Data_All_260313` survey explicitly included, current evidence language, the 45% evidence-support score, and the survey link; the previous stale/refreshing confidence message is absent. A live Product Design + CAD run exposed a hard Preview/backend mismatch: the frontend sends `departmentStageId: 5`, while the Convex function deployed at the Preview's configured test target (`quick-fox-785`) rejects that field as unknown. The run did not start and no generated department artifact or provider usage is claimed. Lifecycle stage 6 also remains queued with prerequisites unmet; no fabricated upstream evidence was added.

The authenticated Convex CLI session is not present in this workspace. Its device-login flow requires account authentication through Convex before the isolated test backend can receive the already-pushed server code. The attempt was stopped before authentication or deployment. Production and the other Convex deployments were not touched. Full department acceptance remains blocked until authenticated access to `quick-fox-785` is available, followed by deploying the matching PR code and re-running each eligible department against its real upstream evidence and gates.
