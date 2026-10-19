import { describe, expect, it, vi } from "vitest";

import { applySubscriptionEventHandler } from "../../convex/subscriptionMutations";

type Row = Record<string, any> & { _id: string };

function buildCtx(args?: {
  subscriptionEvents?: Row[];
  users?: Row[];
  memberships?: Row[];
  documents?: Record<string, Row>;
}) {
  const tables: Record<string, Row[]> = {
    subscriptionEvents: [...(args?.subscriptionEvents ?? [])],
    users: [...(args?.users ?? [])],
    organizationMemberships: [...(args?.memberships ?? [])],
  };
  const documents = { ...(args?.documents ?? {}) };
  let sequence = 0;

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
          const matches = (tables[table] ?? []).filter((row) =>
            Object.entries(filters).every(([field, value]) => row[field] === value)
          );
          return {
            unique: vi.fn(async () => matches[0] ?? null),
            first: vi.fn(async () => matches[0] ?? null),
            collect: vi.fn(async () => matches),
          };
        },
      })),
      get: vi.fn(async (id: string) => documents[String(id)] ?? null),
      insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
        const id = `${table}-insert-${++sequence}`;
        const row = { _id: id, ...value } as Row;
        (tables[table] ??= []).push(row);
        documents[id] = row;
        return id;
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        const key = String(id);
        if (documents[key]) Object.assign(documents[key], value);
        for (const rows of Object.values(tables)) {
          const row = rows.find((candidate) => candidate._id === key);
          if (row) Object.assign(row, value);
        }
      }),
    },
  } as any;

  return { ctx, tables, documents };
}

function organizationState() {
  return buildCtx({
    memberships: [{
      _id: "membership-owner",
      organizationId: "org-1",
      userId: "owner-1",
      role: "owner",
      status: "active",
    }],
    documents: {
      "org-1": {
        _id: "org-1",
        name: "Studio",
        kind: "studio",
        planKey: "explorer",
        status: "active",
        createdByUserId: "owner-1",
        billingCustomerId: "customer-1",
        createdAt: 1,
        updatedAt: 1,
      },
      "owner-1": {
        _id: "owner-1",
        email: "owner@example.com",
      },
    },
  });
}

function legacyUserState() {
  const user = {
    _id: "user-1",
    email: "owner@example.com",
    role: "user",
    subscriptionTier: "free",
  };
  return buildCtx({ users: [user], documents: { "user-1": user } });
}

const activeEvent = {
  providerEventId: "evt-a-active",
  customerEmail: "owner@example.com",
  tier: "pro" as const,
  status: "active" as const,
  occurredAt: 500,
};

const unpaidEvent = {
  providerEventId: "evt-z-unpaid",
  customerEmail: "owner@example.com",
  tier: "pro" as const,
  status: "unpaid" as const,
  occurredAt: 500,
};

const olderUnpaidEvent = {
  providerEventId: "evt-older-unpaid",
  customerEmail: "owner@example.com",
  tier: "pro" as const,
  status: "unpaid" as const,
  occurredAt: 400,
};

const newerActiveEvent = {
  providerEventId: "evt-newer-active",
  customerEmail: "owner@example.com",
  tier: "pro" as const,
  status: "active" as const,
  occurredAt: 600,
};

describe("subscription provider event ordering", () => {
  it("produces the same organization entitlement for equal timestamps regardless of arrival order", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      for (const events of [
        [activeEvent, unpaidEvent],
        [unpaidEvent, activeEvent],
      ]) {
        const state = organizationState();
        const results = [];
        for (const event of events) {
          results.push(await applySubscriptionEventHandler(state.ctx, {
            ...event,
            organizationId: "org-1" as any,
            billingCustomerId: "customer-1",
          }));
        }

        expect(state.documents["org-1"]).toMatchObject({
          planKey: "explorer",
          subscriptionStatus: "unpaid",
          subscriptionUpdatedAt: 500,
        });
        const activeResult = results[events.findIndex((event) => event.providerEventId === activeEvent.providerEventId)];
        if (events[0].providerEventId === unpaidEvent.providerEventId) {
          expect(activeResult).toMatchObject({ applied: false, stale: true });
        }
      }
    } finally {
      now.mockRestore();
    }
  });

  it("produces the same legacy-user entitlement for equal timestamps regardless of arrival order", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      for (const events of [
        [activeEvent, unpaidEvent],
        [unpaidEvent, activeEvent],
      ]) {
        const state = legacyUserState();
        const results = [];
        for (const event of events) {
          results.push(await applySubscriptionEventHandler(state.ctx, event));
        }

        expect(state.documents["user-1"]).toMatchObject({
          subscriptionTier: "free",
          subscriptionStatus: "unpaid",
          subscriptionUpdatedAt: 500,
        });
        const activeResult = results[events.findIndex((event) => event.providerEventId === activeEvent.providerEventId)];
        if (events[0].providerEventId === unpaidEvent.providerEventId) {
          expect(activeResult).toMatchObject({ applied: false, stale: true });
        }
      }
    } finally {
      now.mockRestore();
    }
  });

  it("ignores a delayed older organization event regardless of delivery order", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      for (const events of [
        [olderUnpaidEvent, newerActiveEvent],
        [newerActiveEvent, olderUnpaidEvent],
      ]) {
        const state = organizationState();
        const results = [];
        for (const event of events) {
          results.push(await applySubscriptionEventHandler(state.ctx, {
            ...event,
            organizationId: "org-1" as any,
            billingCustomerId: "customer-1",
          }));
        }

        expect(state.documents["org-1"]).toMatchObject({
          planKey: "pro",
          subscriptionStatus: "active",
          subscriptionUpdatedAt: 600,
        });
        if (events[0].providerEventId === newerActiveEvent.providerEventId) {
          expect(results[1]).toMatchObject({ applied: false, stale: true });
        }
      }
    } finally {
      now.mockRestore();
    }
  });

  it("ignores a delayed older legacy-user event regardless of delivery order", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    try {
      for (const events of [
        [olderUnpaidEvent, newerActiveEvent],
        [newerActiveEvent, olderUnpaidEvent],
      ]) {
        const state = legacyUserState();
        const results = [];
        for (const event of events) {
          results.push(await applySubscriptionEventHandler(state.ctx, event));
        }

        expect(state.documents["user-1"]).toMatchObject({
          subscriptionTier: "pro",
          subscriptionStatus: "active",
          subscriptionUpdatedAt: 600,
        });
        if (events[0].providerEventId === newerActiveEvent.providerEventId) {
          expect(results[1]).toMatchObject({ applied: false, stale: true });
        }
      }
    } finally {
      now.mockRestore();
    }
  });
});
