# InventSmith Engineering Test Standards

## Standing Rule: Regression Testing

Effective immediately, every bug fix must include a regression test before the task is considered complete.

### Process

1. **Identify and document the root cause** — not just the symptom
2. **Fix the root cause**
3. **Add an automated regression test** — use the test framework already in the project (Jest, Vitest, Playwright, or Convex test utilities). If no framework exists, add the lightest-weight option that fits the stack.
4. **If automation isn't possible**, add a documented manual regression test in this file under `## Manual Regression Tests`
5. **Verify all existing regression tests still pass**
6. **Do not close the task** until the regression test is included

### This is part of the Definition of Done

All six Definition of Done gates must pass, AND a regression test must exist for every bug fix.

---

## Test Framework

**InventSmith uses [Vitest](https://vitest.dev/)** — installed as a dev dependency in `package.json`.

| Command | Purpose |
|---------|---------|
| `npm test` | Run all regression tests once |
| `npm run test:watch` | Run in watch mode during development |

Test files live in `src/__tests__/`.

Pure business logic is extracted to `src/lib/journeyLogic.ts` so it can be tested without a Convex runtime or browser environment.

---

## Automated Tests

This document is a standards/reference document, not the authoritative inventory of every current test file. The repository test suite under `src/__tests__/` and exact-head CI are the source of truth for current automated coverage. Representative long-lived regressions include:

| Test area | Representative file | Covers |
|------|------|--------|
| New Inventor Onboarding | `src/__tests__/onboarding.regression.test.ts` | Full onboarding flow and invention initialization |
| Stage 2 Validation | `src/__tests__/validation.regression.test.ts` | Provider section shape, state transitions, approval/edit/refresh behavior |
| Partial validation/recovery | validation recovery regression suite | Partial truth, preservation of successful sections, failed-only recovery |
| Evidence trust | evidence integrity/retrieval regression suite | Fail-closed promotion and retrieval-source binding |
| Worker reliability | orchestration/lease/CAD regression suite | Attempt identity, stale/late work, lease validity, cleanup |
| Usage settlement | usage settlement regression suite | Known incurred cost, unknown conservative settlement, idempotency |
| Product-type acceptance | representative product-type regression suite | Physical/software/hybrid/regulated routing and dependency closure |
| Artifact handoff/versioning | artifact/deliverable persistence regression suite | Newest-version selection, review state, artifact handoff |
| Real-world evidence gates | real-world evidence gate behavior suite | Manufacturer quote and launch/sales evidence gates |
| Professional review | professional-review regression suite | Auditable review decisions and required-review promotion |

Do not infer current coverage solely from this table; inspect the live test directory and exact-head CI for authoritative coverage.

---

## Manual Regression Tests

### MRT-001: New Inventor Onboarding (Critical)

**Date added**: 2026-06-29  
**Covers**: Full new-user onboarding flow  
**Trigger**: Run after any change to onboarding, Convex mutations (inventions, stageProgress, userProfiles), Journey Engine initialization, or auth flow

**Steps**:
1. Create a new account using a supported authentication method.
2. Sign in.
3. Complete Onboarding Steps 1–3.
4. Enter a valid invention title on Step 4.
5. Click **Create Invention**.

**Expected results**:
- [ ] Invention is created in the Convex `inventions` table
- [ ] User is redirected to the inventor workspace/dashboard
- [ ] Initial journey state is created for the invention
- [ ] No unexpected browser-console errors
- [ ] No failed required network requests
- [ ] Onboarding is marked complete on the user profile

**Pass criteria**: All six checkboxes satisfied with no unexpected errors.

---

### MRT-002: Delete Invention Project (Critical)

**Date added**: 2026-07-05
**Covers**: Delete invention from dashboard/workspace entry points
**Trigger**: Run after changes to deletion authorization, invention menu/workspace deletion UI, or related storage/cleanup behavior

**Steps**:
1. Sign in and navigate to an invention listing/dashboard.
2. Open the invention's action menu and select **Delete**.
3. Verify the confirmation dialog appears with the correct invention name.
4. Cancel and verify the invention remains unchanged.
5. Repeat and confirm deletion.
6. Verify the invention disappears from authorized listings/workspaces.
7. Verify related cleanup according to current deletion/privacy semantics.
8. Verify unauthorized users cannot delete the invention.

**Expected results**:
- [ ] Confirmation identifies the correct invention
- [ ] Cancel preserves the invention
- [ ] Authorized delete completes successfully
- [ ] Deleted invention is no longer accessible through normal listings
- [ ] Related records/storage follow current documented deletion semantics
- [ ] Cross-tenant/unauthorized delete is rejected server-side
- [ ] No unexpected console/backend errors
- [ ] Exact relevant automated checks/build still pass

**Pass criteria**: All eight checkboxes satisfied.

---

### Writing New Manual Regression Tests

When automation isn't feasible, add an entry following the MRT-001 pattern. Include: date added, what it covers, what changes should trigger a re-run, numbered steps, and explicit pass criteria.

---

## Naming note

Historical test names, workflow filenames, environment identifiers, or commit references may retain the former InventSmith / ProjectAtlas working name where changing them would break compatibility or falsify history. Current product prose uses **InventSmith**.

## Note on DEFINITION_OF_DONE.md

`/DEFINITION_OF_DONE.md` exists at the project root. Regression coverage remains part of the Definition of Done.
