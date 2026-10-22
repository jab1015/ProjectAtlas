export function getValidationFollowUpAction(
  responseCount: number,
  status: string,
  counts: { runningWorkCount: number; queuedWorkCount: number; queuedWorkTitle?: string; staleReason?: string } = { runningWorkCount: 0, queuedWorkCount: 0 },
): string {
  if (status === "needs_refresh") {
    if (counts.runningWorkCount > 0) return "Validation is refreshing now. Check Journey Center for the latest progress.";
    if (counts.queuedWorkCount > 0) return `Validation refresh is queued${counts.queuedWorkTitle ? ` for “${counts.queuedWorkTitle}”` : ""}${counts.staleReason ? ` because ${counts.staleReason}` : ""}. It will start when prerequisites and worker capacity are ready.`;
    return "Open Validation to review the new evidence and the next available action.";
  }

  const remainingResponses = Math.max(0, 5 - Math.max(0, responseCount));
  if (remainingResponses > 0) {
    return `Share your prepared survey with ${remainingResponses} more ${remainingResponses === 1 ? "person" : "people"} who may have this problem, then add their answers as evidence.`;
  }

  return "Talk with a few people who use thick foods in jars. Ask what they do with the last portion, and add their answers as evidence.";
}
