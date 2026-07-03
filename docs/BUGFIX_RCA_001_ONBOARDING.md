# BUGFIX RCA 001 — Onboarding Step 4: Create Invention

**Date:** 2026-06-29
**Severity:** Critical (blocked all new users)
**Status:** Fixed

---

## 1. Root Cause

The `createInvention` Convex mutation was failing with an unhandled exception that was swallowed by the frontend's generic catch block, producing "Something went wrong. Please try again." The mutation was attempting to initialize Stage 1 `stageProgress` records via the Journey Engine before verifying that the authenticated user's `users` row existed in the database. On the first sign-in with Google (or any OAuth flow that completes asynchronously), the Convex `users` row is written by the auth callback — but there is a brief window where the session token is valid and `getAuthUserId(ctx)` returns a user ID, yet the corresponding row in the `users` table has not yet been committed. The mutation read a null user document and proceeded, triggering a schema validation error (required fields missing) that Convex surfaced as an internal exception.

Secondary issue: the frontend catch block converted every Convex `ConvexError` and generic `Error` to the same user-facing string, making triage impossible.

---

## 2. Why It Happened

- The mutation was written assuming the `users` row always exists by the time `createInvention` is called, which is true for email/password sign-up (synchronous) but not guaranteed for OAuth (async callback).
- No guard clause validated user existence before proceeding to Journey Engine initialization.
- The frontend error handler was intentionally generic at MVP time to avoid exposing raw Convex errors to users — but it was never updated to at least log the underlying error or surface a meaningful message in development mode.
- No end-to-end test covered the complete onboarding → invention creation → Stage 1 init path before ship.

---

## 3. Fix Implemented

**Backend (`convex/inventions.ts` — `createInvention` mutation):**
- Added a guard at the top of the mutation: `const user = await ctx.db.get(userId); if (!user) throw new ConvexError("USER_NOT_FOUND");`
- Wrapped the full mutation body in a try/catch that re-throws typed `ConvexError` values and logs unexpected errors with `console.error` before re-throwing.

**Frontend (`src/components/onboarding/StepFour.tsx`):**
- Updated the catch block to check `error instanceof ConvexError` and map known error codes (e.g. `USER_NOT_FOUND`, `VALIDATION_FAILED`) to user-friendly messages.
- In non-production environments, the raw error message is also written to `console.error` so engineers see the real failure immediately.
- Added a 500 ms retry with user existence re-check for the `USER_NOT_FOUND` case, covering the race window.

---

## 4. Regression Protection

**Automated test:** `src/__tests__/onboarding.regression.test.ts`
- MRT-001 covers the full 4-step onboarding path, including:
  - Invention payload validation (all required fields present)
  - Stage 1 initialization producing readiness score ≥ 0
  - Invention document shape matching the schema
  - Readiness state thresholds (Not Ready / Getting There / Ready to Move Forward)

**Manual regression test (MRT-001)** is documented in `docs/ENGINEERING_TEST_STANDARDS.md` and must be run before every release that touches auth, onboarding, or the Journey Engine.

---

## 5. Verification

| Step | Status |
|------|--------|
| Account created | ✅ |
| Authentication succeeds | ✅ |
| Onboarding Steps 1–4 complete | ✅ |
| Invention created in database | ✅ |
| Stage 1 initialized (stageProgress row written) | ✅ |
| Dashboard loads with invention visible | ✅ |
| No console errors | ✅ |
| No backend errors / Convex exceptions | ✅ |

---

## Lessons Learned

- Guard all mutations against missing dependent rows, even when the auth token is valid.
- Generic error handlers must always log the original error in development.
- Every happy-path user journey requires an automated regression test before the feature ships.
