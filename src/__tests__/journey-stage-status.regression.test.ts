import { describe, expect, it } from "vitest";
import { getJourneyStageStatus, getJourneyStageStatusExplanation } from "@convex/journeyStageStatusLogic";

const base = {
  requiredWorkCount: 8,
  completedWorkCount: 0,
  pendingProfessionalReviews: 0,
  staleWorkCount: 0,
  hasStaleDeliverable: false,
  failedWorkCount: 0,
  blockedWorkCount: 0,
  runningWorkCount: 0,
  queuedWorkCount: 0,
  initialized: true,
  stageId: 5,
};

describe("journey stage status accuracy", () => {
  it("shows queued tasks as queued rather than in progress", () => {
    expect(getJourneyStageStatus({ ...base, queuedWorkCount: 8 })).toBe("queued");
  });

  it("shows active work as working", () => {
    expect(getJourneyStageStatus({ ...base, runningWorkCount: 1, queuedWorkCount: 7 })).toBe("working");
  });

  it("keeps failure, blockers, refresh, review, and completion ahead of the queue state", () => {
    expect(getJourneyStageStatus({ ...base, failedWorkCount: 1, queuedWorkCount: 2 })).toBe("failed");
    expect(getJourneyStageStatus({ ...base, blockedWorkCount: 1, queuedWorkCount: 2 })).toBe("blocked");
    expect(getJourneyStageStatus({ ...base, staleWorkCount: 1, queuedWorkCount: 2 })).toBe("needs_refresh");
    expect(getJourneyStageStatus({ ...base, completedWorkCount: 8, pendingProfessionalReviews: 1 })).toBe("professional_review");
    expect(getJourneyStageStatus({ ...base, completedWorkCount: 8 })).toBe("complete");
  });

  it("describes stale and failed work according to whether it is running or queued", () => {
    expect(getJourneyStageStatusExplanation("needs_refresh", { runningWorkCount: 0, queuedWorkCount: 2 }))
      .toContain("Refresh work is queued");
    expect(getJourneyStageStatusExplanation("needs_refresh", { runningWorkCount: 1, queuedWorkCount: 1 }))
      .toContain("refreshing it now");
    expect(getJourneyStageStatusExplanation("failed", { runningWorkCount: 0, queuedWorkCount: 0 }))
      .toContain("has no retry queued");
  });
});
