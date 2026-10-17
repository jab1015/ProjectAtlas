# InventSmith Consequential Security Checkpoint

**Updated:** October 16, 2026 (America/New_York)  
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation refresh:** `d01b845b489ec8a7591980fa81d69b915c82d4fc`

## Current security checkpoint

Consequential operations remain fail-closed, server-authorized, revision-bound where artifacts are involved, and explicitly separated from outside-world execution.

InventSmith CI **#210** (`38999026644`) passed against exact code head `d01b845b489ec8a7591980fa81d69b915c82d4fc` with web/Convex typechecking, **114 test files / 650 tests**, production dependency audit with **0 vulnerabilities**, bounded development-dependency audit, and Next.js **15.5.27** production build with **32/32** static pages generated.

This documentation refresh creates a newer head and therefore requires its own exact-head CI before that documentation head itself is called automatically verified.

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
- stale organization and legacy-user events are recorded for audit but do not mutate entitlement;
- invalid organization billing identity is rejected without entitlement mutation;
- exact valid organization application patches only the intended organization;
- organization-only plans cannot flow through the legacy user path;
- an established provider customer/subscription identity remains authoritative across legitimate ownership transfer.

The signed subscription HTTP ingress additionally proves:

- missing secret/signature and invalid HMAC are rejected before mutation;
- malformed/negative/oversized declared lengths fail closed;
- actual body size is enforced in UTF-8 bytes;
- signed malformed JSON and invalid subscription payloads never reach the mutation;
- a valid signed event is normalized and handed to the exact subscription application mutation once.

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

1. owner-controlled live provider lifecycle acceptance for cancellation, past-due, delayed/out-of-order and duplicate events;
2. real disposable checkout → fulfillment → download acceptance, including replay and accounting verification;
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
