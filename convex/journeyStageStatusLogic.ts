export type JourneyStageStatus = "complete" | "professional_review" | "blocked" | "working" | "queued" | "ready_to_start" | "planned" | "needs_refresh" | "failed";

export function getJourneyStageStatus(input: {
  requiredWorkCount: number;
  completedWorkCount: number;
  pendingProfessionalReviews: number;
  staleWorkCount: number;
  hasStaleDeliverable: boolean;
  failedWorkCount: number;
  blockedWorkCount: number;
  runningWorkCount: number;
  queuedWorkCount: number;
  initialized: boolean;
  stageId: number;
}): JourneyStageStatus {
  if (input.requiredWorkCount > 0 && input.completedWorkCount === input.requiredWorkCount && input.pendingProfessionalReviews > 0) return "professional_review";
  if (input.requiredWorkCount > 0 && input.completedWorkCount === input.requiredWorkCount) return "complete";
  if (input.staleWorkCount > 0 || input.hasStaleDeliverable) return "needs_refresh";
  if (input.failedWorkCount > 0) return "failed";
  if (input.blockedWorkCount > 0) return "blocked";
  if (input.runningWorkCount > 0) return "working";
  if (input.queuedWorkCount > 0) return "queued";
  return input.stageId <= 5 && !input.initialized ? "ready_to_start" : "planned";
}
