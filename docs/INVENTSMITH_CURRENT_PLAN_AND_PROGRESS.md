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

InventSmith is an end-to-end operating system that takes an inventor from idea to market while dynamically routing work to the actual product type. The common journey is:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Development → Commercialization → Launch → Growth**

For physical inventions, Product Development includes Product Design, CAD/Engineering, physical Prototype and Manufacturing. For software inventions it includes Software Product Design, UX, architecture/data/security, Software Prototype & Build, QA/Beta and Distribution/Release. Hybrid inventions run both applicable branches. InventSmith owns sequencing, dependencies, evidence state, reversible autonomous work and the smallest necessary human/professional/physical gates.

> The inventor should never have to think about InventSmith. InventSmith should think about the inventor.

## Organization-native architecture — locked

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

A single inventor is a one-member personal organization. Required behavior includes multiple active/archived inventions; organization-scoped billing, entitlements and expensive-work allowance; active-invention capacity; preserved archived project history; Owner/Admin/Member/Viewer/Professional-Guest roles; server-side authorization; invention-level access isolation; organization-owned invention survival after member departure; owner-gated destructive actions; resource attribution by organization/invention/operation class; and an evolution path to Organization → Clients → Inventions → Team/Guest access.

## Repository implementation completed

Organization/product foundation includes:

- additive organization schema/runtime and personal-organization migration compatibility;
- organization-native invention creation/listing and active/archive slot enforcement;
- Read/Edit/Manage authorization across primary invention surfaces, Journey Engine, chat-to-evidence capture and specialized evidence retry;
- Manage-only consequential decisions, approvals and destructive invention actions;
- invention-level access grants and Professional/Guest Reviewer isolation foundations;
- ownership transfer and organization-safe account/member deletion semantics;
- organization-aware privacy/export boundaries;
- Studio plan recognition and organization navigation/team UI;
- consent-based organization invitations with pending-seat reservation and stable pre-existing-account binding;
- direct membership assignment retired from the normal backend path;
- invitation acceptance rechecks projected seat capacity after plan changes/stale reservations.

## Invention classification and dynamic journey routing — implemented

New organization-native inventions are classified **before normal workspace persistence**.

Supported product types:

- **Physical** — uses physical Product Design, native CAD/engineering, prototype and manufacturing work as applicable.
- **Software** — apps, SaaS, APIs, web/mobile/desktop software and AI-enabled software products are first-class inventions. Pure software does not receive irrelevant CAD, physical-prototype or manufacturer-quote tasks.
- **Hybrid** — connected hardware/software products run both applicable physical and software branches.

Pure software stages 5–7 become:

**Software Product Design → Software Prototype & Build → Software Engineering & Release Readiness**

The software branch contains software product specification, UX/user-flow design, architecture, data/API model, security/privacy readiness, prototype/build planning, implementation planning, QA/acceptance planning, beta readiness and platform-appropriate distribution/release planning. Pro and Enterprise entitlements permit these software work kinds.

Regulated/safety-sensitive inventions such as medical, children's safety, life-safety, structural, automotive/aerospace, regulated electrical/communications and regulated financial/health/privacy software are generally **supported with required qualified professional review**, not blanket-rejected.

Unsupported concepts are rejected before normal organization-invention persistence when their intended function materially facilitates weapon/destructive capability, malware/credential theft/unauthorized cyberattack, covert/unauthorized surveillance, fraud/theft/deceptive abuse or dangerous chemical/biological/radiological weaponization. Ordinary service/business concepts without a new physical/software/hybrid product are routed outside the invention workflow.

Classification is stored in the existing structured invention record and existing risk-class field, so this implementation does **not** require a destructive schema migration. The live onboarding UI uses `organizationInventions:create`, the classified organization-native path. Legacy `journeyEngine:createInvention` remains only for compatibility and is not the live onboarding route; runtime risk triage still prevents unsupported concepts from autonomously executing if legacy data reaches the executor.

## Shared expensive-resource accounting — completed

Organization-owned inventions use `organizationDailyUsage` keyed by organization + UTC day. Ask InventSmith and autonomous work reserve/settle against the shared organization allowance. Reservations are race-safe inside Convex mutations. Migration captures same-day legacy usage as a baseline. Native CAD's specialized settlement uses the organization ledger, visual generation returns through central settlement, and organization-invention deletion releases reservations from the correct shared ledger. Adding collaborators does not multiply paid compute allowance. Legacy inventions without `organizationId` remain on the legacy user ledger.

## Cost attribution and cost-to-serve — implemented measurement foundation

InventSmith records/reports measured cost units by organization, invention, operation kind and operation class (`light`, `standard`, `expensive`, `premium`), with provider/model metadata where available. Ask InventSmith records model-token units, live-research usage and provider/model attribution; autonomous work carries work/event cost units.

Observed scenario reporting calculates average/median usage, P90 heavy-use behavior, maximum observed behavior and Studio overlap scenarios using the top 3 and top 6 concurrent invention workloads. Confidence reflects sample size. Cost units remain deliberately separate from dollars until provider/runtime calibration is grounded in real costs. Detailed internal economics are Owner/Admin-only.

## Organization billing / entitlement foundation — completed in repository

Implemented additively: organization-targeted subscription events; organization `planKey` entitlement authority; legacy personal subscription compatibility/mirroring; billing recency ordering; organization billing-history isolation; Studio 3/6/Custom organization-only lifecycle entitlement; and lifecycle continuity after ownership transfer using established billing customer/subscription identity. Live checkout/product activation still requires the actual external billing-provider integration/configuration.

## Team invitations and privacy hardening — completed repository foundation

Pending invitations reserve seats; Owner/Admin can invite/revoke; membership activates only after recipient consent; acceptance rechecks capacity; stable account binding protects against mutable/reused email; legacy unbound invitations fail closed; privacy/export/deletion boundaries preserve company data and invitation PII appropriately.

**Current security boundary:** password authentication does not provide verified-email ownership. True pre-signup invitations remain gated on verified-email delivery/authentication.

## Pricing direction — locked for planning, allowances not final

- **Explorer — $0**
- **Inventor — $39/month**
- **Pro — $99/month**
- **Enterprise — $199/month**
- **Studio 3 — $299/month — 3 active inventions**
- **Studio 6 — $399/month — 6 active inventions**
- **Studio Custom — larger/custom capacity based on measured economics**

Explorer is acquisition/evaluation; Inventor supports serious validation/feasibility/IP-readiness; Pro is the core individual complete idea-to-market plan including applicable physical or software product-development work; Enterprise adds team/multi-invention throughput; Studio serves professional inventors, consultants, studios, incubators and organizations. Studio is never unlimited expensive compute. Exact seats, storage and premium/expensive generation allowances remain unlocked until representative measured economics are sufficiently calibrated.

## Complete journey implementation already present

The branch contains persistent invention/evidence records; authenticated Evidence Locker upload and binary extraction/retry; evidence-impact/staleness propagation; Ask InventSmith chat-to-evidence write-back; Validation and Market Research; Patent Readiness and patent-to-design handoff; physical Product Design/native CAD; software product design/engineering routing; professional review gates; physical prototype and real-evidence gate; manufacturing/RFQ and real-quote gate; branding; IP/legal drafts and professional routing; pricing/marketing/sales/funding/pitch/launch/growth departments; real launch-evidence gate; editable native PPTX; financial CSV/Excel-readable workbook; artifact/document library; and Ask InventSmith grounded across project state.

Repository regression contracts prevent InventSmith from synthesizing unperformed prototype results, software test/deployment results, invented manufacturer quote economics or modeled launch forecasts as actual results.

Public/customer identity is InventSmith — The Inventor OS by Modern Methods. Legacy Atlas names remain only where compatibility requires them.

## Latest fully verified checkpoint

GitHub Actions **Atlas CI #463** on head `e533dd96f1768e4cff36a502ee9779f3b97c5cb4` passed operational scripts, web TypeScript, Convex TypeScript, the full regression suite including the initial 11 product-classification/routing tests, production dependency audit and Next production build.

Subsequent business-only classification and authoritative-document commits require one final full CI pass before the new SHA is pinned for MadeThis replication.

## Current implementation / acceptance order

1. Complete the final CI pass on the classification/routing/documentation head and repair any concrete failure.
2. Pin the resulting exact GitHub SHA for MadeThis synchronization.
3. Preserve measured cost-to-serve instrumentation and continue collecting representative provider/runtime economics without guessing dollars.
4. After MadeThis backend synchronization is operational, run live authenticated multi-user/multi-invention acceptance including physical/software/hybrid classification, migration, invitation identity/consent, shared resource concurrency, evidence extraction, Ask InventSmith write-back, privacy/deletion and billing/webhooks.
5. Run representative physical, software and hybrid journeys. Use genuine prototype/quote/launch/professional evidence and genuine software execution/test/deployment evidence where applicable.
6. Lock final commercial allowances and reconcile external billing products only after representative economics support sustainable limits.

## Hard safety/quality rules

Do not weaken authentication, authorization, entitlement checks, cost controls, evidence trust, professional-review gates or human approval gates. Migration must remain additive/backward compatible. Adding users must not multiply paid compute. CAD remains preliminary until engineering/prototype evidence supports production release. Software preparation must not be presented as implemented/tested/deployed software without real execution evidence. Patent work is research/readiness, not a legal opinion. Real prototype, quote, launch and professional-review gates must never be faked.

## Final acceptance still required

Repository implementation is not production acceptance. Final acceptance includes live authentication/session persistence; real personal-organization migration; multi-user role enforcement and invention isolation; product-type routing; active/archive slot enforcement; real billing/webhooks; concurrent organization-scoped resource accounting; privacy/export/deletion; representative evidence uploads/extraction; Ask InventSmith evidence write-back; physical/software/hybrid representative journeys; CAD/render/document quality where applicable; software implementation/test/deployment evidence where applicable; genuine physical/quote/launch evidence; professional review; and MadeThis/live replication acceptance.

## New-chat start instruction

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then inspect draft PR #24 and branch `inventsmith/full-product-build`. Treat CI #463 / `e533dd96f1768e4cff36a502ee9779f3b97c5cb4` as the latest fully verified code checkpoint unless a newer complete run is green. Do not restart completed organization/accounting/invitation/classification work, do not return to the old pilot, and do not merge PR #24. The immediate action is final CI followed by a pinned MadeThis synchronization SHA.