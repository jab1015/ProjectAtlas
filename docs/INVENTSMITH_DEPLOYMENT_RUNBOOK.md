# InventSmith Owner-Controlled Deployment and Acceptance Runbook

### Latest checkpoint — October 19, 2026

The repository now sets Netlify contexts to a website-only `npx next build`; the historical Convex-upload incident below remains part of the audit record but this current config contains no Convex CLI command. Auto Publishing remains locked; do not publish a production deploy. PR #24 remains open/draft/unmerged.

The authorized test-backend deployment completed successfully using authenticated Convex CLI account login with the target explicitly set and confirmed as `dev:quick-fox-785` (`decideforusapp:projectatlas`, `dev/inventsmith-test`). No deploy key was used. Production deployment `agile-seahorse-379` and unrelated `fiery-gazelle-628` were not targeted.

Dedicated per-department agent identities, three-worker bounded concurrency, sequential Validation persistence, and agent audit metadata are implemented locally. Checks pass: 127 test files / 695 tests, TypeScript, Next.js build (36/36 pages). The Convex functions are deployed to test; these website/code changes still need a push and a fresh Deploy Preview. No provider or CAD calls/credits were spent. Validate survey attribution and report confidence before any live parallel AI work.

**Status:** Repository implementation active; password-recovery acceptance complete; PR #24 preview `6ad6853b072c128eb3df13a6` is available; full-product acceptance pending. Netlify Production-context build deployed Convex functions to `agile-seahorse-379` on October 19, 2026; do not trigger further production-context builds until the deploy command is guarded.
**Product:** InventSmith — The Inventor OS by Modern Methods  
**Updated:** October 19, 2026 (America/New_York)
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged

## 1. Deployment authority and boundary

Target ownership:

- **GitHub:** `jab1015/ProjectAtlas` remains source/CI authority.
- **Vercel:** a Modern Methods-owned project is the intended Next.js web host.
- **Convex:** a Modern Methods-controlled development deployment exists; production/live acceptance remains separate.

MadeThis is historical only. Do not synchronize back to it, deploy to it, migrate its data/secrets, or treat it as source of truth.

Do not call InventSmith deployed, production-ready, or live-verified until the exact intended code/config has actually been deployed to owner-controlled infrastructure and representative authenticated acceptance has passed there.

### October 19, 2026 — preview and production-build finding

Netlify deployment `6ad6827f323028ef5f5376e1` failed because `src/app/(app)/invention/[id]/page.tsx` was invalid UTF-8. Repair commit `672156c` passed 125 test files / 688 tests, web and Convex TypeScript, and a 36/36 Next.js build. PR #24 head `7d9ecc0` has a successful protected Deploy Preview, deployment `6ad6853b072c128eb3df13a6`.

**Production command safeguard:** Auto Publishing being locked prevents publication of the website but does not prevent Production-context builds. Netlify's `netlify.toml` build command invokes `npx convex deploy --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL --cmd 'npm run build'`. A Production-context build for `672156c` successfully pushed Convex functions to `agile-seahorse-379` at approximately 2:02 PM on October 19. The build log says no indexes were deleted; it does not establish that existing function behavior or stored data remained unchanged. A later queued Production-context build for `7d9ecc0` was cancelled before its deploy phase. Stop all pushes/triggered Production-context builds until the Production command is disabled or safely overridden and verified. Do not run a rollback or another Convex production deploy as part of acceptance testing.

**Preview acceptance:** The PR preview frontend is configured for `quick-fox-785`. The Evidence Locker and Support pages render, but their existing survey-link and support-report lists fail to load (`evidenceRequests:list` and `supportCases:listMine` were reported missing in the backend). Validation remains at 36% despite the completed extraction record for `Data_All_260313.pdf` reporting approximately 100 survey respondents; the report does not show findings-level attribution. Market Research has zero deliverables; inspected downstream department queues have no completed outputs. Keep AI/CAD generation off until the intended test backend is safely aligned and the owner explicitly chooses a bounded acceptance budget.

**October 19 continuation:** Read-only inspection completed for Launch and Growth. Both render; all 11 work items remain queued (6 Launch, 5 Growth), with no deliverables. Journey Center reports Stage 2 current, one unverified inventor evidence source, and zero listed attention items or professional reviews. Console again confirms the preview backend lacks public `evidenceRequests:list` and `supportCases:listMine`. All 15 stage routes have now been visually checked, but agent execution, evidence-triggered department regeneration, and survey-link workflows remain unverified. No new usage-consuming or mutating operation was attempted.

## 2. Latest repository gate

Latest verified code checkpoint before this documentation refresh:

- exact head: `93744db1fdf2772925f96dbc4d33ed1823192f86`;
- InventSmith CI: **#226** (`39016181734`);
- conclusion: **success**;
- **116 test files / 660 tests**;
- production dependency audit: **0 vulnerabilities**;
- Next.js **15.5.27** production build passed with **32/32** static pages generated.

Exact-head CI verifies exact checkout, lockfile install, operational scripts, web/Convex TypeScript, regression tests, production audit, bounded development audit, and production build. The development advisory boundary accepts only `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`.

Lucia `3.2.2` remains deprecated and should be migrated only through a separately tested authentication change. This documentation refresh creates a newer head, so that final head must pass exact-head CI before being described as automatically verified.

## 3. Current Convex status

A Convex deployment named `fiery-gazelle-628` exists but belongs to another application and is not an InventSmith environment. A separate owner-controlled **production** deployment is `agile-seahorse-379`. InventSmith's intended test/development deployment is `dev/inventsmith-test` (`quick-fox-785`), but its current code and auth configuration are unverified. GitHub Action logs for the purported test runs show they deployed to production `agile-seahorse-379`; the workflow now rejects `prod:` keys. Obtain a `dev:` key for `quick-fox-785` before test deployment.

The October 19 Netlify Production-context build for commit `672156c` successfully ran `npx convex deploy` and pushed the branch's Convex functions to production deployment `agile-seahorse-379`. The build log reports no indexes deleted. That does not prove existing functions or data were unaffected. The live website itself was not published, and PR #24 remains unmerged. Treat this as an unintended backend expansion beyond the earlier limited password-recovery scope. Do not deploy, roll back, or otherwise modify `agile-seahorse-379` without explicit review and authorization.

Password recovery was live-functionally verified through the Netlify PR #24 preview: reset email delivery, recovery-code entry, and sign-in succeeded. This does not constitute full-product production acceptance.

The refreshed preview's InventSmith operations page works against the limited production response by treating the absent `snapshot.ai` field as unavailable. Do not expand production deployment merely to expose AI configuration or to test the full product.

The repository contains the admin-only Beta access & credits controls; their deployment to the isolated test backend is not verified. Use them only with selected test accounts: grant a dated plan override with a written reason, optionally adjust credits with a written reason, and revoke the override when testing ends. These controls preserve the account's base plan and append audit records; they are not a lifetime-free-account mechanism.

The new InventSmith test deployment workflow must remain manual and guarded by explicit confirmation, `CONVEX_DEPLOY_KEY`, and a deployment-specific key/prefix check. Never use `fiery-gazelle-628` credentials or deployment settings for InventSmith.

## 4. Configuration inventory — names only

### Vercel / Next.js
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `CONVEX_DEPLOY_KEY`
- `NEXT_PUBLIC_PLATFORM_URL` — legacy compatibility setting; never point at MadeThis.

### Convex server
- `OPENAI_API_KEY`
- `ATLAS_OPENAI_MODEL` — historical compatibility identifier pending tested migration.
- `JWT_PRIVATE_KEY`
- `JWKS`
- `CONVEX_SITE_URL`
- `ADMIN_TOKEN_SECRET`
- `PLATFORM_FULFILLMENT_SECRET`
- `ATLAS_SUBSCRIPTION_WEBHOOK_SECRET`

Never place real secret values in source, docs, issues, logs, screenshots, or chat transcripts.

## 5. Fresh/intentional Convex deployment procedure

1. Confirm the exact candidate commit and exact-head CI success.
2. Use the Modern Methods-controlled Convex project/deployment only.
3. Install dependencies from the repository lockfile.
4. Run required Convex generation/type/schema checks and resolve failures.
5. Confirm auth/provider/admin/billing configuration without exposing secrets.
6. Deploy the exact intended head through the guarded InventSmith test-deployment path. Do not deploy this full branch to `agile-seahorse-379` during test setup.
7. Record the exact deployed commit and observed deployment result.
8. Verify scheduled work, storage, auth callbacks, signed HTTP/webhook endpoints, entitlement checks, and database/function health.
9. Only then describe that exact code as deployed; live functional verification still requires representative authenticated acceptance.

## 6. Current frontend preview status

The current Netlify PR #24 preview is `https://deploy-preview-24--inventsmith.netlify.app` (deployment `6ad6853b072c128eb3df13a6`, branch head `7d9ecc0`). Its deploy-preview context points the frontend at `https://quick-fox-785.convex.cloud`. This does not establish that the backend has the matching functions: Evidence Locker share requests and Support report queries fail to load. The isolated backend is not accepted for full-journey testing until that mismatch is corrected and verified.

## 7. Fresh Vercel/frontend procedure

1. Create/use a Modern Methods-owned Vercel project from `jab1015/ProjectAtlas`.
2. Use the supported Node/package manager and lockfile.
3. Configure only public values in `NEXT_PUBLIC_*` variables.
4. Store server/build credentials in encrypted environment settings.
5. Point `NEXT_PUBLIC_CONVEX_URL` only to the intended owner-controlled Convex deployment.
6. Do not reuse MadeThis credentials/integration settings.
7. Build a preview first and run authenticated acceptance before production promotion.

## 8. Authentication/authorization acceptance

Using disposable accounts verify unauthenticated denial, cross-organization isolation, role boundaries, invitation/share/member/owner controls, backend entitlements, account/invention deletion boundaries, and zero unauthorized side effects on rejected consequential actions.

Repository tests already cover these deterministically; live acceptance must reproduce them with real disposable authenticated accounts.

## 9. Core representative acceptance

Exercise at least:

**Sign in → create invention → upload evidence → extraction → research/validation → decision/review → versioned deliverable/package → download/inspect.**

Run representative physical, software, hybrid, and regulated cases through their applicable paths.

## 10. Evidence/trust and worker acceptance

Verify provenance, source association, partial/failed-only retry, stale/disputed evidence, prompt-injection resistance, provider outage fail-closed behavior, duplicate/late/stale worker attempts, leases, bounded retries, cleanup, and conservative usage settlement.

AI/model output cannot satisfy real prototype, manufacturer quote, completed deployment/test, post-launch sales/analytics, or professional-review gates merely by assertion.

## 11. Engineering/manufacturing acceptance

Engineering review and manufacturing release remain separate. Manufacturing release must remain bound to the exact newest synchronized qualifying generation and must not itself contact a supplier, disclose artifacts, place an order, spend money, file, or publish.

## 12. External-use and consequential-action acceptance

For consequential artifact actions, require exact latest/fresh external-use authorization, exact artifact scope, authorized manager resolution, execution-time revalidation, and separate outside-world execution evidence. The repository currently has no executor for supplier contact, RFQs, disclosure, orders/payments, filings, or publication.

## 13. Billing, subscription, fulfillment, checkout, and download acceptance

Deterministic repository coverage now directly exercises:

- subscription duplicate/invalid-target behavior and exact organization application;
- provider billing identity continuity across ownership transfer;
- organization and legacy-user cancellation/past-due access through period end plus immediate unpaid downgrade;
- deterministic provider-event ordering: delayed older events cannot overwrite newer state and equal timestamps resolve consistently independent of delivery order;
- signed subscription HTTP ingress with HMAC validation, UTF-8 byte limits, normalization, and exact mutation handoff;
- fulfillment replay idempotency across Stripe session/platform order identifiers;
- one-time sales counting and authoritative stored download-token reuse on replay;
- signed fulfillment HTTP ingress with zero product/purchase side effects on rejected requests;
- safe external purchase-ID normalization for download URLs;
- purchase token/fulfillment-state validation, product-scoped file selection, signed storage URL resolution, and download accounting before redirect;
- checkout-success UI/analytics truth: a public redirect/query parameter is not treated as confirmed entitlement and cannot emit authoritative `upgrade_completed`; only `checkout_returned` is recorded pending confirmed billing state.

Before paid plans/fulfillment are enabled live:

1. select/configure the owner-controlled provider integration;
2. verify real provider signatures and secret ownership;
3. test cancellation, past-due, duplicate, replay, out-of-order, delayed and equal-time events against real callbacks;
4. exercise real checkout → confirmed provider event → fulfillment → success page → download with disposable purchases;
5. verify success-page/browser messaging reflects actual server-side entitlement rather than redirect/query parameters;
6. verify duplicate fulfillment neither increments sales twice nor returns a dead token;
7. verify malformed/wrong download links fail cleanly and successful downloads update accounting;
8. verify customer-visible pricing matches backend entitlements;
9. do not enable production billing until these checks pass.

## 14. Privacy, deletion, and storage acceptance

Verify account/organization export boundaries, invention/evidence deletion, generated/original storage cleanup, member departure, invitations, billing fail-closed requirements, deletion/anonymization semantics, and exclusion of credentials/tokens/secrets/unrelated organization data from exports.

## 15. Artifact quality acceptance

Do not accept outputs merely because a file exists. Open representative PDF/DOCX/PPTX/XLSX/CSV/image/CAD outputs and inspect content, formatting, metadata, evidence/limitation labels, and usability. Validate STEP/STL/DXF structure with appropriate tooling before advancing engineering maturity.

## 16. Operational acceptance

Before public production release establish tested procedures for uptime, spend alerts, backup/restore, key rotation, incidents, provider/model changes, billing/webhook incidents, rollback, privacy/deletion requests, and deployment access.

## 17. Release/status rule

Keep these states separate: implemented; automated verification passed; deployed; live functionally verified; professional review completed; real-world evidence present; external action executed.

Do not collapse them into one completion percentage or production-ready claim.

### Follow-up verification — October 19, 2026, 5:34 PM ET

Local Netlify configuration now uses `npm run build` globally and a compile-only `npx next build` for Deploy Previews; no Netlify context deploys Convex. Regression check, full tests (125 files / 689 tests), web/Convex typechecks, compile-only Next build (36/36), and diff check pass. Convex deploy remains an explicit manual development workflow only. The preview mismatch is pending a verified `dev:` key for `quick-fox-785`; never substitute the known production-scoped key. `npm run build` locally also runs Convex codegen and requires `CONVEX_DEPLOYMENT`; do not initialize a target for convenience.

### Continued no-credit repair pass — October 19, 2026

The local Netlify config now runs website build commands only; Deploy Preview uses compile-only `npx next build`. Added a regression assertion that Netlify does not invoke `convex deploy`. Added sanitized work-failure summaries in the invention work library. Latest verification: **126 test files / 692 tests**, web/Convex typechecks, and Next build **36/36** pass. No AI credits were used. Changes are not pushed or deployed. Before backend alignment or live functional testing, verify a development-scoped key targets exactly `quick-fox-785`; never use the production key or modify `agile-seahorse-379` or `fiery-gazelle-628`.

### Live Deploy Preview check — October 19, 2026

Netlify Deploy Preview `6ad68f14a6a27e06b352d37b` for commit `093f58b` completed successfully. Its deployed site uses the `quick-fox-785` storage host for inventor evidence. Read-only testing surfaced the backend mismatch: existing Evidence Locker share-link and Support report list queries fail, Validation remains at 36% with no visible survey attribution, and Work Library crashed when the older backend response omitted the new optional `failedWork` list. A frontend fallback is now being added and will be tested in the next preview. Netlify deploy-key values appear in five contexts, but were not revealed; the actual key target/prefix has not been verified. Do not use an unverified key or any key targeting `agile-seahorse-379`. No AI credit or data-changing acceptance test was run.

### Netlify build-side-effect correction — October 19, 2026

Production-context Netlify deployment `6ad690d2d385bfaa913a27b0` for commit `d9e4a274327c39539ca8953d53b510a427b18ebb` reached `npx convex codegen`; the log then said “Uploading functions to Convex...” before the Next.js build. The Netlify deployment was canceled before its website deploy phase; Netlify showed the deploy phase as skipped. The configured deploy key is masked and its selected Convex target is **unknown**. Do not assume the target, roll back, or redeploy Convex until the target has been positively identified. Earlier runbook wording that no Convex upload could happen without `convex deploy` was incorrect; `convex codegen` uploaded functions in this Netlify build.

Corrective local configuration sets the global Netlify command and Deploy Preview command to exactly `npx next build`; no Netlify context runs Convex CLI. Regression coverage requires every configured command to match and rejects Convex references in `netlify.toml`. Local verification passed: 127 test files / 694 tests, the dedicated configuration regression (5 tests), Convex TypeScript, and `npx next build` (36/36). The change is being pushed to draft PR #24. No website publication was observed. No AI credits were used. The preview still has unresolved backend mismatches affecting evidence/share-link lists, Support reports, survey attribution/confidence, and department workflows. Do not spend AI credits until the isolated preview backend and functions are aligned.


### October 19, 2026 — latest Preview acceptance

Commit `20ba8b0486122c0936ead19e036447fc207f641f` produced a successful Deploy Preview at https://deploy-preview-24--inventsmith.netlify.app. The website-only build used `npx next build`; no Convex CLI was invoked. The Production-context build was canceled before deployment. Live authenticated testing verified the Work Library no longer crashes against the older response shape. A single authorized Validation refresh (11 provider calls) completed, but confidence stayed at 36%, with no survey attribution and a generic request for more interviews despite the inventor's 100-user survey. This is a confirmed functional defect; do not repeat broad AI generation until fixed. Evidence Locker and Support list queries also still fail against the backend reached by the preview. Do not deploy Convex until a deployment key is positively verified to target `quick-fox-785`; the Netlify storage host alone is not target proof. Historical `d9e4a274` Production-context build logged a Convex upload to an unknown target before cancellation; do not infer target or roll back.


### Permanent deployment-key constraint — October 19, 2026

Owner-confirmed: the only Convex deploy key available is production-scoped, and this is the only deploy key expected to be provided. Treat this as a permanent constraint; do not ask the owner for a development-scoped deploy key or assume one will be issued. Never use the production key to align or deploy the Preview/test backend. Keep Netlify Preview builds website-only and cancel/guard Production-context builds before any backend deployment step. Any future production backend deployment requires exact target and change review, explicit deployment authorization, and a preservation plan for existing functions and data. For Preview functional testing, use safe non-deploying alternatives until the test backend can be exercised without this production credential.

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

## Netlify Preview retest — 2026-10-19

- Verified authenticated deploy Preview #24, deploy `6ad6ccd2ebf75c110beaae6d`. Validation report is current and credits `Data_All_260313`; 45% evidence-support score and prepared survey link are visible.
- All 15 invention stage URLs smoke-rendered. This is navigation coverage only, not department agent execution acceptance.
- 703 tests passed (130 files).
- Local `npm run readiness` and `npm run build` are blocked before build by missing Convex target configuration (`CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`). The successful Netlify deploy is the hosted build check.
- Preview/production separation remains in force; this retest did not publish production.

## Department Preview acceptance — 2026-10-19

All 15 authenticated stage routes rendered without app-level errors. Validation is complete/current and includes uploaded survey evidence. Market Research has zero saved market deliverables; Patent Readiness is still running with handoff pending; Product Design + CAD has 17 queued items and zero complete; later stages show prerequisite waits. The work-plan/profile routing suite passes. For end-to-end acceptance, satisfy prerequisites in order, run bounded provider-backed work, and verify each saved artifact, evidence references, audit identity, retry behavior, and handoff. The account reports shared organization capacity but not its remaining balance; no live generation was launched in this pass.

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
