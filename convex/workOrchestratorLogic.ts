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
  inputSnapshot?: Record<string, unknown>;
}

export interface WorkSelectionResult<T> {
  selected: T | null;
  reason: "selected" | "already_running" | "budget_exceeded" | "entitlement_required" | "no_eligible_work";
}

/** Keep provider spend and database contention bounded while allowing independent departments to work together. */
export const MAX_CONCURRENT_DEPARTMENT_WORK_ITEMS = 3;

// Research and draft-production jobs should not strand an invention after a
// transient provider, retrieval, or image-generation failure. Recovery is
// deliberately bounded so a genuinely broken job remains visible instead of
// consuming credits forever.
export const MAX_AUTOMATIC_RECOVERY_CYCLES = 2;
const AUTOMATICALLY_RECOVERABLE_KINDS = new Set([
  "assumptions_unknowns", "competitor_discovery", "technical_feasibility",
  "market_feasibility", "preliminary_prior_art", "feature_prior_art_comparison",
  "distinguishing_features", "ip_readiness", "patent_design_handoff",
  "materials_manufacturing", "regulatory_screening", "evidence_verification",
  "preliminary_bom_cost", "concept_image_generation", "product_render_generation",
]);

export function automaticRecoveryCount(inputSnapshot: Record<string, unknown> | undefined): number {
  const value = inputSnapshot?.automaticRecoveryCount;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function shouldAutomaticallyRecoverFailedWork(
  kind: string | undefined,
  inputSnapshot: Record<string, unknown> | undefined,
  attemptCount: number,
  maxAttempts = 3,
): boolean {
  return Boolean(
    kind && AUTOMATICALLY_RECOVERABLE_KINDS.has(kind) && attemptCount >= maxAttempts &&
      automaticRecoveryCount(inputSnapshot) < MAX_AUTOMATIC_RECOVERY_CYCLES,
  );
}

export function selectNextWorkItem<T extends SchedulableWorkItem>(
  items: T[],
  availableCostUnits: number,
  now: number,
  canRunKind: (kind: string | undefined) => boolean = () => true,
  isMaturityEligible: (kind: string | undefined) => boolean = () => true,
  maxConcurrentWorkItems = MAX_CONCURRENT_DEPARTMENT_WORK_ITEMS,
  departmentStageId?: number
): WorkSelectionResult<T> {
  const activeCount = items.filter(
    (item) => item.status === "running" && (!item.leaseExpiresAt || item.leaseExpiresAt > now)
  ).length;
  if (activeCount >= maxConcurrentWorkItems) return { selected: null, reason: "already_running" };

  const completedKinds = new Set(
    items.filter((candidate) => candidate.status === "completed").map((candidate) => candidate.kind)
  );

  const dependencyEligible = items
    .filter((item) => {
      const attemptsRemain = item.attemptCount < (item.maxAttempts ?? 3);
      const queued = item.status === "queued";
      const expiredLease = item.status === "running" && Boolean(item.leaseExpiresAt && item.leaseExpiresAt <= now);
      const dependenciesComplete = (item.dependsOnKinds ?? []).every((kind) => completedKinds.has(kind));
      return attemptsRemain && dependenciesComplete && (queued || expiredLease);
    })
    .filter((item) => {
      const itemStageId = item.inputSnapshot?.departmentStageId ?? item.inputSnapshot?.stageId;
      return departmentStageId === undefined || itemStageId === departmentStageId;
    });

  const maturityEligible = dependencyEligible.filter((item) => isMaturityEligible(item.kind));
  const eligible = maturityEligible
    .filter((item) => canRunKind(item.kind))
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);

  if (!eligible.length && maturityEligible.length > 0) {
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
