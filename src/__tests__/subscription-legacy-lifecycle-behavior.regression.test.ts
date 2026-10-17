import { describe, expect, it, vi } from "vitest";

import { applySubscriptionEventHandler } from "../../convex/subscriptionMutations";

type Row = Record<string, any> & { _id: string };

function buildState() {
  const user: Row = {
    _id: "user-1",
    email: "owner@example.com",
    role: "user",
    subscriptionTier: "pro",
    subscriptionStatus: "active",
    subscriptionUpdatedAt: 0,
    personalOrganizationId: "org-personal",
  };
  const personalOrganization: Row = {
    _id: "org-personal",
    kind: "personal",
    status: "active",
    planKey: "pro",
    subscriptionStatus: "active",
    subscriptionUpdatedAt: 0,
    updatedAt: 10,
  };
  const subscriptionEvents: Row[] = [];
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  let insertSequence = 0;

  const ctx = {
    db: {
      query: vi.fn((table: string) => ({
        withIndex: (_index: string, apply: (q: any) => unknown) => {
          const filters: Record<string, unknown> = {};
          const q: any = {
            eq(field: string, value: unknown) {
              filters[field] = value;
              return q;
            },
          };
          apply(q);
          const rows = table === "users" ? [user] : table === "subscriptionEvents" ? subscriptionEvents : [];
          const matches = rows.filter((row) =>
            Object.entries(filters).every(([field, value]) => row[field] === value),
          );
          return {
            unique: vi.fn(async () => matches[0] ?? null),
            first: vi.fn(async () => matches[0] ?? null),
          };
        },
      })),
      get: vi.fn(async (id: string) => id === "org-personal" ? personalOrganization : null),
      insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
        const id = `${table}-insert-${++insertSequence}`;
        if (table === "subscriptionEvents") subscriptionEvents.push({ _id: id, ...value });
        return id;
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
        if (id === user._id) Object.assign(user, value);
        if (id === personalOrganization._id) Object.assign(personalOrganization, value);
      }),
    },
  } as any;

  return { ctx, user, personalOrganization, patches, subscriptionEvents };
}

const baseEvent = {
  providerEventId: "evt-legacy",
  customerEmail: "owner@example.com",
  tier: "pro" as const,
  occurredAt: 100,
};

describe("legacy subscription lifecycle behavior", () => {
  it("keeps the user and personal organization paid during canceled or past-due access before period end", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      for (const status of ["canceled", "past_due"] as const) {
        const state = buildState();
        const result = await applySubscriptionEventHandler(state.ctx, {
          ...baseEvent,
          providerEventId: `evt-legacy-${status}`,
          status,
          currentPeriodEnd: 1_001,
        });

        expect(result).toMatchObject({ applied: true, scope: "legacy_user" });
        expect(state.user).toMatchObject({
          subscriptionTier: "pro",
          subscriptionStatus: status,
          subscriptionCurrentPeriodEnd: 1_001,
          subscriptionUpdatedAt: 100,
        });
        expect(state.personalOrganization).toMatchObject({
          planKey: "pro",
          subscriptionStatus: status,
          subscriptionCurrentPeriodEnd: 1_001,
          subscriptionUpdatedAt: 100,
        });
        expect(state.patches.map((patch) => patch.id)).toEqual(["user-1", "org-personal"]);
      }
    } finally {
      now.mockRestore();
    }
  });

  it("downgrades both user and personal organization at exact canceled period end", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const state = buildState();
      const result = await applySubscriptionEventHandler(state.ctx, {
        ...baseEvent,
        status: "canceled",
        currentPeriodEnd: 1_000,
      });

      expect(result).toMatchObject({ applied: true, scope: "legacy_user" });
      expect(state.user.subscriptionTier).toBe("free");
      expect(state.personalOrganization.planKey).toBe("explorer");
      expect(state.user.subscriptionStatus).toBe("canceled");
      expect(state.personalOrganization.subscriptionStatus).toBe("canceled");
    } finally {
      now.mockRestore();
    }
  });

  it("downgrades unpaid access immediately even when the provider period is still in the future", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      const state = buildState();
      const result = await applySubscriptionEventHandler(state.ctx, {
        ...baseEvent,
        status: "unpaid",
        currentPeriodEnd: 2_000,
      });

      expect(result).toMatchObject({ applied: true, scope: "legacy_user" });
      expect(state.user).toMatchObject({
        subscriptionTier: "free",
        subscriptionStatus: "unpaid",
        subscriptionCurrentPeriodEnd: 2_000,
      });
      expect(state.personalOrganization).toMatchObject({
        planKey: "explorer",
        subscriptionStatus: "unpaid",
        subscriptionCurrentPeriodEnd: 2_000,
      });
    } finally {
      now.mockRestore();
    }
  });
});
