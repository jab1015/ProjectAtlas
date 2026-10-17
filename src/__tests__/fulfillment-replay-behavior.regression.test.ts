import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { createFromFulfillmentHandler } from "../../convex/purchasesMutations";

type Row = Record<string, any> & { _id: string };

function buildCtx(args?: { purchases?: Row[]; users?: Row[] }) {
  const tables: Record<string, Row[]> = {
    purchases: [...(args?.purchases ?? [])],
    users: [...(args?.users ?? [])],
  };
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
          };
        },
      })),
      insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
        const id = `${table}-insert-${++sequence}`;
        inserts.push({ table, value, id });
        (tables[table] ??= []).push({ _id: id, ...value });
        return id;
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
        const row = Object.values(tables).flat().find((candidate) => candidate._id === String(id));
        if (row) Object.assign(row, value);
      }),
    },
  } as any;

  return { ctx, tables, inserts, patches };
}

const baseArgs = {
  productId: "product-1" as any,
  customerEmail: "buyer@example.com",
  customerName: "Buyer",
  platformOrderId: "order-1",
  stripeCheckoutSessionId: "session-1",
  amountCents: 9900,
  currency: "usd",
  downloadToken: "token-new",
};

describe("fulfillment replay behavior", () => {
  it("returns an existing Stripe purchase as a replay without inserting or patching", async () => {
    const state = buildCtx({
      purchases: [{
        _id: "purchase-existing",
        stripeCheckoutSessionId: "session-1",
        platformOrderId: "order-1",
      }],
    });

    const result = await createFromFulfillmentHandler(state.ctx, baseArgs);

    expect(result).toEqual({ purchaseId: "purchase-existing", created: false });
    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([]);
  });

  it("returns an existing platform order as a replay and only backfills a missing Stripe session id", async () => {
    const state = buildCtx({
      purchases: [{
        _id: "purchase-existing",
        platformOrderId: "order-1",
      }],
    });

    const result = await createFromFulfillmentHandler(state.ctx, baseArgs);

    expect(result).toEqual({ purchaseId: "purchase-existing", created: false });
    expect(state.inserts).toEqual([]);
    expect(state.patches).toEqual([{ id: "purchase-existing", value: { stripeCheckoutSessionId: "session-1" } }]);
  });

  it("creates one new fulfilled purchase and reports created=true", async () => {
    const state = buildCtx({
      users: [{ _id: "user-1", email: "buyer@example.com" }],
    });

    const result = await createFromFulfillmentHandler(state.ctx, baseArgs);

    expect(result).toEqual({ purchaseId: "purchases-insert-1", created: true });
    expect(state.inserts).toHaveLength(1);
    expect(state.inserts[0]).toMatchObject({
      table: "purchases",
      value: {
        productId: "product-1",
        customerEmail: "buyer@example.com",
        userId: "user-1",
        platformOrderId: "order-1",
        stripeCheckoutSessionId: "session-1",
        fulfillmentStatus: "fulfilled",
        downloadCount: 0,
      },
    });
    expect(state.patches).toEqual([]);
  });

  it("keeps sales counting conditional on a newly created purchase", () => {
    const http = readFileSync(join(process.cwd(), "convex/http.ts"), "utf8");
    const mutation = readFileSync(join(process.cwd(), "convex/purchasesMutations.ts"), "utf8");

    expect(http).toContain("createFromFulfillmentWithStatus");
    expect(http).toContain("if (fulfillment.created)");
    expect(http).toContain("internal.productsMutations.incrementSales");
    expect(mutation).toContain("return { purchaseId: existing._id, created: false as const }");
    expect(mutation).toContain("return { purchaseId, created: true as const }");
  });
});
