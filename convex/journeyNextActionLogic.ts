export function getValidationFollowUpAction(responseCount: number, status: string): string {
  if (status === "needs_refresh") {
    return "Open Validation to review the refresh started by new evidence.";
  }

  const remainingResponses = Math.max(0, 5 - Math.max(0, responseCount));
  if (remainingResponses > 0) {
    return `Share your prepared survey with ${remainingResponses} more ${remainingResponses === 1 ? "person" : "people"} who may have this problem, then add their answers as evidence.`;
  }

  return "Talk with a few people who use thick foods in jars. Ask what they do with the last portion, and add their answers as evidence.";
}
