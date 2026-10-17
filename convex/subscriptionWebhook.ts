import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { constantTimeEqualAscii } from "./webhookSecurityLogic";
import {
  validateSubscriptionWebhookPayload,
  type OrganizationBillingPlan,
  type SubscriptionStatus,
} from "./subscriptionPolicyLogic";

const MAX_WEBHOOK_BYTES = 64 * 1024;

const applySubscriptionEvent = makeFunctionReference<"mutation", {
  providerEventId: string;
  customerEmail: string;
  tier: "inventor" | "pro" | "enterprise";
  organizationPlanKey?: OrganizationBillingPlan;
  status: SubscriptionStatus;
  subscriptionId?: string;
  billingCustomerId?: string;
  organizationId?: Id<"organizations">;
  currentPeriodEnd?: number;
  occurredAt: number;
}, unknown>("subscriptionMutations:applySubscriptionEvent");

type SubscriptionWebhookCtx = {
  runMutation: (reference: typeof applySubscriptionEvent, args: {
    providerEventId: string;
    customerEmail: string;
    tier: "inventor" | "pro" | "enterprise";
    organizationPlanKey?: OrganizationBillingPlan;
    status: SubscriptionStatus;
    subscriptionId?: string;
    billingCustomerId?: string;
    organizationId?: Id<"organizations">;
    currentPeriodEnd?: number;
    occurredAt: number;
  }) => Promise<unknown>;
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function subscriptionWebhookHandler(
  ctx: SubscriptionWebhookCtx,
  request: Request,
  secret: string | undefined = process.env.ATLAS_SUBSCRIPTION_WEBHOOK_SECRET,
) {
  if (!secret) return jsonResponse({ error: "Subscription webhook secret not configured" }, 500);

  const signature = request.headers.get("X-Atlas-Subscription-Signature");
  if (!signature) return jsonResponse({ error: "Missing signature" }, 401);

  const declaredLengthHeader = request.headers.get("content-length");
  if (declaredLengthHeader) {
    const declaredLength = Number(declaredLengthHeader);
    if (!Number.isFinite(declaredLength) || declaredLength < 0 || declaredLength > MAX_WEBHOOK_BYTES) {
      return jsonResponse({ error: "Payload too large" }, 413);
    }
  }

  const bodyText = await request.text();
  if (new TextEncoder().encode(bodyText).byteLength > MAX_WEBHOOK_BYTES) {
    return jsonResponse({ error: "Payload too large" }, 413);
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
  const expected = Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (!constantTimeEqualAscii(signature.toLowerCase(), expected)) {
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return jsonResponse({ error: "Malformed JSON" }, 400);
  }

  const body = validateSubscriptionWebhookPayload(parsed);
  if (!body) return jsonResponse({ error: "Invalid subscription event" }, 400);

  const result = await ctx.runMutation(applySubscriptionEvent, {
    providerEventId: body.eventId,
    customerEmail: body.customerEmail,
    tier: body.tier,
    organizationPlanKey: body.organizationPlanKey,
    status: body.status,
    subscriptionId: body.subscriptionId,
    billingCustomerId: body.customerId,
    organizationId: body.organizationId as Id<"organizations"> | undefined,
    currentPeriodEnd: body.currentPeriodEnd,
    occurredAt: body.occurredAt,
  });

  return jsonResponse({ received: true, result }, 200);
}
