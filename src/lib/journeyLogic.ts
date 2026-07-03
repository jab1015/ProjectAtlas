/**
 * Atlas Journey Engine — pure business logic (no Convex runtime dependency).
 *
 * Extracted here so it can be imported by:
 *   - convex/journeyEngine.ts (server-side mutations / queries)
 *   - src/__tests__/onboarding.test.ts (unit regression tests)
 *
 * Keep this file free of any Convex / Next.js / browser imports.
 */

// ── Stage Configuration ──────────────────────────────────────────────────────

export const stageConfig = [
  {
    id: 1,
    name: "Idea Capture",
    enabled: true,
    requiredTier: "explorer",
    completionCriteria: ["title", "problemStatement", "targetAudience", "solutionDescription"],
    nextAction: "Describe your invention — what problem does it solve and who is it for?",
    comingSoon: false,
  },
  {
    id: 2,
    name: "Validation",
    enabled: true,
    requiredTier: "explorer",
    completionCriteria: ["validationMethod", "targetMarketSize", "competitorAnalysis"],
    nextAction: "Validate your idea — confirm there's a real market and real demand.",
    comingSoon: false,
  },
  {
    id: 3,
    name: "Market Research",
    enabled: true,
    requiredTier: "explorer",
    completionCriteria: ["marketSegment", "customerPersona", "pricePoint"],
    nextAction: "Define your market — who will buy this, and at what price?",
    comingSoon: false,
  },
  {
    id: 4,
    name: "Patent Research",
    enabled: true,
    requiredTier: "explorer",
    completionCriteria: ["priorArtSearch", "patentabilityAssessment", "inventionDisclosure"],
    nextAction: "Research patents — ensure your invention is novel and protectable.",
    comingSoon: false,
  },
  { id: 5, name: "Product Design", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 6, name: "Engineering", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 7, name: "Prototype", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 8, name: "Testing", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 9, name: "IP Protection", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 10, name: "Manufacturing", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 11, name: "Funding", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 12, name: "Branding", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 13, name: "Marketing", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 14, name: "Sales", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
  { id: 15, name: "Growth", enabled: false, requiredTier: "inventor_pro", completionCriteria: [] as string[], nextAction: "", comingSoon: true },
];

// ── Readiness Helpers ────────────────────────────────────────────────────────

export function computeReadinessScore(completedFields: string[], criteria: string[]): number {
  if (criteria.length === 0) return 0;
  const completed = criteria.filter((c) => completedFields.includes(c)).length;
  return Math.round((completed / criteria.length) * 100);
}

export type ReadinessState = "Not Ready" | "Getting There" | "Ready to Move Forward";

export function scoreToReadinessState(score: number): ReadinessState {
  if (score >= 75) return "Ready to Move Forward";
  if (score >= 40) return "Getting There";
  return "Not Ready";
}

// ── Onboarding payload validation ────────────────────────────────────────────

export interface OnboardingPayload {
  title: string;
  problemStatement: string;
  targetAudience: string;
  solutionDescription: string;
}

/**
 * Validates that an onboarding payload contains all required non-empty fields.
 * Returns null on success or an error string describing the first missing field.
 */
export function validateOnboardingPayload(payload: OnboardingPayload): string | null {
  if (!payload.title?.trim()) return "title is required";
  if (!payload.problemStatement?.trim()) return "problemStatement is required";
  if (!payload.targetAudience?.trim()) return "targetAudience is required";
  if (!payload.solutionDescription?.trim()) return "solutionDescription is required";
  return null;
}

/**
 * Computes what stageProgress should look like immediately after onboarding.
 * Stage 1 is always 100% complete because all four criteria are provided.
 */
export function computeStage1ProgressAfterOnboarding(payload: OnboardingPayload): {
  stageId: number;
  completedFields: string[];
  readinessScore: number;
} {
  const stage1 = stageConfig.find((s) => s.id === 1)!;
  const completedFields = stage1.completionCriteria;
  const readinessScore = computeReadinessScore(completedFields, stage1.completionCriteria);
  return { stageId: 1, completedFields, readinessScore };
}
