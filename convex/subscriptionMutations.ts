import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import {
  effectiveOrganizationPlanForSubscription,
  effectiveTierForSubscription,
  type OrganizationBillingPlan,
} from "./subscriptionPolicyLogic";

function organizationPlanForEffectiveTier(tier: "free" | "inventor" | "pro" | "enterprise") {
  return tier === "free" ? "explorer" as const : tier;
}

function requestedOrganizationPlan(
  tier: "inventor" | "pro" | "enterprise",
  organizationPlanKey: OrganizationBillingPlan | undefined,
): OrganizationBillingPlan {
  return organizationPlanKey ?? tier;
}

export const applySubscriptionEvent = internalMutation({
  args: {
    providerEventId: v.string(),
    customerEmail: v.string(),
    tier: v.union(v.literal("inventor"), v.literal("pro"), v.literal("enterprise")),
    organizationPlanKey: v.optional(v.union(
      v.literal("inventor"),
      v.literal("pro"),
      v.literal("enterprise"),
      v.literal("studio_3"),
      v.literal("studio_6"),
      v.literal("studio_custom"),
    )),
    status: v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"), v.literal("canceled"),
      v.literal("unpaid"), v.literal("incomplete"), v.literal("paused")
    ),
    subscriptionId: v.optional(v.string()),
    billingCustomerId: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    currentPeriodEnd: v.optional(v.number()),
    occurredAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptionEvents")
      .withIndex("by_providerEventId", (q) => q.eq("providerEventId", args.providerEventId))
      .unique();
    if (existing) return {
      duplicate: true,
      applied: Boolean(existing.appliedUserId || existing.appliedOrganizationId),
    };

    const receivedAt = Date.now();
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.customerEmail)).first();

    if (args.organizationId) {
      const organization = await ctx.db.get(args.organizationId);
      const ownerMemberships = organization
        ? (await ctx.db
            .query("organizationMemberships")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", args.organizationId!))
            .collect())
            .filter((membership) => membership.status === "active" && membership.role === "owner")
        : [];
      const ownerMembership = ownerMemberships.length === 1 ? ownerMemberships[0] : null;
      const billingOwner = ownerMembership ? await ctx.db.get(ownerMembership.userId) : null;
      const ownerEmail = billingOwner?.email?.trim().toLowerCase();
      const validTarget = Boolean(
        organization &&
        organization.status === "active" &&
        ownerMembership &&
        ownerMembership.userId === organization.createdByUserId &&
        ownerEmail &&
        ownerEmail === args.customerEmail.trim().toLowerCase()
      );
      // Billing recency is independent from organization profile/team edits.
      const stale = Boolean(organization && (organization.subscriptionUpdatedAt ?? 0) > args.occurredAt);
      const plan = requestedOrganizationPlan(args.tier, args.organizationPlanKey);
      const eventId = await ctx.db.insert("subscriptionEvents", {
        providerEventId: args.providerEventId,
        customerEmail: args.customerEmail,
        tier: args.tier,
        organizationPlanKey: plan,
        status: args.status,
        subscriptionId: args.subscriptionId,
        billingCustomerId: args.billingCustomerId,
        currentPeriodEnd: args.currentPeriodEnd,
        occurredAt: args.occurredAt,
        appliedOrganizationId: validTarget && !stale ? args.organizationId : undefined,
        receivedAt,
      });
      if (!validTarget) return { duplicate: false, applied: false, eventId, invalidOrganizationTarget: true };
      if (stale) return { duplicate: false, applied: false, eventId, stale: true };

      const effectivePlan = effectiveOrganizationPlanForSubscription(
        plan,
        args.status,
        args.currentPeriodEnd,
        receivedAt,
      );
      await ctx.db.patch(args.organizationId, {
        planKey: effectivePlan,
        subscriptionStatus: args.status,
        subscriptionId: args.subscriptionId,
        billingCustomerId: args.billingCustomerId,
        subscriptionCurrentPeriodEnd: args.currentPeriodEnd,
        subscriptionUpdatedAt: args.occurredAt,
        updatedAt: Math.max(organization?.updatedAt ?? 0, args.occurredAt),
      });
      return {
        duplicate: false,
        applied: true,
        eventId,
        scope: "organization" as const,
        organizationId: args.organizationId,
        planKey: effectivePlan,
      };
    }

    // Exact organization plans are invalid on the legacy user billing path.
    if (args.organizationPlanKey) {
      const eventId = await ctx.db.insert("subscriptionEvents", {
        providerEventId: args.providerEventId,
        customerEmail: args.customerEmail,
        tier: args.tier,
        organizationPlanKey: args.organizationPlanKey,
        status: args.status,
        subscriptionId: args.subscriptionId,
        billingCustomerId: args.billingCustomerId,
        currentPeriodEnd: args.currentPeriodEnd,
        occurredAt: args.occurredAt,
        receivedAt,
      });
      return { duplicate: false, applied: false, eventId, invalidOrganizationPlanTarget: true };
    }

    const stale = Boolean(user && (user.subscriptionUpdatedAt ?? 0) > args.occurredAt);
    const eventId = await ctx.db.insert("subscriptionEvents", {
      providerEventId: args.providerEventId,
      customerEmail: args.customerEmail,
      tier: args.tier,
      status: args.status,
      subscriptionId: args.subscriptionId,
      billingCustomerId: args.billingCustomerId,
      currentPeriodEnd: args.currentPeriodEnd,
      occurredAt: args.occurredAt,
      appliedUserId: user && !stale ? user._id : undefined,
      receivedAt,
    });
    if (!user) return { duplicate: false, applied: false, eventId };
    if (stale) return { duplicate: false, applied: false, eventId, stale: true };

    const effectiveTier = user.role === "admin"
      ? "enterprise" as const
      : effectiveTierForSubscription(args.tier, args.status, args.currentPeriodEnd, receivedAt);
    await ctx.db.patch(user._id, {
      subscriptionTier: effectiveTier,
      subscriptionStatus: args.status,
      subscriptionId: args.subscriptionId,
      billingCustomerId: args.billingCustomerId,
      subscriptionCurrentPeriodEnd: args.currentPeriodEnd,
      subscriptionUpdatedAt: args.occurredAt,
    });

    // Migration compatibility: once a legacy subscriber has a personal
    // organization, mirror that legacy entitlement into the personal org so
    // organization-owned inventions use the same paid state without requiring
    // a second purchase. Explicit organization-targeted events above remain the
    // authoritative path for company/studio subscriptions.
    if (user.personalOrganizationId) {
      const personalOrganization = await ctx.db.get(user.personalOrganizationId);
      if (
        personalOrganization &&
        personalOrganization.kind === "personal" &&
        personalOrganization.status === "active" &&
        (personalOrganization.subscriptionUpdatedAt ?? 0) <= args.occurredAt
      ) {
        await ctx.db.patch(personalOrganization._id, {
          planKey: organizationPlanForEffectiveTier(effectiveTier),
          subscriptionStatus: args.status,
          subscriptionId: args.subscriptionId,
          billingCustomerId: args.billingCustomerId,
          subscriptionCurrentPeriodEnd: args.currentPeriodEnd,
          subscriptionUpdatedAt: args.occurredAt,
          updatedAt: Math.max(personalOrganization.updatedAt, args.occurredAt),
        });
      }
    }

    return { duplicate: false, applied: true, eventId, scope: "legacy_user" as const };
  },
});
