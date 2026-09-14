# InventSmith Consequential Security Checkpoint

**Date:** September 14, 2026  
**Branch:** `inventsmith/full-product-build`  
**Status:** security hardening implemented; exact-head CI required before this checkpoint is called verified

## Authorization coverage strengthened

Backend regression coverage now explicitly locks the authorization boundaries around consequential operations:

- administrator-only account deletion execution;
- administrator-only targeted structured privacy export;
- self-service privacy request/export binding to the authenticated account rather than a caller-supplied target user ID;
- account-deletion request type/state checks, external-billing resolution gate, administrator-account protection, and company/studio ownership-transfer requirement;
- Owner/Admin organization member-management authority;
- owner-only organization ownership transfer to an already-active member.

## Billing/privacy boundary corrected

Organization policy already defines billing management as owner-only. The organization structured export previously allowed Owner/Admin access while returning raw organization subscription-event attribution to both roles. Those events can contain customer email and billing/subscription identifiers.

The export now preserves Owner/Admin access to organization/project data but includes raw billing-attribution events only when the requesting membership satisfies `canManageBilling`, which currently means Owner. Admin exports explicitly report that raw billing-attribution data is excluded.

This keeps organization administration separate from billing authority without reducing an admin's ability to export invention/project, membership, invitation, usage, and other authorized organization data.

## Boundaries not changed

- No production billing provider or webhook configuration was changed.
- No deployment state changed.
- No secrets were added or exposed.
- PR #24 remains draft/unmerged; `main` is not modified.
