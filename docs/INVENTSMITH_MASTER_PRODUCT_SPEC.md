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

Incremental releases may deliver portions of this journey, but release boundaries must never be mistaken for the final product specification. InventSmith is not complete until the complete idea-to-market operating system below is implemented and acceptance-tested.

## 2. Engine owns progress

The inventor is not expected to know the invention-development process. InventSmith determines the next useful work from the invention record, evidence, dependencies, confidence, risks, approvals and professional gates. Every workspace must make clear what InventSmith completed/discovered, what evidence changed the assessment, what requires the inventor or an outside professional, what happens next, what deliverables are available and what blocks progress.

## 3. Persistent invention record and uploaded evidence

The invention record is the source of truth, not chat history. Inventors must be able to attach evidence and working material throughout the journey, including survey exports, interviews/transcripts, customer-discovery notes, PDFs, DOCX, spreadsheets/CSV, photographs/reference images, sketches/drawings, prototype evidence, competitor material, patent/prior-art documents, manufacturer quotations, professional reports, pitch decks, contracts/legal documents and other invention-specific evidence.

InventSmith classifies uploaded material, preserves provenance, associates it with the correct invention/work item, extracts useful structured facts where appropriate, distinguishes inventor evidence from AI analysis, and makes evidence available downstream. Evidence changes must invalidate or refresh affected downstream work when appropriate.

## 4. Validation, research and patent intelligence

InventSmith autonomously performs or coordinates evidence-backed problem validation, customer research, assumption testing, competitor/alternative research, market sizing/segmentation, willingness-to-pay evidence, market trends, prior art/patent landscape, feature/prior-art comparison, differentiating hypotheses, technical/material/manufacturing feasibility, regulatory-readiness screening, preliminary BOM/cost ranges and development risks/dependencies.

Patent intelligence is part of the Product Design loop. Product Design uses crowded features, differentiating hypotheses and uncertainty to explore meaningfully different mechanisms/embodiments while never claiming patentability, freedom-to-operate, validity or legal clearance without qualified professional review. Material claims remain traceable to sources, inventor evidence, estimates or explicit AI inference.

## 5. Product Design + CAD / Engineering

InventSmith turns the accumulated invention record into evidence-backed design candidates, scores/selects promising directions, generates a product design specification, creates editable native CAD for supported geometry, produces appropriate STEP/STL/DXF and drawing/image artifacts, exploded/dimensioned views, selected-product renders, BOM/cost/manufacturing intent, revision state, assumptions, unresolved engineering and a professional engineering handoff.

CAD/drawings remain preliminary until engineering/prototype evidence validates production-release dimensions, tolerances, materials, fits, sealing, loads, safety and manufacturing details.

## 6. Prototype and Manufacturing

InventSmith prepares prototype strategy, sourcing, test plans, evidence assessment, design-gap analysis and iteration. It never claims a physical prototype was built/tested from modeled data alone. Physical prototype evidence is a real-world gate.

InventSmith prepares manufacturing-process selection, factory requirements, supplier/manufacturer research, RFQ packages, scorecards, quote comparison, unit economics, agreement checklists and readiness. Real quote comparison requires actual manufacturer/RFQ evidence.

## 7. Branding, IP/Legal and commercial execution

InventSmith supports positioning, naming direction, preliminary trademark screening, visual identity/packaging direction and inventor-facing visual concepts. It prepares IP strategy, invention disclosure, NDA/legal draft packages, contracting packages, IP status and professional handoffs without representing drafts as legal advice or filing/signing/submitting without required authorization.

It uses accumulated evidence/economics to produce pricing strategy and validation, marketing plans/assets, sales channels/toolkits, funding strategy/source research, financial models, investor readiness, editable pitch materials, launch planning, logistics readiness, market activation, post-launch evidence intake, performance analysis, growth roadmaps and customer-feedback-driven iteration. The journey becomes iterative after launch rather than terminating.

## 8. Documents and deliverables

InventSmith maintains a visible versioned document/deliverable library. Artifacts may include Idea Brief, Validation Report, evidence summaries, Competitive Landscape, Market Research Summary, Market Size Model, Patent Readiness/Prior Art reports, feature/prior-art comparison, professional handoff, Product Design Specification, Design Decision Log, CAD/design package, engineering handoff, prototype plan/test report, BOM/cost model, RFQ/manufacturing package, manufacturer comparison, Brand Identity System, NDA/legal draft packages, IP status tracker, Pricing Strategy, Go-to-Market Plan, Sales Toolkit, Pitch Deck, Financial Model, Funding Strategy, Launch Playbook and Growth reports.

Export formats match the artifact: PDF/DOCX, PPTX/presentation-compatible, XLSX/CSV and appropriate CAD/image formats.

## 9. Inventor-facing experience and branding

The UI exposes the journey and outputs; backend-only implementation is not acceptance. Inventors can reach journey/stage state, active/completed work, research/evidence, validation, prior art/IP readiness, Product Design, CAD/design artifacts, prototype/manufacturing/legal/professional work, documents/downloads, decisions/approvals, recommendations/next actions and Ask InventSmith grounded in the complete invention record.

All current customer-facing surfaces use **InventSmith**, **The Inventor OS** and **Modern Methods**. Legacy Atlas identifiers may remain internally only where compatibility requires them.

## 10. Autonomy and approvals

InventSmith autonomously performs reversible internal work/preparation wherever reasonably safe. Inventors are not asked to manage departments or manually trigger routine downstream work.

Approval is required before consequential external actions such as spending money, contacting/hiring third parties, sharing confidential information externally, legal/regulatory submission, signing contracts, publishing/launching, manufacturing orders or irreversible business commitments. Professional review gates remain for legal opinions/final instruments, production-release engineering where appropriate, regulated/safety-critical decisions and other qualified-authority work.

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

Inventor supports serious validation/feasibility/IP-readiness. Pro is the core complete idea-to-market individual plan including Product Design + CAD and downstream lifecycle work. Enterprise/Studio add organization capacity, collaboration, throughput and professional use.

Exact included seats, AI/compute allowances, storage, premium-generation allowances and larger Studio capacity are set from measured economics before billing products are final. InventSmith does not expose raw model tokens as the primary customer experience. Internally it meters cost by organization, invention and operation class to support sustainable gross margin and prevent runaway API/CAD/render/research cost.

Measured cost-to-serve should distinguish normal, heavy, worst-reasonable and overlapping multi-invention Studio workloads. Internal provider/model economics are operational business intelligence and need not be visible to ordinary collaborators.

## 13. Acceptance definition

InventSmith is not done because the repository builds, tests pass or a deployment returns HTTP 200. Full product acceptance requires representative end-to-end live verification demonstrating progression from idea toward market as evidence/approvals permit.

Acceptance must eventually prove branding/logo; authentication/session persistence; organization creation/personal migration; invitation consent and identity safety; membership/role enforcement; invention-level isolation; active/archive slot enforcement; organization billing/entitlements/resource accounting; intake/persistent record; upload/evidence ingestion/downstream use; validation; market/competitor research; patent/prior-art intelligence; design candidate generation/selection; renders; CAD/3D/exploded/dimensioned outputs; prototype loop; manufacturing/RFQ; legal/professional routing/drafts; document exports; pitch/funding; pricing/marketing/sales; launch/growth; Ask InventSmith grounding; privacy/export/deletion; and transparent confidence/evidence/approval/professional gates.

Repository implementation, live runtime acceptance, physical-world evidence and professional review are distinct completion dimensions and must be reported separately.

## 14. Current build priority — August 16, 2026

The organization schema, organization authorization foundation, active/archive capacity, shared organization usage ledger, organization entitlement/billing foundation, privacy/export/deletion boundaries, cost-unit attribution/scenario reporting and safe consent-based invitation foundation are now materially implemented on the full-product branch.

Immediate dependency order is therefore:

1. Verify the newest branch head through the complete CI stack and repair any failures.
2. Finish targeted specialized accounting/legacy creator-authorization audit.
3. Complete invitation/sharing edge-case acceptance while preserving verified-email identity safety.
4. Collect/calibrate representative provider/runtime cost-to-serve data.
5. Lock seats/storage/compute/premium-generation allowances from measured economics.
6. Reconcile external billing products and public/account pricing to the locked entitlement policy.
7. Run complete repository acceptance.
8. Only after GitHub implementation is complete, pin it for MadeThis replication and run live authenticated multi-user/multi-invention acceptance.

No future progress report may describe InventSmith as substantially complete without clearly distinguishing repository implementation from live, physical, professional, organization-security and billing acceptance.