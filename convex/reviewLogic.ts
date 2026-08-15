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

export function canRespondToBlockedWork(status: string, response: string): boolean {
  const length = response.trim().length;
  return status === "blocked" && length > 0 && length <= 4000;
}
