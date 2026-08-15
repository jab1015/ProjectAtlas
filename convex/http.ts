import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { constantTimeEqualAscii, validateFulfillmentPayload } from "./webhookSecurityLogic";
import { validateSubscriptionWebhookPayload, type SubscriptionStatus } from "./subscriptionPolicyLogic";

const http = httpRouter();
const MAX_WEBHOOK_BYTES = 64 * 1024;
const applySubscriptionEvent = makeFunctionReference<"mutation", {
  providerEventId: string; customerEmail: string; tier: "inventor" | "pro" | "enterprise";
  status: SubscriptionStatus; subscriptionId?: string; billingCustomerId?: string;
  currentPeriodEnd?: number; occurredAt: number;
}, unknown>("subscriptionMutations:applySubscriptionEvent");
const healthProbe = makeFunctionReference<"query", Record<string, never>, {
  databaseReachable: boolean;
  sampledUser: boolean;
  hasQueuedWork: boolean;
  hasFailedWork: boolean;
  checkedAt: number;
}>("operationalHealth:healthProbe");

// ─── @convex-dev/auth routes ────────────────────────────────────────────────
auth.addHttpRoutes(http);

// Public liveness/readiness endpoint for external monitoring. It intentionally
// exposes only booleans and never secret values, user data, invention data, or
// operational error details.
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const probe = await ctx.runQuery(healthProbe, {});
      const configuration = {
        ai: Boolean(process.env.OPENAI_API_KEY),
        auth: Boolean(process.env.AUTH_SECRET),
        fulfillmentWebhook: Boolean(process.env.PLATFORM_FULFILLMENT_SECRET),
        subscriptionWebhook: Boolean(process.env.ATLAS_SUBSCRIPTION_WEBHOOK_SECRET),
      };
      const ready = probe.databaseReachable && configuration.ai && configuration.auth;
      return new Response(JSON.stringify({
        ok: true,
        ready,
        service: "atlas",
        databaseReachable: probe.databaseReachable,
        configuration,
        checkedAt: probe.checkedAt,
      }), {
        status: ready ? 200 : 503,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    } catch {
      return new Response(JSON.stringify({ ok: false, ready: false, service: "atlas" }), {
        status: 503,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }
  }),
});

// ─── Platform Fulfillment Webhook ───────────────────────────────────────────

http.route({
  path: "/api/fulfillment",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.PLATFORM_FULFILLMENT_SECRET;
    if (!secret) {
      return new Response(
        JSON.stringify({ error: "Fulfillment secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const signature = request.headers.get("X-Fulfillment-Signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_WEBHOOK_BYTES) return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { "Content-Type": "application/json" } });
    const bodyText = await request.text();
    if (bodyText.length > MAX_WEBHOOK_BYTES) return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { "Content-Type": "application/json" } });

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(bodyText)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!constantTimeEqualAscii(signature.toLowerCase(), expectedSignature)) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(bodyText);
    } catch {
      return new Response(JSON.stringify({ error: "Malformed JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const body = validateFulfillmentPayload(parsedBody);
    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid fulfillment payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const product = await ctx.runQuery(
      internal.productsInternal.getByPlatformProductId,
      { platformProductId: body.productId }
    );

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const downloadToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const purchaseId = await ctx.runMutation(
      internal.purchasesMutations.createFromFulfillment,
      {
        productId: product._id,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        platformOrderId: body.orderId,
        stripeCheckoutSessionId: body.stripeCheckoutSessionId,
        amountCents: body.amountCents,
        currency: body.currency,
        downloadToken,
      }
    );

    await ctx.runMutation(internal.productsMutations.incrementSales, {
      id: product._id,
    });

    const origin = new URL(request.url).origin;
    const downloadUrl = `${origin}/api/download?purchaseId=${purchaseId}&token=${downloadToken}`;

    return new Response(
      JSON.stringify({ downloadUrl, purchaseId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

http.route({
  path: "/api/subscription",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.ATLAS_SUBSCRIPTION_WEBHOOK_SECRET;
    if (!secret) return new Response(JSON.stringify({ error: "Subscription webhook secret not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
    const signature = request.headers.get("X-Atlas-Subscription-Signature");
    if (!signature) return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_WEBHOOK_BYTES) return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { "Content-Type": "application/json" } });
    const bodyText = await request.text();
    if (bodyText.length > MAX_WEBHOOK_BYTES) return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers: { "Content-Type": "application/json" } });
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
    const expected = Array.from(new Uint8Array(signed)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    if (!constantTimeEqualAscii(signature.toLowerCase(), expected)) return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
    let parsed: unknown;
    try { parsed = JSON.parse(bodyText); } catch { return new Response(JSON.stringify({ error: "Malformed JSON" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
    const body = validateSubscriptionWebhookPayload(parsed);
    if (!body) return new Response(JSON.stringify({ error: "Invalid subscription event" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const result = await ctx.runMutation(applySubscriptionEvent, {
      providerEventId: body.eventId, customerEmail: body.customerEmail, tier: body.tier, status: body.status,
      subscriptionId: body.subscriptionId, billingCustomerId: body.customerId,
      currentPeriodEnd: body.currentPeriodEnd, occurredAt: body.occurredAt,
    });
    return new Response(JSON.stringify({ received: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
  }),
});

http.route({
  path: "/api/download",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const purchaseId = url.searchParams.get("purchaseId");
    const token = url.searchParams.get("token");
    const fileId = url.searchParams.get("fileId");

    if (!purchaseId || !token) {
      return new Response(
        JSON.stringify({ error: "Missing purchaseId or token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const purchase = await ctx.runQuery(internal.purchasesInternal.getById, {
      purchaseId: purchaseId as any,
    });

    if (!purchase || purchase.downloadToken !== token || purchase.fulfillmentStatus !== "fulfilled") {
      return new Response(
        JSON.stringify({ error: "Invalid download link" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const files = await ctx.runQuery(internal.filesInternal.getByProductId, {
      productId: purchase.productId,
    });

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files available for this product" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    let targetFile = files[0];
    if (fileId) {
      const found = files.find((f) => f._id === fileId);
      if (!found) {
        return new Response(JSON.stringify({ error: "Requested file is not part of this purchase" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      targetFile = found;
    }

    const downloadUrl = await ctx.storage.getUrl(targetFile.storageId);

    if (!downloadUrl) {
      return new Response(
        JSON.stringify({ error: "File not found in storage" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await ctx.runMutation(internal.purchasesMutations.recordDownload, {
      purchaseId: purchase._id,
    });

    return Response.redirect(downloadUrl, 302);
  }),
});

const ORDER_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

http.route({
  path: "/api/order",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: ORDER_CORS_HEADERS });
  }),
});

http.route({
  path: "/api/order",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing session_id" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...ORDER_CORS_HEADERS,
          },
        }
      );
    }

    const order = await ctx.runQuery(
      internal.purchasesInternal.getOrderForSuccessPage,
      { stripeCheckoutSessionId: sessionId }
    );

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...ORDER_CORS_HEADERS,
          },
        }
      );
    }

    const origin = new URL(request.url).origin;
    const downloadUrl = `${origin}/api/download?purchaseId=${order.purchaseId}&token=${order.downloadToken}`;

    return new Response(
      JSON.stringify({
        productTitle: order.productTitle,
        amountCents: order.amountCents,
        currency: order.currency,
        customerEmail: order.customerEmail,
        fulfillmentStatus: order.fulfillmentStatus,
        downloadUrl,
        createdAt: order.createdAt,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...ORDER_CORS_HEADERS,
        },
      }
    );
  }),
});

export default http;
