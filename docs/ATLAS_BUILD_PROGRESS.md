# InventSmith Build Progress

**Last updated:** August 15, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Active build branch:** `inventsmith/full-product-build` / draft PR #24

## Product destination

InventSmith is measured against the complete inventor journey:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding / Pitch → Launch → Growth**

The inventor should not have to understand or manually manage this process. InventSmith must know what comes next, perform reversible internal work autonomously, preserve evidence provenance, coordinate department dependencies, and request the smallest genuine human/professional/physical gate only when required.

The retired controlled-pilot 80% figure must never be used as overall InventSmith completion.

## Repository implementation checkpoint — August 15, 2026

The full-product branch now materially exceeds the old feasibility-only baseline. Implemented code includes:

- inventor Evidence Locker using Convex storage and canonical evidence provenance;
- direct Evidence Locker routing when the briefing asks the inventor for a survey, interview, test result, quote, report, or other evidence file;
- downstream evidence-impact/staleness propagation;
- engine-owned 15-stage Journey Center and department routes;
- dedicated inventor-facing Market Research workspace exposing research outputs, sources, confidence, coverage, stale state, and inventor evidence;
- dedicated inventor-facing Patent Readiness workspace exposing prior art, feature comparison, distinguishing hypotheses, sources, trust state, and the Patent → Design handoff;
- full journey work definitions and executable lifecycle departments;
- evidence-backed Product Design candidate generation, scoring, selection and specification;
- native preliminary CAD pipeline;
- deterministic STEP, STL and DXF artifact generation for supported geometry;
- expanded native CAD geometry including tapered/frustum forms, custom-profile extrusion, and real helical externally threaded cylinders in addition to boxes, cylinders and hollow tubes;
- editable InventSmith CAD source;
- orthographic engineering views and exploded assembly views;
- complete six-artifact CAD package visibility/downloads in the Design Studio rather than hiding orthographic/exploded outputs;
- dedicated selected-product presentation rendering grounded in Product Design/CAD state;
- explicit CAD/design maturity and professional-review gating;
- prototype strategy, sourcing, test planning, evidence assessment, design-gap analysis and readiness;
- manufacturing process planning, factory requirements, manufacturer research, RFQ package, scorecard, quote comparison, unit economics, agreement checklist and readiness;
- branding/positioning/name/trademark-screen/identity/asset-brief work;
- removal of legacy Atlas `logo.svg` and `logo-mark.svg` public assets so a deployment/replication cannot accidentally reuse the former customer-facing mark;
- regression protection requiring the approved InventSmith `Logo.png` asset and preventing legacy Atlas logo assets from returning;
- IP strategy, invention disclosure, NDA draft package, contracting package, IP status tracking and legal-professional handoff;
- professional-service planning that identifies which outside specialties are actually required, why, when, what to send, what to ask, and what to verify;
- evidence-backed research of specific candidate professional/service providers without contacting, hiring, spending, filing or disclosing confidential material;
- pricing evidence, pricing strategy, break-even and validation planning;
- marketing messaging, channels, plan, assets and prelaunch calendar;
- sales channels, toolkit, funnel, projections and post-purchase experience;
- funding strategy/source research, financial model, investor FAQ and funding readiness;
- editable native PowerPoint pitch-deck generation from invention-specific evidence;
- automatic embedding of the current generated product render into the pitch deck when available;
- inventor-facing artifact download support for PowerPoint, CAD, images and other stored artifacts;
- launch readiness/playbook/customer-feedback/performance/priorities;
- growth audit/levers/roadmap/retention/performance reporting;
- Ask InventSmith project-wide grounding across work, dependencies, evidence, deliverables, decisions, approvals, reviews, execution events, validation and journey state;
- live-web routing for patent-status/current-research questions;
- regression protection for cross-department verification, Market/Patent workspace routing, full-journey scope, evidence ingestion, expanded/threaded CAD geometry, complete CAD artifact visibility, pitch-deck generation, entitlement, professional routing and professional-review policy.

## Mandatory capability matrix

| Capability | Repository state | Remaining acceptance work |
|---|---|---|
| Idea intake and persistent invention record | Implemented foundation | End-to-end live acceptance |
| Evidence/file upload | Implemented on full-product branch | Expand structured extraction beyond CSV/text; live representative-file acceptance |
| Validation | Implemented foundation | Verify uploaded evidence materially affects validation correctly |
| Market/competitor research | Implemented foundation + dedicated Market Research workspace | Full-journey live acceptance |
| Patent/prior-art intelligence | Implemented foundation + dedicated Patent Readiness workspace + project-wide Ask grounding | Verify current patent-status refresh, design constraints and professional handoff on representative inventions |
| Product design | Implemented on full-product branch | Verify patent/research constraints flow into candidate scoring and selected design |
| CAD/3D design | Native preliminary STEP/STL/DXF generation implemented with box/cylinder/tube/frustum/custom convex extrusion/helical threaded-cylinder geometry | Continue expanding representative geometry/interfaces; engineering/prototype/live acceptance before manufacturing release |
| Product renders | Dedicated generated selected-product presentation render implemented | Live visual-quality acceptance and multi-view/technical-image expansion |
| Exploded/orthographic views | Implemented and visible/downloadable in Design Studio | Live visual/download acceptance; dimension/tolerance maturity must remain evidence-backed |
| Engineering package | Foundation + CAD/design outputs implemented | Complete engineering-review acceptance and revision loop |
| Prototype loop | Lifecycle department implemented | Physical prototype evidence remains a genuine human/real-world gate |
| Manufacturing/factory guidance | Lifecycle department implemented | Verify real sourcing/RFQ/quote workflows and professional/financial gates |
| Legal/contracts/NDAs | Lifecycle department implemented | Professional/legal review required where applicable |
| Professional routing | Service plan + provider research implemented | Live provider-research/handoff UX acceptance |
| Branding | Lifecycle department implemented; old Atlas SVG assets removed | Asset-generation/live UX acceptance |
| Pricing | Lifecycle department implemented | Real cost/market evidence acceptance |
| Marketing | Lifecycle department implemented | Asset/export/live UX acceptance |
| Sales | Lifecycle department implemented | Live UX and real-data acceptance |
| Pitch deck/funding | Editable native PPTX generation implemented, including available product-render embedding | Live investor-package acceptance; richer technical imagery and financial presentation polish |
| Launch | Lifecycle department implemented | Live/real-world launch acceptance |
| Growth | Lifecycle department implemented | Requires real post-launch data for final functional acceptance |
| Documents/exports | PDF/DOCX foundation + PPTX + CAD/image artifact downloads | Expand structured financial/tabular exports and remaining artifact-specific formats |
| Ask InventSmith | Project-wide operational context implemented | Live authenticated conversational acceptance |
| Correct InventSmith branding | Approved `Logo.png` is canonical; legacy Atlas public SVG assets removed and regression-protected | Final live replication/acceptance after GitHub build is complete |

## CAD and manufacturing-release rule

InventSmith must design the product, not stop at feasibility or concept imagery. For supported physical products it must progress through real geometry and engineering artifacts.

Current native CAD supports deterministic assemblies built from boxes, cylinders, hollow tubes, tapered/frustum forms, custom-profile convex extrusions, and externally threaded helical cylinders and emits STEP/STL/DXF, editable source, orthographic views and exploded views. This is a real CAD foundation but not permission to call every generated design factory-released.

Thread pitch, thread depth, mating clearance, wear, sealing surfaces, tolerance stack-up and other critical interface dimensions must remain provisional unless supported by engineering evidence. Threaded interfaces require mating-part/clearance review and prototype testing before production release.

Design maturity remains explicit:

1. Concept Visualization
2. Preliminary CAD
3. Prototype Candidate
4. Engineering Reviewed
5. Manufacturing Released

Unknown dimensions/tolerances must remain provisional. Consequential engineering requires qualified review and/or prototype evidence before Manufacturing Released status.

## Evidence upload rule

Evidence upload is a project input, not a passive attachment feature. SurveyMonkey studies, interview notes/transcripts, PDFs, spreadsheets, images, sketches, prototype results, factory quotes, decks and professional/legal material must retain provenance, be associated with the correct invention, become available to relevant departments, and trigger staleness/refresh when conclusions materially change.

Current structured ingestion covers CSV survey data and text/Markdown evidence. Other binary file types are preserved with provenance but still require stronger structured extraction before their contents can be treated as machine-readable evidence.

## Ask InventSmith rule

Ask InventSmith is the intelligence layer over the entire invention workspace. It must not claim it cannot see across the app when the requested state exists in InventSmith records.

Cross-department questions must be answered from actual work/dependency/execution state. Current or externally verifiable questions such as patent status may invoke web research, while uncertainty and professional/legal limits remain explicit.

## Inventor-facing visibility rule

A capability is not considered implemented merely because a backend work item or deliverable exists. Material departments and artifacts must be discoverable in the inventor-facing product.

Market Research and Patent Readiness therefore have dedicated workspaces, and Product Design must expose the complete CAD package—including orthographic and exploded views—rather than hiding downstream artifacts behind the generic work library.

## Remaining repository priorities

1. Strengthen file evidence extraction for DOCX/PDF/spreadsheet/interview/survey inputs and methodology/sample metadata.
2. Continue expanding native CAD geometry, mating interfaces, sealing geometry, dimensions, tolerance handling and revision traceability without fabricating engineering certainty.
3. Expand product/pitch imagery beyond the current selected-product render to richer multi-view and technical presentation assets.
4. Expand format-appropriate exports for financial/tabular and other structured downstream artifacts.
5. Verify every lifecycle department has inventor-facing outputs/actions and that supplemental professional-routing work is surfaced consistently.
6. Complete automated end-to-end acceptance coverage for the representative invention journey, including department handoffs, CAD artifacts, exports and human/professional gates.
7. Synchronize remaining product/progress documentation with verified branch behavior.
8. Merge only after repository CI and acceptance gates pass.
9. After GitHub is complete, hand the finished pinned implementation to MadeThis for replication and perform live authenticated acceptance there.

## Completion rule

InventSmith is not complete because code builds, tests pass, or a deployment returns HTTP 200. Completion requires the complete idea-to-market repository implementation, repository acceptance, successful replication, live authenticated functional acceptance, and appropriate professional/physical gates for consequential real-world outputs.
