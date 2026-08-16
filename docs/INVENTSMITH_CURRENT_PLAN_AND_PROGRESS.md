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

Continue autonomously in chat mode until a genuine founder-only action is required. Do not stop for routine implementation choices, code edits, tests, documentation, or repository work. Ask the founder only for a physical action, credential/secret, billing-provider action, external professional/legal authorization, deployment-account action, or another action that cannot safely be performed from the repository/tooling available.

Do not merge PR #24 until implementation is complete and the founder approves the merge/handoff.

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
- personal-organization compatibility and legacy invention migration;
- organization policy logic and regression coverage;
- organization-native invention creation;
- active-invention capacity enforcement and archive/restore revalidation;
- Read/Edit/Manage invention authorization helpers;
- main invention workspace, Ask InventSmith, Evidence Locker, Product Design, Native CAD, Journey Center, lifecycle departments and artifact downloads moved to organization-aware authorization;
- consequential decisions and approvals require Manage access;
- evidence-extraction retry uses organization Edit access rather than legacy creator ownership;
- invention-level access grants and Professional/Guest Reviewer isolation foundations;
- organization-owned inventions survive member departure;
- ownership transfer and organization-safe account-deletion behavior;
- personal versus company/studio privacy/export boundaries;
- Studio plan keys recognized by organization policy and usage policy.

## Organization-scoped expensive-resource accounting — completed

The user-scoped accounting migration is now implemented for organization-owned inventions.

- additive `organizationDailyUsage` ledger keyed by organization + UTC day;
- legacy `atlasDailyUsage` remains for inventions without `organizationId`;
- same-day legacy usage is captured as a migration baseline when an organization ledger is first created;
- Ask InventSmith allowance checks and question accounting use the organization ledger;
- autonomous work reservations and settlement use the organization ledger;
- reservations are checked and written inside Convex mutations so collaborators cannot race independent counters;
- Native CAD's specialized success/failure/stale-output settlement path now settles against the same organization ledger as its reservation;
- collaborator seats do not multiply AI/CAD/render/research allowance;
- stale-output protections and reservation release behavior remain intact;
- visual-generation work (concept boards, product renders and brand boards) returns through central work settlement and therefore uses the same organization reservation boundary.

## Cost attribution — completed foundation

InventSmith now records/reports measured cost units by:

- organization;
- invention;
- operation kind;
- operation class (`light`, `standard`, `expensive`, `premium`);
- provider/model metadata where available.

Ask InventSmith records model token units, live-research usage and provider/model attribution in the execution ledger. Autonomous work continues to carry work-item/event cost units. Organization reporting reconciles shared daily usage with attributed invention/work activity and explicitly exposes provider-attribution gaps instead of inventing dollar costs.

Actual dollar economics and final commercial allowances remain intentionally unlocked until representative cost-to-serve measurement is available.

## Organization billing / entitlement authority — completed repository foundation

Implemented additively:

- organization-targeted subscription events;
- organization `planKey` as entitlement authority for organization-owned inventions;
- legacy user subscriptions preserved for migration compatibility;
- legacy personal subscriptions mirror into personal organizations;
- organization-specific `subscriptionUpdatedAt` prevents generic organization edits from corrupting billing event ordering;
- subscription events carry organization attribution (`appliedOrganizationId`) and exact organization plan attribution where needed;
- Studio 3, Studio 6 and Studio Custom lifecycle entitlement is organization-only;
- organization billing history is included in organization export and excluded from unrelated personal exports;
- existing provider customer/subscription identity continues to authorize lifecycle events after organization ownership transfer;
- first organization activation still requires the current owner boundary rather than accepting an arbitrary customer identity;
- missing customer/subscription identifiers in later provider events do not erase an established billing identity.

The repository does **not** invent an internal payment processor. Provider checkout/product activation still requires the actual external billing-provider integration/configuration before live acceptance.

## Pricing direction — locked for planning; allowances not final

Commercial ladder:

- **Explorer — $0**
- **Inventor — $39/month**
- **Pro — $99/month**
- **Enterprise — $199/month**
- **Studio 3 — $299/month — 3 active inventions**
- **Studio 6 — $399/month — 6 active inventions**
- **Studio Custom — larger/custom capacity based on measured economics**

### Pricing principles

- Explorer: evaluation/acquisition with tightly bounded expensive work.
- Inventor: serious validation, market/prior-art research, feasibility and early product direction.
- Pro: core individual **complete idea-to-market** plan including Product Design + CAD and downstream lifecycle work.
- Enterprise: multi-invention/team capacity and greater throughput.
- Studio: professional inventors, consultants, product-development studios, incubators and organizations managing multiple projects/clients.
- Studio must not mean unlimited expensive compute.
- Customers should not need to understand model tokens.
- Internally meter real/estimated cost by organization, invention and operation class.

### Economics required before billing/allowance lock

Model actual cost for:

1. normal full-journey invention;
2. heavy-use invention;
3. worst reasonable non-abusive use;
4. multi-invention Studio organization with overlapping work;
5. multi-user organization where seats do not multiply expensive-work allowance.

Include AI reasoning, current/deep research, evidence extraction, image generation, CAD/design generation, artifact generation, downstream regeneration, Ask InventSmith, Convex/storage and other paid services.

## Full-product implementation already present

The branch contains substantial implementation across the complete journey:

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
- checkout success does not treat a URL plan parameter as confirmed entitlement;
- two-surface live verifier for backend + frontend; browser session persistence remains a genuine live gate;
- CI syntax validation for deployment/verification scripts.

## Latest verified checkpoint

GitHub Actions **Atlas CI run #396** on branch head `08bb04d1b22489da8694dd524be9f971b05a3775` completed fully green:

- Install dependencies — PASS
- Verify operational scripts — PASS
- Typecheck web — PASS
- Typecheck Convex — PASS
- Regression tests — PASS
- Production dependency audit — PASS
- Next production build — PASS

This checkpoint includes the organization usage ledger, Native CAD organization settlement, billing/privacy architecture, and organization-aware evidence-extraction retry regression correction.

## Current implementation order

Continue autonomously in this order unless a real dependency requires reordering:

1. Finish targeted audit of remaining specialized generation/accounting and legacy creator-only authorization paths.
2. Complete minor migration-ordering/hygiene gaps, including carrying billing recency into newly created personal organizations.
3. Update repository progress/acceptance documentation as each production checkpoint closes.
4. Build representative cost-to-serve reporting from measured usage and define normal/heavy/worst-reasonable invention economics.
5. Lock plan allowances, included seats, storage and premium-generation limits from measured economics.
6. Reconcile public/account pricing and external billing-provider checkout products only after economics and entitlement policy are locked.
7. Run complete repository acceptance.
8. After GitHub is complete, hand the pinned GitHub implementation to MadeThis for replication and run live authenticated multi-user/multi-invention acceptance.

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
- organization billing/webhook behavior against the actual provider;
- organization-scoped AI/CAD/render/research usage accounting under concurrent live requests;
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

Then inspect draft PR #24 and branch `inventsmith/full-product-build`. Continue from the **remaining production-readiness audit and cost-to-serve work**. Do not restart planning, do not return to the old pilot, do not merge the PR, and do not hand work to MadeThis yet. Finish the GitHub implementation first.
