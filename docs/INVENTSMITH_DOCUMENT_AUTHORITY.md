# InventSmith Document Authority

**Updated:** August 16, 2026

This file prevents historical Atlas planning documents from overriding the current InventSmith product direction.

## Current authoritative documents

Read these first, in this order:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md` — authoritative product destination and non-negotiable requirements.
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md` — current implementation checkpoint, organization/pricing architecture and continuation order.
3. `docs/ATLAS_BUILD_PROGRESS.md` — current repository progress/acceptance status. The legacy filename is retained for compatibility.
4. `docs/ATLAS_DEPLOYMENT_RUNBOOK.md` — deployment/live verification procedures where still applicable.

## Historical/specialized planning documents

Documents such as `ATLAS_PRODUCT_ROADMAP.md`, `ATLAS_PRODUCT_RESET_V1.md`, `ATLAS_AUTOMATION_IMPLEMENTATION_PLAN.md`, older release plans, older controlled-pilot plans, and specialized Atlas architecture/research documents remain useful historical or subsystem references. They must not override the current InventSmith master specification or current plan/progress checkpoint.

In particular, any older statement that:

- only Stages 1–4 are the current product destination;
- Stages 5–15 are merely future roadmap capabilities;
- the controlled pilot represents overall product completion;
- Product Design/CAD/manufacturing/funding/launch are outside the intended current product;
- the product is customer-facing `Atlas` rather than `InventSmith`;
- subscriptions are purely user-scoped;
- the system is single-inventor/single-user by architecture;
- pricing remains the old $39/$79/$149 ladder;

is superseded by the current InventSmith documents.

## Current locked architecture decisions

- Customer-facing product: **InventSmith — The Inventor OS** by **Modern Methods**.
- Complete idea-to-market destination remains mandatory.
- Organization-native hierarchy: **User → Organization / Company → Memberships → Invention Workspaces**.
- Single inventors use one-member personal organizations.
- Billing/entitlements and expensive-work allowances move to organization scope.
- Multiple active/archived inventions and multi-user organizations are first-class requirements.
- Invention-level sharing and bounded professional/guest access are required.
- Pricing direction: **Explorer $0 → Inventor $39 → Pro $99 → Enterprise $199 → Studio $299+**.
- Studio direction begins with **Studio 3 $299 / 3 active inventions** and **Studio 6 $399 / 6 active inventions**; larger capacity remains economics-driven/custom until cost modeling is complete.
- Exact seats/compute/storage/premium-generation allowances are not final until measured cost-to-serve is modeled.

## Continuation rule

A new chat or coding worker must not spend time reconciling every historical Atlas document before continuing implementation. Use the current authority order above, preserve compatible historical detail, and treat conflicting older release-scope language as superseded.