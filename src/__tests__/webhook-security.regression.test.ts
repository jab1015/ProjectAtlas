import { describe, expect, it } from "vitest";
import { constantTimeEqualAscii, validateFulfillmentPayload } from "@convex/webhookSecurityLogic";

describe("fulfillment webhook security", () => {
  it("compares signatures without early equality shortcuts", () => {
    expect(constantTimeEqualAscii("abc123", "abc123")).toBe(true);
    expect(constantTimeEqualAscii("abc123", "abc124")).toBe(false);
    expect(constantTimeEqualAscii("short", "much-longer")).toBe(false);
  });

  it("accepts and normalizes only a bounded valid fulfillment payload", () => {
    expect(validateFulfillmentPayload({
      orderId: " order-1 ", productId: "product-1", customerEmail: "BUYER@EXAMPLE.COM",
      amountCents: 3900, currency: "USD",
    })).toMatchObject({ orderId: "order-1", customerEmail: "buyer@example.com", currency: "usd" });
    expect(validateFulfillmentPayload({ orderId: "x", productId: "p", customerEmail: "not-email", amountCents: 1, currency: "usd" })).toBeNull();
    expect(validateFulfillmentPayload({ orderId: "x", productId: "p", customerEmail: "a@b.com", amountCents: -1, currency: "usd" })).toBeNull();
  });
});
