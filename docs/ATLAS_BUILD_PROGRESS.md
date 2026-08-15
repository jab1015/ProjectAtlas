# InventSmith Build Progress

**Last updated:** August 15, 2026  
**Product destination:** Complete Idea-to-Market Inventor OS  
**Authoritative product specification:** `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`  
**Supporting long-range roadmap:** `docs/ATLAS_PRODUCT_ROADMAP.md` (legacy filename retained for continuity)  
**Current implementation baseline:** controlled-pilot / feasibility foundation

## Critical scope correction — August 15, 2026

InventSmith must be measured against the complete idea-to-market product vision, not only the previously narrowed controlled-pilot release.

The controlled-pilot implementation remains useful foundation work, but it is **not the finished InventSmith product**.

The required destination is:

**Idea → Evidence → Validation → Market Research → Prior Art / Patent Readiness → Product Design → CAD / Engineering → Prototype → Manufacturing → Branding → Intellectual Property / Legal → Pricing → Marketing → Sales → Funding / Pitch → Launch → Growth**

The inventor should not need to understand or manually manage this process. InventSmith must know what comes next, perform reversible internal work autonomously, request evidence or approval when required, and route work to qualified professionals when professional authority or judgment is necessary.

## Completion accounting rule

Do not publish a single optimistic completion percentage that treats the controlled-pilot subset as the whole product.

Progress must distinguish:

1. **Foundation / controlled-pilot implementation** — work already built around the canonical invention record, orchestration, evidence, feasibility, documents, security, subscriptions and deployment.
2. **Complete InventSmith destination** — the full master specification in `INVENTSMITH_MASTER_PRODUCT_SPEC.md`.

Until the complete capability matrix is code-audited, the repository must not claim a precise overall full-product percentage. The earlier **80%** figure applied only to the narrowed controlled-pilot scope and is retired as an overall InventSmith completion number.

## Current verified foundation

Repository and managed deployment work has established substantial foundation capability, including:

- canonical invention record and structured ledgers;
- assumptions/evidence/findings/decision tracking;
- autonomous dependency orchestration;
- bounded work execution, leases, retries and recovery;
- finite cost budgets and entitlement enforcement;
- evidence verification/trust controls;
- feasibility-package generation;
- preliminary prior-art/IP-readiness workflow foundation;
- technical-feasibility workflow foundation;
- market/competitor research foundation;
- materials/manufacturing analysis foundation;
- regulatory screening foundation;
- preliminary BOM/cost work;
- development-risk analysis;
- engineering handoff foundation;
- concept imagery;
- PDF/DOCX generation;
- Ask InventSmith grounding;
- inventor status briefing;
- work/document library foundation;
- subscriptions, account deletion and structured data export;
- restricted-category safety gating;
- professional-review gates;
- operational health checks and CI/deployment tooling.

The August 15 MadeThis synchronization reported passing web + Convex TypeScript, 178 tests across 31 files, production dependency audit with zero known production vulnerabilities, production builds, Convex production deployment, Vercel READY, and live HTTP 200. These are deployment/build achievements, not proof of full product acceptance.

## Live acceptance defects discovered August 15, 2026

Initial founder testing of the live MadeThis deployment immediately identified gaps that prevent acceptance:

- legacy Atlas logo remains visible in the live authenticated header;
- official InventSmith logo is not visible on the tested surface;
- Validation is visible and can be rebuilt, but the complete invention journey is not discoverable;
- prior-art/patent research is not visibly accessible from the tested invention experience;
- technical/product-design progression is not visibly accessible;
- CAD/3D/exploded-view/manufacturing-design outputs are not available as required destination capabilities;
- legal/IP/professional work is not visibly accessible;
- the inventor is not being shown a clear complete path from the current stage to downstream work.

These defects demonstrate why build/test/deployment success must be separated from functional product acceptance.

## Mandatory capability matrix

| Capability | Destination requirement | Current status |
|---|---|---|
| Idea intake and persistent invention record | Required | Foundation exists; live UX requires acceptance |
| Evidence/file upload | Upload surveys, interviews, PDFs, DOCX, spreadsheets/CSV, images, sketches, prototype results, quotes, decks, professional/legal material; classify and propagate evidence | **Must be completed/verified** |
| Validation | Use inventor evidence + autonomous research; confidence and assumption tracking | Partial/live-visible |
| Market/competitor research | Evidence-backed market sizing, segments, alternatives and competitors | Foundation exists; live UX/output requires acceptance |
| Patent/prior-art intelligence | Search, compare, preserve coverage, identify differentiators/design constraints, attorney handoff | Foundation exists but complete live experience must be exposed/verified |
| Product design | Generate candidates, compare trade-offs, score and refine strongest design | **Major implementation priority** |
| CAD/3D design | Supported-category editable/preliminary CAD and appropriate STEP/STL/DXF outputs | **Not yet accepted; mandatory build target** |
| Exploded/dimensioned views | Assemblies, parts, exploded views, orthographic/dimensioned drawings | **Not yet accepted; mandatory build target** |
| Engineering package | Requirements, materials, tolerances where supported, BOM, assembly, DFM/DFA, revision control | Partial foundation; must be completed |
| Prototype loop | Prototype plan, testing, uploaded evidence, failure analysis, design revision | **Must be built/completed** |
| Manufacturing/factory guidance | Processes, factory types/candidates, RFQ, quote comparison, QC, tooling, logistics | Partial planning/foundation; **must be completed** |
| Legal/contracts/NDAs | Identify need, prepare drafts/handoffs, professional review gates, track status | **Must be built/completed** |
| Professional routing | Tell inventor which professional/provider is needed, why, what to send/ask; recommend candidates where possible | **Must be built/completed** |
| Branding | Name/positioning/identity/messaging and assets | Roadmap capability; must be completed |
| Pricing | Unit economics, pricing scenarios, break-even | Roadmap capability; must be completed |
| Marketing | GTM, messaging, channels, assets, calendar | Roadmap capability; must be completed |
| Sales | Channels, funnel, toolkit, projections | Roadmap capability; must be completed |
| Pitch deck/funding | Evidence-backed deck with product renders, financial model, funding strategy, FAQ | **Mandatory; must be built/completed** |
| Launch | Readiness, launch playbook, feedback/performance loop | Roadmap capability; must be completed |
| Growth | 90-day audit, roadmap, real-data iteration and reporting | Roadmap capability; must be completed |
| Documents/exports | Visible versioned library with format-appropriate exports | Foundation exists; expand to full journey |
| Ask InventSmith | Grounded in complete invention record and all relevant evidence/work | Foundation exists; full-journey grounding required |
| Correct InventSmith branding | Official logo/name across all customer-facing surfaces | **Live defect — fix required** |

## CAD and product-design acceptance rule

InventSmith is not complete if it only generates concept imagery or a design description.

For supported physical-product categories it must be able to progress toward a real design package containing appropriate 3D/CAD geometry, assemblies/parts, exploded views, dimensioned/orthographic views, materials, BOM, manufacturing recommendations, prototype artifacts and presentation-quality renders.

Design maturity must be explicit:

1. Concept Visualization
2. Preliminary CAD
3. Prototype Candidate
4. Engineering Reviewed
5. Manufacturing Released

InventSmith may create preliminary CAD and manufacturing-preparation artifacts, but safety-critical or consequential engineering cannot be represented as Manufacturing Released until required qualified engineering review is recorded.

## Evidence upload acceptance rule

Evidence upload is a core workflow, not a generic attachment feature.

When an inventor uploads material such as a 100-person SurveyMonkey study or interview notes, InventSmith must:

1. store the original artifact and provenance;
2. associate it with the correct invention;
3. classify the evidence type;
4. extract structured findings where appropriate;
5. record methodology/sample/context when available;
6. make it available to relevant work such as Validation;
7. update confidence/findings without fabricating provenance;
8. mark affected downstream work stale or refresh it when material conclusions change.

## Legal/professional acceptance rule

InventSmith must tell a first-time inventor when an NDA, contract, patent professional, engineer, regulatory specialist, testing lab, manufacturer, accountant, funding specialist or other professional/provider is needed. It must explain what to do, prepare the relevant brief/draft/checklist, and identify suitable candidate provider types or specific candidates where integrations/research permit.

It must not impersonate a licensed professional or silently represent unreviewed specialist work as professionally approved.

## Current build priorities

1. Fix live InventSmith branding/logo and expose the complete journey/navigation.
2. Complete and verify evidence/file upload with downstream evidence propagation.
3. Expose and complete market, patent/prior-art, technical-feasibility and design-preparation work in the inventor experience.
4. Build the evidence-backed Product Design Department: multiple candidates → scoring/trade-offs → selected/refined design.
5. Build supported-category CAD/3D generation, STEP/STL/DXF as appropriate, assemblies, exploded/dimensioned views, renders and revision control.
6. Build the prototype planning/testing/evidence/revision loop.
7. Build manufacturing/factory discovery, RFQ, quote comparison and production-readiness workflow.
8. Build legal/contracts/NDA/IP/professional-routing workflow.
9. Complete branding, pricing, marketing and sales stages.
10. Build evidence-backed pitch deck, financial model, funding strategy and investor package.
11. Complete launch and growth stages.
12. Run complete live idea-to-market acceptance and professional review.

## Progress update rule

Update this document whenever a material capability is implemented, deployed, live-verified, or found missing.

Every update must distinguish:

- planned;
- code implemented;
- repository tested;
- deployed;
- live functionally verified;
- professional review required/completed.

No capability is complete merely because code exists or a deployment returns HTTP 200.

No future report may use the old controlled-pilot completion percentage as the overall InventSmith completion percentage.
