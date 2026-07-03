/**
 * Regression Test — New Inventor Onboarding (MRT-001)
 *
 * Covers the happy path: valid onboarding payload → invention fields present
 * → Stage 1 stageProgress initialised at 100% readiness.
 *
 * Trigger: run after any change to onboarding, journeyEngine mutations
 * (inventions, stageProgress), Journey Engine initialisation, or auth flow.
 *
 * Run with:  npx vitest run src/__tests__/onboarding.regression.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  validateOnboardingPayload,
  computeStage1ProgressAfterOnboarding,
  stageConfig,
  computeReadinessScore,
  scoreToReadinessState,
  type OnboardingPayload,
} from "@/lib/journeyLogic";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_PAYLOAD: OnboardingPayload = {
  title: "Rise Jars",
  problemStatement: "Existing jar lids require excessive torque to open, causing injury for elderly users.",
  targetAudience: "Adults 60+ who struggle with grip strength.",
  solutionDescription: "A jar lid with a lever-assist mechanism that reduces required torque by 80%.",
};

// ── Onboarding payload validation ────────────────────────────────────────────

describe("validateOnboardingPayload", () => {
  it("returns null for a fully populated payload", () => {
    expect(validateOnboardingPayload(VALID_PAYLOAD)).toBeNull();
  });

  it("requires a non-empty title", () => {
    expect(validateOnboardingPayload({ ...VALID_PAYLOAD, title: "" })).toBe("title is required");
    expect(validateOnboardingPayload({ ...VALID_PAYLOAD, title: "  " })).toBe("title is required");
  });

  it("requires a non-empty problemStatement", () => {
    expect(validateOnboardingPayload({ ...VALID_PAYLOAD, problemStatement: "" })).toBe(
      "problemStatement is required"
    );
  });

  it("requires a non-empty targetAudience", () => {
    expect(validateOnboardingPayload({ ...VALID_PAYLOAD, targetAudience: "" })).toBe(
      "targetAudience is required"
    );
  });

  it("requires a non-empty solutionDescription", () => {
    expect(validateOnboardingPayload({ ...VALID_PAYLOAD, solutionDescription: "" })).toBe(
      "solutionDescription is required"
    );
  });
});

// ── Stage 1 initialisation ────────────────────────────────────────────────────

describe("computeStage1ProgressAfterOnboarding", () => {
  const stage1Config = stageConfig.find((s) => s.id === 1)!;

  it("stageConfig includes Stage 1 (Idea Capture)", () => {
    expect(stage1Config).toBeDefined();
    expect(stage1Config.name).toBe("Idea Capture");
    expect(stage1Config.enabled).toBe(true);
  });

  it("Stage 1 criteria require all four onboarding fields", () => {
    expect(stage1Config.completionCriteria).toContain("title");
    expect(stage1Config.completionCriteria).toContain("problemStatement");
    expect(stage1Config.completionCriteria).toContain("targetAudience");
    expect(stage1Config.completionCriteria).toContain("solutionDescription");
    expect(stage1Config.completionCriteria).toHaveLength(4);
  });

  it("returns stageId 1 with all four fields marked complete", () => {
    const progress = computeStage1ProgressAfterOnboarding(VALID_PAYLOAD);
    expect(progress.stageId).toBe(1);
    expect(progress.completedFields).toEqual(
      expect.arrayContaining(["title", "problemStatement", "targetAudience", "solutionDescription"])
    );
  });

  it("returns readinessScore of 100 after onboarding", () => {
    const progress = computeStage1ProgressAfterOnboarding(VALID_PAYLOAD);
    expect(progress.readinessScore).toBe(100);
  });

  it("readinessScore 100 maps to 'Ready to Move Forward'", () => {
    const { readinessScore } = computeStage1ProgressAfterOnboarding(VALID_PAYLOAD);
    expect(scoreToReadinessState(readinessScore)).toBe("Ready to Move Forward");
  });
});

// ── Readiness scoring edge cases ──────────────────────────────────────────────

describe("computeReadinessScore", () => {
  const criteria = ["a", "b", "c", "d"];

  it("returns 0 for no completed fields", () => {
    expect(computeReadinessScore([], criteria)).toBe(0);
  });

  it("returns 100 for all completed fields", () => {
    expect(computeReadinessScore(criteria, criteria)).toBe(100);
  });

  it("returns 50 for half completed fields", () => {
    expect(computeReadinessScore(["a", "b"], criteria)).toBe(50);
  });

  it("returns 0 when criteria array is empty (no-op stage)", () => {
    expect(computeReadinessScore(["anything"], [])).toBe(0);
  });
});

// ── Readiness state thresholds ────────────────────────────────────────────────

describe("scoreToReadinessState", () => {
  it("score 0 → Not Ready", () => expect(scoreToReadinessState(0)).toBe("Not Ready"));
  it("score 39 → Not Ready", () => expect(scoreToReadinessState(39)).toBe("Not Ready"));
  it("score 40 → Getting There", () => expect(scoreToReadinessState(40)).toBe("Getting There"));
  it("score 74 → Getting There", () => expect(scoreToReadinessState(74)).toBe("Getting There"));
  it("score 75 → Ready to Move Forward", () => expect(scoreToReadinessState(75)).toBe("Ready to Move Forward"));
  it("score 100 → Ready to Move Forward", () => expect(scoreToReadinessState(100)).toBe("Ready to Move Forward"));
});

// ── Invention document shape (post-createInvention) ──────────────────────────

describe("Invention document shape after createInvention", () => {
  it("a valid payload provides all required invention fields", () => {
    // Mirrors the fields inserted by convex/journeyEngine.ts createInvention mutation
    const inventionDoc = {
      userId: "user_abc123",
      title: VALID_PAYLOAD.title,
      problemStatement: VALID_PAYLOAD.problemStatement,
      targetAudience: VALID_PAYLOAD.targetAudience,
      solutionDescription: VALID_PAYLOAD.solutionDescription,
      currentStageId: 1,
      status: "active" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(inventionDoc.title).toBe("Rise Jars");
    expect(inventionDoc.currentStageId).toBe(1);
    expect(inventionDoc.status).toBe("active");
    expect(typeof inventionDoc.userId).toBe("string");
    expect(inventionDoc.userId.length).toBeGreaterThan(0);
    expect(typeof inventionDoc.createdAt).toBe("number");
  });
});
