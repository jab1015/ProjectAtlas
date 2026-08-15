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
- immediate structured ingestion for CSV survey data and text/Markdown evidence;
- first-class evidence categories for surveys/interviews, prototype tests, patent/prior art, manufacturer quote/RFQ evidence, sales/launch analytics, professional reports, design references, funding materials, legal material and other invention evidence;
- server-side AI file extraction for binary inventor evidence, including supported PDF/DOCX/spreadsheet/image/deck and similar uploads, with methodology/sample-size/key-finding extraction where present;
- extraction status/error visibility and inventor-facing retry control for failed binary evidence extraction without requiring the original file to be re-uploaded;
- automatic downstream evidence-impact/staleness propagation after initial upload, completed server-side extraction, removal, or governed material inventor input supplied through Ask InventSmith;
- direct Evidence Locker routing when the briefing asks the inventor for a survey, interview, test result, quote, report, or other evidence file;
- governed Ask InventSmith write-back for material inventor-provided facts/observations such as patent URLs/status observations, survey results, prototype results, manufacturer quotes, sales evidence, or test evidence;
- Ask write-back records inventor statements as unverified evidence, preserves URLs and chat origin, prevents duplicate capture, and never silently promotes inventor assertions to independently verified legal/technical facts;
- engine-owned 15-stage Journey Center and department routes;
- a legacy-root route guard that prevents Stage 5+ inventions from falling back into the retired Stage-4/“coming soon” workspace and sends them to the complete Journey Center instead;
- dedicated inventor-facing Market Research workspace exposing research outputs, sources, confidence, coverage, stale state, and inventor evidence;
- dedicated inventor-facing Patent Readiness workspace exposing prior art, feature comparison, distinguishing hypotheses, sources, trust state, and the Patent → Design handoff;
- full journey work definitions and executable lifecycle departments;
- regression protection proving the critical work dependency graph is complete and cycle-free across Patent → Design, Design/CAD → Prototype, CAD → Manufacturing, Manufacturing/Commercial → Funding, and Launch → Growth;
- evidence-backed Product Design candidate generation, scoring, selection and specification;
- native preliminary CAD pipeline;
- deterministic STEP, STL and DXF artifact generation for supported geometry;
- expanded native CAD geometry including boxes, cylinders, hollow tubes, tapered/frustum forms, custom-profile extrusion, real helical externally threaded cylinders, and real helical internally threaded tubes/sleeves for mating screw-driven interfaces;
- editable InventSmith CAD source;
- editable CAD source preserves part material, finish intent, target manufacturing process, interface/mating notes, position/rotation, assembly revision, assumptions, and unresolved engineering state;
- native CAD planning explicitly treats external/internal thread pitch compatibility, clearance, thread form, backlash, wear and fit as provisional unless engineering evidence supports them;
- orthographic engineering views and exploded assembly views;
- orthographic views include geometry-derived overall X/Y/Z dimensions in millimeters while explicitly distinguishing preliminary dimensions from engineering-approved tolerances/fits;
- complete six-artifact CAD package visibility/downloads in the Design Studio rather than hiding orthographic/exploded outputs;
- dedicated selected-product presentation rendering grounded in Product Design/CAD state;
- multi-view selected-product render brief requiring a consistent hero three-quarter, front, side, top, and mechanism/detail view while keeping deterministic CAD authoritative for exploded assembly geometry;
- explicit CAD/design maturity and professional-review gating;
- prototype strategy, sourcing, test planning, evidence assessment, design-gap analysis and readiness;
- explicit `prototype_physical_evidence` gate: InventSmith cannot assess an unbuilt/untested prototype as if it were tested; the gate blocks at a physical-work request and automatically releases when real prototype-test evidence arrives;
- manufacturing process planning, factory requirements, manufacturer research, RFQ package, scorecard, quote comparison, unit economics, agreement checklist and readiness;
- explicit `manufacturer_quote_evidence` gate: quote comparison cannot proceed from modeled pricing alone and automatically releases when a real manufacturer quote/RFQ response is supplied;
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
- spreadsheet-friendly CSV export generated from structured financial-model Markdown tables while preserving the complete narrative/evidence deliverable;
- inventor-facing artifact download support for PowerPoint, CAD, drawings, CSV financial output, images and other stored/generated artifacts;
- launch readiness/playbook/customer-feedback/performance/priorities;
- explicit `launch_actual_evidence` gate: Launch Performance cannot treat forecasts or modeled funnels as actual results and waits for real sales/orders/conversion/analytics/returns/reviews/customer evidence; sales/launch evidence automatically releases the gate;
- growth audit/levers/roadmap/retention/performance reporting;
- Ask InventSmith project-wide grounding across work, dependencies, evidence, deliverables, decisions, approvals, reviews, execution events, validation and journey state;
- live-web routing for patent-status/current-research questions;
- regression protection for cross-department verification, governed chat evidence capture, Market/Patent workspace routing, connected full-journey wiring, real-world evidence gates, browser and binary evidence ingestion/retry, expanded/mating threaded CAD geometry, CAD manufacturing metadata, dimensioned drawings, complete CAD artifact visibility, multi-view product rendering, financial CSV export, pitch-deck generation, entitlement, professional routing and professional-review policy.

## Mandatory capability matrix

| Capability | Repository state | Remaining acceptance work |
|---|---|---|
| Idea intake and persistent invention record | Implemented foundation | End-to-end live acceptance |
| Evidence/file upload | CSV/text structured immediately; supported binary uploads receive queued server-side AI extraction, extraction status/error UI, retry, downstream refresh, and first-class prototype/quote/sales-launch categories | Live representative-file acceptance across PDF/DOCX/XLSX/image/deck formats |
| Validation | Implemented foundation | Verify representative uploaded/chat evidence materially affects validation correctly in live authenticated use |
| Market/competitor research | Implemented foundation + dedicated Market Research workspace | Full-journey live acceptance |
| Patent/prior-art intelligence | Implemented foundation + dedicated Patent Readiness workspace + project-wide Ask grounding/write-back | Verify current patent-status refresh, design constraints and professional handoff on representative inventions |
| Product design | Implemented on full-product branch | Verify patent/research constraints flow into candidate scoring and selected design on representative inventions |
| CAD/3D design | Native preliminary STEP/STL/DXF generation implemented with box/cylinder/tube/frustum/custom convex extrusion/external helical thread/internal helical threaded-tube geometry; editable source carries manufacturing metadata | Continue sealing/custom rotational-interface geometry and representative engineering acceptance before manufacturing release |
| Product renders | Multi-view selected-product presentation board implemented in the render brief | Live visual-consistency/quality acceptance and additional technical-image workflows as needed |
| Exploded/orthographic views | Implemented, visible/downloadable, with geometry-derived overall dimensions | Live visual/download acceptance; critical dimensions, fits and tolerances must remain evidence-backed |
| Engineering package | Product/CAD specs, revisioned native source, dimensional views, manufacturing metadata, engineering handoff and professional gates implemented | Complete representative engineering-review acceptance and revision loop |
| Prototype loop | Lifecycle department + explicit physical-test evidence gate implemented | Physical prototype construction/testing remains a genuine human/real-world gate |
| Manufacturing/factory guidance | Lifecycle department + real quote/RFQ evidence gate implemented | Verify real sourcing/RFQ/quote workflows and professional/financial gates |
| Legal/contracts/NDAs | Lifecycle department implemented | Professional/legal review required where applicable |
| Professional routing | Service plan + provider research implemented | Live provider-research/handoff UX acceptance |
| Branding | Lifecycle department implemented; old Atlas SVG assets removed | Visual asset-generation/live UX acceptance |
| Pricing | Lifecycle department implemented | Real cost/market evidence acceptance |
| Marketing | Lifecycle department implemented | Asset/export/live UX acceptance |
| Sales | Lifecycle department implemented | Live UX and real-data acceptance |
| Pitch deck/funding | Editable native PPTX generation implemented, including available product-render embedding; financial model has CSV export | Live investor-package acceptance; richer financial presentation polish and XLSX-class structured export if needed |
| Launch | Lifecycle department + actual-sales/launch evidence gate implemented | Real launch remains a genuine external-world gate; live evidence acceptance after launch |
| Growth | Lifecycle department implemented | Requires real post-launch data for final functional acceptance |
| Documents/exports | PDF/DOCX foundation + PPTX + CAD/image/drawing downloads + financial CSV export | Expand remaining artifact-specific structured exports where they materially improve downstream use |
| Ask InventSmith | Project-wide operational context + live-web routing + governed material-input write-back implemented | Live authenticated conversational/write-back acceptance |
| Correct InventSmith branding | Approved `Logo.png` is canonical; legacy Atlas public SVG assets removed and regression-protected | Final live replication/acceptance after GitHub build is complete |

## CAD and manufacturing-release rule

InventSmith must design the product, not stop at feasibility or concept imagery. For supported physical products it must progress through real geometry and engineering artifacts.

Current native CAD supports deterministic assemblies built from boxes, cylinders, hollow tubes, tapered/frustum forms, custom-profile convex extrusions, externally threaded helical cylinders and internally threaded helical tubes/sleeves. It emits STEP/STL/DXF, editable source, orthographic views and exploded views. The editable source also preserves supported material/finish/process/interface intent and revision/unresolved-engineering metadata. This is a real CAD foundation but not permission to call every generated design factory-released.

Orthographic views include overall dimensions derived directly from the generated geometry. These values describe the preliminary CAD geometry; they do not create evidence-backed critical tolerances, fits, sealing requirements or engineering approval by themselves.

Thread pitch, thread depth, mating clearance, thread form, backlash, wear, sealing surfaces, tolerance stack-up and other critical interface dimensions must remain provisional unless supported by engineering evidence. Threaded interfaces require mating-part/clearance review and prototype testing before production release.

Design maturity remains explicit:

1. Concept Visualization
2. Preliminary CAD
3. Prototype Candidate
4. Engineering Reviewed
5. Manufacturing Released

Unknown dimensions/tolerances must remain provisional. Consequential engineering requires qualified review and/or prototype evidence before Manufacturing Released status.

## Real-world evidence gates

InventSmith must not fill gaps in the physical/commercial world with generated fiction merely to keep a stage moving.

Current explicit gates include:

- **Prototype evidence:** after the prototype test plan, actual physical test evidence is required before prototype assessment. If absent, InventSmith requests the smallest physical action and waits. Uploading prototype-test evidence releases the gate automatically.
- **Manufacturer quote evidence:** actual RFQ/quote evidence is required before quote comparison. InventSmith may prepare sourcing/RFQ material, but it may not fabricate price, MOQ, lead-time or supplier commitment. Supplying a real quote releases the gate automatically.
- **Launch evidence:** actual post-launch sales/analytics/customer evidence is required before Launch Performance. Forecasts and modeled funnels do not satisfy this gate. Supplying sales/launch analytics releases it automatically.

These gates are deliberate product behavior, not incomplete implementation.

## Evidence input rule

Evidence input is a project input, not a passive attachment or chat feature. SurveyMonkey studies, interview notes/transcripts, PDFs, spreadsheets, images, sketches, prototype results, factory quotes, sales/launch analytics, decks, professional/legal material, and material inventor facts supplied through Ask InventSmith must retain provenance, be associated with the correct invention, become available to relevant departments, and trigger staleness/refresh when conclusions materially change.

CSV survey data and text/Markdown evidence are structured immediately in the browser. Binary inventor uploads that cannot be structured safely in-browser are preserved first, then queued for server-side OpenAI file/image extraction. The extracted record retains inventor provenance, summarizes methodology/sample size when present, captures supported findings/limitations, identifies relevant work kinds, and reapplies downstream evidence-impact logic after extraction. Failed extraction remains retryable while the original stored file is preserved.

Material information supplied through Ask InventSmith is captured only when it resembles actual project evidence rather than a routine question. Captured chat evidence is stored as an inventor statement with unverified reliability, preserves supplied URLs and `capturedFrom: ask_inventsmith`, enters the canonical inventor-provided evidence channel, and triggers the same downstream refresh system. Capture never independently verifies the underlying statement.

## Ask InventSmith rule

Ask InventSmith is the intelligence layer over the entire invention workspace. It must not claim it cannot see across the app when the requested state exists in InventSmith records.

Cross-department questions must be answered from actual work/dependency/execution state. Current or externally verifiable questions such as patent status may invoke web research, while uncertainty and professional/legal limits remain explicit.

When the inventor supplies material project evidence through Ask InventSmith, that evidence must not remain trapped in chat history. InventSmith must preserve it in canonical project state with its inventor origin and verification limits so downstream departments can use and refresh against it.

## Inventor-facing visibility rule

A capability is not considered implemented merely because a backend work item or deliverable exists. Material departments and artifacts must be discoverable in the inventor-facing product.

Market Research and Patent Readiness therefore have dedicated workspaces, Product Design exposes the complete CAD package—including orthographic and exploded views—and lifecycle departments expose stored/generated artifacts with download actions. Stage 5+ inventions are prevented from falling back to the retired four-stage root workspace.

## Connected-journey rule

A complete list of departments is not sufficient. The execution dependency graph itself must connect the journey.

Regression coverage enforces that referenced work dependencies exist, that dependency cycles are rejected, and that critical operational chains remain intact: Patent Readiness feeds Product Design; Product Design/drawing requirements feed native CAD; native CAD feeds prototype sourcing and manufacturer RFQ work; physical prototype evidence gates prototype assessment; real quote evidence gates quote comparison; manufacturing economics feed commercial/funding work; launch readiness depends on manufacturing and commercial preparation; actual launch evidence gates performance analysis; and actual launch performance feeds growth work.

## Verification checkpoint

CI #220 passed the complete repository pipeline after the mating internal-thread CAD expansion: web TypeScript, Convex TypeScript, regression suite, production dependency audit, and Next production build.

## Remaining repository priorities

1. Live-test representative binary evidence uploads and Ask InventSmith write-back across PDF/DOCX/XLSX/image/deck/patent/survey/prototype/quote/sales inputs.
2. Continue expanding native CAD geometry for sealing features, custom rotational interfaces and representative product mechanisms without fabricating engineering certainty.
3. Validate multi-view product rendering for geometry consistency and expand technical-image workflows where representative inventions require them.
4. Expand remaining format-appropriate exports, including richer structured financial/tabular output where CSV is insufficient.
5. Add/validate inventor-facing visual brand asset generation and remaining commercial asset workflows where the product specification requires a produced asset rather than a brief.
6. Complete automated and live end-to-end acceptance for representative inventions, including evidence refresh, department handoffs, CAD artifacts, exports and human/professional gates.
7. Merge only after repository CI and acceptance gates pass.
8. After GitHub is complete, hand the finished pinned implementation to MadeThis for replication and perform live authenticated acceptance there.

## Completion rule

InventSmith is not complete because code builds, tests pass, or a deployment returns HTTP 200. Completion requires the complete idea-to-market repository implementation, repository acceptance, successful replication, live authenticated functional acceptance, and appropriate professional/physical gates for consequential real-world outputs.
