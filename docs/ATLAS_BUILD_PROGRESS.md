# InventSmith Build Progress

**Last updated:** August 15, 2026  
**Release target:** Controlled pilot — Idea to Feasibility and IP Readiness  
**Authoritative scope:** `docs/ATLAS_PRODUCT_RESET_V1.md` (legacy filename retained for continuity)  
**Overall completion:** **80%**

## How the percentage is calculated

The percentage is a weighted pilot-readiness estimate, not a count of files or screens. A workstream only receives full credit when its code, tests, documentation, runtime behavior, and required external configuration are verified.

| Workstream | Weight | Complete | Weighted contribution | Evidence / gap |
|---|---:|---:|---:|---|
| Product scope and safety baseline | 10% | 100% | 10.0% | Product Reset v1 defines customer, boundaries, autonomy, trust states, release outcome, and restricted pilot categories. Restricted-category execution fails closed before model calls. |
| Canonical invention data model | 12% | 97% | 11.6% | Core ledgers, usage, subscriptions, media metadata, deletion, privacy export, and idempotent canonical workspace migration exist. Live migration/backfill validation remains. |
| Autonomous orchestration engine | 18% | 90% | 16.2% | Dependency queue, leases, retries, reservations, finite budgets, entitlements, human gates, stale-output rejection, continuation, scheduled recovery, and pre-model risk triage exist. Managed cloud runtime remains unverified. |
| Feasibility package coverage | 18% | 66% | 11.9% | Every named package section, concept imagery, package assembly, Markdown, and PDF/DOCX export exist. Real DOCX/PDF binary generation is CI-verified; live content quality and visual layout QA remain. |
| Evidence and output trust | 12% | 68% | 8.2% | Claim typing, source ledger, verification freshness, disputes, coverage, trust promotion, dependencies, stale propagation, and professional-review gates exist. Live representative-case citation evaluation remains. |
| Inventor experience and chat | 10% | 86% | 8.6% | Status briefing, subscriptions, work library, downloads, review queue, blocked-work response, record-aware Ask InventSmith, controlled-pilot launcher, and self-service structured data export exist. Full usability testing remains. |
| Security, privacy, and usage control | 8% | 100% | 8.0% | Backend authorization, signed webhooks, finite budgets, bounded exports, transactional deletion, secret-excluding structured export, restricted-category gating, CI checks, and zero known high/critical production vulnerabilities are verified in code. Deployed deletion/restoration testing remains an operations gate. |
| Deployment and operations | 7% | 58% | 4.1% | CI, runbook, scheduled recovery, admin operations, secret-safe health checks, one-command live verification, reproducible font-independent builds, and guarded development deployment tooling exist. Managed deployment, monitoring, backups, and spend alerts remain live gaps. |
| Representative pilot evaluation | 5% | 28% | 1.4% | Deterministic quality checks and the canonical representative invention exist; the admin launcher is ready to create/start the case after deployment. No live representative run or professional review has been completed. |
| **Total** | **100%** |  | **80.0%** | Conservative controlled-pilot readiness estimate. |

## Current milestone

**Milestone:** Synchronize the verified InventSmith repository into the existing MadeThis-managed environment, then run one invention safely from intake through an evidence-checked feasibility recommendation without hidden manual assembly.

### Latest verified checkpoint

- Customer-facing product identity is **InventSmith — The Inventor OS**, published by Modern Methods.
- The official InventSmith logo is committed and integrated into current product branding.
- A permanent branding regression check prevents current customer-facing Atlas identity from being reintroduced while allowing deployment-sensitive compatibility identifiers to remain internal.
- GitHub `main` contains the autonomous controlled-pilot architecture and permanent CI verification.
- The final repository verification after the InventSmith rename passed both TypeScript targets, the full regression suite, the production dependency audit, and the Next.js production build.
- Account deletion is fail-closed and transactional: invention-owned data/storage and authentication credentials are removed, retained financial/subscription records are anonymized, paid billing must be resolved first, and administrators cannot self-delete through the privacy queue.
- Authenticated inventors can download a bounded structured JSON export while password/auth credentials, sessions, refresh tokens, verification codes, bearer download tokens, and server/API secrets are excluded. Binary file bytes remain outside the JSON package.
- Existing inventions receive an idempotent canonical workspace migration without overwriting or duplicating existing work.
- Controlled-pilot safety scope is enforced before model research/generation calls.
- Representative DOCX and PDF exports are generated by real export functions in CI and checked for nontrivial binary output and valid signatures.
- `/api/health` provides a secret-safe deployment readiness probe and checks Convex Auth key material without exposing values.
- `npm run verify:live -- https://<deployment>.convex.site` performs fail-closed live readiness verification.
- The representative-pilot launcher creates the canonical non-safety-critical fixture and schedules eligible autonomous work without bypassing entitlements, budgets, or human/professional gates.
- The production build does not download Google Fonts at build time.

### Repository-only work status

**Complete for handoff.** The remaining acceptance work requires MadeThis-managed runtime access or human/professional review. Further repository changes should be limited to defects discovered during synchronization or live acceptance so the handoff baseline remains stable.

### Next highest-priority work — managed/live

1. Have MadeThis reproduce the final GitHub `main` baseline inside its managed source while preserving Convex/auth/Vercel/domain/storage/data.
2. Verify `/api/health`, auth/session persistence, canonical migration, recovery, reservations, and the real autonomous work queue.
3. Verify the OpenAI key and required server-side secrets in the managed Convex environment through masked tooling.
4. Run the standard non-safety-critical physical product through the deployed workflow, including bounded live model and concept-image smoke tests.
5. Configure/validate the MadeThis subscription lifecycle webhook against the deployed endpoint.
6. Render and visually inspect representative InventSmith DOCX/PDF output from the live case.
7. Run a disposable-account deletion/restoration test and configure monitoring, spend alerts, backup ownership, and incident response.
8. Conduct inventor usability testing and patent/engineering professional review of the handoff package.

## Known release blockers

- MadeThis synchronization against the final InventSmith GitHub baseline has not yet been completed.
- No controlled managed Convex deployment has been live-verified for the current build.
- The OpenAI key and required secrets are not yet verified in the MadeThis-managed Convex server environment for this build cycle.
- MadeThis has not yet been verified sending the signed subscription lifecycle contract to the deployed endpoint.
- No professional patent/engineering reviewer has evaluated a generated handoff package.
- Account-deletion execution is implemented and CI-verified, but a disposable deployed account deletion/restoration test remains required.
- DOCX/PDF binary generation is structurally CI-verified, but representative rendered layout/content has not yet been visually inspected from a live case.
- External monitoring, spend alerts, backup/restoration ownership, and incident-response operations are not yet live-configured.

## Progress-update rule

Update this document whenever a managed synchronization milestone closes, a release blocker changes, a new end-to-end verification is completed, or the weighted completion estimate changes materially. Every closeout should distinguish repository-verified work from managed/live acceptance.
