export type JourneyStageStatus = "complete" | "professional_review" | "blocked" | "working" | "queued" | "ready_to_start" | "planned" | "needs_refresh" | "failed";

export function getJourneyStageStatusExplanation(
  status: JourneyStageStatus,
  counts: { runningWorkCount: number; queuedWorkCount: number; queuedWorkTitle?: string; staleReason?: string },
): string {
  if (status === "complete") return "InventSmith finished the required work for this stage.";
  if (status === "professional_review") return "InventSmith prepared the work; a qualified professional must review it.";
  if (status === "blocked") return "InventSmith is waiting for the specific information or authorization shown above.";
  if (status === "needs_refresh") {
    if (counts.runningWorkCount > 0) return "New evidence changed this stage. InventSmith is refreshing it now.";
    if (counts.queuedWorkCount > 0) return `New evidence changed this stage${counts.staleReason ? ` (${counts.staleReason})` : ""}. Refresh work is queued${counts.queuedWorkTitle ? `; next: ${counts.queuedWorkTitle}` : ""} and will start when prerequisites and worker capacity are ready.`;
    return "New evidence changed this stage. Open the stage to review its next available action.";
  }
  if (status === "failed") {
    if (counts.runningWorkCount > 0) return "A failed step is being retried now.";
    if (counts.queuedWorkCount > 0) return "A failed step is queued for an automatic retry when worker capacity is available.";
    return "A step failed and has no retry queued. Open the stage details to review the available recovery action.";
  }
  if (status === "queued") return "InventSmith has queued this stage’s work. It will start when its prerequisites and worker capacity are ready.";
  if (counts.runningWorkCount > 0) return "InventSmith is working on this now.";
  return "This stage will begin when its prerequisites are ready.";
}

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
