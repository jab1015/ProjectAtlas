export interface WorkLedgerProgressItem {
  kind: string;
  status: string;
  updatedAt?: number;
  _id?: unknown;
}

/**
 * A work kind can have multiple revisions after refresh/retry/migration.
 * Progress must count only the newest ledger row for each kind everywhere.
 */
export function latestWorkByKind<T extends WorkLedgerProgressItem>(items: readonly T[]): T[] {
  const latest = new Map<string, T>();
  for (const item of items) {
    const current = latest.get(item.kind);
    if (!current || (item.updatedAt ?? 0) > (current.updatedAt ?? 0)) latest.set(item.kind, item);
  }
  return [...latest.values()];
}

export function progressForWorkKinds<T extends WorkLedgerProgressItem>(items: readonly T[], requiredKinds: readonly string[]) {
  const currentByKind = new Map(latestWorkByKind(items).map((item) => [item.kind, item]));
  const relevant = requiredKinds.map((kind) => currentByKind.get(kind)).filter(Boolean) as T[];
  const completed = relevant.filter((item) => item.status === "completed").length;
  const running = relevant.filter((item) => item.status === "running").length;
  const queued = relevant.filter((item) => item.status === "queued").length;
  const failed = relevant.filter((item) => item.status === "failed").length;
  const blocked = relevant.filter((item) => item.status === "blocked" || item.status === "awaiting_approval").length;
  const allComplete = requiredKinds.length > 0 && completed === requiredKinds.length;
  return {
    relevant,
    initialized: relevant.length,
    required: requiredKinds.length,
    completed,
    running,
    queued,
    failed,
    blocked,
    allComplete,
    progressPercent: allComplete
      ? 100
      : running > 0
        ? Math.max(1, Math.min(99, Math.round(((completed + 0.25) / Math.max(requiredKinds.length, 1)) * 100)))
        : Math.round((completed / Math.max(requiredKinds.length, 1)) * 100),
  };
}
