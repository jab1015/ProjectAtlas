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

export function validateBlockedWorkResponse(status: string, response: string, humanGateType?: string): { valid: true; cleaned: string } | { valid: false; error: string } {
  if (status !== "blocked") return { valid: false, error: "Work item is not waiting for input" };
  if (humanGateType !== "private_information") return { valid: false, error: `Free-form text cannot satisfy the ${humanGateType ?? "unknown"} gate` };
  const cleaned = response.trim();
  if (cleaned.length === 0 || cleaned.length > 4000) return { valid: false, error: "Response must be between 1 and 4,000 characters" };
  return { valid: true, cleaned };
}

/** Free-form collaborator text may satisfy only a stored private-information gate. */
export function canRespondToBlockedWork(status: string, response: string, humanGateType?: string): boolean {
  return validateBlockedWorkResponse(status, response, humanGateType).valid;
}
