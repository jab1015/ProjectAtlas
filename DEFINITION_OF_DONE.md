# Definition of Done

A feature is **not complete** until all five of the following are true.
This applies to every feature, MVP and beyond.

---

## 1. Code

The implementation is complete and committed to the repository.

- All TypeScript errors resolved (`tsc --noEmit` passes)
- Build passes (`npm run build`)
- No broken imports or unresolved dependencies

---

## 2. Verification

All automated and scenario tests pass.

- Journey Engine scenarios A–E verified
- Edge cases (empty state, error state, loading state) handled
- No console errors in production build

---

## 3. Documentation

Relevant architecture and implementation documents are updated.

- `.agent/architecture-decisions.md` updated if a significant design choice was made
- `.agent/phase1-verification.md` (or equivalent) updated with scenario results
- Inline code comments added for non-obvious logic

---

## 4. Founder Review

The feature is reviewed from the inventor's perspective. Questions to answer:

- **Is it intuitive?** Can an inventor use it without reading instructions?
- **Does it reduce cognitive load?** Does it make the path forward clearer, not murkier?
- **Does it help inventors move forward?** Every screen must answer: "What should I do next?"
- **Does it align with the Product Vision?** Atlas is a mentor, not a dashboard.

---

## 5. Future Compatibility

The feature:

- Preserves **Engine Owns Progress** — no readiness/stage logic in React components
- Preserves **UI simplicity** — the UI renders backend output, it does not derive it
- Preserves **backend authority** — all permission checks use `isAdmin(ctx)` and `canAccessStage(ctx, stageId)`
- Does **not** increase unnecessary complexity — if unsure, leave a clean stub rather than a partial feature

---

Only after all six gates are satisfied is the feature considered complete.

---

## 6. Regression Gate

Every bug fix includes an automated regression test (or a documented MRT entry in [`docs/ENGINEERING_TEST_STANDARDS.md`](docs/ENGINEERING_TEST_STANDARDS.md)) before the task is closed.

- Automated tests run via `npm test` (Vitest)
- If automation isn't feasible, a Manual Regression Test (MRT) entry is added to `docs/ENGINEERING_TEST_STANDARDS.md`
- All existing regression tests must still pass before closing the task
