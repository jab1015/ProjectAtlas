import { describe, expect, it } from "vitest";
import { effectiveTierForSubscription, validateSubscriptionWebhookPayload } from "@convex/subscriptionPolicyLogic";

describe("subscription lifecycle policy", () => {
  it("keeps access during an active paid period and downgrades after it ends", () => {
    const now = 1_000;
    expect(effectiveTierForSubscription("pro", "active", undefined, now)).toBe("pro");
    expect(effectiveTierForSubscription("pro", "canceled", now + 1, now)).toBe("pro");
    expect(effectiveTierForSubscription("pro", "canceled", now - 1, now)).toBe("free");
    expect(effectiveTierForSubscription("pro", "unpaid", now + 100, now)).toBe("free");
  });

  it("validates and normalizes signed lifecycle payloads", () => {
    expect(validateSubscriptionWebhookPayload({
      eventId: "evt_1", customerEmail: "BUYER@EXAMPLE.COM", tier: "inventor",
      status: "active", occurredAt: 100,
    })).toMatchObject({ customerEmail: "buyer@example.com", tier: "inventor", status: "active" });
    expect(validateSubscriptionWebhookPayload({ eventId: "evt", customerEmail: "a@b.com", tier: "free", status: "active", occurredAt: 1 })).toBeNull();
    expect(validateSubscriptionWebhookPayload({ eventId: "evt", customerEmail: "bad", tier: "pro", status: "active", occurredAt: 1 })).toBeNull();
  });
});
