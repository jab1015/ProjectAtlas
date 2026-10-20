# InventSmith Scoped Evidence Invalidation Checkpoint

**Date:** October 20, 2026
**Branch:** `inventsmith/full-product-build`  
**Status:** implemented; exact-head CI required before this checkpoint is called verified

## Validation follow-up survey — October 20, 2026

When the newest Validation report is complete, its evidence fingerprint matches current evidence, all sections completed, and average confidence is **50% or lower**, the Validation page prepares a survey for the inventor to share. It first waits for the evidence-request list, then checks for an active Validation follow-up before using the existing `evidenceRequests:create` mutation. The page introduction uses the invention problem/solution context. This client-side check avoids duplicate creation on ordinary reloads; simultaneous tabs are not yet protected by server-side idempotency.

Survey responses continue to create inventor-provided, unverified evidence records and enter the existing evidence-impact/Validation refresh path. Creating the page does not send invitations, messages, or posts. The Validation view makes the next step explicit and shows the copyable link. The threshold triggers more evidence collection; it does not inflate confidence or imply success probability.

Repository regression coverage and local checks pass (130 files / 703 tests; both TypeScript checks; production dependency audit 0 vulnerabilities; Next.js build 36/36). Preview `6ad6c826907d833bcbcb5524` surfaced that `ensureValidationSurvey` was not deployed. The UI now relies on the existing list/create functions instead; verify survey creation, response intake, and refresh in the next Preview.

## Change

Known real-world evidence classes now invalidate the work that actually depends on them instead of forcing a broad rerun of unrelated completed work.

- **Prototype test evidence** refreshes the physical prototype-evidence gate and its downstream prototype/manufacturing-readiness chain.
- **Manufacturer quote/RFQ evidence** refreshes the quote-evidence gate, production unit economics, quote comparison, agreement/readiness work, and their downstream dependents without rerunning unrelated market work.
- **Actual sales/launch evidence** refreshes the launch evidence gate and its downstream performance/growth chain.
- Unknown/general evidence classes retain conservative broad invalidation because their downstream scope cannot safely be inferred from the evidence label alone.

Removing previously relied-on prototype, manufacturer-quote, or launch evidence now fails the corresponding real-world gate closed again instead of merely leaving a previously satisfied gate in a completed state.

For removals, direct source links are removed only where the removed source was actually referenced. Uploading new evidence no longer strips an existing source link merely because the same change event caused downstream work to become stale.

## Safety boundary

Running work is still protected by the existing invention `updatedAt` stale-input check: an evidence change advances the invention timestamp, so a provider result claimed before the change is discarded on completion and requeued rather than persisted as current output.

This checkpoint does not represent deployment, live functional verification, professional review, or manufacturing approval.

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

## Evidence attribution retest — 2026-10-19

The signed-in Netlify Preview now renders `Data_All_260313` as included in the current 11/11-section validation, explicitly inventor-provided and not independently verified. Its report says it matches current evidence, shows the 45% evidence-support score, and retains the caveat that survey data does not independently verify market size, demand, or performance. The earlier stale/refreshing notice is absent. A prepared five-person follow-up survey is displayed as the next step. Its distribution remains controlled by the inventor; this test sent nothing.

## Downstream department evidence audit — 2026-10-19

The Validation report is current and credits inventor-uploaded `Data_All_260313`; it shows 11/11 sections and a 45% evidence-support score. This alone has not produced saved market/design deliverables: Market Research remains at zero deliverables, Patent Readiness is incomplete, Design has 17 queued items, and stages 6–15 wait on prerequisites. Therefore the evidence-crediting behavior passed on Validation, while downstream refresh/persistence behavior has not been live-verified. No worker was started in this audit.

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
