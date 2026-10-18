# InventSmith Build Progress

**Last updated:** October 18, 2026 (America/New_York)
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified CI checkpoint:** `93744db1fdf2772925f96dbc4d33ed1823192f86` (CI #226). Later operations-console compatibility changes were locally verified and preview-accepted; their documentation head still requires exact-head CI.

## Current status snapshot

InventSmith status is reported by capability and evidence, not by a single completion percentage. Repository implementation, automated verification, deployment, live functional verification, genuine professional review, real-world evidence, and outside-world execution remain separate states.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Current limited deployment checkpoint

The owner-controlled Convex production deployment `agile-seahorse-379` received only the password-recovery backend scope required for acceptance. Existing production functions and data were preserved; PR #24 was not merged and the full unverified product was not deployed.

The password-recovery flow was live-functionally verified on the Netlify PR #24 preview at `deploy-preview-24--inventsmith.netlify.app`: reset email delivery succeeded, the recovery code was received, and authenticated sign-in succeeded. The email initially landed in spam during testing.

The refreshed admin **InventSmith operations** page works in the preview. Because the limited production response does not expose the newer `snapshot.ai` field, the frontend reports AI details as unavailable while keeping health/work monitoring available. This is an intentional compatibility state, not a password-recovery or data-integrity failure. Bugsnag blocking and the preload warning are unrelated browser messages.

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
7. Deploy the branch to the dedicated InventSmith Convex test deployment `dev/inventsmith-test` (`quick-fox-785`) and verify the full invention journey there. Do not touch `fiery-gazelle-628`; it belongs to another application. Keep `agile-seahorse-379` limited to the verified password-recovery scope.
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
