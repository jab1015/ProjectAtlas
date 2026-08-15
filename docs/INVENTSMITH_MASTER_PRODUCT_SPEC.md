# InventSmith Master Product Specification

**Status:** Authoritative product destination  
**Product:** InventSmith — The Inventor OS  
**Publisher:** Modern Methods  
**Updated:** August 15, 2026

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

Inventors must be able to upload and attach evidence and working material throughout the journey, including at minimum:

- survey exports and SurveyMonkey results;
- interview notes and transcripts;
- customer-discovery notes;
- PDFs;
- DOCX documents;
- spreadsheets/CSV data;
- photographs and reference images;
- sketches and drawings;
- prototype photographs/videos and test results;
- competitor material;
- patent/prior-art documents;
- manufacturer quotations;
- professional reports;
- existing pitch decks;
- contracts and legal documents;
- other invention-specific evidence.

InventSmith must classify uploaded material, preserve provenance, associate it with the correct invention and work item, extract useful structured facts where appropriate, distinguish inventor-provided evidence from AI-generated analysis, and make the evidence available to relevant downstream departments.

Example: if an inventor uploads results from a 100-person SurveyMonkey study, Validation must be able to incorporate the survey methodology and results into its evidence ledger, confidence assessment, assumptions, findings, and recommendation. It must not treat uploaded evidence as if InventSmith generated it.

Evidence changes must invalidate or refresh affected downstream work when appropriate.

## 4. Validation and research

InventSmith must autonomously perform or coordinate evidence-backed work covering:

- problem validation;
- customer interviews/surveys and uploaded validation evidence;
- assumption testing;
- competitor/product research;
- customer alternatives;
- market sizing and segmentation;
- willingness-to-pay evidence;
- market trends;
- prior-art research;
- patent landscape research;
- feature-to-prior-art comparison;
- potential differentiators and alternative embodiments;
- technical feasibility;
- materials and manufacturing feasibility;
- regulatory-readiness screening;
- preliminary BOM and cost ranges;
- development risks and dependencies.

Material claims must remain traceable to sources, inventor evidence, estimates, or explicit AI inference.

## 5. Patent intelligence and IP readiness

Patent and prior-art intelligence is a core part of the product-design loop, not merely a report at the end.

InventSmith must:

- search relevant patent/prior-art sources using multiple strategies;
- preserve search terms, jurisdictions, classifications, dates, sources, and coverage;
- compare invention features/mechanisms against relevant references;
- identify potentially distinguishing features and alternative embodiments;
- identify design constraints and design-around opportunities without presenting them as legal opinions;
- produce an attorney-ready IP/prior-art handoff;
- identify when qualified patent counsel is required;
- track IP decisions and deadlines.

InventSmith must never claim patentability, freedom to operate, validity, infringement, or legal clearance without qualified professional review.

## 6. Product design is mandatory

InventSmith must not stop at feasibility. It must design the product.

Product design must use the invention record, validation evidence, market/competitor research, prior art, user needs, cost targets, manufacturing constraints, safety/regulatory constraints, and inventor decisions to develop candidate designs.

The system must:

1. Generate multiple viable design directions where appropriate.
2. Explain the trade-offs between candidates.
3. Score candidates using evidence-backed criteria such as user fit, differentiation, technical feasibility, manufacturability, estimated cost, prior-art constraints, maintainability, safety, and commercial potential.
4. Select or recommend the strongest candidate rather than arbitrarily choosing a design.
5. Refine the selected candidate iteratively as new evidence, prototype results, engineering review, cost data, or professional input arrives.
6. Preserve a design decision log showing alternatives, evidence, trade-offs, and rationale.

A probability/confidence score may guide decisions, but InventSmith must not represent commercial success as guaranteed or statistically proven when the underlying evidence cannot support that claim.

## 7. CAD, 3D design, engineering and manufacturing package

CAD and engineering outputs are mandatory destination capabilities.

For supported physical-product categories, InventSmith must progress from concept to a manufacturable design package and produce or coordinate generation of appropriate artifacts, including:

- preliminary 3D CAD;
- parametric or editable geometry where supported;
- STEP files where appropriate;
- STL files for prototype/3D-print use where appropriate;
- DXF/2D manufacturing geometry where appropriate;
- assembly models;
- individual part models;
- exploded assembly views;
- orthographic views;
- dimensioned drawings;
- key tolerances and fits where engineering evidence supports them;
- materials specifications;
- finish specifications;
- fasteners/components;
- preliminary and refined BOM;
- assembly sequence;
- manufacturing-process recommendations;
- DFM/DFA observations;
- prototype-ready files;
- manufacturer/RFQ package;
- revision-controlled design files;
- high-quality 3D product renders for presentations, pitch decks, marketing, and manufacturer communication.

Design maturity must be explicit:

1. Concept Visualization
2. Preliminary CAD
3. Prototype Candidate
4. Engineering Reviewed
5. Manufacturing Released

InventSmith may generate CAD and manufacturing-preparation artifacts autonomously within supported categories, but it must not label safety-critical or consequential engineering as **Manufacturing Released** until required qualified engineering review is recorded.

The system must clearly distinguish an AI-generated/preliminary CAD package from an engineering-reviewed factory release.

## 8. Prototype loop

InventSmith must help the inventor move from design into physical validation by producing:

- prototype strategy;
- recommended prototype type;
- prototype sourcing/process recommendations;
- prototype test plan;
- measurable pass/fail criteria;
- uploaded prototype evidence intake;
- prototype test report;
- failure/root-cause analysis;
- prototype-to-spec gap analysis;
- revised design requirements;
- CAD/design revision work items;
- readiness recommendation for the next prototype or manufacturing step.

Prototype evidence must feed back into design, validation, costs, risks, and downstream documents.

## 9. Manufacturing and factories

InventSmith must teach and guide a first-time inventor through manufacturing rather than merely say “contact a manufacturer.”

It must determine and explain:

- likely manufacturing processes;
- suitable manufacturer/factory types;
- domestic vs. overseas trade-offs;
- expected tooling and setup requirements;
- target production volumes and MOQs;
- quality/certification considerations;
- information a factory needs;
- RFQ package contents;
- questions to ask factories;
- red flags and qualification criteria;
- quote-comparison methodology;
- landed-cost considerations;
- tooling ownership considerations;
- quality-control/testing requirements;
- logistics and lead-time considerations.

Where integrations or approved external research permit, InventSmith should identify candidate manufacturers, prototyping services, testing laboratories, engineering firms, and other relevant providers. Contacting or committing to a third party requires inventor approval.

InventSmith must produce manufacturer-ready RFQ packages and help compare quotations using consistent evidence-backed criteria.

## 10. Legal, contracts, NDAs and professional routing

InventSmith must recognize when the inventor needs legal or professional assistance and explain why, what type of professional is needed, what to send them, what to ask, and what decision depends on that review.

The system must support preparation and tracking of appropriate draft/review packages for matters including:

- NDAs;
- contractor agreements;
- invention/IP assignment agreements;
- manufacturer agreements;
- licensing agreements;
- confidentiality/trade-secret documentation;
- provisional/utility/design patent preparation handoff;
- trademark preparation;
- business/entity questions;
- regulatory/testing/certification engagement;
- professional engineering review;
- accounting/tax/financial professional review where relevant;
- investor/securities counsel where relevant.

InventSmith may draft preparatory documents and checklists but must clearly identify documents requiring attorney or other qualified professional review before authorized use. It must not impersonate an attorney, engineer, accountant, regulator, or other licensed professional.

## 11. Professional and third-party recommendations

The inventor should not need to know whom to hire.

InventSmith must identify the type of outside expertise required at the appropriate time, such as:

- patent attorney/patent agent;
- trademark attorney;
- product/industrial designer;
- mechanical/electrical/firmware engineer;
- materials specialist;
- regulatory consultant;
- testing/certification laboratory;
- prototyping service;
- manufacturer/factory;
- tooling provider;
- packaging specialist;
- freight/logistics provider;
- accountant/tax professional;
- insurance professional;
- marketing/branding specialist;
- retail/distribution specialist;
- grant/funding specialist;
- investor or lender category.

Where data/integrations permit, InventSmith should recommend specific candidate providers with evidence for fit. It must not contact, share confidential information with, hire, purchase, file, or commit without inventor approval.

## 12. Branding, pricing, marketing and sales

InventSmith must support the commercial path with deliverables including:

- product naming and preliminary clearance research;
- brand positioning;
- brand identity/visual direction;
- messaging architecture;
- pricing analysis;
- unit economics;
- break-even analysis;
- go-to-market plan;
- channel strategy;
- content/marketing plan;
- sales strategy;
- product one-pager;
- FAQ and objection handling;
- competitor comparison;
- sales projections;
- launch assets and readiness checklist.

## 13. Funding and pitch package

Pitch-deck creation is a mandatory destination capability.

InventSmith must use the accumulated invention record—not generic placeholders—to produce an investor/funding package including:

- pitch deck populated with invention-specific evidence;
- problem/solution narrative;
- product design and high-quality renders;
- exploded/technical views where useful;
- validation evidence;
- market size and competitive landscape;
- IP status and defensibility framing with appropriate limitations;
- business model;
- manufacturing/unit economics;
- pricing/margins;
- go-to-market strategy;
- financial projections;
- funding ask and use of proceeds;
- milestone plan;
- investor FAQ;
- funding-source strategy;
- grant opportunities where applicable.

Pitch materials must update when material upstream evidence or design decisions change.

## 14. Launch and growth

InventSmith must continue beyond “ready to manufacture” into market execution:

- launch-readiness planning;
- coordinated launch checklist;
- inventory/logistics readiness;
- sales/marketing activation;
- early customer feedback intake;
- uploaded sales/analytics evidence;
- launch performance analysis;
- post-launch priority list;
- 90-day growth audit;
- growth roadmap;
- unit-economics updates from actual data;
- customer-feedback-driven product iteration;
- recurring performance reporting.

The journey becomes iterative after launch rather than terminating.

## 15. Documents and deliverables

InventSmith must maintain a visible document/deliverable library for each invention. Depending on journey state, it must be able to generate and version appropriate artifacts such as:

- Idea Brief
- Validation Report
- survey/interview evidence summaries
- Competitive Landscape
- Market Research Summary
- Market Size Model
- Patent Readiness Report
- Prior Art Summary
- feature/prior-art comparison
- IP/professional handoff brief
- Product Design Specification
- Design Decision Log
- CAD/design package
- exploded views and renders
- engineering handoff package
- prototype plan/test report
- BOM/cost model
- RFQ/manufacturing package
- manufacturer comparison
- Brand Identity System
- NDA/legal draft packages
- IP status tracker
- Pricing Strategy
- Go-to-Market Plan
- Sales Toolkit
- Pitch Deck
- Financial Model
- Funding Strategy
- Launch Playbook
- Growth reports

Export formats should match the artifact: PDF/DOCX for documents, PPTX or presentation-compatible output for pitch decks, XLSX/CSV where structured financial/tabular work benefits, and appropriate CAD/image formats for design artifacts.

## 16. Inventor-facing experience

The UI must expose the journey and outputs. Backend implementation alone is not acceptance.

An inventor must be able to see and reach:

- overall journey/stage state;
- active work;
- completed work;
- research and evidence;
- validation;
- prior art/IP readiness;
- product design;
- CAD/3D/design artifacts;
- prototype work;
- manufacturing work;
- legal/professional review requirements;
- documents/downloads;
- decisions requiring approval;
- recommendations and next actions;
- Ask InventSmith grounded in the complete invention record.

The interface must not expose only Validation while downstream work exists invisibly in the backend.

## 17. Branding requirement

All current customer-facing surfaces must use:

**InventSmith**  
**The Inventor OS**  
**Modern Methods**

The official InventSmith logo must replace legacy Atlas branding on all current customer-facing surfaces, including public pages, authenticated navigation, headers, auth screens, metadata, manifests/icons where applicable, documents, and generated deliverables.

Legacy Atlas identifiers may remain internally only where required for compatibility.

## 18. Autonomy and approvals

InventSmith should autonomously perform reversible internal work and preparation wherever reasonably safe. The inventor should not be asked to manage departments or manually trigger routine downstream work.

Inventor approval is required before consequential external actions such as:

- spending money;
- contacting or hiring third parties;
- sharing confidential information externally;
- submitting legal/regulatory filings;
- signing contracts;
- publishing/launching;
- placing manufacturing orders;
- making irreversible business commitments.

Professional review gates must remain for legal opinions, final legal instruments, production-release engineering where appropriate, regulated/safety-critical decisions, and other work requiring qualified authority.

## 19. Acceptance definition

InventSmith is not “done” because the repository builds, tests pass, or a deployment returns HTTP 200.

Full product acceptance requires representative end-to-end live verification demonstrating that an inventor can begin with an idea and, as evidence and approvals permit, progress through the complete journey to market with accessible outputs.

At minimum, acceptance must eventually prove:

- correct InventSmith branding and logo;
- authentication/session persistence;
- invention intake and persistent record;
- upload/evidence ingestion and downstream use;
- validation using uploaded and researched evidence;
- market/competitor research;
- patent/prior-art intelligence;
- design candidate generation and selection;
- concept renders;
- CAD/3D artifacts for supported categories;
- exploded/dimensioned design outputs;
- prototype loop;
- manufacturing/RFQ workflow;
- legal/professional routing and draft packages;
- document library and exports;
- pitch deck/funding package;
- pricing/marketing/sales planning;
- launch/growth workflow;
- Ask InventSmith grounding;
- subscription/entitlement behavior;
- privacy/export/deletion behavior;
- transparent confidence, evidence, approvals, and professional-review gates.

## 20. Build priority from August 15, 2026

The current controlled-pilot implementation is a foundation, not the finished product.

Effective immediately, planning and progress reporting must measure the repository and live application against this complete specification. Work must prioritize closing the gap between the current feasibility-oriented build and the full idea-to-market InventSmith destination.

The next implementation program should proceed in dependency order while maximizing useful vertical slices:

1. Correct InventSmith branding and journey/navigation visibility.
2. Complete evidence/file upload ingestion and evidence propagation.
3. Expose and complete research, market, prior-art/IP and technical work in the inventor UI.
4. Build the Product Design Department and evidence-backed design-selection loop.
5. Build supported-category CAD/3D generation, exploded views, engineering artifacts, and revision control.
6. Build prototype evidence/iteration workflow.
7. Build manufacturing/factory/RFQ/provider workflow.
8. Build legal/contracts/NDA/professional-routing workflow.
9. Complete branding/pricing/marketing/sales stages.
10. Build pitch-deck/funding generation using accumulated evidence and design artifacts.
11. Complete launch and growth stages.
12. Run full live idea-to-market acceptance and professional review.

No future progress report may describe InventSmith as substantially complete based only on the controlled-pilot subset without clearly distinguishing controlled-pilot readiness from completion of this master product specification.
