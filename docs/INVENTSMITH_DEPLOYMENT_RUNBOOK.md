# InventSmith Owner-Controlled Deployment and Acceptance Runbook

**Status:** Repository implementation in progress; owner-controlled deployment not yet provisioned or live-verified  
**Product:** InventSmith — The Inventor OS by Modern Methods  
**Updated:** September 15, 2026

## 1. Deployment authority and boundary

This runbook supersedes the previous MadeThis replication workflow.

Target ownership:

- **GitHub:** `jab1015/ProjectAtlas` is the historical repository slug and current source/CI authority. The customer-facing product is InventSmith.
- **Vercel:** Modern Methods-owned account/project will host the Next.js application.
- **Convex:** Modern Methods-owned account/project will host database, authentication, storage, scheduled work, and backend execution.

The MadeThis-managed environment is not a migration source and must not be modified, deployed to, deleted, or required for repository development. No MadeThis data migration is required.

Do not call the owner-controlled environment deployed, production-ready, or live-verified until those steps actually occur.

## 2. Repository gate before any live deployment

Use branch `inventsmith/full-product-build` and draft PR #24 until the owner explicitly approves otherwise. Do not merge merely to deploy a test.

The exact deployment candidate must pass the repository's real CI workflow:

```text
npm ci
node --check scripts/check-deployment-readiness.mjs
node --check scripts/verify-live-deployment.mjs
npx tsc --noEmit
npx tsc -p convex --noEmit
npm test
npm audit --omit=dev --audit-level=high
npx next build
```

Latest documented verified repository checkpoint: InventSmith CI #78, run `34997848353`, PASS at exact head `530b5757fe9e6c762f03967de60547ac383c12ff`. Any newer deployment candidate must pass its own exact-head workflow.

Do not suppress a failing gate, weaken a test, or downgrade a security check to obtain green CI.

## 3. Configuration inventory — names only

Never put real values in source, documentation, issues, logs, screenshots, or chat transcripts.

### Vercel / Next.js application configuration

| Variable | Visibility | Purpose / status |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Public browser config | Convex client deployment URL. Set only after the owner-controlled Convex deployment exists. |
| `CONVEX_DEPLOYMENT` | Server/build tooling | Convex deployment selector used by local/deployment tooling where applicable. |
| `CONVEX_DEPLOY_KEY` | Secret | Convex deploy credential used only by trusted deployment automation/tooling. Never expose to browser code. |
| `NEXT_PUBLIC_PLATFORM_URL` | Public browser config | **Legacy external-platform/billing adapter setting.** Do not point this at MadeThis. Keep unset until the replacement billing/checkout integration is intentionally selected and verified. |

### Convex server environment

| Variable | Visibility | Purpose / status |
|---|---|---|
| `OPENAI_API_KEY` | Secret | Server-side AI/model execution. |
| `ATLAS_OPENAI_MODEL` | Server config | Historical compatibility identifier for model override. Retain until code-level migration is separately tested; it does not name the customer-facing product. |
| `JWT_PRIVATE_KEY` | Secret | Convex Auth signing material. Provision using the supported auth setup; never generate ad hoc values in source. |
| `JWKS` | Server config containing public key material | Convex Auth verification configuration. Treat deployment configuration carefully even though keys are public. |
| `CONVEX_SITE_URL` | Server config | Convex site/auth callback URL for the owner-controlled deployment. |
| `ADMIN_TOKEN_SECRET` | Secret | Administrative API authentication. |
| `PLATFORM_FULFILLMENT_SECRET` | Secret | **Legacy platform fulfillment adapter.** Do not copy a MadeThis secret. Keep unavailable until the adapter is replaced/configured under owner control or deliberately retired after all consumers are migrated. |
| `ATLAS_SUBSCRIPTION_WEBHOOK_SECRET` | Secret | Historical compatibility identifier for subscription webhook signature verification. Preserve backend enforcement; migrate the identifier only with code/tests and set it only for the selected owner-controlled billing integration. |

Additional provider variables discovered later must be added here by name and ownership before deployment. Never infer or invent their values.

## 4. Fresh Convex project procedure

When the owner is ready to provision the runtime:

1. Create a new Convex project in the Modern Methods-controlled Convex account.
2. Link the repository locally/through approved deployment tooling to that project. Do not reuse the MadeThis deployment identifier or deploy key.
3. Install dependencies from the repository lockfile.
4. Run Convex schema/code generation using the package's supported Convex tooling and resolve type/schema errors before deployment.
5. Configure Convex Auth for the fresh project and set the required authentication environment values through secure Convex configuration.
6. Configure `OPENAI_API_KEY`, optional tested model overrides, admin secret, and only those external-provider secrets that are actually enabled.
7. Deploy Convex functions/schema to the fresh project.
8. Confirm scheduled work, storage APIs, auth callbacks, HTTP endpoints/webhooks, and backend entitlement checks are present before connecting the public web app.
9. Do not seed MadeThis data. Use disposable owner-controlled test accounts/inventions for acceptance.

A fresh schema deployment is not equivalent to live functional acceptance.

## 5. Fresh Vercel project procedure

1. Create a Vercel project in the Modern Methods-controlled Vercel account from `jab1015/ProjectAtlas`.
2. Use the repository's supported Node/package-manager settings and install from the lockfile.
3. Configure only public client values in `NEXT_PUBLIC_*` variables.
4. Configure any Vercel-side server/build credentials as encrypted project environment values; never commit them.
5. Set `NEXT_PUBLIC_CONVEX_URL` to the fresh owner-controlled Convex deployment only after Convex is ready.
6. Leave legacy MadeThis/platform billing variables unset unless a replacement owner-controlled integration has been selected and its backend enforcement is functional.
7. Build a preview deployment first. Do not attach production DNS or a production custom domain during initial acceptance.
8. Run authenticated preview acceptance before promoting a deployment.

## 6. Authentication and authorization acceptance

Using disposable accounts, verify behavior rather than source strings:

- unauthenticated reads/writes are denied;
- one user/organization cannot read or mutate another invention, evidence file, deliverable, chat, usage, billing, or private artifact;
- Viewer cannot mutate;
- Member/Admin/Owner boundaries are server-enforced;
- Professional/Guest access is restricted to explicit invention/review grants;
- ordinary users cannot execute administrator operations;
- authorized operations continue to work;
- backend entitlements and active-invention limits are enforced even when UI controls are bypassed;
- organization ownership/member departure and archival behavior preserve intended records.

## 7. Core functional acceptance

Exercise this exact path with a harmless representative invention:

**Sign in → create invention → upload evidence → extraction completes → research runs → review/record a decision → generate a versioned package → download and inspect it.**

Verify the workspace tells the inventor what completed, what was learned, what is running, what failed, what is blocked and why, what input/authorization is required, what artifacts exist, and what happens next.

For evidence uploads verify original-file preservation, provenance/timestamps, owner isolation, type/size rejection, bounded processing, explicit processing/failure states, retry without duplicate evidence, downstream invalidation after material changes, export, and deletion/storage cleanup.

## 8. Validation/research trust acceptance

Verify:

- a run with mixed successful/failed sections is reported as partial, not complete;
- successful sections remain visible while failed sections are retryable;
- unsourced AI analysis cannot present a fixed high-confidence label;
- sourced facts are distinct from inventor statements, estimates, and AI inference;
- source dates/retrieval provenance and claim support remain visible;
- fabricated citations, model-only verification labels, stale evidence, disputed evidence, and retrieved-content prompt injection cannot promote trust;
- production provider unavailability is reported as unavailable rather than silently replaced by mocks.

## 9. Worker reliability and usage acceptance

Test duplicate, late, stale, failed, blocked, cancelled, and retried execution paths. Confirm attempt/lease identity prevents an expired worker from completing a newer attempt; stale invention inputs discard output safely; retries are bounded; context/output sizes are bounded; partial storage is cleaned up; reservations settle exactly once; and known model/search/image costs are charged on completed, failed, partially failed, or human-gated attempts when cost was actually incurred.

Unknown cost must be represented as unknown/estimated where applicable, never silently recorded as zero.

## 10. Complete applicable journey acceptance

Run representative **physical**, **software**, and **hybrid** cases. InventSmith owns sequencing and dependencies; the inventor should not have to manage departments.

Physical cases should exercise applicable design candidates, trade-offs, Product Design Specification, bounded native CAD/geometry outputs where supported, prototype/test planning, physical-evidence gates, manufacturing/RFQ preparation, and genuine quote gates.

Software cases should exercise software product design, UX/architecture/data/security planning, implementation/test/release evidence gates, and must not be blocked on irrelevant physical CAD/manufacturer work.

Across applicable product types review Validation, Market Research, Patent Readiness, Branding, IP/legal preparation, Pricing, Marketing, Sales, Funding, Launch and Growth artifacts.

## 11. Genuine evidence, professional review, and consequential authorization

AI/model output cannot satisfy real-world gates by assertion.

Require real evidence for physical prototype results, manufacturer/supplier quotes, completed software tests/deployments, post-launch sales/analytics, and professional review. Patent/prior-art material remains research/readiness and must not be represented as a patentability/FTO/legal opinion. CAD/design work retains maturity states and cannot become Engineering Reviewed or Manufacturing Released without qualifying records.

Professional review and external-use authorization must be tested as separate transitions. A professional review must not itself permit disclosure, filing, publishing, supplier contact, purchasing, ordering, or manufacturing.

For every consequential external action involving an artifact:

1. authorize the exact latest fresh deliverable revision for external use through the dedicated manager action;
2. create the consequential request bound to the exact deliverable ID(s);
3. verify stale, unauthorized, wrong-invention, superseded, duplicate-latest, or legacy-unscoped artifacts fail closed;
4. resolve approval only as an authorized invention manager;
5. revalidate exact current artifact scope at execution time immediately before any disclosure/contact/file/publish operation;
6. verify denial remains possible for legacy/unscoped pending requests;
7. verify an approval record alone cannot authorize a now-stale or superseded artifact;
8. verify external-use authorization and approval do not create a purchase, payment, manufacturing order, filing, publication, or third-party contact unless that separate consequential operation is explicitly executed.

## 12. Billing and webhook migration boundary

The repository currently retains compatibility identifiers for legacy external billing/fulfillment integration. Missing owner-controlled billing is a deployment blocker for paid checkout—not a reason to bypass entitlements or grant paid access.

Before enabling paid plans:

1. inventory every checkout, fulfillment, subscription-event and webhook consumer;
2. select the owner-controlled billing provider/integration;
3. replace or deliberately isolate legacy MadeThis-specific endpoints/secrets;
4. configure signed/idempotent webhook handling and backend plan authority;
5. verify cancellation, past-due, replay, duplicate and out-of-order events;
6. verify checkout/account pricing matches backend entitlements;
7. do not enable production billing until these checks pass.

## 13. Privacy/deletion/storage acceptance

Verify account/organization export boundaries, invention/evidence deletion authorization, original artifact deletion, generated-storage cleanup, member departure, invitation cleanup, billing fail-closed behavior where required, and deletion/anonymization semantics. Exports must not contain passwords, auth credentials, sessions, refresh tokens, verification codes, bearer tokens, server secrets, or unrelated organization data.

## 14. Artifact quality acceptance

Do not accept artifacts by file existence alone. Open representative PDF/DOCX/PPTX/XLSX/CSV/image/CAD outputs and inspect content, formatting, version metadata, evidence/limitation labels, and usability. For geometry validate supported units/dimensions and STEP/STL/DXF structure with appropriate tooling before advancing maturity.

## 15. Operational acceptance

Before production DNS or public release, establish owners and tested procedures for health/uptime alerts, Convex/provider spend alerts, backup/restoration, key rotation, incident response, prompt/model/provider changes, billing/webhook incidents, rollback, privacy/deletion requests, and deployment access.

Run secret-safe readiness tooling and verify health output never exposes tokens, user data, invention data, private evidence, or secrets.

## 16. Release rule

The statuses are independent:

- **implemented** — code exists;
- **automated verification passed** — exact implementation head passed relevant deterministic CI/tests;
- **deployed** — exact code/config is deployed to owner-controlled infrastructure;
- **live functionally verified** — authenticated acceptance passed on that deployment;
- **professional review required/completed** — recorded separately where consequential work needs it.

Do not collapse these into a single completion percentage or production-ready claim.
