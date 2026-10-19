# InventSmith Build Progress

**Last updated:** October 19, 2026 (America/New_York)
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Correction (October 19):** GitHub Action runs `39311119875` and `39314672344` both deployed to `agile-seahorse-379`, not the intended test backend. The deployment workflow now rejects `prod:` keys. The earlier source checkpoint passed web/Convex TypeScript, Vitest, `git diff --check`, and Next.js build. The current GitHub head `6b6becb` produced a failed Netlify preview because the pushed Validation page blob is invalid UTF-8; a corrected source file is being rebuilt and must pass Netlify before preview testing continues.

## October 19 progress and outstanding acceptance

### Latest build blocker — 4:52 PM ET

Netlify deploy `6ad6827f323028ef5f5376e1` failed during Next.js compilation: `stream did not contain valid UTF-8` in `src/app/(app)/invention/[id]/page.tsx`. The last valid page source has been restored in an isolated repair worktree, preserving the existing survey evidence display and adding processing/failure status for survey extraction plus hiding the old confidence score while evidence is stale. The restored UTF-8 candidate now passes **125 test files / 688 tests**, web and Convex TypeScript, and Next.js build (**36/36** pages). Repair commit `672156c` is pushed to the PR branch; its Netlify build is pending, so the preview is not yet available for retest.

### Live retest — October 19, 2026, 4:45 PM ET

Read-only on Netlify deploy `6ad68041` / branch commit `0a90b9f`:

- Journey Center and Stage 2 load; RiseJars remains at 36% with no visible survey attribution.
- Evidence Locker and Support both hit the generic error page; browser console shows minified React #301 (too many re-renders).
- Root cause found in source: each page passed an inline object to Convex `useQueries`, changing the subscription input on every render. The public survey response page used the same pattern. Local fixes now memoize the query specs; these changes still need full verification and a fresh preview.
- Backend query behavior is still unverified because the page crash occurs before results can be inspected.
- No user data was changed and no AI calls were triggered.

### Live preview test notes — October 19, 2026, 4:25 PM ET

Read-only authenticated sweep of the protected PR #24 preview, signed in as `jerry@modernmethods.it.com` with the RiseJars invention:

- Stage pages 3–15 and the Validation view rendered. Most stage work remains queued; page rendering does not prove the corresponding AI agent can execute. No generation was started in this conservative pass.
- Journey Center's Stage 1 Idea and Stage 2 Validation cards both point to `/invention/{id}`, and that route renders Stage 2. Stage 1 does not have a distinct destination from the Journey Center; correct the route or document the intended shared-view behavior.
- The Work Library reports **2 autonomous work item failures**, **19 missing required deliverables**, and missing concept visualization. It does not identify the failed items or show failure reasons.
- Validation remains **36%** and recommends interviewing more users, while the uploaded SurveyMonkey PDF is already inventor evidence. The report does not show which survey findings were applied or explain the unchanged score.
- Market Research renders with **0 deliverables**, **1 inventor evidence file**, and **1 research source**.
- Evidence Locker initially showed the generic error page, then rendered its form. The browser logged missing Convex public query `evidenceRequests:list`, despite that query existing in repository source. Existing share-request listing is therefore broken against the backend reached by the preview; upload and link creation were not submitted.
- Customer Support shows the generic error page. The browser logged missing Convex public query `supportCases:listMine`, also present in repository source. Support creation/tracking is not live-accepted.
- Account page exposes name and workspace rename controls; the profile name appears blank. Save was not tested to avoid mutating the owner's account.
- Admin operations, support, and beta-access routes are blocked by “Administrator access required.” The active account is `jerry@modernmethods.it.com`; the intended admin identity/role remains unverified.
- Invention access, review, chat, organization, and account pages rendered; no chat was sent and no account, survey, support, or external action was submitted. A Sign Out control is visible.

The pair of missing Convex functions means the currently served frontend and the backend it reaches are out of alignment, or the preview points at a different deployment than intended. Confirm the preview's exact Convex target and deploy the matching test backend before further authenticated acceptance. Keep production and unrelated Convex projects untouched. After alignment, diagnose the two failed work items, verify evidence/validation refresh and shareable survey response flow, then run bounded AI checks with the owner-authorized admin session. Do not label the departments “working” until generated results are saved and reviewed.

Password recovery has already been tested successfully. Do not spend more work re-testing it unless a later change regresses authentication.

The owner’s active request is to fix the rest of today’s reported issues: automatic dependency-aware department refresh after changed inputs/evidence, visible use of the 100-person RiseJars survey in validation and downstream work, concise “what matters/what next” summaries, editable profile/workspace names, selected-user admin access and credit controls (including the ability to grant lasting access deliberately), admin usage-limit exemption, working operations/support views, and a visible sign-out control.

Current implementation inspection finds code for automatic refresh, survey-aware validation, a short validation summary, profile/workspace rename, selected-account access/credits, and admin navigation sign-out. These have not yet been counted as accepted because the owner reported visible failures and the current Netlify preview/head pairing is unverified. The support/operations module’s earlier `openAiConfigured` crash also requires live acceptance even though a compatibility fallback is present in code.

The support-case workflow is implemented in source; deployment to `quick-fox-785` is not verified: authenticated users can submit and track reports; admins can filter/update status and add private investigation notes; and optional invention links are checked against the reporter's access. A support case does not grant access to private invention evidence. Live admin/customer acceptance remains outstanding.

The survey evidence is inventor-provided and unverified. A useful validation update must state the reported respondent count and which extracted observations were used, preserve provenance, and explain score movement (or why the score does not move); a 100-person sample does not automatically justify higher confidence or prove demand.

The suggested survey/customer-research flow may prepare a draft page and questions automatically. Sending messages, publishing a page, or contacting third parties remains a separate human-approved action; no external side effect is represented as complete without evidence.

Deployment boundary: `quick-fox-785` is the intended test project, but its current code state is unverified. `agile-seahorse-379` received broader function deployments in runs `39311119875` and `39314672344`; no further deployment there. `fiery-gazelle-628` is another app and must remain untouched. PR #24 stays open/unmerged; do not publish the whole unverified product.

Historical note: commit `b5d13713...` passed web/Convex TypeScript, full Vitest (**124 files / 685 tests**), `git diff --check`, and Next.js production build (**36/36** pages). Its Convex workflow runs `39311119875` and `39314672344` targeted production, not the test deployment. Commit `0a90b9f` has a successful Netlify check (`6ad68041`). New local query-stability and stale-score fixes pass the full suite (**125 files / 688 tests**), web/Convex TypeScript, Convex TypeScript, and Next.js build (**36/36**); a fresh preview is pending.

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
7. Obtain and verify a deployment key explicitly scoped to `quick-fox-785`, then deploy only after local verification. Do not touch `fiery-gazelle-628`; it belongs to another application. No further deployment to `agile-seahorse-379`.
8. Validate real provider/concurrency behavior and calibrate commercial limits from measured economics.
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
