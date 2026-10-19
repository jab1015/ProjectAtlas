import { describe, expect, it, vi } from "vitest";

import { fulfillmentWebhookHandler } from "../../convex/fulfillmentWebhook";

const secret = "test-fulfillment-secret";

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
  if (signature) headers.set("X-Fulfillment-Signature", signature);
  return new Request("https://inventsmith.example/api/fulfillment", {
    method: "POST",
    headers,
    body,
  });
}

function buildCtx(args?: {
  product?: Record<string, unknown> | null;
  fulfillment?: { purchaseId: string; created: boolean; downloadToken: string };
}) {
  const product = args?.product === undefined ? { _id: "product-1" } : args.product;
  const fulfillment = args?.fulfillment ?? {
    purchaseId: "purchase-1",
    created: true,
    downloadToken: "stored-token",
  };
  const runQuery = vi.fn(async (_reference: unknown, _queryArgs: unknown) => product);
  const runMutation = vi.fn(async (_reference: unknown, _mutationArgs: unknown) => {
    if (runMutation.mock.calls.length === 1) return fulfillment;
    return undefined;
  });
  return { ctx: { runQuery, runMutation } as any, runQuery, runMutation };
}

const validPayload = {
  orderId: " order-123 ",
  productId: " product-platform-1 ",
  customerEmail: "BUYER@EXAMPLE.COM",
  customerName: " Buyer ",
  amountCents: 9900,
  currency: "USD",
  stripeCheckoutSessionId: " session-123 ",
};

describe("fulfillment webhook behavior", () => {
  it("fails closed when the webhook secret is not configured", async () => {
    const state = buildCtx();
    const body = JSON.stringify(validPayload);
    const response = await fulfillmentWebhookHandler(state.ctx, request(body, "anything"), undefined);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Fulfillment secret not configured" });
    expect(state.runQuery).not.toHaveBeenCalled();
    expect(state.runMutation).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid signatures before product lookup or mutation", async () => {
    const body = JSON.stringify(validPayload);

    const missing = buildCtx();
    const missingResponse = await fulfillmentWebhookHandler(missing.ctx, request(body), secret);
    expect(missingResponse.status).toBe(401);
    expect(missing.runQuery).not.toHaveBeenCalled();
    expect(missing.runMutation).not.toHaveBeenCalled();

    const invalid = buildCtx();
    const invalidResponse = await fulfillmentWebhookHandler(
      invalid.ctx,
      request(body, "00".repeat(32)),
      secret,
    );
    expect(invalidResponse.status).toBe(401);
    expect(invalid.runQuery).not.toHaveBeenCalled();
    expect(invalid.runMutation).not.toHaveBeenCalled();
  });

  it("rejects malformed, negative, and oversized declared lengths before reading application state", async () => {
    for (const declaredLength of ["not-a-number", "-1", String(64 * 1024 + 1)]) {
      const state = buildCtx();
      const body = JSON.stringify(validPayload);
      const response = await fulfillmentWebhookHandler(
        state.ctx,
        request(body, "anything", { "content-length": declaredLength }),
        secret,
      );

      expect(response.status).toBe(413);
      expect(state.runQuery).not.toHaveBeenCalled();
      expect(state.runMutation).not.toHaveBeenCalled();
    }
  });

  it("rejects an actual body over the limit by UTF-8 bytes", async () => {
    const state = buildCtx();
    const oversizedUtf8 = "é".repeat(33_000);
    const response = await fulfillmentWebhookHandler(
      state.ctx,
      request(oversizedUtf8, "anything"),
      secret,
    );

    expect(oversizedUtf8.length).toBeLessThanOrEqual(64 * 1024);
    expect(new TextEncoder().encode(oversizedUtf8).byteLength).toBeGreaterThan(64 * 1024);
    expect(response.status).toBe(413);
    expect(state.runQuery).not.toHaveBeenCalled();
    expect(state.runMutation).not.toHaveBeenCalled();
  });

  it("rejects signed malformed JSON and invalid fulfillment payloads before product lookup", async () => {
    const malformed = "{not-json";
    const malformedState = buildCtx();
    const malformedResponse = await fulfillmentWebhookHandler(
      malformedState.ctx,
      request(malformed, await sign(malformed)),
      secret,
    );
    expect(malformedResponse.status).toBe(400);
    expect(malformedState.runQuery).not.toHaveBeenCalled();
    expect(malformedState.runMutation).not.toHaveBeenCalled();

    const invalid = JSON.stringify({ ...validPayload, customerEmail: "not-an-email" });
    const invalidState = buildCtx();
    const invalidResponse = await fulfillmentWebhookHandler(
      invalidState.ctx,
      request(invalid, await sign(invalid)),
      secret,
    );
    expect(invalidResponse.status).toBe(400);
    expect(invalidState.runQuery).not.toHaveBeenCalled();
    expect(invalidState.runMutation).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown product without creating a purchase", async () => {
    const state = buildCtx({ product: null });
    const body = JSON.stringify(validPayload);
    const response = await fulfillmentWebhookHandler(state.ctx, request(body, await sign(body)), secret);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Product not found" });
    expect(state.runQuery).toHaveBeenCalledTimes(1);
    expect(state.runMutation).not.toHaveBeenCalled();
  });

  it("normalizes a valid event, creates the purchase, and increments sales only for a new purchase", async () => {
    const state = buildCtx({
      fulfillment: { purchaseId: "purchase-new", created: true, downloadToken: "authoritative-new-token" },
    });
    const body = JSON.stringify(validPayload);
    const response = await fulfillmentWebhookHandler(state.ctx, request(body, await sign(body)), secret);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      purchaseId: "purchase-new",
      downloadUrl: "https://inventsmith.example/api/download?purchaseId=purchase-new&token=authoritative-new-token",
    });
    expect(state.runQuery).toHaveBeenCalledTimes(1);
    expect(state.runQuery.mock.calls[0]![1]).toEqual({ platformProductId: "product-platform-1" });
    expect(state.runMutation).toHaveBeenCalledTimes(2);
    expect(state.runMutation.mock.calls[0]![1]).toMatchObject({
      productId: "product-1",
      customerEmail: "buyer@example.com",
      customerName: "Buyer",
      platformOrderId: "order-123",
      stripeCheckoutSessionId: "session-123",
      amountCents: 9900,
      currency: "usd",
    });
    const purchaseArgs = state.runMutation.mock.calls[0]![1] as Record<string, unknown>;
    expect(purchaseArgs.downloadToken).toMatch(/^[0-9a-f]{64}$/);
    expect(state.runMutation.mock.calls[1]![1]).toEqual({ id: "product-1" });
  });

  it("returns the authoritative existing token on replay and never increments sales", async () => {
    const state = buildCtx({
      fulfillment: { purchaseId: "purchase-existing", created: false, downloadToken: "token-existing" },
    });
    const body = JSON.stringify(validPayload);
    const response = await fulfillmentWebhookHandler(state.ctx, request(body, await sign(body)), secret);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      purchaseId: "purchase-existing",
      downloadUrl: "https://inventsmith.example/api/download?purchaseId=purchase-existing&token=token-existing",
    });
    expect(state.runMutation).toHaveBeenCalledTimes(1);
  });
});
