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

The inventor is not expected to know the invention-development process. InventSmith must determine the next useful work from the invention record, evidence, dependencies, confidence, risks, approvals, and professional gates.

The application must not strand an inventor on a stage with no explanation of what comes next. Every invention workspace must make clear:

1. What InventSmith completed.
2. What InventSmith discovered.
3. What evidence changed the assessment.
4. What decision or action requires the inventor.
5. What professional or third party is required, if any.
6. What InventSmith is doing next.
7. What deliverables are available now.
8. What is blocking further progress.

## 3. Persistent invention record and uploaded evidence

The invention record is the source of truth, not chat history.

Inventors must be able to upload and attach evidence and working material throughout the journey, including survey exports, interview notes/transcripts, customer-discovery notes, PDFs, DOCX documents, spreadsheets/CSV data, photographs/reference images, sketches/drawings, prototype photographs/videos/test results, competitor material, patent/prior-art documents, manufacturer quotations, professional reports, existing pitch decks, contracts/legal documents, and other invention-specific evidence.

InventSmith must classify uploaded material, preserve provenance, associate it with the correct invention and work item, extract useful structured facts where appropriate, distinguish inventor-provided evidence from AI-generated analysis, and make the evidence available to relevant downstream departments.

Example: if an inventor uploads results from a 100-person SurveyMonkey study, Validation must be able to incorporate the survey methodology and results into its evidence ledger, confidence assessment, assumptions, findings, and recommendation. It must not treat uploaded evidence as if InventSmith generated it.

Evidence changes must invalidate or refresh affected downstream work when appropriate.

## 4. Validation and research

InventSmith must autonomously perform or coordinate evidence-backed work covering problem validation; customer interviews/surveys and uploaded validation evidence; assumption testing; competitor/product research; customer alternatives; market sizing and segmentation; willingness-to-pay evidence; market trends; prior-art research; patent landscape research; feature-to-prior-art comparison; potential differentiators and alternative embodiments; technical feasibility; materials and manufacturing feasibility; regulatory-readiness screening; preliminary BOM and cost ranges; and development risks/dependencies.

Material claims must remain traceable to sources, inventor evidence, estimates, or explicit AI inference.

## 5. Patent intelligence and IP readiness

Patent and prior-art intelligence is a core part of the product-design loop, not merely a report at the end. Patent research must hand relevant crowded features, differentiating hypotheses, uncertainty and professional-review requirements into Product Design. Product Design must use that information to explore meaningfully different mechanisms/embodiments while never claiming patentability, freedom-to-operate, validity or legal clearance without qualified professional review.

## 6. Product Design + CAD / Engineering

InventSmith must turn the accumulated invention record into evidence-backed design candidates, score/select promising directions, generate a product design specification, create editable native CAD for supported geometry, produce appropriate STEP/STL/DXF and drawing/image artifacts, exploded and dimensioned views, selected-product renders, BOM/cost/manufacturing intent, revision state, assumptions, unresolved engineering, and a professional engineering handoff.

CAD and drawings are preliminary until engineering/prototype evidence validates production-release dimensions, tolerances, materials, fits, sealing, loads, safety and manufacturing details.

## 7. Prototype

InventSmith must prepare prototype strategy, sourcing, test plans, evidence assessment, design-gap analysis and iteration. It must never claim a physical prototype was built/tested from modeled data alone. Physical prototype evidence is a real-world gate.

## 8. Manufacturing

InventSmith must prepare manufacturing-process selection, factory requirements, supplier/manufacturer research, RFQ packages, scorecards, quote comparison, unit economics, agreement checklists and readiness. Real quote comparison requires actual manufacturer/RFQ evidence.

## 9. Branding

InventSmith must support positioning, naming direction, preliminary trademark screening, visual identity direction, packaging principles, brand production briefs and inventor-facing visual concept boards. Trademark clearance and final production artwork remain professional/human gates where appropriate.

## 10. Intellectual Property / Legal

InventSmith must prepare IP strategy, invention disclosure, NDA/legal draft packages, contracting packages, IP status tracking and professional handoffs. It may identify/research appropriate outside professionals but must not represent draft work as legal advice or file/sign/submit legal instruments without the required human/professional authorization.

## 11. Pricing

InventSmith must use accumulated evidence, manufacturing economics, willingness-to-pay information and business assumptions to produce pricing evidence, pricing strategy, break-even analysis and validation plans.

## 12. Marketing and Sales

InventSmith must produce evidence-grounded messaging, channels, plans, assets, prelaunch calendars, sales channels/toolkits, funnel/projection work and post-purchase experience planning.

## 13. Funding and pitch

InventSmith must prepare funding strategy/source research, financial models, investor FAQ/readiness and editable pitch materials grounded in the current invention evidence/design state. Pitch materials must update when material upstream evidence or design decisions change.

## 14. Launch and growth

InventSmith must continue beyond “ready to manufacture” into market execution: launch-readiness planning; coordinated launch checklist; inventory/logistics readiness; sales/marketing activation; early customer feedback intake; uploaded sales/analytics evidence; launch performance analysis; post-launch priority list; 90-day growth audit; growth roadmap; unit-economics updates from actual data; customer-feedback-driven product iteration; and recurring performance reporting.

The journey becomes iterative after launch rather than terminating.

## 15. Documents and deliverables

InventSmith must maintain a visible document/deliverable library for each invention. Depending on journey state, it must be able to generate and version appropriate artifacts such as Idea Brief, Validation Report, evidence summaries, Competitive Landscape, Market Research Summary, Market Size Model, Patent Readiness Report, Prior Art Summary, feature/prior-art comparison, IP/professional handoff brief, Product Design Specification, Design Decision Log, CAD/design package, exploded views/renders, engineering handoff package, prototype plan/test report, BOM/cost model, RFQ/manufacturing package, manufacturer comparison, Brand Identity System, NDA/legal draft packages, IP status tracker, Pricing Strategy, Go-to-Market Plan, Sales Toolkit, Pitch Deck, Financial Model, Funding Strategy, Launch Playbook and Growth reports.

Export formats should match the artifact: PDF/DOCX for documents, PPTX or presentation-compatible output for pitch decks, XLSX/CSV where structured financial/tabular work benefits, and appropriate CAD/image formats for design artifacts.

## 16. Inventor-facing experience

The UI must expose the journey and outputs. Backend implementation alone is not acceptance.

An inventor must be able to see and reach overall journey/stage state; active/completed work; research/evidence; validation; prior art/IP readiness; product design; CAD/3D/design artifacts; prototype work; manufacturing work; legal/professional review requirements; documents/downloads; decisions requiring approval; recommendations/next actions; and Ask InventSmith grounded in the complete invention record.

The interface must not expose only Validation while downstream work exists invisibly in the backend.

## 17. Branding requirement

All current customer-facing surfaces must use **InventSmith**, **The Inventor OS**, and **Modern Methods**. The official InventSmith logo must replace legacy Atlas branding on all current customer-facing surfaces, including public pages, authenticated navigation, headers, auth screens, metadata, manifests/icons where applicable, documents, and generated deliverables.

Legacy Atlas identifiers may remain internally only where required for compatibility.

## 18. Autonomy and approvals

InventSmith should autonomously perform reversible internal work and preparation wherever reasonably safe. The inventor should not be asked to manage departments or manually trigger routine downstream work.

Inventor approval is required before consequential external actions such as spending money; contacting/hiring third parties; sharing confidential information externally; submitting legal/regulatory filings; signing contracts; publishing/launching; placing manufacturing orders; or making irreversible business commitments.

Professional review gates must remain for legal opinions, final legal instruments, production-release engineering where appropriate, regulated/safety-critical decisions, and other work requiring qualified authority.

## 19. Organization-native, multi-invention architecture

InventSmith is organization-native from inception. A single inventor is a one-member organization, not a separate account architecture.

The canonical hierarchy is:

**User → Organization / Company → Memberships → Invention Workspaces**

Every invention belongs to an organization and retains an inventor/creator relationship for attribution and migration compatibility. Existing single-user inventions must be migrated additively into personal organizations without losing ownership, evidence, work, documents, billing history or audit history.

Organizations must support multiple active and archived inventions. Subscription capacity is based primarily on **active invention slots**; archiving a completed/paused invention frees an active slot without deleting its evidence, research, CAD, documents, decisions or history.

Organization membership must be role-aware. The authorization model must support at minimum:

- **Owner** — organization ownership, billing, membership administration, destructive organization-level actions;
- **Admin** — organization/workspace administration subject to owner-only restrictions;
- **Member** — normal invention work according to assigned access;
- **Viewer** — read-only access;
- **Professional / Guest Reviewer** — bounded access to specifically assigned inventions/review material without broad organization/billing visibility.

Permissions must be enforced server-side. UI hiding is never authorization.

Invention-level access must be independently assignable so an outside engineer, patent professional, manufacturer or consultant can be invited to one invention without automatically seeing every other invention owned by the organization.

Billing and entitlements belong to the organization. Organization policy controls active-invention slots, included seats, compute/AI allowance, storage, premium generation and professional/studio capabilities. Resource consumption must be attributable to both organization and invention so Modern Methods can measure real cost-to-serve.

Studio and organization plans must be capable of client/project work. The data/authorization model must be able to evolve to **Organization → Clients → Inventions → Team/Guest access** without replacing the core ownership model.

Account/data export/deletion must become organization-aware. A member leaving an organization must not delete organization-owned inventions. Organization deletion, ownership transfer, billing changes and other destructive organization actions require appropriate owner authorization and preservation rules.

## 20. Pricing and capacity architecture

The target commercial ladder is:

**Explorer $0 → Inventor $39 → Pro $99 → Enterprise $199 → Studio $299+**

Studio must support graduated active-invention capacity rather than one flat unlimited tier. Initial commercial direction to cost/model before final entitlement lock:

- **Studio 3 — $299/month — 3 active inventions**
- **Studio 6 — $399/month — 6 active inventions**
- larger Studio/Custom capacity priced from measured cost-to-serve rather than promised unlimited expensive operations.

These prices are product direction, but exact included seats, AI/compute allowances, storage, premium-generation allowances and larger Studio capacities must be set from measured economics before billing products are treated as final.

Inventor and Pro should be differentiated by useful outcome, not arbitrary token language: Inventor supports serious validation/feasibility/IP-readiness; Pro is the core complete idea-to-market individual plan including Product Design + CAD and downstream lifecycle work. Enterprise/Studio primarily add organization capacity, collaboration, throughput and professional use.

InventSmith must not expose raw model tokens as the primary customer experience. Internally, it must meter estimated cost by organization, invention and expensive operation class so the business can target sustainable gross margin and prevent runaway API/CAD/render/research cost.

## 21. Acceptance definition

InventSmith is not “done” because the repository builds, tests pass, or a deployment returns HTTP 200.

Full product acceptance requires representative end-to-end live verification demonstrating that an inventor can begin with an idea and, as evidence and approvals permit, progress through the complete journey to market with accessible outputs.

At minimum, acceptance must eventually prove correct InventSmith branding/logo; authentication/session persistence; organization creation/personal-organization migration; organization membership/role enforcement; invention-level access isolation; active/archive invention-slot enforcement; organization-scoped billing/entitlements/resource accounting; invention intake/persistent record; upload/evidence ingestion/downstream use; validation; market/competitor research; patent/prior-art intelligence; design candidate generation/selection; concept renders; CAD/3D artifacts; exploded/dimensioned outputs; prototype loop; manufacturing/RFQ workflow; legal/professional routing/drafts; document library/exports; pitch/funding package; pricing/marketing/sales planning; launch/growth workflow; Ask InventSmith grounding; privacy/export/deletion behavior; and transparent confidence/evidence/approval/professional-review gates.

## 22. Build priority from August 16, 2026

Planning/progress reporting must measure the repository and live application against this complete specification. The next implementation program should proceed in dependency order while maximizing useful vertical slices:

1. Introduce additive organization/membership/invention-access schema and personal-organization migration compatibility.
2. Move authorization from direct `invention.userId` ownership checks to organization/invention membership checks while preserving existing owners during migration.
3. Move subscription/entitlement/cost accounting to organization scope and implement active/archive invention capacity.
4. Add organization/team/member management UI and invention-level sharing/guest-review access.
5. Reconcile the new Explorer/Inventor/Pro/Enterprise/Studio pricing model with measured API/CAD/render/research economics before final billing products are locked.
6. Preserve/continue full idea-to-market capability, evidence, CAD, prototype, manufacturing, legal, commercial, funding, launch and growth work.
7. Run full live idea-to-market plus multi-user/multi-invention acceptance and professional review.

No future progress report may describe InventSmith as substantially complete without clearly distinguishing repository implementation from live, physical, professional, organization-security and billing acceptance.