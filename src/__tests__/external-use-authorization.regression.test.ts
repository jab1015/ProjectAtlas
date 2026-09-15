import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(async () => authState.userId),
}));

import { authorizeDeliverableExternalUseHandler } from "../../convex/externalUseAuthorization";

type Row = Record<string, any> & { _id: string };

function fakeCtx(input: {
  invention?: Row;
  deliverables: Row[];
}) {
  const rows = new Map<string, Row>();
  if (input.invention) rows.set(input.invention._id, input.invention);
  for (const deliverable of input.deliverables) rows.set(deliverable._id, deliverable);

  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const inserts: Array<{ table: string; value: Record<string, unknown> }> = [];

  const ctx = {
    db: {
      get: vi.fn(async (id: string) => rows.get(id) ?? null),
      query: vi.fn((table: string) => ({
        withIndex: (_index: string, apply: (q: any) => any) => {
          const filters: Record<string, unknown> = {};
          const q = {
            eq(field: string, value: unknown) {
              filters[field] = value;
              return q;
            },
          };
          apply(q);
          return {
            collect: async () => {
              if (table !== "atlasDeliverables") return [];
              return input.deliverables.filter((row) =>
                Object.entries(filters).every(([field, value]) => row[field] === value)
              );
            },
            first: async () => null,
          };
        },
      })),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id, value });
        const existing = rows.get(id);
        if (existing) Object.assign(existing, value);
      }),
      insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
        inserts.push({ table, value });
        return `insert-${inserts.length}`;
      }),
    },
  } as any;

  return { ctx, patches, inserts };
}

function invention() {
  return { _id: "inv1", userId: "owner1", title: "Representative invention" };
}

function deliverable(overrides: Record<string, unknown> = {}) {
  return {
    _id: "del1",
    inventionId: "inv1",
    kind: "market_analysis",
    title: "Market analysis",
    version: 2,
    trustState: "atlas_draft",
    sourceIds: [],
    assumptions: [],
    limitations: [],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("exact-revision external-use authorization", () => {
  beforeEach(() => {
    authState.userId = "owner1";
  });

  it("authorizes the latest fresh artifact and records the exact revision and actor", async () => {
    const current = deliverable();
    const { ctx, patches, inserts } = fakeCtx({ invention: invention(), deliverables: [current] });

    await expect(authorizeDeliverableExternalUseHandler(ctx, { deliverableId: "del1" as any })).resolves.toMatchObject({
      success: true,
      idempotent: false,
      deliverableId: "del1",
      version: 2,
    });

    expect(patches).toHaveLength(1);
    expect(patches[0]).toMatchObject({ id: "del1", value: { trustState: "ready_for_authorized_use" } });
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      table: "atlasExecutionEvents",
      value: {
        inventionId: "inv1",
        eventType: "invention_changed",
        actorType: "inventor",
        metadata: {
          changeType: "external_use_authorization",
          deliverableId: "del1",
          deliverableKind: "market_analysis",
          deliverableVersion: 2,
          authorizedByUserId: "owner1",
        },
      },
    });
  });

  it("rejects an older revision without database side effects", async () => {
    const old = deliverable({ _id: "del1", version: 1 });
    const latest = deliverable({ _id: "del2", version: 2 });
    const { ctx, patches, inserts } = fakeCtx({ invention: invention(), deliverables: [old, latest] });

    await expect(authorizeDeliverableExternalUseHandler(ctx, { deliverableId: "del1" as any })).rejects.toThrow(/latest deliverable revision/i);
    expect(patches).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it("rejects stale artifacts without database side effects", async () => {
    const current = deliverable({ staleReason: "Evidence changed" });
    const { ctx, patches, inserts } = fakeCtx({ invention: invention(), deliverables: [current] });

    await expect(authorizeDeliverableExternalUseHandler(ctx, { deliverableId: "del1" as any })).rejects.toThrow(/must be refreshed/i);
    expect(patches).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it("does not let inventor authorization replace required professional review", async () => {
    const cad = deliverable({
      kind: "native_cad_package",
      trustState: "professional_review_required",
    });
    const { ctx, patches, inserts } = fakeCtx({ invention: invention(), deliverables: [cad] });

    await expect(authorizeDeliverableExternalUseHandler(ctx, { deliverableId: "del1" as any })).rejects.toThrow(/professional review must be completed/i);
    expect(patches).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it("allows explicit authorization after required professional review is complete", async () => {
    const cad = deliverable({
      kind: "native_cad_package",
      trustState: "professionally_reviewed",
    });
    const { ctx, patches, inserts } = fakeCtx({ invention: invention(), deliverables: [cad] });

    await expect(authorizeDeliverableExternalUseHandler(ctx, { deliverableId: "del1" as any })).resolves.toMatchObject({ success: true, idempotent: false });
    expect(patches[0]).toMatchObject({ id: "del1", value: { trustState: "ready_for_authorized_use" } });
    expect(inserts).toHaveLength(1);
  });

  it("rejects a non-manager before any write", async () => {
    authState.userId = "other-user";
    const current = deliverable();
    const { ctx, patches, inserts } = fakeCtx({ invention: invention(), deliverables: [current] });

    await expect(authorizeDeliverableExternalUseHandler(ctx, { deliverableId: "del1" as any })).rejects.toThrow(/invention access required/i);
    expect(patches).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it("is idempotent and does not duplicate audit events", async () => {
    const current = deliverable({ trustState: "ready_for_authorized_use" });
    const { ctx, patches, inserts } = fakeCtx({ invention: invention(), deliverables: [current] });

    await expect(authorizeDeliverableExternalUseHandler(ctx, { deliverableId: "del1" as any })).resolves.toMatchObject({ success: true, idempotent: true });
    expect(patches).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });
});
