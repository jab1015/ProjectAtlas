# InventSmith Current Plan and Progress

**Status:** Authoritative continuation checkpoint  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Updated:** August 16, 2026  
**Active branch:** `inventsmith/full-product-build`  
**Draft pull request:** #24 — keep unmerged until the GitHub implementation is complete  
**Authoritative product destination:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`

## Purpose and operating instruction

This is the handoff document for a new chat, coding session or future worker. Resume from this file plus `INVENTSMITH_MASTER_PRODUCT_SPEC.md`, `ATLAS_BUILD_PROGRESS.md` and `INVENTSMITH_DOCUMENT_AUTHORITY.md`. Do not revert to the retired Atlas controlled-pilot scope.

Continue autonomously until a genuine founder-only action is required. Routine implementation choices, code edits, tests, documentation and repository work do not require founder interruption. Do not merge PR #24 until implementation is complete and the founder approves the merge/handoff.

## Product vision

InventSmith is an end-to-end operating system that takes an inventor from idea to market:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding → Launch → Growth**

InventSmith owns sequencing, dependencies, evidence state, reversible autonomous work and the smallest necessary human/professional/physical gates. The inventor should not have to know the invention-development process.

> The inventor should never have to think about InventSmith. InventSmith should think about the inventor.

## Organization-native architecture — locked

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

A single inventor is a one-member personal organization. Required behavior includes multiple active/archived inventions; organization-scoped billing, entitlements and expensive-work allowance; active-invention capacity; preserved archived project history; Owner/Admin/Member/Viewer/Professional-Guest roles; server-side authorization; invention-level access isolation; organization-owned invention survival after member departure; owner-gated destructive actions; resource attribution by organization/invention/operation class; and an evolution path to Organization → Clients → Inventions → Team/Guest access.

## Repository implementation completed

Organization/product foundation now includes:

- additive organization schema/runtime and personal-organization migration compatibility;
- organization-native invention creation/listing and active/archive slot enforcement;
- Read/Edit/Manage authorization across primary invention surfaces, Journey Engine, chat-to-evidence capture and specialized evidence retry;
- Manage-only consequential decisions, approvals and destructive invention actions;
- invention-level access grants and Professional/Guest Reviewer isolation foundations;
- ownership transfer and organization-safe account/member deletion semantics;
- organization-aware privacy/export boundaries;
- Studio plan recognition;
- organization navigation/team UI foundations;
- consent-based organization invitations with pending-seat reservation and stable pre-existing-account binding;
- legacy direct membership assignment retired from the normal backend path;
- invitation acceptance rechecks projected seat capacity so plan downgrades/stale reservations cannot overbook the organization.

## Shared expensive-resource accounting — completed

Organization-owned inventions use `organizationDailyUsage` keyed by organization + UTC day. Ask InventSmith and autonomous work reserve/settle against the shared organization allowance. Reservations are race-safe inside Convex mutations. Migration captures same-day legacy usage as a baseline. Native CAD's specialized settlement uses the organization ledger, visual generation returns through central settlement, and organization-invention deletion releases reservations from the correct shared ledger. Adding collaborators does not multiply paid compute allowance. Legacy inventions without `organizationId` remain on the legacy user ledger.

## Cost attribution and cost-to-serve — implemented measurement foundation

InventSmith records/reports measured cost units by organization, invention, operation kind and operation class (`light`, `standard`, `expensive`, `premium`), with provider/model metadata where available. Ask InventSmith records model-token units, live-research usage and provider/model attribution; autonomous work carries work/event cost units.

Observed scenario reporting calculates average/median usage, P90 heavy-use behavior, maximum observed behavior and Studio overlap scenarios using the top 3 and top 6 concurrent invention workloads. Confidence reflects sample size. Cost units remain deliberately separate from dollars until provider/runtime calibration is grounded in real costs.

Detailed internal economics are Owner/Admin-only. Ordinary authorized members may see product usage without receiving Modern Methods' internal provider/cost model.

## Organization billing / entitlement foundation — completed in repository

Implemented additively:

- organization-targeted subscription events;
- organization `planKey` as entitlement authority for organization-owned inventions;
- legacy personal subscription compatibility/mirroring;
- billing recency ordering with `subscriptionUpdatedAt`, including inherited personal-organization state;
- organization billing history isolated from unrelated personal exports;
- Studio 3/6/Custom lifecycle entitlement kept organization-only;
- lifecycle continuity after ownership transfer using established billing customer/subscription identity;
- first activation constrained to current-owner boundaries;
- later provider events may authenticate against already-bound customer or subscription identity and do not erase missing identifiers.

Live checkout/product activation still requires the actual external billing-provider integration/configuration.

## Team invitations and privacy hardening — completed repository foundation

The Organizations UI uses consent-based invitations instead of silently assigning membership.

- pending invitations reserve seats;
- Owner/Admin can invite/revoke within policy;
- acceptance creates membership only after recipient consent;
- invitation records preserve role, status, expiry and inviter/acceptor audit attribution;
- invitation acceptance rechecks projected reserved seats;
- direct membership assignment is retired as a consent bypass;
- stable account binding prevents mutable/reused email addresses from transferring an invitation to a different account;
- legacy unbound invitations fail closed until safely reissued;
- organization invitation history appears in authorized organization export;
- account-bound invitations are represented in personal privacy export without using mutable email alone as identity;
- account deletion protects company/studio ownership even when the owner membership is suspended and avoids email-only anonymization of another account's history.

**Current security boundary:** password authentication does not provide verified-email ownership. Therefore InventSmith does not allow an unregistered person's later self-claimed email address to automatically accept an earlier invitation. Current safe invitation acceptance is bound to a pre-existing uniquely matched InventSmith account. True pre-signup email invitations remain gated on verified-email delivery/authentication.

## Pricing direction — locked for planning, allowances not final

- **Explorer — $0**
- **Inventor — $39/month**
- **Pro — $99/month**
- **Enterprise — $199/month**
- **Studio 3 — $299/month — 3 active inventions**
- **Studio 6 — $399/month — 6 active inventions**
- **Studio Custom — larger/custom capacity based on measured economics**

Explorer is acquisition/evaluation; Inventor supports serious validation/feasibility/IP-readiness; Pro is the core individual complete idea-to-market plan including Product Design + CAD; Enterprise adds team/multi-invention throughput; Studio serves professional inventors, consultants, studios, incubators and organizations managing multiple projects/clients. Studio is never unlimited expensive compute.

Exact seats, storage and premium/expensive generation allowances remain unlocked until representative measured economics are sufficiently calibrated.

## Complete journey implementation already present

The branch contains substantial implementation across the full destination: persistent invention/evidence records; authenticated Evidence Locker upload and binary extraction/retry; evidence-impact/staleness propagation; Ask InventSmith chat-to-evidence write-back under organization Edit authorization; Validation and Market Research; Patent Readiness and patent-to-design handoff; evidence-backed Product Design; native preliminary CAD with STEP/STL/DXF/editable source and supported geometry; dimensioned/exploded views and product renders; engineering/professional review gates; prototype planning plus a real physical-evidence gate; manufacturing/RFQ plus a real manufacturer-quote gate; branding; IP/legal drafts and professional routing; pricing/marketing/sales/funding/pitch/launch/growth departments; a real launch-evidence gate before performance analysis; editable native PPTX pitch deck; financial CSV and Excel-readable workbook; artifact/document library; and Ask InventSmith grounded across project evidence/work/decisions/dependencies/reviews.

Repository regression contracts explicitly prevent InventSmith from synthesizing unperformed prototype results, invented manufacturer quote economics or modeled launch forecasts as actual results. Those gates release only when appropriate evidence enters the invention record.

Public/customer identity is InventSmith — The Inventor OS by Modern Methods. Legacy Atlas names remain only where compatibility requires them.

## Latest fully verified checkpoint

GitHub Actions **Atlas CI #441** on head `dd123cffd0a34c6b15cac4da114469150c4d63b3` passed dependency install, operational-script verification, web typecheck, Convex typecheck, full regression tests, production dependency audit and Next production build.

This checkpoint includes the latest organization authorization, shared-usage, invitation-consent, privacy/export/deletion and acceptance-hardening changes. Repository implementation is therefore green at this checkpoint.

## Current implementation / acceptance order

Continue autonomously in this order unless a real dependency requires reordering:

1. Keep repository CI green while auditing remaining acceptance surfaces; do not rewrite already-covered repository paths merely because live acceptance has not occurred.
2. Complete any remaining repository-only acceptance gaps discovered by inspection, with focused regression coverage.
3. Continue representative cost-to-serve collection and calibrate provider/runtime dollar economics without guessing.
4. Lock plan allowances, included seats, storage and premium-generation limits from measured economics.
5. Reconcile public/account pricing and external billing-provider checkout products only after economics and entitlement policy are locked.
6. Prepare the exact GitHub implementation/commit package for MadeThis replication.
7. Run live authenticated multi-user/multi-invention acceptance after replication, including binary evidence upload/extraction and Ask InventSmith write-back.
8. Run representative full-journey acceptance using genuine physical prototype evidence, real manufacturer quotes, real launch/market evidence and qualified professional review where the journey requires them. These are external acceptance gates, not repository work that may be fabricated.

## Hard safety/quality rules

Do not weaken authentication, authorization, entitlement checks, cost controls, evidence trust, professional-review gates or human approval gates. Migration must remain additive/backward compatible. A member leaving must never delete organization-owned inventions. Viewer cannot mutate invention state. Professional/Guest Reviewer receives only explicitly assigned invention/review access. Adding users must not multiply paid compute. CAD remains preliminary until engineering/prototype evidence supports production release. Patent work is research/readiness, not a legal opinion. Real prototype, quote, launch and professional-review gates must never be faked.

## Final acceptance still required

Repository implementation is not production acceptance. Final acceptance still includes live authentication/session persistence; real personal-organization migration; multi-user role enforcement and invention isolation; active/archive slot enforcement under real subscriptions; real billing/webhook behavior; concurrent organization-scoped AI/CAD/render/research accounting; privacy/export/deletion/member-removal behavior; representative binary evidence uploads/extraction; Ask InventSmith evidence write-back; a full idea-to-market invention; generated CAD/render/document quality review; real physical prototype/quote/launch evidence where required; professional review where required; and MadeThis/live replication acceptance after GitHub implementation is complete.

## New-chat start instruction

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then inspect draft PR #24 and branch `inventsmith/full-product-build`. Treat CI #441 / `dd123cffd0a34c6b15cac4da114469150c4d63b3` as the latest fully verified code checkpoint unless a newer full CI run is green. Continue repository acceptance inspection and economics work; do not restart completed organization/accounting/invitation work, do not return to the old pilot, do not merge PR #24, and do not hand work to MadeThis until the repository package is ready.