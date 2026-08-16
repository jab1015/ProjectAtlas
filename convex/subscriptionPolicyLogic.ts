import type { AtlasTier } from "./usagePolicyLogic";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete" | "paused";

export interface SubscriptionWebhookPayload {
  eventId: string;
  customerEmail: string;
  tier: Exclude<AtlasTier, "free">;
  status: SubscriptionStatus;
  subscriptionId?: string;
  customerId?: string;
  organizationId?: string;
  currentPeriodEnd?: number;
  occurredAt: number;
}

const PAID_TIERS = new Set(["inventor", "pro", "enterprise"]);
const STATUSES = new Set<SubscriptionStatus>(["trialing", "active", "past_due", "canceled", "unpaid", "incomplete", "paused"]);

export function effectiveTierForSubscription(tier: Exclude<AtlasTier, "free">, status: SubscriptionStatus, currentPeriodEnd: number | undefined, now: number): AtlasTier {
  if (status === "active" || status === "trialing") return tier;
  if ((status === "past_due" || status === "canceled") && currentPeriodEnd !== undefined && currentPeriodEnd > now) return tier;
  return "free";
}

export function validateSubscriptionWebhookPayload(value: unknown): SubscriptionWebhookPayload | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.eventId !== "string" || !body.eventId.trim() || body.eventId.length > 200) return null;
  if (typeof body.customerEmail !== "string" || !/^\S+@\S+\.\S+$/.test(body.customerEmail) || body.customerEmail.length > 320) return null;
  if (typeof body.tier !== "string" || !PAID_TIERS.has(body.tier)) return null;
  if (typeof body.status !== "string" || !STATUSES.has(body.status as SubscriptionStatus)) return null;
  if (typeof body.occurredAt !== "number" || !Number.isSafeInteger(body.occurredAt) || body.occurredAt < 0) return null;
  if (body.currentPeriodEnd !== undefined && (typeof body.currentPeriodEnd !== "number" || !Number.isSafeInteger(body.currentPeriodEnd) || body.currentPeriodEnd < 0)) return null;
  if (body.subscriptionId !== undefined && (typeof body.subscriptionId !== "string" || body.subscriptionId.length > 200)) return null;
  if (body.customerId !== undefined && (typeof body.customerId !== "string" || body.customerId.length > 200)) return null;
  if (body.organizationId !== undefined && (typeof body.organizationId !== "string" || !body.organizationId.trim() || body.organizationId.length > 200)) return null;
  return {
    eventId: body.eventId.trim(),
    customerEmail: body.customerEmail.trim().toLowerCase(),
    tier: body.tier as Exclude<AtlasTier, "free">,
    status: body.status as SubscriptionStatus,
    subscriptionId: typeof body.subscriptionId === "string" ? body.subscriptionId.trim() || undefined : undefined,
    customerId: typeof body.customerId === "string" ? body.customerId.trim() || undefined : undefined,
    organizationId: typeof body.organizationId === "string" ? body.organizationId.trim() || undefined : undefined,
    currentPeriodEnd: body.currentPeriodEnd as number | undefined,
    occurredAt: body.occurredAt,
  };
}
