# Atlas Controlled-Pilot Deployment Runbook

**Status:** Pre-deployment  
**Scope:** Idea-to-Feasibility and IP-Readiness controlled pilot

## 1. Local readiness

Run `npm run readiness`. The command prints variable names and readiness states only; it never prints secret values. Resolve every `BLOCK` item before attempting a deployment. Treat `WARN` items as required manual checks for a pilot, not optional suggestions.

Then run:

1. `npx tsc --noEmit`
2. `npx tsc -p convex/tsconfig.json --noEmit`
3. `npm test`
4. `npm run build`

The normal build includes Convex code generation and therefore must target the intended deployment. GitHub pull requests also run Atlas CI: both TypeScript targets, the full regression suite, the production dependency audit, and the Next production build must pass before merge.

## 2. Provision Convex

Use the Convex CLI's interactive development/deployment setup or the Convex dashboard to create and select the Atlas project. Confirm that `.env.local` contains the generated `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` entries. Do not hand-invent deployment identifiers.

After deployment, call `GET https://<deployment>.convex.site/api/health`. A pilot-ready response must return HTTP 200 with `ok: true`, `ready: true`, and `databaseReachable: true`. The endpoint exposes configuration booleans only; it must never expose secret values, user data, invention data, or detailed operational errors. Use this endpoint for external uptime monitoring.

## 3. Configure secrets safely

Configure these in the Convex deployment environment, not in browser-exposed `NEXT_PUBLIC_*` variables:

- `OPENAI_API_KEY`
- `ATLAS_OPENAI_MODEL` (optional; defaults to the tested model)
- `CONVEX_SITE_URL`
- Convex Auth key material created by the auth provisioning flow
- `PLATFORM_FULFILLMENT_SECRET`
- `ATLAS_SUBSCRIPTION_WEBHOOK_SECRET` (independent from the fulfillment secret)
- Any future monitoring, storage, or provider secrets

Never paste a secret into source files, screenshots, issues, chat messages, command output, or deployment logs. Use a masked dashboard field or an approved interactive secret-input flow. After configuration, verify only presence and a successful minimal call—not the value.

## 4. Pre-pilot smoke test

Create a new non-safety-critical US consumer-product invention and verify:

- Intake creates a canonical invention record and a dependency-based work queue.
- Only one leased work item runs at a time.
- The 15-minute maintenance sweep resumes queued work and safely reclaims an expired lease without inventor interaction.
- Two simultaneous claims for the same account reserve cost atomically and cannot exceed the tier's daily autonomous allowance.
- A retried expired lease reuses its existing reservation instead of charging a second reservation.
- Completion, terminal failure, a human gate, and test-invention deletion each settle or return their reservation.
- Autonomous work and chat responses stop at their configured output-token ceilings.
- The admin operations console rejects non-admin accounts and accurately surfaces terminal failures, expired leases, human gates, and current used/reserved daily cost.
- Research stores exact source locators as unverified before the verification stage.
- Missing source URLs cannot become sourced facts.
- Human gates stop work and the review response resumes the same work item.
- Consequential actions remain behind explicit approvals.
- Evidence verification promotes only qualifying findings and deliverables.
- Evidence promotion rejects missing, malformed, future-dated, or more-than-90-day-old source verification and requires refreshed research before relying on stale evidence.
- The maintenance sweep marks outputs tied to expired trusted evidence stale, queues exactly one evidence refresh, and removes only its own freshness marker after successful re-verification.
- Ask Atlas uses the invention record and labels draft evidence accurately.
- Ask Atlas caps total model context, bounds each supplied record, and limits conversation reads while preserving the most recent messages.
- The execution history records attempts, costs, failures, gates, and resolutions without secrets.
- Signed subscription events are idempotent, out-of-order events cannot overwrite newer state, canceled/past-due access follows the paid-period rule, and unrecognized free-tier claims are rejected.
- Explorer, Inventor, and Pro accounts cannot claim work above their backend entitlement even if a client attempts to invoke the queue directly.
- Deleting the test invention removes all invention-owned child records.
- An account-deletion privacy request cannot be manually marked completed; it must use the deletion executor.
- A paid account deletion fails closed until the administrator records that external billing was cancelled or otherwise resolved.
- The deletion executor removes every invention and generated/uploaded storage object, clears usage and notifications, anonymizes retained transaction/subscription rows, invalidates auth sessions and refresh tokens, deletes auth accounts/verification codes, and finally removes the user record.
- Run one deletion restoration test against a disposable pilot account: confirm the deleted identity cannot sign in, deleted data cannot be recovered from normal application queries, retained financial rows contain no user identity, and the privacy request retains an auditable completion summary.

## 5. Operations gate

Before inviting a pilot inventor, name owners for:

- External monitoring of `/api/health` and alert response
- OpenAI and Convex spend alerts
- Data export/backups and restoration testing
- Incident response and key rotation
- User deletion/privacy requests
- Prompt/model change approval
- Rollback decision and deployment access

## 6. Release rule

Do not describe Atlas as patentability, freedom-to-operate, legal, regulatory, or engineering approval. Do not enable safety-critical categories. A pilot release is authorized only after the full representative-case evaluation in the build-progress document is complete and its blockers are closed or explicitly accepted by the release owner.
