# InventSmith Build Progress

**Last updated:** August 16, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Current continuation checkpoint:** `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`  
**Active build branch:** `inventsmith/full-product-build` / draft PR #24 — intentionally unmerged

## Product vision

InventSmith — The Inventor OS by Modern Methods — is an organization-native operating system that takes an inventor from a raw idea through the complete evidence-backed journey to market while hiding unnecessary process complexity from the inventor.

> The inventor should never have to think about InventSmith. InventSmith should think about the inventor.

The common destination remains idea → evidence → validation → market/prior-art readiness → applicable product development → commercialization → launch → growth. Physical inventions use Product Design/CAD/Engineering/Prototype/Manufacturing; software inventions use Software Product Design/UX/Architecture/Data/Security/Prototype-Build/QA-Beta/Distribution; hybrid inventions use both applicable branches.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion. The retired controlled-pilot scope and old Atlas completion percentages are historical only.

## Locked organization architecture

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

A single inventor is a one-member personal organization. Organizations support multiple active/archived inventions, server-enforced roles, invention-level sharing, organization-scoped billing/entitlements and a shared expensive-work allowance. Archiving frees an active-invention slot without deleting evidence, design/CAD/software work, research, documents, decisions or history.

Roles: Owner, Admin, Member, Viewer, Professional/Guest Reviewer. Organization-owned inventions survive member departure. Destructive organization actions and billing authority remain appropriately restricted.

## Pricing direction

| Plan | Monthly price | Capacity direction |
|---|---:|---|
| Explorer | $0 | Evaluation / tightly bounded expensive work |
| Inventor | $39 | Serious validation, feasibility and IP-readiness |
| Pro | $99 | Core complete idea-to-market individual plan including applicable physical or software product development |
| Enterprise | $199 | Multi-invention/team capacity and greater throughput |
| Studio 3 | $299 | 3 active inventions + professional organization workflow |
| Studio 6 | $399 | 6 active inventions + professional organization workflow |
| Studio Custom | Custom | Larger capacity based on measured economics |

Exact included seats, storage, AI/CAD/render/research/software-generation allowances and larger Studio capacity remain unlocked until measured economics justify them.

## Organization implementation — completed repository foundation

Implemented on the full-product branch:

- additive organization schema/runtime and personal-organization migration compatibility;
- organization-native invention creation/listing plus active/archive capacity enforcement;
- Read/Edit/Manage authorization across main workspace, Ask InventSmith, Evidence Locker, Product Design, Native CAD, Journey Center, Journey Engine, lifecycle departments, downloads, chat-evidence capture and evidence-extraction retry;
- Manage-only consequential decisions/approvals and destructive invention actions;
- invention-level access grants and bounded Professional/Guest Reviewer foundations;
- ownership transfer and organization-safe member/account deletion semantics;
- organization navigation/team UI foundations;
- organization-owned inventions preserved when members leave;
- personal versus company/studio privacy/export boundaries.

## Invention classification and dynamic routing — completed repository implementation

Organization-native onboarding now classifies inventions before normal persistence using migration-safe structured-record data rather than a destructive schema migration.

- **Physical:** receives applicable physical Product Design, native CAD/engineering, physical prototype and manufacturing work.
- **Software:** apps, SaaS, APIs, web/mobile/desktop and AI-enabled software are supported as first-class inventions. Pure software does not receive irrelevant native CAD, physical prototype or manufacturer-quote tasks.
- **Hybrid:** connected hardware/software products run both branches.
- **Regulated review:** medical/diagnostic, children's/life safety, structural, automotive/aerospace, regulated electrical/comms, and regulated financial/health/privacy software remain supported while qualified professional gates are required where appropriate.
- **Unsupported:** harmful/abusive weapon/destructive, malware/credential-theft/unauthorized cyberattack, covert surveillance/stalking, fraud/theft/deceptive abuse, and dangerous chemical/biological/radiological weaponization concepts are rejected before a normal organization-invention workspace is created.
- **Business-only:** ordinary service/business concepts with no new physical/software/hybrid product are routed outside the invention workflow.

Software stages 5–7 are dynamically represented as **Software Product Design → Software Prototype & Build → Software Engineering & Release Readiness**. The software work plan covers product specification, UX flows, architecture, data/API design, security/privacy readiness, prototype/build planning, implementation planning, QA/acceptance, beta readiness and distribution/release planning. Hybrid stages require both applicable physical and software work.

The live onboarding UI uses the organization-native classified `organizationInventions:create` path. The legacy creator remains for migration compatibility rather than being used by current onboarding. Runtime risk triage still prevents unsupported legacy concepts from autonomous execution.

Regression coverage protects physical/software/hybrid routing, regulated support, unsupported rejection, business-only routing, dependency integrity, software entitlement, organization-native pre-persistence classification and live onboarding routing.

## Shared expensive-resource accounting — completed

Organization-owned inventions use a shared `organizationDailyUsage` ledger keyed by organization + UTC day. Legacy inventions without an organization remain on the user ledger for backward compatibility. Ask InventSmith, autonomous work, Native CAD and visual generation reserve/settle against the correct shared organization capacity; race protections and stale-output settlement remain intact. Adding seats does not multiply an organization's paid compute allowance.

## Cost attribution and economics — current state

Measured cost units are attributable/reportable by organization, invention, operation kind and operation class (`light`, `standard`, `expensive`, `premium`), with provider/model metadata where available. Observed cost-to-serve reporting covers average/median, P90 heavy use, maximum observed use and Studio top-3/top-6 overlap. Cost units are intentionally not converted into fabricated dollars before provider/runtime calibration. Detailed provider/cost economics are Owner/Admin-only.

## Organization billing / entitlement foundation — completed in repository

Organization-targeted subscription events, organization `planKey` entitlement, legacy personal compatibility, billing recency, organization billing-history separation, Studio organization-only lifecycle entitlement and ownership-transfer billing continuity are implemented additively. Live checkout/product activation still depends on the actual external billing provider.

## Team invitations and privacy hardening — completed repository foundation

Consent-based invitations reserve seats, recheck capacity at acceptance, bind safely to intended existing accounts, fail closed for unsafe legacy unbound invitations, and follow organization/personal privacy/export/deletion boundaries. Direct membership assignment is retired as a consent bypass. True pre-signup invitations remain gated on verified-email delivery/authentication.

## Complete idea-to-market capability already present

Material repository implementation exists across persistent invention/evidence records; authenticated binary Evidence Locker ingestion/extraction/retry; downstream staleness; Ask InventSmith write-back; Validation; Market Research; Patent Readiness; physical Product Design/native CAD and renders; software Product Design/engineering routing; engineering/security/privacy/professional review; physical prototype evidence gate; manufacturing/RFQ real-quote gate; branding; IP/legal; pricing/marketing/sales/funding/pitch/launch/growth; actual-launch evidence gate; editable PPTX; financial CSV/Excel-readable workbook; artifact/document library; and Ask InventSmith grounding.

Generated/modelled work cannot satisfy genuine prototype, supplier-quote, software-test/deployment, launch-result or professional-review gates.

Customer-facing branding is InventSmith / The Inventor OS / Modern Methods. Legacy Atlas identifiers remain only where compatibility requires them.

## Truth and safety boundaries

Generated CAD remains preliminary until engineering/prototype evidence supports production release. Software plans/specifications must not be represented as implemented, tested or deployed software without real execution evidence. Patent intelligence is research/readiness, not a patentability/FTO/legal opinion. InventSmith never fabricates a physical prototype, manufacturer quote, software test/deployment result, launch result, professional review, legal authorization or other real-world evidence.

## Verified CI checkpoint

GitHub Actions **Atlas CI #463**, head `e533dd96f1768e4cff36a502ee9779f3b97c5cb4`, fully passed operational-script verification, web TypeScript, Convex TypeScript, full regression tests including the initial product-type routing suite, production dependency audit and Next production build.

The subsequent business-only classification and authoritative-document updates must receive a final full green CI pass before their resulting SHA becomes the MadeThis synchronization pin.

## Remaining work / acceptance

1. Run the final complete CI stack on the current classification/routing/documentation head and fix any failure.
2. Pin the final green SHA and provide it to MadeThis for synchronization into the managed source while preserving data/auth/storage/domain/billing infrastructure.
3. Continue representative cost-to-serve/provider-dollar calibration without guessing final commercial limits.
4. Once MadeThis resolves its managed Convex deployment-runner blocker, perform authenticated live acceptance of physical/software/hybrid routing, organizations, shared resource accounting, evidence, Ask InventSmith, privacy/deletion and real billing/webhooks.
5. Run representative full journeys with genuine physical evidence, manufacturer quotes, software execution/test/deployment evidence, launch/market evidence and qualified professional review where applicable.

## Final acceptance boundary

Repository-green is not production acceptance. Final acceptance still requires real authentication/session persistence, migration against real users/inventions, product-type routing, multi-user role/isolation tests, active/archive enforcement, real billing/webhooks, concurrent organization resource accounting, privacy/export/deletion, representative evidence uploads, physical/software/hybrid journey testing, artifact-quality review and genuine physical/software/professional/market evidence where required.

## New-chat handoff

Read, in order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

Then inspect branch `inventsmith/full-product-build` and draft PR #24. Treat CI #463 / `e533dd96f1768e4cff36a502ee9779f3b97c5cb4` as the latest fully verified checkpoint unless a newer complete run is green. Do not restart completed organization/accounting/invitation/classification work and do not merge PR #24. Immediate next action: final CI, then pin the resulting SHA for MadeThis synchronization.