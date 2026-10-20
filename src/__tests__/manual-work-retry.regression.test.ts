import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireInventionEditAccess: vi.fn(),
  resolveInventionUsageScope: vi.fn(),
  getOrganizationUsageSnapshot: vi.fn(),
}));

vi.mock("../../convex/organizations", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../convex/organizations")>();
  return { ...actual, requireInventionEditAccess: mocks.requireInventionEditAccess };
});
vi.mock("../../convex/organizationUsageScope", () => ({ resolveInventionUsageScope: mocks.resolveInventionUsageScope }));
vi.mock("../../convex/organizationDailyUsage", () => ({ getOrganizationUsageSnapshot: mocks.getOrganizationUsageSnapshot }));

import { retryFailedWorkItemHandler } from "../../convex/workRetryMutation";

function makeContext(item: Record<string, unknown>, personalUsage: Record<string, unknown> | null = null) {
  const unique = vi.fn(async () => personalUsage);
  const query = vi.fn((table: string) => {
    if (table !== "atlasDailyUsage") throw new Error(`Unexpected query table ${table}`);
    return { withIndex: (_index: string, apply: (q: any) => unknown) => {
      const q: any = { eq: vi.fn(() => q) };
      apply(q);
      return { unique };
    } };
  });
  const patch = vi.fn(async () => undefined);
  const insert = vi.fn(async () => "event-1");
  const runAfter = vi.fn(async () => undefined);
  const ctx = {
    db: { get: vi.fn(async (id: string) => id === item._id ? item : null), query, patch, insert },
    scheduler: { runAfter },
  } as any;
  return { ctx, patch, insert, runAfter };
}

const failedItem = (overrides: Record<string, unknown> = {}) => ({
  _id: "work-1",
  inventionId: "inv-1",
  title: "Research competing products and alternatives",
  kind: "competitor_discovery",
  status: "failed",
  attemptCount: 3,
  maxAttempts: 3,
  inputSnapshot: { product: "RiseJars" },
  ...overrides,
});

describe("manual failed-work retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 9, 20, 16));
    mocks.requireInventionEditAccess.mockResolvedValue({ userId: "user-1", access: "edit" });
    mocks.resolveInventionUsageScope.mockResolvedValue({ scope: "personal", usageUserId: "user-1", plan: "pro" });
    mocks.getOrganizationUsageSnapshot.mockResolvedValue(null);
  });

  it("requeues a registered legacy work kind, preserves attempt history, audits, and schedules the worker", async () => {
    const state = makeContext(failedItem(), { autonomousCostUnits: 0, reservedAutonomousCostUnits: 0 });
    await expect(retryFailedWorkItemHandler(state.ctx, { inventionId: "inv-1" as any, workItemId: "work-1" as any })).resolves.toEqual({ queued: true, reason: "scheduled" });
    expect(mocks.requireInventionEditAccess).toHaveBeenCalledWith(state.ctx, "inv-1");
    expect(state.patch).toHaveBeenCalledWith("work-1", expect.objectContaining({
      status: "queued", maxAttempts: 4, lastError: undefined,
      inputSnapshot: { product: "RiseJars", department: "market_research" },
    }));
    expect(state.insert).toHaveBeenCalledWith("atlasExecutionEvents", expect.objectContaining({
      eventType: "work_queued", actorType: "inventor",
      metadata: expect.objectContaining({ changeType: "manual_work_retry", departmentAgentId: "inventsmith.department.market_research.v1", requestedByUserId: "user-1" }),
    }));
    expect(state.runAfter).toHaveBeenCalledTimes(1);
  });

  it("requires edit access before any retry side effects", async () => {
    mocks.requireInventionEditAccess.mockRejectedValue(new Error("Invention edit access required"));
    const state = makeContext(failedItem(), { autonomousCostUnits: 0 });
    await expect(retryFailedWorkItemHandler(state.ctx, { inventionId: "inv-1" as any, workItemId: "work-1" as any })).rejects.toThrow("Invention edit access required");
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.runAfter).not.toHaveBeenCalled();
  });

  it("rejects unknown assignments and exhausted manual retry limits", async () => {
    const unknown = makeContext(failedItem({ kind: "unmapped_work_kind" }), { autonomousCostUnits: 0 });
    await expect(retryFailedWorkItemHandler(unknown.ctx, { inventionId: "inv-1" as any, workItemId: "work-1" as any })).rejects.toThrow("missing a registered department agent");
    const exhausted = makeContext(failedItem({ maxAttempts: 5 }), { autonomousCostUnits: 0 });
    await expect(retryFailedWorkItemHandler(exhausted.ctx, { inventionId: "inv-1" as any, workItemId: "work-1" as any })).rejects.toThrow("reached its retry limit");
    expect(exhausted.patch).not.toHaveBeenCalled();
  });

  it("does not mutate the work item when the daily work limit is exhausted", async () => {
    const state = makeContext(failedItem(), { autonomousCostUnits: 1_000_000, reservedAutonomousCostUnits: 0 });
    await expect(retryFailedWorkItemHandler(state.ctx, { inventionId: "inv-1" as any, workItemId: "work-1" as any })).resolves.toEqual({ queued: false, reason: "daily_usage_limit" });
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.runAfter).not.toHaveBeenCalled();
  });
});
