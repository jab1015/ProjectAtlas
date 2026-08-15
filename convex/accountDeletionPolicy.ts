export function requiresExternalBillingResolution(
  tier: string | undefined,
  status: string | undefined,
  currentPeriodEnd: number | undefined,
  now: number,
): boolean {
  const isPaidTier = tier !== undefined && tier !== "free" && tier !== "explorer";
  if (!isPaidTier) return false;

  const effectiveStatus = status ?? "active";
  const potentiallyBillable = new Set(["trialing", "active", "past_due", "canceled"]);
  if (!potentiallyBillable.has(effectiveStatus)) return false;

  return currentPeriodEnd === undefined || currentPeriodEnd >= now;
}
