# InventSmith Current Plan and Progress

**Status:** Authoritative continuation checkpoint  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Updated:** August 16, 2026  
**Active branch:** `inventsmith/full-product-build`  
**Draft pull request:** #24 — keep unmerged until the GitHub implementation is complete  
**Authoritative product destination:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`

## Purpose

This is the handoff document for a new chat, coding session, or future worker. Resume from this file plus `INVENTSMITH_MASTER_PRODUCT_SPEC.md` and `ATLAS_BUILD_PROGRESS.md`. Do not revert to the retired Atlas controlled-pilot scope. Legacy `ATLAS_*` filenames remain only for historical/internal compatibility; customer-facing identity is InventSmith.

## Founder operating instruction

Continue autonomously in chat mode until a genuine founder-only action is required. Do not stop for routine implementation choices, code edits, tests, documentation, or repository work. Ask the founder only for a physical action, credential/secret, billing-provider action, external professional/legal authorization, deployment-account action, or other action that cannot safely be performed from the repository/tooling available.

Do not merge PR #24 until the implementation is complete and the founder approves the merge/handoff.

## Product destination

InventSmith is an end-to-end operating system that takes an inventor from idea to market:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding → Launch → Growth**

InventSmith owns sequencing, dependencies, evidence state, reversible autonomous work, and the smallest necessary human/professional/physical gates. The inventor should not have to know the invention-development process.

## Organization-native architecture — locked

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

A single inventor is a one-member personal organization, not a separate architecture.

Required behavior:

- multiple active and archived inventions per organization;
- organization-scoped billing, entitlements and expensive-work allowance;
- active-invention capacity rather than lifetime invention count;
- archiving frees an active slot without deleting evidence, CAD, research, documents, decisions or history;
- roles: Owner, Admin, Member, Viewer, Professional/Guest Reviewer;
- server-side authorization; UI hiding is never authorization;
- invention-level access so an outside professional can see one assigned invention without seeing the whole organization;
- organization-owned inventions survive member departure;
- owner authorization for organization deletion, ownership transfer, billing changes and other destructive organization actions;
- resource usage attributable to organization + invention + operation class;
- architecture able to evolve to **Organization → Clients → Inventions → Team/Guest access** for Studio/professional users.

## Organization implementation completed on branch

Implemented:

- additive organization schema/runtime foundation;
- personal-organization compatibility/migration direction;
- organization policy logic and regression coverage;
- organization-native invention creation;
- active-invention capacity enforcement;
- creator/manager access assignment;
- organization invention listing;
- archive/restore with restore-time capacity revalidation;
- Read/Edit/Manage invention authorization helpers;
- main invention workspace moved from direct owner-only checks to organization authorization;
- consequential decisions and approvals require Manage access;
- Ask InventSmith supports authorized collaborators, with Edit required to submit questions/incur AI work;
- Evidence Locker supports organization readers, editors for upload/register and managers for deletion;
- department artifacts and deliverable downloads available to authorized readers;
- creator/ownership attribution retained for backward compatibility;
- Studio plan keys recognized by usage policy rather than falling into free-tier behavior;
- organization authorization/capacity regression protection.

The latest completed authorization checkpoint was fully green in CI before the next cost-accounting work began.

## Current work in progress

The immediate workstream is **organization-scoped usage/cost control**.

Important rule: adding organization members must never multiply the organization's AI/CAD/render/research allowance.

Ask InventSmith already resolves the organization plan for an organization-owned invention, but its daily usage row is still stored under the individual user in the legacy `atlasDailyUsage` structure. This is the next migration point: expensive-work accounting must become organization-scoped while remaining backward compatible with legacy single-user records.

Do not fake this by simply sharing UI counters. Enforcement must happen server-side at the operation boundary.

## Pricing direction — locked for planning; allowances not final

Commercial ladder:

- **Explorer — $0**
- **Inventor — $39/month**
- **Pro — $99/month**
- **Enterprise — $199/month**
- **Studio 3 — $299/month — 3 active inventions**
- **Studio 6 — $399/month — 6 active inventions**
- **Studio Custom — larger/custom capacity based on measured economics**

Potential larger Studio packaging can add active inventions, seats, client workspaces and professional workflow features, but exact larger tiers are not locked until cost-to-serve is measured.

### Pricing principles

- Explorer: evaluation/acquisition with tightly bounded expensive work.
- Inventor: serious validation, market/prior-art research, feasibility and early product direction.
- Pro: core individual **complete idea-to-market** plan including Product Design + CAD and downstream lifecycle work.
- Enterprise: multi-invention/team capacity and greater throughput.
- Studio: professional inventors, consultants, product-development studios, incubators and organizations managing multiple projects/clients.
- Studio must not mean unlimited expensive compute.
- Customers should not need to understand model tokens.
- Internally meter real/estimated cost by organization, invention and operation class.

### Economics required before billing lock

Model actual cost for:

1. normal full-journey invention;
2. heavy-use invention;
3. worst reasonable non-abusive use;
4. multi-invention Studio organization with overlapping work;
5. multi-user organization where seats do not multiply expensive-work allowance.

Include AI reasoning, current/deep research, evidence extraction, image generation, CAD/design generation, artifact generation, downstream regeneration, Ask InventSmith, Convex/storage and other paid services.

## Full-product implementation already present

The branch already contains substantial implementation across the complete journey:

- persistent invention record and evidence provenance;
- Evidence Locker with structured/binary ingestion and retry;
- downstream evidence impact/staleness propagation;
- Validation and Market Research workspaces;
- Patent Readiness and patent-to-design handoff;
- evidence-backed Product Design candidate generation/scoring/selection;
- native preliminary CAD with STEP/STL/DXF and editable source;
- boxes, cylinders, hollow tubes, frustums, custom-profile extrusion, mating helical threads and annular revolved-profile/sealing geometry;
- orthographic/dimensioned and exploded views;
- selected-product multi-view renders;
- engineering/professional review gates;
- prototype planning plus real physical-evidence gate;
- manufacturing/RFQ plus real quote gate;
- branding and generated visual brand concept board;
- IP/legal draft/handoff and professional routing;
- pricing, marketing, sales, funding, pitch, launch and growth departments;
- editable native PPTX pitch deck;
- financial CSV plus Excel-readable multi-sheet workbook;
- artifact/document library and downloads;
- Ask InventSmith grounded across project evidence/work/decisions/dependencies/reviews;
- full-product repository acceptance contract;
- corrected InventSmith branding, favicon, public journey, FAQ and pricing surfaces;
- obsolete public storefront routes retired while legacy fulfilled-download compatibility remains;
- checkout success no longer treats a URL plan parameter as confirmed entitlement;
- two-surface live verifier for backend + frontend; browser session persistence remains a genuine live gate;
- CI syntax validation for deployment/verification scripts.

## Current implementation order

Continue autonomously in this order unless a real dependency requires reordering:

1. **Finish organization-scoped usage accounting** across Ask InventSmith and autonomous/expensive work.
2. Add cost attribution by organization + invention + operation class (`light`, `standard`, `expensive`, `premium`) and estimated provider cost where available.
3. Move subscription/billing entitlement authority to organization scope while preserving legacy user billing during migration.
4. Audit/replace remaining direct `invention.userId === userId` and owner-only backend checks with correct Read/Edit/Manage authorization.
5. Implement organization/team management and invitations.
6. Implement invention-level sharing and Professional/Guest Reviewer assignment.
7. Make privacy export, member removal, account deletion, organization deletion and ownership transfer organization-safe.
8. Build representative cost-to-serve model and normal/heavy/worst-reasonable invention economics.
9. Lock plan allowances, included seats, storage and premium-generation limits.
10. Reconcile public/account pricing and checkout/billing products only after economics and entitlement policy are locked.
11. Run complete repository acceptance.
12. After GitHub is complete, hand the pinned GitHub implementation to MadeThis for replication and run live authenticated multi-user/multi-invention acceptance.

## Hard safety/quality rules

- Do not weaken authentication, authorization, entitlement checks, cost controls, safety restrictions, evidence trust, professional-review gates or human approval gates.
- Do not delete/recreate production data or infrastructure as part of organization migration.
- Schema/data migration must be additive/backward compatible.
- A member leaving must never delete organization-owned inventions.
- Viewer cannot mutate invention state.
- Professional/Guest Reviewer receives only explicitly assigned invention/review access.
- Adding users must not multiply an organization's paid compute allowance.
- CAD remains preliminary until engineering/prototype evidence supports production-release claims.
- Patent work is research/readiness, not a patentability/FTO/validity legal opinion.
- Real prototype, manufacturer quote, launch and professional-review gates must never be faked by AI output.
- Customer-facing product name is InventSmith; legacy Atlas identifiers may remain only where compatibility requires them.

## Final acceptance still required

Repository implementation is not production acceptance. Final acceptance still includes:

- live authentication/session persistence;
- personal-organization migration against real existing users/inventions;
- multi-user role enforcement;
- invention-level isolation between collaborators/guests;
- active/archive slot enforcement under real subscriptions;
- organization billing/webhook behavior;
- organization-scoped AI/CAD/render/research usage accounting;
- privacy/export/deletion/member-removal behavior;
- representative uploaded evidence across supported file types;
- full idea-to-market representative invention;
- generated render/CAD/document quality review;
- real physical prototype/quote/launch evidence where required;
- professional legal/engineering/design review where required;
- MadeThis/live replication acceptance after the GitHub implementation is complete.

## New-chat start instruction

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`

Then inspect draft PR #24 and branch `inventsmith/full-product-build`. Continue from **organization-scoped usage/cost accounting**. Do not restart planning, do not return to the old pilot, do not merge the PR, and do not hand work to MadeThis yet. Finish the GitHub implementation first.