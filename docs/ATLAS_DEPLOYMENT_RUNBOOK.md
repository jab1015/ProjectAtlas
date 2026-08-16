# InventSmith Production Deployment and Acceptance Runbook

**Status:** Repository implementation green; live replication/acceptance pending  
**Product:** InventSmith — The Inventor OS by Modern Methods  
**Updated:** August 16, 2026  
**Legacy filename:** retained for compatibility with existing documentation links

## 1. Authority and release boundary

This runbook implements the deployment and live-acceptance boundary defined by:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

The retired Atlas controlled-pilot scope is historical and must not be used as the release definition. Repository-green is necessary but is not production acceptance.

## 2. Repository readiness before MadeThis handoff

Before pinning a GitHub head for MadeThis replication:

1. Confirm the intended head is on `inventsmith/full-product-build` and draft PR #24 remains unmerged unless the founder explicitly approves otherwise.
2. Run/verify the complete CI stack:
   - operational-script verification;
   - web TypeScript;
   - Convex TypeScript;
   - full regression suite;
   - production dependency audit;
   - Next production build.
3. Confirm authoritative InventSmith documentation reflects the implementation head.
4. Confirm no destructive schema migration, secret, generated credential or environment-specific value was committed.
5. Record the exact commit SHA supplied to MadeThis so replication can be compared deterministically.

The latest fully verified checkpoint at the time of this runbook update is Atlas CI #443 on documentation head `6ec6429ac3ff7bf75d4e018a972b1e1338b5a59a`; the latest fully verified code checkpoint beneath it is `dd123cffd0a34c6b15cac4da114469150c4d63b3`.

## 3. Runtime configuration

Use the actual deployment/provider configuration. Do not hand-invent identifiers or copy secrets into source control.

Required runtime configuration includes the selected Convex deployment/site URL, authentication key material, OpenAI/provider credentials, fulfillment/subscription webhook secrets, and any production storage/search/image/CAD/provider credentials actually enabled by the replicated application.

Secrets belong in secure deployment environment configuration, never browser-exposed `NEXT_PUBLIC_*` variables unless the value is intentionally public. Never place secret values in source files, screenshots, issues, chat messages, test fixtures or deployment logs.

Health/readiness checks may expose configuration booleans and sanitized status only; they must not expose secret values, tokens, user data, invention data or detailed exploitable errors.

## 4. Authentication and organization acceptance

Using disposable production-like accounts, verify all of the following against the replicated runtime:

- sign-up/sign-in/session persistence works across refresh/navigation;
- a legacy single-user invention migrates additively into the correct personal organization without losing evidence, documents, work, billing or history;
- organization Owner/Admin/Member/Viewer/Professional-Guest roles are enforced server-side;
- Viewer cannot mutate invention state;
- Professional/Guest cannot see the organization portfolio or billing and sees only explicitly granted invention/review access;
- invention-level grants isolate projects correctly;
- organization-owned inventions survive member departure;
- ownership transfer preserves the organization and billing continuity;
- owner deletion cannot orphan a company/studio organization, including suspended-owner cases;
- active/archive invention capacity follows the organization plan and archiving preserves project history.

## 5. Invitation acceptance

Verify the consent-based invitation flow end to end:

- issuing a pending invitation reserves a seat;
- another invitation cannot overbook purchased seat capacity;
- accepting rechecks projected capacity, including after a plan downgrade;
- membership does not become active before recipient consent;
- revocation releases the reservation;
- expired invitations cannot be accepted;
- an invitation bound to an existing account cannot transfer to a different account if an email address changes or is reused;
- legacy unbound invitations fail closed until safely reissued;
- the retired direct-add membership path cannot bypass consent;
- pre-signup email invitation claiming remains disabled until email ownership is actually verified by the authentication/delivery system.

## 6. Shared organization resource accounting

For an organization-owned invention, verify with at least two collaborators acting concurrently:

- Ask InventSmith allowance is shared across the organization rather than multiplied per user;
- autonomous AI/research/generation allowance is shared across the organization;
- concurrent reservations cannot exceed remaining organization capacity;
- retries/reclaimed leases reuse or correctly settle existing reservations rather than double-charging;
- stale/discarded output releases or settles its reservation correctly;
- Native CAD and visual-generation work settle against the same organization ledger used to reserve them;
- deleting an organization invention releases outstanding reservations from the organization ledger;
- legacy inventions without `organizationId` continue using the legacy user ledger;
- usage/cost attribution identifies organization, invention and operation class without exposing internal provider economics to ordinary collaborators.

## 7. Evidence Locker and Ask InventSmith acceptance

With an authorized Editor/Manager account, upload representative structured and binary evidence such as CSV/XLSX, PDF/DOCX and an image/reference file.

Verify:

- upload URL/registration requires invention Edit access;
- binary evidence enters server-side extraction/retry rather than being trusted from browser-supplied text;
- provenance identifies the uploader/source correctly;
- failed extraction is visible and retryable only by authorized users;
- successful evidence becomes available to downstream work;
- changed evidence marks affected downstream findings/deliverables stale or queues refresh as designed;
- Ask InventSmith grounds answers in the authorized invention record and labels evidence/inference appropriately;
- material inventor statements captured from Ask InventSmith write back to the Evidence Locker under organization Edit authorization;
- Viewer/Guest boundaries remain intact throughout upload, retry and chat write-back.

## 8. Complete idea-to-market representative journey

Run at least one non-safety-critical representative invention through the complete supported journey as evidence permits:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → IP / Legal → Pricing → Marketing → Sales → Funding / Pitch → Launch → Growth**

Verify that InventSmith owns sequencing/dependencies and does not require the inventor to manually manage departments or understand the process.

Review generated deliverables for usefulness and internal consistency, including validation/research outputs, Product Design Specification, CAD package, drawings/renders, engineering handoff, prototype plan, RFQ/manufacturing package, brand work, legal/professional drafts, pricing/GTM/sales/funding materials, editable pitch deck, financial workbook, launch plan and growth reporting.

## 9. Real-world evidence gates

These gates must be tested with genuine evidence. They may not be satisfied by fixtures, forecasts or AI-generated claims merely to mark acceptance complete.

### Prototype

InventSmith may prepare a prototype plan/test plan from modeled information, but prototype assessment/iteration requires genuine physical prototype-test evidence uploaded into the invention record.

### Manufacturing

InventSmith may prepare sourcing research and RFQ packages, but manufacturer comparison/unit-economics conclusions requiring quotes must wait for genuine manufacturer/RFQ quote evidence.

### Launch and growth

InventSmith may prepare launch readiness and modeled forecasts, but launch-performance analysis requires genuine post-launch sales/analytics/market evidence.

### Professional review

InventSmith may identify and prepare work for patent/legal/engineering/regulatory professionals, but it must not represent routing as completed professional review. Where the journey requires qualified review, verify that the real professional outcome/evidence is recorded before the gated conclusion is treated as approved.

## 10. CAD, render and document quality acceptance

Human-review representative outputs rather than relying only on file existence:

- native CAD opens in the intended downstream tool and contains the expected editable geometry;
- STEP/STL/DXF outputs are usable for their stated preliminary purpose;
- dimensions/exploded views correspond to the selected design and do not imply unverified production tolerances;
- product renders and brand boards visually correspond to the invention/design rather than generic placeholders;
- PPTX remains editable;
- spreadsheet/CSV financial artifacts open correctly and preserve intended values/formulas/structure;
- PDF/DOCX deliverables are readable, internally consistent and carry appropriate evidence/legal/engineering limitations.

Generated CAD remains preliminary until engineering/prototype evidence supports production release.

## 11. Billing and entitlement acceptance

After the external billing provider/products are actually configured, verify:

- organization `planKey` is the entitlement authority for organization-owned inventions;
- signed provider events are idempotent and older events cannot overwrite newer state;
- ownership transfer does not break established customer/subscription identity;
- cancellation/past-due/period-end behavior follows the intended entitlement policy;
- Studio plans remain organization-only;
- active-invention and seat limits match the purchased product;
- paid compute allowance remains organization-shared rather than seat-multiplied;
- public/account pricing matches the provider products and backend policy.

Do not finalize compute/storage/premium-generation allowances from guesses. Lock them only after representative cost-to-serve measurement and provider/runtime dollar calibration support a sustainable policy.

## 12. Privacy, deletion and restoration acceptance

Using disposable accounts/organizations, verify:

- personal export contains the requesting user's appropriate personal data and account-bound invitations without leaking unrelated company/studio billing/project data;
- authorized organization export contains the intended organization history/invitations;
- member departure does not delete organization-owned inventions;
- account deletion revokes/releases pending invitation state appropriately;
- company/studio owner deletion fails closed until ownership is safely resolved;
- personal-organization deletion removes its owned invitation/data lifecycle records as designed;
- external paid billing is resolved before destructive account deletion where required;
- deleted identities cannot sign in and deleted application data is not recoverable through normal application queries;
- retained financial/audit records are appropriately anonymized and do not become attributable to a different account through mutable/reused email identity.

## 13. Operational readiness

Before production release, assign operational ownership for:

- health/uptime monitoring and alert response;
- provider/Convex spend alerts;
- backups/data export and restoration testing;
- incident response and key rotation;
- privacy/deletion requests;
- prompt/model/provider change approval;
- rollback/deployment access;
- billing-provider/webhook incidents.

## 14. Release rule

InventSmith must never be described as providing a patentability/FTO/legal/regulatory opinion or production engineering approval. Consequential external actions remain behind appropriate approval gates.

A GitHub head is **ready to hand to MadeThis** when repository CI is fully green, authoritative docs match the implementation, no known repository-only acceptance blocker remains, and the exact commit SHA can be supplied for deterministic replication.

MadeThis replication is **not final product acceptance**. Final production acceptance occurs only after the replicated runtime passes the live authentication, organization, resource-accounting, evidence, billing, privacy, complete-journey, artifact-quality and genuine real-world/professional gates above.