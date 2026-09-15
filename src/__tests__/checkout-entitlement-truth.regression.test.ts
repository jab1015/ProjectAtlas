import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const success = readFileSync(join(process.cwd(), "src/app/(public)/(auth)/checkout/success/page.tsx"), "utf8");
const subscription = readFileSync(join(process.cwd(), "convex/subscriptionPolicyLogic.ts"), "utf8");

describe("InventSmith checkout entitlement truth boundary", () => {
  it("does not treat a checkout redirect/query parameter as confirmed entitlement", () => {
    expect(success).toContain("Checkout complete");
    expect(success).toContain("confirmed billing event");
    expect(success).toContain("existing access remains in place until the subscription update is verified");
    expect(success).not.toContain("Your full inventor journey is now unlocked");
    expect(success).not.toContain("Welcome to {plan}");
  });

  it("keeps paid access derived from recorded subscription state", () => {
    expect(subscription).toContain("effectiveTierForSubscription");
    expect(subscription).toContain("currentPeriodEnd");
    expect(subscription).toContain('status === "active"');
    expect(subscription).toContain('status === "canceled"');
  });
});
