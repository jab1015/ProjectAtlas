import { internal } from "./_generated/api";
import { constantTimeEqualAscii, validateFulfillmentPayload } from "./webhookSecurityLogic";

const MAX_WEBHOOK_BYTES = 64 * 1024;

type FulfillmentWebhookCtx = {
  runQuery: (reference: any, args: any) => Promise<any>;
  runMutation: (reference: any, args: any) => Promise<any>;
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function fulfillmentWebhookHandler(
  ctx: FulfillmentWebhookCtx,
  request: Request,
  secret: string | undefined = process.env.PLATFORM_FULFILLMENT_SECRET,
) {
  if (!secret) return jsonResponse({ error: "Fulfillment secret not configured" }, 500);

  const signature = request.headers.get("X-Fulfillment-Signature");
  if (!signature) return jsonResponse({ error: "Missing signature" }, 401);

  const declaredLengthHeader = request.headers.get("content-length");
  if (declaredLengthHeader) {
    const declaredLength = Number(declaredLengthHeader);
    if (!Number.isFinite(declaredLength) || declaredLength < 0 || declaredLength > MAX_WEBHOOK_BYTES) {
      return jsonResponse({ error: "Payload too large" }, 413);
    }
  }

  const bodyText = await request.text();
  const encoder = new TextEncoder();
  if (encoder.encode(bodyText).byteLength > MAX_WEBHOOK_BYTES) {
    return jsonResponse({ error: "Payload too large" }, 413);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (!constantTimeEqualAscii(signature.toLowerCase(), expectedSignature)) {
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {
    return jsonResponse({ error: "Malformed JSON" }, 400);
  }

  const body = validateFulfillmentPayload(parsedBody);
  if (!body) return jsonResponse({ error: "Invalid fulfillment payload" }, 400);

  const product = await ctx.runQuery(
    internal.productsInternal.getByPlatformProductId,
    { platformProductId: body.productId },
  );
  if (!product) return jsonResponse({ error: "Product not found" }, 404);

  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const proposedDownloadToken = Array.from(tokenBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const fulfillment = await ctx.runMutation(
    internal.purchasesMutations.createFromFulfillmentWithStatus,
    {
      productId: product._id,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      platformOrderId: body.orderId,
      stripeCheckoutSessionId: body.stripeCheckoutSessionId,
      amountCents: body.amountCents,
      currency: body.currency,
      downloadToken: proposedDownloadToken,
    },
  );

  if (fulfillment.created) {
    await ctx.runMutation(internal.productsMutations.incrementSales, { id: product._id });
  }

  const origin = new URL(request.url).origin;
  const downloadUrl = `${origin}/api/download?purchaseId=${fulfillment.purchaseId}&token=${fulfillment.downloadToken}`;

  return jsonResponse({ downloadUrl, purchaseId: fulfillment.purchaseId }, 200);
}
