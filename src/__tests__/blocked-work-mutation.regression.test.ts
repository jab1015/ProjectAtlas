import { beforeEach, describe, expect, it, vi } from "vitest";

const dependencyMocks = vi.hoisted(() => ({
  requireInventionEditAccess: vi.fn(),
  resolveInventionUsageScope: vi.fn(),
  getOrganizationUsageSnapshot: vi.fn(),
}));

vi.mock("../../convex/organizations", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../convex/organizations")>();
  return { ...actual, requireInventionEditAccess: dependencyMocks.requireInventionEditAccess };
});
vi.mock("../../convex/organizationUsageScope", () => ({
  resolveInventionUsageScope: dependencyMocks.resolveInventionUsageScope,
}));
vi.mock("../../convex/organizationDailyUsage", () => ({
  getOrganizationUsageSnapshot: dependencyMocks.getOrganizationUsageSnapshot,
}));

import { respondToBlockedWorkHandler } from "../../convex/blockedWorkResponseMutation";

type WorkItem = {
  _id: string;
  inventionId: string;
  status: string;
  humanGateType?: string;
  blockedReason?: string;
  inputSnapshot?: unknown;
};

function makeContext(workItem: WorkItem, personalUsage: { autonomousCostUnits: number; reservedAutonomousCostUnits?: number } | null = null) {
  const unique = vi.fn(async () => personalUsage);
  const query = vi.fn((table: string) => {
    if (table !== "atlasDailyUsage") throw new Error(`Unexpected query table ${table}`);
    return {
      withIndex: (_index: string, apply: (q: any) => unknown) => {
        const q: any = { eq: vi.fn(() => q) };
        apply(q);
        return { unique };
      },
    };
  });
  const patch = vi.fn(async (_id: string, _value: unknown) => undefined);
  const insert = vi.fn(async (_table: string, _value: unknown) => "event-1");
  const runAfter = vi.fn(async (..._args: unknown[]) => undefined);
  const ctx = {
    db: {
      get: vi.fn(async (id: string) => (id === workItem._id ? workItem : null)),
      query,
      patch,
      insert,
    },
    scheduler: { runAfter },
  } as any;
  return { ctx, query, unique, patch, insert, runAfter };
}

const privateWorkItem = (overrides: Partial<WorkItem> = {}): WorkItem => ({
  _id: "work-1",
  inventionId: "inv-1",
  status: "blocked",
  humanGateType: "private_information",
  blockedReason: "Need a private dimension",
  inputSnapshot: { source: "existing" },
  ...overrides,
});

describe("respondToBlockedWork mutation handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 8, 15, 16, 0, 0));
    dependencyMocks.requireInventionEditAccess.mockResolvedValue({ userId: "user-1", access: "edit" });
    dependencyMocks.resolveInventionUsageScope.mockResolvedValue({
      scope: "personal",
      usageUserId: "user-1",
      plan: "pro",
    });
    dependencyMocks.getOrganizationUsageSnapshot.mockResolvedValue({
      autonomousCostUnits: 0,
      reservedAutonomousCostUnits: 0,
      completedWorkItems: 0,
      chatQuestions: 0,
    });
  });

  it("requeues legitimate private information, audits it, and schedules within allowance", async () => {
    const state = makeContext(privateWorkItem(), { autonomousCostUnits: 10, reservedAutonomousCostUnits: 5 });

    await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "  12 inches  " })).resolves.toEqual({ success: true });

    expect(dependencyMocks.requireInventionEditAccess).toHaveBeenCalledWith(state.ctx, "inv-1");
    expect(state.patch).toHaveBeenCalledTimes(1);
    expect(state.patch).toHaveBeenCalledWith("work-1", expect.objectContaining({
      status: "queued",
      blockedReason: undefined,
      humanGateType: undefined,
      inputSnapshot: expect.objectContaining({ inventorResponse: "12 inches", previous: { source: "existing" } }),
    }));
    expect(state.insert).toHaveBeenCalledTimes(1);
    expect(state.insert).toHaveBeenCalledWith("atlasExecutionEvents", expect.objectContaining({
      inventionId: "inv-1",
      workItemId: "work-1",
      eventType: "inventor_input_received",
      metadata: expect.objectContaining({ gateType: "private_information", characterCount: 9, suppliedByUserId: "user-1" }),
    }));
    expect(state.runAfter).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["empty", "   "],
    ["oversized", "x".repeat(4001)],
  ])("rejects %s private information with no database or scheduler side effects", async (_name, response) => {
    const state = makeContext(privateWorkItem());
    await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response })).rejects.toThrow("Response must be between 1 and 4,000 characters");
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.runAfter).not.toHaveBeenCalled();
  });

  it.each(["decision", "authorization", "professional_review", "payment", "physical_work"])(
    "rejects the %s gate through its dedicated path with zero effects",
    async (gate) => {
      const state = makeContext(privateWorkItem({ humanGateType: gate }));
      await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "completed" })).rejects.toThrow(`Free-form text cannot satisfy the ${gate} gate`);
      expect(state.patch).not.toHaveBeenCalled();
      expect(state.insert).not.toHaveBeenCalled();
      expect(state.runAfter).not.toHaveBeenCalled();
    }
  );

  it.each([
    ["missing", undefined, "unknown"],
    ["unknown", "future_gate", "future_gate"],
  ])("fails closed for %s gate metadata with zero effects", async (_name, humanGateType, expectedGate) => {
    const state = makeContext(privateWorkItem({ humanGateType }));
    await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "some text" })).rejects.toThrow(`Free-form text cannot satisfy the ${expectedGate} gate`);
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.runAfter).not.toHaveBeenCalled();
  });

  it("checks invention edit authorization before gate validation and any write", async () => {
    dependencyMocks.requireInventionEditAccess.mockRejectedValue(new Error("Invention edit access required"));
    const state = makeContext(privateWorkItem({ inventionId: "other-org-invention", humanGateType: "payment" }));
    await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "paid" })).rejects.toThrow("Invention edit access required");
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.runAfter).not.toHaveBeenCalled();
  });

  it("rejects replay after the item is no longer blocked without duplicate event or scheduling", async () => {
    const state = makeContext(privateWorkItem({ status: "queued" }));
    await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "12 inches" })).rejects.toThrow("Work item is not waiting for input");
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.runAfter).not.toHaveBeenCalled();
  });

  it("requeues and audits valid input but does not schedule when the allowance is exhausted", async () => {
    const state = makeContext(privateWorkItem(), { autonomousCostUnits: 350, reservedAutonomousCostUnits: 0 });
    await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "12 inches" })).resolves.toEqual({ success: true });
    expect(state.patch).toHaveBeenCalledTimes(1);
    expect(state.insert).toHaveBeenCalledTimes(1);
    expect(state.runAfter).not.toHaveBeenCalled();
  });

  it("uses the organization ledger for organization work and never reads the owner personal ledger", async () => {
    dependencyMocks.resolveInventionUsageScope.mockResolvedValue({
      scope: "organization",
      organizationId: "org-1",
      usageUserId: "owner-1",
      plan: "studio_3",
    });
    dependencyMocks.getOrganizationUsageSnapshot.mockResolvedValue({
      autonomousCostUnits: 50,
      reservedAutonomousCostUnits: 20,
      completedWorkItems: 3,
      chatQuestions: 1,
    });
    const state = makeContext(privateWorkItem());

    await expect(respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "private value" })).resolves.toEqual({ success: true });

    expect(dependencyMocks.getOrganizationUsageSnapshot).toHaveBeenCalledWith(state.ctx, "org-1", "2026-09-15");
    expect(state.query).not.toHaveBeenCalled();
    expect(state.runAfter).toHaveBeenCalledTimes(1);
    expect(state.insert).toHaveBeenCalledWith("atlasExecutionEvents", expect.objectContaining({ metadata: expect.objectContaining({ usageScope: "organization" }) }));
  });

  it("touches only the target work item plus its audit event, leaving unrelated approvals and evidence untouched", async () => {
    const state = makeContext(privateWorkItem());
    await respondToBlockedWorkHandler(state.ctx, { workItemId: "work-1" as any, response: "private value" });
    expect(state.patch).toHaveBeenCalledTimes(1);
    expect(state.patch).toHaveBeenCalledWith("work-1", expect.any(Object));
    expect(state.insert).toHaveBeenCalledTimes(1);
    expect(state.insert).toHaveBeenCalledWith("atlasExecutionEvents", expect.any(Object));
  });
});
