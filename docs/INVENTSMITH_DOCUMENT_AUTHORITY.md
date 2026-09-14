# InventSmith Document Authority

**Updated:** September 14, 2026

This file defines documentation authority, naming, and historical-reference rules for InventSmith.

## Canonical product name

The customer-facing and current product name is **InventSmith — The Inventor OS** by **Modern Methods**.

The former **InventSmith / ProjectAtlas** name is historical only. It may remain only where changing it would make a factual record inaccurate, including:

- the current historical GitHub repository slug `jab1015/ProjectAtlas` until a separately reviewed repository rename is performed;
- exact historical commit messages, branch names, workflow names, environment-variable/code identifiers, email subjects, quotations, screenshots, exhibits, or third-party records;
- historical chronology explaining that the same product was previously developed under the former working name;
- compatibility identifiers that must remain until a tested code-level migration is performed.

Current product prose, active plans, current-state descriptions, handoff instructions, headings, and canonical documentation must use **InventSmith**, not InventSmith.

## Current authoritative documents

Read these first, in this order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md` — authoritative product destination and non-negotiable requirements.
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md` — authoritative implementation checkpoint and continuation order.
3. `docs/INVENTSMITH_BUILD_PROGRESS.md` — concise repository progress and acceptance status.
4. `docs/INVENTSMITH_DEPLOYMENT_RUNBOOK.md` — owner-controlled deployment and live-acceptance procedure.
5. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md` — document precedence, naming, and supersession rules.

## Historical and specialized documents

Older documents created under the former working name remain historical/specialized source material. They may preserve the former name where it is part of the original historical record, but they do not define the current customer-facing name or override the authoritative InventSmith documents above.

Any older statement that says or implies that only Stages 1–4 are the destination; Stages 5–15 are merely future scope; a controlled pilot equals overall completion; Product Design/CAD/manufacturing/funding/launch are outside the intended product; the customer-facing product uses the former working name; subscriptions are purely user-scoped; the architecture is inherently single-user/single-invention; the old $39/$79/$149 pricing ladder remains authoritative; organization seats multiply paid AI allowance; software/apps are outside InventSmith's invention scope; regulated inventions must be blanket-rejected rather than professionally gated; MadeThis remains the deployment target; or repository-green alone means production acceptance is superseded.

## Current locked product and architecture decisions

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

## Hosting and deployment authority

The active owner-controlled target is:

- **GitHub:** repository/source/CI authority;
- **Vercel:** future Modern Methods-owned web deployment;
- **Convex:** future Modern Methods-owned backend/database/auth/storage/functions deployment.

The prior MadeThis-managed environment is retired from the implementation plan. Do not synchronize back to it, deploy to it, modify it, migrate its test data, or treat it as the source of truth. MadeThis references remain only where historically or evidentially necessary.

## Current implementation truth

The active branch is `inventsmith/full-product-build`; draft PR #24 remains intentionally unmerged.

Implemented repository foundations include organization-native architecture; organization-scoped entitlements and usage accounting; invention authorization/sharing; privacy/export/deletion behavior; consent-based invitations; complete journey wiring; physical/software/hybrid/regulated classification and routing; evidence and trust boundaries; partial validation/recovery; attempt/lease worker reliability; genuine prototype/quote/launch/professional evidence gates; versioned artifact persistence; professional-review state; representative physical/software/hybrid/regulated acceptance; and direct real-world evidence gate behavior.

The latest fully verified implementation checkpoint before the September 14 documentation/naming updates is `bc93ed606866852e4ec88732e250d243a3db9a40`, workflow run #564 / run ID `34905374828`, PASS. Later documentation/naming commits must receive their own exact-head CI result before being called fully verified.

## Continuation rule

A new chat or coding worker should use the authoritative InventSmith documents above and continue from the live branch/PR/CI state. Do not restart completed work, do not merge PR #24, do not reintroduce MadeThis synchronization, and do not treat historical former-name documents as current product authority.

Repository implementation, automated verification, deployment, live functional verification, and professional review are separate statuses and must remain separately reported.