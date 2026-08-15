export interface RecoverableWorkItem {
  status: string;
  leaseExpiresAt?: number;
}

export function hasRecoverableAutonomousWork(items: RecoverableWorkItem[], now: number): boolean {
  return items.some((item) => item.status === "queued" || (item.status === "running" && item.leaseExpiresAt !== undefined && item.leaseExpiresAt <= now));
}

export function shouldQueueEvidenceRefresh(status: string | undefined): boolean {
  return Boolean(status && status !== "queued" && status !== "running");
}
