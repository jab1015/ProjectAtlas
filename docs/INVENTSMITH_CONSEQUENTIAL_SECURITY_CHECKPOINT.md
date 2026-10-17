# InventSmith Consequential Security Checkpoint

**Updated:** October 16, 2026 (America/New_York)  
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation refresh:** `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`

## Current security checkpoint

Consequential operations remain fail-closed, server-authorized, revision-bound where artifacts are involved, and explicitly separated from outside-world execution.

InventSmith CI **#165** (`38994705687`) passed against exact code head `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`. That checkpoint passed web/Convex typechecking, **107 test files / 603 tests**, production dependency audit with **0 vulnerabilities**, bounded development-dependency audit, and the Next.js **15.5.27** production build with **32/32** static pages generated.

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
- blocked-work private-information resume versus consequential gate classes;
- professional-review recording/invalidation;
- exact-revision external-use authorization;
- exact-artifact consequential approval scope and execution-time revalidation;
- exact-generation manufacturing release.

### Account deletion and privacy request execution

Executable tests prove:

- administrator account deletion is rejected before destructive side effects;
- suspended company/studio ownership blocks account deletion with zero destructive writes/storage deletes;
- generic privacy resolution cannot falsely mark account deletion complete;
- terminal/admin/billing guards run before destructive account deletion;
- successful deletion follows `request in_progress → deleteAccountData → request completed`, so a failed deletion cannot be recorded as completed by ordering alone.

### Organization ownership/member management

Executable tests prove:

- personal organization ownership cannot be transferred;
- inactive new-owner targets fail with zero writes;
- same-owner transfer is idempotent;
- valid ownership transfer performs the expected membership/organization changes;
- non-managers cannot change member roles;
- organization owner role cannot be mutated/removed through member-management paths;
- inactive targets and manager self-removal fail safely;
- valid role/removal paths perform only the intended membership write.

### Billing and privacy exports

Executable tests prove:

- Admin organization export does **not query raw `subscriptionEvents`**;
- Owner organization export may include organization-bound billing attribution;
- personal export includes legacy/personal-owner inventions but excludes company/studio inventions even when created by the user;
- non-owner or removed personal-organization memberships do not create personal ownership scope;
- personal subscription-event filtering does not allow a user binding to override a non-personal organization binding.

### Invitation consent boundary

Executable tests prove:

- legacy pre-binding invitations cannot be accepted;
- wrong-account invitations fail with zero membership writes;
- changed-email invitations fail with zero membership writes;
- ambiguous duplicate-account email resolution fails closed;
- elapsed invitations are marked expired but never create membership;
- current seat capacity is rechecked at acceptance time;
- membership is created/reactivated only after account, email, organization, expiry, and seat-capacity checks pass;
- the public Convex mutation delegates to the behavior-tested `acceptInvitationHandler`.

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

The remaining accepted development-only advisory boundary is limited to:

- `@next/eslint-plugin-next`
- `braces`
- `eslint-config-next`
- `fast-glob`
- `micromatch`

Unexpected development advisory packages fail CI. The previous Vitest config-loader warnings are fixed rather than suppressed. Lucia `3.2.2` deprecation remains a separately planned authentication migration item.

## Next destructive-security target

The next larger direct behavior target is invention deletion in `convex/journeyEngine.ts`, including authorization-before-write, storage cleanup, canonical-row deletion, notification cleanup, and reserved-usage accounting. Because that path has many side effects, it should be exposed/tested through behavior-preserving extraction rather than duplicated or simplified merely for tests.

## Boundaries not changed

- No outside-world executor was added.
- No production billing provider/webhook was enabled.
- No deployment claim is made for this documentation refresh.
- No professional review is inferred from tests or repository state.
- No real-world evidence is inferred from model output or CI.
- PR #24 remains draft/unmerged.
- `main` remains untouched.
