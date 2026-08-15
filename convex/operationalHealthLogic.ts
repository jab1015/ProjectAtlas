export type WorkHealthStatus = "healthy" | "blocked" | "failed" | "expired";

export function classifyWorkHealth(
  item: { status: string; leaseExpiresAt?: number },
  now: number
): WorkHealthStatus {
  if (item.status === "running" && (item.leaseExpiresAt ?? Number.POSITIVE_INFINITY) <= now) return "expired";
  if (item.status === "failed") return "failed";
  if (item.status === "blocked" || item.status === "awaiting_approval") return "blocked";
  return "healthy";
}

export function operationalSeverity(status: WorkHealthStatus): number {
  if (status === "failed") return 0;
  if (status === "expired") return 1;
  if (status === "blocked") return 2;
  return 3;
}
