# InventSmith Master Product Specification

**Status:** Authoritative product destination  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Updated:** August 16, 2026

## 1. Non-negotiable product promise

InventSmith is an end-to-end operating system for inventors. It must take an inventor from a raw idea through the work required to reach market, while continuously telling the inventor what has been completed, what was learned, what requires a decision or outside professional, and what happens next.

> The inventor should never have to think about InventSmith. InventSmith should think about the inventor.

The target journey is:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding → Launch → Growth**

For physical inventions, Product Design naturally includes CAD/engineering, physical prototype and manufacturing work. For software inventions, the equivalent middle journey dynamically becomes software product design, UX, architecture/data/security, software prototype/build planning, QA/beta and distribution/release. Hybrid inventions run both applicable branches. Incremental releases may deliver portions of this journey, but release boundaries must never be mistaken for the final product specification. InventSmith is not complete until the complete idea-to-market operating system applicable to that invention type is implemented and acceptance-tested.

## 2. Engine owns progress

The inventor is not expected to know the invention-development process. InventSmith determines the next useful work from the invention record, evidence, product type, dependencies, confidence, risks, approvals and professional gates. Every workspace must make clear what InventSmith completed/discovered, what evidence changed the assessment, what requires the inventor or an outside professional, what happens next, what deliverables are available and what blocks progress.

## 3. Persistent invention record and uploaded evidence

The invention record is the source of truth, not chat history. Inventors must be able to attach evidence and working material throughout the journey, including survey exports, interviews/transcripts, customer-discovery notes, PDFs, DOCX, spreadsheets/CSV, photographs/reference images, sketches/drawings, prototype evidence, competitor material, patent/prior-art documents, manufacturer quotations, professional reports, pitch decks, contracts/legal documents and other invention-specific evidence.

InventSmith classifies uploaded material, preserves provenance, associates it with the correct invention/work item, extracts useful structured facts where appropriate, distinguishes inventor evidence from AI analysis, and makes evidence available downstream. Evidence changes must invalidate or refresh affected downstream work when appropriate.

## 4. Validation, research and patent intelligence

InventSmith autonomously performs or coordinates evidence-backed problem validation, customer research, assumption testing, competitor/alternative research, market sizing/segmentation, willingness-to-pay evidence, market trends, prior art/patent landscape, feature/prior-art comparison, differentiating hypotheses, technical/material/manufacturing or software feasibility, regulatory-readiness screening, preliminary cost ranges and development risks/dependencies.

Patent intelligence is part of the Product Design loop. Product Design uses crowded features, differentiating hypotheses and uncertainty to explore meaningfully different mechanisms, embodiments, software methods or product architectures while never claiming patentability, freedom-to-operate, validity or legal clearance without qualified professional review. Material claims remain traceable to sources, inventor evidence, estimates or explicit AI inference.

## 5. Product Design + CAD / Engineering

For physical and hybrid inventions, InventSmith turns the accumulated invention record into evidence-backed design candidates, scores/selects promising directions, generates a product design specification, creates editable native CAD for supported geometry, produces appropriate STEP/STL/DXF and drawing/image artifacts, exploded/dimensioned views, selected-product renders, BOM/cost/manufacturing intent, revision state, assumptions, unresolved engineering and a professional engineering handoff.

CAD/drawings remain preliminary until engineering/prototype evidence validates production-release dimensions, tolerances, materials, fits, sealing, loads, safety and manufacturing details.

Pure software inventions do not receive irrelevant CAD/manufacturing tasks merely to satisfy a fixed physical-product template; Section 15 defines their equivalent software product-development branch.

## 6. Prototype and Manufacturing

For physical and hybrid inventions, InventSmith prepares prototype strategy, sourcing, test plans, evidence assessment, design-gap analysis and iteration. It never claims a physical prototype was built/tested from modeled data alone. Physical prototype evidence is a real-world gate.

InventSmith prepares manufacturing-process selection, factory requirements, supplier/manufacturer research, RFQ packages, scorecards, quote comparison, unit economics, agreement checklists and readiness. Real quote comparison requires actual manufacturer/RFQ evidence.

Pure software inventions instead use software prototype/build, QA/beta and distribution/release readiness appropriate to the intended platform and never fabricate code execution, test results, beta results or deployment evidence.

## 7. Branding, IP/Legal and commercial execution

InventSmith supports positioning, naming direction, preliminary trademark screening, visual identity/packaging direction and inventor-facing visual concepts. It prepares IP strategy, invention disclosure, NDA/legal draft packages, contracting packages, IP status and professional handoffs without representing drafts as legal advice or filing/signing/submitting without required authorization.

It uses accumulated evidence/economics to produce pricing strategy and validation, marketing plans/assets, sales channels/toolkits, funding strategy/source research, financial models, investor readiness, editable pitch materials, launch planning, logistics or distribution readiness, market activation, post-launch evidence intake, performance analysis, growth roadmaps and customer-feedback-driven iteration. The journey becomes iterative after launch rather than terminating.

## 8. Documents and deliverables

InventSmith maintains a visible versioned document/deliverable library. Artifacts may include Idea Brief, Validation Report, evidence summaries, Competitive Landscape, Market Research Summary, Market Size Model, Patent Readiness/Prior Art reports, feature/prior-art comparison, professional handoff, Product Design Specification, Design Decision Log, CAD/design package, engineering handoff, prototype plan/test report, BOM/cost model, RFQ/manufacturing package, manufacturer comparison, software product specification, UX flow design, software architecture, data/API design, security/privacy readiness, software prototype/build plan, QA/beta plan, software distribution/release plan, Brand Identity System, NDA/legal draft packages, IP status tracker, Pricing Strategy, Go-to-Market Plan, Sales Toolkit, Pitch Deck, Financial Model, Funding Strategy, Launch Playbook and Growth reports.

Export formats match the artifact: PDF/DOCX, PPTX/presentation-compatible, XLSX/CSV and appropriate CAD/image/software specification formats.

## 9. Inventor-facing experience and branding

The UI exposes the applicable journey and outputs; backend-only implementation is not acceptance. Inventors can reach journey/stage state, active/completed work, research/evidence, validation, prior art/IP readiness, Product Design, applicable CAD/engineering or software product-development artifacts, prototype/manufacturing or software release work, legal/professional work, documents/downloads, decisions/approvals, recommendations/next actions and Ask InventSmith grounded in the complete invention record.

All current customer-facing surfaces use **InventSmith**, **The Inventor OS** and **Modern Methods**. Legacy Atlas identifiers may remain internally only where compatibility requires them.

## 10. Autonomy and approvals

InventSmith autonomously performs reversible internal work/preparation wherever reasonably safe. Inventors are not asked to manage departments or manually trigger routine downstream work.

Approval is required before consequential external actions such as spending money, contacting/hiring third parties, sharing confidential information externally, legal/regulatory submission, signing contracts, publishing/launching, manufacturing orders, app-store submissions/terms acceptance, production deployments or irreversible business commitments. Professional review gates remain for legal opinions/final instruments, production-release engineering where appropriate, regulated/safety-critical decisions, security/privacy review where required and other qualified-authority work.

## 11. Organization-native, multi-invention architecture

InventSmith is organization-native from inception. A single inventor is a one-member organization.

Canonical hierarchy:

**User → Organization / Company → Memberships → Invention Workspaces**

Every invention belongs to an organization and retains creator attribution for migration/history. Existing single-user inventions migrate additively into personal organizations without losing ownership, evidence, work, documents, billing or audit history.

Organizations support multiple active/archived inventions. Subscription capacity is primarily active-invention slots; archiving frees a slot without deleting project state.

Minimum roles:

- **Owner** — ownership, billing, membership administration, destructive organization actions;
- **Admin** — organization/workspace administration subject to owner-only restrictions;
- **Member** — normal assigned invention work;
- **Viewer** — read-only access;
- **Professional / Guest Reviewer** — bounded specifically assigned invention/review access without broad organization/billing visibility.

Permissions are server-enforced; UI hiding is never authorization. Invention-level access is independently assignable.

### Membership invitation security

Membership is consent-based. A pending invitation may reserve plan seat capacity, but it does not grant invention or organization access before acceptance. Invitations preserve role, status, expiry and inviter/acceptor audit attribution and participate in privacy/export/deletion lifecycle rules.

Email-address invitations must not treat possession of an unverified self-claimed account email as proof of identity. Until the authentication/delivery system verifies email ownership, pre-signup invitations cannot be automatically claimed by a later account merely registering the invited address. Safe interim acceptance may require a pre-existing uniquely matched account; full pre-signup invitations require verified-email delivery/authentication.

Billing/entitlements belong to the organization. Organization policy controls active-invention slots, included seats, compute/AI allowance, storage, premium generation and professional/studio capabilities. Adding members must not multiply the organization's paid expensive-work allowance. Resource consumption is attributable to organization and invention.

The architecture evolves to **Organization → Clients → Inventions → Team/Guest access** without replacing the ownership model. Member departure does not delete organization-owned inventions. Organization deletion, ownership transfer, billing changes and destructive organization actions require appropriate owner authorization/preservation rules.

## 12. Pricing and capacity architecture

Target commercial ladder:

**Explorer $0 → Inventor $39 → Pro $99 → Enterprise $199 → Studio $299+**

Initial Studio direction:

- **Studio 3 — $299/month — 3 active inventions**
- **Studio 6 — $399/month — 6 active inventions**
- larger Studio/Custom capacity priced from measured cost-to-serve rather than unlimited expensive operations.

Inventor supports serious validation/feasibility/IP-readiness. Pro is the core individual complete idea-to-market plan including applicable physical Product Design + CAD or software Product Design/engineering work and downstream lifecycle work. Enterprise/Studio add organization capacity, collaboration, throughput and professional use.

Exact included seats, AI/compute allowances, storage, premium-generation allowances and larger Studio capacity are set from measured economics before billing products are final. InventSmith does not expose raw model tokens as the primary customer experience. Internally it meters cost by organization, invention and operation class to support sustainable gross margin and prevent runaway API/CAD/render/research cost.

Measured cost-to-serve should distinguish normal, heavy, worst-reasonable and overlapping multi-invention Studio workloads, including software, physical and hybrid workload mixes. Internal provider/model economics are operational business intelligence and need not be visible to ordinary collaborators.

## 13. Acceptance definition

InventSmith is not done because the repository builds, tests pass or a deployment returns HTTP 200. Full product acceptance requires representative end-to-end live verification demonstrating progression from idea toward market as evidence/approvals permit.

Acceptance must eventually prove branding/logo; authentication/session persistence; organization creation/personal migration; invitation consent and identity safety; membership/role enforcement; invention-level isolation; active/archive slot enforcement; organization billing/entitlements/resource accounting; intake/classification/persistent record; upload/evidence ingestion/downstream use; validation; market/competitor research; patent/prior-art intelligence; product-type routing; physical Product Design/CAD and/or software product design/architecture as applicable; prototype/build loop; manufacturing/RFQ and/or software QA/beta/distribution as applicable; legal/professional routing/drafts; document exports; pitch/funding; pricing/marketing/sales; launch/growth; Ask InventSmith grounding; privacy/export/deletion; and transparent confidence/evidence/approval/professional gates.

Repository implementation, live runtime acceptance, physical-world evidence, software execution/deployment evidence and professional review are distinct completion dimensions and must be reported separately.

## 14. Current build priority — August 16, 2026

The full-product branch now materially implements the complete journey plus the organization-native security/resource foundation: organization authorization, active/archive capacity, shared organization usage, organization entitlement/billing foundation, privacy/export/deletion boundaries, consent-based invitations, cost-unit attribution/scenario reporting, authenticated evidence ingestion/retry, Ask InventSmith write-back, physical Product Design/CAD, software product classification/routing, downstream lifecycle departments and genuine prototype/quote/launch/professional gates.

Immediate dependency order is therefore:

1. Keep the current repository/documentation head fully green in the complete CI pipeline and repair any concrete code-only acceptance blocker discovered by final inspection.
2. Preserve measured cost-to-serve instrumentation and collect representative production/provider observations; do not invent dollar economics merely to finish repository work.
3. Pin the exact fully green GitHub SHA and provide it to MadeThis for deterministic replication once no repository-only blocker remains.
4. After replication, perform live authenticated multi-user/multi-invention acceptance, including migration, classification/routing, invitation identity/consent, shared resource concurrency, binary evidence extraction, Ask InventSmith write-back, privacy/deletion and real billing/webhook behavior.
5. Use genuine physical prototype evidence, manufacturer quotes, post-launch market evidence, software execution/test/deployment evidence and qualified professional review wherever those gates are required. Never synthesize those facts merely to claim completion.
6. Lock final commercial compute/storage/premium-generation allowances and reconcile external billing products after representative provider/runtime economics are measured sufficiently to support sustainable limits.

`docs/ATLAS_DEPLOYMENT_RUNBOOK.md` is the authoritative handoff/live-acceptance checklist despite its legacy filename.

No future progress report may describe InventSmith as fully production-accepted without clearly distinguishing repository implementation from live, physical, software-runtime, professional, organization-security, billing and artifact-quality acceptance.

## 15. Invention classification, routing and unsupported scope

InventSmith must classify new organization-native inventions before normal workspace persistence and route the journey to the product being developed.

### Supported product types

- **Physical** — physical consumer/industrial products, mechanisms, hardware, electronics and similar tangible inventions. These use applicable Product Design, CAD/engineering, physical prototype and manufacturing work.
- **Software** — apps, SaaS, APIs, web/mobile/desktop software, AI-enabled software products and similar digital inventions. These are first-class InventSmith inventions, not rejected merely because they lack a manufactured object.
- **Hybrid** — connected devices, IoT, wearables and other inventions that combine physical hardware with software. These run both applicable physical and software branches before combined stages are treated as complete.

### Software middle journey

For pure software, the physical stages 5–7 are replaced by the applicable software equivalents:

**Software Product Design → Software Prototype & Build → Software Engineering & Release Readiness**

The minimum software branch includes product specification, UX/user-flow design, architecture, data model/API contracts, security/privacy readiness, prototype strategy, implementation planning, QA/acceptance planning, beta readiness and platform-appropriate distribution/release planning. InventSmith prepares this work autonomously where safe, but it never claims code was implemented, tests passed, a beta ran or a production/app-store release occurred without real execution/deployment evidence.

### Regulated/safety-sensitive inventions

Medical/diagnostic, children's safety, life-safety, structural/load-bearing, automotive/aerospace, regulated electrical/communications, regulated financial/health/privacy software and similar inventions are generally **supported with restrictions**, not blanket-rejected. InventSmith may research, prepare, design and document within its competence while requiring qualified engineering, regulatory, security/privacy, legal, certification or other professional review before gated consequential conclusions or releases.

### Unsupported development

InventSmith does not create a normal invention workspace for concepts whose intended function materially facilitates weapon/destructive capability, malware/credential theft/unauthorized cyberattack, covert/unauthorized surveillance or stalking, fraud/theft/deceptive abuse, or dangerous chemical/biological/radiological weaponization. This is a product-support/safety boundary, not a claim that every rejected concept is illegal.

Ordinary service/business concepts with no new physical, software or hybrid product—such as simply opening a landscaping company—are outside the invention-development workflow and should be routed to an appropriate business-planning product/workflow rather than forced through CAD, patent, prototype or software invention stages.

Classification is stored in the existing structured invention record and uses existing risk-class capacity, preserving migration safety without a destructive production schema migration.