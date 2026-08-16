import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { effectiveTierForSubscription, validateSubscriptionWebhookPayload } from "@convex/subscriptionPolicyLogic";

describe("subscription lifecycle policy", () => {
  it("keeps access during an active paid period and downgrades after it ends", () => {
    const now = 1_000;
    expect(effectiveTierForSubscription("pro", "active", undefined, now)).toBe("pro");
    expect(effectiveTierForSubscription("pro", "canceled", now + 1, now)).toBe("pro");
    expect(effectiveTierForSubscription("pro", "canceled", now - 1, now)).toBe("free");
    expect(effectiveTierForSubscription("pro", "unpaid", now + 100, now)).toBe("free");
  });

  it("validates and normalizes signed lifecycle payloads including optional organization targeting", () => {
    expect(validateSubscriptionWebhookPayload({
      eventId: "evt_1", customerEmail: "BUYER@EXAMPLE.COM", tier: "inventor",
      status: "active", organizationId: " org_123 ", occurredAt: 100,
    })).toMatchObject({ customerEmail: "buyer@example.com", tier: "inventor", status: "active", organizationId: "org_123" });
    expect(validateSubscriptionWebhookPayload({ eventId: "evt", customerEmail: "a@b.com", tier: "free", status: "active", occurredAt: 1 })).toBeNull();
    expect(validateSubscriptionWebhookPayload({ eventId: "evt", customerEmail: "bad", tier: "pro", status: "active", occurredAt: 1 })).toBeNull();
    expect(validateSubscriptionWebhookPayload({ eventId: "evt", customerEmail: "a@b.com", tier: "pro", status: "active", organizationId: "", occurredAt: 1 })).toBeNull();
  });

  it("applies explicitly targeted subscriptions to the organization without duplicating entitlement across users", () => {
    const mutation = readFileSync(join(process.cwd(), "convex/subscriptionMutations.ts"), "utf8");
    const http = readFileSync(join(process.cwd(), "convex/http.ts"), "utf8");

    expect(http).toContain("organizationId: body.organizationId");
    expect(mutation).toContain("if (args.organizationId)");
    expect(mutation).toContain("ownerEmail === args.customerEmail.trim().toLowerCase()");
    expect(mutation).toContain("ctx.db.patch(args.organizationId");
    expect(mutation).toContain('scope: "organization"');
    expect(mutation).toContain("planKey: organizationPlanForEffectiveTier(effectiveTier)");
  });

  it("mirrors legacy personal subscriptions into the personal organization during migration", () => {
    const mutation = readFileSync(join(process.cwd(), "convex/subscriptionMutations.ts"), "utf8");
    expect(mutation).toContain("if (user.personalOrganizationId)");
    expect(mutation).toContain('personalOrganization.kind === "personal"');
    expect(mutation).toContain("ctx.db.patch(personalOrganization._id");
  });
});
