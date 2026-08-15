import { describe, expect, it } from "vitest";
import { requiresExternalBillingResolution } from "@convex/accountDeletionPolicy";

describe("account deletion billing gate", () => {
  const now = 1_000;

  it("does not block free or already-unpaid accounts", () => {
    expect(requiresExternalBillingResolution("free", undefined, undefined, now)).toBe(false);
    expect(requiresExternalBillingResolution("explorer", "active", undefined, now)).toBe(false);
    expect(requiresExternalBillingResolution("pro", "unpaid", now + 10_000, now)).toBe(false);
    expect(requiresExternalBillingResolution("inventor", "incomplete", undefined, now)).toBe(false);
    expect(requiresExternalBillingResolution("enterprise", "paused", undefined, now)).toBe(false);
  });

  it("requires explicit external resolution while paid access may still exist", () => {
    expect(requiresExternalBillingResolution("inventor", "active", undefined, now)).toBe(true);
    expect(requiresExternalBillingResolution("pro", "trialing", now + 1, now)).toBe(true);
    expect(requiresExternalBillingResolution("enterprise", "past_due", now + 1, now)).toBe(true);
    expect(requiresExternalBillingResolution("pro", "canceled", now + 1, now)).toBe(true);
  });

  it("allows deletion after a canceled paid period has ended", () => {
    expect(requiresExternalBillingResolution("pro", "canceled", now - 1, now)).toBe(false);
  });
});
