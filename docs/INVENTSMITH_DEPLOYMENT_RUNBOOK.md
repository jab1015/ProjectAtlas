# InventSmith Owner-Controlled Deployment and Acceptance Runbook

**Status:** Repository implementation active; Convex development infrastructure exists; owner-controlled Vercel/frontend and full live acceptance are not complete  
**Product:** InventSmith — The Inventor OS by Modern Methods  
**Updated:** October 16, 2026 (America/New_York)  
**Active branch:** `inventsmith/full-product-build`  
**Pull request:** draft PR #24 — intentionally open and unmerged

## 1. Deployment authority and boundary

This runbook supersedes the previous MadeThis replication workflow.

Target ownership:

- **GitHub:** `jab1015/ProjectAtlas` remains the historical repository slug and source/CI authority.
- **Vercel:** a Modern Methods-owned project is the intended Next.js web host.
- **Convex:** a Modern Methods-controlled development deployment exists; owner-controlled production/live acceptance remains separate.

MadeThis is historical only. Do not synchronize back to it, deploy to it, modify it, migrate its test data/secrets, or treat it as current source of truth.

Do not call InventSmith deployed, production-ready, or live-verified until the exact intended code/config has actually been deployed to owner-controlled infrastructure and representative authenticated acceptance has passed there.

## 2. Latest repository gate

Use branch `inventsmith/full-product-build` and keep draft PR #24 unmerged unless the owner explicitly changes that boundary.

Latest verified code checkpoint before this documentation refresh:

- exact head: `2e0933bfdda56b3b005fb0a0e17363a77364c9f1`;
- InventSmith CI: **#165** (`38994705687`);
- conclusion: **success**;
- **107 test files / 603 tests**;
- production dependency audit: **0 vulnerabilities**;
- Next.js **15.5.27** production build passed with **32/32** static pages generated.

Exact-head CI verifies:

```text
checkout/assert exact expected head
npm ci
operational script syntax checks
npx tsc --noEmit
npx tsc -p convex --noEmit
npm test
npm audit --omit=dev --audit-level=high
development dependency advisory boundary
npx next build
```

The development advisory boundary currently accepts only `@next/eslint-plugin-next`, `braces`, `eslint-config-next`, `fast-glob`, and `micromatch`; unexpected advisory package names fail CI.

The Vitest config is now explicit ESM (`vitest.config.mts`) and native-loader compatible through `import.meta.dirname`; the prior loader warnings are gone. Lucia `3.2.2` remains deprecated and should be migrated only through a separately tested authentication change.

This documentation refresh creates a newer head, so the final documentation head must pass its own exact-head CI before being described as automatically verified.

Never suppress a failing gate, weaken tests, bypass exact-head verification, or downgrade a security check merely to obtain green CI.

## 3. Current Convex status

A Modern Methods-controlled **development** deployment is documented at `fiery-gazelle-628`. At the previously recorded checkpoint, backend health/configuration checks passed for deployed Convex functions/database connectivity, OpenAI server configuration, and Convex Auth signing configuration.

Important boundaries:

- that checkpoint is development infrastructure, not production acceptance;
- this document does not claim exact head `2e0933bf...` or the newer documentation head is deployed there;
- repository-green does not prove deployed/live behavior;
- backend health does not substitute for authenticated browser acceptance;
- provider, billing, professional-review, and real-world evidence acceptance remain separate.

The controlled Convex development deployment workflow remains manual and guarded by explicit confirmation, `CONVEX_DEPLOY_KEY`, and a development-key prefix check. Do not dispatch it casually or describe deployment unless a run was actually executed and observed.

## 4. Configuration inventory — names only

Never put real values in source, documentation, issues, logs, screenshots, or chat transcripts.

### Vercel / Next.js

- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `CONVEX_DEPLOY_KEY`
- `NEXT_PUBLIC_PLATFORM_URL` — legacy adapter setting; do not point at MadeThis.

### Convex server

- `OPENAI_API_KEY`
- `ATLAS_OPENAI_MODEL` — historical compatibility identifier pending tested migration.
- `JWT_PRIVATE_KEY`
- `JWKS`
- `CONVEX_SITE_URL`
- `ADMIN_TOKEN_SECRET`
- `PLATFORM_FULFILLMENT_SECRET` — legacy adapter secret; do not copy from MadeThis.
- `ATLAS_SUBSCRIPTION_WEBHOOK_SECRET` — historical compatibility identifier; preserve signature enforcement until deliberate tested migration.

Any newly required provider variable must be added by name/ownership before deployment. Never infer or invent values.

## 5. Fresh/intentional Convex deployment procedure

1. Confirm the exact candidate commit and verify exact-head CI is green.
2. Use the Modern Methods-controlled Convex project/deployment, never a MadeThis deployment/key.
3. Install dependencies from the repository lockfile.
4. Run required Convex generation/type/schema checks and resolve failures.
5. Confirm Convex Auth/server environment configuration is present without exposing secrets.
6. Confirm provider/admin/billing secrets only for integrations actually enabled.
7. Deploy the exact intended Convex head through the guarded path appropriate to the environment.
8. Record the exact deployed commit and observed deployment result.
9. Verify scheduled work, storage, auth callbacks, HTTP/webhook endpoints, entitlement checks, and database/function health.
10. Only then describe that exact code as deployed; live functional verification still requires representative authenticated acceptance.

## 6. Fresh Vercel/frontend procedure

1. Create/use a Modern Methods-owned Vercel project from `jab1015/ProjectAtlas`.
2. Use the supported Node/package manager and lockfile.
3. Configure only public values in `NEXT_PUBLIC_*` variables.
4. Store server/build credentials in encrypted environment settings.
5. Point `NEXT_PUBLIC_CONVEX_URL` only to the intended owner-controlled Convex deployment.
6. Leave legacy MadeThis/platform billing settings unset unless an owner-controlled replacement is intentionally configured and verified.
7. Build a preview first; do not attach production DNS during initial acceptance.
8. Run authenticated preview acceptance before promotion.

## 7. Authentication/authorization acceptance

Using disposable accounts, verify behavior rather than source strings:

- unauthenticated reads/writes are denied;
- cross-organization invention/evidence/deliverable/chat/usage/billing/private-artifact access is denied;
- Viewer cannot mutate;
- Member/Admin/Owner boundaries are server-enforced;
- Professional access is limited to explicit invention/review grants where required;
- ordinary users cannot execute administrator operations;
- backend entitlements and active-invention limits remain enforced if UI controls are bypassed;
- ownership/member departure and archival behavior preserve intended records;
- rejected consequential operations have no unauthorized side effects.

The repository now directly tests organization ownership transfer, member role/removal actions, privacy deletion execution, billing-sensitive export, personal-export scoping, and invitation acceptance. Live acceptance must still reproduce those boundaries with real disposable authenticated accounts.

## 8. Core representative acceptance

Exercise at least:

**Sign in → create invention → upload evidence → extraction → research/validation → decision/review → versioned deliverable/package → download/inspect.**

The workspace must make clear what completed, what is running, what failed, what is blocked and why, what authorization/input is required, what artifacts exist, and what happens next.

Run representative physical, software, hybrid, and regulated cases through their applicable paths.

## 9. Evidence/trust acceptance

Verify partial/failed-only retry, source provenance, claim/source association, distinction among sourced facts/inventor statements/estimates/AI inference, stale/disputed evidence behavior, prompt-injection resistance, and fail-closed behavior when production providers are unavailable.

AI/model output cannot satisfy real prototype, manufacturer quote, completed software deployment/test, post-launch sales/analytics, or professional-review gates merely by assertion.

## 10. Worker/resource acceptance

Test duplicate, late, stale, failed, blocked, cancelled, and retried attempts. Confirm lease/attempt identity, bounded retries, context/output bounds, cleanup, usage reservation/settlement, and conservative unknown-cost handling.

## 11. Engineering/manufacturing acceptance

For applicable physical/hybrid cases, verify Product Design Specification, CAD/geometry outputs, prototype/test planning, real physical-evidence gates, RFQ/manufacturing preparation, and genuine quote gates.

Engineering review and manufacturing release are separate. Manufacturing release must remain bound to the exact newest synchronized qualifying generation and must not itself contact a supplier, disclose artifacts, place an order, spend money, file, or publish.

## 12. External-use and consequential-action acceptance

For each consequential external artifact action:

1. authorize the exact latest fresh deliverable revision for external use;
2. create the consequential request bound to exact deliverable ID(s);
3. verify stale, unauthorized, wrong-invention, superseded, duplicate-latest, and legacy-unscoped artifacts fail closed;
4. approve/deny only as an authorized manager;
5. revalidate exact current approved scope immediately before any eventual outside-world side effect;
6. record outside-world execution separately from permission.

The current repository has no executor that sends RFQs, contacts suppliers/manufacturers, discloses invention artifacts, places orders/payments, files submissions, or publishes for the inventor.

## 13. Billing/webhook acceptance

Before paid plans are enabled:

1. inventory checkout, fulfillment, subscription-event and webhook consumers;
2. select the owner-controlled billing provider/integration;
3. replace/isolate legacy MadeThis-specific adapters/secrets;
4. verify signed/idempotent webhook handling and backend plan authority;
5. test cancellation, past-due, replay, duplicate, and out-of-order events;
6. verify customer-visible pricing matches backend entitlements;
7. do not enable production billing until those checks pass.

## 14. Privacy, organization, deletion, and storage acceptance

Verify account/organization export boundaries, invention/evidence deletion authorization, original/generated storage cleanup, member departure, invitations, billing fail-closed requirements, deletion/anonymization semantics, and exclusion of credentials/tokens/secrets/unrelated organization data from exports.

Current deterministic behavior coverage includes:

- administrator and company/studio owner account-deletion guards;
- privacy request terminal/admin/billing checks and execution ordering;
- personal export exclusion of company/studio inventions/billing events;
- organization export owner-only raw billing attribution;
- ownership transfer and member-role/removal safety;
- invitation exact-account/email binding, expiration, and current seat-capacity recheck before membership activation.

The next larger destructive path to harden behaviorally is invention deletion and its usage/storage cleanup/accounting behavior.

## 15. Artifact quality acceptance

Do not accept outputs merely because a file exists. Open representative PDF/DOCX/PPTX/XLSX/CSV/image/CAD outputs and inspect content, formatting, version metadata, evidence/limitation labels, and usability. For geometry, validate supported units/dimensions and STEP/STL/DXF structure with appropriate tooling before advancing maturity.

## 16. Operational acceptance

Before public production release establish owners/tested procedures for uptime, spend alerts, backup/restore, key rotation, incident response, provider/model changes, billing/webhook incidents, rollback, privacy/deletion requests, and deployment access.

## 17. Release/status rule

Keep these states separate: implemented; automated verification passed; deployed; live functionally verified; professional review completed; real-world evidence present; external action executed.

Do not collapse them into one completion percentage or production-ready claim.
