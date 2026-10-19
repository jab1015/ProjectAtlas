# InventSmith Current Plan and Progress

**Updated:** October 19, 2026 (America/New_York)
**Product:** InventSmith — The Inventor OS  
**Company:** Modern Methods  
**Repository:** `jab1015/ProjectAtlas` (historical repository slug)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest branch checkpoint:** PR #24 head `7d9ecc003343c31a5831217e82eccd7431ce3ba7` remains draft/open/unmerged. Successful protected Netlify Deploy Preview: `6ad6853b072c128eb3df13a6`. Repair commit `672156c` passed **125 test files / 688 tests**, web and Convex TypeScript, and Next.js build (**36/36** pages). **Correction:** Netlify's Production-context build for `672156c` ran `npx convex deploy` and pushed functions to `agile-seahorse-379` at about 2:02 PM October 19. The website was not published; the log reported no indexes deleted. Do not trigger more production-context builds until the command is guarded. `fiery-gazelle-628` remains untouched.

## October 19 owner-request checkpoint

### Latest build blocker — 4:52 PM ET

Netlify deploy `6ad6827f323028ef5f5376e1` failed on invalid UTF-8 in `src/app/(app)/invention/[id]/page.tsx`. Repair commit `672156c` restored valid source and passed **688 tests**, both TypeScript checks, and a **36/36** Next.js build. The current PR #24 preview is `6ad6853b072c128eb3df13a6` at head `7d9ecc0`. A Netlify Production-context build for `672156c` also deployed Convex functions to `agile-seahorse-379`; see the correction above. No AI generation or app-level data-changing test was run.


### Live retest — October 19, 2026, 4:45 PM ET

Read-only retest against Netlify deploy `6ad68041` (branch head `0a90b9f`):

- The Journey Center and Stage 2 load; RiseJars still displays **36%** and gives no survey attribution.
- Evidence Locker and Support both crash into “Something went wrong.” The browser records minified React error **#301** (“Too many re-renders”). Source inspection found three new `useQueries` calls receiving newly allocated request objects on every render. This is the immediate crash cause; the new local fix memoizes those objects. The backend query result remains unverified until the fixed pages render.
- The uploaded survey is present in the Journey Center evidence count, but the current Validation view does not show the survey. A local UI fix now hides confidence while the report fingerprint does not match current evidence and shows extraction/refresh status.
- Netlify generated a successful check for branch head `0a90b9f`; the subsequent local fixes are not included in that deployment yet.
- No upload, survey-page creation, support submission, account mutation, or AI generation was triggered.

### Latest read-only preview acceptance — October 19, 2026

**Continuation, 5:30 PM ET:** Stages 14 (Launch) and 15 (Growth) also load. Launch is 0/6 complete with six queued items; Growth is 0/5 complete with five queued items. Journey Center shows Stage 2 as current, 1 inventor evidence source (0 verified), and zero attention items/professional reviews. Browser console reconfirmed the missing preview-backend functions `evidenceRequests:list` and `supportCases:listMine`; extension metadata logging errors are unrelated. The route sweep across all 15 stages is complete, but no AI department execution has been validated. No side-effecting or usage-consuming actions were run.

On protected PR #24 Deploy Preview `6ad6853b072c128eb3df13a6`, signed in as `jerry@modernmethods.it.com` and viewing RiseJars (`n171ne8qzh2ebqwag8w7qybemx8gg2p8`): Evidence Locker shows the 475 KB `Data_All_260313.pdf` with structured extraction complete and a summary reporting approximately 100 users. Validation still says complete at **36%** with generic next-step advice and no findings-level survey attribution. Source code uses a fixed evidence-support bonus for recognized survey evidence, not analysis of answer distributions. Evidence fingerprinting/scheduled refresh code exists, but the live report does not prove that survey-triggered regeneration completed using the survey.

Evidence Locker displays “Previously created survey links could not be loaded”; Support displays “Your reports could not be loaded.” The upload and support forms render. Market Research has **0 deliverables**, **1 evidence file**, and **1 source**. Patent Readiness has no completed deliverable; Prototype is **0/7**, Manufacturing **0/10**, Growth **0/5**, with all inspected items queued. Product Design was previously observed at **0/17** queued. No queued AI or CAD task was run.


### Live preview acceptance sweep — October 19, 2026, 4:25 PM ET

The authenticated Netlify PR #24 preview was inspected as the signed-in `jerry@modernmethods.it.com` account, using RiseJars. This was a read-only sweep; no AI generation, upload, survey creation, support submission, profile change, or production action was triggered.

- **Evidence Locker:** The first visit showed the generic “Something went wrong” screen. A later visit rendered the upload form and “Create shareable page” control, but the browser console recorded Convex query failure `evidenceRequests:list`: “Could not find public function.” The repository source at this checkpoint exports that query. Existing survey-request listings therefore do not work against the backend currently reached by the preview. Upload itself and share-link creation were not submitted during this sweep.
- **Support:** `/support` consistently showed the generic error screen. Convex reports missing public function `supportCases:listMine`; this function is present in repository source. Customer support-case creation and tracking are blocked until the preview frontend and its Convex backend are aligned.
- **Backend alignment:** The two missing functions (`evidenceRequests:list`, `supportCases:listMine`) are present in source but absent from the Convex deployment reached by the preview. This indicates frontend/backend version or target mismatch; the exact cause and target deployment still need confirmation. Do not infer that the source implementation itself is absent.
- **Validation:** RiseJars remains “Validation complete” at **36%**, with the next-step recommendation to interview more users. The page does not visibly state which findings from the uploaded SurveyMonkey PDF were included or why the survey did not change the score. Survey-aware refresh and score attribution are not accepted.
- **Market Research:** The page renders, but reports **0 market deliverables**, **1 inventor evidence file**, and **1 research source**. It says completed research will appear automatically; no completed market deliverable is present.
- **Departments:** Stage pages 6–15 render and expose “Continue department”; their work remains queued. The Design + CAD page renders and offers “Continue design work” and “Generate native CAD”; no generation was invoked. This confirms page availability only, not that any AI agent executes successfully.
- **Journey navigation:** The Stage 1 “Idea” card and Stage 2 “Validation” card both expose the same destination (`/invention/{id}`), which renders Stage 2 Validation. Stage 1 therefore has no distinct destination from the Journey Center and requires a routing fix or an explicit decision that Idea is represented only by the shared invention view.
- **Work Library:** It reports **2 autonomous work items failed**, **19 required deliverables missing**, and missing concept-visualization media. The user-facing page does not identify the failed work items or explain their failure, so the failures cannot be diagnosed from this view.
- **Profile / organization:** Account controls for saving the inventor name and personal workspace name are visible. The current profile name appears blank; save behavior was not tested to avoid changing account data. The organization currently appears as “RiseJars Personal Organization.”
- **Admin access:** `/admin`, `/admin/operations`, `/admin/support`, and `/admin/beta-access` show “Administrator access required.” The active session is `jerry@modernmethods.it.com`, so the owner’s intended admin account/role was not verified and these consoles could not be functionally tested.
- **Other routes:** Invention access, review, chat, organization, and account pages rendered during this sweep. Chat was not submitted. A visible Sign Out button is present.

**Conclusion:** The preview is not ready for broad functional acceptance. The Evidence Locker and Support lists fail; Validation does not clearly show survey findings or demonstrate that the automatic refresh incorporated them; and no department AI agent has been functionally exercised. The preview frontend is configured for `quick-fox-785`, but backend functions `evidenceRequests:list` and `supportCases:listMine` were previously reported missing there. Align and safely deploy the intended test backend before further live acceptance. Do not trigger production-context builds until Netlify’s production Convex deploy command is guarded. Do not touch `fiery-gazelle-628`, merge PR #24, or publish the full product.

Password recovery is **already tested successfully** and is not the active task. Netlify Production-context build deployed functions to `agile-seahorse-379` on October 19, beyond the earlier password-recovery scope. Do not trigger further production-context builds or attempt rollback/deployment without explicit review. Do not merge PR #24, publish the full product, or touch `fiery-gazelle-628`.

The intended dedicated InventSmith test Convex project is `quick-fox-785` (`dev/inventsmith-test`), but its current deployed state is unverified. Runs `39311119875` and `39314672344` both targeted `agile-seahorse-379`. The workflow now rejects production-scoped `prod:` keys; configure and verify a `dev:` key specifically for `quick-fox-785` before deploying there.

Historical source checkpoint `b5d13713...` passed web/Convex TypeScript, full Vitest (**124 files / 685 tests**), audit, and Next.js build (**36/36**), but its Action logs show a production-targeted deployment. Repair commit `672156c` passed web/Convex TypeScript, Convex TypeScript, Vitest (**125 files / 688 tests**), `git diff --check`, and Next.js build (**36/36**). Its PR preview is live; acceptance remains incomplete.

Code already present on the active work line includes automatic department invalidation/requeue on invention input changes, validation evidence fingerprinting and survey-aware evidence scoring/display, PDF structured extraction, simplified validation summary UI, account/profile and personal-workspace rename controls, selected-existing-user beta access and audited credit controls, and admin navigation/sign-out affordances. The operations UI also handles an older health response that omits AI configuration details. These are **implementation claims only** until exact-head checks and authenticated acceptance on the currently served preview/test backend pass.

### Owner-reported acceptance gaps still to resolve

- RiseJars' uploaded SurveyMonkey PDF reports 100 respondents (roughly 95–100 answers per question), but validation confidence remained at 36%. The UI must show which survey findings were actually extracted and considered, explain how evidence affects the score, and refresh affected validation/departments after upload. Do not inflate a heuristic score or describe unverified self-reported survey data as independent proof.
- Confirm the account profile name and personal workspace rename controls are visible and save correctly for the signed-in account; the user previously saw “Name not set” and an unwanted default workspace name.
- Verify the existing-user admin access/credit console, admin exemption from daily/AI limits, operations/support modules, and an always-accessible sign-out action. Report any missing function or permission gap instead of calling it fixed.
- A support-case workflow is implemented in source; deployment to `quick-fox-785` is not verified: user-submitted and user-visible cases; admin filtering, status updates, private notes; and optional invention linking with reporter-access validation. Support-case access does not bypass invention permissions. Full local verification passes; live acceptance remains outstanding. Avoid promising support staff direct evidence access until a separate consented, audited access path exists.
- Verify automatic downstream department refresh and that research/survey collection produces an inventor-reviewable draft. External publication, invitations, or outreach must remain approval-gated until destination, audience, and consent are defined.
- The older Netlify deploy `6ad68041` at `0a90b9f` had React #301 crashes on Evidence Locker and Support. The current PR preview renders those forms but existing share-link and support-case records fail to load. Validation still shows 36% without findings-level survey attribution. No `quick-fox-785` deployment is verified.

### Immediate continuation

1. Guard Netlify Production-context builds so they cannot deploy Convex production before any further branch push.
2. Align the preview backend with branch functions `evidenceRequests:list` and `supportCases:listMine`, then retest the existing survey-link and support-report lists.
3. Trace why the completed survey is not visibly reflected in Validation and repair/test the automatic refresh and evidence-based explanation without overstating unverified survey data.
4. Only after isolated-backend alignment, run narrowly bounded AI acceptance and inspect saved outputs. A queued status does not prove an agent works.
5. Keep PR #24 open/unmerged; preserve `fiery-gazelle-628`; make no further `agile-seahorse-379` deployments.

## Product destination

InventSmith owns the applicable invention journey from raw idea through evidence, validation, market research, prior-art/patent readiness, product design, applicable CAD/engineering, prototype, manufacturing or software delivery, branding, IP/legal preparation, pricing, marketing, sales, funding, launch, and growth. Physical, software, hybrid, and regulated inventions route differently while preserving the same evidence, maturity, authorization, and human-gate truth model.

Do not publish one overall completion percentage. Repository implementation, automated verification, deployment, live functional acceptance, genuine professional review, real-world evidence, and outside-world execution are separate states.

## Exact verified repository checkpoint

InventSmith CI **#226** (run `39016181734`) passed against exact branch head `93744db1fdf2772925f96dbc4d33ed1823192f86`.

The successful exact-head workflow passed:

- exact-head checkout and SHA assertion;
- Node 22.23.3 / npm 10.9.9 lockfile installation;
- operational script syntax checks;
- web TypeScript;
- Convex TypeScript;
- **116 test files / 660 tests**;
- production dependency audit with **0 vulnerabilities**;
- bounded development-dependency audit;
- Next.js **15.5.27** production build with **32/32** static pages generated.

The accepted development-only advisory boundary remains limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`. Unexpected advisory packages fail CI. Lucia `3.2.2` remains deprecated and requires a separately planned authentication migration rather than a blind dependency change.

This documentation refresh creates a newer branch head. The final documentation head must receive its own exact-head CI before that documentation head is called automatically verified.

## Current limited deployment and acceptance status

GitHub Action logs show that the development workflow deployed branch Convex functions to `agile-seahorse-379` in runs `39311119875` and `39314672344`. The key was bound to production; the workflow title and prior status notes were inaccurate. Logs confirm successful schema validation and no deleted indexes, but cannot establish that existing function behavior was unchanged. Do not use this workflow again with the current key. It now rejects `prod:` keys. `quick-fox-785` remains unverified; PR #24 remains unmerged and the full product was not published through Netlify production.

The Netlify PR #24 preview at `deploy-preview-24--inventsmith.netlify.app` has been used for authenticated acceptance. Password recovery is live-functionally verified: the reset email was delivered, the recovery code was received, and sign-in succeeded. The first test email was routed to spam.

An earlier preview build contained an operations compatibility fallback for a health response without the newer `ai` field. The current live browser session was not an authorized admin, and GitHub logs show branch-function deployments reached production; operational and data impact have not been independently assessed.

The branch now includes an admin-only **Beta access & credits** console. An administrator can grant a selected existing account a dated organization-level plan override, revoke it, and grant/debit/refund credits through an append-only ledger. Overrides preserve the base plan, require a reason, expire automatically, and do not create lifetime free access. The highest plan can be used for full-premium beta access while Explorer remains changeable later without rewriting account history.

## Source, Convex, hosting, and deployment boundary

GitHub remains source/CI authority. Convex is a core InventSmith backend, not an optional add-on. The Convex deployment `fiery-gazelle-628` belongs to another application and must not be used or modified for InventSmith. The intended dedicated InventSmith test deployment is `dev/inventsmith-test` (`quick-fox-785`), but repository code and auth configuration there are not verified. Runs `39311119875` and `39314672344` targeted `agile-seahorse-379` instead.

That does **not** mean the current code head is deployed or live accepted. Current truth remains:

- repository/local verification: `672156c` passed 125 test files / 688 tests, web/Convex TypeScript, Convex TypeScript, and Next.js build 36/36; PR #24 preview `6ad6853b072c128eb3df13a6` is live; acceptance remains incomplete;
- InventSmith Convex test infrastructure: intended target `dev/inventsmith-test` / `quick-fox-785`; deployment and auth state are unverified;
- Netlify: protected deploy preview is live; protected-page acceptance is in progress;
- Modern Methods-owned Vercel/frontend deployment: not yet verified complete;
- authenticated browser acceptance: not yet complete;
- production billing/webhooks: not owner-live accepted;
- genuine professional review/real-world evidence: count only when actually performed and recorded.

MadeThis is historical only and must not be used as a deployment or synchronization target.

## Implemented and hardened product state

The active branch includes organization-native invention workspaces, scoped access/usage/entitlements, consent-based invitations, privacy/export/deletion boundaries, complete applicable journey routing, persistent evidence/invention state, fail-closed evidence promotion, partial validation/retry, attempt/lease-aware autonomous work, usage settlement, professional-review state, genuine prototype/quote/launch evidence gates, versioned deliverables, exact-revision external-use authorization, exact-generation manufacturing release, package export, and consequential approval guards.

Seventeen stable department-agent profiles cover common physical/hybrid work plus software-specific product, engineering, prototype, and release paths. Missing or unknown department routing fails closed before model execution.

### Direct security, billing, fulfillment, and checkout behavior coverage

Executable behavior tests now directly cover:

- account deletion and privacy-request execution guards;
- personal and organization privacy/export scope;
- organization ownership, member management, invitation acceptance, and invention sharing;
- stale invention-grant cleanup and owner `manage` precedence;
- invention deletion cleanup/storage/accounting behavior;
- subscription application idempotency, invalid organization targeting, exact organization application, legacy-user behavior, and billing identity continuity across ownership transfer;
- cancellation/past-due period-end behavior and immediate unpaid downgrade for both organization and legacy-user billing, including personal-organization entitlement mirroring;
- delayed/older provider-event rejection and deterministic equal-timestamp resolution independent of delivery order for both billing scopes;
- signed subscription HTTP ingress: secret/signature validation, malformed/oversized payload rejection, UTF-8 byte limits, payload normalization, and exact mutation handoff;
- fulfillment replay safety: duplicate fulfillment cannot double-count sales and returns the authoritative stored download token rather than a dead newly proposed token;
- signed fulfillment HTTP ingress: rejected requests perform zero product reads/purchase writes, unknown products do not create purchases, valid new purchases increment sales once, and replays do not increment sales;
- download authorization: malformed external purchase IDs fail closed, wrong/unfulfilled links cannot reach storage, requested files must belong to the purchased product, successful redirects record download accounting first, and accounting failure prevents redirect;
- checkout-success truth: a public checkout redirect/query string cannot emit authoritative `upgrade_completed` analytics or claim entitlement; the page records only a non-authoritative `checkout_returned` event while waiting for confirmed billing state.

## Engineering/manufacturing and external-use boundaries

Manufacturing readiness remains revision-bound and fail-closed. Newer preliminary/stale work cannot be hidden by an older clean revision. Manufacturing release is a separate manager-authorized transition for one exact synchronized newest qualifying generation and is not supplier contact, disclosure, ordering, payment, filing, or publication.

Professional review, external-use authorization, consequential approval, manufacturing release, and outside-world execution remain separate states. The repository still has **no executor** that sends RFQs, contacts suppliers/manufacturers, discloses invention artifacts, places orders/payments, files submissions, or publishes for the inventor.

## Immediate continuation order

1. Qualify the final documentation-refresh head with exact-head InventSmith CI.
2. Continue provider/billing acceptance on owner-controlled infrastructure: real signatures, checkout, confirmed provider events, cancellation/past-due, replay, fulfillment, download, ownership changes, and browser-visible entitlement transitions.
3. Drive representative physical, software, hybrid, and regulated inventions through deeper persisted state transitions, evidence replacement/removal, newest-revision invalidation, manufacturing release, and later external-action boundaries.
4. Continue specialized artifact/package and generated-format quality acceptance, including rendered document and CAD-format checks where feasible.
5. Preserve the no-executor boundary until an outside-world executor is deliberately implemented with execution-time revalidation and separate execution evidence.
6. Continue low-risk InventSmith naming cleanup while preserving compatibility/historical identifiers that still require tested migration.
7. Verify the full invention journey and selected-account beta access/credit controls only after `quick-fox-785` is confirmed as the backend target and deployed with a test-scoped key. No further deployment to `agile-seahorse-379`.
8. Complete live authenticated multi-user/multi-invention acceptance, provider failure/retry, concurrency, billing/webhooks, professional-review, and representative lifecycle acceptance after owner-controlled infrastructure is ready.
9. Plan the Lucia v3 authentication migration separately.
10. Calibrate commercial limits from measured provider/runtime economics.

## Status rules

- **Planned** — specified but not necessarily implemented.
- **Implemented** — code exists in the repository.
- **Automated verification passed** — the exact implementation head passed relevant deterministic checks.
- **Deployed** — the exact code/config is present on owner-controlled infrastructure.
- **Live functionally verified** — representative authenticated acceptance passed there.
- **Professional review completed** — a genuine qualifying review was actually recorded.
- **Real-world evidence present** — genuine outside-world evidence was actually ingested/verified.
- **External action executed** — an outside-world side effect actually occurred and was separately recorded.

Never collapse these states into a single production-ready claim.

## New-chat start instruction

Read `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`, this file, `docs/INVENTSMITH_BUILD_PROGRESS.md`, `docs/INVENTSMITH_CAPABILITY_MATRIX.md`, `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`, `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md`, and `docs/INVENTSMITH_CONSEQUENTIAL_SECURITY_CHECKPOINT.md`; then fetch the live branch, draft PR #24, and exact-head CI. Trust newer verified GitHub state over documentation text. Do not restart completed work, merge PR #24, touch `main`, or reintroduce MadeThis synchronization.

### Follow-up verification — October 19, 2026, 5:34 PM ET

All 125 test files / 689 tests pass; web and Convex typechecks pass; compile-only `npx next build` passes (36/36 pages). The guarded Netlify config and its regression test are local only. `npm run build` requires `CONVEX_DEPLOYMENT` for codegen, which was intentionally not configured. No AI credits or AI/CAD tasks were used. Cannot safely align the preview backend until a `dev:` deploy key verified for `quick-fox-785` is available; the previously identified production key is prohibited. Do not push until the backend target and Netlify Production-context command are safely verified.

### Continued no-credit repair pass — October 19, 2026

Locally added safe failure summaries in the invention work library and regression tests for secret-safe failure messages and Netlify's no-Convex-deploy invariant. Latest checks pass: **126 test files / 692 tests**, web and Convex typechecks, and compile-only Next build (**36/36** pages). No AI credits/tasks, deployments, or pushes were used. Status documents and Netlify protection changes are local and unpushed. The intended development deployment `quick-fox-785` still needs a verified `dev:` key before backend alignment and live workflow tests; the known production-scoped key is not acceptable. Evidence Locker/Support route errors, survey visibility/confidence, automatic downstream refresh, and all department workflows remain open live-acceptance items.
