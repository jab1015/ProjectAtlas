# Engineering Test Standards

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

**Atlas uses [Vitest](https://vitest.dev/)** — installed as a dev dependency in `package.json`.

| Command | Purpose |
|---------|---------|
| `npm test` | Run all regression tests once |
| `npm run test:watch` | Run in watch mode during development |

Test files live in `src/__tests__/`.

Pure business logic is extracted to `src/lib/journeyLogic.ts` so it can be tested without a Convex runtime or browser environment.

---

## Automated Tests

List all automated regression tests here as they are added.

| Test | File | Covers |
|------|------|--------|
| New Inventor Onboarding | `src/__tests__/onboarding.regression.test.ts` | Full onboarding flow: payload validation → invention fields → Stage 1 initialized at 100% readiness |
| Stage 2 Validation — Provider section completeness | `src/__tests__/validation.regression.test.ts` | MockValidationResearchProvider returns all 11 required sections with correct shape |
| Stage 2 Validation — No hardcoded content | `src/__tests__/validation.regression.test.ts` | Verifies invention title from context appears in content; no Rise Jars or hardcoded product names |
| Stage 2 Validation — Status transitions | `src/__tests__/validation.regression.test.ts` | Simulates running → complete row state transitions |
| Stage 2 Validation — approveValidationSection | `src/__tests__/validation.regression.test.ts` | applyApproval sets status to "approved", records approvedAt, does not affect other sections |
| Stage 2 Validation — editValidationSection | `src/__tests__/validation.regression.test.ts` | applyEdit persists editedContent, editedAt, status "edited"; original content preserved |
| Stage 2 Validation — refreshValidationSection | `src/__tests__/validation.regression.test.ts` | applyRefresh updates only the target section; all others unchanged; status reset to "generated" |
| Stage 2 Validation — ALL_SECTION_IDS completeness | `src/__tests__/validation.regression.test.ts` | Confirms all 11 section IDs are present; buildSectionById works for all; throws for unknown IDs |

---

## Manual Regression Tests

### MRT-001: New Inventor Onboarding (Critical)

**Date added**: 2026-06-29  
**Covers**: Full new-user onboarding flow  
**Trigger**: Run after any change to onboarding, Convex mutations (inventions, stageProgress, userProfiles), Journey Engine initialization, or auth flow

**Steps**:
1. Create a new account (email + password) at `/sign-up`
2. Sign in
3. Complete Onboarding Step 1 (inventor name / context)
4. Complete Onboarding Step 2
5. Complete Onboarding Step 3
6. Enter a valid invention title (e.g. "Rise Jars") on Step 4
7. Click **Create Invention**

**Expected results**:
- [ ] Invention is created in the Convex `inventions` table
- [ ] User is redirected to the Inventor Dashboard (`/dashboard` or `/invention/[id]`)
- [ ] Stage 1 is initialized in `stageProgress` for the new invention
- [ ] No errors in the browser console
- [ ] No failed network requests
- [ ] Onboarding marked complete on the user profile

**Pass criteria**: All six checkboxes satisfied with no errors.

---

### MRT-002: Delete Invention Project (Critical)

**Date added**: 2026-07-05
**Covers**: Delete invention from dashboard card context menu and invention workspace
**Trigger**: Run after any change to `deleteInvention` mutation, `InventionCardMenu` component, dashboard page, inventions list page, or invention workspace page

**Steps**:
1. Sign in and navigate to `/dashboard`
2. Click the ⋮ (three-dot) icon on the primary project card
3. Select **Delete**
4. Verify the confirmation dialog appears with the correct invention name
5. Click **Cancel** — verify the dialog closes and the invention is unchanged
6. Click the ⋮ icon again and select **Delete**
7. Click **Delete Project** (red button) to confirm
8. Verify the dashboard redirects to `/onboarding` immediately
9. Navigate to `/inventions` — verify the deleted project is no longer listed
10. Optionally verify in Convex dashboard: no `inventions`, `stageProgress`, `validationResearch`, `conversations`, `documents`, or `notifications` rows remain for the deleted `inventionId`

**Expected results**:
- [ ] ⋮ icon appears on the card (always on mobile, on hover on desktop)
- [ ] Confirmation dialog shows correct invention title
- [ ] Cancel preserves the invention
- [ ] Successful delete shows "Project deleted successfully." toast
- [ ] Dashboard redirects to `/onboarding` after delete
- [ ] No orphan records in any related table
- [ ] Unauthorized users cannot delete (mutation throws ConvexError)
- [ ] Build passes; no TypeScript errors

**Pass criteria**: All eight checkboxes satisfied with no console errors.

---

### Writing New Manual Regression Tests

When automation isn't feasible, add an entry here following the MRT-001 template. Include: date added, what it covers, what changes should trigger a re-run, numbered steps, and explicit pass criteria.

---

## Note on DEFINITION_OF_DONE.md

`/DEFINITION_OF_DONE.md` exists at the project root. The regression gate has been appended to that file as gate 6.
