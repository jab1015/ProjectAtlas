import { describe, expect, it } from "vitest";
import {
  canAskWithinDailyAllowance,
  getDailyUsageLimits,
  normalizeAtlasTier,
  MAX_AUTONOMOUS_RUN_BUDGET,
  remainingAutonomousCostUnits,
  remainingAutonomousCostUnitsAfterReservations,
  utcDateKey,
} from "@convex/usagePolicyLogic";

describe("Atlas usage policy", () => {
  it("normalizes legacy tiers without creating an unlimited plan", () => {
    expect(normalizeAtlasTier("starter")).toBe("inventor");
    expect(normalizeAtlasTier("inventor_pro")).toBe("pro");
    expect(getDailyUsageLimits("enterprise").autonomousCostUnits).toBeLessThan(1000);
  });

  it("calculates a bounded remaining autonomous budget", () => {
    expect(remainingAutonomousCostUnits("free", 10)).toBe(15);
    expect(remainingAutonomousCostUnits("free", 30)).toBe(0);
  });

  it("subtracts active reservations without allowing negative inputs to distort usage", () => {
    expect(remainingAutonomousCostUnitsAfterReservations("free", 8, 15)).toBe(2);
    expect(remainingAutonomousCostUnitsAfterReservations("free", 8, 20)).toBe(0);
    expect(remainingAutonomousCostUnitsAfterReservations("free", -5, -10)).toBe(25);
  });

  it("allows a metered concept-image job within one paid run", () => {
    expect(MAX_AUTONOMOUS_RUN_BUDGET).toBeGreaterThanOrEqual(30);
    expect(MAX_AUTONOMOUS_RUN_BUDGET).toBeLessThan(getDailyUsageLimits("inventor").autonomousCostUnits);
  });

  it("enforces generous daily chat allowances", () => {
    expect(canAskWithinDailyAllowance("free", 29)).toBe(true);
    expect(canAskWithinDailyAllowance("free", 30)).toBe(false);
  });

  it("uses UTC date keys for consistent daily accounting", () => {
    expect(utcDateKey(Date.UTC(2026, 7, 14, 23, 59))).toBe("2026-08-14");
  });
});
