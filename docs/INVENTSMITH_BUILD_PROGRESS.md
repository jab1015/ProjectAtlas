## Inventor next-step and low-confidence survey checkpoint — October 20, 2026

- Updated the Validation page so a completed, current evidence-support score at or below 50% automatically creates a shareable survey through the existing `evidenceRequests:create` endpoint. The page waits for the existing-link query and reuses an active Validation follow-up link before creating another. Its introduction is tailored from the invention problem and solution; the existing questions remain short and general. The inventor sees the score, a plain-language instruction to share it with five people, the link, and a copy action. No one is contacted and nothing is posted externally.
- The first exact Preview for commit `805eeb7` showed that the test Convex backend did not have the new `evidenceRequests:ensureValidationSurvey` function. Evidence Locker's existing request-list query works and returned an active request. The follow-up implementation removes the dependency on a new backend function and uses the already-used create endpoint only after checking for an active link. This compatibility change needs its own Preview verification.
- Removed the legacy Stage 5+ “coming soon” lock from the old invention route. It now directs inventors to the Journey Center, where the next task and prerequisites are visible. Reworded the Journey Center’s next-action messages and status labels in plain language.
- Verification: **130 test files / 703 tests passed**; web and Convex TypeScript passed; production dependency audit **0 vulnerabilities**; `npx next build` passed (**36/36** static pages); `git diff --check` passed. `npm run build` could not run its initial Convex codegen because this local environment has no Convex access token; no deploy occurred. Direct Next.js build succeeded using checked-in generated types.
- Netlify Preview `6ad6c826907d833bcbcb5524` completed for `805eeb7`; authenticated Validation showed 45% and current attribution for the uploaded survey, and surfaced the missing new mutation. Production-context build `6ad6c824ae4cc90f7e1f9dfa` was canceled before deploy. The compatibility update has not yet been pushed. Live department-agent execution and successful survey creation/response are not claimed.

### InventSmith test Convex deployment — October 19, 2026, 6:45 PM ET

The owner authorized Convex deployment as part of this approval and confirmed the target is InventSmith test, `quick-fox-785` (`dev/inventsmith-test`, Convex project `decideforusapp:projectatlas`). Deployed with authenticated Convex CLI using explicit `CONVEX_DEPLOYMENT=dev:quick-fox-785`; no deploy key was used. CLI confirmed the exact target, added the evidence request/response and support-case indexes, and reported **Convex functions ready**. It did not target `agile-seahorse-379` or `fiery-gazelle-628`.

Post-deploy read-only verification: the protected Netlify Preview now loads the previously uploaded `Data_All_260313.pdf` evidence record (100-user survey summary, structured extraction complete) in Evidence Locker; Support loads and shows no submitted cases. The survey-link list has no visible error. No support case, survey, or evidence was submitted; no AI credits were spent. Validation remains at 36% and survey impact/automatic refresh plus broader department workflows still need separate verification. The website Preview remains the already-successful website-only deployment; production website publication and PR merge were not performed.

This successful account-authorized test deployment supersedes prior notes that `quick-fox-785` deployment was unverified or blocked pending a development deploy key. The permanent key constraint remains: the owner has only a production-scoped deploy key; never use it for test or production backend deployment. Test Convex deployment can use this authenticated CLI account flow when explicitly authorized.

### Department agents and bounded parallel execution — October 19, 2026

Implemented dedicated Idea, Validation, Market Research, Patent Readiness, Product Design, Prototype, Manufacturing, Branding, IP/Legal, Pricing, Marketing, Sales, Funding, Launch, Growth, Regulatory, and software-agent identities. Older canonical work routes key assignments to the correct department identity, and execution audit events record that identity. Autonomous department work and independent Validation sections now run with bounded concurrency (three workers), while atomic claims enforce a hard cap, declared prerequisites, usage reservations, retry limits, and professional/physical/human gates. Validation writes each concurrent batch serially so persisted progress counts cannot race. Validation provider version is 2.1.0 so older cached reports do not silently survive the updated evidence-aware generator.

Verification: **127 Vitest files / 695 tests passed**, `npx tsc --noEmit` passed, and `npx next build` passed (**36/36 pages**). Convex functions were deployed to the explicitly confirmed InventSmith test deployment `dev:quick-fox-785` using the authenticated CLI account session; CLI confirmed **Convex functions ready**. No AI/provider/CAD work was started and no AI credits were used. No production backend or data was changed. The website code has not yet been pushed for a fresh Netlify Preview. PR #24 remains unmerged and Netlify Production remains unpublished.

Live limitation: survey attribution and confidence still need verification after the new Preview is built. Three-worker execution is verified by deterministic tests, not yet by a live AI run. Patent work remains dependency-gated; no legal opinion, filing, physical test, supplier contact, payment, or release is implied.

# InventSmith Build Progress

## Latest controlled verification — October 19, 2026

- Source head `45f1cd401ab845701774dd1335e7ee8518b91d93` passes **127 Vitest files / 694 tests** and compile-only `npx next build` (**36/36 pages**). Focused checks for validation confidence, automatic evidence refresh, PDF ingestion, and stable Convex query subscriptions pass (4 files / 12 tests).
- Netlify Deploy Preview `6ad696b5133e4f3f729431c7` built successfully for that head. It is a website-only build; its paired Production-context deployment was canceled before deployment. PR #24 remains draft and unmerged.
- Authenticated, read-only checks of Evidence Locker and Support show their forms, including the shareable survey/interview page action, but both remain stuck loading existing records. The Preview is configured for `quick-fox-785`; live Convex errors report missing `evidenceRequests:list` and `supportCases:listMine` there. No evidence, support case, or survey was submitted.
- The current Validation page still shows **36%** without the uploaded 100-user SurveyMonkey evidence being visibly explained. Do not spend more AI credits on broad regeneration until the isolated-backend/data-path mismatch is resolved and the report can show what evidence it actually used.
- The owner-confirmed only deploy key is production-scoped. Do not use it against `quick-fox-785`, `agile-seahorse-379`, or any other backend. The frontend is verified to build; end-to-end backend and AI-department acceptance is still blocked. Keep `fiery-gazelle-628` untouched and do not merge PR #24 or publish the full product.
- Next safe work: preserve this verified Preview; improve automated integration coverage using controlled local/test fixtures; investigate whether the isolated Convex backend can be aligned without using the production key. Only after backend parity is proven, run one bounded Validation acceptance and verify survey attribution, refresh, evidence links, Support cases, and department outputs.

**Last updated:** October 20, 2026 (America/New_York)
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Correction (October 19):** GitHub Action runs `39311119875` and `39314672344` targeted `agile-seahorse-379`. In addition, Netlify Production-context build for `672156c` ran `npx convex deploy` and pushed functions to the same production deployment at about 2:02 PM; Netlify did not publish the website. No indexes were deleted per the Convex log. Auto Publishing lock does not prevent such builds. The PR #24 Deploy Preview `6ad6853b072c128eb3df13a6` is available. Stop further production-context builds until the command is guarded.

## October 19 progress and outstanding acceptance

### Latest build and production-backend incident — October 19, 2026

The original Netlify build `6ad6827f323028ef5f5376e1` failed because `src/app/(app)/invention/[id]/page.tsx` was invalid UTF-8. Repair commit `672156c` restored the valid page and passed **125 test files / 688 tests**, web and Convex TypeScript, and Next.js build (**36/36** pages). PR #24 head `7d9ecc0` then produced a successful protected Netlify Deploy Preview, deployment `6ad6853b072c128eb3df13a6`, for authenticated read-only acceptance.

**Important correction:** Netlify also ran a Production-context build for commit `672156c`. Although the website deploy was not published and remains locked, its build command ran `npx convex deploy` and successfully pushed Convex functions to InventSmith production `agile-seahorse-379` at about 2:02 PM. The log states no indexes were deleted. It does not prove that production data or function behavior were unchanged. No further builds that can invoke the production Convex command should be triggered until that command is disabled/guarded. Do not attempt rollback or another production deploy as part of this test sweep.

### Live retest — October 19, 2026, 4:45 PM ET

Read-only on Netlify deploy `6ad68041` / branch commit `0a90b9f`:

- Journey Center and Stage 2 load; RiseJars remains at 36% with no visible survey attribution.
- Evidence Locker and Support both hit the generic error page; browser console shows minified React #301 (too many re-renders).
- Root cause found in source: each page passed an inline object to Convex `useQueries`, changing the subscription input on every render. The public survey response page used the same pattern. Local fixes now memoize the query specs; these changes still need full verification and a fresh preview.
- Backend query behavior is still unverified because the page crash occurs before results can be inspected.
- No user data was changed and no AI calls were triggered.

### Current read-only acceptance — PR #24 Deploy Preview `6ad6853b072c128eb3df13a6`

**Continuation — October 19, 2026, 5:30 PM ET:** Finished inspecting Stage 14 (Launch) and Stage 15 (Growth); both pages load and show all work queued (6/6 and 5/5 active), with zero completed work and no deliverables. Rechecked Journey Center: it remains at Stage 2, shows 1 inventor evidence source with 0 verified, and reports 0 approvals/decisions/blocked work and 0 professional reviews. The browser console reconfirmed live Convex errors: `evidenceRequests:list` and `supportCases:listMine` are not found on the backend reached by the preview. Browser extension metadata errors were also present but are not InventSmith application errors. No AI/CAD work or state-changing test was run. This completes the visual route sweep across all 15 stages; department functionality is not verified because queued work has not been executed and the preview backend is misaligned.

Authenticated preview inspection of the existing RiseJars invention (`n171ne8qzh2ebqwag8w7qybemx8gg2p8`) confirmed:

- Journey, Validation, Market Research, Patent Readiness, Product Design + CAD, Prototype, Manufacturing, Branding (8), IP/Legal (9), Pricing (10), Marketing (11), Sales (12), Funding (13), Launch (14), Growth (15), Evidence Locker, and Support routes render. Every inspected department has 0 completed work and no deliverables; work items show queued. No AI/CAD work was started.
- Validation says complete at **36%** and recommends interviewing more users. Evidence Locker contains `Data_All_260313.pdf`, classified as Survey / SurveyMonkey, **475 KB**, with structured extraction complete and a summary reporting approximately **100 users**. The current Validation report does not show which of those survey findings were used, and the same confidence score remains. The score implementation is a fixed evidence-support rubric (+20 percentage points for recognized survey evidence on selected sections), not a calculation over the actual answers or question-level response counts.
- Automatic invalidation code fingerprints evidence IDs and extraction timestamps and schedules a Validation refresh after evidence changes. Live state does not demonstrate that the survey-triggered refresh completed with survey-aware content. Acceptance failed; inspect execution/event history on the isolated backend and repair/test before relying on automatic refresh.
- Evidence Locker displays “Previously created survey links could not be loaded.” The PDF remains viewable. No link creation or response was attempted.
- Support page form renders, but “Your reports could not be loaded.” No support case was submitted.
- Market Research reports **0 deliverables**, **1 inventor evidence file**, and **1 research source**. Patent Readiness shows no first deliverable; Prototype has **0/7** work complete and all seven items queued; Manufacturing **0/10**; Branding **0/5**; IP/Legal **0/8**; Pricing **0/4**; Marketing **0/5**; Sales **0/5**; Funding **0/6**; Launch **0/6**; Growth **0/5**. Product Design was previously observed at **0/17**, all 17 queued, with no CAD package.
- Stage work showing “queued” confirms visibility, not that the corresponding AI agents execute or save usable outputs. No usage-consuming work was run.

### Confirmed outstanding failures to repair

1. Netlify production build command currently invokes a Convex production deploy even when Auto Publishing is locked. Guard or remove this coupling before any further push can run that context.
2. The preview frontend points at `quick-fox-785`, but deployed backend queries for `evidenceRequests:list` and `supportCases:listMine` fail at runtime. Align and deploy the intended development backend before re-testing those pages.
3. Survey PDF extraction/listing works, but the completed Validation view still does not make the extracted survey's findings and contribution intelligible; automatic refresh completion is not demonstrated.
4. Existing shareable survey requests and existing Support reports fail to load.
5. Department pages mostly render but all inspected work remains queued with zero deliverables; actual per-agent execution has not been validated.

### Live preview test notes — October 19, 2026, 4:25 PM ET

Read-only authenticated sweep of the protected PR #24 preview, signed in as `jerry@modernmethods.it.com` with the RiseJars invention:

- Stage pages 3–15 and the Validation view rendered. Most stage work remains queued; page rendering does not prove the corresponding AI agent can execute. No generation was started in this conservative pass.
- Journey Center's Stage 1 Idea and Stage 2 Validation cards both point to `/invention/{id}`, and that route renders Stage 2. Stage 1 does not have a distinct destination from the Journey Center; correct the route or document the intended shared-view behavior.
- The Work Library reports **2 autonomous work item failures**, **19 missing required deliverables**, and missing concept visualization. It does not identify the failed items or show failure reasons.
- Validation remains **36%** and recommends interviewing more users, while the uploaded SurveyMonkey PDF is already inventor evidence. The report does not show which survey findings were applied or explain the unchanged score.
- Market Research renders with **0 deliverables**, **1 inventor evidence file**, and **1 research source**.
- Evidence Locker renders its form and the uploaded 100-user PDF record, but now displays “Previously created survey links could not be loaded.” Repository code contains `evidenceRequests:list`; the preview backend still fails to serve it. Upload and link creation were not submitted.
- Customer Support renders its form but “Your reports could not be loaded.” Repository code contains `supportCases:listMine`; existing report listing and support submission are not live-accepted.
- Account page exposes name and workspace rename controls; the profile name appears blank. Save was not tested to avoid mutating the owner's account.
- Admin operations, support, and beta-access routes are blocked by “Administrator access required.” The active account is `jerry@modernmethods.it.com`; the intended admin identity/role remains unverified.
- Invention access, review, chat, organization, and account pages rendered; no chat was sent and no account, survey, support, or external action was submitted. A Sign Out control is visible.

The frontend is configured for `quick-fox-785`, but the preview reports those Convex functions missing. Align and deploy the matching test backend only after guarding Netlify production builds. Do not run more production deployments. After alignment, diagnose failed work items, verify validation refresh and survey response flow, then run bounded AI checks with owner-admin access. Do not label departments “working” until generated outputs are saved and reviewed.

Password recovery has already been tested successfully. Do not spend more work re-testing it unless a later change regresses authentication.

The owner’s active request is to fix the rest of today’s reported issues: automatic dependency-aware department refresh after changed inputs/evidence, visible use of the 100-person RiseJars survey in validation and downstream work, concise “what matters/what next” summaries, editable profile/workspace names, selected-user admin access and credit controls (including the ability to grant lasting access deliberately), admin usage-limit exemption, working operations/support views, and a visible sign-out control.

Current implementation inspection finds code for automatic refresh, survey-aware validation, a short validation summary, profile/workspace rename, selected-account access/credits, and admin navigation sign-out. These have not yet been counted as accepted because the owner reported visible failures and the current Netlify preview/head pairing is unverified. The support/operations module’s earlier `openAiConfigured` crash also requires live acceptance even though a compatibility fallback is present in code.

The support-case workflow is implemented in source; deployment to `quick-fox-785` is not verified: authenticated users can submit and track reports; admins can filter/update status and add private investigation notes; and optional invention links are checked against the reporter's access. A support case does not grant access to private invention evidence. Live admin/customer acceptance remains outstanding.

The survey evidence is inventor-provided and unverified. A useful validation update must state the reported respondent count and which extracted observations were used, preserve provenance, and explain score movement (or why the score does not move); a 100-person sample does not automatically justify higher confidence or prove demand.

The suggested survey/customer-research flow may prepare a draft page and questions automatically. Sending messages, publishing a page, or contacting third parties remains a separate human-approved action; no external side effect is represented as complete without evidence.

Deployment boundary: `quick-fox-785` is the intended test project, but its current code state is unverified. `agile-seahorse-379` received broader function deployments in runs `39311119875` and `39314672344`; no further deployment there. `fiery-gazelle-628` is another app and must remain untouched. PR #24 stays open/unmerged; do not publish the whole unverified product.

Historical note: commit `b5d13713...` passed web/Convex TypeScript, full Vitest (**124 files / 685 tests**), `git diff --check`, and Next.js production build (**36/36** pages). Its Convex workflow runs `39311119875` and `39314672344` targeted production, not the test deployment. Commit `0a90b9f` has a successful Netlify check (`6ad68041`). Repair commit `672156c` passed the full suite (**125 files / 688 tests**), web/Convex TypeScript, Convex TypeScript, and Next.js build (**36/36**); PR #24 preview `6ad6853b072c128eb3df13a6` is live. Acceptance remains incomplete.

## Current status snapshot

InventSmith status is reported by capability and evidence, not by a single completion percentage. Repository implementation, automated verification, deployment, live functional verification, genuine professional review, real-world evidence, and outside-world execution remain separate states.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Current limited deployment checkpoint

GitHub Action logs show Convex function deployments to `agile-seahorse-379` in runs `39311119875` and `39314672344`, contrary to prior documentation. Logs report no indexes deleted, but do not prove function behavior/data were unchanged. Deployment to production is paused; the workflow now rejects `prod:` keys. The isolated test deployment `quick-fox-785` is not yet verified.

The password-recovery flow was live-functionally verified on the Netlify PR #24 preview at `deploy-preview-24--inventsmith.netlify.app`: reset email delivery succeeded, the recovery code was received, and authenticated sign-in succeeded. The email initially landed in spam during testing.

The refreshed admin **InventSmith operations** page works in the preview. Because the limited production response does not expose the newer `snapshot.ai` field, the frontend reports AI details as unavailable while keeping health/work monitoring available. This is an intentional compatibility state, not a password-recovery or data-integrity failure. Bugsnag blocking and the preload warning are unrelated browser messages.

The branch now includes a founder-controlled **Beta access & credits** console. It grants a chosen existing account a dated plan override without changing the base plan, supports revocation, and records credit grants/debits/refunds in an append-only ledger. The override and credit balance are enforced by organization plan limits, seats, daily usage, autonomous-work reservations, and export/deletion cleanup. This supports free beta accounts without making Explorer or any other plan permanently free.

## Product vision and architecture

InventSmith — The Inventor OS by Modern Methods — owns the applicable journey:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering where applicable → Prototype → Manufacturing or Software Delivery → Branding → IP / Legal Preparation → Pricing → Marketing → Sales → Funding → Launch → Growth.**

Physical, software, hybrid, and regulated inventions route through applicable branches. GitHub is source/CI authority. Convex is a core backend. MadeThis is historical only.

## Implemented foundation

The branch includes organization-native ownership/membership/invention access; organization-scoped entitlements and usage accounting; active/archive capacity; consent-based invitations; privacy/export/deletion boundaries; complete applicable journey routing; persistent invention/evidence state; evidence provenance/trust; autonomous work orchestration; partial validation/retry; worker lease/attempt protection; physical/software/hybrid/regulated classification; professional-review gates; genuine prototype/quote/launch evidence gates; versioned deliverables; exact-revision external-use authorization; exact-generation manufacturing release; package export; and consequential approval/execution guards.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release paths. Unknown/missing department routing fails closed before model execution.

## Latest consequential and commerce hardening

Direct executable behavior coverage now includes:

- account deletion, privacy request execution, privacy/export scope, invention deletion, ownership/member/invitation controls, and invention sharing;
- stale invention-grant deletion on member removal and owner `manage` precedence;
- subscription application duplicate/invalid-target behavior, exact organization application, legacy-path rejection, and ownership-transfer billing identity continuity;
- organization and legacy-user cancellation/past-due period-end semantics plus immediate unpaid downgrade;
- deterministic subscription provider-event ordering: older delayed events are retained but cannot overwrite newer entitlement state, and equal timestamps resolve by stable provider-event tie-break independent of delivery order;
- signed subscription ingress with HMAC validation, UTF-8 body-size limits, normalization, and exact handler handoff;
- signed fulfillment ingress with zero side effects on rejected events;
- replay-aware fulfillment that prevents duplicate sales counts and reuses the purchase’s authoritative stored download token;
- safe download handling that normalizes external purchase IDs, constrains file selection to the purchased product, records successful downloads before redirect, and fails closed if download accounting cannot be recorded;
- checkout-success truth separation: public redirect/query parameters cannot produce authoritative `upgrade_completed` analytics; the page emits only `checkout_returned` and waits for confirmed subscription state.

Rejected consequential/billing paths are tested for zero unauthorized destructive/entitlement writes where intended. Subscription events may still be retained as audit records when application is rejected or stale.

## Engineering, evidence, and external-use state

Model prose cannot promote itself into trusted external evidence. External research claims require provider-returned provenance and claim/source association. Prototype, manufacturer quote, launch/sales, and professional evidence gates remain distinct from AI output.

Manufacturing readiness is revision-bound and fail-closed. Engineering review, manufacturing release, external-use authorization, consequential approval, and actual outside-world execution are separate transitions.

The repository still has no current executor that sends an RFQ, contacts a supplier/manufacturer, discloses invention artifacts, places an order/payment, files, or publishes for the inventor.

## Exact CI checkpoint

InventSmith CI **#226**, run `39016181734`, passed at exact code head `93744db1fdf2772925f96dbc4d33ed1823192f86`.

Successful gates:

- exact-head checkout/verification;
- dependency installation;
- operational-script checks;
- web TypeScript;
- Convex TypeScript;
- **116 test files / 660 tests**;
- production dependency audit: **0 vulnerabilities**;
- development advisory boundary accepted only `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`;
- Next.js **15.5.27** production build;
- **32/32** static pages generated.

Lucia `3.2.2` remains deprecated and should be migrated only through a deliberately tested authentication change.

This documentation refresh creates a newer documentation head, which must receive its own exact-head CI before that documentation head is called automatically verified.

PR #24 remains draft/open/unmerged. `main` remains untouched.

## Remaining work

1. Qualify the final documentation head with exact-head CI.
2. Perform real owner-controlled provider lifecycle acceptance: signed callbacks, checkout confirmation, cancellation/past-due, replay, fulfillment/download, ownership transitions, and browser-visible entitlement changes.
3. Drive representative physical/hybrid/software/regulated cases through deeper persisted transitions, evidence replacement/removal, newest-revision behavior, manufacturing release, and later external-action boundaries.
4. Continue specialized artifact content, rendered export, and generated-format quality acceptance.
5. Preserve the no-executor boundary until a deliberate executor exists with execution-time revalidation and separate execution evidence.
6. Finish low-risk InventSmith naming cleanup without destabilizing compatibility identifiers.
7. The current implementation is deployed to `quick-fox-785` via authenticated CLI login; do not use the production-scoped deploy key. Push the verified website code to PR #24 and inspect its new Netlify Deploy Preview; keep Production unpublished and do not merge.
8. Verify survey attribution and automatic refresh first, then run a small live concurrency batch and confirm saved outputs/audit identities before broader provider acceptance. Keep `fiery-gazelle-628` untouched and do not deploy further to `agile-seahorse-379`.
9. Plan/test a Lucia v3 migration separately from routine hardening.

## Status boundaries

- **Planned** means specified but not necessarily implemented.
- **Implemented** means repository code exists.
- **Automated verification passed** means the exact implementation head passed relevant CI/tests.
- **Deployed** means the exact code/config is on Modern Methods-controlled infrastructure.
- **Live functionally verified** means authenticated representative acceptance passed there.
- **Professional review completed** means a genuine qualifying review was actually recorded.
- **Real-world evidence present** means genuine outside-world evidence was actually ingested/verified.
- **External action executed** means the outside-world side effect actually occurred and was separately recorded.

These states must never be collapsed into a production-ready claim.

### October 19, 2026 — follow-up verification at 5:34 PM ET

Prepared an unpushed Netlify safeguard: all contexts use website-only builds; the explicit manual GitHub development workflow remains the only Convex deploy path and rejects `prod:` keys. Added a regression check. Verification: **125 test files / 689 tests passed**, web and Convex TypeScript passed, `npx next build` passed (**36/36** static pages), and `git diff --check` passed. `npm run build` cannot run in this unconfigured checkout because Convex codegen requires `CONVEX_DEPLOYMENT`; no deployment target was configured. No AI/OpenAI/CAD operation was run. The known preview-backend mismatch requires a verified `dev:` key specifically for `quick-fox-785` and a controlled Convex development deploy. Do not use the previously identified `prod:` key. The safeguard and fixes remain local and unpushed until the test backend can be safely aligned.

### October 19, 2026 — continued no-credit repair pass

Added safe failure summaries to the invention work library. Failed work now appears with a user-safe explanation for common provider authentication, quota, rate-limit, and general failures; raw provider messages and credentials are not exposed. Added regression coverage for sanitization and for the rule that Netlify never runs `convex deploy`. Updated the global Netlify build to `npm run build` and kept the Deploy Preview command compile-only (`npx next build`); Convex deployment remains an explicit, manual development workflow.

Latest local verification: **126 test files / 692 tests passed**, web and Convex typechecks passed, and `npx next build` passed with **36/36** pages. No AI/OpenAI/CAD tasks or AI credits were used. No deployment or push was performed. The live-preview mismatch, survey attribution/refresh behavior, evidence and support routes, and per-department functional acceptance remain unverified against the intended backend. A development-scoped key verified specifically for `quick-fox-785` is still required before safely aligning that backend. The known `prod:` key must not be used; no further deployment to `agile-seahorse-379`, and do not touch `fiery-gazelle-628`.

### October 19, 2026 — live Deploy Preview acceptance

Commit `093f58b` is on the open, draft PR #24 branch. Netlify Deploy Preview `6ad68f14a6a27e06b352d37b` completed successfully at approximately 2:46 PM ET. Its build completed and deployed the website; no Convex deploy command is present in the Netlify configuration. The preview remains pointed at `quick-fox-785` (confirmed by its survey PDF storage URL).

Read-only live checks on the updated preview found: the signed-in RiseJars Validation route loads but still shows 36% and does not attribute the uploaded survey; Evidence Locker renders its upload/share-page UI and the existing survey PDF record, but says previously created share links could not be loaded; Support renders its form but says reports could not be loaded; Work Library crashes because the deployed backend response lacks the newly added optional `failedWork` property. The Work Library crash is fixed locally by treating the property as optional, with regression coverage. Evidence/Support query failures indicate the preview frontend and Convex functions are still out of sync. No forms were submitted, no evidence was changed, and no AI credits/tasks were used during this live check.

Netlify currently shows `CONVEX_DEPLOY_KEY` values in five deploy contexts, but the secret values were not revealed and their actual target/prefix was not verified. Do not deploy with an unverified key. To proceed with AI-backed acceptance without wasting credits, align the preview backend using a key verified to target the isolated `quick-fox-785` test deployment. Do not deploy to `agile-seahorse-379` or touch `fiery-gazelle-628`.

### October 19, 2026 — Netlify build-side-effect correction

Production-context Netlify deployment `6ad690d2d385bfaa913a27b0` for commit `d9e4a274327c39539ca8953d53b510a427b18ebb` entered the build phase and its log showed `npx convex codegen` followed by “Uploading functions to Convex...” before the Next.js build. The deploy was canceled before the website deploy phase; Netlify showed deployment skipped. The Convex target selected by that context's masked deploy key is **unknown**. Earlier notes saying the run could not deploy Convex because there was no `convex deploy` command were incomplete. Do not infer the target, run a rollback, or trigger another Convex deployment without verifying it.

Corrected `netlify.toml` so every Netlify context uses only `npx next build`; the config contains no Convex CLI command. Strengthened its regression test to assert every configured build command is exactly that compile-only command and the Netlify config contains no `convex` text. The corrective commit passed local verification: 127 test files / 694 tests, the dedicated configuration regression (5 tests), Convex TypeScript, and `npx next build` (36/36). It is being pushed to draft PR #24. No site publication was observed. No AI credits were used. Backend-dependent validation, evidence/share links, support lists, and full department acceptance remain open; AI tests are held until the preview backend target and functions are aligned.


### Latest live Preview test — October 19, 2026

The corrected Preview for commit `20ba8b0486122c0936ead19e036447fc207f641f` (tree `2b9eb121394b8edc5f99aa86e3e22a7d466c9a5d`) completed its Netlify Deploy Preview build with `npx next build`, TypeScript checks, and 36/36 static pages. The authenticated RiseJars Work Library now loads instead of crashing; it reports 19 required deliverables missing, two failed work items, and no generated deliverables. Validation was refreshed once using the authorized Preview AI budget (11 section generations). It completed but remained at 36%; the short version still asks the user to interview a few people, and the expanded sections say primary customer validation evidence has not been supplied. Thus the uploaded 100-user survey was not reflected in the new report or its confidence. Do not run another full refresh until survey attribution is fixed; one refresh consumed 11 provider calls without moving confidence.

The Preview remains usable for UI review at https://deploy-preview-24--inventsmith.netlify.app. Evidence Locker/Support backend list errors and survey-share-link loading remain unresolved; the Convex function set reached by this Preview is out of sync with the frontend. The Preview's `quick-fox-785` storage host does not establish that a deployment key targets that backend. No Convex deployment was made. The Production-context build for commit `20ba8b0` was canceled before the deploy phase; its command was `npx next build` and no Convex CLI was invoked. The earlier canceled `d9e4a274` production-context build did log a Convex function upload to an unknown target; do not infer or alter that target.


### Permanent deployment-key constraint — October 19, 2026

Owner-confirmed: the only Convex deploy key available is production-scoped, and this is the only deploy key expected to be provided. Treat this as a permanent constraint; do not ask the owner for a development-scoped deploy key or assume one will be issued. Never use the production key to align or deploy the Preview/test backend. Keep Netlify Preview builds website-only and cancel/guard Production-context builds before any backend deployment step. Any future production backend deployment requires exact target and change review, explicit deployment authorization, and a preservation plan for existing functions and data. For Preview functional testing, use safe non-deploying alternatives until the test backend can be exercised without this production credential.


### October 20, 2026 — full regression verification and validation UI correction

PR #24 contains the Validation stale-state correction in commits `81e4b7e`, `20604e7`, and `2a2d99c`. When evidence has changed, the page no longer calls the previous 11-section report “complete” or claims an automatic refresh is underway if the backend is idle. It tells the inventor when the report is stale, distinguishes a running refresh from an idle page, and hides confidence until the completed report reflects current evidence. The uploaded RiseJar survey remains labeled inventor-provided and unverified; it can support customer-validation sections but does not prove demand, market size, or product performance. No refresh or other AI-consuming task was started during this verification.

Exact-branch automated checks: **127 Vitest files / 697 tests passed**, Convex TypeScript passed, production dependency audit found **0 vulnerabilities**, and `npx next build` completed with **36/36 static pages**. Web TypeScript passed after the build generated `.next/types`; an initial concurrent TypeScript check raced that generation and produced missing-file errors, so it was rerun after build and passed. `git diff --check` passed. The only test output warning was a missing TypeScript source-map file under `node_modules`; all tests passed.

The authenticated Validation route was reloaded on October 20. It still served the previous Netlify build (`a980884`; deploy ID `6ad6ae074c3db0b435171c31`) and therefore still showed the old “automatic refresh” wording. The GitHub contents-API commits updated the PR branch but did not start a new Netlify build. A harmless `netlify.toml` change has been pushed to request a website-only Deploy Preview. This checkpoint must be amended with its resulting commit/deploy ID and authenticated result after deployment completes. Netlify build commands remain `npx next build`; no Convex CLI command is added.

Department coverage remains distinct: repository tests verify unique agent identities and routing for every full work plan, including the 15 journey stages and specialties. The earlier authenticated visual sweep covered all 15 stages, but no live department AI execution was run because the stale evidence/validation path should be resolved first. No AI credits, user data mutations, department jobs, production deployments, merges, or publication occurred in this check.


### October 20, 2026 — live evidence acceptance and department start feedback

This checkpoint supersedes the earlier “no refresh” and “preview still stale” notes above. The authenticated PR #24 preview now shows the RiseJars survey as included in a completed, current Validation report: **11/11 sections**, report matches current evidence, and the overall evidence-support score is **45%** (the earlier report showed 36%). The report cites the inventor-uploaded **Data_All_260313** source and extracted survey observations; customer-segment support increased to 50%, while competitor analysis and market sizing remain at 30% / very low. The survey remains unverified and does not establish demand, market size, or product performance. One bounded validation refresh was run; do not repeat it during this acceptance pass.

Authenticated preview smoke checks passed for Validation, Evidence Locker, Support, Market Research, Prototype stage 6, and Work Library. Evidence Locker showed the same survey source and completed extraction. A single Prototype “Continue department” probe left all seven work items queued and zero completed; this is not evidence of a live agent run. It exposed misleading UI feedback that claimed work had started regardless of the scheduler result. The lifecycle department and Product Design start flows now use a shared status helper that only reports a start when `scheduled` is true. Regression tests cover both outcomes and both launch surfaces.

Work Library still reports two exhausted work items (“Research competing products and alternatives” and “Analyze the invention brief”), each after three attempts. Admin Operations is inaccessible for this non-admin account. Do not claim every department has passed live execution: the repository has 21 unique agent profiles and route/prompt coverage across department workplans, but only the validation refresh and bounded Prototype probe were exercised live. Continue by resolving provider/work-item failures with the proper admin/backend access and perform controlled per-department live acceptance without batch-running costly work.

Latest code checks: **128 test files / 699 tests passed**, Convex TypeScript passed, `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities**, `npx next build` compiled and generated **36/36** static pages, and web TypeScript plus `git diff --check` passed. Vitest emitted only the known non-fatal missing TypeScript source-map warning. Commits for the scheduler-message fix and regression coverage have been pushed to PR #24. Netlify’s dashboard showed the new PR preview builds queued; record the completed deploy ID and signed-in preview retest for the final branch head here. Website-only build settings remain in effect; no Convex deploy or production publish was requested.

### October 20, 2026 — exact-head verification and Netlify preview

PR #24 head `f8a66dda100b0ab5674b4e20776b99a6eccdbb3f` adds the Prototype prerequisite explanation: the department query reports completed work kinds, the UI identifies the next unmet prerequisite, labels queued work accurately, and links to Product Design + CAD when its specification is required. Scheduler feedback now says a scheduled action queued a background check; it no longer claims a work item actually started.

Exact-head local verification passed: **129 Vitest files / 701 tests**, web TypeScript, Convex TypeScript, production dependency audit (**0 vulnerabilities**), `npx next build` (**36/36 static pages**), and `git diff --check`. The only test warning is the existing missing TypeScript source-map file under `node_modules`.

Netlify Deploy Preview for `f8a66dd` completed successfully as deploy `6ad6c1978ecfdc6c479e7168`. The authenticated stable Preview tab still resolved to the older deploy `6ad6bfe0c3f0994dd5dcca75` after reload, so it did not expose the new prerequisite UI. The immutable deploy permalink redirected to sign-in because the existing browser session is scoped to the stable Preview hostname. Thus the new UI is built and available on the exact deploy, but its authenticated live acceptance remains outstanding; no credential was entered. The current stable Preview remains the useful authenticated route for read-only checks.

On the authenticated Preview state already verified, Validation is current at **11/11 sections** and **45% evidence-support confidence**; the report cites inventor-uploaded `Data_All_260313` and extracted survey findings. It clearly preserves the unverified provenance and limitations: the survey does not prove demand, market size, or product performance. Do not rerun the Validation refresh during this acceptance pass.

The stage 6 Prototype probe showed **0/7 complete**, with all seven tasks queued. The first task depends on `product_design_specification`, which is not complete; this is the queue gate that the new UI now explains. Work Library still has two exhausted tasks after three attempts: “Research competing products and alternatives” and “Analyze the invention brief.” Admin Operations is unavailable to the current non-admin account. The codebase has **21 unique department-agent profiles** with routing/prompt coverage across work plans, but only Validation refresh and one bounded Prototype scheduler probe were exercised live. Do not describe all departments as live-working until each produces and saves a reviewed output. No batch jobs were launched, and no production publish or PR merge was performed.

### October 20, 2026 — authenticated preview retest correction

Correction to the preceding exact-head checkpoint: the stable PR #24 Preview alias later rolled forward to the `f8a66dd` deploy `6ad6c1978ecfdc6c479e7168`. After reload, the authenticated InventSmith session showed this deploy in the Netlify drawer and served the new UI. Validation displays the current **11/11-section** report at **45% evidence-support confidence**, cites inventor-uploaded `Data_All_260313`, and says the report matches current evidence. Findings and respondent counts are visible; provenance and limitations remain explicit. Stage 6 Prototype displays “Waiting for prerequisite work,” names the missing Product Design Specification, labels the count “Queued or running,” and links to Product Design + CAD. Thus the new preview’s authenticated UI acceptance passed for the reported Validation issue and this department prerequisite.

This verifies the UI and evidence attribution. The two exhausted Work Library items, admin-only access, and lack of live saved outputs across all 15 departments remain open. Agent identity/routing tests do not establish live execution for each department. The follow-up GitHub commits in this checkpoint change documentation only; Netlify Deploy Preview builds for those documentation commits are pending and do not change the app source tested above.

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

## Retest update — 2026-10-19

- Signed-in Netlify Preview `6ad6ccd2ebf75c110beaae6d`: validation evidence attribution and current-report state verified; 45% score and prepared survey action visible.
- 15/15 stage URLs smoke-checked; pages with prerequisites show queued/waiting states. No completed department deliverables were observed for Growth (0/5; 5 queued).
- `npm test -- --reporter=dot`: 130 test files and 703 tests passed.
- `npm run readiness`: blocked locally because `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` are absent; five cloud/operations checks remain manual. `npm run build` stops at Convex codegen for the same missing deployment target. Netlify's successful deploy build remains the hosted build evidence.
- Current Preview UI says the uploaded survey is included and the report matches current evidence; do not reproduce the earlier stale-refresh wording as the current state.

## Department-level live acceptance gap — 2026-10-19

- Profile registry: 21 unique agents. Routing and prompt identity tests passed.
- Preview route coverage: 15/15 stages loaded with no application-error UI.
- Live project state: Idea done; Validation 11/11 and current; Market Research has no saved deliverable; Patent Readiness is in progress; Product Design + CAD 0/17; downstream stages 6–15 show no completed work and prerequisite waits.
- Focused routing/journey acceptance: 4 files, 20 tests passed. Full repository suite: 130 files, 703 tests passed.
- No live work item was started; an end-to-end agent result, saved artifact, evidence citations, retry behavior, and handoff remain unverified per department. Usage is shared within the personal organization; remaining allowance is not displayed in the Preview.

## Lifecycle agent-routing defect fixed — 2026-10-19

The audit found that lifecycle initialization saved display labels (for example, `Prototype`) where provider routing requires registered keys (for example, `prototype`). Such work could fail at execution with “missing a registered department agent.” Lifecycle initialization now derives and validates the registered key from the stage label before queueing work. Regression coverage checks all 10 lifecycle departments resolve to their own stable agent identity, mission prompt, and audit metadata, and verifies the initializer uses this mapping.

Verification after the fix: focused agent/lifecycle tests **18/18 passed**; full suite **130 files / 704 tests passed**; web TypeScript **passed**. This is not yet live provider acceptance: no workers were started because the signed-in account does not display remaining shared AI/research/CAD usage. A fresh Netlify Preview for the code fix is the next verification gate.
