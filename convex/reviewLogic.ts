export function readDecisionOptionKeys(options: unknown[]): string[] {
  return options.flatMap((option) => {
    if (!option || typeof option !== "object" || !("key" in option)) return [];
    const key = (option as { key?: unknown }).key;
    return typeof key === "string" && key.length > 0 ? [key] : [];
  });
}

export function canResolveDecision(status: string, selectedOptionKey: string, options: unknown[]): boolean {
  return status === "open" && readDecisionOptionKeys(options).includes(selectedOptionKey);
}

export function canResolveApproval(status: string): boolean {
  return status === "pending";
}

/**
 * Free-form collaborator text may satisfy only a private-information/input gate.
 * Consequential gates have dedicated proof/authorization paths and must never be
 * converted back to queued work merely because somebody typed a response:
 * decisions use resolveDecision, authorizations use approval requests, professional
 * review is admin-recorded, physical work requires real evidence, and payment must
 * remain an explicit external action.
 *
 * The gate argument is optional only for compatibility with the older mutation
 * caller. Omission deliberately fails closed; the caller must explicitly identify
 * a private-information gate before free-form text can release work.
 */
export function canRespondToBlockedWork(
  status: string,
  response: string,
  humanGateType?: string
): boolean {
  const length = response.trim().length;
  return status === "blocked" && humanGateType === "private_information" && length > 0 && length <= 4000;
}
