import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { auth } from "./auth";
import { constantTimeEqualAscii, validateFulfillmentPayload } from "./webhookSecurityLogic";
import { validateSubscriptionWebhookPayload, type SubscriptionStatus } from "./subscriptionPolicyLogic";

const http = httpRouter();
const MAX_WEBHOOK_BYTES = 64 * 1024;
const applySubscriptionEvent = makeFunctionReference<"mutation", {
  providerEventId: string; customerEmail: string; tier: "inventor" | "pro" | "enterprise";
  status: SubscriptionStatus; subscriptionId?: string; billingCustomerId?: string;
  organizationId?: Id<"organizations">; currentPeriodEnd?: number; occurredAt: number;
}, unknown>("subscriptionMutations:applySubscriptionEvent");
const healthProbe = makeFunctionReference<"query", Record<string, never>, {
  databaseReachable: boolean;
  sampledUser: boolean;
  hasQueuedWork: boolean;
  hasFailedWork: boolean;
  checkedAt: number;
}>("operationalHealth:healthProbe");

auth.addHttpRoutes(http);

http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx) => {
    try {
      const probe = await ctx.runQuery(healthProbe, {});
      const configuration = {
        ai: Boolean(process.env.OPENAI_API_KEY),
        auth: Boolean(process.env.JWT_PRIVATE_KEY && process.env.JWKS),
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
      providerEventId: body.eventId,
      customerEmail: body.customerEmail,
      tier: body.tier,
      status: body.status,
      subscriptionId: body.subscriptionId,
      billingCustomerId: body.customerId,
      organizationId: body.organizationId as Id<"organizations"> | undefined,
      currentPeriodEnd: body.currentPeriodEnd,
      occurredAt: body.occurredAt,
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
    const requested = fileId ? files.find((file) => String(file._id) === fileId) : files[0];
    if (!requested) return new Response(JSON.stringify({ error: "File not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    const signedUrl = await ctx.storage.getUrl(requested.storageId);
    if (!signedUrl) return new Response(JSON.stringify({ error: "File unavailable" }), { status: 404, headers: { "Content-Type": "application/json" } });
    return Response.redirect(signedUrl, 302);
  }),
});

export default http;
