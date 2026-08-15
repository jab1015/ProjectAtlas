export type AtlasTier = "free" | "inventor" | "pro" | "enterprise";

export interface DailyUsageLimits {
  autonomousCostUnits: number;
  chatQuestions: number;
}

export const MAX_AUTONOMOUS_RUN_BUDGET = 40;

const LIMITS: Record<AtlasTier, DailyUsageLimits> = {
  free: { autonomousCostUnits: 25, chatQuestions: 30 },
  inventor: { autonomousCostUnits: 125, chatQuestions: 100 },
  pro: { autonomousCostUnits: 350, chatQuestions: 200 },
  enterprise: { autonomousCostUnits: 600, chatQuestions: 300 },
};

export function normalizeAtlasTier(value: unknown): AtlasTier {
  if (value === "enterprise") return "enterprise";
  if (value === "pro" || value === "inventor_pro") return "pro";
  if (value === "inventor" || value === "starter") return "inventor";
  return "free";
}

export function getDailyUsageLimits(value: unknown): DailyUsageLimits {
  return LIMITS[normalizeAtlasTier(value)];
}

export function utcDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function remainingAutonomousCostUnits(tier: unknown, used: number): number {
  return Math.max(0, getDailyUsageLimits(tier).autonomousCostUnits - Math.max(0, used));
}

export function remainingAutonomousCostUnitsAfterReservations(tier: unknown, used: number, reserved: number): number {
  return remainingAutonomousCostUnits(tier, Math.max(0, used) + Math.max(0, reserved));
}

export function canAskWithinDailyAllowance(tier: unknown, used: number): boolean {
  return Math.max(0, used) < getDailyUsageLimits(tier).chatQuestions;
}
