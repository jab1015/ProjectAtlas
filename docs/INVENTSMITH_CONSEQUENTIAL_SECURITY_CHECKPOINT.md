# InventSmith Consequential Security Checkpoint

**Updated:** October 20, 2026 (America/New_York)
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation refresh:** `93744db1fdf2772925f96dbc4d33ed1823192f86`

## Current security checkpoint

Consequential operations remain fail-closed, server-authorized, revision-bound where artifacts are involved, and explicitly separated from outside-world execution.

### Automatic validation survey boundary — October 20, 2026

For a complete Validation report whose evidence fingerprint is current and whose average section confidence is 50% or lower, the Validation page may create one inventor-shareable survey through the existing authenticated survey mutation after checking current request records. This client check prevents duplicates on normal reloads but not a simultaneous multi-tab race. The inventor gets a link and decides whether and where to share it. InventSmith does not send messages, invite recipients, publish posts, spend money, or treat responses as verified facts. Public responses are stored with inventor-provided/unverified provenance and enter the existing evidence-impact refresh path. The first Preview exposed that a proposed new server mutation was not deployed; the UI now uses the existing list/create endpoints.

InventSmith CI **#226** (`39016181734`) passed against exact code head `93744db1fdf2772925f96dbc4d33ed1823192f86` with web/Convex typechecking, **116 test files / 660 tests**, production dependency audit with **0 vulnerabilities**, bounded development-dependency audit, and Next.js **15.5.27** production build with **32/32** static pages generated.

This documentation refresh creates a newer head and therefore requires its own exact-head CI before that documentation head itself is called automatically verified.

## Limited production authentication checkpoint

The owner-controlled Convex production deployment `agile-seahorse-379` received only the password-recovery backend scope. Existing production functions and data were preserved; PR #24 remains draft/open/unmerged and the full unverified product was not deployed.

Password recovery was live-functionally verified through the Netlify PR #24 preview: the reset email was delivered, the recovery code was received, and authenticated sign-in succeeded. The first test email was routed to spam.

The refreshed preview's InventSmith operations page now tolerates the limited production `operationalHealth:getSnapshot` response without the newer `ai` field and reports AI details as unavailable. This was a frontend/backend compatibility defect, not a security or password-recovery failure. Full-branch testing will use the dedicated InventSmith Convex test deployment `dev/inventsmith-test` (`quick-fox-785`); the unrelated `fiery-gazelle-628` deployment must remain untouched.

## Authorization and destructive behavior coverage

Current backend/regression coverage directly protects:

- administrator/account-deletion/privacy execution boundaries;
- organization ownership/member/invitation and invention-sharing authority;
- invention deletion authorization/storage/accounting cleanup;
- stale invention-grant cleanup and owner `manage` precedence;
- personal/organization export separation and billing attribution scope;
- blocked-work resume versus consequential gate classes;
- professional-review recording/invalidation;
- exact-revision external-use authorization;
- exact-artifact consequential approval scope and execution-time revalidation;
- exact-generation manufacturing release.

Rejected destructive/consequential paths are tested for zero unauthorized side effects where intended.

## Subscription and billing security

The behavior-tested subscription application path proves:

- duplicate provider event IDs are idempotent with zero new entitlement writes;
- invalid organization billing identity is rejected without entitlement mutation;
- exact valid organization application patches only the intended organization;
- organization-only plans cannot flow through the legacy user path;
- an established provider customer/subscription identity remains authoritative across legitimate ownership transfer;
- canceled and past-due access survives only while `currentPeriodEnd > now`;
- cancellation downgrades exactly at period end;
- unpaid access downgrades immediately even if a future provider period remains;
- legacy-user and personal-organization mirrored entitlements remain aligned across those lifecycle transitions;
- delayed older provider events are retained for audit but cannot overwrite newer entitlement state;
- equal-timestamp provider events resolve deterministically by provider-event ID rather than network arrival order for both organization and legacy-user scopes.

The signed subscription HTTP ingress additionally proves:

- missing secret/signature and invalid HMAC are rejected before mutation;
- malformed/negative/oversized declared lengths fail closed;
- actual body size is enforced in UTF-8 bytes;
- signed malformed JSON and invalid subscription payloads never reach the mutation;
- a valid signed event is normalized and handed to the exact subscription application mutation once.

## Checkout success / analytics truth boundary

The checkout-success page does not treat a browser redirect or public query parameter as proof that entitlement changed.

Direct regression coverage now proves:

- the success page continues to state that confirmed billing state is authoritative;
- no public `plan` query parameter is read to determine completion;
- the page cannot call `trackUpgradeCompleted` from a public redirect;
- the page records only `checkout_returned`, which is explicitly non-authoritative;
- `upgrade_completed` remains reserved for a future call site backed by a confirmed provider billing event.

This prevents spoofed success URLs from corrupting upgrade-completion analytics or implying server-side entitlement that has not actually been confirmed.

## Fulfillment replay and signed-ingress security

Direct behavior tests prove:

- Stripe-session and platform-order replays return the existing purchase rather than creating a duplicate;
- platform-order replay may safely backfill a missing Stripe session identifier without duplicating purchase state;
- sales count increments only for a genuinely new purchase;
- replay returns the authoritative stored download token rather than a newly proposed dead token;
- missing fulfillment secret/signature, bad HMAC, malformed/oversized length, UTF-8 oversized body, malformed JSON, invalid payload, and unknown product all fail before purchase creation;
- valid new fulfillment creates one purchase and increments sales once;
- valid replay does not increment sales again.

## Authorized download security and accounting

Direct behavior tests prove:

- missing purchase ID/token fails before backend access;
- malformed external purchase IDs normalize to `null` rather than surfacing typed-ID validation exceptions;
- missing purchase, wrong token, and unfulfilled purchase fail before file/storage access;
- an explicitly requested file must belong to the purchased product’s file set;
- unavailable storage URL fails without recording a download;
- successful default or selected-file delivery records the purchase download exactly once before returning a redirect;
- if download accounting fails, the handler does not issue a successful redirect.

This keeps `downloadCount` / `lastDownloadedAt` aligned with successful authorized delivery attempts instead of leaving the existing accounting mutation orphaned.

## External-use and approval boundary

Professional review, external-use authorization, consequential approval, manufacturing release, and actual outside-world execution are distinct states.

For artifact-based consequential actions:

- request creation requires explicit deliverable IDs;
- each deliverable must be current/latest, fresh, unambiguous, and already authorized for external use;
- approval revalidates scope;
- execution guard revalidates scope again immediately before any eventual outside-world action;
- stale/superseded/unauthorized/wrong-invention/duplicate-latest/legacy-unscoped scope fails closed;
- approval resolution itself records non-execution semantics.

## Current no-executor boundary

The repository currently has no executor that sends an RFQ, contacts a supplier/manufacturer, discloses invention artifacts externally, places a manufacturing order, makes a supplier payment, files a submission, or publishes for the inventor.

Any future executor must revalidate current approval immediately before the external side effect and record separate execution evidence. Permission, review, authorization, or release records must never be reused as proof that an outside-world action occurred.

## CI and dependency security boundary

The CI workflow verifies the actual expected PR head, pins official checkout/setup-node actions to immutable commits, and disables persisted checkout credentials.

Production audit remains fail-closed and reported **0 vulnerabilities** at the verified checkpoint. The accepted development-only advisory boundary is limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`; unexpected packages fail CI.

Lucia `3.2.2` deprecation remains a separately planned authentication migration item.

## Next security targets

Near-term targets are:

1. owner-controlled live provider acceptance for signatures, checkout confirmation, cancellation, past-due, delayed/equal-time/duplicate events, and browser-visible entitlement changes;
2. real disposable checkout → confirmed provider event → fulfillment → download acceptance, including replay and accounting verification;
3. deeper persisted physical/software/hybrid/regulated lifecycle cases and evidence replacement/removal;
4. artifact/rendered-output quality validation;
5. continued execution-time revalidation if any future outside-world executor is deliberately introduced.

## Boundaries not changed

- No outside-world executor was added.
- No production billing provider/webhook was enabled live.
- No deployment claim is made for this documentation refresh.
- No professional review is inferred from tests or repository state.
- No real-world evidence is inferred from model output or CI.
- PR #24 remains draft/unmerged.
- `main` remains untouched.

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

## Retest safety boundary — 2026-10-19

The signed-in Preview's prepared survey link is displayed for the inventor to share. This test did not send it to respondents, submit survey answers, start queued department agents, spend provider credits, make purchases, contact vendors, or file legal documents. Growth showed five queued prerequisite-dependent jobs and no completed outputs. Treat department execution, external actions, money, and physical work as unverified or approval-gated until individually tested under an authorized budget and conditions.

## Department test boundary — 2026-10-19

The audit read every department route and checked code-level routing; it did not start a worker, consume model/CAD/rendering capacity, send survey links, contact providers, make purchases, or create legal filings. The personal organization uses shared AI, research, CAD, rendering, and document-generation capacity; the Preview did not expose its remaining balance. Keep live provider-backed acceptance within an explicit usage limit and avoid external/physical/legal/payment actions.
