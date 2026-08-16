# InventSmith Document Authority

**Updated:** August 16, 2026

This file prevents historical Atlas planning documents from overriding the current InventSmith product direction.

## Current authoritative documents

Read these first, in this order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md` — authoritative product destination and non-negotiable requirements.
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md` — authoritative implementation checkpoint and continuation order.
3. `docs/ATLAS_BUILD_PROGRESS.md` — concise repository progress/acceptance status; legacy filename retained for compatibility.
4. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md` — document precedence and supersession rules.
5. `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` — authoritative MadeThis handoff, deployment and live-acceptance procedure; legacy filename retained for compatibility.

## Historical/specialized planning documents

Older `ATLAS_*` roadmaps, reset plans, automation plans, release plans, controlled-pilot plans, stage blueprints, research architecture documents, Bibles and other historical material remain useful for compatible detail and subsystem history. They do not override the current InventSmith master specification or current plan/progress checkpoint.

In particular, any older statement that says or implies that only Stages 1–4 are the destination; Stages 5–15 are merely future scope; a controlled pilot equals overall completion; Product Design/CAD/manufacturing/funding/launch are outside the intended product; the customer-facing product is Atlas; subscriptions are purely user-scoped; the architecture is inherently single-user/single-invention; the old $39/$79/$149 pricing ladder remains authoritative; organization seats multiply paid AI allowance; software/apps are outside InventSmith's invention scope; regulated inventions must be blanket-rejected rather than professionally gated; or repository-green alone means production acceptance is superseded.

## Current locked product/architecture decisions

- Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**.
- Complete idea-to-market destination remains mandatory.
- Product principle: **The inventor should never have to think about InventSmith. InventSmith should think about the inventor.**
- Organization-native hierarchy: **User → Organization / Company → Memberships → Invention Workspaces**.
- Single inventors use one-member personal organizations.
- Billing/entitlements and expensive-work allowances belong to organization scope for organization-owned inventions.
- Multiple active/archived inventions and multi-user organizations are first-class requirements.
- Invention-level sharing and bounded professional/guest access are required.
- Pending team invitations reserve seats and require recipient consent before membership is created.
- Until email ownership is cryptographically/operationally verified, a later account may not claim a pre-signup invitation merely by registering the invited address.
- **Physical, software, and hybrid products are first-class invention types.** Apps, SaaS, APIs and other software products are supported rather than rejected merely because they are not physical.
- Pure software routes through software product specification, UX, architecture, data/API design, security/privacy readiness, prototype/build planning, QA/beta and distribution/release rather than physical CAD/RFQ/manufacturing work.
- Hybrid products run both the physical and software branches before applicable combined stages are complete.
- Regulated/safety-sensitive inventions are generally supported with explicit qualified professional/regulatory/engineering/security/privacy gates rather than being blanket-rejected.
- InventSmith refuses harmful/abusive development such as weapon/destructive-device development, malware/credential theft/unauthorized cyberattack tooling, covert/unauthorized surveillance, fraud/theft/deceptive abuse, and dangerous chemical/biological/radiological weaponization.
- Ordinary service/business concepts without a new physical, software or hybrid product are routed outside the invention-development workflow.
- Pricing direction: **Explorer $0 → Inventor $39 → Pro $99 → Enterprise $199 → Studio $299+**.
- Studio direction begins with **Studio 3 $299 / 3 active inventions** and **Studio 6 $399 / 6 active inventions**; larger capacity remains economics-driven/custom.
- Exact compute/storage/premium-generation allowances remain unlocked until measured cost-to-serve is sufficiently calibrated. Current daily usage ceilings are safety caps, not final commercial promises.
- Internal cost economics are not customer-wide data; detailed provider/cost intelligence is restricted to authorized organization administration.
- Repository CI success is necessary but not sufficient for live/physical/professional/billing acceptance.

## Current implementation truth

The organization schema, shared organization usage ledger, organization-scoped entitlement foundation, invention-level authorization/sharing foundations, organization-safe privacy/export/deletion behavior, measured cost-unit attribution/scenario reporting, consent-based team invitation foundation, complete journey wiring, genuine prototype/quote/launch/professional evidence gates, and product-type classification/routing foundation are implemented on `inventsmith/full-product-build`.

Atlas CI #463 on `e533dd96f1768e4cff36a502ee9779f3b97c5cb4` fully passed the classification/routing implementation through operational checks, both TypeScript targets, regression tests, production dependency audit and Next production build. Later business-only classification/documentation commits require a fresh full green CI pass before the new SHA is pinned for MadeThis replication.

## Continuation rule

A new chat or coding worker must not spend time reconciling every historical Atlas document before continuing implementation. Use the authority order above, preserve compatible historical detail, and treat conflicting older release-scope language as superseded. Draft PR #24 remains intentionally unmerged until GitHub implementation is complete and founder approval is given.

When repository inspection finds no remaining code-only blocker and the current head is fully green, the next step is to pin the exact GitHub SHA and hand it to MadeThis for deterministic replication. Live authentication, external billing, real provider/runtime economics, artifact-quality review and genuine physical/professional/market evidence are acceptance work after replication; they must not be fabricated inside the repository merely to claim completion.