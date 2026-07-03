/**
 * Atlas Validation Research — Shared TypeScript Types
 *
 * These types are the canonical data model for Stage 2 Validation Automation.
 * They correspond to the `validationResearch` Convex table schema and are
 * safe to import in both server (Convex) and client (Next.js) code.
 *
 * Do NOT add Convex runtime imports here — keep this file pure TypeScript.
 */

// ── Status types ─────────────────────────────────────────────────────────────

export type ValidationResearchStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "stale";

export type ValidationSectionStatus =
  | "pending"
  | "approved"
  | "edited"
  | "rejected";

export type ValidationConfidenceLevel =
  | "very_high"
  | "high"
  | "moderate"
  | "low"
  | "very_low";

// ── Core interfaces ───────────────────────────────────────────────────────────

export interface ValidationConfidence {
  /** 0.0 – 1.0 */
  score: number;
  level: ValidationConfidenceLevel;
  evidenceSummary: string;
  assumptions: string[];
  missingInformation: string[];
}

export interface ValidationEvidence {
  source: string;
  relevance: string;
  reliability: string;
}

export interface ValidationAssumptions {
  assumption: string;
  impact: "high" | "medium" | "low";
}

export interface ValidationSection {
  /** e.g. "validationPlan", "competitorAnalysis" — see VALIDATION_SECTION_KEYS */
  sectionKey: string;
  title: string;
  /** Shape is provider-defined; kept as unknown to allow future providers freedom */
  generatedContent: unknown;
  confidence?: ValidationConfidence;
  approvalStatus: ValidationSectionStatus;
  /** Founder overrides — freeform, provider-independent */
  founderEdits?: unknown;
  /** Unix ms timestamp of last generation */
  lastGeneratedAt?: number;
}

export interface ValidationResearch {
  inventionId: string;
  stageId: string;
  researchStatus: ValidationResearchStatus;
  sections: ValidationSection[];
  /** Unix ms — when research run was started */
  startedAt?: number;
  /** Unix ms — when research run completed */
  completedAt?: number;
  /** Unix ms — last time any section was refreshed */
  lastRefreshAt?: number;
  /** Identifies which research provider version produced this result */
  providerVersion?: string;
  /** Monotonically increasing — bump when schema evolves */
  researchVersion?: number;
}

// ── Section keys ─────────────────────────────────────────────────────────────
// Extend this object when new providers add sections.
// DO NOT remove or rename existing keys — it would break stored data.

export const VALIDATION_SECTION_KEYS = {
  VALIDATION_PLAN: "validationPlan",
  CUSTOMER_SEGMENTS: "customerSegments",
  COMPETITOR_ANALYSIS: "competitorAnalysis",
  MARKET_SIZING: "marketSizing",
  VALIDATION_METHODS: "validationMethods",
  TIMELINE: "timeline",
  SURVEY_QUESTIONS: "surveyQuestions",
  LANDING_PAGE_DRAFT: "landingPageDraft",
  INTERVIEW_QUESTIONS: "interviewQuestions",
  RISK_ASSESSMENT: "riskAssessment",
  RECOMMENDATIONS: "recommendations",
} as const;

export type ValidationSectionKey =
  (typeof VALIDATION_SECTION_KEYS)[keyof typeof VALIDATION_SECTION_KEYS];
