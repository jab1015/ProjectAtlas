# InventSmith Consequential Security Checkpoint

**Date:** October 1, 2026
**Branch:** `inventsmith/full-product-build`  
**Status:** security hardening implemented; current external-action surface audited; newest documentation head requires exact-head CI

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

## External-action execution audit

The repository currently has no executor that sends an RFQ, contacts a supplier/manufacturer, discloses invention artifacts, places an order or payment, files a submission, or publishes for the inventor. RFQ and manufacturer work is internal preparation plus ingestion of genuine outside evidence. The Review UI resolves through `consequentialApprovalMutation:resolveConsequentialApproval`; the compatibility workspace mutation delegates to that same guarded handler. Approval, external-use authorization, professional review, and manufacturing release all record non-execution semantics.

Any future executor must call `requireCurrentApprovedExternalAction` immediately before the external side effect, with the expected action type, and must record separate execution evidence. Permission records must never be reused as proof that outside-world action occurred.
