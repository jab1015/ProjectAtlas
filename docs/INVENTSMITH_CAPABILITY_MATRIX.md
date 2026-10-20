# InventSmith Capability Matrix

**Updated:** October 20, 2026 (America/New_York)
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified CI checkpoint:** `93744db1fdf2772925f96dbc4d33ed1823192f86` (CI #226). Later operations-console compatibility changes were preview-accepted but await exact-head CI.

## Status vocabulary

- **Planned** — required by the current product specification.
- **Implemented** — repository code exists.
- **Automated verification passed** — the exact relevant implementation passed deterministic checks.
- **Deployed** — the exact implementation/config is on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated behavior was exercised there.
- **Professional review completed** — genuine qualifying review was actually recorded.
- **Real-world evidence present** — genuine outside-world evidence was actually ingested/verified.
- **External action executed** — an outside-world side effect actually occurred and was separately recorded.

No overall completion percentage is asserted.

### Current implementation checkpoint — October 20, 2026

Working-tree changes prepare a shareable survey automatically when a complete, current Validation report averages 50% or less. The UI checks the existing request list before using the already-deployed survey-create endpoint, shows the link, and explains how to share it. The introduction is tailored; response provenance remains inventor-provided/unverified, and no recipients are contacted. The Stage 5+ legacy route now opens the Journey Center. The first Preview for `805eeb7` showed the new backend mutation was absent; a compatibility fallback is being added and still needs Preview verification. Local checks pass **130 test files / 703 tests**, web and Convex TypeScript, production dependency audit (**0 vulnerabilities**), and `npx next build` (**36/36 pages**). `npm run build` is blocked at Convex codegen because this environment has no access token; direct Next build passes.

## Naming / infrastructure

Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**. The historical repository slug `jab1015/ProjectAtlas` and selected `atlas*` / `ATLAS_*` compatibility identifiers remain only where tested migration has not yet occurred.

MadeThis is retired/historical. The Convex deployment `fiery-gazelle-628` belongs to another application and is excluded from InventSmith work. The intended InventSmith test deployment is `dev/inventsmith-test` (`quick-fox-785`); its current code and auth configuration are unverified. Prior purported test deploy runs actually targeted production `agile-seahorse-379`. Modern Methods-owned Vercel/frontend deployment and authenticated browser acceptance remain separate acceptance dimensions.

### Limited production checkpoint

Convex production `agile-seahorse-379` has a deliberately limited password-recovery backend deployment. Existing production functions and data were preserved; PR #24 remains unmerged and the full unverified product was not deployed. The Netlify PR #24 preview has live-functionally verified password recovery through successful reset-email delivery, code entry, and sign-in.

## Current capability state

| Capability | Repository state | Automated state | Deployment/live state | Remaining boundary |
|---|---|---|---|---|
| Complete applicable journey/navigation | implemented | representative regressions passed; completion semantics locked | newest head not claimed live | deeper persisted lifecycle acceptance |
| Password recovery | implemented | recovery flow and auth backend checks passed | live-functionally verified on the PR #24 preview against limited Convex production | broader authenticated acceptance and final release decision |
| Dedicated AI agent per department | implemented: 21 stable profiles | routing/prompt/audit/fail-closed coverage passed | newest head not claimed deployed | provider-backed authenticated executions for every department |
| Physical/software/hybrid/regulated routing | implemented | representative routing covered | not live-accepted | persisted/live acceptance |
| Organization-native tenancy/access | implemented | direct authorization, ownership, member, sharing and owner-precedence behavior covered | not live multi-user accepted | deeper live multi-user cases |
| Selected beta access and credits | implemented | admin-only dated overrides, append-only credit ledger, effective-plan enforcement, reservation settlement, deletion/export coverage | source implementation present; no verified deployment to `quick-fox-785`; live admin workflow not accepted | exercise selected-account grant/revoke and credit adjustment with disposable testers |
| Secure organization invitations | implemented | exact account/email binding, expiry and current seat-capacity directly tested | not live multi-user accepted | authenticated live acceptance |
| Invention sharing/grants | implemented | active same-org target requirement, exact insert/update, stale-grant cleanup directly tested | not live multi-user accepted | live grant/revocation acceptance |
| Evidence provenance/trust | implemented | fail-closed evidence tests established | not live-calibrated | provider-backed calibration |
| Low-confidence survey follow-up | implemented in this checkpoint | current-report/fingerprint/50% cutoff and active-link lookup regressions passed | first Preview found missing new mutation; compatibility fallback pending Preview | authenticated link creation and response refresh acceptance |
| Plain-language next step / later-stage routing | implemented in this checkpoint | route and journey copy regressions passed | awaiting exact-head Preview test | verify each department link and prerequisite experience live |
| Worker attempt/lease reliability | implemented | deterministic regressions established | not live-soak-tested | concurrency/soak |
| Usage settlement/accounting | implemented | deterministic paths plus deletion reserved-usage release covered | not production-integrated | provider interruption economics |
| Professional-review audit state | implemented | direct mutation/replay/invalidation covered | genuine review not generalized | qualified real reviews |
| Native CAD / manufacturing maturity | implemented foundation | revision/freshness/review/release regressions established | not engineering-live-validated | genuine engineering/manufacturing acceptance |
| Real prototype/quote/launch evidence gates | implemented | direct behavior covered | only genuine outside evidence counts | representative real evidence |
| Account/privacy/invention deletion | implemented | destructive guards, execution ordering, cleanup/storage/accounting directly tested | not live-destructive-tested | disposable live acceptance |
| Personal / organization export scope | implemented | company/studio separation and owner-only billing attribution covered | not live-accepted | representative export inspection |
| Subscription event application | implemented | duplicate/invalid-target/exact-org/legacy/ownership-transfer behavior directly tested | provider not owner-live | real provider lifecycle acceptance |
| Subscription lifecycle semantics | implemented | cancellation/past-due period-end, unpaid downgrade, user/personal-org mirror directly tested | provider not owner-live | real provider timing acceptance |
| Subscription event ordering | implemented | delayed older events rejected; equal timestamps deterministic independent of arrival order for org + legacy scopes | provider not owner-live | live delayed/replay acceptance |
| Signed subscription HTTP ingress | implemented | secret/signature, malformed/oversized payload, UTF-8 byte limit, normalization and exact mutation handoff directly tested | not owner-live | provider callback acceptance |
| Fulfillment replay handling | implemented | duplicate sales suppression, platform/Stripe replay and authoritative stored token directly tested | provider not owner-live | real checkout replay acceptance |
| Signed fulfillment HTTP ingress | implemented | signature/body validation, no-side-effect rejects, product lookup, new/replay mutation order directly tested | not owner-live | real provider fulfillment acceptance |
| Authorized download delivery | implemented | malformed external ID fail-closed, token/status checks, product-scoped file selection, storage availability and accounting-before-redirect directly tested | not live-accepted | owner-controlled storage/download acceptance |
| Checkout success truth | implemented | public redirect/query string cannot emit authoritative upgrade-completed analytics; only checkout-return event recorded | not live-accepted | bind future confirmed conversion analytics to provider-backed state |
| Package external-use safety | implemented | stale/quality/exact authorization/duplicate-newest/empty-content fail-closed coverage | not live-accepted | rendered artifact QA |
| Exact-revision external-use authorization | implemented | exact latest/fresh manager authorization and non-execution semantics covered | not live multi-user accepted | persisted/live acceptance |
| Consequential external approval scope | implemented | exact artifact request/approval/execution-time revalidation covered | no external executor exists | preserve guard; separately audit future executor |
| Production dependency security | implemented in lock/workflow | verified checkpoint has 0 production vulnerabilities | repository-only state | continue patch discipline |
| Development dependency audit boundary | implemented | only known Next/ESLint lint-chain advisories accepted | repository-only state | upstream fixes or safe migration |
| Exact-head CI integrity | implemented | PR head checkout/assertion; pinned actions; no persisted credentials | repository-only state | keep enforced |
| Authentication dependency modernization | Lucia v3 currently in use | current auth/type/build gates pass | migration not performed | deliberately plan/test replacement |
| Owner-controlled Convex path | partially executed | dedicated test deployment `quick-fox-785` exists but current code is unverified; workflow logs show prior runs targeted `agile-seahorse-379`; `fiery-gazelle-628` is another app | production received unintended broader function deployment; no further deployment allowed; branch head `0a90b9f` has a Netlify preview; newest local fixes are not deployed | perform authenticated acceptance |
| Owner-controlled Convex production path | limited deployment | password-recovery backend deployed and health/auth acceptance verified | limited live acceptance only | preserve existing functions/data while expanding scope deliberately |
| Owner-controlled Vercel/frontend path | preview exists | repository build passes | PR #24 preview authenticated; password recovery and operations console preview-verified | point a test preview at the dedicated InventSmith test deployment |
| InventSmith operations console | implemented | page code and compatibility fallback verified locally | refreshed preview works; AI details intentionally unavailable from limited production response | verify against full test deployment and exercise a controlled failed work item |
| Billing/webhooks | substantial backend/security foundation | signed ingress, lifecycle, ordering, fulfillment, replay/download and checkout-truth behavior covered | not owner-live | provider/live lifecycle acceptance |
| Commercial cost calibration | instrumentation foundation exists | partial | not production-measured | measured provider/runtime economics |

## Latest exact CI truth

InventSmith CI **#226**, run `39016181734`, passed at exact code head `93744db1fdf2772925f96dbc4d33ed1823192f86`.

Checkpoint results:

- **116 test files passed**;
- **660 tests passed**;
- production dependency audit: **0 vulnerabilities**;
- accepted development-only advisory packages limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** build passed with **32/32** static pages generated;
- Lucia `3.2.2` deprecation remains a separate auth-migration item.

This documentation refresh creates a newer head and therefore requires exact-head CI before the documentation head itself is called automatically verified.

## Immediate tracker

1. Exact-head CI for the final documentation-refresh head.
2. Owner-controlled live provider lifecycle acceptance: signatures, checkout confirmation, cancellation/past-due, delayed/replayed events, fulfillment/download, ownership transitions, and browser-visible entitlement changes.
3. Representative persisted physical/software/hybrid/regulated lifecycle acceptance through replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Artifact/rendered export and generated-format quality.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Remaining low-risk customer-facing naming cleanup.
7. Verify the dedicated InventSmith test deployment `dev/inventsmith-test` (`quick-fox-785`), including selected beta access and credit controls; never reuse `fiery-gazelle-628`.
8. Provider/concurrency and commercial calibration.
9. Deliberately planned/tested Lucia migration.

PR #24 remains draft/open/unmerged; `main` remains untouched.

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

## Live Preview evidence — 2026-10-19

| Capability | Retest result | Boundary |
|---|---|---|
| Validation evidence attribution | Passed in signed-in Netlify Preview | Uploaded survey is credited with provenance and limits; inventor-provided and unverified status remains explicit. |
| Validation refresh state | Passed | Report says it matches current evidence; confidence is visible at 45%. |
| Follow-up survey preparation | Passed | Link is prepared and copyable. Inventor chooses distribution; responses are not fabricated or sent by the app. |
| Stage routing | 15/15 URLs rendered the app shell in Preview | Route smoke test does not prove each department's agent can execute and save outputs. |
| Department execution | Not fully verified | Growth showed 0/5 complete, five queued behind prerequisites, and no deliverables. No AI jobs were run in this retest. |
| Automated tests | Passed | 703 tests across 130 files. |
| Local deployment readiness/build | Blocked | Convex target and public backend URL are not configured in this checkout; hosted Netlify deploy is the build evidence. |

## Department isolation and execution coverage — 2026-10-19

| Area | Verified | Not yet verified |
|---|---|---|
| Agent registry | 21 unique stable IDs, names, missions and guardrails; automated tests pass | Live provider execution for each profile |
| Work routing | All physical/lifecycle and software plan items route to a registered profile; CAD routes through Product Design | Persisted output/audit/evidence linkage for each agent run |
| Stage UI | All 15 routes render without application errors | Route rendering alone does not prove the work item can complete |
| RiseJars state | Validation current, 11/11, survey credited, score 45% | Market Research has 0 saved deliverables; Patent Readiness is in progress; Design 0/17; stages 6–15 have no completed deliverables and wait on prerequisites |
| Runtime acceptance | Automated suite and frontend typecheck run; detailed results recorded in build progress | Per-department generation, saved artifact, citations, retries and handoffs |

No live generation was initiated for this audit. The authenticated Preview's account page indicates shared organization usage but does not show remaining capacity.

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
