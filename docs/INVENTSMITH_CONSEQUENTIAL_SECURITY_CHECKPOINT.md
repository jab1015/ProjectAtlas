# InventSmith Consequential Security Checkpoint

**Updated:** October 16, 2026  
**Branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged  
**Latest verified code head before this documentation update:** `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`

## Current security checkpoint

Consequential operations remain fail-closed, server-authorized, revision-bound where artifacts are involved, and explicitly separated from outside-world execution.

InventSmith CI **#136** (`38990243845`) passed against exact code head `995a9fef88a9cdafa2f4b37bd4a9841eb7557d44`. That checkpoint passed web and Convex typechecking, 101 test files / 571 tests, production dependency audit with 0 vulnerabilities, bounded development-dependency audit, and the Next.js production build.

This documentation refresh creates a newer head and therefore requires its own exact-head CI before the documentation head itself is called automatically verified.

## Authorization coverage

Current backend/regression coverage protects consequential boundaries around:

- administrator-only account deletion execution;
- targeted structured privacy export;
- self-service privacy actions bound to the authenticated account;
- account-deletion type/state checks;
- administrator-account protection;
- external-billing resolution where applicable;
- organization/company/studio ownership-transfer requirements before destructive deletion;
- Owner/Admin organization member-management boundaries;
- owner-only organization ownership transfer to an eligible active member;
- billing-sensitive organization export with owner-only raw billing attribution;
- blocked-work private-information resume versus consequential gate classes;
- professional-review recording/invalidation;
- exact-revision external-use authorization;
- exact-artifact consequential approval scope and execution-time revalidation;
- exact-generation manufacturing release.

## New direct account-deletion behavior coverage

The latest hardening pass added executable behavior tests for `deleteAccountData` rather than relying only on source-contract assertions.

Those tests verify:

1. an administrator account is rejected before query/destructive side effects;
2. a suspended company owner is blocked until ownership resolution with zero database delete/patch/storage-delete side effects;
3. a suspended studio owner is blocked under the same zero-write/zero-storage-delete rule.

This strengthens the destructive privacy boundary by proving rejected paths remain side-effect free at the behavior level.

Further direct behavioral expansion remains planned for other destructive/privacy/billing/organization-management/external-use paths where source-contract or narrower coverage is still heavier than desired.

## Billing/privacy boundary

Organization/project export may be available to authorized organization administration, but raw billing attribution is restricted to the role that can manage billing. Current policy keeps raw subscription-event attribution owner-only rather than exposing customer email/billing identifiers to ordinary organization administrators.

No production billing provider/webhook configuration was changed by the latest hardening work.

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

The repository currently has no executor that:

- sends an RFQ;
- contacts a supplier/manufacturer;
- discloses invention artifacts externally;
- places a manufacturing order;
- makes a supplier payment;
- files a submission;
- publishes for the inventor.

Current RFQ/manufacturer work remains internal preparation plus ingestion of genuine outside responses/evidence.

Any future executor must call the current approval/execution guard immediately before the external side effect, using the expected action type and exact current artifact scope, and must record separate execution evidence. Permission, review, authorization, or release records must never be reused as proof that an outside-world action occurred.

## CI and dependency security boundary

The CI workflow now verifies the actual expected PR head rather than GitHub's synthetic merge commit, pins official checkout/setup-node actions to immutable commits, and disables persisted checkout credentials.

Production audit remains fail-closed with `npm audit --omit=dev --audit-level=high` and reported 0 vulnerabilities at the verified code checkpoint.

The remaining accepted development-only advisory boundary is limited to the known unresolved Next/ESLint lint-tool chain packages:

- `@next/eslint-plugin-next`
- `braces`
- `eslint-config-next`
- `fast-glob`
- `micromatch`

Unexpected development advisory package names fail CI. Do not force-downgrade Next lint tooling merely to silence the unresolved chain.

## Boundaries not changed

- No outside-world executor was added.
- No production billing provider/webhook was enabled.
- No deployment claim is made for this documentation refresh.
- No professional review is inferred from tests or repository state.
- No real-world evidence is inferred from model output or CI.
- PR #24 remains draft/unmerged.
- `main` remains untouched.
