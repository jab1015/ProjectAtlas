/**
 * Atlas Validation Logic — pure business logic (no Convex runtime dependency).
 *
 * Extracted here so it can be imported by:
 *   - src/__tests__/validation.regression.test.ts (unit regression tests)
 *
 * Keep this file free of any Convex / Next.js / browser imports.
 * It re-exports from the provider and adds test-friendly pure helpers.
 */

// Re-export types and constants from the provider for use in tests.
// The provider file lives in convex/ but has no Convex runtime imports —
// it is plain TypeScript and safe to import in a node test environment.
export {
  MockValidationResearchProvider,
  ALL_SECTION_IDS,
  buildSectionById,
  type InventionContext,
  type ValidationSection,
  type ValidationSectionConfidence,
  type ValidationResearchResult,
  type ValidationResearchProvider,
} from "../../convex/validation/researchProvider";

import type { ValidationSection } from "../../convex/validation/researchProvider";

// ── Section status helpers ────────────────────────────────────────────────────

/**
 * Returns the section matching sectionId, or undefined.
 */
export function findSection(
  sections: ValidationSection[],
  sectionId: string
): ValidationSection | undefined {
  return sections.find((s) => s.sectionId === sectionId);
}

/**
 * Applies an approval to a section array (pure — does not mutate).
 */
export function applyApproval(
  sections: ValidationSection[],
  sectionId: string,
  approvedAt: number
): ValidationSection[] {
  return sections.map((s) =>
    s.sectionId === sectionId
      ? { ...s, status: "approved" as const, approvedAt }
      : s
  );
}

/**
 * Applies an edit to a section array (pure — does not mutate).
 */
export function applyEdit(
  sections: ValidationSection[],
  sectionId: string,
  editedContent: string,
  editedAt: number
): ValidationSection[] {
  return sections.map((s) =>
    s.sectionId === sectionId
      ? { ...s, editedContent, editedAt, status: "edited" as const }
      : s
  );
}

/**
 * Replaces a single section in the array (for refresh).
 * Resets status to "generated".
 */
export function applyRefresh(
  sections: ValidationSection[],
  updatedSection: ValidationSection
): ValidationSection[] {
  return sections.map((s) =>
    s.sectionId === updatedSection.sectionId
      ? { ...updatedSection, status: "generated" as const }
      : s
  );
}
