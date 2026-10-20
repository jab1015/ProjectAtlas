# InventSmith Scoped Evidence Invalidation Checkpoint

**Date:** October 20, 2026
**Branch:** `inventsmith/full-product-build`  
**Status:** implemented; exact-head CI required before this checkpoint is called verified

## Validation follow-up survey — October 20, 2026

When the newest Validation report is complete, its evidence fingerprint matches current evidence, all sections completed, and average confidence is **50% or lower**, the Validation page prepares a survey for the inventor to share. It first waits for the evidence-request list, then checks for an active Validation follow-up before using the existing `evidenceRequests:create` mutation. The page introduction uses the invention problem/solution context. This client-side check avoids duplicate creation on ordinary reloads; simultaneous tabs are not yet protected by server-side idempotency.

Survey responses continue to create inventor-provided, unverified evidence records and enter the existing evidence-impact/Validation refresh path. Creating the page does not send invitations, messages, or posts. The Validation view makes the next step explicit and shows the copyable link. The threshold triggers more evidence collection; it does not inflate confidence or imply success probability.

Repository regression coverage and local checks pass (130 files / 703 tests; both TypeScript checks; production dependency audit 0 vulnerabilities; Next.js build 36/36). Preview `6ad6c826907d833bcbcb5524` surfaced that `ensureValidationSurvey` was not deployed. The UI now relies on the existing list/create functions instead; verify survey creation, response intake, and refresh in the next Preview.

## Change

Known real-world evidence classes now invalidate the work that actually depends on them instead of forcing a broad rerun of unrelated completed work.

- **Prototype test evidence** refreshes the physical prototype-evidence gate and its downstream prototype/manufacturing-readiness chain.
- **Manufacturer quote/RFQ evidence** refreshes the quote-evidence gate, production unit economics, quote comparison, agreement/readiness work, and their downstream dependents without rerunning unrelated market work.
- **Actual sales/launch evidence** refreshes the launch evidence gate and its downstream performance/growth chain.
- Unknown/general evidence classes retain conservative broad invalidation because their downstream scope cannot safely be inferred from the evidence label alone.

Removing previously relied-on prototype, manufacturer-quote, or launch evidence now fails the corresponding real-world gate closed again instead of merely leaving a previously satisfied gate in a completed state.

For removals, direct source links are removed only where the removed source was actually referenced. Uploading new evidence no longer strips an existing source link merely because the same change event caused downstream work to become stale.

## Safety boundary

Running work is still protected by the existing invention `updatedAt` stale-input check: an evidence change advances the invention timestamp, so a provider result claimed before the change is discarded on completion and requeued rather than persisted as current output.

This checkpoint does not represent deployment, live functional verification, professional review, or manufacturing approval.

### October 20, 2026 — authenticated PR #24 Preview acceptance

Netlify Deploy Preview `6ad6c9cbe5ef4c10168cd3e8` for head `9d4a5c2` built successfully (`npx next build`, 36/36 pages; no Convex CLI) and was checked in the inventor’s signed-in session. Validation now shows **complete, 11/11 sections, current evidence, 45% evidence-support confidence**, credits the uploaded `Data_All_260313` survey and its extracted findings, and clearly labels it inventor-provided/unverified with limits on demand, market size, and performance claims. Because confidence is at or below 50%, the page prepared an active follow-up survey link and a plain next step to share it with five people. The public respondent page loaded all five questions and the provenance/privacy note; no response was submitted.

Journey Center and the Validation page had conflicting next-step copy: Journey Center said “Continue Validation” while Validation offered the prepared survey. A local change now detects the active `[Validation follow-up]` survey and changes Journey Center’s next action to “Share your prepared survey with five people who may have this problem, then add their answers as evidence.” Focused regression tests (4), web and Convex TypeScript checks, and `git diff --check` pass. This small alignment change is not yet in the tested Preview; its PR update and Preview acceptance remain pending.

The journey view also shows 1/15 stages done, Validation 0/2 tasks, Market Research needing a retry, and no saved results in the later stages. Agent profiles and routing are implemented and covered by tests, but live successful work/save/handoff has not been verified in each department. Treat full department deployment as incomplete until controlled acceptance proves outputs and evidence links per department. The survey is prepared but not distributed; no external messages, respondent data, AI generation, production publish, or PR merge occurred.

### October 20, 2026 — Journey Center Preview compatibility correction

Authenticated retest of Preview `6ad6cb3025118d39094ac8cf` confirmed the survey link remains available, but Journey Center still displayed “Continue Validation.” The deployment builds the website only; it does not deploy Convex functions, so the server-side wording adjustment was not live. The correction now reads the existing, already-working `evidenceRequests:list` query in the Journey Center page and displays the survey-sharing instruction when an active `[Validation follow-up]` exists. The unsupported Convex query change was removed. Focused regression coverage must be rerun, and this UI-only fix still needs a pushed commit and its own authenticated Preview check. No Convex or production deployment was made.
