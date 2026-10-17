# InventSmith Consequential Security Checkpoint

**Updated:** October 16, 2026 (America/New_York)  
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation refresh:** `75ac3b9b7fb0bd20bf8254bb13ca80d033779e52`

## Current security checkpoint

Consequential operations remain fail-closed, server-authorized, revision-bound where artifacts are involved, and explicitly separated from outside-world execution.

InventSmith CI **#182** (`38997088336`) passed against exact code head `75ac3b9b7fb0bd20bf8254bb13ca80d033779e52`. That checkpoint passed web/Convex typechecking, **110 test files / 621 tests**, production dependency audit with **0 vulnerabilities**, bounded development-dependency audit, and the Next.js **15.5.27** production build with **32/32** static pages generated.

This documentation refresh creates a newer head and therefore requires its own exact-head CI before the documentation head itself is called automatically verified.

## Authorization and direct behavior coverage

Current backend/regression coverage protects consequential boundaries around:

- administrator-only account-deletion execution;
- self-service privacy actions bound to the authenticated account;
- account-deletion request type/state/admin/billing/ownership checks;
- company/studio owner protection before account deletion;
- Owner/Admin organization member-management authority;
- owner-only organization ownership transfer;
- consent-based invitation acceptance bound to the intended account/email;
- owner-only raw billing attribution in organization export;
- personal privacy export separation from company/studio invention/billing data;
- invention deletion authorization/storage/accounting cleanup;
- invention-level access grants restricted to active same-organization membership;
- stale invention-grant cleanup on member removal;
- organization-owner `manage` precedence over stale/narrow explicit grants;
- subscription-event idempotency, stale/invalid-target rejection, and exact organization entitlement application;
- blocked-work private-information resume versus consequential gate classes;
- professional-review recording/invalidation;
- exact-revision external-use authorization;
- exact-artifact consequential approval scope and execution-time revalidation;
- exact-generation manufacturing release.

### Destructive privacy and deletion behavior

Executable tests prove:

- administrator account deletion is rejected before destructive side effects;
- suspended company/studio ownership blocks account deletion with zero destructive writes/storage deletes;
- generic privacy resolution cannot falsely mark account deletion complete;
- terminal/admin/billing guards run before destructive account deletion;
- successful account deletion follows `request in_progress → deleteAccountData → request completed`;
- invention deletion requires management authority before reads/writes;
- related invention rows and storage-backed artifacts are cleaned through the existing deletion algorithm;
- reserved autonomous usage is released without going negative before the invention is removed.

### Organization membership, ownership, and invention sharing

Executable tests prove:

- personal organization ownership cannot be transferred;
- inactive new-owner targets fail with zero writes;
- same-owner transfer is idempotent;
- valid ownership transfer performs expected transitions;
- non-managers cannot change member roles;
- organization owner role cannot be mutated/removed through member-management paths;
- inactive targets and manager self-removal fail safely;
- valid member removal deletes only that departing user’s invention grants in the exact organization;
- grants in other organizations and grants belonging to other users remain untouched;
- active same-organization membership is required before an invention grant can be inserted or updated;
- a removed/suspended membership cannot regain access through an old grant;
- an active organization owner always retains `manage` access even when an older explicit grant says `view` or `review`.

### Billing and privacy exports

Executable tests prove:

- Admin organization export does **not query raw `subscriptionEvents`**;
- Owner organization export may include organization-bound billing attribution;
- personal export includes legacy/personal-owner inventions but excludes company/studio inventions even when created by the user;
- non-owner or removed personal-organization memberships do not create personal ownership scope;
- personal subscription-event filtering does not allow a user binding to override a non-personal organization binding.

### Subscription application behavior

The behavior-tested subscription handler proves:

- duplicate provider event IDs are idempotent and cause no new writes;
- an organization event with an invalid billing identity is recorded for audit but does not mutate entitlement state;
- stale organization events are recorded but do not patch the organization;
- a valid matched organization event patches only the intended organization;
- stale legacy-user subscription events are recorded without mutating user entitlement;
- organization-only plans are rejected on the legacy-user path without entitlement changes.

The signed HTTP/provider path still requires further end-to-end owner-controlled acceptance before production billing can be called live.

### Invitation consent boundary

Executable tests prove legacy pre-binding invitations cannot be accepted; wrong-account, changed-email, ambiguous-account, expired, and over-capacity cases fail closed; and membership is created/reactivated only after account, email, organization, expiry, and capacity checks pass.

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

Any future executor must revalidate current approval immediately before the external side effect, using the expected action type and exact current artifact scope, and must record separate execution evidence. Permission, review, authorization, or release records must never be reused as proof that an outside-world action occurred.

## CI and dependency security boundary

The CI workflow verifies the actual expected PR head rather than GitHub's synthetic merge commit, pins official checkout/setup-node actions to immutable commits, and disables persisted checkout credentials.

Production audit remains fail-closed with `npm audit --omit=dev --audit-level=high` and reported **0 vulnerabilities** at the verified checkpoint.

The remaining accepted development-only advisory boundary is limited to `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`. Unexpected development advisory packages fail CI.

The previous Vitest config-loader warnings are fixed rather than suppressed. Lucia `3.2.2` deprecation remains a separately planned authentication migration item.

## Next security targets

Near-term direct behavior targets are:

1. signed HTTP subscription-webhook → normalized application-handler coupling;
2. replay/out-of-order/cancellation/past-due provider lifecycle cases;
3. billing identity continuity across legitimate organization ownership transfer;
4. additional persisted representative lifecycle cases and external-use execution guards;
5. rendered artifact/output quality validation without weakening current authorization gates.

## Boundaries not changed

- No outside-world executor was added.
- No production billing provider/webhook was enabled.
- No deployment claim is made for this documentation refresh.
- No professional review is inferred from tests or repository state.
- No real-world evidence is inferred from model output or CI.
- PR #24 remains draft/unmerged.
- `main` remains untouched.
