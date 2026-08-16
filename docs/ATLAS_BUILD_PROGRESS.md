# InventSmith Build Progress

**Last updated:** August 16, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build` / draft PR #24 — intentionally unmerged

## Current product destination

InventSmith is measured against the complete journey:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding / Pitch → Launch → Growth**

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## August 16 architecture expansion

InventSmith is now being built as an **organization-native, multi-user, multi-invention system from inception**.

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

A single inventor is a one-member organization. Billing/entitlements ultimately belong to the organization. Inventions can be active or archived; active-invention slots are subscription capacity, while archiving preserves all invention evidence, research, CAD, documents and history.

Required roles are Owner, Admin, Member, Viewer and Professional/Guest Reviewer, with invention-level access isolation and server-side authorization.

## Current pricing direction

| Plan | Monthly price | Capacity direction |
|---|---:|---|
| Explorer | $0 | Evaluation / tightly bounded usage |
| Inventor | $39 | 1 individual invention; validation/feasibility/IP-readiness focus |
| Pro | $99 | 1 complete idea-to-market individual invention |
| Enterprise | $199 | Multi-invention/team capacity |
| Studio 3 | $299 | 3 active inventions + professional organization workflow |
| Studio 6 | $399 | 6 active inventions + professional organization workflow |
| Studio Custom | Custom | Larger capacity based on measured cost-to-serve |

Exact included seats, storage, AI/CAD/render/research allowances and larger Studio capacities remain intentionally **unlocked** until the real cost-to-serve model is completed.

## Organization implementation status

Implemented on the full-product branch:

- additive organization runtime/schema foundation;
- personal-organization compatibility/migration direction;
- organization policy and plan-capacity logic;
- organization-native invention creation;
- active-invention capacity enforcement;
- organization invention listing;
- archive/restore with restore-time capacity revalidation;
- Read/Edit/Manage invention authorization helpers;
- main invention workspace organization authorization;
- Manage-only consequential decisions and approvals;
- Ask InventSmith collaborator access with Edit required to submit questions/incur AI work;
- Evidence Locker organization read/edit/manage boundaries;
- organization-readable department artifacts and deliverable downloads;
- creator/ownership attribution preserved for compatibility;
- Studio plan keys recognized by usage policy;
- dedicated `organizationDailyUsage` ledger keyed by organization + UTC day;
- Ask InventSmith daily allowance enforcement against the organization plan and shared organization ledger;
- autonomous-work reservation and settlement against the organization ledger, including stale-output cost settlement;
- migration-safe bootstrap from existing same-day member usage so deployment does not reset allowances;
- legacy inventions without `organizationId` preserved on the original user-scoped usage path;
- organization usage API reporting from the shared ledger;
- regression coverage protecting organization runtime, access boundaries and shared usage accounting.

The organization-scoped usage checkpoint has passed both web and Convex TypeScript verification. Its dedicated regression tests passed; the first full CI run exposed only a stale progress-document wording assertion, which this checkpoint corrects.

### In progress now

**Organization + invention + operation-class cost attribution.**

Shared allowance enforcement is now organization-native. The next cost-control pass is to make cost attribution sufficiently complete and queryable to measure real cost-to-serve by organization, invention and operation class without inventing a dollar conversion before provider/runtime calibration exists.

### Still required

- organization/invention operation-cost attribution across expensive operations;
- organization-scoped subscription/billing authority and webhook reconciliation;
- remaining backend owner-only authorization audit/conversion;
- organization/team/member management UI;
- invitations and invention-level sharing;
- Professional/Guest Reviewer assignment workflow;
- organization-aware privacy/export/member removal/account deletion/organization deletion/ownership transfer semantics;
- cost-to-serve ledger and final plan allowance modeling;
- live multi-user/multi-invention acceptance.

## Full-product capability checkpoint

The repository already contains material implementation across the complete idea-to-market destination, including:

- persistent invention record and evidence provenance;
- Evidence Locker with CSV/text and supported binary extraction/retry;
- downstream evidence-impact/staleness propagation;
- Validation, Market Research and Patent Readiness workspaces;
- Patent → Product Design handoff;
- evidence-backed Product Design candidate generation/scoring/selection;
- native preliminary CAD with STEP/STL/DXF and editable source;
- boxes, cylinders, hollow tubes, frustums, custom-profile extrusion, external/internal helical threads and annular revolved-profile/sealing geometry;
- orthographic/dimensioned and exploded views;
- selected-product multi-view renders;
- engineering/professional-review gates;
- prototype strategy plus real physical-test evidence gate;
- manufacturing/RFQ workflow plus real quote evidence gate;
- branding and generated visual brand concept board;
- IP/legal draft/handoff work and professional routing;
- pricing, marketing, sales, funding, pitch, launch and growth departments;
- editable native PowerPoint pitch deck;
- financial CSV + Excel-readable multi-sheet workbook output;
- artifact/document downloads;
- Ask InventSmith grounded across project work/evidence/decisions/dependencies/reviews;
- full-product repository acceptance contract;
- corrected InventSmith public branding, favicon, journey, FAQ and pricing surfaces;
- legacy irrelevant storefront surfaces retired without breaking fulfilled legacy downloads;
- checkout entitlement truth boundary corrected;
- two-surface live verifier for backend/frontend with browser session persistence retained as a genuine live gate;
- deployment/verification scripts syntax-checked by CI.

## CAD/manufacturing truth boundary

InventSmith must design products and produce useful engineering artifacts, but generated CAD is preliminary until evidence supports production-release claims. Critical tolerances, fits, sealing compression, loads, safety, materials, manufacturing details and other consequential engineering values remain provisional until engineering/prototype evidence validates them.

## Patent/design truth boundary

Patent intelligence feeds Product Design so design candidates deliberately explore meaningful structural/functional differentiation from relevant prior art. InventSmith must not claim patentability, freedom-to-operate, validity or legal clearance without qualified professional review.

## Cost-control direction

The old per-user daily-unit concept is insufficient for an organization-native product. Adding organization members must not multiply the same organization's expensive-work allowance. Organization-owned inventions now enforce chat and autonomous-work usage through one organization/day ledger; legacy inventions remain user-scoped.

Meter/attribute work to organization + invention and classify expensive operations such as deep/current research, AI reasoning, evidence extraction, image generation, CAD/design generation, artifact generation and major downstream regeneration. Final plan allowances will be based on measured normal/heavy/worst-reasonable cost-to-serve.

## Current implementation order

1. Complete organization + invention + operation-class cost attribution.
2. Move subscription/billing authority to organization scope with backward-compatible migration.
3. Complete remaining owner-only backend authorization audit.
4. Build team/member/invitation management.
5. Build invention-level sharing and professional/guest review access.
6. Make privacy/export/deletion/member-removal/ownership-transfer behavior organization-safe.
7. Build representative cost-to-serve economics.
8. Lock plan allowances/seats/storage/premium generation.
9. Reconcile public/account/checkout billing products to final policy.
10. Run full repository acceptance.
11. Only after GitHub completion, replicate to MadeThis and run live authenticated multi-user/multi-invention acceptance.

## New-chat handoff

A new chat should read these three files in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`

Then inspect branch `inventsmith/full-product-build` and draft PR #24. Resume with organization + invention + operation-class cost attribution. Do not restart the product plan, do not merge PR #24, and do not hand the project to MadeThis yet.

## Final acceptance boundary

InventSmith is not complete because CI is green or a deployment returns HTTP 200. Final acceptance still requires real authenticated session persistence, organization migration, role/isolation tests, organization billing and usage enforcement, representative evidence ingestion, full idea-to-market execution, CAD/render/document quality review, physical prototype/quote/launch evidence where applicable, professional review where required, and final MadeThis/live replication acceptance.
