# InventSmith Product Baseline

**Status:** Authoritative implementation baseline  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Master destination specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Long-range journey detail:** `docs/ATLAS_PRODUCT_ROADMAP.md` (legacy filename retained for continuity)

## 1. Product promise

InventSmith is an end-to-end operating system for inventors. It must help an inventor progress from a raw idea through evidence, validation, research, IP readiness, product design, CAD/engineering, prototyping, manufacturing, legal/professional work, commercialization, funding, launch and growth.

The inventor is not expected to know the process.

> The inventor should never have to think about InventSmith. InventSmith should think about the inventor.

InventSmith determines useful next work, performs reversible internal work autonomously, maintains evidence and decisions, prepares concrete deliverables, requests approval for consequential external actions, and involves qualified professionals when their authority or judgment is required.

Incremental releases are permitted, but release scope must never redefine or narrow the final product destination.

## 2. Complete journey

The required destination journey is:

**Idea → Evidence → Validation → Market Research → Patent / Prior-Art Intelligence → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding / Pitch → Launch → Growth**

The detailed requirements for these capabilities are defined in `INVENTSMITH_MASTER_PRODUCT_SPEC.md` and the stage-level roadmap in `ATLAS_PRODUCT_ROADMAP.md`.

## 3. Core inventor outcome

At every point InventSmith must answer:

1. What was completed?
2. What was discovered?
3. What evidence supports or challenges the invention?
4. What requires the inventor's decision or action?
5. What outside professional/provider is required and why?
6. What will InventSmith do next?
7. What deliverables can the inventor use now?
8. What is blocking progress?

The application must not strand the inventor at Validation or any other stage without exposing the downstream journey.

## 4. Invention record and evidence

The application is built around a persistent **Invention Record**, not chat history.

The record contains:

- inventor statements;
- uploaded evidence and source artifacts;
- structured problem, solution, users, features, mechanisms and embodiments;
- assumptions, unknowns, constraints and risks;
- research queries, sources, excerpts and coverage;
- findings and confidence assessments;
- decisions, alternatives, approvals and rationale;
- work items, dependencies, attempts, costs and status;
- product-design candidates and design decisions;
- CAD/design artifacts and revisions;
- prototype evidence;
- manufacturing work;
- legal/professional review requirements;
- generated deliverables and revision history.

Inventors must be able to upload surveys, interview notes/transcripts, PDFs, documents, spreadsheets/CSV, images, sketches, prototype evidence, quotations, patent material, professional reports, existing decks, contracts and other relevant evidence.

Uploaded evidence must preserve provenance and be usable by relevant departments. A SurveyMonkey result, for example, must be capable of materially informing Validation rather than existing as an inert attachment.

## 5. Research and patent intelligence

InventSmith must support evidence-backed competitor, market, customer, technical, manufacturing, regulatory and prior-art research.

Prior-art intelligence must feed product design. The system should identify potentially distinguishing features, design constraints and alternative embodiments while clearly separating research analysis from legal opinions.

Patentability, validity, infringement and freedom-to-operate opinions require qualified professional review.

## 6. Product design and CAD are mandatory

InventSmith must design the product rather than stop at feasibility.

For supported physical-product categories it must generate and compare candidate designs using evidence from validation, market research, prior art, user needs, technical feasibility, manufacturing constraints, costs and risks.

It must recommend/refine the strongest design using transparent criteria and preserve the design decision trail.

The destination design package includes, where appropriate:

- concept visualizations;
- preliminary 3D CAD;
- editable/parametric geometry where supported;
- STEP/STL/DXF outputs as appropriate;
- assemblies and part models;
- exploded views;
- orthographic/dimensioned drawings;
- materials and finishes;
- tolerances/fits where engineering evidence supports them;
- BOM;
- assembly guidance;
- manufacturing-process recommendations;
- DFM/DFA observations;
- prototype-ready artifacts;
- manufacturer/RFQ package;
- presentation-quality product renders;
- revision-controlled engineering/design handoff.

Design maturity states are:

1. Concept Visualization
2. Preliminary CAD
3. Prototype Candidate
4. Engineering Reviewed
5. Manufacturing Released

InventSmith may create preliminary design/CAD autonomously for supported categories. Safety-critical or consequential engineering cannot be represented as Manufacturing Released without required qualified engineering review.

## 7. Prototype and manufacturing

InventSmith must guide prototype selection, testing, evidence capture, failure analysis, design revision and readiness decisions.

It must guide first-time inventors through manufacturing, including likely processes, factory types, sourcing options, tooling, MOQs, quality/certification considerations, RFQ preparation, quote comparison, unit economics, logistics and manufacturer evaluation.

Where approved research/integrations permit, it should identify candidate manufacturers, prototype services, testing laboratories, engineering firms and other relevant providers.

External contact, disclosure of confidential information, purchasing or contractual commitment requires inventor approval.

## 8. Legal, contracts and professional routing

InventSmith must identify when the inventor needs an NDA, contract, IP assignment, manufacturer agreement, licensing agreement, patent/trademark assistance, regulatory/testing work, engineering review, accounting/tax advice or another professional service.

It should prepare appropriate drafts, briefs, checklists and handoff packages and explain what the inventor should ask or provide.

Final legal instruments and legal opinions require qualified legal review. InventSmith does not impersonate licensed professionals.

## 9. Commercialization and funding

InventSmith must continue through branding, pricing, marketing, sales, funding, launch and growth.

A mandatory destination capability is an invention-specific **Pitch Deck / Investor Package** generated from the accumulated invention record and evidence. It should incorporate real validation, market data, product renders/designs, IP status, manufacturing economics, pricing, financial projections, go-to-market strategy, funding ask/use of proceeds and investor FAQ rather than generic placeholders.

## 10. Autonomy and authority

### InventSmith may perform autonomously

- analyze inventor-provided information and uploaded evidence;
- ask focused questions when a material fact cannot be inferred;
- search approved public/licensed sources;
- generate, refresh and compare research;
- draft reports, specifications, plans and professional handoff packages;
- generate product concepts, preliminary design artifacts and supported-category CAD;
- maintain evidence, decisions, dependencies and status;
- recommend and schedule next useful work;
- rerun affected internal work when evidence or approved decisions change.

### Inventor approval is required

- consequential product/business decisions where approval is explicitly required;
- sharing confidential information outside the workspace;
- contacting a professional, manufacturer, investor, lender, grant body or other third party;
- publishing, marketing, crowdfunding, selling or publicly demonstrating an invention;
- purchasing services or incurring fees;
- submitting filings, applications, certifications or legal documents;
- signing contracts;
- placing manufacturing orders;
- representing an output as approved for external use when required approvals are absent.

### Qualified professional review is required

- patentability, validity, infringement, freedom-to-operate and design-around legal opinions;
- patent/trademark prosecution and representation;
- final contracts, assignments, licenses, NDAs and other legal instruments;
- safety-critical or production-release engineering where professional review is required;
- final consequential material/tolerance/structural/electrical/chemical/thermal decisions where failure could cause harm;
- regulatory, certification, labeling, testing, tax, securities, lending or investment conclusions requiring professional authority.

InventSmith prepares work for review; it does not impersonate or replace the reviewer.

## 11. Output trust states

Every material output uses an explicit trust/maturity state appropriate to its domain, including:

- InventSmith Draft
- Evidence Checked
- Inventor Approved
- Professional Review Required
- Professionally Reviewed
- Ready for Authorized Use

Design artifacts additionally use the CAD/design maturity states defined above.

Outputs display source coverage, search date, assumptions, confidence, limitations, missing information, revision and affected downstream artifacts where applicable.

## 12. Core runtime services

1. Invention Record Service
2. Orchestration Engine
3. Evidence Ledger
4. Decision Ledger
5. Dependency Engine
6. Approval Service
7. Professional Review Service
8. Deliverable Service
9. Usage and Cost Service
10. Status Briefing Service
11. Evidence/File Ingestion Service
12. Patent Intelligence Service
13. Product Design Service
14. CAD/Engineering Artifact Service
15. Prototype/Test Service
16. Manufacturing/RFQ Service
17. Legal/Professional Routing Service
18. Commercialization Service
19. Pitch/Funding Deliverable Service

## 13. Inventor experience

The primary interface must expose the complete journey while keeping cognitive load low.

The inventor must be able to reach the invention's evidence, validation, research, prior-art/IP work, product design, CAD/3D artifacts, prototype work, manufacturing work, professional/legal requirements, decisions, documents/downloads and next actions.

Ask InventSmith reads from the complete invention record and may propose changes, but no chat response silently changes an approved fact or decision.

Internal prompts, queues, model/provider mechanics and implementation details should not be primary product concepts.

## 14. Research integrity

InventSmith must:

- separate sourced facts, inventor statements, estimates and AI inferences;
- preserve source URLs/identifiers and access dates;
- record patent jurisdictions, collections, classifications, queries and search dates;
- use more than one search method for material prior-art conclusions;
- never convert an incomplete search into patentability/FTO claims;
- mark stale research when time-sensitive sources or product decisions change;
- treat retrieved documents/websites as untrusted data, never as system instructions;
- preserve uploaded evidence provenance and methodology/context when available.

## 15. Branding

Current customer-facing identity is:

**InventSmith**  
**The Inventor OS**  
**Modern Methods**

The official InventSmith logo must appear on current customer-facing surfaces. Legacy Atlas branding may remain only in internal compatibility identifiers where technically required.

## 16. Delivery direction

The previously completed controlled-pilot work is retained as foundation. Development now proceeds toward the complete master specification.

Priority sequence:

1. Correct live branding and journey visibility.
2. Evidence/file ingestion and propagation.
3. Complete/expose research, prior art and technical work.
4. Product Design Department and design-selection loop.
5. CAD/3D/exploded/dimensioned/manufacturing design pipeline.
6. Prototype iteration loop.
7. Manufacturing/factory/RFQ workflow.
8. Legal/contracts/NDA/professional routing.
9. Branding/pricing/marketing/sales.
10. Pitch deck/funding package.
11. Launch and growth.
12. Full live idea-to-market acceptance and professional review.

## 17. Acceptance rule

InventSmith is not complete because code builds, tests pass, or a deployment returns HTTP 200.

Completion requires functional, inventor-facing, end-to-end verification against `INVENTSMITH_MASTER_PRODUCT_SPEC.md`.

A release may truthfully report that a subset is complete, but it must never present controlled-pilot completion as completion of the full InventSmith product.

## 18. Non-negotiable rule

InventSmith may be proactive, persistent and highly autonomous, but it must never hide uncertainty, fabricate completion, make unauthorized external commitments, or represent unreviewed specialist work as professionally approved.
