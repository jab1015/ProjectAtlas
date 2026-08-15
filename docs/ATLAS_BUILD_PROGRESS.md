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
- downstream evidence-impact/staleness propagation;
- engine-owned 15-stage Journey Center and department routes;
- full journey work definitions and executable lifecycle departments;
- evidence-backed Product Design candidate generation, scoring, selection and specification;
- native preliminary CAD pipeline;
- deterministic STEP, STL and DXF artifact generation for supported geometry;
- editable InventSmith CAD source;
- orthographic engineering views and exploded assembly views;
- explicit CAD/design maturity and professional-review gating;
- prototype strategy, sourcing, test planning, evidence assessment, design-gap analysis and readiness;
- manufacturing process planning, factory requirements, manufacturer research, RFQ package, scorecard, quote comparison, unit economics, agreement checklist and readiness;
- branding/positioning/name/trademark-screen/identity/asset-brief work;
- IP strategy, invention disclosure, NDA draft package, contracting package, IP status tracking and legal-professional handoff;
- pricing evidence, pricing strategy, break-even and validation planning;
- marketing messaging, channels, plan, assets and prelaunch calendar;
- sales channels, toolkit, funnel, projections and post-purchase experience;
- funding strategy/source research, financial model, pitch-deck content, investor FAQ and funding readiness;
- launch readiness/playbook/customer-feedback/performance/priorities;
- growth audit/levers/roadmap/retention/performance reporting;
- Ask InventSmith project-wide grounding across work, dependencies, evidence, deliverables, decisions, approvals, reviews, execution events, validation and journey state;
- live-web routing for patent-status/current-research questions;
- regression protection for cross-department verification, full-journey scope, evidence ingestion, CAD geometry, entitlement and professional-review policy.

CI run #101 for the Ask InventSmith project-wide grounding checkpoint passed successfully.

## Mandatory capability matrix

| Capability | Repository state | Remaining acceptance work |
|---|---|---|
| Idea intake and persistent invention record | Implemented foundation | End-to-end live acceptance |
| Evidence/file upload | Implemented on full-product branch | Live upload/extraction/refresh acceptance with representative files |
| Validation | Implemented foundation | Verify uploaded evidence materially affects validation correctly |
| Market/competitor research | Implemented foundation | Full-journey live acceptance |
| Patent/prior-art intelligence | Implemented foundation + project-wide Ask grounding | Verify current patent research, status refresh, design constraints and professional handoff |
| Product design | Implemented on full-product branch | Verify patent/research constraints flow into candidate scoring and selected design |
| CAD/3D design | Native preliminary STEP/STL/DXF generation implemented for supported primitive geometry | Expand supported geometry where needed; engineering/prototype/live acceptance before manufacturing release |
| Exploded/orthographic views | Implemented | Live visual/download acceptance; dimension/tolerance maturity must remain evidence-backed |
| Engineering package | Foundation + CAD/design outputs implemented | Complete engineering-review acceptance and revision loop |
| Prototype loop | Lifecycle department implemented | Physical prototype evidence remains a genuine human/real-world gate |
| Manufacturing/factory guidance | Lifecycle department implemented | Verify real sourcing/RFQ/quote workflows and professional/financial gates |
| Legal/contracts/NDAs | Lifecycle department implemented | Professional/legal review required where applicable |
| Professional routing | Implemented through professional-review and lifecycle handoffs | Verify candidate/provider research and handoff UX |
| Branding | Lifecycle department implemented | Asset-generation/live UX acceptance |
| Pricing | Lifecycle department implemented | Real cost/market evidence acceptance |
| Marketing | Lifecycle department implemented | Asset/export/live UX acceptance |
| Sales | Lifecycle department implemented | Live UX and real-data acceptance |
| Pitch deck/funding | Content/financial/funding lifecycle implemented | Format-appropriate presentation export and live investor-package acceptance remain required |
| Launch | Lifecycle department implemented | Live/real-world launch acceptance |
| Growth | Lifecycle department implemented | Requires real post-launch data for final functional acceptance |
| Documents/exports | PDF/DOCX foundation plus CAD artifact downloads | Expand format-appropriate exports across full journey, including presentation package |
| Ask InventSmith | Project-wide operational context implemented | Live authenticated conversational acceptance |
| Correct InventSmith branding | Repository branding implementation exists | Final live replication/acceptance after GitHub build is complete |

## CAD and manufacturing-release rule

InventSmith must design the product, not stop at feasibility or concept imagery. For supported physical products it must progress through real geometry and engineering artifacts.

Current native CAD supports deterministic assemblies built from boxes, cylinders and hollow tubes and emits STEP/STL/DXF, editable source, orthographic views and exploded views. This is a real CAD foundation but not permission to call every generated design factory-released.

Design maturity remains explicit:

1. Concept Visualization
2. Preliminary CAD
3. Prototype Candidate
4. Engineering Reviewed
5. Manufacturing Released

Unknown dimensions/tolerances must remain provisional. Consequential engineering requires qualified review and/or prototype evidence before Manufacturing Released status.

## Evidence upload rule

Evidence upload is a project input, not a passive attachment feature. SurveyMonkey studies, interview notes/transcripts, PDFs, spreadsheets, images, sketches, prototype results, factory quotes, decks and professional/legal material must retain provenance, be associated with the correct invention, become available to relevant departments, and trigger staleness/refresh when conclusions materially change.

## Ask InventSmith rule

Ask InventSmith is the intelligence layer over the entire invention workspace. It must not claim it cannot see across the app when the requested state exists in InventSmith records.

Cross-department questions must be answered from actual work/dependency/execution state. Current or externally verifiable questions such as patent status may invoke web research, while uncertainty and professional/legal limits remain explicit.

## Remaining repository priorities

1. Expand CAD geometry/design capability beyond the initial primitive engine where representative products require it; strengthen dimensions, tolerances, interfaces and revision traceability without fabricating engineering certainty.
2. Ensure patent/prior-art findings become explicit Product Design constraints and that design scoring records differentiation rationale without claiming patentability.
3. Complete format-appropriate pitch-deck/investor-package export, not merely pitch-deck text.
4. Strengthen file evidence extraction for DOCX/PDF/spreadsheet/interview/survey inputs and methodology/sample metadata.
5. Verify each lifecycle department has inventor-facing outputs/actions rather than hidden backend-only work.
6. Complete automated end-to-end acceptance coverage for the representative invention journey, including department handoffs, CAD artifacts, exports and human/professional gates.
7. Synchronize all product/progress documentation with verified branch behavior.
8. Merge only after repository CI and acceptance gates pass.
9. After GitHub is complete, hand the finished pinned implementation to MadeThis for replication and perform live authenticated acceptance there.

## Completion rule

InventSmith is not complete because code builds, tests pass, or a deployment returns HTTP 200. Completion requires the complete idea-to-market repository implementation, repository acceptance, successful replication, live authenticated functional acceptance, and appropriate professional/physical gates for consequential real-world outputs.
