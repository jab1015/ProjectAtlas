export type AtlasTier = "free" | "inventor" | "pro" | "enterprise";

export interface DailyUsageLimits {
  autonomousCostUnits: number;
  chatQuestions: number;
}

export const MAX_AUTONOMOUS_RUN_BUDGET = 40;
export const UNLIMITED_AUTONOMOUS_COST_UNITS = Number.MAX_SAFE_INTEGER;

const LIMITS: Record<AtlasTier, DailyUsageLimits> = {
  free: { autonomousCostUnits: 25, chatQuestions: 30 },
  inventor: { autonomousCostUnits: 125, chatQuestions: 100 },
  pro: { autonomousCostUnits: 350, chatQuestions: 200 },
  enterprise: { autonomousCostUnits: 600, chatQuestions: 300 },
};

/**
 * Compatibility normalization for the existing daily safety caps.
 * Organization-native plan economics are intentionally NOT finalized here;
 * Studio plans temporarily inherit the existing enterprise safety ceiling
 * until measured cost-to-serve supports dedicated organization allowances.
 */
export function normalizeAtlasTier(value: unknown): AtlasTier {
  if (
    value === "enterprise" ||
    value === "studio_3" ||
    value === "studio_6" ||
    value === "studio_custom"
  ) return "enterprise";
  if (value === "pro" || value === "inventor_pro") return "pro";
  if (value === "inventor" || value === "starter") return "inventor";
  return "free";
}

export function getDailyUsageLimits(value: unknown): DailyUsageLimits {
  return LIMITS[normalizeAtlasTier(value)];
}

/** Enterprise usage is still recorded for cost visibility, but it must never
 * block eligible autonomous work on a daily allowance. */
export function hasUnlimitedAutonomousWork(value: unknown): boolean {
  return normalizeAtlasTier(value) === "enterprise";
}

export function utcDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function remainingAutonomousCostUnits(tier: unknown, used: number): number {
  if (hasUnlimitedAutonomousWork(tier)) return UNLIMITED_AUTONOMOUS_COST_UNITS;
  return Math.max(0, getDailyUsageLimits(tier).autonomousCostUnits - Math.max(0, used));
}

export function remainingAutonomousCostUnitsAfterReservations(tier: unknown, used: number, reserved: number): number {
  return remainingAutonomousCostUnits(tier, Math.max(0, used) + Math.max(0, reserved));
}

export function canAskWithinDailyAllowance(tier: unknown, used: number): boolean {
  return Math.max(0, used) < getDailyUsageLimits(tier).chatQuestions;
}
