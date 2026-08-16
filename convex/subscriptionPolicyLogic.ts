import type { AtlasTier } from "./usagePolicyLogic";
import type { OrganizationPlanKey } from "./organizationPolicyLogic";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete" | "paused";
export type PaidAtlasTier = Exclude<AtlasTier, "free">;
export type OrganizationBillingPlan = Exclude<OrganizationPlanKey, "explorer">;

export interface SubscriptionWebhookPayload {
  eventId: string;
  customerEmail: string;
  // Legacy/provider compatibility tier. Studio subscriptions use enterprise as
  // the base tier and carry the exact organization plan separately below.
  tier: PaidAtlasTier;
  organizationPlanKey?: OrganizationBillingPlan;
  status: SubscriptionStatus;
  subscriptionId?: string;
  customerId?: string;
  organizationId?: string;
  currentPeriodEnd?: number;
  occurredAt: number;
}

const PAID_TIERS = new Set<PaidAtlasTier>(["inventor", "pro", "enterprise"]);
const ORGANIZATION_BILLING_PLANS = new Set<OrganizationBillingPlan>([
  "inventor",
  "pro",
  "enterprise",
  "studio_3",
  "studio_6",
  "studio_custom",
]);
const STATUSES = new Set<SubscriptionStatus>(["trialing", "active", "past_due", "canceled", "unpaid", "incomplete", "paused"]);

function subscriptionHasAccess(status: SubscriptionStatus, currentPeriodEnd: number | undefined, now: number) {
  if (status === "active" || status === "trialing") return true;
  return (status === "past_due" || status === "canceled") && currentPeriodEnd !== undefined && currentPeriodEnd > now;
}

function billingPlanMatchesBaseTier(plan: OrganizationBillingPlan, tier: PaidAtlasTier) {
  if (plan === "studio_3" || plan === "studio_6" || plan === "studio_custom") return tier === "enterprise";
  return plan === tier;
}

export function effectiveTierForSubscription(tier: PaidAtlasTier, status: SubscriptionStatus, currentPeriodEnd: number | undefined, now: number): AtlasTier {
  return subscriptionHasAccess(status, currentPeriodEnd, now) ? tier : "free";
}

export function effectiveOrganizationPlanForSubscription(
  plan: OrganizationBillingPlan,
  status: SubscriptionStatus,
  currentPeriodEnd: number | undefined,
  now: number,
): OrganizationPlanKey {
  return subscriptionHasAccess(status, currentPeriodEnd, now) ? plan : "explorer";
}

export function validateSubscriptionWebhookPayload(value: unknown): SubscriptionWebhookPayload | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.eventId !== "string" || !body.eventId.trim() || body.eventId.length > 200) return null;
  if (typeof body.customerEmail !== "string" || !/^\S+@\S+\.\S+$/.test(body.customerEmail) || body.customerEmail.length > 320) return null;
  if (typeof body.tier !== "string" || !PAID_TIERS.has(body.tier as PaidAtlasTier)) return null;
  if (typeof body.status !== "string" || !STATUSES.has(body.status as SubscriptionStatus)) return null;
  if (typeof body.occurredAt !== "number" || !Number.isSafeInteger(body.occurredAt) || body.occurredAt < 0) return null;
  if (body.currentPeriodEnd !== undefined && (typeof body.currentPeriodEnd !== "number" || !Number.isSafeInteger(body.currentPeriodEnd) || body.currentPeriodEnd < 0)) return null;
  if (body.subscriptionId !== undefined && (typeof body.subscriptionId !== "string" || body.subscriptionId.length > 200)) return null;
  if (body.customerId !== undefined && (typeof body.customerId !== "string" || body.customerId.length > 200)) return null;
  if (body.organizationId !== undefined && (typeof body.organizationId !== "string" || !body.organizationId.trim() || body.organizationId.length > 200)) return null;
  if (body.organizationPlanKey !== undefined && (typeof body.organizationPlanKey !== "string" || !ORGANIZATION_BILLING_PLANS.has(body.organizationPlanKey as OrganizationBillingPlan))) return null;

  const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() || undefined : undefined;
  const organizationPlanKey = typeof body.organizationPlanKey === "string"
    ? body.organizationPlanKey as OrganizationBillingPlan
    : undefined;
  const tier = body.tier as PaidAtlasTier;
  // Studio/organization plan overrides can never be applied to the legacy
  // per-user subscription path, and the exact org plan must agree with the
  // provider's compatibility tier.
  if (organizationPlanKey && !organizationId) return null;
  if (organizationPlanKey && !billingPlanMatchesBaseTier(organizationPlanKey, tier)) return null;

  return {
    eventId: body.eventId.trim(),
    customerEmail: body.customerEmail.trim().toLowerCase(),
    tier,
    organizationPlanKey,
    status: body.status as SubscriptionStatus,
    subscriptionId: typeof body.subscriptionId === "string" ? body.subscriptionId.trim() || undefined : undefined,
    customerId: typeof body.customerId === "string" ? body.customerId.trim() || undefined : undefined,
    organizationId,
    currentPeriodEnd: body.currentPeriodEnd as number | undefined,
    occurredAt: body.occurredAt,
  };
}
