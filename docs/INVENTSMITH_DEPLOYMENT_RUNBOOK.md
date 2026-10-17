# InventSmith Owner-Controlled Deployment and Acceptance Runbook

**Status:** Repository implementation active; Convex development infrastructure exists; owner-controlled Vercel/frontend and full live acceptance are not complete  
**Product:** InventSmith — The Inventor OS by Modern Methods  
**Updated:** October 16, 2026 (America/New_York)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged

## 1. Deployment authority and boundary

Target ownership:

- **GitHub:** `jab1015/ProjectAtlas` remains source/CI authority.
- **Vercel:** a Modern Methods-owned project is the intended Next.js web host.
- **Convex:** a Modern Methods-controlled development deployment exists; production/live acceptance remains separate.

MadeThis is historical only. Do not synchronize back to it, deploy to it, migrate its data/secrets, or treat it as source of truth.

Do not call InventSmith deployed, production-ready, or live-verified until the exact intended code/config has actually been deployed to owner-controlled infrastructure and representative authenticated acceptance has passed there.

## 2. Latest repository gate

Latest verified code checkpoint before this documentation refresh:

- exact head: `d01b845b489ec8a7591980fa81d69b915c82d4fc`;
- InventSmith CI: **#210** (`38999026644`);
- conclusion: **success**;
- **114 test files / 650 tests**;
- production dependency audit: **0 vulnerabilities**;
- Next.js **15.5.27** production build passed with **32/32** static pages generated.

Exact-head CI verifies exact checkout, lockfile install, operational scripts, web/Convex TypeScript, regression tests, production audit, bounded development audit, and production build. The development advisory boundary accepts only `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`.

Lucia `3.2.2` remains deprecated and should be migrated only through a separately tested authentication change. This documentation refresh creates a newer head, so that final head must pass exact-head CI before being described as automatically verified.

## 3. Current Convex status

A Modern Methods-controlled **development** deployment is documented at `fiery-gazelle-628`. A prior checkpoint verified backend health/configuration there. This document does **not** claim exact head `d01b845b...` or this documentation refresh is deployed there.

The controlled Convex development deployment workflow remains manual and guarded by explicit confirmation, `CONVEX_DEPLOY_KEY`, and a development-key prefix check. Do not dispatch it casually.

## 4. Configuration inventory — names only

### Vercel / Next.js
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `CONVEX_DEPLOY_KEY`
- `NEXT_PUBLIC_PLATFORM_URL` — legacy compatibility setting; never point at MadeThis.

### Convex server
- `OPENAI_API_KEY`
- `ATLAS_OPENAI_MODEL` — historical compatibility identifier pending tested migration.
- `JWT_PRIVATE_KEY`
- `JWKS`
- `CONVEX_SITE_URL`
- `ADMIN_TOKEN_SECRET`
- `PLATFORM_FULFILLMENT_SECRET`
- `ATLAS_SUBSCRIPTION_WEBHOOK_SECRET`

Never place real secret values in source, docs, issues, logs, screenshots, or chat transcripts.

## 5. Fresh/intentional Convex deployment procedure

1. Confirm the exact candidate commit and exact-head CI success.
2. Use the Modern Methods-controlled Convex project/deployment only.
3. Install dependencies from the repository lockfile.
4. Run required Convex generation/type/schema checks and resolve failures.
5. Confirm auth/provider/admin/billing configuration without exposing secrets.
6. Deploy the exact intended head through the guarded environment-appropriate path.
7. Record the exact deployed commit and observed deployment result.
8. Verify scheduled work, storage, auth callbacks, signed HTTP/webhook endpoints, entitlement checks, and database/function health.
9. Only then describe that exact code as deployed; live functional verification still requires representative authenticated acceptance.

## 6. Fresh Vercel/frontend procedure

1. Create/use a Modern Methods-owned Vercel project from `jab1015/ProjectAtlas`.
2. Use the supported Node/package manager and lockfile.
3. Configure only public values in `NEXT_PUBLIC_*` variables.
4. Store server/build credentials in encrypted environment settings.
5. Point `NEXT_PUBLIC_CONVEX_URL` only to the intended owner-controlled Convex deployment.
6. Do not reuse MadeThis credentials/integration settings.
7. Build a preview first and run authenticated acceptance before production promotion.

## 7. Authentication/authorization acceptance

Using disposable accounts verify unauthenticated denial, cross-organization isolation, role boundaries, invitation/share/member/owner controls, backend entitlements, account/invention deletion boundaries, and zero unauthorized side effects on rejected consequential actions.

Repository tests already cover these deterministically; live acceptance must reproduce them with real disposable authenticated accounts.

## 8. Core representative acceptance

Exercise at least:

**Sign in → create invention → upload evidence → extraction → research/validation → decision/review → versioned deliverable/package → download/inspect.**

Run representative physical, software, hybrid, and regulated cases through their applicable paths.

## 9. Evidence/trust and worker acceptance

Verify provenance, source association, partial/failed-only retry, stale/disputed evidence, prompt-injection resistance, provider outage fail-closed behavior, duplicate/late/stale worker attempts, leases, bounded retries, cleanup, and conservative usage settlement.

AI/model output cannot satisfy real prototype, manufacturer quote, completed deployment/test, post-launch sales/analytics, or professional-review gates merely by assertion.

## 10. Engineering/manufacturing acceptance

Engineering review and manufacturing release remain separate. Manufacturing release must remain bound to the exact newest synchronized qualifying generation and must not itself contact a supplier, disclose artifacts, place an order, spend money, file, or publish.

## 11. External-use and consequential-action acceptance

For consequential artifact actions, require exact latest/fresh external-use authorization, exact artifact scope, authorized manager resolution, execution-time revalidation, and separate outside-world execution evidence. The repository currently has no executor for supplier contact, RFQs, disclosure, orders/payments, filings, or publication.

## 12. Billing, subscription, fulfillment, and download acceptance

Deterministic repository coverage now directly exercises:

- subscription duplicate/stale/invalid-target behavior and exact organization application;
- provider billing identity continuity across ownership transfer;
- signed subscription HTTP ingress with HMAC validation, UTF-8 byte limits, normalization, and exact mutation handoff;
- fulfillment replay idempotency across Stripe session/platform order identifiers;
- one-time sales counting and authoritative stored download-token reuse on replay;
- signed fulfillment HTTP ingress with zero product/purchase side effects on rejected requests;
- safe external purchase-ID normalization for download URLs;
- purchase token/fulfillment-state validation, product-scoped file selection, signed storage URL resolution, and download accounting before redirect.

Before paid plans/fulfillment are enabled live:

1. select/configure the owner-controlled provider integration;
2. verify real provider signatures and secret ownership;
3. test cancellation, past-due, duplicate, replay, out-of-order and delayed events;
4. exercise real checkout → fulfillment → success page → download with disposable purchases;
5. verify duplicate fulfillment neither increments sales twice nor returns a dead token;
6. verify malformed/wrong download links fail cleanly and successful downloads update accounting;
7. verify customer-visible pricing matches backend entitlements;
8. do not enable production billing until these checks pass.

## 13. Privacy, deletion, and storage acceptance

Verify account/organization export boundaries, invention/evidence deletion, generated/original storage cleanup, member departure, invitations, billing fail-closed requirements, deletion/anonymization semantics, and exclusion of credentials/tokens/secrets/unrelated organization data from exports.

## 14. Artifact quality acceptance

Do not accept outputs merely because a file exists. Open representative PDF/DOCX/PPTX/XLSX/CSV/image/CAD outputs and inspect content, formatting, metadata, evidence/limitation labels, and usability. Validate STEP/STL/DXF structure with appropriate tooling before advancing engineering maturity.

## 15. Operational acceptance

Before public production release establish tested procedures for uptime, spend alerts, backup/restore, key rotation, incidents, provider/model changes, billing/webhook incidents, rollback, privacy/deletion requests, and deployment access.

## 16. Release/status rule

Keep these states separate: implemented; automated verification passed; deployed; live functionally verified; professional review completed; real-world evidence present; external action executed.

Do not collapse them into one completion percentage or production-ready claim.
