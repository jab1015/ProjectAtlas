import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(async () => authState.userId),
}));

import { NATIVE_CAD_DELIVERABLE_KINDS } from "../../convex/cadArtifactKinds";
import { releaseCadGenerationForManufacturingHandler } from "../../convex/manufacturingReleaseMutation";

type Row = Record<string, any> & { _id: string };

function invention() {
  return { _id: "inv1", userId: "owner1", title: "Representative invention" };
}

function generation(options: {
  version?: number;
  maturity?: string;
  trustState?: string;
} = {}): Row[] {
  const version = options.version ?? 3;
  return NATIVE_CAD_DELIVERABLE_KINDS.map((kind, index) => ({
    _id: `cad-${index + 1}`,
    inventionId: "inv1",
    kind,
    title: kind,
    version,
    trustState: options.trustState ?? "professionally_reviewed",
    artifactMaturity: options.maturity ?? "engineering_reviewed",
    sourceIds: [],
    assumptions: [],
    limitations: [],
    createdAt: 10,
    updatedAt: 10,
  }));
}

function acceptedReviews(deliverables: Row[]): Row[] {
  return deliverables.map((deliverable, index) => ({
    _id: `review-${index + 1}`,
    inventionId: "inv1",
    deliverableId: deliverable._id,
    specialty: "engineering",
    requiredCredentials: "Qualified product-development engineer",
    scope: "Review exact CAD revision",
    status: "accepted",
    reviewerName: "Engineer Example",
    reviewerReference: `PE-${1000 + index}`,
    reviewedAt: 20,
    requestedAt: 5,
    createdAt: 5,
    updatedAt: 20,
  }));
}

function fakeCtx(input: {
  deliverables: Row[];
  reviews?: Row[];
  events?: Row[];
  invention?: Row;
}) {
  const rows = new Map<string, Row>();
  const inv = input.invention ?? invention();
  rows.set(inv._id, inv);
  for (const row of [...input.deliverables, ...(input.reviews ?? []), ...(input.events ?? [])]) {
    rows.set(row._id, row);
  }
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const inserts: Array<{ table: string; value: Record<string, unknown> }> = [];

  const tableRows: Record<string, Row[]> = {
    atlasDeliverables: input.deliverables,
    professionalReviews: input.reviews ?? [],
    atlasExecutionEvents: input.events ?? [],
    inventionAccessGrants: [],
  };

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
          const filtered = () => (tableRows[table] ?? []).filter((row) =>
            Object.entries(filters).every(([field, value]) => row[field] === value)
          );
          return {
            collect: async () => filtered(),
            first: async () => filtered()[0] ?? null,
            unique: async () => filtered()[0] ?? null,
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

describe("deliberate manufacturing release", () => {
  beforeEach(() => {
    authState.userId = "owner1";
  });

  it("atomically releases the complete exact current six-artifact CAD generation", async () => {
    const deliverables = generation();
    const { ctx, patches, inserts } = fakeCtx({
      deliverables,
      reviews: acceptedReviews(deliverables),
    });

    await expect(releaseCadGenerationForManufacturingHandler(ctx, { deliverableId: "cad-1" as any }))
      .resolves.toMatchObject({ success: true, idempotent: false, version: 3 });

    expect(patches).toHaveLength(NATIVE_CAD_DELIVERABLE_KINDS.length);
    expect(patches.map((patch) => patch.id).sort()).toEqual(deliverables.map((item) => item._id).sort());
    for (const patch of patches) {
      expect(patch.value).toMatchObject({ artifactMaturity: "manufacturing_released" });
      expect(patch.value).not.toHaveProperty("trustState");
    }
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      table: "atlasExecutionEvents",
      value: {
        inventionId: "inv1",
        eventType: "invention_changed",
        actorType: "inventor",
        metadata: {
          changeType: "manufacturing_release",
          cadVersion: 3,
          releasedByUserId: "owner1",
        },
      },
    });
    expect(inserts[0].value.summary).toMatch(/no supplier contact, disclosure, purchase, payment, production order, filing, or publication/i);
  });

  it("preserves external-use authorization while changing only maturity", async () => {
    const deliverables = generation({ trustState: "ready_for_authorized_use" });
    const { ctx, patches } = fakeCtx({ deliverables, reviews: acceptedReviews(deliverables) });

    await releaseCadGenerationForManufacturingHandler(ctx, { deliverableId: "cad-3" as any });
    expect(patches).toHaveLength(6);
    expect(patches.every((patch) => !Object.hasOwn(patch.value, "trustState"))).toBe(true);
  });

  it("rejects incomplete, stale, superseded, ambiguous, or unsynchronized CAD generations without writes", async () => {
    const cases: Row[][] = [];
    const incomplete = generation().slice(0, 5);
    cases.push(incomplete);

    const stale = generation();
    stale[2].staleReason = "Evidence changed";
    cases.push(stale);

    const superseded = generation();
    superseded.push({ ...superseded[0], _id: "newer-step", version: 4 });
    cases.push(superseded);

    const ambiguous = generation();
    ambiguous.push({ ...ambiguous[0], _id: "duplicate-step" });
    cases.push(ambiguous);

    for (const deliverables of cases) {
      const reviews = acceptedReviews(deliverables);
      const { ctx, patches, inserts } = fakeCtx({ deliverables, reviews });
      await expect(releaseCadGenerationForManufacturingHandler(ctx, { deliverableId: "cad-1" as any })).rejects.toThrow();
      expect(patches).toHaveLength(0);
      expect(inserts).toHaveLength(0);
    }
  });

  it("requires engineering-reviewed maturity and exact auditable accepted reviews for every artifact", async () => {
    const maturityBad = generation();
    maturityBad[4].artifactMaturity = "preliminary_cad";
    let state = fakeCtx({ deliverables: maturityBad, reviews: acceptedReviews(maturityBad) });
    await expect(releaseCadGenerationForManufacturingHandler(state.ctx, { deliverableId: "cad-1" as any })).rejects.toThrow(/engineering reviewed/i);
    expect(state.patches).toHaveLength(0);

    const missingReview = generation();
    state = fakeCtx({ deliverables: missingReview, reviews: acceptedReviews(missingReview).slice(0, 5) });
    await expect(releaseCadGenerationForManufacturingHandler(state.ctx, { deliverableId: "cad-1" as any })).rejects.toThrow(/professional reviews/i);
    expect(state.patches).toHaveLength(0);

    const changesRequested = generation();
    const reviews = acceptedReviews(changesRequested);
    reviews.push({ ...reviews[0], _id: "review-changes", status: "changes_requested", reviewerReference: "PE-CHANGES" });
    state = fakeCtx({ deliverables: changesRequested, reviews });
    await expect(releaseCadGenerationForManufacturingHandler(state.ctx, { deliverableId: "cad-1" as any })).rejects.toThrow(/all exact professional reviews/i);
    expect(state.patches).toHaveLength(0);

    const unauditable = generation();
    const badReviews = acceptedReviews(unauditable);
    badReviews[0].reviewerReference = "";
    state = fakeCtx({ deliverables: unauditable, reviews: badReviews });
    await expect(releaseCadGenerationForManufacturingHandler(state.ctx, { deliverableId: "cad-1" as any })).rejects.toThrow(/auditable accepted engineering review/i);
    expect(state.patches).toHaveLength(0);
  });

  it("rejects a non-manager before release side effects", async () => {
    authState.userId = "other-user";
    const deliverables = generation();
    const { ctx, patches, inserts } = fakeCtx({ deliverables, reviews: acceptedReviews(deliverables) });

    await expect(releaseCadGenerationForManufacturingHandler(ctx, { deliverableId: "cad-1" as any })).rejects.toThrow(/invention access required/i);
    expect(patches).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it("is idempotent only when the complete released generation has exact audit evidence", async () => {
    const deliverables = generation({ maturity: "manufacturing_released" });
    const ids = deliverables.map((item) => item._id).sort();
    const events = [{
      _id: "event-1",
      inventionId: "inv1",
      eventType: "invention_changed",
      actorType: "inventor",
      summary: "Released",
      metadata: { changeType: "manufacturing_release", cadVersion: 3, deliverableIds: ids, releasedByUserId: "owner1" },
      createdAt: 30,
    }];
    let state = fakeCtx({ deliverables, reviews: acceptedReviews(deliverables), events });
    await expect(releaseCadGenerationForManufacturingHandler(state.ctx, { deliverableId: "cad-6" as any }))
      .resolves.toMatchObject({ success: true, idempotent: true, version: 3 });
    expect(state.patches).toHaveLength(0);
    expect(state.inserts).toHaveLength(0);

    state = fakeCtx({ deliverables: generation({ maturity: "manufacturing_released" }), reviews: acceptedReviews(deliverables) });
    await expect(releaseCadGenerationForManufacturingHandler(state.ctx, { deliverableId: "cad-1" as any })).rejects.toThrow(/missing exact manufacturing-release audit evidence/i);
    expect(state.patches).toHaveLength(0);
  });

  it("fails closed on a partially released generation rather than silently completing it", async () => {
    const deliverables = generation();
    deliverables[0].artifactMaturity = "manufacturing_released";
    const { ctx, patches, inserts } = fakeCtx({ deliverables, reviews: acceptedReviews(deliverables) });

    await expect(releaseCadGenerationForManufacturingHandler(ctx, { deliverableId: "cad-1" as any })).rejects.toThrow(/inconsistent manufacturing-release state/i);
    expect(patches).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });
});
