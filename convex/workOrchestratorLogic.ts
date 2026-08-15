export interface SchedulableWorkItem {
  _id: string;
  status: string;
  priority: number;
  createdAt: number;
  attemptCount: number;
  maxAttempts?: number;
  estimatedCostUnits?: number;
  leaseExpiresAt?: number;
  kind?: string;
  dependsOnKinds?: string[];
}

export interface WorkSelectionResult<T> {
  selected: T | null;
  reason: "selected" | "already_running" | "budget_exceeded" | "entitlement_required" | "no_eligible_work";
}

export function selectNextWorkItem<T extends SchedulableWorkItem>(
  items: T[],
  availableCostUnits: number,
  now: number,
  canRunKind: (kind: string | undefined) => boolean = () => true
): WorkSelectionResult<T> {
  const activelyRunning = items.some(
    (item) => item.status === "running" && (!item.leaseExpiresAt || item.leaseExpiresAt > now)
  );
  if (activelyRunning) return { selected: null, reason: "already_running" };

  const dependencyEligible = items
    .filter((item) => {
      const attemptsRemain = item.attemptCount < (item.maxAttempts ?? 3);
      const queued = item.status === "queued";
      const expiredLease = item.status === "running" && Boolean(item.leaseExpiresAt && item.leaseExpiresAt <= now);
      const completedKinds = new Set(
        items.filter((candidate) => candidate.status === "completed").map((candidate) => candidate.kind)
      );
      const dependenciesComplete = (item.dependsOnKinds ?? []).every((kind) => completedKinds.has(kind));
      return attemptsRemain && dependenciesComplete && (queued || expiredLease);
    });
  const eligible = dependencyEligible
    .filter((item) => canRunKind(item.kind))
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);

  if (!eligible.length && dependencyEligible.length > 0) {
    return { selected: null, reason: "entitlement_required" };
  }

  const selected = eligible.find(
    (item) => (item.estimatedCostUnits ?? 0) <= availableCostUnits
  );
  if (!selected && eligible.length > 0) {
    return { selected: null, reason: "budget_exceeded" };
  }
  if (!selected) return { selected: null, reason: "no_eligible_work" };
  return { selected, reason: "selected" };
}

export function shouldRetryWork(attemptCount: number, maxAttempts = 3): boolean {
  return attemptCount < maxAttempts;
}

export function costUnitsFromTokens(totalTokens: number | undefined): number {
  if (!totalTokens || totalTokens < 1) return 0;
  return Math.ceil(totalTokens / 1000);
}

export function shouldContinueAutonomousRun(
  stopReason: string,
  remainingBudget: number
): boolean {
  return stopReason === "turn_limit" && remainingBudget > 0;
}

export function shouldScheduleAutonomousRetry(
  willRetry: boolean,
  remainingBudget: number
): boolean {
  return willRetry && remainingBudget > 0;
}
