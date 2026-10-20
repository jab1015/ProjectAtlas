# InventSmith Engineering Maturity Checkpoint

**Updated:** October 20, 2026
**Branch:** `inventsmith/full-product-build`  
**Status:** engineering-review and deliberate manufacturing-release transitions implemented and behavior-tested; live qualified acceptance remains

## October 20 workflow and inventor-guidance checkpoint

The inventor-facing workflow now routes Stage 5+ users to the full Journey Center instead of the retired “coming soon” page. The Journey Center presents one plain-language next action while preserving the existing approval, expert-review, evidence, and physical-work boundaries. A low-confidence Validation report can prepare a survey page automatically, but distribution remains the inventor’s choice; collected answers remain unverified evidence until appropriately assessed.

Local verification for this checkpoint passed 130 test files / 703 tests, both TypeScript checks, the production dependency audit with 0 vulnerabilities, and the Next.js production build with 36/36 static pages. No live CAD generation, engineering review, physical prototype, manufacturer acceptance, supplier contact, or release action is claimed. The updated code has not yet been verified in the Netlify Preview.

## Manufacturing-readiness hardening

InventSmith distinguishes dependency completion from consequential engineering maturity. Final `manufacturing_readiness` now requires the applicable dependency chain plus the latest fresh reviewed engineering artifacts rather than trusting status alone.

Current final boundary requires:

- latest fresh professionally reviewed `prototype_readiness_assessment`;
- latest fresh professionally reviewed `manufacturer_rfq_package`;
- latest fresh professionally reviewed `manufacturing_drawing_specification`;
- newest `native_cad_package` to be fresh, professionally reviewed/authorized, and at least `engineering_reviewed` artifact maturity.

`native_cad_package` itself now requires engineering professional review. A newer preliminary, stale or unreviewed CAD revision defeats an older reviewed revision. Early manufacturing process research, factory requirements, sourcing, draft RFQ work and genuine quote evidence remain available before final readiness.

## Implemented maturity transitions

Accepted auditable engineering review of the exact newest fresh native-CAD revision promotes that artifact from `preliminary_cad` to `engineering_reviewed` only after every exact required review is accepted. Older, ambiguous, stale, changes-requested, or incompletely reviewed revisions fail closed. Review replay is idempotent; reopening review revokes engineering maturity and any prior manufacturing release.

A separate manager-only mutation releases one complete synchronized newest six-artifact native-CAD generation from `engineering_reviewed` to `manufacturing_released`. It revalidates freshness, exact professional reviews, synchronized version, generation completeness, authority, and audit evidence. The Design Studio exposes this transition with explicit confirmation. Release does not change external-use authorization and does not contact a supplier, disclose files, purchase, pay, order production, file, publish, or start production.

## Remaining engineering-maturity work

Verify the full physical/hybrid chain in an owner-controlled live runtime with genuine evidence and qualified review:

**design → drawings/CAD → prototype evidence → prototype readiness → RFQ → real quote → comparison/agreement → manufacturing readiness**.

## Safety boundary

This checkpoint does not claim deployment, live functional verification, actual engineering approval, physical prototype testing, manufacturer acceptance, supplier contact, a production order, or real-world manufacturing release. Repository artifact-maturity transitions are implemented; genuine external facts still require genuine records/evidence.

### October 20, 2026 — authenticated PR #24 Preview acceptance

Netlify Deploy Preview `6ad6c9cbe5ef4c10168cd3e8` for head `9d4a5c2` built successfully (`npx next build`, 36/36 pages; no Convex CLI) and was checked in the inventor’s signed-in session. Validation now shows **complete, 11/11 sections, current evidence, 45% evidence-support confidence**, credits the uploaded `Data_All_260313` survey and its extracted findings, and clearly labels it inventor-provided/unverified with limits on demand, market size, and performance claims. Because confidence is at or below 50%, the page prepared an active follow-up survey link and a plain next step to share it with five people. The public respondent page loaded all five questions and the provenance/privacy note; no response was submitted.

Journey Center and the Validation page had conflicting next-step copy: Journey Center said “Continue Validation” while Validation offered the prepared survey. A local change now detects the active `[Validation follow-up]` survey and changes Journey Center’s next action to “Share your prepared survey with five people who may have this problem, then add their answers as evidence.” Focused regression tests (4), web and Convex TypeScript checks, and `git diff --check` pass. This small alignment change is not yet in the tested Preview; its PR update and Preview acceptance remain pending.

The journey view also shows 1/15 stages done, Validation 0/2 tasks, Market Research needing a retry, and no saved results in the later stages. Agent profiles and routing are implemented and covered by tests, but live successful work/save/handoff has not been verified in each department. Treat full department deployment as incomplete until controlled acceptance proves outputs and evidence links per department. The survey is prepared but not distributed; no external messages, respondent data, AI generation, production publish, or PR merge occurred.

### October 20, 2026 — Journey Center Preview compatibility correction

Authenticated retest of Preview `6ad6cb3025118d39094ac8cf` confirmed the survey link remains available, but Journey Center still displayed “Continue Validation.” The deployment builds the website only; it does not deploy Convex functions, so the server-side wording adjustment was not live. The correction now reads the existing, already-working `evidenceRequests:list` query in the Journey Center page and displays the survey-sharing instruction when an active `[Validation follow-up]` exists. The unsupported Convex query change was removed. Focused regression coverage must be rerun, and this UI-only fix still needs a pushed commit and its own authenticated Preview check. No Convex or production deployment was made.
