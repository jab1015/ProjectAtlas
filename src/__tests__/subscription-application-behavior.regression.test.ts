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
  const inserts: Array<{ table: string; value: Record<string, unknown>; id: string }> = [];
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
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
        inserts.push({ table, value, id });
        const row = { _id: id, ...value } as Row;
        (tables[table] ??= []).push(row);
        documents[id] = row;
        return id;
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        const key = String(id);
        patches.push({ id: key, value });
        if (documents[key]) Object.assign(documents[key], value);
        for (const rows of Object.values(tables)) {
          const row = rows.find((candidate) => candidate._id === key);
          if (row) Object.assign(row, value);
        }
      }),
    },
  } as any;

  return { ctx, inserts, patches, tables, documents };
}

const baseEvent = {
  providerEventId: "evt-new",
  customerEmail: "owner@example.com",
  tier: "pro" as const,
  status: "active" as const,
  occurredAt: 100,
};

describe("subscription application behavior", () => {
  it("treats an existing provider event as idempotent with zero new writes", async () => {
    const state = buildCtx({
      subscriptionEvents: [
        {
          _id: "existing-event",
          providerEventId: "evt-existing",
          appliedOrganizationId: "org-1",
        },
      ],
    });

    const result = await applySubscriptionEventHandler(state.ctx, {
      ...baseEvent,
      providerEventId: "evt-existing",
    });

    expect(result).toEqual({ duplicate: true, applied: true });
    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([]);
  });

  it("records but does not apply an organization event whose billing identity does not match", async () => {
    const state = buildCtx({
      memberships: [
        {
          _id: "membership-owner",
          organizationId: "org-1",
          userId: "owner-1",
          role: "owner",
          status: "active",
        },
      ],
      documents: {
        "org-1": {
          _id: "org-1",
          kind: "company",
          status: "active",
          createdByUserId: "owner-1",
          updatedAt: 10,
        },
        "owner-1": {
          _id: "owner-1",
          email: "different@example.com",
        },
      },
    });

    const result = await applySubscriptionEventHandler(state.ctx, {
      ...baseEvent,
      organizationId: "org-1" as any,
      billingCustomerId: "customer-unrecognized",
    });

    expect(result).toMatchObject({
      duplicate: false,
      applied: false,
      invalidOrganizationTarget: true,
    });
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0].table).toBe("subscriptionEvents");
    expect(state.inserts[0].value).not.toHaveProperty("appliedOrganizationId", "org-1");
    expect(state.patches).toEqual([]);
  });

  it("records but does not apply a stale organization billing event", async () => {
    const state = buildCtx({
      memberships: [
        {
          _id: "membership-owner",
          organizationId: "org-1",
          userId: "owner-1",
          role: "owner",
          status: "active",
        },
      ],
      documents: {
        "org-1": {
          _id: "org-1",
          kind: "company",
          status: "active",
          createdByUserId: "owner-1",
          subscriptionUpdatedAt: 200,
          updatedAt: 200,
        },
        "owner-1": {
          _id: "owner-1",
          email: "owner@example.com",
        },
      },
    });

    const result = await applySubscriptionEventHandler(state.ctx, {
      ...baseEvent,
      organizationId: "org-1" as any,
    });

    expect(result).toMatchObject({ duplicate: false, applied: false, stale: true });
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0].value).not.toHaveProperty("appliedOrganizationId", "org-1");
    expect(state.patches).toEqual([]);
  });

  it("applies a valid organization event only to the targeted organization", async () => {
    const state = buildCtx({
      memberships: [
        {
          _id: "membership-owner",
          organizationId: "org-1",
          userId: "owner-1",
          role: "owner",
          status: "active",
        },
      ],
      documents: {
        "org-1": {
          _id: "org-1",
          kind: "company",
          status: "active",
          createdByUserId: "owner-1",
          billingCustomerId: "customer-1",
          updatedAt: 10,
        },
        "owner-1": {
          _id: "owner-1",
          email: "owner@example.com",
        },
        "org-2": {
          _id: "org-2",
          kind: "company",
          status: "active",
          createdByUserId: "owner-2",
          planKey: "explorer",
          updatedAt: 10,
        },
      },
    });

    const result = await applySubscriptionEventHandler(state.ctx, {
      ...baseEvent,
      organizationId: "org-1" as any,
      billingCustomerId: "customer-1",
    });

    expect(result).toMatchObject({
      duplicate: false,
      applied: true,
      scope: "organization",
      organizationId: "org-1",
      planKey: "pro",
    });
    expect(state.patches).toHaveLength(1);
    expect(state.patches[0].id).toBe("org-1");
    expect(state.patches[0].value).toMatchObject({
      planKey: "pro",
      subscriptionStatus: "active",
      billingCustomerId: "customer-1",
      subscriptionUpdatedAt: 100,
    });
    expect(state.documents["org-2"].planKey).toBe("explorer");
  });

  it("records but does not apply a stale legacy-user subscription event", async () => {
    const user = {
      _id: "user-1",
      email: "owner@example.com",
      role: "user",
      subscriptionTier: "pro",
      subscriptionUpdatedAt: 200,
    };
    const state = buildCtx({ users: [user] });

    const result = await applySubscriptionEventHandler(state.ctx, baseEvent);

    expect(result).toMatchObject({ duplicate: false, applied: false, stale: true });
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0].value).not.toHaveProperty("appliedUserId", "user-1");
    expect(state.patches).toEqual([]);
  });

  it("rejects an organization-only plan on the legacy user path without changing entitlement", async () => {
    const user = {
      _id: "user-1",
      email: "owner@example.com",
      role: "user",
      subscriptionTier: "free",
      subscriptionUpdatedAt: 0,
    };
    const state = buildCtx({ users: [user] });

    const result = await applySubscriptionEventHandler(state.ctx, {
      ...baseEvent,
      tier: "enterprise",
      organizationPlanKey: "studio_3",
    });

    expect(result).toMatchObject({
      duplicate: false,
      applied: false,
      invalidOrganizationPlanTarget: true,
    });
    expect(state.inserts).toHaveLength(1);
    expect(state.patches).toEqual([]);
  });
});
