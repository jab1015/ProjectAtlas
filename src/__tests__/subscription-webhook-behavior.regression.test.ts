import { describe, expect, it, vi } from "vitest";

import { subscriptionWebhookHandler } from "../../convex/subscriptionWebhook";

const secret = "test-subscription-secret";

async function sign(body: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function request(body: string, signature?: string, extraHeaders?: Record<string, string>) {
  const headers = new Headers(extraHeaders);
  if (signature) headers.set("X-Atlas-Subscription-Signature", signature);
  return new Request("https://inventsmith.example/api/subscription", {
    method: "POST",
    headers,
    body,
  });
}

function buildCtx(result: unknown = { applied: true }) {
  return {
    runMutation: vi.fn(async () => result),
  } as any;
}

const validPayload = {
  eventId: "evt-123",
  customerEmail: "OWNER@EXAMPLE.COM",
  tier: "enterprise",
  organizationPlanKey: "studio_6",
  status: "active",
  subscriptionId: "sub-123",
  customerId: "cus-123",
  organizationId: " org-123 ",
  currentPeriodEnd: 2_000,
  occurredAt: 1_000,
};

describe("subscription webhook behavior", () => {
  it("fails closed when the webhook secret is not configured", async () => {
    const ctx = buildCtx();
    const body = JSON.stringify(validPayload);
    const response = await subscriptionWebhookHandler(ctx, request(body, "anything"), undefined);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Subscription webhook secret not configured" });
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("rejects a missing signature before reading or applying the event", async () => {
    const ctx = buildCtx();
    const response = await subscriptionWebhookHandler(ctx, request(JSON.stringify(validPayload)), secret);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Missing signature" });
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("rejects invalid and oversized declared lengths before mutation", async () => {
    for (const declaredLength of ["not-a-number", "-1", String(64 * 1024 + 1)]) {
      const ctx = buildCtx();
      const body = JSON.stringify(validPayload);
      const response = await subscriptionWebhookHandler(
        ctx,
        request(body, "anything", { "content-length": declaredLength }),
        secret,
      );

      expect(response.status).toBe(413);
      expect(ctx.runMutation).not.toHaveBeenCalled();
    }
  });

  it("rejects an invalid signature before parsing or mutation", async () => {
    const ctx = buildCtx();
    const response = await subscriptionWebhookHandler(
      ctx,
      request(JSON.stringify(validPayload), "00".repeat(32)),
      secret,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Invalid signature" });
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("rejects signed malformed JSON and signed invalid events without mutation", async () => {
    const malformed = "{not-json";
    const malformedCtx = buildCtx();
    const malformedResponse = await subscriptionWebhookHandler(
      malformedCtx,
      request(malformed, await sign(malformed)),
      secret,
    );
    expect(malformedResponse.status).toBe(400);
    expect(await malformedResponse.json()).toEqual({ error: "Malformed JSON" });
    expect(malformedCtx.runMutation).not.toHaveBeenCalled();

    const invalid = JSON.stringify({ eventId: "evt-bad", customerEmail: "not-an-email" });
    const invalidCtx = buildCtx();
    const invalidResponse = await subscriptionWebhookHandler(
      invalidCtx,
      request(invalid, await sign(invalid)),
      secret,
    );
    expect(invalidResponse.status).toBe(400);
    expect(await invalidResponse.json()).toEqual({ error: "Invalid subscription event" });
    expect(invalidCtx.runMutation).not.toHaveBeenCalled();
  });

  it("measures the actual body limit in UTF-8 bytes", async () => {
    const ctx = buildCtx();
    const oversizedUtf8 = "é".repeat(33_000);
    const response = await subscriptionWebhookHandler(
      ctx,
      request(oversizedUtf8, "anything"),
      secret,
    );

    expect(oversizedUtf8.length).toBeLessThanOrEqual(64 * 1024);
    expect(new TextEncoder().encode(oversizedUtf8).byteLength).toBeGreaterThan(64 * 1024);
    expect(response.status).toBe(413);
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("normalizes a valid signed event and invokes the subscription mutation exactly once", async () => {
    const body = JSON.stringify(validPayload);
    const ctx = buildCtx({ applied: true, scope: "organization", planKey: "studio_6" });
    const response = await subscriptionWebhookHandler(ctx, request(body, await sign(body)), secret);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      received: true,
      result: { applied: true, scope: "organization", planKey: "studio_6" },
    });
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);
    expect(ctx.runMutation.mock.calls[0][1]).toEqual({
      providerEventId: "evt-123",
      customerEmail: "owner@example.com",
      tier: "enterprise",
      organizationPlanKey: "studio_6",
      status: "active",
      subscriptionId: "sub-123",
      billingCustomerId: "cus-123",
      organizationId: "org-123",
      currentPeriodEnd: 2_000,
      occurredAt: 1_000,
    });
  });
});
