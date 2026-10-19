import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireManage: vi.fn(async () => ({ userId: "actor-user", access: "manage" })),
  resolveUsageScope: vi.fn(async () => null as any),
  ensureOrgUsage: vi.fn(),
}));

vi.mock("../../convex/organizations", () => ({
  requireInventionEditAccess: vi.fn(),
  requireInventionManageAccess: mocks.requireManage,
  resolveInventionAccess: vi.fn(),
}));
vi.mock("../../convex/organizationUsageScope", () => ({
  resolveInventionUsageScope: mocks.resolveUsageScope,
}));
vi.mock("../../convex/organizationDailyUsage", () => ({
  ensureOrganizationDailyUsage: mocks.ensureOrgUsage,
}));

import { deleteInventionHandler } from "../../convex/journeyEngine";

type Row = Record<string, any> & { _id: string };

type BuildInput = {
  invention?: Row;
  tables?: Record<string, Row[]>;
  storageFailures?: string[];
};

function buildCtx(input: BuildInput = {}) {
  const invention = input.invention;
  const tables = input.tables ?? {};
  const deleted: string[] = [];
  const patches: Array<{ id: string; value: Record<string, unknown> }> = [];
  const storageDeletes: string[] = [];
  const storageFailures = new Set(input.storageFailures ?? []);

  const ctx = {
    db: {
      get: vi.fn(async (id: string) => invention && String(id) === String(invention._id) ? invention : null),
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
          const rows = (tables[table] ?? []).filter((row) =>
            Object.entries(filters).every(([field, value]) => row[field] === value)
          );
          return {
            collect: vi.fn(async () => rows),
            unique: vi.fn(async () => rows.length === 1 ? rows[0] : null),
            first: vi.fn(async () => rows[0] ?? null),
          };
        },
      })),
      delete: vi.fn(async (id: string) => {
        deleted.push(String(id));
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        patches.push({ id: String(id), value });
      }),
    },
    storage: {
      delete: vi.fn(async (id: string) => {
        storageDeletes.push(String(id));
        if (storageFailures.has(String(id))) throw new Error("already absent");
      }),
    },
  } as any;

  return { ctx, deleted, patches, storageDeletes };
}

function baseInvention(overrides: Record<string, unknown> = {}): Row {
  return {
    _id: "inv-1",
    userId: "owner-user",
    organizationId: "org-1",
    ...overrides,
  };
}

describe("invention deletion behavior", () => {
  beforeEach(() => {
    mocks.requireManage.mockReset();
    mocks.requireManage.mockResolvedValue({ userId: "actor-user", access: "manage" });
    mocks.resolveUsageScope.mockReset();
    mocks.resolveUsageScope.mockResolvedValue(null);
    mocks.ensureOrgUsage.mockReset();
  });

  it("rejects before any database or storage access when manage authorization fails", async () => {
    mocks.requireManage.mockRejectedValue(new Error("Invention management access required"));
    const state = buildCtx({ invention: baseInvention() });

    await expect(deleteInventionHandler(state.ctx, { inventionId: "inv-1" as any }))
      .rejects.toThrow(/management access required/i);

    expect(state.ctx.db.get).not.toHaveBeenCalled();
    expect(state.ctx.db.query).not.toHaveBeenCalled();
    expect(state.ctx.db.delete).not.toHaveBeenCalled();
    expect(state.ctx.db.patch).not.toHaveBeenCalled();
    expect(state.ctx.storage.delete).not.toHaveBeenCalled();
    expect(mocks.resolveUsageScope).not.toHaveBeenCalled();
  });

  it("fails closed on a missing invention before cleanup or usage accounting", async () => {
    const state = buildCtx();

    await expect(deleteInventionHandler(state.ctx, { inventionId: "inv-missing" as any }))
      .rejects.toThrow(/Invention not found/i);

    expect(mocks.resolveUsageScope).not.toHaveBeenCalled();
    expect(state.ctx.db.query).not.toHaveBeenCalled();
    expect(state.deleted).toEqual([]);
    expect(state.patches).toEqual([]);
    expect(state.storageDeletes).toEqual([]);
  });

  it("cleans related rows and storage, releases organization reservations, and deletes the invention last", async () => {
    mocks.resolveUsageScope.mockResolvedValue({ scope: "organization", organizationId: "org-1" });
    mocks.ensureOrgUsage.mockResolvedValue({
      _id: "org-usage-2026-10-16",
      reservedAutonomousCostUnits: 10,
    });

    const state = buildCtx({
      invention: baseInvention(),
      storageFailures: ["storage-evidence"],
      tables: {
        stageProgress: [{ _id: "stage-1", inventionId: "inv-1" }],
        conversationMessages: [{ _id: "message-1", inventionId: "inv-1" }],
        conversations: [{ _id: "conversation-1", inventionId: "inv-1" }],
        documents: [{ _id: "document-1", inventionId: "inv-1" }],
        validationResearch: [{ _id: "validation-1", inventionId: "inv-1" }],
        organizationMemberships: [
          { _id: "membership-owner", organizationId: "org-1", userId: "owner-user", status: "active" },
          { _id: "membership-member", organizationId: "org-1", userId: "member-user", status: "active" },
        ],
        notifications: [
          { _id: "notice-owner", userId: "owner-user", inventionId: "inv-1" },
          { _id: "notice-actor", userId: "actor-user", inventionId: "inv-1" },
          { _id: "notice-member", userId: "member-user", inventionId: "inv-1" },
          { _id: "notice-other-invention", userId: "member-user", inventionId: "inv-other" },
        ],
        atlasDeliverables: [{ _id: "deliverable-1", inventionId: "inv-1", storageId: "storage-generated" }],
        evidenceSources: [{ _id: "evidence-source-1", inventionId: "inv-1", metadata: { storageId: "storage-evidence" } }],
        deliverableDependencies: [{ _id: "dependency-1", inventionId: "inv-1" }],
        atlasExecutionEvents: [{ _id: "event-1", inventionId: "inv-1" }],
        professionalReviews: [{ _id: "review-1", inventionId: "inv-1" }],
        atlasWorkItems: [
          { _id: "work-1", inventionId: "inv-1", reservedCostUnits: 5, reservationDateKey: "2026-10-16" },
          { _id: "work-2", inventionId: "inv-1", reservedCostUnits: 7, reservationDateKey: "2026-10-16" },
          { _id: "work-3", inventionId: "inv-1" },
        ],
        approvalRequests: [{ _id: "approval-1", inventionId: "inv-1" }],
        inventionDecisions: [{ _id: "decision-1", inventionId: "inv-1" }],
        inventionAssumptions: [{ _id: "assumption-1", inventionId: "inv-1" }],
        evidenceFindings: [{ _id: "finding-1", inventionId: "inv-1" }],
        inventionRecords: [{ _id: "record-1", inventionId: "inv-1" }],
        inventionAccessGrants: [{ _id: "grant-1", inventionId: "inv-1" }],
      },
    });

    const result = await deleteInventionHandler(state.ctx, { inventionId: "inv-1" as any });

    expect(result).toEqual({ success: true });
    expect(state.storageDeletes).toEqual(["storage-generated", "storage-evidence"]);
    expect(mocks.ensureOrgUsage).toHaveBeenCalledTimes(1);
    expect(mocks.ensureOrgUsage).toHaveBeenCalledWith(state.ctx, "org-1", "2026-10-16", expect.any(Number));
    expect(state.patches).toContainEqual({
      id: "org-usage-2026-10-16",
      value: expect.objectContaining({ reservedAutonomousCostUnits: 0 }),
    });

    expect(state.deleted).toContain("stage-1");
    expect(state.deleted).toContain("message-1");
    expect(state.deleted).toContain("conversation-1");
    expect(state.deleted).toContain("document-1");
    expect(state.deleted).toContain("validation-1");
    expect(state.deleted).toContain("notice-owner");
    expect(state.deleted).toContain("notice-actor");
    expect(state.deleted).toContain("notice-member");
    expect(state.deleted).not.toContain("notice-other-invention");
    expect(state.deleted).toContain("deliverable-1");
    expect(state.deleted).toContain("evidence-source-1");
    expect(state.deleted.at(-1)).toBe("inv-1");
  });

  it("releases legacy-user reservations by date without allowing the usage counter to go below zero", async () => {
    mocks.resolveUsageScope.mockResolvedValue({ scope: "legacy_user", usageUserId: "owner-user" });
    const state = buildCtx({
      invention: baseInvention({ organizationId: undefined }),
      tables: {
        atlasWorkItems: [
          { _id: "work-1", inventionId: "inv-1", reservedCostUnits: 4, reservationDateKey: "2026-10-15" },
        ],
        atlasDailyUsage: [
          { _id: "legacy-usage", userId: "owner-user", dateKey: "2026-10-15", reservedAutonomousCostUnits: 2 },
        ],
      },
    });

    const result = await deleteInventionHandler(state.ctx, { inventionId: "inv-1" as any });

    expect(result).toEqual({ success: true });
    expect(mocks.ensureOrgUsage).not.toHaveBeenCalled();
    expect(state.patches).toContainEqual({
      id: "legacy-usage",
      value: expect.objectContaining({ reservedAutonomousCostUnits: 0 }),
    });
    expect(state.deleted.at(-1)).toBe("inv-1");
  });
});
