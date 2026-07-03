import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// ─── @convex-dev/auth routes ────────────────────────────────────────────────
auth.addHttpRoutes(http);

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

    // Verify HMAC-SHA256 signature
    const signature = request.headers.get("X-Fulfillment-Signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const bodyText = await request.text();

    // Use Web Crypto API for HMAC verification (works in Convex runtime)
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

    if (signature !== expectedSignature) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = JSON.parse(bodyText) as {
      orderId: string;
      productId: string;
      customerEmail: string;
      customerName?: string;
      amountCents: number;
      currency: string;
      stripeCheckoutSessionId?: string;
    };

    // Look up the product by platformProductId
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

    // Generate a secure download token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const downloadToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create the purchase record
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

    // Increment product sales count
    await ctx.runMutation(internal.productsMutations.incrementSales, {
      id: product._id,
    });

    // Build download URL
    const origin = new URL(request.url).origin;
    const downloadUrl = `${origin}/api/download?purchaseId=${purchaseId}&token=${downloadToken}`;

    return new Response(
      JSON.stringify({ downloadUrl, purchaseId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

// ─── Download Endpoint ──────────────────────────────────────────────────────

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

    // Verify the purchase and token
    const purchase = await ctx.runQuery(internal.purchasesInternal.getById, {
      purchaseId: purchaseId as any,
    });

    if (!purchase || purchase.downloadToken !== token) {
      return new Response(
        JSON.stringify({ error: "Invalid download link" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all files for this product
    const files = await ctx.runQuery(internal.filesInternal.getByProductId, {
      productId: purchase.productId,
    });

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files available for this product" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // If fileId specified, find that specific file; otherwise use first file
    let targetFile = files[0];
    if (fileId) {
      const found = files.find((f) => f._id === fileId);
      if (found) targetFile = found;
    }

    // Get the download URL from storage
    const downloadUrl = await ctx.storage.getUrl(targetFile.storageId);

    if (!downloadUrl) {
      return new Response(
        JSON.stringify({ error: "File not found in storage" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Record the download
    await ctx.runMutation(internal.purchasesMutations.recordDownload, {
      purchaseId: purchase._id,
    });

    // Redirect to the signed storage URL
    return Response.redirect(downloadUrl, 302);
  }),
});

// ─── Order Lookup (for /checkout/success page) ──────────────────────────────
// Same-origin from the storefront's perspective, but the page lives on
// Vercel and Convex HTTP runs on convex.site, so the fetch is technically
// cross-origin. The session id is unguessable and the response only exposes
// data the buyer already has, so allowing any origin is safe.

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
      // Fulfillment runs after the Stripe redirect, so it's normal for the
      // first few polls to miss. Return 404 and let the client retry.
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
