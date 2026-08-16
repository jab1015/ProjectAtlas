# InventSmith Build Progress

**Last updated:** August 16, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build` / draft PR #24 — intentionally unmerged

## Product vision

InventSmith — The Inventor OS by Modern Methods — is an organization-native operating system that takes an inventor from a raw idea through the complete evidence-backed journey to market while hiding unnecessary process complexity from the inventor.

> The inventor should never have to think about InventSmith. InventSmith should think about the inventor.

The complete destination remains:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding / Pitch → Launch → Growth**

The retired controlled-pilot scope and old Atlas completion percentages are historical only and must not be used as overall InventSmith completion.

## Locked organization architecture

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

A single inventor is a one-member personal organization. Organizations support multiple active/archived inventions, server-enforced roles, invention-level sharing, organization-scoped billing/entitlements and a shared expensive-work allowance. Archiving frees an active-invention slot without deleting evidence, CAD, research, documents, decisions or history.

Roles: Owner, Admin, Member, Viewer, Professional/Guest Reviewer. Organization-owned inventions survive member departure. Destructive organization actions and billing authority remain appropriately restricted.

## Pricing direction

| Plan | Monthly price | Capacity direction |
|---|---:|---|
| Explorer | $0 | Evaluation / tightly bounded expensive work |
| Inventor | $39 | Serious validation, feasibility and IP-readiness |
| Pro | $99 | Core complete idea-to-market individual plan including Product Design + CAD |
| Enterprise | $199 | Multi-invention/team capacity and greater throughput |
| Studio 3 | $299 | 3 active inventions + professional organization workflow |
| Studio 6 | $399 | 6 active inventions + professional organization workflow |
| Studio Custom | Custom | Larger capacity based on measured economics |

Exact included seats, storage, AI/CAD/render/research allowances and larger Studio capacity remain unlocked until measured economics justify them.

## Organization implementation — completed repository foundation

Implemented on the full-product branch:

- additive organization schema/runtime foundation and personal-organization migration compatibility;
- organization-native invention creation/listing plus active/archive capacity enforcement;
- Read/Edit/Manage authorization across main workspace, Ask InventSmith, Evidence Locker, Product Design, Native CAD, Journey Center, lifecycle departments, downloads and evidence-extraction retry;
- Manage-only consequential decisions/approvals;
- invention-level access grants and bounded Professional/Guest Reviewer foundations;
- ownership transfer and organization-safe member/account deletion semantics;
- organization navigation/team UI foundations;
- organization-owned inventions preserved when members leave;
- personal versus company/studio privacy/export boundaries.

## Shared expensive-resource accounting — completed

Organization-owned inventions use a shared `organizationDailyUsage` ledger keyed by organization + UTC day. Legacy inventions without an organization remain on the user ledger for backward compatibility.

Implemented behavior includes Ask InventSmith allowance checks/accounting, autonomous-work reservation/settlement, migration-safe same-day baseline capture, race-safe reservation inside Convex mutations, stale-output settlement/release, Native CAD specialized settlement on the organization ledger, and central settlement for concept boards/product renders/brand boards. Adding seats does not multiply an organization's paid compute allowance.

## Cost attribution and economics — current state

Measured cost units are attributable/reportable by organization, invention, operation kind and operation class (`light`, `standard`, `expensive`, `premium`), with provider/model metadata where available. Ask InventSmith records model-token units, live-research usage and provider/model attribution; autonomous work carries work/event cost units.

Observed cost-to-serve scenario reporting now covers average/median behavior, P90 heavy use, maximum observed use, and Studio overlap scenarios for the top 3 and top 6 concurrent invention workloads. Confidence is tied to observed sample size. Cost units are intentionally not converted into fabricated dollars before provider/runtime calibration.

Detailed internal provider/cost economics are Owner/Admin-only; ordinary collaborators can see authorized product usage without receiving Modern Methods' internal economics model.

## Organization billing / entitlement foundation — completed in repository

Implemented additively:

- organization-targeted subscription events and organization `planKey` entitlement authority;
- legacy personal subscriptions preserved/mirrored for migration compatibility;
- billing recency (`subscriptionUpdatedAt`) preserved, including personal-organization inheritance;
- organization billing history separated from unrelated personal exports;
- Studio 3/6/Custom lifecycle entitlement kept organization-only;
- lifecycle webhook continuity after ownership transfer using already-bound billing customer/subscription identity;
- first activation remains constrained to the current owner boundary;
- later provider events may authenticate against an established customer ID or subscription ID without erasing missing identifiers.

Live checkout/product activation still depends on the actual external billing provider. InventSmith does not invent an internal payment processor.

## Team invitations and sharing — implemented safe foundation

Organization membership UI now uses a consent-based invitation flow rather than silently assigning membership.

- pending invitations reserve purchased seats;
- Owner/Admin can invite and revoke within policy;
- acceptance creates membership only after recipient consent;
- invitation records carry explicit role/status/expiry/audit attribution;
- invitation history is included in authorized organization exports;
- invitation PII is included in the recipient's personal export where appropriate;
- account deletion revokes/removes relevant pending invitation PII and personal-organization deletion removes its invitations;
- seat counting includes pending invitations so direct/legacy paths cannot overbook capacity.

**Security boundary:** current password authentication does not provide verified-email ownership. Therefore pre-signup email invitations are not allowed to auto-grant membership merely because a later account claims the invited email. Current safe acceptance is bound to a pre-existing uniquely matched InventSmith account. True pre-signup invitations remain gated on verified-email delivery/authentication.

## Complete idea-to-market capability already present

Material repository implementation exists across the complete destination, including persistent invention/evidence records; structured/binary Evidence Locker ingestion; downstream evidence impact/staleness; Validation; Market Research; Patent Readiness and patent-to-design handoff; evidence-backed Product Design; native preliminary CAD with STEP/STL/DXF/editable source and multiple supported geometry classes; dimensioned/exploded views and renders; engineering/professional review gates; prototype planning and physical-evidence gate; manufacturing/RFQ and real-quote gate; branding; IP/legal drafts and professional routing; pricing/marketing/sales/funding/pitch/launch/growth departments; editable native PPTX; financial CSV and Excel-readable workbook; document/artifact library; and Ask InventSmith grounded across project state.

Customer-facing branding is InventSmith / The Inventor OS / Modern Methods. Legacy Atlas identifiers remain only where compatibility requires them.

## Truth and safety boundaries

Generated CAD remains preliminary until engineering/prototype evidence validates production-release dimensions, tolerances, materials, fits, sealing, loads, safety and manufacturing details. Patent intelligence is research/readiness, not a patentability, FTO, validity or legal-clearance opinion. InventSmith never fabricates a physical prototype, manufacturer quote, launch result, professional review, legal authorization or other real-world evidence.

## Verified CI checkpoint

The last fully verified production checkpoint before the newest invitation/privacy commits is GitHub Actions **Atlas CI #396**, head `08bb04d1b22489da8694dd524be9f971b05a3775`, with dependency install, operational-script verification, web typecheck, Convex typecheck, regressions, production dependency audit and Next production build all passing.

The newer invitation/privacy/economics/documentation head must receive a fresh complete CI pass before it becomes the next verified checkpoint.

## Remaining repository work

1. Run and repair the complete CI stack on the current invitation/privacy/economics/documentation head.
2. Finish the targeted audit for any remaining specialized accounting or legacy creator-only authorization paths.
3. Complete invitation/sharing edge-case acceptance and verified-email readiness boundary.
4. Continue collecting representative cost-to-serve observations; calibrate provider/runtime dollars and confidence before final commercial allowances are locked.
5. Lock plan seats/storage/premium-generation/compute allowances from measured economics.
6. Reconcile public/account pricing and external billing-provider products only after economics and entitlement policy are locked.
7. Run complete repository acceptance.
8. Keep PR #24 unmerged until implementation is complete and founder approval is given.
9. Only after GitHub completion, pin the implementation for MadeThis replication and run live authenticated multi-user/multi-invention acceptance.

## Final acceptance boundary

Repository-green is not production acceptance. Final acceptance still requires real authentication/session persistence, migration against real users/inventions, multi-user role/isolation tests, active/archive slot enforcement under real subscriptions, real billing/webhook behavior, concurrent organization-scoped resource accounting, privacy/export/deletion/member-removal behavior, representative uploaded evidence, a full idea-to-market invention, CAD/render/document quality review, real physical/quote/launch evidence where required, professional review where required, and final MadeThis/live replication acceptance.

## New-chat handoff

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then inspect branch `inventsmith/full-product-build` and draft PR #24. Resume with CI verification of the newest invitation/privacy/economics head and continue the remaining production-readiness audit. Do not restart planning, do not merge PR #24, and do not hand the project to MadeThis yet.