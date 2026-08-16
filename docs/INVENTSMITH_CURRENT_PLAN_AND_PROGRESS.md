# InventSmith Current Plan and Progress

**Status:** Current implementation checkpoint and continuation plan  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Updated:** August 16, 2026  
**Active branch:** `inventsmith/full-product-build`  
**Draft pull request:** #24  
**Authoritative product destination:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`

## Purpose

This document is the current continuation checkpoint for InventSmith. It exists so a new chat, coding worker, or future implementation session can resume without reverting to the retired Atlas controlled-pilot scope or losing the organization/pricing decisions made on August 16, 2026.

When older planning documents conflict with this file or `INVENTSMITH_MASTER_PRODUCT_SPEC.md`, the current InventSmith documents control. Legacy `ATLAS_*` filenames may remain for historical/internal compatibility; they are not permission to restore Atlas as the customer-facing product.

## Product destination

InventSmith is an end-to-end operating system that takes an inventor from idea to market:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding → Launch → Growth**

The inventor should not need to know the process. InventSmith owns sequencing, dependencies, evidence state, reversible autonomous work, and the smallest necessary human/professional/physical gates.

## Organization-native architecture — locked direction

InventSmith is organization-native from inception.

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

A single inventor is a one-member personal organization. This is not a separate architecture.

Required organization behavior:

- multiple active and archived inventions per organization;
- organization-scoped billing and entitlements;
- active-invention capacity rather than lifetime invention count;
- archive frees a slot without deleting the invention or its evidence/artifacts/history;
- roles: Owner, Admin, Member, Viewer, Professional/Guest Reviewer;
- server-side authorization; UI hiding is never sufficient;
- invention-level access so an outside professional can see one assigned invention without seeing the full organization;
- organization-owned inventions survive individual member departure;
- destructive organization actions, ownership transfer and billing changes require appropriate owner authorization;
- resource usage must be attributable to organization and invention so Modern Methods can measure cost-to-serve;
- architecture must be able to evolve to Organization → Clients → Inventions → Team/Guest access for Studio users.

## Organization implementation completed on branch

The branch now contains an additive organization foundation rather than replacing the existing invention model destructively. Current implementation includes:

- organization schema/runtime foundation and personal-organization compatibility;
- organization policy logic and regression coverage;
- organization-native invention creation;
- active-invention capacity enforcement;
- creator/manager access assignment;
- organization invention listing;
- archive and restore behavior with restore-time capacity revalidation;
- read/edit/manage invention authorization helpers;
- main invention workspace moved away from direct owner-only checks;
- consequential decisions/approvals restricted to Manage access;
- Ask InventSmith supports authorized collaborators, with Edit required to submit questions/incur AI work;
- Evidence Locker supports organization readers, editors for upload/register, and managers for deletion;
- department artifacts and deliverable downloads are available to authorized readers;
- canonical ownership attribution remains stable during migration/compatibility work;
- Studio plan keys are recognized by usage policy instead of falling into the free tier;
- organization-runtime regression protection is present.

The organization migration is **not complete** until billing, usage accounting, remaining backend owner-only paths, member/team UI, invitation flows, invention sharing, export/deletion semantics, and live multi-user acceptance are finished.

## Pricing direction — locked for product planning, allowances not yet final

Commercial ladder:

- **Explorer — $0**
- **Inventor — $39/month**
- **Pro — $99/month**
- **Enterprise — $199/month**
- **Studio 3 — $299/month — 3 active inventions**
- **Studio 6 — $399/month — 6 active inventions**
- **Studio Custom — larger/custom capacity based on measured economics**

Potential larger Studio packaging may include higher active-invention counts, additional seats, client workspaces and professional workflow features, but exact larger tiers are not locked until cost-to-serve is measured.

### Pricing principles

- Explorer is an evaluation/acquisition tier with tightly bounded expensive work.
- Inventor is for serious validation, market/prior-art research, feasibility and early product direction.
- Pro is the core individual **complete idea-to-market** plan, including Product Design + CAD and downstream lifecycle work.
- Enterprise primarily adds multi-invention/team capacity and greater throughput.
- Studio is for professional inventors, consultants, product-development studios, incubators and organizations managing multiple projects/clients.
- Studio must not mean unlimited expensive compute.
- Customers should not have to understand raw model tokens.
- Internally, expensive work must be metered by real/estimated cost class and attributed to organization + invention.

### Economics still to determine before billing lock

Do not finalize allowances solely from the old daily-unit model. Model the actual cost of a representative invention through the full journey, including AI reasoning, deep/current research, evidence extraction, image generation, CAD/design work, artifact generation, downstream regeneration, Ask InventSmith usage, Convex/storage and other paid services.

Required scenarios:

1. normal full-journey invention;
2. heavy-use invention;
3. worst reasonable non-abusive use;
4. multi-invention Studio organization with overlapping work;
5. multi-user organization where seats must not multiply the organization's expensive-work allowance.

Target a sustainable variable-cost envelope rather than promising unlimited usage before production evidence exists.

## Full-product repository implementation already present

The full-product branch already contains substantial implementation across the complete journey, including:

- persistent invention record and evidence provenance;
- Evidence Locker with structured and binary evidence ingestion/retry;
- evidence-driven downstream invalidation/refresh;
- Validation and Market Research workspaces;
- Patent Readiness workspace and patent-to-design handoff;
- evidence-backed Product Design candidate generation/scoring/selection;
- native preliminary CAD with STEP/STL/DXF and editable source;
- boxes, cylinders, tubes, frustums, custom-profile extrusion, mating helical thread geometry and annular revolved-profile/sealing geometry;
- orthographic/dimensioned and exploded views;
- selected-product multi-view renders;
- engineering/professional review gates;
- prototype planning and real physical-evidence gate;
- manufacturing/RFQ work and real manufacturer-quote gate;
- branding plus visual brand concept-board generation;
- IP/legal draft/handoff work;
- professional-service planning/provider research;
- pricing, marketing, sales, funding, pitch, launch and growth work;
- editable PPTX pitch deck generation;
- financial CSV and Excel-readable multi-sheet workbook output;
- artifact/document download library;
- Ask InventSmith grounded in the complete project state;
- full-product repository acceptance/regression protection;
- corrected InventSmith customer-facing branding and public journey/pricing surfaces;
- two-surface live verifier for backend + frontend, while keeping browser session persistence a real live acceptance gate.

## Current implementation priority

Continue autonomously in this order unless a discovered dependency requires reordering:

1. Finish organization-scoped usage accounting so multiple members share the organization's allowance rather than multiplying it per user.
2. Move subscription/billing entitlement authority to organization scope while preserving legacy user billing during migration.
3. Audit and replace remaining direct `invention.userId === userId`/owner-only backend checks with the correct Read/Edit/Manage authorization level.
4. Implement organization/team management and invitations.
5. Implement invention-level sharing and Professional/Guest Reviewer assignment.
6. Make privacy export, member removal, account deletion and organization deletion/ownership transfer semantics organization-safe.
7. Build cost-to-serve accounting by operation class and invention/organization.
8. Model normal/heavy/worst-reasonable full-journey costs and set final plan allowances/seats/storage/premium-generation limits.
9. Reconcile public/account pricing and checkout products only after the economics and entitlement model are locked.
10. Run repository acceptance, then live authenticated multi-user/multi-invention acceptance after replication/deployment.

## Hard safety/quality rules

- Do not weaken authentication, authorization, entitlement checks, cost controls, safety restrictions, evidence trust, professional-review gates or human approval gates.
- Do not delete/recreate production data or infrastructure as part of organization migration.
- Schema/data migration must be additive/backward compatible.
- A member leaving must never delete organization-owned invention records.
- A Viewer cannot mutate invention state.
- A Professional/Guest Reviewer receives only explicitly assigned invention/review access.
- Adding users must not multiply an organization's paid compute allowance.
- CAD remains preliminary until required engineering/prototype evidence supports production-release claims.
- Patent work remains research/readiness, not a legal patentability/FTO/validity opinion.
- Real prototype, quote, launch and professional-review gates must never be faked by AI output.

## Acceptance still required

Repository implementation is not equivalent to production acceptance. Remaining final acceptance includes:

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

## Continuation instruction

Do not return to the old controlled-pilot roadmap. Continue building the GitHub implementation toward the complete master specification and this organization-native architecture. Work autonomously until a genuine physical, legal/professional, billing-provider, credential/secret, deployment-account, or other founder-only action is required.